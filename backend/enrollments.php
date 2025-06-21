<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db.php';

$action = $_GET['action'] ?? ''; // 初始化 $action 變數

// 新增課程到「我的課程」
if ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)");
    $stmt->execute([$data['student_id'], $data['course_id']]);
    echo json_encode(['success'=>true]);
    exit;
}

// 查看自己的已加入課程（含課程資訊）
if ($action === 'list' && isset($_GET['student_id'])) {
    $stmt = $pdo->prepare(
        "SELECT e.id as enrollment_id, c.*
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         WHERE e.student_id=?"
    );
    $stmt->execute([$_GET['student_id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 刪除自己加入的課程
if ($action === 'delete') {
    // 接收 JSON 格式資料
    $data = json_decode(file_get_contents("php://input"), true);

    // 檢查格式
    if (!isset($data['student_id']) || !isset($data['course_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => '缺少參數']);
        exit;
    }

    $student_id = $data['student_id'];
    $course_id = $data['course_id'];

    try {
        $stmt = $pdo->prepare("DELETE FROM enrollments WHERE student_id = ? AND course_id = ?");
        $success = $stmt->execute([$student_id, $course_id]);
        echo json_encode(['success' => $success]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => '資料庫錯誤']);
    }

    exit;
}

http_response_code(400);
echo json_encode(['error'=>'參數錯誤']);