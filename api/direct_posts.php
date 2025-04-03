<?php
/**
 * Direct Posts API
 * A very simple version that just reads posts from the filesystem
 * without any database dependencies or authentication
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

// Function to load posts
function loadPosts($directory) {
    $posts = [];
    
    if (!file_exists($directory)) {
        return $posts;
    }

    $files = glob($directory . '*.json');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if ($content) {
            $post = json_decode($content, true);
            if ($post) {
                $posts[] = $post;
            }
        }
    }
    
    // Sort by date (newest first)
    usort($posts, function($a, $b) {
        return strtotime($b['date'] ?? 0) - strtotime($a['date'] ?? 0);
    });
    
    return $posts;
}

// Determine which directory to use
$useAdmin = isset($_GET['admin']) && $_GET['admin'] === 'true';
$directory = $useAdmin && file_exists($postsDir) ? $postsDir : $blogDataDir;

// Load posts
$posts = loadPosts($directory);

// Filter published posts for non-admin requests
if (!$useAdmin) {
    $posts = array_filter($posts, function($post) {
        return isset($post['published']) && $post['published'] === true;
    });
    $posts = array_values($posts); // Re-index array
}

// Output the posts
echo json_encode($posts);
