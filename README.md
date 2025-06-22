# Online Classes 線上課程平台 - 後端 API 文檔

## 📋 系統簡介

Online Classes 後端系統是基於 PHP 和 MySQL 開發的 RESTful API 服務，為線上課程學習平台提供完整的數據管理和業務邏輯處理。系統採用 PDO 進行資料庫操作，支援跨域請求，提供完整的課程管理、用戶認證、報名系統等功能。

## ⚙️ 環境部署

### 系統需求
- **PHP**: 8.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **網頁伺服器**: Apache/Nginx
- **開發環境**: XAMPP/WAMP（推薦）

### 🚀 快速部署指南

#### 步驟 1：安裝 XAMPP 環境

1. **下載 XAMPP**
   - 前往 [XAMPP 官網](https://www.apachefriends.org/download.html)
   - 下載適合 Windows 的最新版本

2. **安裝 XAMPP**
   ```bash
   # 1. 執行下載的安裝檔
   # 2. 選擇安裝路徑（建議預設 C:\xampp）
   # 3. 勾選 Apache、MySQL、PHP 組件
   # 4. 完成安裝
   ```

3. **啟動服務**
   ```bash
   # 開啟 XAMPP Control Panel
   # 點擊 Apache 右側的 "Start" 按鈕
   # 點擊 MySQL 右側的 "Start" 按鈕
   # 確認兩個服務都顯示綠色 "Running" 狀態
   ```

#### 步驟 2：建立資料庫

1. **進入 phpMyAdmin**
   - 開啟瀏覽器
   - 訪問 `http://localhost/phpmyadmin`

2. **建立資料庫**
   ```sql
   -- 點擊左側 "新增" 或上方 "資料庫" 標籤
   -- 資料庫名稱輸入: online_classes
   -- 定序選擇: utf8mb4_unicode_ci
   -- 點擊 "建立"
   ```

3. **建立資料表（複製以下 SQL 語法執行）**
   ```sql
   -- 使用資料庫
   USE online_classes;

   -- 建立用戶表
   CREATE TABLE users (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role ENUM('student', 'teacher') NOT NULL,
       gender ENUM('male', 'female') NOT NULL,
       birthday DATE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- 建立課程表
   CREATE TABLE courses (
       id INT PRIMARY KEY AUTO_INCREMENT,
       title VARCHAR(200) NOT NULL,
       description TEXT,
       start_time DATETIME NOT NULL,
       end_time DATETIME NOT NULL,
       max_capacity INT NOT NULL,
       teacher_id INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (teacher_id) REFERENCES users(id)
   );

   -- 建立報名表
   CREATE TABLE enrollments (
       id INT PRIMARY KEY AUTO_INCREMENT,
       student_id INT NOT NULL,
       course_id INT NOT NULL,
       enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (student_id) REFERENCES users(id),
       FOREIGN KEY (course_id) REFERENCES courses(id),
       UNIQUE KEY unique_enrollment (student_id, course_id)
   );

   -- 建立收藏表
   CREATE TABLE favorites (
       id INT PRIMARY KEY AUTO_INCREMENT,
       student_id INT NOT NULL,
       course_id INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (student_id) REFERENCES users(id),
       FOREIGN KEY (course_id) REFERENCES courses(id),
       UNIQUE KEY unique_favorite (student_id, course_id)
   );

   -- 建立評論表
   CREATE TABLE course_comments (
       id INT PRIMARY KEY AUTO_INCREMENT,
       user_id INT NOT NULL,
       course_id INT NOT NULL,
       content TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (course_id) REFERENCES courses(id)
   );
   ```

#### 步驟 3：設定資料庫連線

1. **找到 db.php 檔案**
   ```
   位置: backend/db.php
   ```

2. **編輯連線設定（通常不需要修改）**
   ```php
   <?php
   $host = 'localhost';        // 資料庫主機位址
   $db   = 'online_classes';   // 資料庫名稱
   $user = 'root';             // MySQL 使用者名稱（XAMPP 預設）
   $pass = '';                 // MySQL 密碼（XAMPP 預設為空）
   $charset = 'utf8mb4';       // 字符集
   
   $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
   $options = [
       PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
       PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
   ];
   try {
       $pdo = new PDO($dsn, $user, $pass, $options);
   } catch (\PDOException $e) {
       http_response_code(500);
       echo json_encode(['error' => '資料庫連線失敗']);
       exit;
   }
   ?>
   ```

#### 步驟 4：部署後端檔案

1. **複製檔案到正確位置**
   ```bash
   # 將整個 backend 資料夾複製到以下位置：
   
   # XAMPP 用戶：
   C:\xampp\htdocs\online-classes\backend\
   
   # WAMP 用戶：
   C:\wamp64\www\online-classes\backend\
   
   # 完整檔案結構應該是：
   C:\xampp\htdocs\online-classes\backend\
   ├── auth.php
   ├── courses.php
   ├── enrollments.php
   ├── favorites.php
   ├── comment.php
   ├── users.php
   ├── db.php
   └── README.md
   ```

2. **檔案權限設定（Windows 通常自動設定）**
   ```bash
   # 確保檔案可讀取執行
   # Windows 系統通常不需要手動設定權限
   ```

#### 步驟 5：測試部署

1. **測試資料庫連線**
   ```bash
   # 在瀏覽器中訪問：
   http://localhost/online-classes/backend/courses.php?action=list
   
   # 預期回應：
   # []  (空陣列，表示尚無課程資料但連線正常)
   ```

2. **使用 curl 測試（可選）**
   ```bash
   # 如果有安裝 curl，可以在命令列測試：
   curl "http://localhost/online-classes/backend/courses.php?action=list"
   ```

3. **常見測試端點**
   ```bash
   # 測試課程列表
   http://localhost/online-classes/backend/courses.php?action=list
   
   # 測試用戶註冊（POST 請求，需要使用 Postman 或前端）
   http://localhost/online-classes/backend/auth.php?action=register
   ```

### 🔧 進階設定（可選）

#### 虛擬主機設定
如果想使用自定義域名（如 `online-classes.local`）：

1. **編輯 hosts 檔案**
   ```bash
   # 使用管理員權限編輯：
   C:\Windows\System32\drivers\etc\hosts
   
   # 添加以下行：
   127.0.0.1    online-classes.local
   ```

2. **Apache 虛擬主機設定**
   ```apache
   # 編輯 C:\xampp\apache\conf\extra\httpd-vhosts.conf
   # 添加：
   <VirtualHost *:80>
       DocumentRoot "C:/xampp/htdocs/online-classes"
       ServerName online-classes.local
       <Directory "C:/xampp/htdocs/online-classes">
           AllowOverride All
           Require all granted
       </Directory>
   </VirtualHost>
   ```

#### SSL 設定（可選）
```bash
# 啟用 HTTPS（用於生產環境）
# 1. 在 XAMPP Control Panel 中點擊 Apache 的 "Config"
# 2. 選擇 "httpd.conf"
# 3. 取消註解: LoadModule ssl_module modules/mod_ssl.so
# 4. 取消註解: Include conf/extra/httpd-ssl.conf
```

### ❗ 疑難排解

#### 問題 1：Apache 無法啟動
```bash
# 解決方案：
# 1. 檢查 80 端口是否被佔用
# 2. 在 XAMPP Control Panel 點擊 Apache 的 "Config"
# 3. 將端口改為 8080：Listen 8080
# 4. 訪問時使用：http://localhost:8080/online-classes/backend/
```

#### 問題 2：MySQL 無法啟動
```bash
# 解決方案：
# 1. 檢查 3306 端口是否被佔用
# 2. 在服務管理員中停止其他 MySQL 服務
# 3. 重新啟動 XAMPP MySQL
```

#### 問題 3：檔案權限錯誤
```bash
# 解決方案：
# 1. 確保檔案不是唯讀狀態
# 2. 右鍵檔案 → 內容 → 取消勾選 "唯讀"
# 3. 確保 XAMPP 有足夠的權限
```

#### 問題 4：API 回應 500 錯誤
```bash
# 檢查方法：
# 1. 檢視 Apache 錯誤日誌：C:\xampp\apache\logs\error.log
# 2. 檢查 PHP 語法錯誤
# 3. 確認資料庫連線參數正確
```

### 🎯 完成確認清單

- [ ] XAMPP 已安裝並啟動 Apache + MySQL
- [ ] 資料庫 `online_classes` 已建立
- [ ] 所有資料表已建立完成
- [ ] 後端檔案已複製到正確位置
- [ ] 測試 API 端點正常回應
- [ ] 無錯誤訊息出現

完成以上步驟後，您的後端 API 就可以正常使用了！

---

## 🛠️ 技術架構

### 後端技術棧
- **程式語言**: PHP 8.0+
- **資料庫**: MySQL 8.0+
- **資料庫操作**: PDO (PHP Data Objects)
- **API 格式**: RESTful JSON API
- **跨域支援**: CORS Headers
- **開發環境**: XAMPP/WAMP

### 系統特色
- 🔒 用戶認證系統（登入/註冊）
- 📚 完整課程管理功能
- 🎓 學生報名系統
- ❤️ 課程收藏功能
- 💬 課程評論系統
- 👤 用戶資料管理

## 📁 檔案結構

```
backend/
├── auth.php          # 用戶認證 API（登入/註冊）
├── courses.php       # 課程管理 API
├── enrollments.php   # 課程報名 API
├── favorites.php     # 收藏功能 API
├── comment.php       # 評論系統 API
├── users.php         # 用戶資料管理 API
├── db.php           # 資料庫連線設定
└── README.md        # API 文檔
```

## 🚀 API 端點說明

### 基礎設定
- **Base URL**: `http://localhost/online-classes/backend/`
- **Content-Type**: `application/json`
- **支援方法**: GET, POST, OPTIONS
- **跨域支援**: 已啟用 CORS

---

### 🔐 用戶認證 ([`auth.php`](backend/auth.php))

#### 用戶登入
```http
POST /auth.php?action=login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

**回應**:
```json
{
    "success": true,
    "user": {
        "id": 1,
        "name": "張三",
        "email": "user@example.com",
        "gender": "male",
        "birthday": "1990-01-01",
        "role": "student"
    }
}
```

#### 用戶註冊
```http
POST /auth.php?action=register
Content-Type: application/json

{
    "name": "張三",
    "email": "user@example.com",
    "password": "password123",
    "role": "student",
    "gender": "male"
}
```

---

### 📚 課程管理 ([`courses.php`](backend/courses.php))

#### 取得所有課程
```http
GET /courses.php?action=list
```

**回應**:
```json
[
    {
        "id": 1,
        "title": "React.js 入門課程",
        "description": "學習現代前端開發",
        "start_time": "2024-01-15 10:00:00",
        "end_time": "2024-01-15 12:00:00",
        "max_capacity": 30,
        "teacher_id": 2,
        "enrolled_count": 15
    }
]
```

#### 取得特定課程
```http
GET /courses.php?action=get&id=1
```

#### 取得教師的課程
```http
GET /courses.php?action=listByTeacher&teacher_id=2
```

#### 建立新課程（教師）
```http
POST /courses.php?action=create
Content-Type: application/json

{
    "title": "新課程標題",
    "description": "課程描述",
    "start_time": "2024-01-15 10:00:00",
    "end_time": "2024-01-15 12:00:00",
    "max_capacity": 30,
    "teacher_id": 2
}
```

#### 更新課程（教師）
```http
POST /courses.php?action=update
Content-Type: application/json

{
    "course_id": 1,
    "title": "更新的課程標題",
    "description": "更新的課程描述",
    "max_capacity": 35,
    "start_time": "2024-01-15 10:00:00",
    "end_time": "2024-01-15 12:00:00"
}
```

#### 刪除課程（教師）
```http
POST /courses.php?action=delete
Content-Type: application/json

{
    "course_id": 1
}
```

#### 取得課程報名學生
```http
GET /courses.php?action=enrolled_students&course_id=1
```

---

### 🎓 課程報名 ([`enrollments.php`](backend/enrollments.php))

#### 報名課程
```http
POST /enrollments.php?action=add
Content-Type: application/json

{
    "student_id": 1,
    "course_id": 1
}
```

#### 取得學生已報名課程
```http
GET /enrollments.php?action=list&student_id=1
```

#### 取消課程報名
```http
POST /enrollments.php?action=delete
Content-Type: application/json

{
    "student_id": 1,
    "course_id": 1
}
```

---

### ❤️ 收藏功能 ([`favorites.php`](backend/favorites.php))

#### 收藏課程
```http
POST /favorites.php?action=add
Content-Type: application/json

{
    "student_id": 1,
    "course_id": 1
}
```

#### 移除收藏
```http
POST /favorites.php?action=remove
Content-Type: application/json

{
    "student_id": 1,
    "course_id": 1
}
```

#### 取得學生收藏課程
```http
GET /favorites.php?action=listByStudent&id=1
```

---

### 💬 評論系統 ([`comment.php`](backend/comment.php))

#### 新增評論
```http
POST /comment.php?action=add
Content-Type: application/json

{
    "user_id": 1,
    "course_id": 1,
    "content": "這個課程很棒！"
}
```

#### 取得課程評論
```http
GET /comment.php?action=list&course_id=1
```

**回應**:
```json
[
    {
        "id": 1,
        "content": "這個課程很棒！",
        "created_at": "2024-01-15 14:30:00",
        "user_name": "張三"
    }
]
```

#### 刪除評論
```http
POST /comment.php?action=delete&id=1
```

---

### 👤 用戶管理 ([`users.php`](backend/users.php))

#### 更新用戶資料
```http
POST /users.php?action=update
Content-Type: application/json

{
    "id": 1,
    "name": "新姓名",
    "gender": "male",
    "birthday": "1990-01-01",
    "password": "新密碼"  // 選填
}
```

## 🗄️ 資料庫設計

### 核心資料表

#### `users` - 用戶表
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| name | VARCHAR(100) | 用戶姓名 |
| email | VARCHAR(150) | 電子郵件（唯一） |
| password | VARCHAR(255) | 密碼 |
| role | ENUM | 角色（student/teacher） |
| gender | ENUM | 性別（male/female） |
| birthday | DATE | 生日 |
| created_at | TIMESTAMP | 建立時間 |

#### `courses` - 課程表
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| title | VARCHAR(200) | 課程標題 |
| description | TEXT | 課程描述 |
| start_time | DATETIME | 開始時間 |
| end_time | DATETIME | 結束時間 |
| max_capacity | INT | 最大人數 |
| teacher_id | INT | 教師 ID（外鍵） |
| created_at | TIMESTAMP | 建立時間 |

#### `enrollments` - 報名表
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| student_id | INT | 學生 ID（外鍵） |
| course_id | INT | 課程 ID（外鍵） |
| enrolled_at | TIMESTAMP | 報名時間 |

#### `favorites` - 收藏表
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| student_id | INT | 學生 ID（外鍵） |
| course_id | INT | 課程 ID（外鍵） |
| created_at | TIMESTAMP | 收藏時間 |

#### `course_comments` - 評論表
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | INT | 主鍵，自動遞增 |
| user_id | INT | 用戶 ID（外鍵） |
| course_id | INT | 課程 ID（外鍵） |
| content | TEXT | 評論內容 |
| created_at | TIMESTAMP | 評論時間 |

## 🛡️ 安全性說明

### ⚠️ 重要安全提醒

**當前代碼存在安全風險，僅適用於開發環境**

### 已知安全問題
1. **密碼明文儲存** - 生產環境需要密碼雜湊
2. **SQL 注入風險** - 需要更嚴格的輸入驗證
3. **無會話管理** - 缺乏 JWT 或 Session 機制
4. **CORS 過於寬鬆** - 允許所有來源存取

### 生產環境建議
```php
// 密碼加密範例
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// 密碼驗證範例
if (password_verify($password, $user['password'])) {
    // 登入成功
}

// 輸入驗證範例
$email = filter_var($email, FILTER_VALIDATE_EMAIL);
if (!$email) {
    throw new InvalidArgumentException('無效的電子郵件格式');
}
```

## 🐛 疑難排解

### 常見問題

#### 1. 資料庫連線失敗
- 檢查 MySQL 服務是否啟動
- 確認 [`db.php`](backend/db.php) 中的連線參數
- 檢查資料庫是否存在

#### 2. CORS 錯誤
- 確認 HTTP 標頭設定正確
- 檢查前端請求的網域是否被允許

#### 3. API 無回應
- 檢查 PHP 錯誤日誌
- 確認檔案路徑和權限
- 檢查 Apache/Nginx 設定

#### 4. JSON 解析錯誤
- 確認請求的 Content-Type 為 `application/json`
- 檢查 JSON 格式是否正確

### 除錯技巧
```php
// 開啟錯誤顯示（僅開發環境）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 日誌記錄
error_log("API Debug: " . json_encode($data));
```

## 📊 效能優化建議

### 資料庫優化
```sql
-- 建立索引提升查詢效能
CREATE INDEX idx_course_teacher ON courses(teacher_id);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_course ON enrollments(course_id);
CREATE INDEX idx_favorites_student ON favorites(student_id);
CREATE INDEX idx_comments_course ON course_comments(course_id);
```

### API 快取
```php
// HTTP 快取標頭
header('Cache-Control: public, max-age=300'); // 5分鐘快取
header('ETag: "' . md5($data) . '"');
```

## 📝 開發規範

### 程式碼風格
- 使用 PSR-4 自動載入標準
- 遵循 PSR-12 程式碼風格指南
- 使用有意義的變數和函數命名

### 錯誤處理
```php
try {
    // 資料庫操作
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => '伺服器內部錯誤']);
    exit;
}
```

## 🔄 版本控制

### API 版本化建議
```
backend/
├── v1/
│   ├── auth.php
│   ├── courses.php
│   └── ...
└── v2/
    ├── auth.php
    ├── courses.php
    └── ...
```

## 📚 相關資源

- [PHP 官方文檔](https://www.php.net/docs.php)
- [MySQL 官方文檔](https://dev.mysql.com/doc/)
- [PDO 教學](https://www.php.net/manual/en/book.pdo.php)
- [RESTful API 設計指南](https://restfulapi.net/)

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權聲明

本專案由 Wei-chun Chen 設計開發，僅供學習使用。

---

**感謝您使用 Online Classes 線上課程學習平台後端系統！** 🚀
