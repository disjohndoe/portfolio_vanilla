<?php
/**
 * Database Initialization Script
 * 
 * Run this script once to create the required tables
 */

// Require authentication before allowing execution
require_once __DIR__ . '/../auth_admin.php';

// Include database configuration
require_once __DIR__ . '/config.php';

try {
    // Connect to the database without selecting a specific database
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
    
    echo "Database initialization complete!<br>\n";
} catch (PDOException $e) {
    die("Database initialization error: " . $e->getMessage());
}
