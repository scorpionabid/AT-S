<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ApprovalApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $status = $request->get('status', 'pending');
        $type = $request->get('type');
        
        $query = DB::table('approval_requests')
            ->join('approval_workflows', 'approval_requests.workflow_id', '=', 'approval_workflows.id')
            ->join('users as requester', 'approval_requests.requester_id', '=', 'requester.id')
            ->where('approval_requests.approver_id', $user->id)
            ->where('approval_requests.status', $status);
            
        if ($type) {
            $query->where('approval_workflows.approvable_type', $type);
        }
        
        $approvals = $query->select([
            'approval_requests.*',
            'approval_workflows.name as workflow_name',
            'approval_workflows.approvable_type',
            'requester.username as requester_name',
            'requester.full_name as requester_full_name'
        ])
        ->orderBy('approval_requests.created_at', 'desc')
        ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $approvals
        ]);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'comments' => 'nullable|string|max:1000'
        ]);

        $approval = DB::table('approval_requests')
            ->where('id', $id)
            ->where('approver_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$approval) {
            return response()->json([
                'success' => false,
                'message' => 'Approval request not found or already processed'
            ], 404);
        }

        DB::beginTransaction();
        try {
            DB::table('approval_requests')
                ->where('id', $id)
                ->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                    'comments' => $validated['comments'] ?? null,
                    'updated_at' => now()
                ]);

            DB::table('approval_actions')->insert([
                'approval_request_id' => $id,
                'user_id' => $request->user()->id,
                'action' => 'approved',
                'comments' => $validated['comments'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request approved successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve request'
            ], 500);
        }
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'comments' => 'required|string|max:1000'
        ]);

        $approval = DB::table('approval_requests')
            ->where('id', $id)
            ->where('approver_id', $request->user()->id)
            ->where('status', 'pending')
            ->first();

        if (!$approval) {
            return response()->json([
                'success' => false,
                'message' => 'Approval request not found or already processed'
            ], 404);
        }

        DB::beginTransaction();
        try {
            DB::table('approval_requests')
                ->where('id', $id)
                ->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                    'comments' => $validated['comments'],
                    'updated_at' => now()
                ]);

            DB::table('approval_actions')->insert([
                'approval_request_id' => $id,
                'user_id' => $request->user()->id,
                'action' => 'rejected',
                'comments' => $validated['comments'],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Request rejected successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject request'
            ], 500);
        }
    }

    public function getStats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $stats = [
            'pending' => DB::table('approval_requests')
                ->where('approver_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'approved_today' => DB::table('approval_requests')
                ->where('approver_id', $user->id)
                ->where('status', 'approved')
                ->whereDate('approved_at', today())
                ->count(),
            'rejected_today' => DB::table('approval_requests')
                ->where('approver_id', $user->id)
                ->where('status', 'rejected')
                ->whereDate('rejected_at', today())
                ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
