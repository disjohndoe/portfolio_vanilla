<?php
/**
 * Direct Save Post API
 * A simple endpoint to save a post (create or update)
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Check if posts directory exists and create it if not
if (!file_exists($postsDir)) {
    mkdir($postsDir, 0755, true);
}

// Check if blog_data directory exists and create it if not
if (!file_exists($blogDataDir)) {
    mkdir($blogDataDir, 0755, true);
}

// Get post ID from URL
$requestUri = $_SERVER['REQUEST_URI'];
$parts = parse_url($requestUri);
$path = $parts['path'] ?? '';
$pathParts = explode('/', trim($path, '/'));

// Extract post ID - it should be the last part of the URL (for PUT requests)
$postId = end($pathParts);

// Clean post ID (security)
$postId = preg_replace('/[^a-zA-Z0-9_-]/', '', $postId);

// Get request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// Function to save a post
function savePost($data, $id = null) {
    global $postsDir, $blogDataDir;
    
    // Generate ID if not provided
    if (!$id && !isset($data['id'])) {
        $id = uniqid();
    } elseif (!$id) {
        $id = $data['id'];
    }
    
    // Set the ID in the data
    $data['id'] = $id;
    
    // Set creation date if not provided
    if (!isset($data['date'])) {
        $data['date'] = date('c'); // ISO 8601 format
    }
    
    // Clean ID
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
    
    // Path to save the file
    $filePath = $postsDir . $id . '.json';
    
    // Save to posts directory (admin version)
    $success = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if (!$success) {
        return false;
    }
    
    // If post is published, also save to blog_data
    if (isset($data['published']) && $data['published']) {
        $publicPath = $blogDataDir . $id . '.json';
        file_put_contents($publicPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    return $data;
}

// Handle request based on method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Create new post
        $savedPost = savePost($data);
        
        if ($savedPost) {
            http_response_code(201); // Created
            echo json_encode($savedPost);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save post']);
        }
        break;
        
    case 'PUT':
        // Update existing post
        $savedPost = savePost($data, $postId);
        
        if ($savedPost) {
            echo json_encode($savedPost);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update post']);
        }
        break;
        
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
