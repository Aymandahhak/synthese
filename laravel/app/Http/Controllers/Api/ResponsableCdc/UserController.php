<?php 
namespace App\Http\Controllers\Api\ResponsableCdc;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('role')->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}
