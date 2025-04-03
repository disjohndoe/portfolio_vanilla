<?php
/**
 * Button Fix
 * Adds explicit "Delete" buttons next to each post and fixes the "View" button
 */

// Make sure this is only accessed by admin
require_once 'auth_admin.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fix Buttons</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .success { color: green; }
        pre { 
            background: #f5f5f5;
            padding: 15px;
            overflow-x: auto;
            border-radius: 4px;
        }
        button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Add Delete Buttons to Admin Panel</h1>
    
    <p>This script will inject the required JavaScript to make the Delete button visible and the View button work properly.</p>
    
    <script id="fix-script">
    (function() {
        // First, find the correct table with posts
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            // Find all rows in the table
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                // Find the actions cell
                const actionsCell = row.querySelector('td:last-child');
                if (actionsCell) {
                    // Find the post ID from any existing button
                    const existingButton = actionsCell.querySelector('button[data-id]');
                    if (existingButton) {
                        const postId = existingButton.getAttribute('data-id');
                        
                        // Check if delete button exists
                        let deleteButton = actionsCell.querySelector('.admin-btn--danger');
                        if (!deleteButton) {
                            // Create delete button
                            deleteButton = document.createElement('button');
                            deleteButton.className = 'admin-btn admin-btn--danger admin-btn--small delete-post-btn';
                            deleteButton.setAttribute('data-id', postId);
                            deleteButton.textContent = 'Delete';
                            deleteButton.style.backgroundColor = '#ef4444';
                            deleteButton.style.color = 'white';
                            deleteButton.style.padding = '4px 8px';
                            deleteButton.style.borderRadius = '4px';
                            deleteButton.style.marginLeft = '5px';
                            deleteButton.style.cursor = 'pointer';
                            
                            // Add event listener
                            deleteButton.addEventListener('click', function(event) {
                                event.preventDefault();
                                if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                                    console.log('Deleting post:', postId);
                                    window.deletePost(postId);
                                }
                            });
                            
                            actionsCell.appendChild(deleteButton);
                        }
                        
                        // Fix view button if it exists
                        const viewButton = actionsCell.querySelector('a');
                        if (viewButton && viewButton.getAttribute('href').startsWith('/')) {
                            viewButton.setAttribute('href', viewButton.getAttribute('href').substring(1));
                        }
                    }
                }
            });
        });
        
        console.log('Delete buttons added and View buttons fixed!');
    })();
    </script>
    
    <h2>Instructions</h2>
    <ol>
        <li>Copy the script below</li>
        <li>Open your admin panel</li>
        <li>Press F12 to open browser developer tools</li>
        <li>Go to Console tab</li>
        <li>Paste the script and press Enter</li>
        <li>The Delete button should now appear and the View button should work correctly</li>
    </ol>
    
    <h2>Script to Run in Browser Console</h2>
    <pre id="copy-area"></pre>
    
    <button id="copy-btn">Copy Script to Clipboard</button>
    
    <script>
        // Extract the script to display
        const scriptContent = document.getElementById('fix-script').innerHTML;
        document.getElementById('copy-area').textContent = scriptContent;
        
        // Copy button functionality
        document.getElementById('copy-btn').addEventListener('click', function() {
            const text = document.getElementById('copy-area').textContent;
            navigator.clipboard.writeText(text).then(function() {
                alert('Script copied to clipboard!');
            }, function() {
                alert('Failed to copy script. Please select and copy manually.');
            });
        });
    </script>
</body>
</html>
