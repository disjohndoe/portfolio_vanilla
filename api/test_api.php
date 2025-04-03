<?php
/**
 * API Test Script
 * This will test the critical API endpoints used by the admin dashboard
 */

// Include authentication
require_once 'auth_admin.php';

// Function to make an internal API request
function testApiEndpoint($endpoint) {
    // Generate token
    require_once 'auth_api.php';
    $token = generateApiToken();
    
    // Build the full URL
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = $protocol . $host;
    $fullUrl = $baseUrl . '/api/' . $endpoint;
    
    echo "<h3>Testing: $fullUrl</h3>";
    
    // Make the API request
    $ch = curl_init($fullUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    
    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    // Output results
    echo "<pre>";
    echo "HTTP Status: " . $info['http_code'] . "\n\n";
    
    if ($error) {
        echo "Error: " . $error . "\n";
    }
    
    if ($info['http_code'] >= 200 && $info['http_code'] < 300) {
        echo "Success!\n\n";
        
        // Pretty print JSON if it's valid
        $decoded = json_decode($response, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "Response (formatted):\n";
            echo json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        } else {
            echo "Response (raw):\n";
            echo htmlspecialchars($response);
        }
    } else {
        echo "Failed with status code: " . $info['http_code'] . "\n\n";
        echo "Response:\n";
        echo htmlspecialchars($response);
    }
    
    echo "</pre>";
    echo "<hr>";
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        h1, h2, h3 { color: #333; }
        hr { margin: 30px 0; border: 0; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Admin API Test</h1>
    <p>This script tests the API endpoints used by the admin dashboard.</p>
    
    <h2>Basic Posts API</h2>
    <?php testApiEndpoint('posts?admin=true'); ?>
    
    <h2>Database Information</h2>
    <pre>
<?php
// Test database connection
require_once 'db/config.php';
require_once 'db/Database.php';

echo "Database Configuration:\n";
echo "Host: " . DB_HOST . "\n";
echo "Database: " . DB_NAME . "\n";
echo "Charset: " . DB_CHARSET . "\n\n";

try {
    $db = Database::getInstance();
    echo "Successfully connected to database!\n\n";
    
    // Test querying the posts_log table
    echo "Testing posts_log table:\n";
    $logs = $db->fetchAll("SELECT * FROM posts_log ORDER BY created_at DESC LIMIT 5");
    echo "Found " . count($logs) . " log entries\n";
    
    // Test querying the posts_sync table
    echo "\nTesting posts_sync table:\n";
    $syncs = $db->fetchAll("SELECT * FROM posts_sync LIMIT 5");
    echo "Found " . count($syncs) . " sync entries\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
    </pre>
    
    <h2>API Token Test</h2>
    <?php
    try {
        require_once 'auth_api.php';
        $token = generateApiToken();
        echo "<pre>Generated token: " . substr($token, 0, 10) . "..." . substr($token, -10) . " (" . strlen($token) . " chars)</pre>";
    } catch (Exception $e) {
        echo "<pre>Error generating token: " . $e->getMessage() . "</pre>";
    }
    ?>
    
    <h2>File System Check</h2>
    <pre>
<?php
echo "ADMIN_POSTS_DIR: " . (defined('ADMIN_POSTS_DIR') ? ADMIN_POSTS_DIR : 'Not defined') . "\n";
echo "   - Exists: " . (file_exists(ADMIN_POSTS_DIR) ? 'Yes' : 'No') . "\n";
echo "   - Readable: " . (is_readable(ADMIN_POSTS_DIR) ? 'Yes' : 'No') . "\n";
echo "   - Writable: " . (is_writable(ADMIN_POSTS_DIR) ? 'Yes' : 'No') . "\n\n";

echo "PUBLIC_POSTS_DIR: " . (defined('PUBLIC_POSTS_DIR') ? PUBLIC_POSTS_DIR : 'Not defined') . "\n";
echo "   - Exists: " . (file_exists(PUBLIC_POSTS_DIR) ? 'Yes' : 'No') . "\n";
echo "   - Readable: " . (is_readable(PUBLIC_POSTS_DIR) ? 'Yes' : 'No') . "\n";
echo "   - Writable: " . (is_writable(PUBLIC_POSTS_DIR) ? 'Yes' : 'No') . "\n";
?>
    </pre>
</body>
</html>
