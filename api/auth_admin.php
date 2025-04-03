<?php
/**
 * Admin Authentication module
 * Protects admin interface with HTTP Basic Authentication
 * Includes brute force protection
 */

// Include the brute force protection class
require_once __DIR__ . '/login_protection/BruteForceProtection.php';

// Admin credentials (in a real-world scenario, store password securely hashed in a database)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'soft!ware3By4Matt5');

// Start session for CSRF protection
session_start();

// Initialize brute force protection
$bruteForceProtection = new BruteForceProtection();

// Function to require authentication and redirect if not authenticated
function requireAdminAuth() {
    global $bruteForceProtection;
    
    // Get client IP address
    $ip = getClientIP();
    
    // Check if IP is allowed to attempt login
    $checkResult = $bruteForceProtection->checkIP($ip);
    
    if (!$checkResult['allowed']) {
        // IP is currently blocked from attempting login
        header('HTTP/1.0 429 Too Many Requests');
        echo isset($checkResult['message']) ? $checkResult['message'] : 'Too many login attempts. Please try again later.';
        exit;
    }
    
    // Apply delay if needed (for progressive throttling)
    if (isset($checkResult['delay']) && $checkResult['delay'] > 0) {
        sleep($checkResult['delay']);
    }
    
    // Now check authentication
    if (!isAdminAuthenticated()) {
        // If credentials provided but invalid, record failed attempt
        if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
            $bruteForceProtection->recordFailedAttempt($ip, $_SERVER['PHP_AUTH_USER']);
        }
        
        header('WWW-Authenticate: Basic realm="Admin Access"');
        header('HTTP/1.0 401 Unauthorized');
        echo 'Authentication required';
        exit;
    }
    
    // If we get here, authentication succeeded
    $bruteForceProtection->recordSuccessfulLogin($ip, $_SERVER['PHP_AUTH_USER']);
}

// Check if user is authenticated
function isAdminAuthenticated() {
    // Check for valid basic auth credentials
    if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
        if ($_SERVER['PHP_AUTH_USER'] === ADMIN_USERNAME &&
            $_SERVER['PHP_AUTH_PW'] === ADMIN_PASSWORD) {
            return true;
        }
    }
    
    return false;
}

/**
 * Get the client's IP address
 * Handles proxy and forwarded headers
 * 
 * @return string The client IP address
 */
function getClientIP() {
    // Check for proxy addresses first
    $headers = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    
    foreach ($headers as $header) {
        if (isset($_SERVER[$header])) {
            // HTTP_X_FORWARDED_FOR can contain multiple IPs separated by comma
            $ips = explode(',', $_SERVER[$header]);
            $ip = trim($ips[0]);
            
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    
    // Default to REMOTE_ADDR if other headers are not available
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Check for CSRF token
function checkCsrfToken() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
            header('HTTP/1.1 403 Forbidden');
            echo 'CSRF token validation failed';
            exit;
        }
    }
}

// Generate a CSRF token and return it
function getCsrfToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Call this to ensure admin authentication
requireAdminAuth();

// Add CSRF token to global JavaScript variable for use in admin interface
$csrfToken = getCsrfToken();
