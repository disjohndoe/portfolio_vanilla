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

// Include sync_posts utility
require_once __DIR__ . '/sync_posts.php';

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

// Handle request based on method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Create new post
        $postId = savePostToDatabase($data);
        
        if ($postId) {
            // Update tags if provided
            if (isset($data['tags']) && is_array($data['tags'])) {
                updatePostTags($postId, $data['tags']);
            }
            
            // Get the saved post from database
            $db = Database::getInstance();
            $savedPost = $db->fetchOne("SELECT * FROM blog_posts WHERE id = ?", [$postId]);
            
            if ($savedPost) {
                // Format the post data for the response
                $savedPost['published'] = ($savedPost['status'] === 'published');
                $savedPost['date'] = $savedPost['published_at'];
                $savedPost['image'] = $savedPost['image_url'];
                
                http_response_code(201); // Created
                echo json_encode($savedPost);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to retrieve saved post']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save post']);
        }
        break;
        
    case 'PUT':
        // Set ID for update
        if (!empty($postId)) {
            $data['id'] = $postId;
        }
        
        // Update existing post
        $postId = savePostToDatabase($data);
        
        if ($postId) {
            // Update tags if provided
            if (isset($data['tags']) && is_array($data['tags'])) {
                updatePostTags($postId, $data['tags']);
            }
            
            // Get the updated post from database
            $db = Database::getInstance();
            $savedPost = $db->fetchOne("SELECT * FROM blog_posts WHERE id = ?", [$postId]);
            
            if ($savedPost) {
                // Format the post data for the response
                $savedPost['published'] = ($savedPost['status'] === 'published');
                $savedPost['date'] = $savedPost['published_at'];
                $savedPost['image'] = $savedPost['image_url'];
                
                echo json_encode($savedPost);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to retrieve updated post']);
            }
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
