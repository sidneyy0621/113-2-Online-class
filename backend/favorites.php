<?php
// 顯示錯誤（開發用）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 回應為 JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'add') {
    $data = json_decode(file_get_contents("php://input"), true);
    $student_id = $data['student_id'] ?? '';
    $course_id = $data['course_id'] ?? '';

    if (!$student_id || !$course_id) {
        echo json_encode(['success' => false, 'error' => '缺少參數']);
        exit;
    }

    // 檢查是否為學生
    $check = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $check->execute([$student_id]);
    $role = $check->fetchColumn();

    if ($role !== 'student') {
        echo json_encode(['success' => false, 'error' => '只有學生可以收藏課程']);
        exit;
    }

    // 檢查是否已收藏過
    $check = $pdo->prepare("SELECT * FROM favorites WHERE student_id = ? AND course_id = ?");
    $check->execute([$student_id, $course_id]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'error' => '已經收藏過此課程']);
        exit;
    }

    // 寫入收藏
    $stmt = $pdo->prepare("INSERT INTO favorites (student_id, course_id) VALUES (?, ?)");
    $success = $stmt->execute([$student_id, $course_id]);

    echo json_encode(['success' => $success]);
    exit;
}

if ($action === 'remove') {
    $data = json_decode(file_get_contents("php://input"), true);
    $student_id = $data['student_id'] ?? '';
    $course_id = $data['course_id'] ?? '';

    if (!$student_id || !$course_id) {
        echo json_encode(['success' => false, 'error' => '缺少參數']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM favorites WHERE student_id = ? AND course_id = ?");
    $success = $stmt->execute([$student_id, $course_id]);

    echo json_encode(['success' => $success]);
    exit;
}

if ($action === 'listByStudent') {
    $student_id = $_GET['id'] ?? '';
    if (!$student_id) {
        echo json_encode(['success' => false, 'error' => '缺少學生 ID']);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT courses.* FROM favorites
        JOIN courses ON favorites.course_id = courses.id
        WHERE favorites.student_id = ?
    ");
    $stmt->execute([$student_id]);
    $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($favorites);
    exit;
}

echo json_encode(['success' => false, 'error' => '不支援的 action']);
