# Online Classes 線上課程平台 - 前端文檔

## 📋 系統整體介紹

這是一個基於 React.js 開發的現代化線上課程平台前端應用程式，提供完整的課程管理、學習與互動功能。平台支援多語言國際化、響應式設計，並整合了智能聊天機器人客服系統。

### 🎯 平台特色
- **現代化 UI 設計** - 採用漸層色彩與卡片式設計
- **多角色支援** - 學生與教師分別擁有不同功能權限
- **國際化支援** - 支援繁體中文、英文、日文三種語言
- **響應式設計** - 完美適配桌面、平板與手機設備
- **智能客服** - 整合 Google Gemini AI 的聊天機器人

## 🚀 系統功能逐項介紹

### 👤 用戶管理系統
- **註冊登入功能**
  - 分步驟註冊流程，資料驗證完整
  - Gmail 帳號驗證機制
  - 支援學生、教師角色選擇
  - 個人資料編輯與密碼更新

### 📚 課程管理功能

#### 🎓 學生功能
- **課程瀏覽**
  - 首頁輪播圖展示熱門課程
  - 網格式課程卡片展示
  - 即時搜尋功能
  - 課程額滿狀態顯示
  
- **課程收藏**
  - 愛心圖標收藏功能
  - 我的收藏頁面管理
  - 懸停互動效果

- **課程報名**
  - 一鍵加入課程
  - 人數限制檢查
  - 我的課程管理
  - 課程退出功能

- **互動功能**
  - 課程評論系統
  - 學習進度追蹤

#### 👨‍🏫 教師功能
- **課程創建**
  - 完整的課程資訊編輯
  - 時間排程設定
  - 人數上限管理
  
- **課程管理**
  - 課程列表檢視
  - 課程資訊編輯
  - 課程刪除功能
  - 報名學生統計

### 🌍 多語言系統
- **語言切換**
  - 即時語言轉換
  - 完整翻譯覆蓋
  - 本地化儲存

### 🤖 智能客服系統
- **AI 聊天機器人**
  - Google Gemini API 整合
  - 課程推薦功能
  - 常見問題自動回答
  - 課程搜尋協助

## 🏗 系統設計與架構

### 技術架構
```
前端技術棧
├── React 18              # 主要框架
├── React Router DOM      # 路由管理
├── React Hooks          # 狀態管理
├── React-i18next        # 國際化
├── SweetAlert2          # 彈窗提示
├── React Icons          # 圖標庫
└── CSS3                 # 樣式設計
```

### 設計模式
- **組件化設計** - 高度模組化的 React 組件
- **Hook 驅動** - 使用 React Hooks 進行狀態管理
- **響應式布局** - CSS Grid 與 Flexbox 設計
- **主題色彩系統** - CSS 變數統一管理

### API 整合
```javascript
// API 端點配置
const API_BASE = 'http://localhost:8080/Online-Classes/back/';

// 主要 API 端點
- courses.php     // 課程管理
- auth.php        // 用戶認證
- enrollments.php // 報名管理
- favorites.php   // 收藏功能
- comments.php    // 評論系統
- users.php       // 用戶資料
```

## 🧩 Components 組件架構

### 核心組件

#### `App.js`
**主應用程式組件**
- 全局路由配置
- 用戶狀態管理
- 組件間數據傳遞

````javascript
// filepath: [App.js](http://_vscodecontentref_/0)
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // ...
}