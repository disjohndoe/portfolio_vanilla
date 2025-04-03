<?php
// Direct blog post API for individual posts - sits in root directory
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Get post ID from query string
$post_id = isset($_GET['id']) ? $_GET['id'] : '';

if (empty($post_id)) {
  // If no ID provided, return error
  http_response_code(400);
  echo json_encode(["error" => "No post ID provided"]);
  exit;
}

// Define blog data directory and file path
$blog_data_dir = __DIR__ . DIRECTORY_SEPARATOR . 'blog_data' . DIRECTORY_SEPARATOR;
$file_path = $blog_data_dir . $post_id . '.json';

if (!file_exists($file_path)) {
  // If post doesn't exist, return error
  http_response_code(404);
  echo json_encode(["error" => "Post not found"]);
  exit;
}

// Read the post file
$content = file_get_contents($file_path);
if ($content === false) {
  http_response_code(500);
  echo json_encode(["error" => "Failed to read post data"]);
  exit;
}

// Decode JSON
$post = json_decode($content, true);
if ($post === null) {
  http_response_code(500);
  echo json_encode(["error" => "Invalid post data format"]);
  exit;
}

// Check if post is published
if (!isset($post['published']) || $post['published'] !== true) {
  http_response_code(404);
  echo json_encode(["error" => "Post not found"]);
  exit;
}

// Return the post data
echo json_encode($post);
?>