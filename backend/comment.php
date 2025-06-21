<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");  //告訴瀏覽器「允許任何網域來存取這個 API」
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); //告訴瀏覽器「允許這些 HTTP 方法的跨來源請求」
header("Access-Control-Allow-Headers: Content-Type"); //告訴瀏覽器「允許帶有 Content-Type 標頭的請求」（這在 POST、PUT 請求尤其重要）

require_once 'db.php';

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';

// 新增評論
if ($action == 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("INSERT INTO course_comments (user_id, course_id, content) VALUES (?, ?, ?)");
    $stmt->execute([$data['user_id'], $data['course_id'], $data['content']]);
    echo json_encode(['success' => true]);
    exit;
}

// 查詢課程的所有評論
if ($action == 'list' && isset($_GET['course_id'])) {
    $stmt = $pdo->prepare(
        "SELECT c.id, c.content, c.created_at, u.name AS user_name
         FROM course_comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.course_id = ?"
    );
    $stmt->execute([$_GET['course_id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 刪除評論
if ($action == 'delete' && isset($_GET['id'])) {
    $stmt = $pdo->prepare("DELETE FROM course_comments WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => '參數錯誤']);
?>