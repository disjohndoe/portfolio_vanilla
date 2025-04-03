<?php
/**
 * Sync Posts Utility
 * 
 * Provides functions to sync posts between various parts of the application
 */

// Include database config and class
require_once __DIR__ . '/db/config.php';
require_once __DIR__ . '/db/Database.php';

/**
 * Save a post to the database
 * 
 * @param array $postData Post data to save
 * @return int|bool The post ID if successful, false otherwise
 */
function savePostToDatabase($postData) {
    try {
        $db = Database::getInstance();
        
        // Check if post exists (update vs insert)
        $existingPost = null;
        if (isset($postData['id']) && !empty($postData['id'])) {
            $existingPost = $db->fetchOne(
                "SELECT id FROM blog_posts WHERE id = ?", 
                [$postData['id']]
            );
        }
        
        // Prepare data for database
        $title = $postData['title'] ?? '';
        $content = $postData['content'] ?? '';
        $excerpt = $postData['excerpt'] ?? (substr(strip_tags($content), 0, 150) . '...');
        $slug = $postData['slug'] ?? createSlug($title);
        $status = (isset($postData['published']) && $postData['published']) ? 'published' : 'draft';
        $imageUrl = $postData['image'] ?? null;
        
        // Set author
        $authorId = 1; // Default to admin user
        
        // Set dates
        $now = date('Y-m-d H:i:s');
        $publishedAt = ($status === 'published') ? $now : null;
        
        if ($existingPost) {
            // Update existing post
            $db->query(
                "UPDATE blog_posts SET 
                    title = ?, 
                    slug = ?, 
                    excerpt = ?, 
                    content = ?, 
                    image_url = ?, 
                    status = ?, 
                    published_at = ?,
                    updated_at = NOW()
                WHERE id = ?",
                [
                    $title, 
                    $slug, 
                    $excerpt, 
                    $content, 
                    $imageUrl, 
                    $status, 
                    $publishedAt,
                    $existingPost['id']
                ]
            );
            
            return $existingPost['id'];
        } else {
            // Insert new post
            return $db->insert(
                "INSERT INTO blog_posts 
                    (title, slug, excerpt, content, image_url, status, author_id, published_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $title, 
                    $slug, 
                    $excerpt, 
                    $content, 
                    $imageUrl, 
                    $status, 
                    $authorId, 
                    $publishedAt
                ]
            );
        }
    } catch (Exception $e) {
        error_log("Error saving post to database: " . $e->getMessage());
        return false;
    }
}

/**
 * Create a URL-friendly slug from a string
 * 
 * @param string $string The string to convert
 * @return string The generated slug
 */
function createSlug($string) {
    // Replace non-alphanumeric characters with hyphens
    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower(trim($string)));
    // Remove duplicate hyphens
    $slug = preg_replace('/-+/', '-', $slug);
    // Trim hyphens from beginning and end
    return trim($slug, '-');
}

/**
 * Update categories/tags for a post
 * 
 * @param int $postId The post ID
 * @param array $tags Array of tag names
 * @return bool Success status
 */
function updatePostTags($postId, $tags) {
    try {
        if (empty($tags) || !is_array($tags)) {
            $tags = [];
        }
        
        $db = Database::getInstance();
        
        // First, clear existing categories for this post
        $db->query("DELETE FROM blog_post_categories WHERE post_id = ?", [$postId]);
        
        // Then add new categories
        foreach ($tags as $tag) {
            // Get or create category
            $category = $db->fetchOne(
                "SELECT id FROM blog_categories WHERE name = ?", 
                [$tag]
            );
            
            if (!$category) {
                // Create new category
                $categoryId = $db->insert(
                    "INSERT INTO blog_categories (name, slug) VALUES (?, ?)",
                    [$tag, createSlug($tag)]
                );
            } else {
                $categoryId = $category['id'];
            }
            
            // Add category to post
            $db->query(
                "INSERT INTO blog_post_categories (post_id, category_id) VALUES (?, ?)",
                [$postId, $categoryId]
            );
        }
        
        return true;
    } catch (Exception $e) {
        error_log("Error updating post tags: " . $e->getMessage());
        return false;
    }
}
?>