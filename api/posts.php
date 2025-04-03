<?php
// Include security functions if not already included
if (!function_exists('sanitizeOutput')) {
    require_once 'security.php';
}

// Include the post logger
require_once __DIR__ . '/db/config.php';
require_once __DIR__ . '/db/Database.php';
require_once __DIR__ . '/db/PostLogger.php';

// Initialize the post logger
$postLogger = new PostLogger();

// Common functions for posts
function load_posts() {
    debug_log("Loading posts from directory: " . BLOG_DATA_DIR);
    $posts = [];
    
    // Check if the directory exists
    if (!file_exists(BLOG_DATA_DIR)) {
        debug_log("Blog data directory does not exist");
        return $posts;
    }
    
    // Check if the directory is readable
    if (!is_readable(BLOG_DATA_DIR)) {
        debug_log("Blog data directory is not readable");
        return $posts;
    }

    // Securely list only JSON files, prevent directory traversal
    $pattern = BLOG_DATA_DIR . '*.json';
    $files = glob($pattern);
    debug_log("Found " . count($files) . " post files");
    
    if (empty($files)) {
        debug_log("No post files found in: " . BLOG_DATA_DIR);
        // Return empty array instead of failing
        return $posts;
    }
    
    foreach ($files as $file) {
        // Validate file is within allowed directory
        if (strpos(realpath($file), realpath(BLOG_DATA_DIR)) !== 0) {
            debug_log("Security warning: Attempted to access file outside blog data directory: " . $file);
            continue;
        }
        
        debug_log("Reading file: " . $file);
        $content = file_get_contents($file);
        
        if (!$content) {
            debug_log("Error reading file: " . $file);
            continue;
        }
        
        // Use safe JSON decoding with error handling
        $post_data = safeJsonDecode($content);
        if ($post_data) {
            $posts[] = $post_data;
        } else {
            debug_log("Error decoding JSON in file: " . $file . ", JSON error: " . json_last_error_msg());
        }
    }

    // Sort posts by date (newest first)
    usort($posts, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    return $posts;
}

function save_post($post) {
    global $postLogger;
    
    // Validate post ID format to prevent directory traversal
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $post['id'])) {
        debug_log("Invalid post ID format: " . $post['id']);
        return false;
    }
    
    // Sanitize post data before saving
    $sanitized_post = $post;
    
    // Ensure required fields exist
    if (!isset($sanitized_post['title']) || !isset($sanitized_post['content'])) {
        debug_log("Missing required fields in post");
        return false;
    }
    
    $file_path = BLOG_DATA_DIR . $sanitized_post['id'] . '.json';
    
    // Verify the resulting path is within the blog data directory
    if (strpos(realpath(dirname($file_path)), realpath(BLOG_DATA_DIR)) !== 0) {
        debug_log("Security warning: Attempted to save file outside blog data directory: " . $file_path);
        return false;
    }
    
    // Check if this is an update or a new post by looking for the existing file
    $action = file_exists($file_path) ? PostLogger::ACTION_UPDATE : PostLogger::ACTION_CREATE;
    
    // For updates, capture the before state
    $before = null;
    if ($action === PostLogger::ACTION_UPDATE) {
        $before = json_decode(file_get_contents($file_path), true);
    }
    
    // Save the post
    $success = file_put_contents($file_path, json_encode($sanitized_post, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($success) {
        // Log the operation
        $changes = $action === PostLogger::ACTION_UPDATE ? ['before' => $before, 'after' => $sanitized_post] : $sanitized_post;
        $postLogger->logPostOperation($post['id'], $action, PostLogger::LOCATION_ADMIN, $changes);
        
        return $sanitized_post;
    }
    
    return false;
}

function delete_post($post_id) {
    global $postLogger;
    
    // Validate post ID format to prevent directory traversal
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $post_id)) {
        debug_log("Invalid post ID format: " . $post_id);
        return false;
    }
    
    $file_path = BLOG_DATA_DIR . $post_id . '.json';
    
    // Verify the file path is within the blog data directory
    if (strpos(realpath(dirname($file_path)), realpath(BLOG_DATA_DIR)) !== 0) {
        debug_log("Security warning: Attempted to delete file outside blog data directory: " . $file_path);
        return false;
    }
    
    if (file_exists($file_path)) {
        // Capture the post data before deleting
        $post_data = json_decode(file_get_contents($file_path), true);
        
        // Delete the file
        unlink($file_path);
        
        // Log the deletion
        $postLogger->logPostOperation($post_id, PostLogger::ACTION_DELETE, PostLogger::LOCATION_ADMIN, $post_data);
        
        return true;
    }
    return false;
}

function get_post_by_id($post_id) {
    // Validate post ID format to prevent directory traversal
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $post_id)) {
        debug_log("Invalid post ID format: " . $post_id);
        return null;
    }
    
    $file_path = BLOG_DATA_DIR . $post_id . '.json';
    
    // Verify the file path is within the blog data directory
    if (strpos(realpath(dirname($file_path)), realpath(BLOG_DATA_DIR)) !== 0) {
        debug_log("Security warning: Attempted to access file outside blog data directory: " . $file_path);
        return null;
    }
    
    if (file_exists($file_path)) {
        $content = file_get_contents($file_path);
        return safeJsonDecode($content);
    }
    return null;
}

