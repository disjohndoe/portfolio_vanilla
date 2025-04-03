<?php
/**
 * Database Connection Test
 * 
 * Use this script to test your database connection
 */

// Include database configuration
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';

try {
    // Get database instance
    $db = Database::getInstance();
    
    // Test the connection
    $result = $db->fetchAll("SELECT * FROM posts_log LIMIT 5");
    
    echo "<h2>Database Connection Test</h2>";
    
    if (empty($result)) {
        echo "<p>Connected successfully, but no records found in posts_log table.</p>";
        echo "<p>You may need to run the setup_local_db.php script first.</p>";
    } else {
        echo "<p>Connected successfully! Found " . count($result) . " record(s):</p>";
        
        echo "<pre>";
        print_r($result);
        echo "</pre>";
    }
    
} catch (Exception $e) {
    echo "<h2>Database Connection Error</h2>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    
    echo "<h3>Troubleshooting Tips:</h3>";
    echo "<ul>";
    echo "<li>Make sure your MySQL server is running</li>";
    echo "<li>Check that the database credentials in config.php are correct</li>";
    echo "<li>Run the setup_local_db.php script to initialize the database</li>";
    echo "</ul>";
}
