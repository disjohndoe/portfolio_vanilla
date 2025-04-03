<?php
// Blog API router - redirects to DB-based API
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("X-Content-Type-Options: nosniff");

// Include the post logger
require_once __DIR__ . '/db/config.php';
require_once __DIR__ . '/db/Database.php';

// Check if database tables exist, if not, initialize them
function tablesExist($db) {
    try {
        $result = $db->fetchValue("SHOW TABLES LIKE 'blog_posts'");
        return !empty($result);
    } catch (Exception $e) {
        return false;
    }
}

try {
    $db = Database::getInstance();
    
    if (!tablesExist($db)) {
        // Initialize the database tables if they don't exist
        require_once __DIR__ . '/db/init_blog_db.php';
    }
    
    // Forward the request to the database-powered API
    require_once __DIR__ . '/blog/posts.php';
    
} catch (Exception $e) {
    // If database connection fails, try to fall back to file-based posts
    error_log("Failed to connect to database: " . $e->getMessage());
    
    // Security: Define base directory for file-based fallback
    $blog_data_dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'blog_data' . DIRECTORY_SEPARATOR;
    
    // Create directory if it doesn't exist
    if (!file_exists($blog_data_dir)) {
        mkdir($blog_data_dir, 0755, true);
    }
    
    // Security: Get post ID and sanitize if provided
    $post_id = isset($_GET['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['id']) : '';
    
    // Function to load all posts
    function load_posts($blog_data_dir) {
        $posts = [];
        
        if (!file_exists($blog_data_dir) || !is_readable($blog_data_dir)) {
            return $posts;
        }
    
        $files = glob($blog_data_dir . '*.json');
        
        foreach ($files as $file) {
            if (!is_readable($file)) continue;
            
            $content = file_get_contents($file);
            if (!$content) continue;
            
            $post_data = json_decode($content, true);
            if ($post_data) {
                // Security: Only include published posts
                if (isset($post_data['published']) && $post_data['published'] === true) {
                    // Ensure tags exist
                    if (!isset($post_data['tags']) || !is_array($post_data['tags'])) {
                        $post_data['tags'] = [];
                    }
                    $posts[] = $post_data;
                }
            }
        }
    
        // Sort posts by date (newest first)
        usort($posts, function($a, $b) {
            return strtotime($b['date'] ?? 0) - strtotime($a['date'] ?? 0);
        });
    
        return $posts;
    }
    
    // Function to get a single post
    function get_post($blog_data_dir, $post_id) {
        if (empty($post_id)) return null;
        
        $file_path = $blog_data_dir . $post_id . '.json';
        
        if (!file_exists($file_path) || !is_readable($file_path)) {
            return null;
        }
        
        $content = file_get_contents($file_path);
        if (!$content) return null;
        
        $post = json_decode($content, true);
        
        // Security: Only return published posts
        if (!isset($post['published']) || $post['published'] !== true) {
            return null;
        }
        
        return $post;
    }
    
    // Handle request in fallback mode
    if (!empty($post_id)) {
        // Get single post
        $post = get_post($blog_data_dir, $post_id);
        
        if ($post) {
            echo json_encode($post);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Post not found"]);
        }
    } else {
        // Get all posts
        $posts = load_posts($blog_data_dir);
        echo json_encode($posts);
    }
}
?>