<?php
/**
 * Simple Post Logs Viewer (No Database Required)
 * This is a fallback version that doesn't require database connection
 */

// Require admin authentication
require_once 'auth_admin.php';

// Constants
define('ADMIN_POSTS_DIR', dirname(__DIR__) . '/posts/');
define('PUBLIC_POSTS_DIR', dirname(__DIR__) . '/blog_data/');

// Function to get all posts
function getAllPosts() {
    $adminPosts = scanPostsDirectory(ADMIN_POSTS_DIR);
    $publicPosts = scanPostsDirectory(PUBLIC_POSTS_DIR);
    
    // Combine all unique post IDs
    $allPostIds = array_unique(array_merge(array_keys($adminPosts), array_keys($publicPosts)));
    
    // Build combined data
    $results = [];
    foreach ($allPostIds as $postId) {
        $adminData = $adminPosts[$postId] ?? null;
        $publicData = $publicPosts[$postId] ?? null;
        
        $inSync = false;
        if ($adminData && $publicData) {
            // Check if files have the same content or size
            $inSync = (filesize(ADMIN_POSTS_DIR . $postId . '.json') === filesize(PUBLIC_POSTS_DIR . $postId . '.json'));
        }
        
        $results[$postId] = [
            'id' => $postId,
            'in_admin' => (bool)$adminData,
            'in_public' => (bool)$publicData,
            'admin_modified' => $adminData ? date('Y-m-d H:i:s', filemtime(ADMIN_POSTS_DIR . $postId . '.json')) : null,
            'public_modified' => $publicData ? date('Y-m-d H:i:s', filemtime(PUBLIC_POSTS_DIR . $postId . '.json')) : null,
            'in_sync' => $inSync,
            'admin_data' => $adminData,
            'public_data' => $publicData
        ];
    }
    
    return $results;
}

// Function to scan a directory for JSON posts
function scanPostsDirectory($directory) {
    $posts = [];
    
    if (!file_exists($directory) || !is_readable($directory)) {
        return $posts;
    }
    
    $files = glob($directory . '*.json');
    foreach ($files as $file) {
        $postId = basename($file, '.json');
        $content = file_get_contents($file);
        if ($content) {
            $data = json_decode($content, true);
            if ($data) {
                $posts[$postId] = $data;
            }
        }
    }
    
    return $posts;
}

// Handle sync action
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['sync_post']) && isset($_POST['post_id'])) {
    $postId = $_POST['post_id'];
    
    // Check for valid CSRF token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $message = '<div class="alert alert-danger">CSRF token validation failed</div>';
    } else {
        // Copy file from posts/ to blog_data/ to sync
        $sourceFile = ADMIN_POSTS_DIR . $postId . '.json';
        $destFile = PUBLIC_POSTS_DIR . $postId . '.json';
        
        if (file_exists($sourceFile)) {
            if (copy($sourceFile, $destFile)) {
                $message = '<div class="alert alert-success">Post "' . htmlspecialchars($postId) . '" synced successfully</div>';
            } else {
                $message = '<div class="alert alert-danger">Failed to sync post "' . htmlspecialchars($postId) . '"</div>';
            }
        } else {
            $message = '<div class="alert alert-danger">Source file not found for post "' . htmlspecialchars($postId) . '"</div>';
        }
    }
}

// Format date
function formatDate($timestamp) {
    if (!$timestamp) return 'N/A';
    return date('M j, Y g:i a', strtotime($timestamp));
}

// Get all posts
$posts = getAllPosts();

// Sort by sync status - out of sync first
uasort($posts, function($a, $b) {
    if ($a['in_sync'] === $b['in_sync']) {
        // If sync status is the same, sort by most recently modified
        $aTime = max(strtotime($a['admin_modified'] ?? '0'), strtotime($a['public_modified'] ?? '0'));
        $bTime = max(strtotime($b['admin_modified'] ?? '0'), strtotime($b['public_modified'] ?? '0'));
        return $bTime - $aTime; // Newest first
    }
    return $a['in_sync'] ? 1 : -1; // Out of sync first
});

