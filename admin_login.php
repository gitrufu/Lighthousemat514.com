<?php
session_start();


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Hardcoded credentials (replace with a database authentication system if needed)
    $admin_username = "mupasi";
    $admin_password = "lighthouse"; // Replace with a hashed password in production

    if ($username === $admin_username && $password === $admin_password) {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin_portal.php");
        exit;
    } else {
        $error = "Invalid credentials";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Lighthouse</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            flex-direction: column;
        }
        .login-container {
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            width: 500px;
            text-align: center;
        }
        h1 {
            color: #333;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button {
            width: 50%;
            padding: 10px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background-color: #555;
        }
        .error-message {
            color: red;
            font-size: 14px;
        }
        .admin-link {
            text-decoration: none;
            color: #333;
            margin-bottom: 10px;
            width: 5%;
            padding: 10px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .admin-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Admin Login</h1>
    <a href="index.html" class="admin-link button">Back</a>
    <div class="login-container">
        <form method="POST" action="">
            <?php if (isset($error)) { echo "<p class='error-message'>$error</p>"; } ?>
            <label for="username">Username:</label>
            <input type="text" name="username" required>
            
            <label for="password">Password:</label>
            <input type="password" name="password" required>
            
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
