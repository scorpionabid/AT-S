<?php

namespace Tests\Feature;

use App\Models\Institution;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InstitutionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_admin_can_create_institution()
    {
        $admin = User::factory()->create();
        // Assign admin role using Spatie Laravel Permission
        $admin->assignRole('regionadmin');
        Sanctum::actingAs($admin);

        $institutionData = [
            'name' => 'Test Institution',
            'institution_code' => 'TEST001',
            'type' => 'school',
            'level' => 4,
            'contact_info' => [
                'phone' => '1234567890',
                'email' => 'institution@test.com',
                'address' => 'Test Address'
            ],
            'is_active' => true
        ];

        $response = $this->postJson('/api/institutions', $institutionData);
        
        // Debug: Let's see the actual response
        if ($response->status() !== 201) {
            dump('Response status: ' . $response->status());
            dump('Response content: ' . $response->content());
        }

        $response->assertStatus(201);

        $this->assertDatabaseHas('institutions', ['name' => 'Test Institution']);
    }

    public function test_user_can_view_own_institution()
    {
        $institution = Institution::factory()->create();
        $user = User::factory()->create(['institution_id' => $institution->id]);
        // Give user permission to view institutions
        $user->assignRole('schooladmin');
        
        Sanctum::actingAs($user);
        
        $response = $this->getJson("/api/institutions/{$institution->id}");
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $institution->id,
                'name' => $institution->name
            ]);
    }

    public function test_admin_can_update_institution()
    {
        $admin = User::factory()->create();
        $admin->assignRole('regionadmin');
        $institution = Institution::factory()->create();
        
        Sanctum::actingAs($admin);
        
        $updateData = ['name' => 'Updated Institution Name'];
        $response = $this->putJson("/api/institutions/{$institution->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Updated Institution Name'
            ]);
            
        $this->assertDatabaseHas('institutions', [
            'id' => $institution->id,
            'name' => 'Updated Institution Name'
        ]);
    }

    public function test_regular_user_cannot_create_institution()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/institutions', [
            'name' => 'Unauthorized Institution'
        ]);

        $response->assertStatus(403);
    }
}
