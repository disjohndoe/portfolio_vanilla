<?php
/**
 * Database Connection Class
 * 
 * Handles database connections and provides utility methods
 * for common database operations.
 */

class Database {
    private static $instance = null;
    private $conn;
    
    /**
     * Constructor - connects to the database
     */
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    /**
     * Singleton pattern - get database instance
     * 
     * @return Database Instance of the Database class
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get the PDO connection
     * 
     * @return PDO The PDO connection object
     */
    public function getConnection() {
        return $this->conn;
    }
    
    /**
     * Execute a query with parameters
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return PDOStatement The executed statement
     */
    public function query($query, $params = []) {
        try {
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query error: " . $e->getMessage() . " - Query: " . $query);
            throw $e;
        }
    }
    
    /**
     * Execute an INSERT and return the last inserted ID
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return int|string The last inserted ID
     */
    public function insert($query, $params = []) {
        $this->query($query, $params);
        return $this->conn->lastInsertId();
    }
    
    /**
     * Execute a SELECT and fetch a single row
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return array|null The fetched row or null
     */
    public function fetchOne($query, $params = []) {
        $stmt = $this->query($query, $params);
        $result = $stmt->fetch();
        return $result !== false ? $result : null;
    }
    
    /**
     * Execute a SELECT and fetch all rows
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return array The fetched rows
     */
    public function fetchAll($query, $params = []) {
        $stmt = $this->query($query, $params);
        return $stmt->fetchAll();
    }
    
    /**
     * Execute a SELECT and fetch a single value
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return mixed The fetched value or null
     */
    public function fetchValue($query, $params = []) {
        $stmt = $this->query($query, $params);
        $result = $stmt->fetch(PDO::FETCH_NUM);
        return $result !== false ? $result[0] : null;
    }
    
    /**
     * Execute a SELECT and fetch a single column
     * 
     * @param string $query SQL query
     * @param array $params Parameters for the query
     * @return array The fetched column values
     */
    public function fetchColumn($query, $params = []) {
        $stmt = $this->query($query, $params);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
