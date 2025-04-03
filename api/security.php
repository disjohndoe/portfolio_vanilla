<?php
/**
 * Security utility functions
 * Provides functions for input validation, sanitization, and output escaping
 */

/**
 * Sanitize a string for output to prevent XSS attacks
 * 
 * @param string $string The string to sanitize
 * @return string The sanitized string
 */
function sanitizeOutput($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Sanitize an array of data for output
 * 
 * @param array $data The array to sanitize
 * @return array The sanitized array
 */
function sanitizeArrayOutput($data) {
    if (!is_array($data)) {
        return sanitizeOutput($data);
    }
    
    $sanitized = [];
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $sanitized[$key] = sanitizeArrayOutput($value);
        } else {
            $sanitized[$key] = sanitizeOutput($value);
        }
    }
    
    return $sanitized;
}

/**
 * Safely decode JSON with error handling
 * 
 * @param string $json The JSON string to decode
 * @param bool $associative Whether to return as associative array (true) or object (false)
 * @return mixed The decoded data or null on error
 */
function safeJsonDecode($json, $associative = true) {
    $data = json_decode($json, $associative);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('JSON decode error: ' . json_last_error_msg());
        return null;
    }
    
    return $data;
}

/**
 * Validate that all required fields are present in a data array
 * 
 * @param array $data The data to validate
 * @param array $requiredFields Array of required field names
 * @return bool Whether all required fields are present
 */
function validateRequiredFields($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return false;
        }
    }
    
    return true;
}

/**
 * Clean and sanitize user input for storage
 * 
 * @param string $input The input to sanitize
 * @return string The sanitized input
 */
function sanitizeInput($input) {
    // Remove potentially dangerous characters
    $input = filter_var($input, FILTER_SANITIZE_STRING);
    // Remove any HTML tags
    $input = strip_tags($input);
    // Trim whitespace
    $input = trim($input);
    
    return $input;
}

/**
 * Sanitize an array of user input data
 * 
 * @param array $data The array to sanitize
 * @return array The sanitized array
 */
function sanitizeArrayInput($data) {
    if (!is_array($data)) {
        return sanitizeInput($data);
    }
    
    $sanitized = [];
    foreach ($data as $key => $value) {
        if (is_array($value)) {
            $sanitized[$key] = sanitizeArrayInput($value);
        } else {
            $sanitized[$key] = sanitizeInput($value);
        }
    }
    
    return $sanitized;
}

/**
 * Validate and sanitize a URL
 * 
 * @param string $url The URL to validate
 * @return string|false The sanitized URL or false if invalid
 */
function validateUrl($url) {
    $url = filter_var($url, FILTER_SANITIZE_URL);
    if (filter_var($url, FILTER_VALIDATE_URL)) {
        return $url;
    }
    
    return false;
}