// Get query parameters
$admin = isset($_GET['admin']) && $_GET['admin'] === 'true';

// Check CSRF token for non-GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && function_exists('validateCsrfToken')) {
    // Get token from header or request body
    $headers = getallheaders();
    $csrfToken = isset($headers['X-CSRF-Token']) ? $headers['X-CSRF-Token'] : null;
    
    if (!$csrfToken && isset($_POST['csrf_token'])) {
        $csrfToken = $_POST['csrf_token'];
    }
    
    if (!$csrfToken) {
        $data = safeJsonDecode(file_get_contents('php://input'));
        if ($data && isset($data['csrf_token'])) {
            $csrfToken = $data['csrf_token'];
        }
    }
    
    if (!$csrfToken || !validateCsrfToken($csrfToken)) {
        http_response_code(403);
        echo json_encode(["error" => "CSRF token validation failed"]);
        exit;
    }
}

// Check for missing variables
if (!isset($id)) {
    debug_log("Error: ID variable not defined");
    $id = '';
}

// Handle request based on method and if ID is provided
if (empty($id)) {
    // Collection endpoint (all posts)
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all posts
            $posts = load_posts();
            
            // Filter out unpublished posts if not admin
            if (!$admin) {
                $posts = array_filter($posts, function($post) {
                    return isset($post['published']) && $post['published'] === true;
                });
                // Re-index array
                $posts = array_values($posts);
            }
            
            // Sanitize output
            $sanitized_posts = sanitizeArrayOutput($posts);
            echo json_encode($sanitized_posts);
            break;
            
        case 'POST':
            // Authentication check already done in index.php
            
            // Create new post
            $data = safeJsonDecode(file_get_contents('php://input'));
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid request data"]);
                break;
            }
            
            // Sanitize input data
            $data = sanitizeArrayInput($data);
            
            // Validate required fields
            if (!validateRequiredFields($data, ['title', 'content', 'excerpt'])) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required fields"]);
                break;
            }
            
            // Generate ID if not provided
            if (!isset($data['id'])) {
                $data['id'] = uniqid();
            }
            
            // Set creation date if not provided
            if (!isset($data['date'])) {
                $data['date'] = date('c'); // ISO 8601 format
            }
            
            // Validate image URL if provided
            if (isset($data['image']) && !empty($data['image'])) {
                $validatedUrl = validateUrl($data['image']);
                if ($validatedUrl === false) {
                    $data['image'] = ''; // Clear invalid URL
                } else {
                    $data['image'] = $validatedUrl;
                }
            }
            
            // Save post
            $post = save_post($data);
            
            if ($post === false) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to save post"]);
                break;
            }
            
            http_response_code(201); // Created
            echo json_encode($post);
            break;
            
        default:
            http_response_code(405); // Method Not Allowed
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }
} else {
    // Item endpoint (single post)
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get single post
            $post = get_post_by_id($id);
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
                break;
            }
            
            // Check if post is published or admin request
            if (!$admin && (!isset($post['published']) || $post['published'] !== true)) {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
                break;
            }
            
            // Sanitize output
            $sanitized_post = sanitizeArrayOutput($post);
            echo json_encode($sanitized_post);
            break;
            
        case 'PUT':
            // Authentication check already done in index.php
            
            // Update post
            $data = safeJsonDecode(file_get_contents('php://input'));
            
            if (!$data) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid request data"]);
                break;
            }
            
            // Sanitize input data
            $data = sanitizeArrayInput($data);
            
            $post = get_post_by_id($id);
            
            if (!$post) {
                http_response_code(404);
                echo json_encode(["error" => "Post not found"]);
                break;
            }
            
            // Update post fields
            foreach ($data as $key => $value) {
                // Skip updating the ID field
                if ($key !== 'id') {
                    $post[$key] = $value;
                }
            }
            
            // Ensure ID doesn't change
            $post['id'] = $id;
            
            // Validate image URL if provided
            if (isset($post['image']) && !empty($post['image'])) {
                $validatedUrl = validateUrl($post['image']);
                if ($validatedUrl === false) {
                    $post['image'] = ''; // Clear invalid URL
                } else {
                    $post['image'] = $validatedUrl;
                }
            }
            
            // Save updated post
            $updated_post = save_post($post);
            
            if ($updated_post === false) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to update post"]);
                break;
            }
            
            echo json_encode($updated_post);
            break;
            
        case 'DELETE':
            // Authentication check already done in index.php
            
            if (delete_post($id)) {
                echo json_encode(["success" => true]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Post not found or could not be deleted"]);
            }
            break;
            
        default:
            http_response_code(405); // Method Not Allowed
            echo json_encode(["error" => "Method not allowed"]);
            break;
    }
}
