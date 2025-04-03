<?php
// API Diagnostics - Helps troubleshoot API issues

// Require authentication before proceeding
require_once 'auth_admin.php';
// If the code gets here, authentication was successful

header("Content-Type: text/html; charset=UTF-8");

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>API Diagnostics</h1>";

// 1. Check PHP Version
echo "<h2>1. PHP Version</h2>";
echo "<p>PHP Version: " . PHP_VERSION . "</p>";

// 2. Check server information
echo "<h2>2. Server Information</h2>";
echo "<ul>";
echo "<li>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</li>";
echo "<li>Request URI: " . $_SERVER['REQUEST_URI'] . "</li>";
echo "<li>Script Filename: " . $_SERVER['SCRIPT_FILENAME'] . "</li>";
echo "<li>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</li>";
echo "</ul>";

// 3. Check blog_data directory
echo "<h2>3. Blog Data Directory Check</h2>";
$base_path = dirname(__DIR__) . DIRECTORY_SEPARATOR;
$blog_data_dir = $base_path . 'blog_data' . DIRECTORY_SEPARATOR;

echo "<p>Base Path: " . $base_path . "</p>";
echo "<p>Blog Data Directory: " . $blog_data_dir . "</p>";

if (file_exists($blog_data_dir)) {
    echo "<p style='color:green'>✓ Blog data directory exists</p>";
    
    if (is_readable($blog_data_dir)) {
        echo "<p style='color:green'>✓ Blog data directory is readable</p>";
    } else {
        echo "<p style='color:red'>✗ Blog data directory is not readable</p>";
    }
    
    if (is_writable($blog_data_dir)) {
        echo "<p style='color:green'>✓ Blog data directory is writable</p>";
    } else {
        echo "<p style='color:red'>✗ Blog data directory is not writable</p>";
    }
    
    // Check for JSON files
    $files = glob($blog_data_dir . '*.json');
    echo "<p>Found " . count($files) . " JSON files in blog data directory</p>";
    
    if (count($files) > 0) {
        echo "<h3>JSON Files:</h3>";
        echo "<ul>";
        foreach ($files as $file) {
            echo "<li>" . basename($file);
            
            if (is_readable($file)) {
                echo " - <span style='color:green'>readable</span>";
                
                // Try to read and decode the JSON
                $content = file_get_contents($file);
                if ($content !== false) {
                    $decoded = json_decode($content, true);
                    if ($decoded !== null) {
                        echo " - <span style='color:green'>valid JSON</span>";
                    } else {
                        echo " - <span style='color:red'>invalid JSON: " . json_last_error_msg() . "</span>";
                    }
                } else {
                    echo " - <span style='color:red'>could not read file</span>";
                }
            } else {
                echo " - <span style='color:red'>not readable</span>";
            }
            
            echo "</li>";
        }
        echo "</ul>";
    }
} else {
    echo "<p style='color:red'>✗ Blog data directory does not exist</p>";
}

// 4. Check .htaccess file
echo "<h2>4. .htaccess Check</h2>";
$htaccess_path = $base_path . '.htaccess';

if (file_exists($htaccess_path)) {
    echo "<p style='color:green'>✓ .htaccess file exists</p>";
    
    if (is_readable($htaccess_path)) {
        echo "<p style='color:green'>✓ .htaccess file is readable</p>";
    } else {
        echo "<p style='color:red'>✗ .htaccess file is not readable</p>";
    }
} else {
    echo "<p style='color:red'>✗ .htaccess file does not exist</p>";
}

// 5. Check PHP modules
echo "<h2>5. PHP Modules</h2>";
$required_modules = ['json', 'fileinfo', 'pdo'];
echo "<ul>";
foreach ($required_modules as $module) {
    if (extension_loaded($module)) {
        echo "<li style='color:green'>✓ $module is loaded</li>";
    } else {
        echo "<li style='color:red'>✗ $module is not loaded</li>";
    }
}
echo "</ul>";

// 6. Test API endpoint directly
echo "<h2>6. API Endpoint Test</h2>";
echo "<p>Testing direct-posts.php endpoint...</p>";

// Use output buffering to capture any errors
ob_start();
try {
    $api_url = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/direct-posts.php";
    echo "<p>API URL: " . $api_url . "</p>";
    
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/json\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $result = file_get_contents($api_url, false, $context);
    
    if ($result === false) {
        echo "<p style='color:red'>✗ API request failed</p>";
    } else {
        $data = json_decode($result, true);
        if ($data !== null) {
            echo "<p style='color:green'>✓ API returned valid JSON</p>";
            echo "<p>Found " . count($data) . " posts</p>";
            
            if (count($data) > 0) {
                echo "<h3>First Post:</h3>";
                echo "<pre>" . htmlspecialchars(json_encode($data[0], JSON_PRETTY_PRINT)) . "</pre>";
            }
        } else {
            echo "<p style='color:red'>✗ API did not return valid JSON: " . json_last_error_msg() . "</p>";
            echo "<p>Raw response:</p>";
            echo "<pre>" . htmlspecialchars($result) . "</pre>";
        }
    }
} catch (Exception $e) {
    echo "<p style='color:red'>✗ Exception: " . $e->getMessage() . "</p>";
}
$output = ob_get_clean();
echo $output;

echo "<hr>";
echo "<p><strong>Created by Claude - API Diagnostic Tool</strong></p>";
?>