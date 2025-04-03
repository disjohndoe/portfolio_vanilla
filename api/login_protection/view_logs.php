<?php
/**
 * Login Attempts Log Viewer
 * 
 * This script provides a simple interface to view login attempt logs
 * Only accessible to authenticated admins
 */

// Require admin authentication
require_once '../auth_admin.php';

// Define log file path
$logFile = __DIR__ . '/data/login_attempts.log';
$attemptsFile = __DIR__ . '/data/attempts.json';

// Function to get locked IPs
function getLockedIPs() {
    global $attemptsFile;
    
    if (!file_exists($attemptsFile)) {
        return [];
    }
    
    $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
    $currentTime = time();
    $lockedIPs = [];
    
    foreach ($attempts as $ip => $data) {
        if (isset($data['lockout_until']) && $data['lockout_until'] > $currentTime) {
            $lockedIPs[$ip] = [
                'until' => date('Y-m-d H:i:s', $data['lockout_until']),
                'remaining' => ceil(($data['lockout_until'] - $currentTime) / 60) . ' minutes'
            ];
        }
    }
    
    return $lockedIPs;
}

// Get log data
$logEntries = file_exists($logFile) ? file($logFile) : [];
$lockedIPs = getLockedIPs();

// Optional action to clear logs
if (isset($_GET['action']) && $_GET['action'] === 'clear' && isset($_GET['csrf_token']) && $_GET['csrf_token'] === $_SESSION['csrf_token']) {
    if (file_exists($logFile)) {
        file_put_contents($logFile, '');
    }
    
    // Redirect to avoid resubmission
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// HTML output
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Attempts Log</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        h1, h2 {
            color: #444;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .status-FAILED {
            color: #e74c3c;
        }
        .status-SUCCESS {
            color: #2ecc71;
        }
        .status-LOCKOUT {
            color: #e67e22;
            font-weight: bold;
        }
        .actions {
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .alert {
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid transparent;
            border-radius: 4px;
        }
        .alert-warning {
            color: #8a6d3b;
            background-color: #fcf8e3;
            border-color: #faebcc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Login Attempts Log</h1>
        
        <div class="actions">
            <a href="?action=clear&csrf_token=<?php echo $_SESSION['csrf_token']; ?>" class="btn" onclick="return confirm('Are you sure you want to clear the logs?');">Clear Logs</a>
            <a href="../../admin.html" class="btn">Back to Admin</a>
        </div>
        
        <?php if (!empty($lockedIPs)): ?>
            <h2>Currently Locked IPs</h2>
            <table>
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>Locked Until</th>
                        <th>Time Remaining</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($lockedIPs as $ip => $lockInfo): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($ip); ?></td>
                            <td><?php echo htmlspecialchars($lockInfo['until']); ?></td>
                            <td><?php echo htmlspecialchars($lockInfo['remaining']); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        
        <h2>Recent Login Attempts</h2>
        <?php if (empty($logEntries)): ?>
            <p>No login attempts recorded.</p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>Date/Time</th>
                        <th>IP Address</th>
                        <th>Username</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php 
                    // Display most recent entries first
                    $logEntries = array_reverse($logEntries);
                    foreach ($logEntries as $entry): 
                        // Parse log entry [timestamp] IP: x.x.x.x, Username: xxx, Status: xxx
                        if (preg_match('/\[(.*?)\] IP: (.*?), Username: (.*?), Status: (.*)/', $entry, $matches)) {
                            $timestamp = $matches[1];
                            $ip = $matches[2];
                            $username = $matches[3];
                            $status = trim($matches[4]);
                    ?>
                        <tr>
                            <td><?php echo htmlspecialchars($timestamp); ?></td>
                            <td><?php echo htmlspecialchars($ip); ?></td>
                            <td><?php echo htmlspecialchars($username); ?></td>
                            <td class="status-<?php echo htmlspecialchars($status); ?>"><?php echo htmlspecialchars($status); ?></td>
                        </tr>
                    <?php 
                        }
                    endforeach; 
                    ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>
