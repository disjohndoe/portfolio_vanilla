<?php
/**
 * API Authentication module
 * Provides functions for API authentication with brute force protection
 */

// Include the brute force protection class
require_once __DIR__ . '/login_protection/BruteForceProtection.php';

// API credentials (in a real-world scenario, store these securely, not in code)
// You should change these to strong values after testing
define('API_USERNAME', 'admin');
define('API_PASSWORD', 'soft!ware3By4Matt5');
define('API_TOKEN_SECRET', 'your-secret-key-change-this');

// CSRF token session variable name
define('CSRF_TOKEN_NAME', 'blog_csrf_token');

// Initialize brute force protection
$apiBruteForceProtection = new BruteForceProtection();

/**
 * Check if the current request is authenticated via API key
 * Includes brute force protection
 * 
 * @return bool Whether the request is authenticated
 */
function isApiAuthenticated() {
    global $apiBruteForceProtection;
    
    // Get client IP address
    $ip = getClientIP();
    
    // Check if IP is allowed to attempt auth
    $checkResult = $apiBruteForceProtection->checkIP($ip);
    
    if (!$checkResult['allowed']) {
        // IP is currently blocked
        header('HTTP/1.0 429 Too Many Requests');
        echo json_encode([
            'success' => false,
            'message' => isset($checkResult['message']) ? $checkResult['message'] : 'Too many failed attempts. Please try again later.'
        ]);
        exit;
    }
    
    // Apply delay if needed (for progressive throttling)
    if (isset($checkResult['delay']) && $checkResult['delay'] > 0) {
        sleep($checkResult['delay']);
    }
    
    $authenticated = false;
    $username = 'unknown';
    
    // Check for API key in header (preferred method)
    $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $authenticated = validateApiToken($token);
        $username = 'token-auth';
    }
    
    // Alternative: check for token in query string (less secure but useful for testing)
    if (!$authenticated && isset($_GET['api_token'])) {
        $authenticated = validateApiToken($_GET['api_token']);
        $username = 'token-auth';
    }
    
    // Alternative: check for HTTP Basic Auth
    if (!$authenticated && isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
        $username = $_SERVER['PHP_AUTH_USER'];
        $authenticated = ($username === API_USERNAME && $_SERVER['PHP_AUTH_PW'] === API_PASSWORD);
    }
    
    // Record the authentication result
    if ($authenticated) {
        $apiBruteForceProtection->recordSuccessfulLogin($ip, $username);
    } else {
        $apiBruteForceProtection->recordFailedAttempt($ip, $username);
    }
    
    return $authenticated;
}

/**
 * Get the client's IP address
 * Handles proxy and forwarded headers
 * 
 * @return string The client IP address
 */
// MODIFIED with function_exists check
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

/**
 * Validate an API token
 * 
 * @param string $token The token to validate
 * @return bool Whether the token is valid
 */
function validateApiToken($token) {
    // In a real-world scenario, you would validate against a database or token store
    // For simplicity, we'll use a static token generated from username/password
    $expectedToken = hash_hmac('sha256', API_USERNAME . API_PASSWORD, API_TOKEN_SECRET);
    
    return hash_equals($expectedToken, $token);
}

/**
 * Generate an API token
 * 
 * @return string The generated token
 */
function generateApiToken() {
    return hash_hmac('sha256', API_USERNAME . API_PASSWORD, API_TOKEN_SECRET);
}

/**
 * Generate a CSRF token
 * 
 * @return string The generated CSRF token
 */
function generateCsrfToken() {
    if (!session_id()) {
        session_start();
    }
    
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION[CSRF_TOKEN_NAME];
}

/**
 * Validate a CSRF token
 * 
 * @param string $token The token to validate
 * @return bool Whether the token is valid
 */
function validateCsrfToken($token) {
    if (!session_id()) {
        session_start();
    }
    
    if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
        return false;
    }
    
    return hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}
