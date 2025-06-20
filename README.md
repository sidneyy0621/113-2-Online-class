# Online Classes - 線上課程學習平台

## 📖 系統整體介紹

Online Classes 是一個現代化的線上課程學習平台，提供學生和教師之間互動學習的完整解決方案。平台採用 React.js 前端框架配合 PHP 後端 API 開發，具備響應式設計，支援多語言介面（繁體中文、英文、日文），並整合了智能聊天機器人功能。

### 🌟 主要特色

- 🎨 現代化使用者介面設計
- 📱 完全響應式佈局，支援各種裝置
- 🌐 多語言支援（繁中/英文/日文）
- 🤖 AI 智能課程推薦機器人
- ❤️ 課程收藏功能
- 💬 課程評論系統
- 🎪 動態輪播展示熱門課程
- 🔐 安全的使用者認證系統
- 📊 完整的課程管理功能

## 🛠️ 技術架構

### 前端技術棧

- **框架**: React.js 18
- **路由**: React Router DOM
- **狀態管理**: React Hooks (useState, useEffect)
- **樣式**: CSS3 + CSS Variables
- **國際化**: react-i18next
- **UI 組件**: React Icons
- **通知系統**: SweetAlert2
- **AI 整合**: Google Gemini API

### 後端技術棧

- **語言**: PHP 8.x
- **資料庫**: MySQL
- **資料庫操作**: PDO (PHP Data Objects)
- **API 格式**: RESTful JSON API
- **跨域支援**: CORS Headers

### 系統架構圖

```
┌─────────────────┐    HTTP/JSON     ┌─────────────────┐
│   Frontend      │ ───────────────► │   Backend       │
│   (React.js)    │                  │   (PHP + MySQL) │
├─────────────────┤                  ├─────────────────┤
│ • 使用者介面     │                  │ • RESTful API   │
│ • 路由管理       │                  │ • 使用者認證    │
│ • 狀態管理       │                  │ • 資料庫操作    │
│ • AI 聊天機器人  │                  │ • 課程管理      │
└─────────────────┘                  └─────────────────┘
```

## 📁 專案結構

### 前端結構

```
src/
├── components/
│   ├── Header.js           # 導航頭部組件
│   ├── Footer.js           # 頁腳組件
│   ├── CourseList.js       # 課程列表
│   ├── CourseDetail.js     # 課程詳情
│   ├── MyCourses.js        # 學生課程管理
│   ├── TeacherCourses.js   # 教師課程管理
│   ├── Myfavoite.js        # 收藏功能
│   ├── ChatBot.js          # AI 聊天機器人
│   ├── Carousel.js         # 輪播組件
│   ├── LoginRegister.js    # 登入註冊
│   ├── EditProfile.js      # 個人資料編輯
│   └── CourseComments.js   # 評論系統
├── App.js                  # 主應用程式
├── App.css                 # 主樣式表
├── i18n.js                 # 國際化設定
└── index.js                # 應用程式入口點
```

### 後端結構

```
backend/
├── auth.php          # 使用者認證 API
├── courses.php       # 課程管理 API
├── enrollments.php   # 課程報名 API
├── favorites.php     # 收藏功能 API
├── comment.php       # 評論系統 API
├── users.php         # 使用者管理 API
└── db.php           # 資料庫連線設定
```

## 🗄️ 資料庫設計

### 資料表結構

#### `users` - 使用者表
```sql
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
```

#### `courses` - 課程表
```sql
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
```

#### `enrollments` - 課程報名表
```sql
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_enrollment (student_id, course_id)
);
```

#### `favorites` - 收藏表
```sql
CREATE TABLE favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_favorite (student_id, course_id)
);
```

#### `course_comments` - 課程評論表
```sql
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

## 🚀 API 端點說明

### 認證相關 (`auth.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/auth.php?action=login` | 使用者登入 |
| POST | `/auth.php?action=register` | 使用者註冊 |

### 課程管理 (`courses.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| GET | `/courses.php?action=list` | 取得所有課程列表 |
| GET | `/courses.php?action=get&id={id}` | 取得特定課程詳情 |
| GET | `/courses.php?action=listByTeacher&teacher_id={id}` | 取得教師的課程 |
| GET | `/courses.php?action=enrolled_students&course_id={id}` | 取得課程報名學生 |
| POST | `/courses.php?action=create` | 建立新課程 |
| POST | `/courses.php?action=update` | 更新課程資訊 |
| POST | `/courses.php?action=delete` | 刪除課程 |

### 課程報名 (`enrollments.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/enrollments.php?action=add` | 報名課程 |
| GET | `/enrollments.php?action=list&student_id={id}` | 取得學生已報名課程 |
| POST | `/enrollments.php?action=delete` | 取消課程報名 |

### 收藏功能 (`favorites.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/favorites.php?action=add` | 收藏課程 |
| POST | `/favorites.php?action=remove` | 移除收藏 |
| GET | `/favorites.php?action=listByStudent&id={id}` | 取得學生收藏課程 |

### 評論系統 (`comment.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/comment.php?action=add` | 新增評論 |
| GET | `/comment.php?action=list&course_id={id}` | 取得課程評論 |
| POST | `/comment.php?action=delete&id={id}` | 刪除評論 |

### 使用者管理 (`users.php`)

| 方法 | 端點 | 描述 |
|------|------|------|
| POST | `/users.php?action=update` | 更新使用者資料 |

## 🎯 系統功能介紹

### 1. 使用者管理系統

#### 🔐 註冊登入功能
- 支援學生和教師角色註冊
- Email 帳號驗證機制
- 安全的使用者認證系統

