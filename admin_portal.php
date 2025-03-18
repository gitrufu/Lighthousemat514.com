<?php
session_start();

// Check if admin is logged in
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: admin_login.php"); // Redirect to login page if not authenticated
    exit;
}

// Database connection
$host = 'localhost';
$dbname = 'lighthouse';
$username = 'root';
$password = '';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch all orders
    $stmt = $db->query("SELECT * FROM orders ORDER BY order_date DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal - Lighthouse Orders</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            color: #000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #333;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .delete-btn {
            background-color: #ff4d4d;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 5px;
        }
        .delete-btn:hover {
            background-color: #cc0000;
        }
        .logout-btn {
            background-color: #000;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
            border-radius: 5px;
            display: block;
            margin: 20px auto;
            text-align: center;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Admin Portal - Order Records</h1>
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>PIN Code</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($orders as $order): ?>
                <tr>
                    <td><?= htmlspecialchars($order['id']) ?></td>
                    <td><?= htmlspecialchars($order['name']) ?></td>
                    <td><?= htmlspecialchars($order['phone']) ?></td>
                    <td><?= htmlspecialchars($order['email']) ?></td>
                    <td><?= htmlspecialchars($order['address']) ?></td>
                    <td><?= htmlspecialchars($order['pincode']) ?></td>
                    <td>$<?= htmlspecialchars($order['total_amount']) ?></td>
                    <td><?= htmlspecialchars($order['order_date']) ?></td>
                    <td><button class="delete-btn" onclick="deleteOrder(<?= $order['id'] ?>)">Delete</button></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <button class="logout-btn" onclick="window.location.href='logout.php'">Logout</button>
    </div>

    <script>
        async function deleteOrder(orderId) {
            if (confirm("Are you sure you want to delete this order?")) {
                const response = await fetch('delete_order.php', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: orderId })
                });
                const result = await response.json();
                if (result.success) {
                    location.reload();
                } else {
                    alert('Failed to delete order.');
                }
            }
        }
    </script>
</body>
</html>
