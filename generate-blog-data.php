<?php
// This script generates a static JSON file from your blog posts
// You run this manually after adding/editing blog posts

// Define directories
$blog_data_dir = __DIR__ . DIRECTORY_SEPARATOR . 'blog_data' . DIRECTORY_SEPARATOR;
$output_file = __DIR__ . DIRECTORY_SEPARATOR . 'blog-data.json';

// Function to load all posts
function load_all_posts($blog_data_dir) {
    $posts = [];
    
    // Check if the directory exists and is readable
    if (!file_exists($blog_data_dir) || !is_readable($blog_data_dir)) {
        echo "Error: Blog data directory not found or not readable.\n";
        return $posts;
    }

    $files = glob($blog_data_dir . '*.json');
    echo "Found " . count($files) . " post files\n";
    
    if (empty($files)) {
        echo "No post files found\n";
        return $posts;
    }
    
    foreach ($files as $file) {
        echo "Reading file: " . basename($file) . "\n";
        $content = file_get_contents($file);
        
        if (!$content) {
            echo "Error reading file: " . basename($file) . "\n";
            continue;
        }
        
        $post_data = json_decode($content, true);
        if ($post_data) {
            $posts[] = $post_data;
        } else {
            echo "Error decoding JSON in file: " . basename($file) . "\n";
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

// Load all blog posts
$posts = load_all_posts($blog_data_dir);
echo "Loaded " . count($posts) . " published posts\n";

// Write to static JSON file
if (file_put_contents($output_file, json_encode($posts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo "Successfully generated " . $output_file . "\n";
} else {
    echo "Error writing to " . $output_file . "\n";
}

// Create individual post JSON files
$posts_dir = __DIR__ . DIRECTORY_SEPARATOR . 'posts' . DIRECTORY_SEPARATOR;
if (!file_exists($posts_dir)) {
    mkdir($posts_dir);
    echo "Created posts directory\n";
}

foreach ($posts as $post) {
    $post_file = $posts_dir . $post['id'] . '.json';
    if (file_put_contents($post_file, json_encode($post, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo "Generated post file: " . basename($post_file) . "\n";
    } else {
        echo "Error writing post file: " . basename($post_file) . "\n";
    }
}

echo "Generation complete!\n";
?>