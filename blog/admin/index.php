<?php
// Start session
session_start();

// Check if user is logged in
if (!isset($_SESSION['blog_admin_logged_in']) || $_SESSION['blog_admin_logged_in'] !== true) {
    // Not logged in, redirect to login page
    header('Location: login.php');
    exit;
}

// Include database configuration
require_once dirname(dirname(__DIR__)) . '/api/db/config.php';
require_once dirname(dirname(__DIR__)) . '/api/db/Database.php';

// Function to get posts
function getPosts() {
    try {
        $db = Database::getInstance();
        $posts = $db->fetchAll("
            SELECT p.*, u.username AS author_name
            FROM blog_posts p
            LEFT JOIN blog_users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
        ");
        return $posts;
    } catch (Exception $e) {
        return [];
    }
}

// Get posts
$posts = getPosts();

// Get action if any
$action = isset($_GET['action']) ? $_GET['action'] : '';
$message = '';

// Handle delete
if ($action === 'delete' && isset($_GET['id'])) {
    $post_id = filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT);
    
    try {
        $db = Database::getInstance();
        $db->query("DELETE FROM blog_post_categories WHERE post_id = ?", [$post_id]);
        $db->query("DELETE FROM blog_posts WHERE id = ?", [$post_id]);
        $message = "Post deleted successfully!";
        // Refresh posts list
        $posts = getPosts();
    } catch (Exception $e) {
        $message = "Error deleting post: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Admin - Hrvoje Matosevic</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #0070f3;
            --secondary: #6c757d;
            --success: #28a745;
            --danger: #dc3545;
            --warning: #ffc107;
            --info: #17a2b8;
            --light: #f8f9fa;
            --dark: #343a40;
            --body-bg: #fff;
            --body-color: #212529;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--body-color);
            background-color: var(--body-bg);
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
        }
        
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        h1 {
            color: var(--primary);
        }
        
        .btn {
            display: inline-block;
            font-weight: 500;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: 0.25rem;
            color: #fff;
            text-decoration: none;
        }
        
        .btn-primary {
            background-color: var(--primary);
            border: 1px solid var(--primary);
        }
        
        .btn-danger {
            background-color: var(--danger);
            border: 1px solid var(--danger);
        }
        
        .btn-secondary {
            background-color: var(--secondary);
            border: 1px solid var(--secondary);
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }
        
        th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        th {
            background-color: #f8f9fa;
        }
        
        tr:hover {
            background-color: #f8f9fa;
        }
        
        .badge {
            display: inline-block;
            padding: 0.25em 0.4em;
            font-size: 75%;
            font-weight: 600;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.25rem;
        }
        
        .badge-success {
            color: #fff;
            background-color: var(--success);
        }
        
        .badge-warning {
            color: #212529;
            background-color: var(--warning);
        }
        
        .badge-secondary {
            color: #fff;
            background-color: var(--secondary);
        }
        
        .alert {
            position: relative;
            padding: 0.75rem 1.25rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.25rem;
        }
        
        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        
        .alert-danger {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .actions {
            display: flex;
            gap: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Blog Admin</h1>
            <div>
                <a href="new-post.php" class="btn btn-primary"><i class="fas fa-plus"></i> New Post</a>
                <a href="categories.php" class="btn btn-secondary"><i class="fas fa-tags"></i> Categories</a>
                <a href="../" class="btn btn-secondary"><i class="fas fa-eye"></i> View Blog</a>
                <a href="logout.php" class="btn btn-danger"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        </header>
        
        <?php if (!empty($message)): ?>
            <div class="alert alert-success"><?php echo $message; ?></div>
        <?php endif; ?>
        
        <h2>Posts</h2>
        
        <?php if (empty($posts)): ?>
            <p>No posts found. <a href="new-post.php">Create your first post!</a></p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Author</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($posts as $post): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($post['title']); ?></td>
                        <td>
                            <?php if ($post['status'] === 'published'): ?>
                                <span class="badge badge-success">Published</span>
                            <?php elseif ($post['status'] === 'draft'): ?>
                                <span class="badge badge-warning">Draft</span>
                            <?php else: ?>
                                <span class="badge badge-secondary">Archived</span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo htmlspecialchars($post['author_name'] ?? 'Unknown'); ?></td>
                        <td><?php echo date('M j, Y', strtotime($post['created_at'])); ?></td>
                        <td class="actions">
                            <a href="edit-post.php?id=<?php echo $post['id']; ?>" class="btn btn-primary btn-sm"><i class="fas fa-edit"></i></a>
                            <a href="index.php?action=delete&id=<?php echo $post['id']; ?>" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this post?')"><i class="fas fa-trash"></i></a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>
