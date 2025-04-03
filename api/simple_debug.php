<?php
/**
 * Simple Debug Script
 * Tests key components one by one with error reporting
 */

// Enable full error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Simple API Debug</h1>";

// Step 1: Check PHP Version and Extensions
echo "<h2>PHP Environment</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Extensions:</p><ul>";
echo "<li>PDO: " . (extension_loaded('pdo') ? 'Loaded ✓' : 'Not loaded ✗') . "</li>";
echo "<li>PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'Loaded ✓' : 'Not loaded ✗') . "</li>";
echo "<li>cURL: " . (extension_loaded('curl') ? 'Loaded ✓' : 'Not loaded ✗') . "</li>";
echo "<li>JSON: " . (extension_loaded('json') ? 'Loaded ✓' : 'Not loaded ✗') . "</li>";
echo "</ul>";

// Step 2: Check File System
echo "<h2>File System</h2>";
$baseDir = dirname(__DIR__);
$blogDataDir = $baseDir . '/blog_data/';
$postsDir = $baseDir . '/posts/';

echo "<p>Base directory: {$baseDir}</p>";
echo "<p>Blog data directory: {$blogDataDir}<br>";
echo "Exists: " . (file_exists($blogDataDir) ? 'Yes ✓' : 'No ✗') . ", ";
echo "Readable: " . (is_readable($blogDataDir) ? 'Yes ✓' : 'No ✗') . "</p>";

echo "<p>Posts directory: {$postsDir}<br>";
echo "Exists: " . (file_exists($postsDir) ? 'Yes ✓' : 'No ✗') . ", ";
echo "Readable: " . (is_readable($postsDir) ? 'Yes ✓' : 'No ✗') . "</p>";

// Step 3: Check blog files
echo "<h2>Blog Files</h2>";
if (file_exists($blogDataDir)) {
    $files = glob($blogDataDir . '*.json');
    echo "<p>Found " . count($files) . " JSON files in blog_data/ directory</p>";
    if (count($files) > 0) {
        echo "<ul>";
        foreach ($files as $file) {
            $filename = basename($file);
            $size = filesize($file);
            echo "<li>{$filename} ({$size} bytes)</li>";
        }
        echo "</ul>";
    }
} else {
    echo "<p>Cannot access blog_data directory</p>";
}

// Step 4: Try to load posts directly
echo "<h2>Load Posts Test</h2>";
echo "<pre>";

function load_test_posts() {
    global $blogDataDir;
    $posts = [];
    
    if (!file_exists($blogDataDir)) {
        echo "Blog data directory does not exist\n";
        return $posts;
    }

    $pattern = $blogDataDir . '*.json';
    $files = glob($pattern);
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
            echo "Successfully parsed post: " . ($post_data['title'] ?? 'Untitled') . "\n";
            $posts[] = $post_data;
        } else {
            echo "Error decoding JSON in file: " . basename($file) . ", JSON error: " . json_last_error_msg() . "\n";
        }
    }

    return $posts;
}

$posts = load_test_posts();
echo "\nLoaded " . count($posts) . " posts successfully\n";
echo "</pre>";

// Step 5: Check database connection
echo "<h2>Database Connection</h2>";
echo "<pre>";

try {
    require_once 'db/config.php';
    echo "Config loaded\n";
    
    if (defined('DB_HOST') && defined('DB_NAME') && defined('DB_USER') && defined('DB_PASS')) {
        echo "Database credentials found\n";
        echo "Host: " . DB_HOST . "\n";
        echo "Database: " . DB_NAME . "\n";
        echo "User: " . DB_USER . "\n";
        echo "Password: [hidden]\n\n";
        
        require_once 'db/Database.php';
        echo "Database class loaded\n";
        
        try {
            $db = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "Database connection successful!\n";
            
            // Check for posts_log table
            $stmt = $db->query("SHOW TABLES LIKE 'posts_log'");
            $postsLogExists = $stmt->rowCount() > 0;
            echo "posts_log table exists: " . ($postsLogExists ? 'Yes ✓' : 'No ✗') . "\n";
            
            // Check for posts_sync table
            $stmt = $db->query("SHOW TABLES LIKE 'posts_sync'");
            $postsSyncExists = $stmt->rowCount() > 0;
            echo "posts_sync table exists: " . ($postsSyncExists ? 'Yes ✓' : 'No ✗') . "\n";
            
            if ($postsLogExists) {
                $stmt = $db->query("SELECT COUNT(*) FROM posts_log");
                $count = $stmt->fetchColumn();
                echo "Number of records in posts_log: " . $count . "\n";
            }
            
            if ($postsSyncExists) {
                $stmt = $db->query("SELECT COUNT(*) FROM posts_sync");
                $count = $stmt->fetchColumn();
                echo "Number of records in posts_sync: " . $count . "\n";
            }
            
        } catch (PDOException $e) {
            echo "Database connection failed: " . $e->getMessage() . "\n";
        }
    } else {
        echo "Missing database credentials in config.php\n";
    }
} catch (Exception $e) {
    echo "Error loading database configuration: " . $e->getMessage() . "\n";
}

echo "</pre>";

// Step 6: Check API token generation
echo "<h2>API Token Test</h2>";
echo "<pre>";

try {
    require_once 'auth_api.php';
    if (function_exists('generateApiToken')) {
        echo "generateApiToken function found\n";
        $token = generateApiToken();
        if ($token) {
            echo "Token generated successfully: " . substr($token, 0, 10) . "..." . substr($token, -10) . "\n";
        } else {
            echo "Failed to generate token\n";
        }
    } else {
        echo "generateApiToken function does not exist\n";
    }
} catch (Exception $e) {
    echo "Error testing API token: " . $e->getMessage() . "\n";
}

echo "</pre>";

// Step 7: Test auth_admin.php
echo "<h2>Admin Authentication</h2>";
echo "<pre>";

try {
    echo "Testing admin authentication (will redirect if not authenticated)\n";
    require_once 'auth_admin.php';
    echo "Admin authentication passed - you are logged in\n";
} catch (Exception $e) {
    echo "Error in admin authentication: " . $e->getMessage() . "\n";
}

echo "</pre>";

echo "<p>Debug complete</p>";
