<?php
// Simply serve the index.html file
header("Location: " . dirname($_SERVER['REQUEST_URI']) . "/index.html");
exit();
?>