<?php
/**
 * Local Database Setup Script
 * 
 * Simplified script to initialize your local database
 * without requiring admin authentication
 */

// Include database configuration
require_once __DIR__ . '/config.php';

try {
    echo "Starting local database setup...<br>\n";
    
    // Connect to the database server without selecting a specific database
    $pdo = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create the database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` 
                CHARACTER SET " . DB_CHARSET . " 
                COLLATE " . DB_COLLATE);
    
    echo "Database created or already exists.<br>\n";
    
    // Select the database
    $pdo->exec("USE `" . DB_NAME . "`");
    
    // Read and execute the schema SQL file
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    $pdo->exec($sql);
    
    echo "Tables created successfully.<br>\n";
    
    // Create a test record
    $pdo->exec("INSERT INTO posts_log (post_id, action, location, changes, user_info, ip_address) 
               VALUES ('test-post', 'create', 'local', 'Test post creation', 'Local setup', '127.0.0.1')");
    
    echo "Test record created.<br>\n";
    echo "Database setup complete!<br>\n";
    
    // Test the connection
    $stmt = $pdo->query("SELECT * FROM posts_log LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<pre>";
    echo "Connection test - fetched record:\n";
    print_r($row);
    echo "</pre>";
    
} catch (PDOException $e) {
    die("Database setup error: " . $e->getMessage());
}
