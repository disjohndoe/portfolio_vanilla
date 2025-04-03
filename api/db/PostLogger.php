<?php
/**
 * Post Logger
 * 
 * Logs post changes and tracks sync status between admin and public versions
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';

class PostLogger {
    // Source locations
    const LOCATION_ADMIN = 'admin';  // posts/ directory
    const LOCATION_PUBLIC = 'public'; // blog_data/ directory
    
    // Action types
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_DELETE = 'delete';
    const ACTION_SYNC = 'sync';
    
    private $db;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Log a post operation
     * 
     * @param string $postId The post ID/filename
     * @param string $action The action performed (create, update, delete, sync)
     * @param string $location Where the action was performed (admin or public)
     * @param array|null $changes The changes made (before/after)
     * @return bool Whether the logging was successful
     */
    public function logPostOperation($postId, $action, $location, $changes = null) {
        try {
            // Prepare changes as JSON if provided
            $changesJson = $changes ? json_encode($changes, JSON_UNESCAPED_UNICODE) : null;
            
            // Get user info
            $userInfo = isset($_SERVER['PHP_AUTH_USER']) ? $_SERVER['PHP_AUTH_USER'] : 'unknown';
            
            // Get IP address
            $ipAddress = $this->getClientIP();
            
            // Insert log entry
            $query = "INSERT INTO posts_log (post_id, action, location, changes, user_info, ip_address) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            $params = [$postId, $action, $location, $changesJson, $userInfo, $ipAddress];
            
            $this->db->insert($query, $params);
            
            // Update sync status
            $this->updateSyncStatus($postId, $location, $action);
            
            return true;
        } catch (Exception $e) {
            error_log("Error logging post operation: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Update the sync status of a post
     * 
     * @param string $postId The post ID
     * @param string $location The location (admin or public)
     * @param string $action The action performed
     */
    private function updateSyncStatus($postId, $location, $action) {
        try {
            // Set the values to update based on location
            $adminUpdate = $location === self::LOCATION_ADMIN ? 'CURRENT_TIMESTAMP' : 'admin_version';
            $publicUpdate = $location === self::LOCATION_PUBLIC ? 'CURRENT_TIMESTAMP' : 'public_version';
            
            // If it's a delete action, set the timestamp to NULL
            if ($action === self::ACTION_DELETE) {
                if ($location === self::LOCATION_ADMIN) {
                    $adminUpdate = 'NULL';
                } else {
                    $publicUpdate = 'NULL';
                }
            }
            
            // Calculate if it's synced - both versions exist and admin version = public version
            $isSync = $action === self::ACTION_SYNC ? '1' : 
                    "IF($adminUpdate IS NOT NULL AND $publicUpdate IS NOT NULL, 
                        IF($adminUpdate = $publicUpdate, 1, 0), 
                        0)";
            
            // Insert or update the sync status
            $query = "INSERT INTO posts_sync (post_id, admin_version, public_version, is_synced) 
                      VALUES (?, $adminUpdate, $publicUpdate, $isSync)
                      ON DUPLICATE KEY UPDATE 
                      admin_version = $adminUpdate,
                      public_version = $publicUpdate,
                      is_synced = $isSync";
            
            $this->db->query($query, [$postId]);
        } catch (Exception $e) {
            error_log("Error updating sync status: " . $e->getMessage());
        }
    }
    
    /**
     * Get posts that need to be synced
     * 
     * @return array List of posts that need syncing
     */
    public function getOutOfSyncPosts() {
        try {
            $query = "SELECT * FROM posts_sync WHERE is_synced = 0";
            return $this->db->fetchAll($query);
        } catch (Exception $e) {
            error_log("Error getting out of sync posts: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get the history of a specific post
     * 
     * @param string $postId The post ID
     * @return array The post history
     */
    public function getPostHistory($postId) {
        try {
            $query = "SELECT * FROM posts_log WHERE post_id = ? ORDER BY created_at DESC";
            return $this->db->fetchAll($query, [$postId]);
        } catch (Exception $e) {
            error_log("Error getting post history: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get recent post activities
     * 
     * @param int $limit Number of entries to retrieve
     * @return array Recent activities
     */
    public function getRecentActivities($limit = 20) {
        try {
            $query = "SELECT * FROM posts_log ORDER BY created_at DESC LIMIT ?";
            return $this->db->fetchAll($query, [$limit]);
        } catch (Exception $e) {
            error_log("Error getting recent activities: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Mark a post as synced
     * 
     * @param string $postId The post ID
     * @return bool Whether the operation was successful
     */
    public function markAsSynced($postId) {
        try {
            // Log the sync operation
            $this->logPostOperation($postId, self::ACTION_SYNC, 'system');
            
            // Update sync status
            $query = "UPDATE posts_sync SET is_synced = 1 WHERE post_id = ?";
            $this->db->query($query, [$postId]);
            return true;
        } catch (Exception $e) {
            error_log("Error marking post as synced: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get the client's IP address
     * 
     * @return string The client IP address
     */
    private function getClientIP() {
        $headers = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 
                    'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
        
        foreach ($headers as $header) {
            if (isset($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}
