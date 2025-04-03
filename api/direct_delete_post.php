<?php
/**
 * Direct Delete Post API
 * A simple endpoint to delete a post with comprehensive error handling
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

// Handle OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define directories
$baseDir = dirname(__DIR__);
$blogDataDir = $baseDir . '/blog_data/';
$postsDir = $baseDir . '/posts/';

// Get post ID from URL
$requestUri = $_SERVER['REQUEST_URI'];
$parts = parse_url($requestUri);
$path = $parts['path'] ?? '';
$pathParts = explode('/', trim($path, '/'));

// Extract post ID - it should be the last part of the URL
$postId = end($pathParts);

// If post ID is not in URL, try to get it from query string
if ($postId === 'direct_delete_post.php' && isset($_GET['id'])) {
    $postId = $_GET['id'];
}

// Clean post ID (security)
$postId = preg_replace('/[^a-zA-Z0-9_-]/', '', $postId);

// Function to delete a post
function deletePost($id) {
    global $postsDir, $blogDataDir;
    
    // Clean ID
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
    
    // Path to admin and public files
    $adminPath = $postsDir . $id . '.json';
    $publicPath = $blogDataDir . $id . '.json';
    
    $adminDeleted = true;
    $publicDeleted = true;
    
    // Delete from admin directory
    if (file_exists($adminPath)) {
        $adminDeleted = unlink($adminPath);
    }
    
    // Delete from public directory
    if (file_exists($publicPath)) {
        $publicDeleted = unlink($publicPath);
    }
    
    return [
        'success' => $adminDeleted && $publicDeleted,
        'details' => [
            'admin_file_existed' => file_exists($adminPath) ? 'Yes' : 'No',
            'admin_file_deleted' => $adminDeleted ? 'Yes' : 'No',
            'public_file_existed' => file_exists($publicPath) ? 'Yes' : 'No',
            'public_file_deleted' => $publicDeleted ? 'Yes' : 'No'
        ]
    ];
}

// Log the request for debugging
$logData = [
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'post_id' => $postId
];

file_put_contents(__DIR__ . '/delete_log.txt', json_encode($logData) . "\n", FILE_APPEND);

// Handle request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (empty($postId)) {
        http_response_code(400);
        echo json_encode(['error' => 'No post ID provided']);
        exit;
    }
    
    $result = deletePost($postId);
    
    if ($result['success']) {
        echo json_encode(['success' => true, 'message' => "Post $postId deleted successfully", 'details' => $result['details']]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => "Failed to delete post $postId", 'details' => $result['details']]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed. Use DELETE instead of ' . $_SERVER['REQUEST_METHOD']]);
}
