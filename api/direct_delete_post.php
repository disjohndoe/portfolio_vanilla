<?php
/**
 * Direct Delete Post API
 * Database-based approach to delete a post
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

// Include database config and class
require_once __DIR__ . '/db/config.php';
require_once __DIR__ . '/db/Database.php';

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

// Function to delete a post from the database
function deletePost($id) {
    try {
        $db = Database::getInstance();
        
        // First, delete associations in the junction table
        $db->query("DELETE FROM blog_post_categories WHERE post_id = ?", [$id]);
        
        // Then delete the post itself
        $result = $db->query("DELETE FROM blog_posts WHERE id = ?", [$id]);
        
        // Check if any rows were affected
        return $result->rowCount() > 0;
    } catch (Exception $e) {
        error_log("Error deleting post: " . $e->getMessage());
        return false;
    }
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
    
    $success = deletePost($postId);
    
    if ($success) {
        echo json_encode(['success' => true, 'message' => "Post $postId deleted successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => "Failed to delete post $postId"]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method not allowed. Use DELETE instead of ' . $_SERVER['REQUEST_METHOD']]);
}
