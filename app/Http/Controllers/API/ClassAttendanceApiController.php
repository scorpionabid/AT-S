<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClassAttendanceApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        
        $attendanceData = DB::table('class_attendance')
            ->join('classes', 'class_attendance.class_id', '=', 'classes.id')
            ->where('classes.institution_id', $institutionId)
            ->whereDate('class_attendance.date', Carbon::today())
            ->select([
                'classes.name as class_name',
                'class_attendance.*'
            ])
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $attendanceData
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'morning_present' => 'required|integer|min:0',
            'morning_absent_excused' => 'required|integer|min:0',
            'morning_absent_unexcused' => 'required|integer|min:0',
            'afternoon_present' => 'nullable|integer|min:0',
            'afternoon_absent_excused' => 'nullable|integer|min:0',
            'afternoon_absent_unexcused' => 'nullable|integer|min:0'
        ]);

        $attendance = DB::table('class_attendance')->updateOrInsert(
            [
                'class_id' => $validated['class_id'],
                'date' => $validated['date']
            ],
            array_merge($validated, [
                'updated_at' => now(),
                'created_at' => now()
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully'
        ]);
    }

    public function getClassStats(Request $request): JsonResponse
    {
        $institutionId = $request->user()->institution_id;
        
        $stats = DB::table('classes')
            ->leftJoin('class_attendance', function($join) {
                $join->on('classes.id', '=', 'class_attendance.class_id')
                     ->whereDate('class_attendance.date', Carbon::today());
            })
            ->where('classes.institution_id', $institutionId)
            ->select([
                'classes.id',
                'classes.name',
                'classes.capacity',
                'classes.current_enrollment',
                DB::raw('COALESCE(class_attendance.morning_present, 0) as morning_present'),
                DB::raw('COALESCE(class_attendance.morning_absent_excused, 0) as morning_absent_excused'),
                DB::raw('COALESCE(class_attendance.morning_absent_unexcused, 0) as morning_absent_unexcused')
            ])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function show(string $classId): JsonResponse
    {
        $attendance = DB::table('class_attendance')
            ->join('classes', 'class_attendance.class_id', '=', 'classes.id')
            ->where('class_attendance.class_id', $classId)
            ->orderBy('class_attendance.date', 'desc')
            ->limit(30)
            ->select([
                'class_attendance.*',
                'classes.name as class_name'
            ])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }
}
