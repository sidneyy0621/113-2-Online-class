<?php
header('Content-Type: application/json');

header("Access-Control-Allow-Origin: *");  //告訴瀏覽器「允許任何網域來存取這個 API」
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); //告訴瀏覽器「允許這些 HTTP 方法的跨來源請求」
header("Access-Control-Allow-Headers: Content-Type"); //告訴瀏覽器「允許帶有 Content-Type 標頭的請求」（這在 POST、PUT 請求尤其重要）

require_once 'db.php';

// 查詢全部課程含報名人數
if ($_GET['action'] == 'list') {
    $sql = "SELECT c.*, 
                (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled_count
            FROM courses c";
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 查詢特定教師的課程
if ($_GET['action'] == 'listByTeacher' && isset($_GET['teacher_id'])) {
    $stmt = $pdo->prepare("SELECT * FROM courses WHERE teacher_id = ?");
    $stmt->execute([$_GET['teacher_id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 可加單一課程細節查詢
if ($_GET['action'] == 'get' && isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM courses WHERE id=?");
    $stmt->execute([$_GET['id']]);
    echo json_encode($stmt->fetch());
    exit;
}

// 新增查詢課程報名學生名單功能
if ($_GET['action'] == 'enrolled_students' && isset($_GET['course_id'])) {
    $stmt = $pdo->prepare(
        "SELECT u.id, u.name, u.email, u.gender 
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         WHERE e.course_id = ?"
    );
    $stmt->execute([$_GET['course_id']]);
    echo json_encode($stmt->fetchAll());
    exit;
}

// 教師新增課程
if ($_GET['action'] == 'create') {
    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare(
        "INSERT INTO courses (title, description, start_time, end_time, max_capacity, teacher_id) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $data['title'], $data['description'], $data['start_time'], $data['end_time'], 
        $data['max_capacity'], $data['teacher_id']
    ]);
    echo json_encode(['success' => true]);
    exit;
}

// 教師更新課程
if ($_GET['action'] == 'update') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (
        isset($input['course_id']) &&
        isset($input['title']) &&
        isset($input['description']) &&
        isset($input['max_capacity']) &&
        isset($input['start_time']) &&
        isset($input['end_time'])
    ) {
        $course_id = $input['course_id'];
        $title = $input['title'];
        $description = $input['description'];
        $max_capacity = $input['max_capacity'];
        $start_time = $input['start_time'];
        $end_time = $input['end_time'];

        $stmt = $pdo->prepare("UPDATE courses SET title = ?, description = ?, max_capacity = ?, start_time = ?, end_time = ? WHERE id = ?");
        if ($stmt->execute([$title, $description, $max_capacity, $start_time, $end_time, $course_id])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => '課程更新失敗']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => '缺少必要欄位']);
    }
    exit;
}

// 教師刪除課程
if ($_GET['action'] == 'delete') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (isset($input['course_id'])) {
        $course_id = $input['course_id'];

        $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
        if ($stmt->execute([$course_id])) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => '刪除失敗']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => '缺少 course_id']);
    }
    exit;
}



http_response_code(400);
echo json_encode(['error' => '參數錯誤']);