<?php
/**
 * Direct Single Post API
 * Database-based approach to get a single post by ID
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

// Clean post ID (security)
$postId = preg_replace('/[^a-zA-Z0-9_-]/', '', $postId);

// Check if admin parameter is set
$useAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';

// Function to get post by ID
function getPostById($id, $useAdmin = false) {
    try {
        $db = Database::getInstance();
        
        // Build query with condition for published status
        $query = "SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.excerpt,
                    p.content,
                    p.image_url AS image, 
                    p.status,
                    p.published_at AS date,
                    u.username AS author,
                    u.display_name AS author_name
                  FROM blog_posts p
                  LEFT JOIN blog_users u ON p.author_id = u.id
                  WHERE p.id = ?";
        
        // Add status check for non-admin requests
        if (!$useAdmin) {
            $query .= " AND p.status = 'published'";
        }
        
        $post = $db->fetchOne($query, [$id]);
        
        if (!$post) {
            return null;
        }
        
        // Get categories/tags for this post
        $tagQuery = "SELECT c.name 
                     FROM blog_categories c
                     JOIN blog_post_categories pc ON c.id = pc.category_id
                     WHERE pc.post_id = ?";
        
        $tags = $db->fetchColumn($tagQuery, [$id]);
        $post['tags'] = $tags ? $tags : [];
        
        // Convert status to published boolean flag
        $post['published'] = ($post['status'] === 'published');
        
        return $post;
    } catch (Exception $e) {
        error_log("Error fetching post: " . $e->getMessage());
        return null;
    }
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
