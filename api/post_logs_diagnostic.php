<?php
// Set error reporting and display for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Basic auth for security
if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
    header('WWW-Authenticate: Basic realm="Admin Access"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Authentication required';
    exit;
}

if ($_SERVER['PHP_AUTH_USER'] !== 'admin' || $_SERVER['PHP_AUTH_PW'] !== 'soft!ware3By4Matt5') {
    header('HTTP/1.0 401 Unauthorized');
    echo 'Authentication failed';
    exit;
}

// Start HTML output
echo '<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic Page</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Diagnostic Page</h1>';

// Check for PDO
echo '<div class="section">
    <h2>PDO Extension</h2>';
if (extension_loaded('pdo')) {
    echo '<p class="success">PDO extension is loaded ✓</p>';
    
    echo '<h3>Available PDO Drivers:</h3><ul>';
    foreach (PDO::getAvailableDrivers() as $driver) {
        echo '<li>' . htmlspecialchars($driver) . '</li>';
    }
    echo '</ul>';
    
    if (in_array('mysql', PDO::getAvailableDrivers())) {
        echo '<p class="success">MySQL PDO driver is available ✓</p>';
    } else {
        echo '<p class="error">MySQL PDO driver is NOT available ✗</p>';
    }
} else {
    echo '<p class="error">PDO extension is NOT loaded ✗</p>';
}
echo '</div>';

// Check file permissions
echo '<div class="section">
    <h2>File Permissions</h2>';

$directories = [
    __DIR__ . '/db',
    __DIR__ . '/login_protection',
    __DIR__ . '/login_protection/data'
];

foreach ($directories as $dir) {
    echo '<p>Directory: ' . htmlspecialchars($dir) . ' - ';
    if (file_exists($dir)) {
        echo 'Exists ✓, ';
        if (is_readable($dir)) {
            echo 'Readable ✓, ';
        } else {
            echo 'NOT Readable ✗, ';
        }
        if (is_writable($dir)) {
            echo 'Writable ✓';
        } else {
            echo 'NOT Writable ✗';
        }
    } else {
        echo 'Does NOT exist ✗';
    }
    echo '</p>';
}
echo '</div>';

// Try loading the config file
echo '<div class="section">
    <h2>Config File</h2>';
$configFile = __DIR__ . '/db/config.php';
echo '<p>Config file: ' . htmlspecialchars($configFile) . ' - ';
if (file_exists($configFile)) {
    echo 'Exists ✓, ';
    if (is_readable($configFile)) {
        echo 'Readable ✓</p>';
        // Try including it to see if it has syntax errors
        try {
            ob_start();
            include_once $configFile;
            ob_end_clean();
            echo '<p class="success">Config file loaded without errors ✓</p>';
            
            // Display database connection info (without password)
            echo '<p>Database connection info:';
            if (defined('DB_HOST')) echo '<br>Host: ' . htmlspecialchars(DB_HOST);
            if (defined('DB_NAME')) echo '<br>Database: ' . htmlspecialchars(DB_NAME);
            if (defined('DB_USER')) echo '<br>User: ' . htmlspecialchars(DB_USER);
            if (defined('DB_CHARSET')) echo '<br>Charset: ' . htmlspecialchars(DB_CHARSET);
            echo '</p>';
        } catch (Throwable $e) {
            echo '<p class="error">Error loading config file: ' . htmlspecialchars($e->getMessage()) . ' ✗</p>';
        }
    } else {
        echo 'NOT Readable ✗</p>';
    }
} else {
    echo 'Does NOT exist ✗</p>';
}
echo '</div>';

// Try loading the Database class
echo '<div class="section">
    <h2>Database Class</h2>';
$dbFile = __DIR__ . '/db/Database.php';
echo '<p>Database class file: ' . htmlspecialchars($dbFile) . ' - ';
if (file_exists($dbFile)) {
    echo 'Exists ✓, ';
    if (is_readable($dbFile)) {
        echo 'Readable ✓</p>';
        // Try including it
        try {
            if (!class_exists('Database')) {
                include_once $dbFile;
                echo '<p class="success">Database class loaded without errors ✓</p>';
            } else {
                echo '<p class="success">Database class already loaded ✓</p>';
            }
        } catch (Throwable $e) {
            echo '<p class="error">Error loading Database class: ' . htmlspecialchars($e->getMessage()) . ' ✗</p>';
        }
    } else {
        echo 'NOT Readable ✗</p>';
    }
} else {
    echo 'Does NOT exist ✗</p>';
}
echo '</div>';

// Try loading the PostLogger class
echo '<div class="section">
    <h2>PostLogger Class</h2>';
$loggerFile = __DIR__ . '/db/PostLogger.php';
echo '<p>PostLogger class file: ' . htmlspecialchars($loggerFile) . ' - ';
if (file_exists($loggerFile)) {
    echo 'Exists ✓, ';
    if (is_readable($loggerFile)) {
        echo 'Readable ✓</p>';
        // Try including it
        try {
            if (!class_exists('PostLogger')) {
                include_once $loggerFile;
                echo '<p class="success">PostLogger class loaded without errors ✓</p>';
            } else {
                echo '<p class="success">PostLogger class already loaded ✓</p>';
            }
        } catch (Throwable $e) {
            echo '<p class="error">Error loading PostLogger class: ' . htmlspecialchars($e->getMessage()) . ' ✗</p>';
        }
    } else {
        echo 'NOT Readable ✗</p>';
    }
} else {
    echo 'Does NOT exist ✗</p>';
}
echo '</div>';

// Try connecting to the database if all required files loaded
echo '<div class="section">
    <h2>Database Connection Test</h2>';
if (class_exists('Database')) {
    try {
        $db = Database::getInstance();
        echo '<p class="success">Database connection established ✓</p>';
        
        // Try a simple query
        try {
            $result = $db->query("SELECT 1")->fetch();
            echo '<p class="success">Test query executed successfully ✓</p>';
        } catch (Throwable $e) {
            echo '<p class="error">Error executing test query: ' . htmlspecialchars($e->getMessage()) . ' ✗</p>';
        }
    } catch (Throwable $e) {
        echo '<p class="error">Database connection error: ' . htmlspecialchars($e->getMessage()) . ' ✗</p>';
    }
} else {
    echo '<p class="error">Database class not available ✗</p>';
}
echo '</div>';

// PHP Info section (limited for security)
echo '<div class="section">
    <h2>PHP Information</h2>
    <p>PHP Version: ' . phpversion() . '</p>
    <p>Server Software: ' . htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>
</div>';

echo '</body></html>';
