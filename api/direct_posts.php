<?php
/**
 * Direct Posts API
 * Database-based approach to fetch blog posts
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

// Function to load posts from database
function loadPosts($useAdmin = false) {
    try {
        $db = Database::getInstance();
        
        // Base query - select different fields based on admin status
        $query = "SELECT 
                    p.id, 
                    p.title, 
                    p.slug,
                    p.excerpt,
                    " . ($useAdmin ? "p.content," : "") . "
                    p.image_url AS image, 
                    p.status,
                    p.published_at AS date,
                    u.username AS author,
                    u.display_name AS author_name
                  FROM blog_posts p
                  LEFT JOIN blog_users u ON p.author_id = u.id";
        
        // Add WHERE clause for non-admin requests
        if (!$useAdmin) {
            $query .= " WHERE p.status = 'published'";
        }
        
        // Add ORDER BY clause
        $query .= " ORDER BY p.published_at DESC, p.created_at DESC";
        
        $posts = $db->fetchAll($query);
        
        // Process each post to add tags and format data
        foreach ($posts as &$post) {
            // Get categories/tags for this post
            $tagQuery = "SELECT c.name 
                         FROM blog_categories c
                         JOIN blog_post_categories pc ON c.id = pc.category_id
                         WHERE pc.post_id = ?";
            
            $tags = $db->fetchColumn($tagQuery, [$post['id']]);
            $post['tags'] = $tags ? $tags : [];
            
            // Convert status to published boolean flag
            $post['published'] = ($post['status'] === 'published');
        }
        
        return $posts;
    } catch (Exception $e) {
        error_log("Error loading posts: " . $e->getMessage());
        return [];
    }
}

// Determine if we're in admin mode
$useAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';

// Load posts
$posts = loadPosts($useAdmin);

// Output the posts
echo json_encode($posts);
