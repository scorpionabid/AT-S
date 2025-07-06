<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()['cache']->forget('spatie.permission.cache');

        // Create permissions for both web and api guards
        $permissions = [
            // User Management
            'users.create',
            'users.read',
            'users.update',
            'users.delete',

            // Institution Management  
            'institutions.create',
            'institutions.read',
            'institutions.update',

            // Survey Management
            'surveys.create',
            'surveys.read',
            'surveys.update',
            'surveys.delete',
            'surveys.publish',
            'surveys.manage',
            'surveys.respond',
            'surveys.approve',

            // Role Management
            'roles.read',
            'roles.create',
            'roles.update',
            'roles.delete',

            // Academic Management
            'schedules.create',
            'schedules.read',
            'grades.create',
            'grades.read',
            'attendance.manage',

            // Document Management
            'documents.create',
            'documents.read',
            'documents.update',
            'documents.delete',
            'documents.share',

            // Task Management
            'tasks.create',
            'tasks.read',
            'tasks.update',
            'tasks.delete',
        ];

        foreach ($permissions as $permissionName) {
            // Create for web guard
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web'
            ]);
            
            // Create for api guard
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'api'
            ]);
        }

        // Assign permissions to roles for both guards
        $rolePermissions = [
            'superadmin' => [
                'users.create', 'users.read', 'users.update', 'users.delete',
                'institutions.create', 'institutions.read', 'institutions.update',
                'surveys.create', 'surveys.read', 'surveys.update', 'surveys.delete', 'surveys.publish', 'surveys.manage',
                'roles.read', 'roles.create', 'roles.update', 'roles.delete',
                'schedules.create', 'schedules.read',
                'grades.create', 'grades.read',
                'attendance.manage',
                'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete'
            ],
            'regionadmin' => [
                'users.read', 'users.create', 'users.update', 'users.delete',
                'institutions.create', 'institutions.read', 'institutions.update',
                'surveys.create', 'surveys.read', 'surveys.update', 'surveys.publish', 'surveys.approve',
                'schedules.read', 'grades.read', 'attendance.manage',
                'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete'
            ],
            'schooladmin' => [
                'users.read', 'users.create', 'users.update',
                'institutions.read',
                'surveys.create', 'surveys.read', 'surveys.update',
                'schedules.create', 'schedules.read',
                'grades.create', 'grades.read', 'attendance.manage',
                'documents.create', 'documents.read', 'documents.update', 'documents.share',
                'tasks.read', 'tasks.update'
            ],
            'sektoradmin' => [
                'users.read', 'users.create', 'users.update',
                'institutions.read',
                'surveys.create', 'surveys.read', 'surveys.update',
                'schedules.read', 'grades.read',
                'documents.create', 'documents.read', 'documents.update', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete'
            ],
            'müəllim' => [
                'surveys.read', 'surveys.respond',
                'schedules.read', 'grades.create', 'grades.read', 'attendance.manage',
                'documents.read', 'documents.create', 'documents.share',
                'tasks.read', 'tasks.update'
            ],
        ];

        foreach (['web', 'api'] as $guard) {
            foreach ($rolePermissions as $roleName => $permissions) {
                $role = Role::where('name', $roleName)->where('guard_name', $guard)->first();
                if ($role) {
                    $permissionObjects = Permission::whereIn('name', $permissions)
                        ->where('guard_name', $guard)
                        ->get();
                    $role->syncPermissions($permissionObjects);
                }
            }
        }
    }
}