// Count out of sync posts
$outOfSyncCount = 0;
foreach ($posts as $post) {
    if (!$post['in_sync']) {
        $outOfSyncCount++;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Logs (Simple) | Admin</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css">
    <style>
        body {
            padding: 20px;
            background-color: #f8f9fa;
        }
        .card {
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .sync-status-ok {
            color: #28a745;
        }
        .sync-status-warning {
            color: #ffc107;
        }
        .sync-status-error {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page-header">
            <h1>Post Logs <small class="text-muted">(Simple Version)</small></h1>
            <div>
                <a href="../admin.html" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left"></i> Back to Admin
                </a>
                <a href="?refresh=<?php echo time(); ?>" class="btn btn-outline-primary">
                    <i class="fas fa-sync"></i> Refresh
                </a>
            </div>
        </div>
        
        <?php echo $message; ?>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Post Sync Status</h5>
                        <?php if ($outOfSyncCount > 0): ?>
                        <span class="badge badge-warning"><?php echo $outOfSyncCount; ?> posts need syncing</span>
                        <?php else: ?>
                        <span class="badge badge-success">All posts in sync</span>
                        <?php endif; ?>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Post ID</th>
                                        <th>Status</th>
                                        <th>Admin Version</th>
                                        <th>Public Version</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($posts)): ?>
                                    <tr>
                                        <td colspan="5" class="text-center py-4">No posts found</td>
                                    </tr>
                                    <?php else: ?>
                                    <?php foreach ($posts as $postId => $post): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($postId); ?></td>
                                        <td>
                                            <?php if ($post['in_sync']): ?>
                                            <span class="sync-status-ok"><i class="fas fa-check-circle"></i> In Sync</span>
                                            <?php elseif ($post['in_admin'] && $post['in_public']): ?>
                                            <span class="sync-status-warning"><i class="fas fa-exclamation-triangle"></i> Needs Sync</span>
                                            <?php elseif ($post['in_admin'] && !$post['in_public']): ?>
                                            <span class="sync-status-error"><i class="fas fa-times-circle"></i> Missing in Public</span>
                                            <?php elseif (!$post['in_admin'] && $post['in_public']): ?>
                                            <span class="sync-status-error"><i class="fas fa-times-circle"></i> Missing in Admin</span>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($post['in_admin']): ?>
                                            <?php echo formatDate($post['admin_modified']); ?>
                                            <?php else: ?>
                                            <em>Not found</em>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($post['in_public']): ?>
                                            <?php echo formatDate($post['public_modified']); ?>
                                            <?php else: ?>
                                            <em>Not found</em>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php if ($post['in_admin'] && (!$post['in_public'] || !$post['in_sync'])): ?>
                                            <form method="post" action="" class="d-inline">
                                                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                                <input type="hidden" name="post_id" value="<?php echo htmlspecialchars($postId); ?>">
                                                <button type="submit" name="sync_post" value="1" class="btn btn-sm btn-primary">
                                                    <i class="fas fa-sync"></i> Sync to Public
                                                </button>
                                            </form>
                                            <?php endif; ?>
                                            
                                            <?php if ($post['in_admin']): ?>
                                            <a href="/blog-post.html?id=<?php echo urlencode($postId); ?>" target="_blank" class="btn btn-sm btn-info">
                                                <i class="fas fa-eye"></i> View
                                            </a>
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">System Information</h5>
                    </div>
                    <div class="card-body">
                        <dl class="row">
                            <dt class="col-sm-3">Admin Posts Directory</dt>
                            <dd class="col-sm-9"><?php echo htmlspecialchars(ADMIN_POSTS_DIR); ?></dd>
                            
                            <dt class="col-sm-3">Public Posts Directory</dt>
                            <dd class="col-sm-9"><?php echo htmlspecialchars(PUBLIC_POSTS_DIR); ?></dd>
                            
                            <dt class="col-sm-3">PHP Version</dt>
                            <dd class="col-sm-9"><?php echo phpversion(); ?></dd>
                            
                            <dt class="col-sm-3">Server Software</dt>
                            <dd class="col-sm-9"><?php echo htmlspecialchars($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'); ?></dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
