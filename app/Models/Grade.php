<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'class_level',
        'academic_year_id',
        'institution_id',
        'room_id',
        'homeroom_teacher_id',
        'student_count',
        'specialty',
        'metadata',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'class_level' => 'integer',
            'student_count' => 'integer',
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the academic year that this grade belongs to.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the institution that this grade belongs to.
     */
    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    /**
     * Get the room assigned to this grade.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the homeroom teacher for this grade.
     */
    public function homeroomTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id');
    }

    /**
     * Get the full grade name with level.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->class_level}-{$this->name}";
    }

    /**
     * Get the display name for the grade.
     */
    public function getDisplayNameAttribute(): string
    {
        $parts = array_filter([
            "{$this->class_level} sinif",
            $this->name,
            $this->specialty
        ]);
        return implode(' - ', $parts);
    }

    /**
     * Check if grade is elementary (1-4).
     */
    public function isElementary(): bool
    {
        return $this->class_level >= 1 && $this->class_level <= 4;
    }

    /**
     * Check if grade is middle school (5-9).
     */
    public function isMiddleSchool(): bool
    {
        return $this->class_level >= 5 && $this->class_level <= 9;
    }

    /**
     * Check if grade is high school (10-12).
     */
    public function isHighSchool(): bool
    {
        return $this->class_level >= 10 && $this->class_level <= 12;
    }

    /**
     * Get available subjects for this grade level.
     */
    public function getAvailableSubjects()
    {
        return Subject::active()->forClassLevel($this->class_level)->get();
    }

    /**
     * Scope to get active grades.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get grades by institution.
     */
    public function scopeByInstitution($query, int $institutionId)
    {
        return $query->where('institution_id', $institutionId);
    }

    /**
     * Scope to get grades by academic year.
     */
    public function scopeByAcademicYear($query, int $academicYearId)
    {
        return $query->where('academic_year_id', $academicYearId);
    }

    /**
     * Scope to get grades by class level.
     */
    public function scopeByClassLevel($query, int $classLevel)
    {
        return $query->where('class_level', $classLevel);
    }

    /**
     * Scope to get grades by specialty.
     */
    public function scopeBySpecialty($query, string $specialty)
    {
        return $query->where('specialty', $specialty);
    }

    /**
     * Scope to get elementary grades.
     */
    public function scopeElementary($query)
    {
        return $query->whereBetween('class_level', [1, 4]);
    }

    /**
     * Scope to get middle school grades.
     */
    public function scopeMiddleSchool($query)
    {
        return $query->whereBetween('class_level', [5, 9]);
    }

    /**
     * Scope to get high school grades.
     */
    public function scopeHighSchool($query)
    {
        return $query->whereBetween('class_level', [10, 12]);
    }

    /**
     * Scope to search by name.
     */
    public function scopeSearchByName($query, string $search)
    {
        return $query->where('name', 'ILIKE', "%{$search}%");
    }
}