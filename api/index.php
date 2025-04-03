<?php
// Enable error reporting for debugging (consider disabling in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors to end users

// Include security and authentication modules
require_once 'security.php';
require_once 'auth_api.php';

// Set proper CORS headers (restrict to your domain in production)
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

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, X-CSRF-Token");
header("Content-Type: application/json; charset=UTF-8");

// Write to debug log (ensure log file is not accessible from web)
function debug_log($message) {
    $log_file = __DIR__ . '/logs/debug.log';
    // Create logs directory if it doesn't exist
    if (!file_exists(dirname($log_file))) {
        mkdir(dirname($log_file), 0755, true);
    }
    file_put_contents($log_file, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
    // Also write to PHP error log
    error_log($message);
}

debug_log("Request received: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Define blog data directory with absolute path
$base_path = dirname(__DIR__) . DIRECTORY_SEPARATOR;
define('BLOG_DATA_DIR', $base_path . 'blog_data' . DIRECTORY_SEPARATOR);
define('BLOG_IMAGES_DIR', BLOG_DATA_DIR . 'images' . DIRECTORY_SEPARATOR);

debug_log("Blog data directory: " . BLOG_DATA_DIR);

// Create directories if they don't exist
if (!file_exists(BLOG_DATA_DIR)) {
    debug_log("Creating blog data directory");
    mkdir(BLOG_DATA_DIR, 0755, true);
}
if (!file_exists(BLOG_IMAGES_DIR)) {
    debug_log("Creating blog images directory");
    mkdir(BLOG_IMAGES_DIR, 0755, true);
}

// Parse the request path
$request_uri = $_SERVER['REQUEST_URI'];
debug_log("Full request URI: " . $request_uri);

$path = parse_url($request_uri, PHP_URL_PATH);
debug_log("Parsed path: " . $path);

$path_parts = explode('/', trim($path, '/'));
debug_log("Path parts: " . json_encode($path_parts));

// Remove 'api' from path parts if present
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

// Route the request to the appropriate handler
$resource = isset($path_parts[0]) ? $path_parts[0] : '';
$id = isset($path_parts[1]) ? $path_parts[1] : '';

// Public endpoint handlers (no authentication required)
if ($resource === 'posts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once 'posts.php';
    exit;
}

// All other endpoints require authentication
// We already included auth_api.php at the top, so isApiAuthenticated is available
if (!isApiAuthenticated() && !in_array($resource, ['auth', 'token'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access"]);
    exit;
}

// Handle request based on method and resource
switch ($resource) {
    case 'posts':
        require_once 'posts.php';
        break;
    case 'upload':
        require_once 'upload.php';
        break;
    case 'token':
        // Generate an API token - this endpoint should be secured in production
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = safeJsonDecode(file_get_contents('php://input'));
            if ($data && isset($data['username']) && isset($data['password'])) {
                if ($data['username'] === API_USERNAME && $data['password'] === API_PASSWORD) {
                    echo json_encode([
                        "token" => generateApiToken(),
                        "expires" => "never" // In production, set an expiration time
                    ]);
                } else {
                    http_response_code(401);
                    echo json_encode(["error" => "Invalid credentials"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid request format"]);
            }
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;
    default:
        // Return 404 for invalid endpoints
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
        break;
}
