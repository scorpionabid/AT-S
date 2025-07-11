<?php

namespace App\Services;

use App\Models\KSQResult;
use App\Models\BSQResult;
use App\Models\Institution;
use App\Models\AcademicYear;
use App\Models\Survey;
use App\Models\SurveyResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PerformanceAnalyticsService
{
    /**
     * Get comprehensive performance analytics for institutions
     */
    public function getInstitutionPerformanceAnalytics($institutionId, $academicYearId = null, $options = [])
    {
        $cacheKey = "institution_performance_{$institutionId}_{$academicYearId}";
        
        return Cache::remember($cacheKey, 3600, function () use ($institutionId, $academicYearId, $options) {
            $institution = Institution::findOrFail($institutionId);
            $academicYear = $academicYearId ? AcademicYear::find($academicYearId) : AcademicYear::where('is_active', true)->first();

            return [
                'institution' => $institution,
                'academic_year' => $academicYear,
                'ksq_analytics' => $this->getKSQAnalytics($institutionId, $academicYear?->id),
                'bsq_analytics' => $this->getBSQAnalytics($institutionId, $academicYear?->id),
                'overall_performance' => $this->calculateOverallPerformance($institutionId, $academicYear?->id),
                'trends' => $this->getPerformanceTrends($institutionId),
                'rankings' => $this->getInstitutionRankings($institutionId, $academicYear?->id),
                'comparison' => $this->getRegionalComparison($institutionId, $academicYear?->id),
                'improvement_areas' => $this->identifyImprovementAreas($institutionId, $academicYear?->id),
                'recommendations' => $this->generateRecommendations($institutionId, $academicYear?->id)
            ];
        });
    }

    /**
     * KSQ Analytics
     */
    public function getKSQAnalytics($institutionId, $academicYearId = null)
    {
        $query = KSQResult::where('institution_id', $institutionId);
        
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $results = $query->approved()->get();

        if ($results->isEmpty()) {
            return ['status' => 'no_data', 'message' => 'KSQ qiymətləndirmə nəticəsi mövcud deyil'];
        }

        $totalAssessments = $results->count();
        $averageScore = $results->avg('percentage_score');
        $latestResult = $results->sortByDesc('assessment_date')->first();

        // Criteria analysis
        $criteriaAnalysis = $this->analyzeCriteriaPerformance($results, 'criteria_scores');

        // Performance distribution
        $performanceDistribution = [
            'excellent' => $results->where('percentage_score', '>=', 90)->count(),
            'good' => $results->whereBetween('percentage_score', [80, 89.99])->count(),
            'satisfactory' => $results->whereBetween('percentage_score', [70, 79.99])->count(),
            'needs_improvement' => $results->whereBetween('percentage_score', [60, 69.99])->count(),
            'unsatisfactory' => $results->where('percentage_score', '<', 60)->count()
        ];

        // Monthly trends (last 12 months)
        $monthlyTrends = $this->getMonthlyTrends($results, 'assessment_date', 'percentage_score');

        return [
            'total_assessments' => $totalAssessments,
            'average_score' => round($averageScore, 2),
            'latest_score' => $latestResult->percentage_score,
            'latest_date' => $latestResult->assessment_date,
            'performance_level' => $latestResult->performance_level,
            'improvement_status' => $latestResult->improvement_status,
            'criteria_analysis' => $criteriaAnalysis,
            'performance_distribution' => $performanceDistribution,
            'monthly_trends' => $monthlyTrends,
            'follow_up_required' => $results->where('follow_up_required', true)->count(),
            'overdue_follow_ups' => $results->filter(fn($r) => $r->isOverdue())->count()
        ];
    }

    /**
     * BSQ Analytics
     */
    public function getBSQAnalytics($institutionId, $academicYearId = null)
    {
        $query = BSQResult::where('institution_id', $institutionId);
        
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $results = $query->approved()->get();

        if ($results->isEmpty()) {
            return ['status' => 'no_data', 'message' => 'BSQ qiymətləndirmə nəticəsi mövcud deyil'];
        }

        $latestResult = $results->sortByDesc('assessment_date')->first();

        // International standards analysis
        $standardsAnalysis = $this->analyzeInternationalStandards($results);

        // Certification status
        $certificationAnalysis = [
            'current_status' => $latestResult->certification_status,
            'accreditation_level' => $latestResult->accreditation_level,
            'valid_until' => $latestResult->certification_valid_until,
            'near_expiration' => $latestResult->isNearExpiration(),
            'requires_reassessment' => $latestResult->requiresReassessment()
        ];

        // Benchmark position
        $benchmarkPosition = $latestResult->getBenchmarkPosition();

        return [
            'total_assessments' => $results->count(),
            'latest_score' => $latestResult->percentage_score,
            'latest_date' => $latestResult->assessment_date,
            'performance_level' => $latestResult->performance_level,
            'international_ranking' => $latestResult->international_ranking,
            'national_ranking' => $latestResult->national_ranking,
            'regional_ranking' => $latestResult->regional_ranking,
            'standards_analysis' => $standardsAnalysis,
            'certification_analysis' => $certificationAnalysis,
            'benchmark_position' => $benchmarkPosition,
            'compliance_score' => $latestResult->compliance_score,
            'published_results' => $results->where('published', true)->count()
        ];
    }

    /**
     * Calculate overall performance score
     */
    public function calculateOverallPerformance($institutionId, $academicYearId = null)
    {
        $ksqResults = KSQResult::where('institution_id', $institutionId)
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->approved()
            ->get();

        $bsqResults = BSQResult::where('institution_id', $institutionId)
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->approved()
            ->get();

        $ksqWeight = 0.6; // KSQ has 60% weight
        $bsqWeight = 0.4; // BSQ has 40% weight

        $ksqScore = $ksqResults->avg('percentage_score') ?? 0;
        $bsqScore = $bsqResults->avg('percentage_score') ?? 0;

        $overallScore = ($ksqScore * $ksqWeight) + ($bsqScore * $bsqWeight);

        // Determine performance category
        $performanceCategory = $this->determinePerformanceCategory($overallScore);

        return [
            'overall_score' => round($overallScore, 2),
            'ksq_score' => round($ksqScore, 2),
            'bsq_score' => round($bsqScore, 2),
            'performance_category' => $performanceCategory,
            'ksq_weight' => $ksqWeight * 100,
            'bsq_weight' => $bsqWeight * 100,
            'assessment_completeness' => [
                'ksq_assessments' => $ksqResults->count(),
                'bsq_assessments' => $bsqResults->count(),
                'total_expected' => 4 // Assume 4 assessments per year
            ]
        ];
    }

    /**
     * Get performance trends over time
     */
    public function getPerformanceTrends($institutionId, $months = 12)
    {
        $startDate = now()->subMonths($months);

        $ksqTrends = KSQResult::where('institution_id', $institutionId)
            ->where('assessment_date', '>=', $startDate)
            ->approved()
            ->orderBy('assessment_date')
            ->get()
            ->groupBy(fn($item) => $item->assessment_date->format('Y-m'))
            ->map(fn($group) => [
                'month' => $group->first()->assessment_date->format('Y-m'),
                'average_score' => round($group->avg('percentage_score'), 2),
                'assessment_count' => $group->count()
            ])
            ->values();

        $bsqTrends = BSQResult::where('institution_id', $institutionId)
            ->where('assessment_date', '>=', $startDate)
            ->approved()
            ->orderBy('assessment_date')
            ->get()
            ->groupBy(fn($item) => $item->assessment_date->format('Y-m'))
            ->map(fn($group) => [
                'month' => $group->first()->assessment_date->format('Y-m'),
                'average_score' => round($group->avg('percentage_score'), 2),
                'assessment_count' => $group->count()
            ])
            ->values();

        return [
            'ksq_trends' => $ksqTrends,
            'bsq_trends' => $bsqTrends,
            'trend_analysis' => $this->analyzeTrends($ksqTrends, $bsqTrends)
        ];
    }

    /**
     * Get institution rankings
     */
    public function getInstitutionRankings($institutionId, $academicYearId = null)
    {
        // Regional ranking
        $institution = Institution::findOrFail($institutionId);
        $regionInstitutions = Institution::where('parent_id', $institution->parent_id)->pluck('id');

        $regionalRanking = $this->calculateRanking($institutionId, $regionInstitutions, $academicYearId);

        // National ranking  
        $nationalInstitutions = Institution::where('type', $institution->type)->pluck('id');
        $nationalRanking = $this->calculateRanking($institutionId, $nationalInstitutions, $academicYearId);

        return [
            'regional_ranking' => $regionalRanking,
            'national_ranking' => $nationalRanking,
            'ranking_factors' => [
                'ksq_performance' => 40,
                'bsq_performance' => 35,
                'improvement_rate' => 15,
                'consistency' => 10
            ]
        ];
    }

    /**
     * Generate improvement recommendations
     */
    public function generateRecommendations($institutionId, $academicYearId = null)
    {
        $ksqAnalytics = $this->getKSQAnalytics($institutionId, $academicYearId);
        $bsqAnalytics = $this->getBSQAnalytics($institutionId, $academicYearId);
        $overallPerformance = $this->calculateOverallPerformance($institutionId, $academicYearId);

        $recommendations = [];

        // KSQ-based recommendations
        if (isset($ksqAnalytics['average_score']) && $ksqAnalytics['average_score'] < 75) {
            $recommendations[] = [
                'type' => 'ksq_improvement',
                'priority' => 'high',
                'title' => 'KSQ Performansının Artırılması',
                'description' => 'Keyfiyyət standartları qiymətləndirməsində orta bal 75%-dən aşağıdır',
                'action_items' => [
                    'Müəllim kadr hazırlığının gücləndirilməsi',
                    'Tədris materiallarının yenilənməsi',
                    'Sinif idarəetməsi sisteminin təkmilləşdirilməsi'
                ]
            ];
        }

        // BSQ-based recommendations
        if (isset($bsqAnalytics['latest_score']) && $bsqAnalytics['latest_score'] < 70) {
            $recommendations[] = [
                'type' => 'bsq_improvement',
                'priority' => 'high',
                'title' => 'Beynəlxalq Standartlara Uyğunluğun Artırılması',
                'description' => 'Beynəlxalq standartlar üzrə performans təkmilləşdirmə tələb edir',
                'action_items' => [
                    'Beynəlxalq təcrübənin öyrənilməsi',
                    'Müəllimlər üçün beynəlxalq sertifikat proqramları',
                    'Tədris metodikasının modernləşdirilməsi'
                ]
            ];
        }

        // Follow-up recommendations
        if (isset($ksqAnalytics['overdue_follow_ups']) && $ksqAnalytics['overdue_follow_ups'] > 0) {
            $recommendations[] = [
                'type' => 'follow_up',
                'priority' => 'medium',
                'title' => 'Təqib Edilməli Məsələlər',
                'description' => "Müddəti keçmiş {$ksqAnalytics['overdue_follow_ups']} təqib məsələsi var",
                'action_items' => [
                    'Gecikmiş follow-up-ların yenidən planlaşdırılması',
                    'Cavabdeh şəxslərlə görüş təşkili',
                    'Yeni müddətlərin müəyyən edilməsi'
                ]
            ];
        }

        return $recommendations;
    }

    /**
     * Private helper methods
     */
    private function analyzeCriteriaPerformance($results, $criteriaField)
    {
        $allCriteria = [];
        
        foreach ($results as $result) {
            if (is_array($result->$criteriaField)) {
                foreach ($result->$criteriaField as $criteria => $score) {
                    if (!isset($allCriteria[$criteria])) {
                        $allCriteria[$criteria] = [];
                    }
                    $allCriteria[$criteria][] = $score;
                }
            }
        }

        $analysis = [];
        foreach ($allCriteria as $criteria => $scores) {
            $analysis[$criteria] = [
                'average_score' => round(array_sum($scores) / count($scores), 2),
                'min_score' => min($scores),
                'max_score' => max($scores),
                'assessment_count' => count($scores),
                'trend' => $this->calculateSimpleTrend($scores)
            ];
        }

        return $analysis;
    }

    private function determinePerformanceCategory($score)
    {
        if ($score >= 90) return ['level' => 'excellent', 'description' => 'Əla'];
        if ($score >= 80) return ['level' => 'good', 'description' => 'Yaxşı'];
        if ($score >= 70) return ['level' => 'satisfactory', 'description' => 'Qənaətbəxş'];
        if ($score >= 60) return ['level' => 'needs_improvement', 'description' => 'Təkmilləşdirmə tələb edir'];
        return ['level' => 'unsatisfactory', 'description' => 'Qeyri-qənaətbəxş'];
    }

    private function calculateSimpleTrend($values)
    {
        if (count($values) < 2) return 'stable';
        
        $firstHalf = array_slice($values, 0, ceil(count($values) / 2));
        $secondHalf = array_slice($values, floor(count($values) / 2));
        
        $firstAvg = array_sum($firstHalf) / count($firstHalf);
        $secondAvg = array_sum($secondHalf) / count($secondHalf);
        
        $difference = $secondAvg - $firstAvg;
        
        if ($difference > 2) return 'improving';
        if ($difference < -2) return 'declining';
        return 'stable';
    }

    private function calculateRanking($institutionId, $institutionIds, $academicYearId)
    {
        $rankings = [];
        
        foreach ($institutionIds as $id) {
            $performance = $this->calculateOverallPerformance($id, $academicYearId);
            $rankings[$id] = $performance['overall_score'];
        }
        
        arsort($rankings);
        $position = array_search($institutionId, array_keys($rankings)) + 1;
        
        return [
            'position' => $position,
            'total_institutions' => count($rankings),
            'score' => $rankings[$institutionId] ?? 0,
            'percentile' => round((1 - (($position - 1) / count($rankings))) * 100, 2)
        ];
    }
}