<?php
/**
 * Direct Single Post API with Debugging
 * A simple endpoint to get a single post by ID with detailed error reporting
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Store debug info
$debug = [];
$debug['time'] = date('Y-m-d H:i:s');
$debug['request_uri'] = $_SERVER['REQUEST_URI'];
$debug['request_method'] = $_SERVER['REQUEST_METHOD'];
$debug['query_string'] = $_SERVER['QUERY_STRING']