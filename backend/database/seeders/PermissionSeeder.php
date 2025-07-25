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

            // Reports Management
            'reports.read',
            'reports.create',
            'reports.export',

            // System Management
            'system.config',
            'analytics.view',

            // Institutions Extended
            'institutions.delete',

            // Assessment Management (KSQ/BSQ)
            'assessments.create',
            'assessments.read',
            'assessments.update',
            'assessments.delete',
            'assessments.approve',
            'assessments.manage',
            'assessments.export',

            // Attendance Management
            'attendance.create',
            'attendance.read',
            'attendance.update',
            'attendance.delete',
            'attendance.approve',

            // Schedule Management  
            'schedules.update',
            'schedules.delete',
            'schedules.approve',

            // Approval Management
            'approvals.create',
            'approvals.read',
            'approvals.update',
            'approvals.delete',
            'approvals.approve',
            'approvals.reject',
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
                'institutions.create', 'institutions.read', 'institutions.update', 'institutions.delete',
                'surveys.create', 'surveys.read', 'surveys.update', 'surveys.delete', 'surveys.publish', 'surveys.manage',
                'roles.read', 'roles.create', 'roles.update', 'roles.delete',
                'schedules.create', 'schedules.read', 'schedules.update', 'schedules.delete', 'schedules.approve',
                'grades.create', 'grades.read',
                'attendance.manage', 'attendance.create', 'attendance.read', 'attendance.update', 'attendance.delete', 'attendance.approve',
                'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete',
                'reports.read', 'reports.create', 'reports.export',
                'assessments.create', 'assessments.read', 'assessments.update', 'assessments.delete', 'assessments.approve', 'assessments.manage', 'assessments.export',
                'approvals.create', 'approvals.read', 'approvals.update', 'approvals.delete', 'approvals.approve', 'approvals.reject',
                'system.config', 'analytics.view'
            ],
            'regionadmin' => [
                'users.read', 'users.create', 'users.update', 'users.delete',
                'institutions.create', 'institutions.read', 'institutions.update',
                'surveys.create', 'surveys.read', 'surveys.update', 'surveys.publish', 'surveys.approve',
                'schedules.read', 'schedules.update', 'grades.read', 'attendance.manage', 'attendance.read', 'attendance.update', 'attendance.approve',
                'documents.create', 'documents.read', 'documents.update', 'documents.delete', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete',
                'reports.read', 'reports.create', 'reports.export',
                'assessments.create', 'assessments.read', 'assessments.update', 'assessments.approve', 'assessments.export',
                'analytics.view'
            ],
            'schooladmin' => [
                'users.read', 'users.create', 'users.update',
                'institutions.read',
                'surveys.create', 'surveys.read', 'surveys.update',
                'schedules.create', 'schedules.read', 'schedules.update',
                'grades.create', 'grades.read', 'attendance.manage', 'attendance.create', 'attendance.read', 'attendance.update',
                'documents.create', 'documents.read', 'documents.update', 'documents.share',
                'tasks.read', 'tasks.update',
                'assessments.create', 'assessments.read', 'assessments.update',
                'reports.read'
            ],
            'sektoradmin' => [
                'users.read', 'users.create', 'users.update',
                'institutions.read',
                'surveys.create', 'surveys.read', 'surveys.update',
                'schedules.read', 'schedules.update', 'grades.read', 'attendance.read', 'attendance.update',
                'documents.create', 'documents.read', 'documents.update', 'documents.share',
                'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete',
                'assessments.read', 'assessments.update',
                'reports.read'
            ],
            'müəllim' => [
                'surveys.read', 'surveys.respond',
                'schedules.read', 'grades.create', 'grades.read', 'attendance.manage', 'attendance.create', 'attendance.read', 'attendance.update',
                'documents.read', 'documents.create', 'documents.share',
                'tasks.read', 'tasks.update',
                'assessments.read'
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