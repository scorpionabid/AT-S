<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'short_name',
        'code',
        'category',
        'class_level_start',
        'class_level_end',
        'description',
        'is_active',
        'grade_levels',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'class_level_start' => 'integer',
            'class_level_end' => 'integer',
            'is_active' => 'boolean',
            'grade_levels' => 'array',
        ];
    }

    /**
     * Check if subject is available for a specific class level.
     */
    public function isAvailableForLevel(int $classLevel): bool
    {
        if ($this->class_level_start && $classLevel < $this->class_level_start) {
            return false;
        }

        if ($this->class_level_end && $classLevel > $this->class_level_end) {
            return false;
        }

        return true;
    }

    /**
     * Get the range of class levels as string.
     */
    public function getClassLevelRangeAttribute(): string
    {
        if ($this->class_level_start && $this->class_level_end) {
            if ($this->class_level_start === $this->class_level_end) {
                return "Sinif {$this->class_level_start}";
            }
            return "Sinif {$this->class_level_start}-{$this->class_level_end}";
        }

        if ($this->class_level_start) {
            return "Sinif {$this->class_level_start}+";
        }

        if ($this->class_level_end) {
            return "Sinif 1-{$this->class_level_end}";
        }

        return "Bütün siniflər";
    }

    /**
     * Scope to get active subjects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get subjects by category.
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to get subjects for a specific class level.
     */
    public function scopeForClassLevel($query, int $classLevel)
    {
        return $query->where(function ($q) use ($classLevel) {
            $q->where(function ($qq) use ($classLevel) {
                $qq->whereNull('class_level_start')
                   ->orWhere('class_level_start', '<=', $classLevel);
            })
            ->where(function ($qq) use ($classLevel) {
                $qq->whereNull('class_level_end')
                   ->orWhere('class_level_end', '>=', $classLevel);
            });
        });
    }

    /**
     * Scope to search by name or code.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'ILIKE', "%{$search}%")
              ->orWhere('short_name', 'ILIKE', "%{$search}%")
              ->orWhere('code', 'ILIKE', "%{$search}%");
        });
    }
}