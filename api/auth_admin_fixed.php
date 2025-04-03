<?php
/**
 * Admin Authentication Module
 * Provides authentication for admin panel access
 */

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Include login protection
require_once __DIR__ . '/login_protection/BruteForceProtection.php';

// Load credentials from secure file
if (file_exists(__DIR__ . '/admin_credentials.php')) {
    require_once __DIR__ . '/admin_credentials.php';
} else {
    // Default credentials (CHANGE THESE IN PRODUCTION)
    define('ADMIN_USERNAME', 'admin');
    define('ADMIN_PASSWORD_HASH', password_hash('admin', PASSWORD_DEFAULT));
}

// CSRF token session variable name
if (!defined('CSRF_TOKEN_NAME')) {
    define('CSRF_TOKEN_NAME', 'blog_csrf_token');
}

// Initialize brute force protection
$bruteForceProtection = new BruteForceProtection();

// Check if user is authenticated
function isAuthenticated() {
    return isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;
}

// Set login cookie for persistent login
function setLoginCookie($username) {
    // Generate random token
    $token = bin2hex(random_bytes(32));
    
    // Create hash of token to store in database/file
    $tokenHash = hash('sha256', $token);
    
    // Store token hash (in a real system, you'd store this in a database)
    // For simplicity, we'll just use session for now
    $_SESSION['persistent_token_hash'] = $tokenHash;
    $_SESSION['persistent_username'] = $username;
    
    // Set token in cookie (expires in 30 days)
    setcookie(
        'admin_auth',
        $username . ':' . $token,
        time() + (86400 * 30), // 30 days
        '/',
        '', // Site domain (empty = current domain)
        true, // Secure (HTTPS only)
        true  // HttpOnly (not accessible via JavaScript)
    );
}

// Clear login cookie
function clearLoginCookie() {
    // Clear cookie by setting expiration in the past
    setcookie('admin_auth', '', time() - 3600, '/', '', true, true);
    
    // Clear persistent token from session
    unset($_SESSION['persistent_token_hash']);
    unset($_SESSION['persistent_username']);
}

// Generate CSRF token
function generateCsrfToken() {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION[CSRF_TOKEN_NAME];
}

// Validate CSRF token
function validateCsrfToken($token) {
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        return false;
    }
    
    return hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

// Get client IP address - MODIFIED with function_exists check
if (!function_exists('getClientIP')) {
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
}

// Authenticate admin users
function authenticateAdmin($username, $password) {
    global $bruteForceProtection;
    
    // Get client IP address
    $ip = getClientIP();
    
    // Check if IP is allowed to attempt login
    $checkResult = $bruteForceProtection->checkIP($ip);
    
    if (!$checkResult['allowed']) {
        // IP is currently blocked
        return [
            'success' => false,
            'message' => isset($checkResult['message']) ? $checkResult['message'] : 'Too many failed attempts. Please try again later.'
        ];
    }
    
    // Apply delay if needed (for progressive throttling)
    if (isset($checkResult['delay']) && $checkResult['delay'] > 0) {
        sleep($checkResult['delay']);
    }
    
    // Validate credentials
    $authenticated = false;
    
    // Check username
    if ($username === ADMIN_USERNAME) {
        // Verify password
        if (password_verify($password, ADMIN_PASSWORD_HASH)) {
            $authenticated = true;
        }
    }
    
    // Record authentication result
    if ($authenticated) {
        $bruteForceProtection->recordSuccessfulLogin($ip, $username);
        
        // Set session
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_username'] = $username;
        
        // Generate CSRF token
        generateCsrfToken();
        
        return [
            'success' => true,
            'csrf_token' => $_SESSION[CSRF_TOKEN_NAME]
        ];
    } else {
        $bruteForceProtection->recordFailedAttempt($ip, $username);
        
        return [
            'success' => false,
            'message' => 'Invalid username or password'
        ];
    }
}

// Check if we should redirect to login page
$isLoginPage = basename($_SERVER['SCRIPT_NAME']) === 'admin_auth.php';

if (!$isLoginPage && !isAuthenticated()) {
    // Redirect to login page
    header('Location: admin_auth.php');
    exit;
}
