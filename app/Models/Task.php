<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'priority',
        'status',
        'progress',
        'deadline',
        'started_at',
        'completed_at',
        'created_by',
        'assigned_to',
        'assigned_institution_id',
        'target_institutions',
        'target_scope',
        'notes',
        'attachments',
        'requires_approval',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'approved_at' => 'datetime',
        'target_institutions' => 'array',
        'attachments' => 'array',
        'requires_approval' => 'boolean',
        'progress' => 'integer',
    ];

    // Constants for enums
    const CATEGORIES = [
        'hesabat' => 'Hesabat hazırlama',
        'temir' => 'Təmir və təsərrüfat işləri',
        'tedbir' => 'Tədbir təşkili və koordinasiya',
        'audit' => 'Audit və nəzarət tapşırıqları',
        'telimat' => 'Təlimat və metodiki materialların paylaşılması',
    ];

    const PRIORITIES = [
        'asagi' => 'Aşağı',
        'orta' => 'Orta',
        'yuksek' => 'Yüksək',
        'tecili' => 'Təcili',
    ];

    const STATUSES = [
        'pending' => 'Gözləyir',
        'in_progress' => 'İcradadır',
        'review' => 'Yoxlanılır',
        'completed' => 'Tamamlandı',
        'cancelled' => 'Ləğv edildi',
    ];

    const TARGET_SCOPES = [
        'specific' => 'Xüsusi seçim',
        'regional' => 'Regional',
        'sectoral' => 'Sektoral',
        'all' => 'Hamısı',
    ];

    /**
     * Task creator relationship
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Task assignee relationship
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Assigned institution relationship
     */
    public function assignedInstitution(): BelongsTo
    {
        return $this->belongsTo(Institution::class, 'assigned_institution_id');
    }

    /**
     * Task approver relationship
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Task comments relationship
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    /**
     * Scope: Filter by status
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Filter by priority
     */
    public function scopeByPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope: Filter by category
     */
    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    /**
     * Scope: Filter by assigned user
     */
    public function scopeAssignedTo(Builder $query, int $userId): Builder
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope: Filter by creator
     */
    public function scopeCreatedBy(Builder $query, int $userId): Builder
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Scope: Filter by deadline approaching (within days)
     */
    public function scopeDeadlineApproaching(Builder $query, int $days = 3): Builder
    {
        return $query->where('deadline', '<=', now()->addDays($days))
                    ->where('status', '!=', 'completed')
                    ->where('status', '!=', 'cancelled');
    }

    /**
     * Scope: Filter overdue tasks
     */
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('deadline', '<', now())
                    ->where('status', '!=', 'completed')
                    ->where('status', '!=', 'cancelled');
    }

    /**
     * Scope: Filter by institution access
     */
    public function scopeForInstitution(Builder $query, int $institutionId): Builder
    {
        return $query->where(function ($q) use ($institutionId) {
            $q->where('assigned_institution_id', $institutionId)
              ->orWhereJsonContains('target_institutions', $institutionId)
              ->orWhere('target_scope', 'all');
        });
    }

    /**
     * Check if task is overdue
     */
    public function isOverdue(): bool
    {
        return $this->deadline && 
               $this->deadline < now() && 
               !in_array($this->status, ['completed', 'cancelled']);
    }

    /**
     * Check if deadline is approaching (within 3 days)
     */
    public function isDeadlineApproaching(int $days = 3): bool
    {
        return $this->deadline && 
               $this->deadline <= now()->addDays($days) && 
               !in_array($this->status, ['completed', 'cancelled']);
    }

    /**
     * Get category label
     */
    public function getCategoryLabelAttribute(): string
    {
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    /**
     * Get priority label
     */
    public function getPriorityLabelAttribute(): string
    {
        return self::PRIORITIES[$this->priority] ?? $this->priority;
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Auto-set started_at when status changes to in_progress
     */
    protected static function booted()
    {
        static::updating(function ($task) {
            if ($task->isDirty('status')) {
                if ($task->status === 'in_progress' && !$task->started_at) {
                    $task->started_at = now();
                } elseif ($task->status === 'completed' && !$task->completed_at) {
                    $task->completed_at = now();
                    $task->progress = 100;
                }
            }
        });
    }
}