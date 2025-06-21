<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

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

if ($action === 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? '';
    $name = $data['name'] ?? '';
    $gender = $data['gender'] ?? '';
    $birthday = $data['birthday'] ?? null;
    $password = $data['password'] ?? '';

    if (!$id || !$name || !$gender) {
        echo json_encode(['success' => false, 'error' => '參數錯誤']);
        exit;
    }

    // 有填密碼就一起更新
    if ($password !== '') {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, gender = ?, birthday = ?, password = ? WHERE id = ?");
        $success = $stmt->execute([
            $name,
            $gender,
            $birthday,
            $password, // 移除加密，直接儲存明文密碼
            $id
        ]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, gender = ?, birthday = ? WHERE id = ?");
        $success = $stmt->execute([
            $name,
            $gender,
            $birthday,
            $id
        ]);
    }

    echo json_encode(['success' => $success]);
    exit;
}
