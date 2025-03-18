<?php
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection
function getDB() {
    $host = 'localhost';
    $dbname = 'lighthouse';
    $username = 'root';
    $password = '';

    try {
        $db = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $db;
    } catch(PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}

// Validate input
function validateInput($data) {
    $errors = [];
    
    // Name validation
    if (!preg_match("/^[A-Za-z\s]{3,50}$/", $data['name'])) {
        $errors[] = "Invalid name format";
    }
    
    // Mobile validation
    if (!preg_match("/^[0-9]{10}$/", $data['phone'])) {
        $errors[] = "Invalid mobile number";
    }
    
    // Email validation
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }
    
    // Address validation
    if (strlen($data['address']) < 10 || strlen($data['address']) > 200) {
        $errors[] = "Address must be between 10 and 200 characters";
    }
    
    // Pincode validation
    if (!preg_match("/^[0-9]{6}$/", $data['pincode'])) {
        $errors[] = "Invalid PIN code";
    }
    
    // Payment Method validation
    if (!in_array($data['payment_method'], ['cod'])) {
        $errors[] = "Invalid payment method";
    }
    
    return $errors;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Verify required POST data
    if (!isset($_POST['orderDetails']) || !isset($_POST['totalAmount']) || !isset($_POST['payment_method'])) {
        throw new Exception("Missing required order data");
    }

    // Get and decode order details
    $orderDetails = json_decode($_POST['orderDetails'], true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid order details format");
    }

    $totalAmount = floatval($_POST['totalAmount']);
    $paymentMethod = $_POST['payment_method']; // Cash on Delivery (cod)

    // Sanitize input
    $name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
    $phone = filter_var($_POST['phone'], FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $address = filter_var($_POST['address'], FILTER_SANITIZE_STRING);
    $pincode = filter_var($_POST['pincode'], FILTER_SANITIZE_STRING);

    $data = [
        'name' => $name,
        'phone' => $phone,
        'email' => $email,
        'address' => $address,
        'pincode' => $pincode,
        'payment_method' => $paymentMethod
    ];

    // Validate input
    $errors = validateInput($data);
    
    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
    }

    $db = getDB();
    $db->beginTransaction();

    // Insert order
    $stmt = $db->prepare("INSERT INTO orders (name, phone, email, address, pincode, total_amount, payment_method, order_date) 
                         VALUES (:name, :phone, :email, :address, :pincode, :total_amount, :payment_method, NOW())");
    
    $stmt->execute([
        ':name' => $name,
        ':phone' => $phone,
        ':email' => $email,
        ':address' => $address,
        ':pincode' => $pincode,
        ':total_amount' => $totalAmount,
        ':payment_method' => $paymentMethod
    ]);
    
    $orderId = $db->lastInsertId();

    // Insert order items
    $stmt = $db->prepare("INSERT INTO order_items (order_id, product_name, quantity, price, size, color) 
                         VALUES (:order_id, :product_name, :quantity, :price, :size, :color)");
    
    foreach ($orderDetails as $item) {
        $stmt->execute([
            ':order_id' => $orderId,
            ':product_name' => $item['name'],
            ':quantity' => $item['quantity'],
            ':price' => $item['price'],
            ':size' => $item['size'],
            ':color' => $item['color']
        ]);
    }

    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Order placed successfully',
        'order_id' => $orderId
    ]);

} catch (Exception $e) {
    error_log("Order processing error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Order processing failed: ' . $e->getMessage()
    ]);
}
?>
