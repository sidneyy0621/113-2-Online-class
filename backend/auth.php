<?php
// 開發階段顯示錯誤（上線請關閉）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 回傳為 JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        echo json_encode(['success' => false, 'error' => '參數錯誤']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && $password === $user['password']) { // 移除 password_verify，直接比對明文密碼
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'gender' => $user['gender'],
                'birthday' => $user['birthday'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => '帳號或密碼錯誤']);
    }
    exit;
}

if ($action === 'register') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';
    $gender = $data['gender'] ?? '';

    if (!$name || !$email || !$password || !$role || !$gender) {
        echo json_encode(['success' => false, 'error' => '參數錯誤']);
        exit;
    }

    // 帳號檢查
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'error' => '帳號已存在']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role, gender) VALUES (?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $name,
        $email,
        $password, // 移除加密，直接儲存明文密碼
        $role,
        $gender
    ]);

    echo json_encode(['success' => $success]);
    exit;
}