<?php
/**
 * Post Logs Viewer
 * 
 * Provides an interface to view post logs and sync status
 */

// Require admin authentication
require_once 'auth_admin.php';

// Include necessary files
require_once __DIR__ . '/db/config.php';
require_once __DIR__ . '/db/Database.php';
require_once __DIR__ . '/db/PostLogger.php';

// Initialize logger
$logger = new PostLogger();

// Handle sync request if submitted
$message = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['sync_post']) && isset($_POST['post_id'])) {
    $postId = $_POST['post_id'];
    
    // Check for valid CSRF token
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        $message = '<div class="alert alert-danger">CSRF token validation failed</div>';
    } else {
        // Copy file from posts/ to blog_data/ to sync
        $sourceFile = __DIR__ . '/../posts/' . $postId . '.json';
        $destFile = __DIR__ . '/../blog_data/' . $postId . '.json';
        
        if (file_exists($sourceFile)) {
            if (copy($sourceFile, $destFile)) {
                $logger->logPostOperation($postId, PostLogger::ACTION_SYNC, 'system');
                $logger->markAsSynced($postId);
                $message = '<div class="alert alert-success">Post "' . htmlspecialchars($postId) . '" synced successfully</div>';
            } else {
                $message = '<div class="alert alert-danger">Failed to sync post "' . htmlspecialchars($postId) . '"</div>';
            }
        } else {
            $message = '<div class="alert alert-danger">Source file not found for post "' . htmlspecialchars($postId) . '"</div>';
        }
    }
}

// Get posts that need syncing
$outOfSyncPosts = $logger->getOutOfSyncPosts();

// Get recent activities with pagination
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 25;
$offset = ($page - 1) * $limit;

// Filter by post ID if provided
$postId = isset($_GET['post_id']) ? $_GET['post_id'] : null;

if ($postId) {
    $activities = $logger->getPostHistory($postId);
    $title = 'Post History: ' . htmlspecialchars($postId);
} else {
    $activities = $logger->getRecentActivities(100); // Get more than we need for pagination
    $totalActivities = count($activities);
    $activities = array_slice($activities, $offset, $limit);
    $title = 'Recent Post Activities';
}

// Format the changes column data
function formatChanges($changesJson) {
    if (empty($changesJson)) return '';
    
    $changes = json_decode($changesJson, true);
    if (!$changes) return '<em>No changes recorded</em>';
    
    $html = '<ul class="changes-list">';
    
    // Handle different change formats
    if (isset($changes['before']) && isset($changes['after'])) {
        // Show diff between before and after if available
        $html .= '<li><strong>Before:</strong> ' . substr(json_encode($changes['before']), 0, 100) . '...</li>';
        $html .= '<li><strong>After:</strong> ' . substr(json_encode($changes['after']), 0, 100) . '...</li>';
    } else {
        // Otherwise just list the changes
        foreach ($changes as $key => $value) {
            $html .= '<li><strong>' . htmlspecialchars($key) . ':</strong> ' . 
                     (is_array($value) ? json_encode($value) : htmlspecialchars($value)) . '</li>';
        }
    }
    
    $html .= '</ul>';
    return $html;
}

// Function to format timestamps
function formatDate($timestamp) {
    $date = new DateTime($timestamp);
    return $date->format('M j, Y g:i a');
}

// Function to get badge class based on action
function getActionBadge($action) {
    switch ($action) {
        case 'create':
            return 'badge-success';
        case 'update':
            return 'badge-primary';
        case 'delete':
            return 'badge-danger';
        case 'sync':
            return 'badge-info';
        default:
            return 'badge-secondary';
    }
}