#### 👤 個人資料管理
- 編輯個人基本資料（姓名、性別、生日）
- 修改密碼功能
- 角色權限管理

### 2. 課程管理系統

#### 👨‍🎓 學生功能

**課程瀏覽** (`CourseList.js`)
- 瀏覽所有可用課程
- 課程搜尋與篩選
- 查看課程詳細資訊
- 課程報名功能

**我的課程** (`MyCourses.js`)
- 查看已報名課程列表
- 課程學習進度追蹤
- 快速進入課程詳情

**收藏功能** (`Myfavoite.js`)
- 收藏喜愛的課程
- 管理收藏課程列表
- 一鍵移除收藏

#### 👨‍🏫 教師功能

**課程創建與管理** (`TeacherCourses.js`)
- 新增課程資訊
- 編輯課程內容
- 刪除課程
- 查看課程報名狀況
- 管理課程報名學生名單

### 3. 課程詳情系統 (`CourseDetail.js`)

- **詳細課程資訊顯示**
  - 課程時間安排
  - 報名人數統計
  - 課程描述與大綱
  
- **互動功能**
  - 課程報名/退選
  - 課程評論系統
  - 社群互動

### 4. 評論系統 (`CourseComments.js`)

- 學生課程評論功能
- 評論時間戳記
- 即時評論更新
- 評論內容管理

### 5. 智能聊天機器人 (`ChatBot.js`)

- **AI 課程推薦**
  - 基於 Google Gemini API
  - 智能課程匹配
  - 個人化推薦系統
  
- **常見問題解答**
  - 平台使用指南
  - 課程相關諮詢
  - 即時客服支援

### 6. 動態輪播系統 (`Carousel.js`)

- 熱門課程展示
- 自動輪播功能
- 觸控手勢支援
- 鍵盤導航控制

### 7. 多語言系統 (`i18n.js`)

- 繁體中文、英文、日文支援
- 動態語言切換
- 完整介面翻譯

## ⚙️ 環境設置

### 系統需求

#### 前端需求
- Node.js 16.0 或更高版本
- npm 8.0 或更高版本
- 現代瀏覽器 (Chrome, Firefox, Safari, Edge)

#### 後端需求
- PHP 8.0 或更高版本
- MySQL 8.0 或更高版本
- Apache/Nginx 網頁伺服器
- XAMPP/WAMP (開發環境)

### 🚀 安裝步驟

#### 1. 下載專案

```bash
git clone <repository-url>
cd online-classes
```

#### 2. 後端設置

**資料庫設置**
1. 啟動 MySQL 服務
2. 建立資料庫 `online_classes`
3. 匯入資料表結構（參考上方資料庫設計）

**設定資料庫連線**
編輯 `backend/db.php`：
```php
$host = 'localhost';
$db   = 'online_classes';
$user = 'your_username';
$pass = 'your_password';
$charset = 'utf8mb4';
```

**部署後端 API**
將 `backend/` 資料夾放置到網頁伺服器目錄（如 `htdocs/Online-Classes/back/`）

#### 3. 前端設置

**安裝依賴套件**
```bash
npm install
```

**環境變數設定**
建立 `.env` 檔案：
```env
REACT_APP_API_URL=http://localhost:8080/Online-Classes/back
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

**啟動開發伺服器**
```bash
npm start
```

應用程式將在 [http://localhost:3000](http://localhost:3000) 上運行

### 📝 可用腳本

#### `npm start`
在開發模式下運行應用程式，支援熱重載功能

#### `npm test`
啟動測試運行器，執行單元測試

#### `npm run build`
建構生產版本應用程式，輸出到 `build/` 資料夾

#### `npm run eject`
⚠️ **單向操作**：移除 Create React App 的建構配置抽象

## 🔧 開發工具建議

### IDE 推薦
- **Visual Studio Code**

### 推薦擴充套件
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer
- PHP Intelephense (後端開發)

### 瀏覽器支援
- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 🚨 重要安全提醒

⚠️ **當前代碼存在安全風險，僅適用於開發環境**

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
```

## 🐛 疑難排解

### 常見問題

#### 1. 無法連接到後端 API
- 檢查 `.env` 中的 `REACT_APP_API_URL` 設定
- 確認後端伺服器正常運行
- 檢查 CORS 設定

#### 2. 資料庫連線失敗
- 確認 MySQL 服務已啟動
- 檢查 `db.php` 中的連線參數
- 確認資料庫和資料表已建立

#### 3. 前端建構失敗
參考 [Create React App 疑難排解](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

#### 4. AI 聊天機器人無法使用
- 檢查 Gemini API 金鑰是否正確設定
- 確認網路連線正常
- 檢查 API 配額是否超出限制

## 📚 學習資源

- [React 官方文檔](https://reactjs.org/)
- [Create React App 文檔](https://facebook.github.io/create-react-app/docs/getting-started)
- [PHP 官方文檔](https://www.php.net/docs.php)
- [MySQL 官方文檔](https://dev.mysql.com/doc/)

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權聲明

本專案由 Wei-chun Chen 設計開發，僅供學習使用。

Copyright © 線上課程平台 All Rights Reserved.

---

## 🙋‍♂️ 聯絡資訊

如有任何問題或建議，歡迎聯絡：

- 作者：Wei-chun Chen
- 專案用途：學習與教育

**感謝您使用 Online Classes 線上課程學習平台！** 🎓#   1 1 3 - 2 O n l i n e - C l a s s e s 
 
 #   1 1 3 - 2 - O n l i n e - c l a s s 
 
 