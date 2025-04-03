<?php
/**
 * Blog Database Initialization Script
 * 
 * This script creates the necessary database tables for the blog functionality
 * if they don't already exist.
 */

// Include database config and class
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';

try {
    // Initialize database connection
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Create users table
    $db->query("
        CREATE TABLE IF NOT EXISTS blog_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            display_name VARCHAR(100),
            bio TEXT,
            avatar_url VARCHAR(255),
            role ENUM('admin', 'author', 'editor') NOT NULL DEFAULT 'author',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=" . DB_CHARSET . " COLLATE=" . DB_COLLATE . "
    ");
    
    // Create posts table
    $db->query("
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            excerpt TEXT,
            content LONGTEXT,
            image_url VARCHAR(255),
            status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
            author_id INT,
            published_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES blog_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=" . DB_CHARSET . " COLLATE=" . DB_COLLATE . "
    ");
    
    // Create categories table
    $db->query("
        CREATE TABLE IF NOT EXISTS blog_categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            slug VARCHAR(50) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=" . DB_CHARSET . " COLLATE=" . DB_COLLATE . "
    ");
    
    // Create post_categories junction table
    $db->query("
        CREATE TABLE IF NOT EXISTS blog_post_categories (
            post_id INT NOT NULL,
            category_id INT NOT NULL,
            PRIMARY KEY (post_id, category_id),
            FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=" . DB_CHARSET . " COLLATE=" . DB_COLLATE . "
    ");
    
    // Add admin user if no users exist
    $userCount = $db->fetchValue("SELECT COUNT(*) FROM blog_users");
    
    if ($userCount == 0) {
        // Create default admin user (password: change_me_immediately)
        $adminPassword = password_hash('change_me_immediately', PASSWORD_DEFAULT);
        
        $db->query("
            INSERT INTO blog_users (username, password, email, display_name, role)
            VALUES (?, ?, ?, ?, ?)
        ", ['admin', $adminPassword, 'hrvoje.matos@gmail.com', 'Hrvoje Matosevic', 'admin']);
        
        // Add default categories
        $categories = [
            ['Web Development', 'web-development'],
            ['Programming', 'programming'],
            ['JavaScript', 'javascript'],
            ['PHP', 'php'],
            ['Tech', 'tech']
        ];
        
        foreach ($categories as $category) {
            $db->query("
                INSERT INTO blog_categories (name, slug)
                VALUES (?, ?)
            ", [$category[0], $category[1]]);
        }
        
        // Add a sample post
        $postId = $db->insert("
            INSERT INTO blog_posts (title, slug, excerpt, content, status, author_id, published_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ", [
            'Welcome to My Blog', 
            'welcome-to-my-blog',
            'This is my first blog post where I will be sharing insights about web development, programming, and technology.',
            '<p>Hello, and welcome to my blog!</p>
            <p>This is where I\'ll be sharing my thoughts, tutorials, and experiences in web development and technology.</p>
            <p>Stay tuned for more content coming soon!</p>',
            'published',
            1
        ]);
        
        // Add categories to the sample post
        $db->query("
            INSERT INTO blog_post_categories (post_id, category_id)
            VALUES (?, ?)
        ", [$postId, 1]);
    }
    
    echo "Blog database initialized successfully!";
    
} catch (Exception $e) {
    echo "Error initializing blog database: " . $e->getMessage();
}
