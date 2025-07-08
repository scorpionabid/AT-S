<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\Auth\DeviceService;
use App\Services\Auth\LoginService;
use App\Services\Auth\LogoutService;
use App\Services\Auth\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected $loginService;
    protected $logoutService;
    protected $deviceService;
    protected $sessionService;

    public function __construct(
        LoginService $loginService,
        LogoutService $logoutService,
        DeviceService $deviceService,
        SessionService $sessionService
    ) {
        $this->loginService = $loginService;
        $this->logoutService = $logoutService;
        $this->deviceService = $deviceService;
        $this->sessionService = $sessionService;
    }
    /**
     * Login user
     *
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Validate request and check rate limiting
        $request->ensureIsNotRateLimited();

        try {
            // Attempt to login using the login service
            $result = $this->loginService->attemptLogin(
                $request->only(['login', 'password', 'remember']),
                $request->device_name,
                $request->device_id
            );

            // Clear rate limiting on successful login
            RateLimiter::clear('login_ip:' . $request->ip());
            RateLimiter::clear('login_user:' . $request->login);

            return response()->json([
                'message' => 'Uğurlu giriş',
                'data' => $result
            ]);

        } catch (ValidationException $e) {
            // Increment rate limiting on failed attempt
            RateLimiter::hit('login_ip:' . $request->ip());
            RateLimiter::hit('login_user:' . $request->login);
            
            throw $e;
        }
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
     * Logout user (Revoke the token)
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->logoutService->logout($user);

        return response()->json([
            'message' => 'Uğurla çıxış edildi'
        ]);
    }

    /**
     * Get the authenticated User.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'roles.permissions']);
        
        // Add permissions to user object
        $user->permissions = $user->getAllPermissions()->pluck('name');
        
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Get active sessions for the authenticated user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = $this->sessionService->getActiveSessions($request->user());
        
        return response()->json([
            'sessions' => $sessions
        ]);
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        $revoked = $this->sessionService->revokeSession($request->user(), $sessionId);
        
        if (!$revoked) {
            return response()->json([
                'message' => 'Sessiya tapılmadı'
            ], 404);
        }
        
        return response()->json([
            'message' => 'Sessiya uğurla ləğv edildi'
        ]);
    }

    /**
     * Revoke all other sessions.
     */
    public function revokeOtherSessions(Request $request): JsonResponse
    {
        $count = $request->user()->tokens()
            ->where('id', '!=', $request->user()->currentAccessToken()->id)
            ->delete();

        return response()->json([
            'message' => 'Other sessions revoked successfully',
            'revoked_count' => $count
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