<?php
// Simple API test that doesn't require routing through index.php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Define blog data directory
$base_path = dirname(__DIR__) . DIRECTORY_SEPARATOR;
$blog_data_dir = $base_path . 'blog_data' . DIRECTORY_SEPARATOR;

// Basic info
$info = [
  "status" => "ok",
  "message" => "API test endpoint is working",
  "blog_data_path" => $blog_data_dir,
  "blog_data_exists" => file_exists($blog_data_dir) ? "yes" : "no",
  "blog_data_readable" => is_readable($blog_data_dir) ? "yes" : "no",
  "php_version" => PHP_VERSION
];

// Try to count JSON files
if (file_exists($blog_data_dir) && is_readable($blog_data_dir)) {
  $files = glob($blog_data_dir . '*.json');
  $info["json_files_count"] = count($files);
  $info["json_files"] = array_map('basename', $files);
}

echo json_encode($info, JSON_PRETTY_PRINT);
?>