// Function to get badge class based on location
function getLocationBadge($location) {
    switch ($location) {
        case 'admin':
            return 'badge-warning';
        case 'public':
            return 'badge-success';
        case 'system':
            return 'badge-dark';
        default:
            return 'badge-secondary';
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post Logs | Admin</title>
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
        .changes-list {
            font-size: 0.9rem;
            padding-left: 20px;
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .badge {
            font-size: 85%;
        }
        .action-links a {
            margin-right: 10px;
        }
        #sync-status {
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="page-header">
            <h1>Post Logs</h1>
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
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><?php echo $title; ?></h5>
                        
                        <!-- Filter form -->
                        <?php if (!$postId): ?>
                        <form action="" method="get" class="mt-2">
                            <div class="input-group">
                                <input type="text" name="post_id" class="form-control" placeholder="Filter by Post ID">
                                <div class="input-group-append">
                                    <button type="submit" class="btn btn-outline-secondary">Filter</button>
                                </div>
                            </div>
                        </form>
                        <?php endif; ?>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Post ID</th>
                                        <th>Action</th>
                                        <th>Location</th>
                                        <th>User</th>
                                        <th>Date/Time</th>
                                        <th>Changes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php if (empty($activities)): ?>
                                    <tr>
                                        <td colspan="6" class="text-center py-4">No activity found</td>
                                    </tr>
                                    <?php else: ?>
                                    <?php foreach ($activities as $activity): ?>
                                    <tr>
                                        <td>
                                            <?php if ($postId): ?>
                                            <?php echo htmlspecialchars($activity['post_id']); ?>
                                            <?php else: ?>
                                            <a href="?post_id=<?php echo urlencode($activity['post_id']); ?>">
                                                <?php echo htmlspecialchars($activity['post_id']); ?>
                                            </a>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <span class="badge <?php echo getActionBadge($activity['action']); ?>">
                                                <?php echo htmlspecialchars($activity['action']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge <?php echo getLocationBadge($activity['location']); ?>">
                                                <?php echo htmlspecialchars($activity['location']); ?>
                                            </span>
                                        </td>
                                        <td>
                                            <?php echo htmlspecialchars($activity['user_info']); ?>
                                            <small class="text-muted d-block"><?php echo htmlspecialchars($activity['ip_address']); ?></small>
                                        </td>
                                        <td><?php echo formatDate($activity['created_at']); ?></td>
                                        <td><?php echo formatChanges($activity['changes']); ?></td>
                                    </tr>
                                    <?php endforeach; ?>
                                    <?php endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <?php if (!$postId && isset($totalActivities) && $totalActivities > $limit): ?>
                    <div class="card-footer">
                        <nav>
                            <ul class="pagination justify-content-center mb-0">
                                <?php
                                $totalPages = ceil($totalActivities / $limit);
                                for ($i = 1; $i <= $totalPages; $i++) {
                                    $active = $i == $page ? 'active' : '';
                                    echo '<li class="page-item ' . $active . '"><a class="page-link" href="?page=' . $i . '">' . $i . '</a></li>';
                                }
                                ?>
                            </ul>
                        </nav>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Sync Status</h5>
                    </div>
                    <div class="card-body" id="sync-status">
                        <?php if (empty($outOfSyncPosts)): ?>
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i> All posts are in sync!
                        </div>
                        <?php else: ?>
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> 
                            Found <?php echo count($outOfSyncPosts); ?> posts that need to be synced.
                        </div>
                        
                        <form method="post" action="">
                            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                            <div class="list-group">
                                <?php foreach ($outOfSyncPosts as $post): ?>
                                <div class="list-group-item">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 class="mb-1"><?php echo htmlspecialchars($post['post_id']); ?></h6>
                                            <small class="text-muted">
                                                Last updated: <?php echo formatDate($post['last_updated']); ?>
                                            </small>
                                        </div>
                                        <div>
                                            <button type="submit" name="sync_post" value="1" class="btn btn-sm btn-primary">
                                                <i class="fas fa-sync"></i> Sync
                                            </button>
                                            <input type="hidden" name="post_id" value="<?php echo htmlspecialchars($post['post_id']); ?>">
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                        </form>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Database Tools</h5>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            <a href="db/init_db.php" class="list-group-item list-group-item-action" target="_blank">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Initialize Database</h6>
                                        <small class="text-muted">
                                            Create/update the required database tables
                                        </small>
                                    </div>
                                    <i class="fas fa-database"></i>
                                </div>
                            </a>
                        </div>
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
