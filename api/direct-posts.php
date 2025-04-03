<?php
// This is a direct endpoint that doesn't rely on .htaccess rewrites
// Access this file directly at /api/direct-posts.php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Write to debug log
function debug_log($message) {
    file_put_contents(__DIR__ . '/debug.log', date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
    error_log($message);
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define blog data directory with absolute path
$base_path = dirname(__DIR__) . DIRECTORY_SEPARATOR;
$blog_data_dir = $base_path . 'blog_data' . DIRECTORY_SEPARATOR;

debug_log("Blog data directory: " . $blog_data_dir);

// Load all posts function
function load_all_posts($blog_data_dir) {
    debug_log("Loading posts from directory: " . $blog_data_dir);
    $posts = [];
    
    // Check if the directory exists
    if (!file_exists($blog_data_dir)) {
        debug_log("Blog data directory does not exist: " . $blog_data_dir);
        return $posts;
    }
    
    // Check if the directory is readable
    if (!is_readable($blog_data_dir)) {
        debug_log("Blog data directory is not readable: " . $blog_data_dir);
        return $posts;
    }

    $files = glob($blog_data_dir . '*.json');
    debug_log("Found " . count($files) . " post files");
    
    if (empty($files)) {
        debug_log("No post files found in: " . $blog_data_dir);
        return $posts;
    }
    
    foreach ($files as $file) {
        debug_log("Reading file: " . $file);
        $content = file_get_contents($file);
        
        if (!$content) {
            debug_log("Error reading file: " . $file);
            continue;
        }
        
        $post_data = json_decode($content, true);
        if ($post_data) {
            $posts[] = $post_data;
        } else {
            debug_log("Error decoding JSON in file: " . $file . ", JSON error: " . json_last_error_msg());
        }
    }

    // Sort posts by date (newest first)
    usort($posts, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    // Filter out unpublished posts
    $posts = array_filter($posts, function($post) {
        return isset($post['published']) && $post['published'] === true;
    });
    
    // Re-index array
    $posts = array_values($posts);

    return $posts;
}

// Get all posts and return as JSON
$posts = load_all_posts($blog_data_dir);
echo json_encode($posts);
?>