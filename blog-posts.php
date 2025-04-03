<?php
// Direct blog posts API that sits in the root directory
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Define blog data directory
$blog_data_dir = __DIR__ . DIRECTORY_SEPARATOR . 'blog_data' . DIRECTORY_SEPARATOR;

// Load all posts function
function load_all_posts($blog_data_dir) {
    $posts = [];
    
    // Check if the directory exists
    if (!file_exists($blog_data_dir)) {
        return $posts;
    }
    
    // Check if the directory is readable
    if (!is_readable($blog_data_dir)) {
        return $posts;
    }

    $files = glob($blog_data_dir . '*.json');
    
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