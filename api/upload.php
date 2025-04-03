<?php
// Handle file uploads for blog posts

// Check authentication first
require_once 'auth_api.php';
if (!isApiAuthenticated()) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized access"]);
    exit;
}

// The BLOG_IMAGES_DIR constant should be defined elsewhere
if (!defined('BLOG_IMAGES_DIR')) {
    define('BLOG_IMAGES_DIR', dirname(__DIR__) . '/blog_data/images/');
    
    // Ensure the directory exists
    if (!file_exists(BLOG_IMAGES_DIR)) {
        mkdir(BLOG_IMAGES_DIR, 0755, true);
    }
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Check if a file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "No file uploaded or upload error"]);
    exit;
}

// Whitelist of allowed file extensions and MIME types
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$allowed_mime_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Get file information
$file_extension = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
$file_mime_type = mime_content_type($_FILES['file']['tmp_name']);

// Validate file extension
if (!in_array($file_extension, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(["error" => "File type not allowed. Allowed types: " . implode(', ', $allowed_extensions)]);
    exit;
}

// Validate MIME type
if (!in_array($file_mime_type, $allowed_mime_types)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid file format. Allowed formats: images only"]);
    exit;
}

// Check if the file is an image using getimagesize
$file_info = getimagesize($_FILES['file']['tmp_name']);
if ($file_info === false) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Uploaded file is not a valid image"]);
    exit;
}

// Generate a unique filename with safe extension
$filename = uniqid() . '.' . $file_extension;
$file_path = BLOG_IMAGES_DIR . $filename;

// Move the uploaded file to the destination directory
if (move_uploaded_file($_FILES['file']['tmp_name'], $file_path)) {
    // Return the URL to the uploaded file
    echo json_encode([
        "filename" => $filename,
        "url" => "/blog_data/images/" . $filename
    ]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(["error" => "Failed to save uploaded file"]);
}
