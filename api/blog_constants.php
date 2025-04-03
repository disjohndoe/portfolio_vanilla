<?php
/**
 * Blog Constants
 * 
 * Defines important constants for the blog system
 */

// Define base directory
$baseDir = dirname(__DIR__);

// Blog data directory (published posts)
if (!defined('BLOG_DATA_DIR')) {
    define('BLOG_DATA_DIR', $baseDir . '/blog_data/');
}

// Admin posts directory (draft/original posts)
if (!defined('ADMIN_POSTS_DIR')) {
    define('ADMIN_POSTS_DIR', $baseDir . '/posts/');
}

// Debug logging function
if (!function_exists('debug_log')) {
    function debug_log($message) {
        // Uncomment for local debugging
        // error_log($message);
    }
}
