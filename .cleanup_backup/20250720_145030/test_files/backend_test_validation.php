<?php

/**
 * Test Environment Validation Script
 * Validates that all test files are properly structured and dependencies are available
 */

require_once __DIR__ . '/vendor/autoload.php';

echo "🔧 ATİS System Integration Test Validation\n";
echo "==========================================\n\n";

// Check Laravel application bootstrap
try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    echo "✅ Laravel application bootstrap successful\n";
} catch (Exception $e) {
    echo "❌ Laravel bootstrap failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Check database connection
try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    echo "✅ Database connection successful\n";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

// Validate test files exist
$testFiles = [
    'tests/Feature/EndToEndWorkflowTest.php',
    'tests/Feature/DocumentServiceTest.php',
    'tests/Feature/InstitutionServiceTest.php',
    'tests/Feature/ClassAttendanceControllerTest.php',
    'tests/Feature/ScheduleControllerTest.php'
];

echo "\n📁 Test File Validation:\n";
foreach ($testFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ {$file}\n";
    } else {
        echo "❌ {$file} - Missing\n";
    }
}

// Validate service files
$serviceFiles = [
    'app/Services/DocumentService.php',
    'app/Services/DocumentDownloadService.php',
    'app/Services/DocumentSharingService.php',
    'app/Services/InstitutionService.php',
    'app/Services/DepartmentService.php'
];

echo "\n🛠️ Service File Validation:\n";
foreach ($serviceFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ {$file}\n";
    } else {
        echo "❌ {$file} - Missing\n";
    }
}

// Validate controller files
$controllerFiles = [
    'app/Http/Controllers/ClassAttendanceController.php',
    'app/Http/Controllers/ScheduleController.php',
    'app/Http/Controllers/DocumentControllerRefactored.php',
    'app/Http/Controllers/InstitutionControllerRefactored.php'
];

echo "\n🎮 Controller File Validation:\n";
foreach ($controllerFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ {$file}\n";
    } else {
        echo "❌ {$file} - Missing\n";
    }
}

// Validate factory files
$factoryFiles = [
    'database/factories/ClassAttendanceFactory.php',
    'database/factories/ScheduleFactory.php',
    'database/factories/DocumentDownloadFactory.php',
    'database/factories/DocumentShareFactory.php'
];

echo "\n🏭 Factory File Validation:\n";
foreach ($factoryFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ {$file}\n";
    } else {
        echo "❌ {$file} - Missing\n";
    }
}

// Check permissions and roles
try {
    // Test Spatie Permission setup
    if (class_exists('Spatie\Permission\Models\Role')) {
        echo "\n🔐 Permission System Validation:\n";
        echo "✅ Spatie Permission package loaded\n";
        
        // Check if roles table exists
        $roleTableQuery = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='roles'");
        if ($roleTableQuery && $roleTableQuery->fetch()) {
            echo "✅ Roles table exists\n";
        } else {
            echo "❌ Roles table missing\n";
        }
        
        // Check if permissions table exists
        $permissionTableQuery = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='permissions'");
        if ($permissionTableQuery && $permissionTableQuery->fetch()) {
            echo "✅ Permissions table exists\n";
        } else {
            echo "❌ Permissions table missing\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Permission system validation failed: " . $e->getMessage() . "\n";
}

// Check API routes
echo "\n🌐 API Route Validation:\n";
$routeFile = __DIR__ . '/routes/api.php';
if (file_exists($routeFile)) {
    $routeContent = file_get_contents($routeFile);
    
    $expectedRoutes = [
        'attendance',
        'schedules',
        'documents-v2',
        'institutions-v2'
    ];
    
    foreach ($expectedRoutes as $route) {
        if (strpos($routeContent, $route) !== false) {
            echo "✅ Route '{$route}' found\n";
        } else {
            echo "❌ Route '{$route}' missing\n";
        }
    }
} else {
    echo "❌ API routes file missing\n";
}

echo "\n🎉 Validation Complete!\n";
echo "==========================================\n";