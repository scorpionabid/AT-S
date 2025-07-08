<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication, RefreshDatabase;
    
    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Configure SQLite for testing if it's the default connection
        if (config('database.default') === 'sqlite') {
            config(['database.connections.sqlite.database' => ':memory:']);
            \DB::statement('PRAGMA foreign_keys = ON');
        }
    }
}
