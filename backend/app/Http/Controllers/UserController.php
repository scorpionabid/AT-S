<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserCrudService;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Traits\ValidationRules;
use App\Http\Traits\ResponseHelpers;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends BaseController
{
    use ValidationRules, ResponseHelpers;

    public function __construct(
        protected UserCrudService $userService
    ) {}

    /**
     * Get users list with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        return $this->executeWithErrorHandling(function () use ($request) {
            $validated = $request->validate($this->getUserValidationRules());
            
            $users = $this->userService->getPaginatedList($validated);
            
            // Transform for API response
            $users->getCollection()->transform(function ($user) {
                return $this->userService->formatForResponse($user);
            });
            
            return $this->paginated($users, 'Users retrieved successfully');
        }, 'user.index');
    }

    /**
     * Get specific user
     */
    public function show(Request $request, User $user): JsonResponse
    {
        return $this->executeWithErrorHandling(function () use ($request, $user) {
            $user = $this->userService->getWithRelations($user);
            $formattedUser = $this->userService->formatDetailedForResponse($user);
            
            return $this->success($formattedUser, 'User retrieved successfully');
        }, 'user.show');
    }

    /**
     * Create new user
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        return $this->executeWithErrorHandling(function () use ($request) {
            $user = $this->userService->create($request->validated());
            $formattedUser = $this->userService->formatForResponse($user);
            
            return $this->created($formattedUser, 'User created successfully');
        }, 'user.store');
    }

    /**
     * Update user
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        return $this->executeWithErrorHandling(function () use ($request, $user) {
            $updatedUser = $this->userService->update($user, $request->validated());
            $formattedUser = $this->userService->formatForResponse($updatedUser);
            
            return $this->success($formattedUser, 'User updated successfully');
        }, 'user.update');
    }

    /**
     * Delete user (soft delete by default)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        return $this->executeWithErrorHandling(function () use ($request, $user) {
            $deleteType = $request->query('type', 'soft');
            $this->userService->delete($user, $deleteType);
            
            $message = $deleteType === 'hard' 
                ? 'User permanently deleted successfully'
                : 'User deactivated successfully';
            
            return $this->success(null, $message);
        }, 'user.destroy');
    }
}