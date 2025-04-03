<?php
/**
 * API Token Generator
 * This file handles API token generation for authenticated users
 */

// Include necessary files
require_once 'security.php';
require_once 'auth_api.php';

// Set proper CORS headers
$allowed_origins = [
    'http://localhost:8000',
    'https://softwarebymatt.com',
    'https://www.softwarebymatt.com'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    // If not from allowed origin, set a default safe value
    header("Access-Control-Allow-Origin: https://softwarebymatt.com");
}

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-CSRF-Token");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Get and validate request data
$data = safeJsonDecode(file_get_contents('php://input'));

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid request format"]);
    exit;
}

// Verify credentials
if ($data['username'] === API_USERNAME && $data['password'] === API_PASSWORD) {
    // Generate token
    $token = generateApiToken();
    
    // Return success response
    echo json_encode([
        "token" => $token,
        "expires" => "never" // In production, set an expiration time
    ]);
} else {
    // Return error for invalid credentials
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
}
