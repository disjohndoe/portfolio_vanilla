<?php
/**
 * Simplified Posts API
 * This is a stripped-down version that doesn't use database logging
 */

// Include security functions
require_once 'security.php';

// Define constants 
$baseDir = dirname(__DIR__);
define('BLOG_DATA_DIR', $baseDir . '/blog_data/');
define('ADMIN_POSTS_DIR', $baseDir . '/posts/');

// Common functions for posts
function load_posts() {
    $posts = [];
    
    // Check if the directory exists
    if (!file_exists(BLOG_DATA_DIR)) {
        return $posts;
    }

    // Securely list only JSON files
    $pattern = BLOG_DATA_DIR . '*.json';
    $files = glob($pattern);
    
    if (empty($files)) {
        return $posts;
    }
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        
        if (!$content) {
            continue;
        }
        
        $post_data = json_decode($content, true);
        if ($post_data) {
            $posts[] = $post_data;
        }
    }

    // Sort posts by date (newest first)
    usort($posts, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    return $posts;
}

// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token');

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get all posts
$posts = load_posts();

// Get query parameters
$admin = isset($_GET['admin']) && $_GET['admin'] === 'true';

// Filter out unpublished posts if not admin
if (!$admin) {
    $posts = array_filter($posts, function($post) {
        return isset($post['published']) && $post['published'] === true;
    });
    // Re-index array
    $posts = array_values($posts);
}

// Output the posts
echo json_encode($posts);
