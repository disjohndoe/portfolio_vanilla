<?php
/**
 * Dummy Post Logger
 * 
 * A simplified version of PostLogger that doesn't require a database connection
 * Use this for local development when you don't need the full logging functionality
 */

class PostLogger {
    // Source locations
    const LOCATION_ADMIN = 'admin';  // posts/ directory
    const LOCATION_PUBLIC = 'public'; // blog_data/ directory
    
    // Action types
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_DELETE = 'delete';
    const ACTION_SYNC = 'sync';
    
    /**
     * Constructor
     */
    public function __construct() {
        // No database connection needed
    }
    
    /**
     * Log a post operation (dummy implementation)
     */
    public function logPostOperation($postId, $action, $location, $changes = null) {
        // Simply log to error_log for development purposes
        error_log("Post operation: $postId, $action, $location");
        return true;
    }
    
    /**
     * Get posts that need to be synced (dummy implementation)
     */
    public function getOutOfSyncPosts() {
        return [];
    }
    
    /**
     * Get the history of a specific post (dummy implementation)
     */
    public function getPostHistory($postId) {
        return [];
    }
    
    /**
     * Get recent post activities (dummy implementation)
     */
    public function getRecentActivities($limit = 20) {
        return [];
    }
    
    /**
     * Mark a post as synced (dummy implementation)
     */
    public function markAsSynced($postId) {
        return true;
    }
}
