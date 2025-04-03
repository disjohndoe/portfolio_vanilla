<?php
/**
 * Database Diagnostics
 * 
 * This script helps troubleshoot database connection issues
 * and displays important system and environment information
 */

// Show all errors for diagnostic purposes
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include database configuration
require_once __DIR__ . '/config.php';

// Function to display database environment
function displayEnvironmentInfo() {
    echo '<div style="margin-bottom: 20px;">';
    echo '<h3>Environment Information</h3>';
    echo '<ul>';
    echo '<li>Server: ' . $_SERVER['SERVER_SOFTWARE'] . '</li>';
    echo '<li>PHP Version: ' . phpversion() . '</li>';
    echo '<li>Server Name: ' . $_SERVER['SERVER_NAME'] . '</li>';
    echo '<li>Server Address: ' . $_SERVER['SERVER_ADDR'] . '</li>';
    echo '<li>Document Root: ' . $_SERVER['DOCUMENT_ROOT'] . '</li>';
    echo '<li>Environment Type: ' . (($_SERVER['SERVER_NAME'] === 'localhost' || $_SERVER['SERVER_ADDR'] === '127.0.0.1') ? 'Local Development' : 'Production') . '</li>';
    echo '</ul>';
    echo '</div>';
}

// Function to display database configuration
function displayDatabaseConfig() {
    echo '<div style="margin-bottom: 20px;">';
    echo '<h3>Database Configuration</h3>';
    echo '<ul>';
    echo '<li>Host: ' . DB_HOST . '</li>';
    echo '<li>Database: ' . DB_NAME . '</li>';
    echo '<li>User: ' . DB_USER . '</li>';
    echo '<li>Password: ' . (DB_PASS ? '********' : '<em>Empty</em>') . '</li>';
    echo '<li>Charset: ' . DB_CHARSET . '</li>';
    echo '<li>Collation: ' . DB_COLLATE . '</li>';
    echo '</ul>';
    echo '</div>';
}

// Function to test database connection
function testDatabaseConnection() {
    echo '<div style="margin-bottom: 20px;">';
    echo '<h3>Database Connection Test</h3>';
    
    try {
        // Attempt to connect to database
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $startTime = microtime(true);
        $conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        $endTime = microtime(true);
        $connectionTime = number_format(($endTime - $startTime) * 1000, 2);
        
        echo '<p style="color: green;">✓ Successfully connected to database! (Connection time: ' . $connectionTime . 'ms)</p>';
        
        // Check if tables exist
        echo '<h4>Database Structure</h4>';
        $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($tables)) {
            echo '<p style="color: orange;">⚠️ No tables found in the database.</p>';
            echo '<p>You may need to run the setup script to create tables.</p>';
        } else {
            echo '<p>Found ' . count($tables) . ' table(s):</p>';
            echo '<ul>';
            foreach ($tables as $table) {
                echo '<li>' . $table . '</li>';
            }
            echo '</ul>';
            
            // For each table, check record count
            echo '<h4>Table Record Counts</h4>';
            echo '<ul>';
            foreach ($tables as $table) {
                $count = $conn->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
                echo '<li>' . $table . ': ' . $count . ' record(s)</li>';
            }
            echo '</ul>';
        }
        
    } catch (PDOException $e) {
        echo '<p style="color: red;">✗ Connection failed: ' . $e->getMessage() . '</p>';
        
        // Try to connect to the server without a specific database to check if server is reachable
        try {
            $pdo = new PDO("mysql:host=" . DB_HOST, DB_USER, DB_PASS);
            echo '<p style="color: orange;">⚠️ Connected to MySQL server, but database "' . DB_NAME . '" does not exist or is not accessible.</p>';
        } catch (PDOException $e2) {
            echo '<p style="color: red;">✗ Cannot connect to MySQL server: ' . $e2->getMessage() . '</p>';
        }
    }
    
    echo '</div>';
}

// Function to display MySQL information
function displayMySQLInfo() {
    echo '<div style="margin-bottom: 20px;">';
    echo '<h3>MySQL Information</h3>';
    
    try {
        $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        
        $mysqlVersion = $pdo->query('SELECT VERSION()')->fetchColumn();
        $variables = [
            'max_connections',
            'wait_timeout',
            'max_allowed_packet',
            'character_set_server',
            'collation_server'
        ];
        
        echo '<ul>';
        echo '<li>MySQL Version: ' . $mysqlVersion . '</li>';
        
        foreach ($variables as $var) {
            $value = $pdo->query("SHOW VARIABLES LIKE '{$var}'")->fetch(PDO::FETCH_ASSOC);
            if ($value) {
                echo '<li>' . $var . ': ' . $value['Value'] . '</li>';
            }
        }
        
        echo '</ul>';
    } catch (PDOException $e) {
        echo '<p style="color: red;">Cannot retrieve MySQL information: ' . $e->getMessage() . '</p>';
    }
    
    echo '</div>';
}

// Display a nicely formatted diagnostic page
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Diagnostics</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4 {
            color: #333;
        }
        .diagnostics-container {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .actions {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        button, .button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        button:hover, .button:hover {
            background-color: #45a049;
        }
        .warning {
            background-color: #fffbea;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <h1>Database Diagnostics</h1>
    
    <div class="warning">
        <p><strong>Note:</strong> This diagnostic page displays sensitive database configuration information.
        Make sure to remove or protect this file in a production environment.</p>
    </div>
    
    <div class="diagnostics-container">
        <?php displayEnvironmentInfo(); ?>
        <?php displayDatabaseConfig(); ?>
        <?php testDatabaseConnection(); ?>
        <?php displayMySQLInfo(); ?>
    </div>
    
    <div class="actions">
        <h3>Available Actions</h3>
        <a href="setup_local_db.php" class="button">Initialize Local Database</a>
        <a href="test_connection.php" class="button">Simple Connection Test</a>
        <a href="../diagnostics.php" class="button">API Diagnostics</a>
    </div>
</body>
</html>
