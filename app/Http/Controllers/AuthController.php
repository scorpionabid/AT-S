<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\SecurityEvent;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login' => 'required|string', // Can be username or email
            'password' => 'required|string|min:8',
        ]);

        $login = $request->login;
        $password = $request->password;
        
        // Rate limiting by IP and login identifier
        $ipRateLimitKey = 'login_ip:' . $request->ip();
        $userRateLimitKey = 'login_user:' . $login;
        
        // Check IP-based rate limiting (10 attempts per 15 minutes)
        if (RateLimiter::tooManyAttempts($ipRateLimitKey, 10)) {
            $seconds = RateLimiter::availableIn($ipRateLimitKey);
            return response()->json([
                'message' => "Bu IP ünvanından çox sayda cəhd edilib. {$seconds} saniyə sonra yenidən cəhd edin.",
                'type' => 'ip_blocked'
            ], 429);
        }
        
        // Check user-based rate limiting (5 attempts per 15 minutes)
        if (RateLimiter::tooManyAttempts($userRateLimitKey, 5)) {
            $seconds = RateLimiter::availableIn($userRateLimitKey);
            return response()->json([
                'message' => "Bu hesab üçün çox sayda cəhd edilib. {$seconds} saniyə sonra yenidən cəhd edin.",
                'type' => 'user_blocked'
            ], 429);
        }

        // Find user by username OR email
        $user = User::where(function($query) use ($login) {
                    $query->where('username', $login)
                          ->orWhere('email', $login);
                })
                ->with(['roles', 'institution', 'profile'])
                ->first();

        if (!$user) {
            RateLimiter::hit($ipRateLimitKey, 900); // 15 minutes
            RateLimiter::hit($userRateLimitKey, 900);
            
            throw ValidationException::withMessages([
                'login' => ['İstifadəçi adı və ya şifrə səhvdir.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'login' => ['Hesab deaktivdir. İdarə ilə əlaqə saxlayın.'],
            ]);
        }

        if ($user->isLocked()) {
            $lockTime = $user->locked_until->format('d.m.Y H:i');
            throw ValidationException::withMessages([
                'login' => ["Hesab {$lockTime} tarixədək bloklanmışdır."],
            ]);
        }

        if (!Hash::check($password, $user->password)) {
            RateLimiter::hit($ipRateLimitKey, 900);
            RateLimiter::hit($userRateLimitKey, 900);
            
            $user->increment('failed_login_attempts');
            
            // Progressive account blocking
            $lockMinutes = $this->calculateLockDuration($user->failed_login_attempts);
            if ($lockMinutes > 0) {
                $user->update([
                    'locked_until' => now()->addMinutes($lockMinutes)
                ]);
                
                $lockTime = $user->locked_until->format('d.m.Y H:i');
                throw ValidationException::withMessages([
                    'login' => ["Çox sayda səhv cəhd. Hesab {$lockTime} tarixədək bloklandı."],
                ]);
            }
            
            $remaining = 5 - $user->failed_login_attempts;
            $message = $remaining > 0 
                ? "İstifadəçi adı və ya şifrə səhvdir. {$remaining} cəhd hüququnuz qaldı."
                : "İstifadəçi adı və ya şifrə səhvdir.";
                
            throw ValidationException::withMessages([
                'login' => [$message],
            ]);
        }

        // Reset failed attempts on successful login
        $user->update([
            'failed_login_attempts' => 0,
            'locked_until' => null,
            'last_login_at' => now()
        ]);

        RateLimiter::clear($ipRateLimitKey);
        RateLimiter::clear($userRateLimitKey);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful login - temporarily disabled for testing
        // ActivityLog::logActivity([
        //     'user_id' => $user->id,
        //     'activity_type' => 'login',
        //     'description' => 'User logged in successfully',
        //     'institution_id' => $user->institution_id
        // ]);

        // SecurityEvent::logEvent([
        //     'event_type' => 'successful_login',
        //     'severity' => 'info',
        //     'user_id' => $user->id,
        //     'description' => 'User logged in successfully',
        //     'event_data' => [
        //         'username' => $user->username
        //     ]
        // ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->getRoleNames('api')->first() ?? $user->getRoleNames()->first(),
                'role_display_name' => $user->getRoleNames('api')->first() ?? $user->getRoleNames()->first(),
                'institution' => [
                    'id' => $user->institution?->id,
                    'name' => $user->institution?->name,
                    'type' => $user->institution?->type
                ],
                'departments' => $user->departments,
                'profile' => $user->profile ? [
                    'first_name' => $user->profile->first_name,
                    'last_name' => $user->profile->last_name,
                    'full_name' => $user->profile->full_name
                ] : null
            ],
            'token' => $token,
            'permissions' => $user->getPermissionsViaRoles()->pluck('name')
        ]);
    }

    /**
     * Register new user
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|min:3|max:50|unique:users',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/|confirmed',
            'role_id' => 'required|exists:roles,id',
            'institution_id' => 'nullable|exists:institutions,id',
            'departments' => 'nullable|array',
            'departments.*' => 'string',
            
            // Profile data
            'first_name' => 'nullable|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'patronymic' => 'nullable|string|max:100',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'national_id' => 'nullable|string|max:20',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
                'institution_id' => $request->institution_id,
                'departments' => $request->departments ?? [],
                'is_active' => true,
                'password_changed_at' => now(),
            ]);

            // Create profile if profile data provided
            if ($request->hasAny(['first_name', 'last_name', 'patronymic', 'birth_date', 'gender', 'national_id', 'contact_phone'])) {
                UserProfile::create([
                    'user_id' => $user->id,
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'patronymic' => $request->patronymic,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'national_id' => $request->national_id,
                    'contact_phone' => $request->contact_phone,
                ]);
            }

            $user->load(['role', 'institution', 'profile']);

            DB::commit();

            // Log user registration
            ActivityLog::logActivity([
                'user_id' => $user->id,
                'activity_type' => 'register',
                'description' => 'New user registered',
                'institution_id' => $user->institution_id
            ]);

            // SecurityEvent logging disabled temporarily
            // SecurityEvent::logEvent([
            //     'event_type' => 'user_registration',
            //     'severity' => 'info',
            //     'user_id' => $user->id,
            //     'description' => 'New user registered',
            //     'event_data' => [
            //         'username' => $user->username,
            //         'role' => $user->role?->name,
            //         'institution_id' => $user->institution_id
            //     ]
            // ]);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $user->role?->name,
                    'role_display_name' => $user->role?->display_name,
                    'institution' => [
                        'id' => $user->institution?->id,
                        'name' => $user->institution?->name,
                        'type' => $user->institution?->type
                    ],
                    'profile' => $user->profile ? [
                        'first_name' => $user->profile->first_name,
                        'last_name' => $user->profile->last_name,
                        'full_name' => $user->profile->full_name
                    ] : null
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Log logout - temporarily disabled for testing
        // ActivityLog::logActivity([
        //     'user_id' => $user->id,
        //     'activity_type' => 'logout',
        //     'description' => 'User logged out',
        //     'institution_id' => $user->institution_id
        // ]);

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role.permissions', 'institution', 'profile']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->getRoleNames('api')->first() ?? $user->getRoleNames()->first(),
                'role_display_name' => $user->getRoleNames('api')->first() ?? $user->getRoleNames()->first(),
                'role_level' => $user->role?->level,
                'institution' => [
                    'id' => $user->institution?->id,
                    'name' => $user->institution?->name,
                    'type' => $user->institution?->type,
                    'level' => $user->institution?->level
                ],
                'departments' => $user->departments,
                'last_login_at' => $user->last_login_at,
                'profile' => $user->profile ? [
                    'first_name' => $user->profile->first_name,
                    'last_name' => $user->profile->last_name,
                    'patronymic' => $user->profile->patronymic,
                    'full_name' => $user->profile->full_name,
                    'birth_date' => $user->profile->birth_date,
                    'gender' => $user->profile->gender,
                    'contact_phone' => $user->profile->contact_phone
                ] : null
            ],
            'permissions' => $user->getPermissionsViaRoles()->pluck('name')
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();

        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log token refresh
        ActivityLog::logActivity([
            'user_id' => $user->id,
            'activity_type' => 'token_refresh',
            'description' => 'Auth token refreshed',
            'institution_id' => $user->institution_id
        ]);

        return response()->json([
            'message' => 'Token refreshed successfully',
            'token' => $token
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            // SecurityEvent logging disabled temporarily
            // SecurityEvent::logEvent([
            //     'event_type' => 'failed_password_change',
            //     'severity' => 'warning',
            //     'user_id' => $user->id,
            //     'description' => 'Failed password change attempt - incorrect current password'
            // ]);

            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
            'password_changed_at' => now()
        ]);

        // Revoke all tokens to force re-login
        $user->tokens()->delete();

        // Log password change
        ActivityLog::logActivity([
            'user_id' => $user->id,
            'activity_type' => 'password_change',
            'description' => 'Password changed successfully',
            'institution_id' => $user->institution_id
        ]);

        // SecurityEvent logging disabled temporarily
        // SecurityEvent::logEvent([
        //     'event_type' => 'password_change',
        //     'severity' => 'info',
        //     'user_id' => $user->id,
        //     'description' => 'User changed password',
        //     'event_data' => [
        //         'username' => $user->username
        //     ]
        // ]);

        return response()->json([
            'message' => 'Password changed successfully. Please login again.'
        ]);
    }

    /**
     * Calculate progressive lock duration based on failed attempts
     */
    private function calculateLockDuration(int $failedAttempts): int
    {
        switch ($failedAttempts) {
            case 5:
                return 15; // 15 minutes
            case 6:
                return 30; // 30 minutes  
            case 7:
                return 60; // 1 hour
            case 8:
                return 180; // 3 hours
            case 9:
                return 360; // 6 hours
            default:
                return $failedAttempts >= 10 ? 1440 : 0; // 24 hours for 10+
        }
    }
}