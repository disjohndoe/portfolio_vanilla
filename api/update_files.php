<?php
/**
 * Update Files Script
 * 
 * This script will update the conflicting files with fixed versions
 * that don't have the function redeclaration problem
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Require admin authentication
require_once 'auth_admin.php';

// Function to update file
function updateFile($source, $destination) {
    if (file_exists($source) && is_readable($source)) {
        // Create backup of original file
        if (file_exists($destination)) {
            $backup = $destination . '.bak.' . date('YmdHis');
            if (!copy($destination, $backup)) {
                return "Failed to create backup of {$destination}";
            }
        }
        
        // Copy the fixed file
        if (copy($source, $destination)) {
            return "Successfully updated {$destination}";
        } else {
            return "Failed to update {$destination}";
        }
    } else {
        return "Source file {$source} does not exist or is not readable";
    }
}

// Files to update
$files = [
    'auth_admin_fixed.php' => 'auth_admin.php',
    'auth_api_fixed.php' => 'auth_api.php'
];

$results = [];

// Process update if confirmed
if (isset($_POST['confirm']) && $_POST['confirm'] === 'yes') {
    foreach ($files as $source => $destination) {
        $results[$destination] = updateFile($source, $destination);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Files</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .success { color: green; }
        .error { color: red; }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <h1>Update Files</h1>
    <p>This script will update the authentication files to fix the function redeclaration issue.</p>
    
    <?php if (!empty($results)): ?>
        <h2>Update Results</h2>
        <ul>
            <?php foreach ($results as $file => $result): ?>
                <li class="<?= strpos($result, 'Successfully') !== false ? 'success' : 'error' ?>">
                    <?= htmlspecialchars($result) ?>
                </li>
            <?php endforeach; ?>
        </ul>
        <p>Changes have been applied. Please <a href="/admin.html">try the admin dashboard</a> now.</p>
    <?php else: ?>
        <h2>Files to Update</h2>
        <ul>
            <?php foreach ($files as $source => $destination): ?>
                <li><?= htmlspecialchars($destination) ?></li>
            <?php endforeach; ?>
        </ul>
        
        <form method="post">
            <p><strong>Warning:</strong> This will modify your PHP files. Backups will be created automatically.</p>
            <input type="hidden" name="confirm" value="yes">
            <button type="submit">Update Files</button>
        </form>
    <?php endif; ?>
</body>
</html>
