<?php
/**
 * Direct Single Post API
 * A simple endpoint to get a single post by ID
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

// Clean post ID (security)
$postId = preg_replace('/[^a-zA-Z0-9_-]/', '', $postId);

// Check if admin parameter is set
$useAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';

// Function to get post by ID
function getPostById($id, $useAdmin) {
    global $postsDir, $blogDataDir;
    
    // Determine which directory to use
    $directory = $useAdmin && file_exists($postsDir) ? $postsDir : $blogDataDir;
    
    // Sanitize ID
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
    
    // Full path to file
    $filePath = $directory . $id . '.json';
    
    if (file_exists($filePath) && is_readable($filePath)) {
        $content = file_get_contents($filePath);
        if ($content) {
            $post = json_decode($content, true);
            if ($post) {
                return $post;
            }
        }
    }
    
    return null;
}

// Get the post
$post = getPostById($postId, $useAdmin);

if ($post) {
    // Success
    echo json_encode($post);
} else {
    // Not found
    http_response_code(404);
    echo json_encode(['error' => 'Post not found']);
}
