<?php
// Admin authentication gateway

// Include authentication module
require_once 'api/auth_admin.php';

// If we get here, authentication passed in auth_admin.php (requireAdminAuth function)
// Pass CSRF token to the admin page
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex, nofollow">
    <meta http-equiv="refresh" content="0;url=admin.html">
    <title>Authentication Successful</title>
    <script>
        // Store CSRF token in session storage
        sessionStorage.setItem('csrfToken', '<?php echo $csrfToken; ?>');
        // Redirect to admin page
        window.location.href = 'admin.html';
    </script>
</head>
<body>
    <p>Authentication successful. Redirecting to admin page...</p>
    <p>If you are not redirected, <a href="admin.html">click here</a>.</p>
</body>
</html>
