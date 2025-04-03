<?php
// API endpoint for fetching blog posts from MySQL database
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("X-Content-Type-Options: nosniff");

// Include the database classes
require_once dirname(__DIR__) . '/db/config.php';
require_once dirname(__DIR__) . '/db/Database.php';

// Get post ID if provided
$post_id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT) : null;

try {
    // Initialize database connection
    $db = Database::getInstance();
    
    // If post ID is provided, fetch a single post
    if ($post_id) {
        $query = "SELECT p.id, p.title, p.content, p.excerpt, p.image_url AS image, 
                         p.published_at AS date, u.username AS author
                  FROM blog_posts p
                  LEFT JOIN blog_users u ON p.author_id = u.id
                  WHERE p.id = ? AND p.status = 'published'";
        
        $post = $db->fetchOne($query, [$post_id]);
        
        if ($post) {
            // Get tags/categories for this post
            $tagQuery = "SELECT c.name 
                       FROM blog_categories c
                       JOIN blog_post_categories pc ON c.id = pc.category_id
                       WHERE pc.post_id = ?";
            
            $tags = $db->fetchColumn($tagQuery, [$post_id]);
            $post['tags'] = $tags ? $tags : [];
            
            // Success! Return the post
            echo json_encode($post);
        } else {
            // Post not found
            http_response_code(404);
            echo json_encode(["error" => "Post not found"]);
        }
    } 
    // Otherwise, fetch all published posts
    else {
        $query = "SELECT p.id, p.title, p.excerpt, p.image_url AS image, 
                         p.published_at AS date, u.username AS author
                  FROM blog_posts p
                  LEFT JOIN blog_users u ON p.author_id = u.id
                  WHERE p.status = 'published'
                  ORDER BY p.published_at DESC";
        
        $posts = $db->fetchAll($query);
        
        // Add empty tags array to each post
        foreach ($posts as &$post) {
            $post['tags'] = [];
            
            // Get categories for this post
            $tagQuery = "SELECT c.name 
                         FROM blog_categories c
                         JOIN blog_post_categories pc ON c.id = pc.category_id
                         WHERE pc.post_id = ?";
            
            $tags = $db->fetchColumn($tagQuery, [$post['id']]);
            
            if ($tags) {
                $post['tags'] = $tags;
            }
        }
        
        // Return the posts
        echo json_encode($posts);
    }
} catch (Exception $e) {
    // Log the error
    error_log("Blog API error: " . $e->getMessage());
    
    // Return error response
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch blog posts"]);
}
