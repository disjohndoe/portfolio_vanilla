<?php
/**
 * Brute Force Protection
 * 
 * This class provides brute force protection for login attempts
 * by tracking failed attempts and implementing throttling mechanisms.
 */

class BruteForceProtection {
    private $logFile;
    private $attemptsFile;
    private $maxAttempts = 5;
    private $lockoutTime = 1800; // 30 minutes in seconds
    private $attemptWindow = 3600; // 1 hour window to count attempts
    
    public function __construct() {
        $dir = __DIR__ . '/data';
        
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $this->logFile = $dir . '/login_attempts.log';
        $this->attemptsFile = $dir . '/attempts.json';
        
        // Create files if they don't exist
        if (!file_exists($this->logFile)) {
            file_put_contents($this->logFile, '');
            chmod($this->logFile, 0644);
        }
        
        if (!file_exists($this->attemptsFile)) {
            file_put_contents($this->attemptsFile, json_encode([]));
            chmod($this->attemptsFile, 0644);
        }
    }
    
    /**
     * Check if an IP is currently allowed to attempt login
     *
     * @param string $ip The IP address to check
     * @return array Status of the check with any delay recommendation
     */
    public function checkIP($ip) {
        $attempts = $this->getAttempts();
        $currentTime = time();
        
        // Clean up old attempt records
        $this->cleanupAttempts();
        
        // If IP is not in the records, they're allowed
        if (!isset($attempts[$ip])) {
            return ['allowed' => true, 'delay' => 0];
        }
        
        $ipData = $attempts[$ip];
        
        // Check if IP is locked out
        if (isset($ipData['lockout_until']) && $ipData['lockout_until'] > $currentTime) {
            $remainingTime = $ipData['lockout_until'] - $currentTime;
            return [
                'allowed' => false, 
                'delay' => 0,
                'message' => "Too many failed attempts. Try again in " . ceil($remainingTime / 60) . " minutes.",
                'remaining' => $remainingTime
            ];
        }
        
        // Calculate progressive delay based on number of attempts
        $delay = 0;
        $attemptCount = count($ipData['attempts']);
        if ($attemptCount > 0) {
            // Exponential backoff: 0, 1, 2, 4, 8... seconds
            $delay = $attemptCount <= 1 ? 0 : pow(2, $attemptCount - 2);
            
            // Cap the delay at 8 seconds
            $delay = min($delay, 8);
            
            // If their last attempt was very recent, enforce the delay
            $lastAttempt = max($ipData['attempts']);
            $timeSinceLast = $currentTime - $lastAttempt;
            
            if ($timeSinceLast < $delay) {
                return [
                    'allowed' => false,
                    'delay' => $delay - $timeSinceLast,
                    'message' => "Please wait before trying again."
                ];
            }
        }
        
        return ['allowed' => true, 'delay' => $delay];
    }
    
    /**
     * Record a failed login attempt
     *
     * @param string $ip The IP address that failed
     * @param string $username The attempted username
     * @return void
     */
    public function recordFailedAttempt($ip, $username) {
        $attempts = $this->getAttempts();
        $currentTime = time();
        
        // Initialize IP record if it doesn't exist
        if (!isset($attempts[$ip])) {
            $attempts[$ip] = [
                'attempts' => [],
                'lockout_until' => 0
            ];
        }
        
        // Add current attempt timestamp
        $attempts[$ip]['attempts'][] = $currentTime;
        
        // Check if max attempts reached within window
        $recentAttempts = array_filter($attempts[$ip]['attempts'], function($timestamp) use ($currentTime) {
            return ($currentTime - $timestamp) < $this->attemptWindow;
        });
        
        if (count($recentAttempts) >= $this->maxAttempts) {
            // Lockout this IP
            $attempts[$ip]['lockout_until'] = $currentTime + $this->lockoutTime;
            
            // Log the lockout
            $this->logAttempt($ip, $username, 'LOCKOUT');
        } else {
            // Log the failed attempt
            $this->logAttempt($ip, $username, 'FAILED');
        }
        
        // Save updated attempts
        $this->saveAttempts($attempts);
    }
    
    /**
     * Record a successful login
     *
     * @param string $ip The IP address
     * @param string $username The username
     * @return void
     */
    public function recordSuccessfulLogin($ip, $username) {
        // Log the successful attempt
        $this->logAttempt($ip, $username, 'SUCCESS');
        
        // Clean up failed attempts for this IP - they've proven they know the password
        $attempts = $this->getAttempts();
        if (isset($attempts[$ip])) {
            unset($attempts[$ip]);
            $this->saveAttempts($attempts);
        }
    }
    
    /**
     * Clean up old attempt records
     *
     * @return void
     */
    private function cleanupAttempts() {
        $attempts = $this->getAttempts();
        $currentTime = time();
        $cutoffTime = $currentTime - $this->attemptWindow;
        
        foreach ($attempts as $ip => &$data) {
            // Remove attempts older than the window
            $data['attempts'] = array_filter($data['attempts'], function($timestamp) use ($cutoffTime) {
                return $timestamp > $cutoffTime;
            });
            
            // If no recent attempts and not locked out, remove the IP entirely
            if (empty($data['attempts']) && (!isset($data['lockout_until']) || $data['lockout_until'] < $currentTime)) {
                unset($attempts[$ip]);
            }
        }
        
        $this->saveAttempts($attempts);
    }
    
    /**
     * Get current attempts data
     *
     * @return array The attempts data
     */
    private function getAttempts() {
        $data = file_get_contents($this->attemptsFile);
        return json_decode($data, true) ?: [];
    }
    
    /**
     * Save attempts data
     *
     * @param array $attempts The attempts data to save
     * @return void
     */
    private function saveAttempts($attempts) {
        file_put_contents($this->attemptsFile, json_encode($attempts));
    }
    
    /**
     * Log an authentication attempt
     *
     * @param string $ip The IP address
     * @param string $username The attempted username
     * @param string $status The status of the attempt
     * @return void
     */
    private function logAttempt($ip, $username, $status) {
        $time = date('Y-m-d H:i:s');
        $logEntry = "[$time] IP: $ip, Username: $username, Status: $status" . PHP_EOL;
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
    }
}
