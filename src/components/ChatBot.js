import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../App.css';

// Gemini API 設定 - 使用多個 API 金鑰輪換使用
const API_KEYS = [
  'AIzaSyC-HdTRBunnWYKntqFuR2ZAD-jj2IkJhqU',
  // 可以添加多個 API 金鑰在這裡，每個金鑰都有自己的配額
];

// 選擇一個可用的 API 金鑰
function getAvailableApiKey() {
  // 從 localStorage 讀取每個金鑰的使用情況
  const today = new Date().toLocaleDateString();
  
  for (const key of API_KEYS) {
    const keyUsage = parseInt(localStorage.getItem(`api_usage_${key}_${today}`) || '0');
    if (keyUsage < 50) { // 每個金鑰每天使用限制設為 50
      return key;
    }
  }
  
  // 如果所有金鑰都達到限制，返回 null
  return null;
}

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [apiKey, setApiKey] = useState(getAvailableApiKey());
  const [apiUsage, setApiUsage] = useState({ daily: 0, limit: 50 });
  const messageEndRef = useRef(null);
  
  // 初始化時載入所有課程及檢查 API 可用性
  useEffect(() => {
    fetchCourses();
    
    // 檢查 API 可用性
    const availableKey = getAvailableApiKey();
    setApiKey(availableKey);
    setIsApiAvailable(!!availableKey);
    
    if (availableKey) {
      const today = new Date().toLocaleDateString();
      const keyUsage = parseInt(localStorage.getItem(`api_usage_${availableKey}_${today}`) || '0');
      setApiUsage(prev => ({ ...prev, daily: keyUsage }));
    }
  }, []);
  
  // 自動捲動至最新訊息
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 更新 API 使用量
  const updateApiUsage = () => {
    if (!apiKey) return;
    
    const today = new Date().toLocaleDateString();
    const keyUsage = parseInt(localStorage.getItem(`api_usage_${apiKey}_${today}`) || '0') + 1;
    
    localStorage.setItem(`api_usage_${apiKey}_${today}`, keyUsage.toString());
    setApiUsage(prev => ({ ...prev, daily: keyUsage }));
    
    // 如果接近限制，顯示警告
    if (keyUsage >= apiUsage.limit * 0.8) {
      console.warn(`API 使用量警告: 已使用 ${keyUsage}/${apiUsage.limit} (${Math.round(keyUsage/apiUsage.limit*100)}%)`);
    }
    
    // 如果超過限制，嘗試切換金鑰
    if (keyUsage >= apiUsage.limit) {
      const newKey = getAvailableApiKey();
      if (newKey) {
        setApiKey(newKey);
        const newKeyUsage = parseInt(localStorage.getItem(`api_usage_${newKey}_${today}`) || '0');
        setApiUsage(prev => ({ ...prev, daily: newKeyUsage }));
      } else {
        setIsApiAvailable(false);
      }
    }
  };

  // 獲取所有課程資料
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=list');
      if (!response.ok) {
        throw new Error(`HTTP 錯誤 ${response.status}`);
      }
      
      const data = await response.json();
      setCourses(data);
      console.log('已載入課程數據:', data.length, '門課程');
    } catch (error) {
      console.error('獲取課程資料失敗:', error);
      setTimeout(() => {
        if (isOpen && messages.length > 0) {
          setMessages(prev => [...prev, { 
            sender: 'bot', 
            text: '課程資料載入失敗，某些功能可能無法正常工作。請稍後重試。' 
          }]);
        }
      }, 1000);
    }
  };

  // 獲取課程的報名人數
  const fetchEnrolledCount = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:8080/Online-Classes/back/courses.php?action=getEnrolledCount&course_id=${courseId}`);
      if (!response.ok) {
        throw new Error(`HTTP 錯誤 ${response.status}`);
      }
      
      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error(`獲取課程 ${courseId} 的報名人數失敗:`, error);
      return 0;
    }
  };

  // 推薦課程
  const getRandomCourses = (count = 3) => {
    if (!courses || courses.length === 0) return [];
    
    // 隨機選擇課程
    const shuffled = [...courses].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, courses.length));
  };

  // 查找特定課程
  const findCoursesByKeyword = (keyword) => {
    if (!courses || courses.length === 0) return [];
    return courses.filter(course => 
      course.title.toLowerCase().includes(keyword.toLowerCase()) || 
      course.description.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 本地處理常見問題 - 大幅增強本地回答能力
  const handleCommonQuestions = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    // 課程推薦
    if (msg.includes('推薦') || msg.includes('建議') || msg.includes('課程推薦') || msg.includes('有什麼課程')) {
      const recommendedCourses = getRandomCourses(3);
      if (recommendedCourses.length > 0) {
        return `以下是我為您推薦的課程：\n\n${
          recommendedCourses.map((course, index) => 
            `${index + 1}. ${course.title} - ${course.teacher_name} 教授\n   ${course.description.substring(0, 50)}...`
          ).join('\n\n')
        }\n\n您對哪一門課程有興趣呢？`;
      } else {
        return '目前沒有可推薦的課程，請稍後再試。';
      }
    }
    
    // 課程搜尋
    if (msg.includes('搜尋') || msg.includes('查詢') || msg.includes('尋找') || 
        (msg.includes('課程') && (msg.includes('有') || msg.includes('關於') || msg.includes('找')))) {
      // 擷取可能的關鍵字
      const potentialKeywords = msg.split(/\s+|[,，、。？?!！:：;；]+/);
      const ignoreWords = ['搜尋', '查詢', '尋找', '課程', '請問', '有沒有', '是否有', '我想', '知道', '了解', '學習', '關於', '想要', '找', '那些', '哪些'];
      
      const keywords = potentialKeywords
        .filter(w => w.length > 1)
        .filter(w => !ignoreWords.includes(w));
      
      if (keywords.length > 0) {
        let results = [];
        for (const keyword of keywords) {
          const found = findCoursesByKeyword(keyword);
          results = [...results, ...found];
        }
        
        // 去除重複課程
        results = [...new Map(results.map(item => [item.id, item])).values()];
        
        if (results.length > 0) {
          return `找到 ${results.length} 門相關課程：\n\n${
            results.slice(0, 3).map((course, index) => 
              `${index + 1}. ${course.title} - ${course.teacher_name} 教授\n   ${course.description.substring(0, 50)}...`
            ).join('\n\n')
          }${results.length > 3 ? '\n\n...還有更多課程。請更具體說明您想找的課程。' : ''}`;
        } else {
          return '很抱歉，沒有找到符合您描述的課程。您可以：\n1. 嘗試使用不同的關鍵字\n2. 輸入「推薦課程」來查看熱門課程';
        }
      } else {
        const recommendedCourses = getRandomCourses(3);
        return `請提供更具體的關鍵字來搜尋課程。您可以輸入課程主題、教師名稱或課程名稱的一部分。\n\n以下是一些熱門課程供您參考：\n\n${
          recommendedCourses.map((course, index) => 
            `${index + 1}. ${course.title} - ${course.teacher_name} 教授`
          ).join('\n')
        }`;
      }
    }
    
    // 平台介紹
    if (msg.includes('平台') && (msg.includes('介紹') || msg.includes('什麼') || msg.includes('是什麼'))) {
      return '這是一個線上課程學習平台，提供多種領域的優質課程。您可以瀏覽課程、報名學習、收藏喜愛的課程，以及與講師互動。若您想了解特定課程，可以告訴我課程名稱或相關領域。';
    }
    
    // 課程報名
    if (msg.includes('報名') || msg.includes('註冊') || msg.includes('加入') || msg.includes('選課')) {
      return '要報名課程，請先登入您的帳戶，然後瀏覽課程頁面。在感興趣的課程詳情頁面中，您可以點擊「報名課程」按鈕來完成報名。如有任何疑問，請聯繫平台客服。';
    }
    
    // 帳戶問題
    if (msg.includes('帳戶') || msg.includes('帳號') || msg.includes('登入') || msg.includes('註冊') || msg.includes('密碼')) {
      return '關於帳戶問題，您可以在網站右上角找到登入/註冊按鈕。如果您忘記密碼，可以使用「忘記密碼」功能重設。若有其他帳戶相關問題，請聯繫平台管理員。';
    }
    
    // 學習進度
    if (msg.includes('進度') || msg.includes('完成') || msg.includes('學習狀況')) {
      return '您可以在「我的課程」頁面中查看已報名課程的學習進度。每完成一個課程單元，系統會自動更新您的進度。您也可以在課程詳情頁面查看更詳細的學習情況。';
    }

    // 課程數量
    if ((msg.includes('有幾門') || msg.includes('多少門') || msg.includes('課程數量')) && msg.includes('課程')) {
      return `目前平台上共有 ${courses.length} 門課程，涵蓋多個領域。您可以輸入「推薦課程」來查看一些熱門課程，或者輸入特定關鍵字搜尋您感興趣的課程。`;
    }
    
    // 幫助指令
    if (msg.includes('幫助') || msg.includes('說明') || msg.includes('指令') || msg.includes('怎麼用') || msg.includes('如何使用')) {
      return '您可以使用以下功能：\n\n' +
        '1. 輸入「推薦課程」獲取課程推薦\n' +
        '2. 輸入「搜尋 [關鍵字]」尋找相關課程\n' +
        '3. 詢問特定課程的詳細資訊\n' +
        '4. 詢問關於課程報名、帳戶、學習進度等問題\n\n' +
        '請問您需要哪方面的協助？';
    }
    
    // 課程詳細內容的關鍵字識別 (嘗試識別特定課程的查詢)
    const courseMatch = courses.find(course => 
      msg.includes(course.title.toLowerCase()) || 
      (course.title.length > 5 && 
       course.title.split(' ').some(word => word.length > 3 && msg.includes(word.toLowerCase())))
    );
    
    if (courseMatch) {
      return `關於「${courseMatch.title}」課程：\n\n` +
        `授課教師：${courseMatch.teacher_name}\n` +
        `課程人數上限：${courseMatch.max_capacity}\n` +
        `課程時間：${courseMatch.start_time} ~ ${courseMatch.end_time}\n\n` +
        `課程簡介：${courseMatch.description.substring(0, 150)}${courseMatch.description.length > 150 ? '...' : ''}\n\n` +
        `您可以點擊課程頁面進一步了解詳情和報名。`;
    }
    
    // 對於直接詢問特定領域的課程
    const domains = ['程式設計', '設計', '行銷', '商業', '語言', '資料', '人工智能', 'AI', '科學', '藝術', '音樂', '健康', '社會', '創業', '管理'];
    for (const domain of domains) {
      if (msg.includes(domain)) {
        const domainCourses = courses.filter(course => 
          course.title.includes(domain) || 
          course.description.includes(domain)
        );
        
        if (domainCourses.length > 0) {
          return `關於「${domain}」相關的課程，我找到了 ${domainCourses.length} 門：\n\n${
            domainCourses.slice(0, 3).map((course, index) => 
              `${index + 1}. ${course.title} - ${course.teacher_name} 教授`
            ).join('\n\n')
          }${domainCourses.length > 3 ? '\n\n...還有更多相關課程。' : ''}`;
        }
      }
    }
    
    // 增強型關鍵字搜尋 (當所有其他方法都失敗時使用)
    if (msg.length > 5) {
      const words = msg.split(/\s+/).filter(w => w.length > 1);
      if (words.length > 0) {
        let allMatches = [];
        
        for (const word of words) {
          if (word.length >= 2) {
            const matches = findCoursesByKeyword(word);
            allMatches.push(...matches);
          }
        }
        
        // 去除重複課程
        const uniqueMatches = [...new Map(allMatches.map(item => [item.id, item])).values()];
        
        if (uniqueMatches.length > 0) {
          return `根據您的問題，以下是可能相關的課程：\n\n${
            uniqueMatches.slice(0, 2).map((course, index) => 
              `${index + 1}. ${course.title} - ${course.teacher_name} 教授`
            ).join('\n\n')
          }`;
        }
      }
    }
    
    // 未能匹配任何內容時，依舊返回 null 讓 API 處理
    return null;
  };

  // 處理機器人訊息
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // 新增用戶訊息
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);
    
    try {
      // 先檢查是否有課程數據
      if (courses.length === 0) {
        console.warn('課程數據未載入，嘗試重新獲取');
        await fetchCourses();
      }
      
      // 優先檢查常見問題的本地回應
      let botResponse = handleCommonQuestions(userMessage);
      
      // 如果沒有本地處理，則使用 API (如果可用)
      if (!botResponse) {
        // 檢查 API 是否可用
        if (!isApiAvailable || !apiKey) {
          botResponse = '很抱歉，AI 回應服務暫時不可用。您可以使用以下功能：\n\n- 輸入「推薦課程」獲取課程推薦\n- 輸入「搜尋 [關鍵字]」尋找相關課程\n- 輸入「幫助」查看所有功能';
        } else {
          try {
            // 建立新的 GenAI 實例，使用當前可用的 API 金鑰
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
            
            // 只發送與用戶查詢最相關的課程，最多3門
            const relevantCourses = [];
            const keywords = userMessage.split(/\s+/).filter(w => w.length > 1);
            
            if (keywords.length > 0) {
              for (const keyword of keywords) {
                const found = findCoursesByKeyword(keyword);
                relevantCourses.push(...found);
                if (relevantCourses.length >= 3) break; // 減少到最多3門課程
              }
            }
            
            // 如果沒找到相關課程，則添加1門隨機課程作為參考
            if (relevantCourses.length === 0) {
              relevantCourses.push(getRandomCourses(1)[0]);
            }
            
            // 去除重複課程
            const uniqueCourses = [...new Map(relevantCourses.map(item => [item.id, item])).values()];
            
            // 使用簡化版的課程數據，減少 token 使用量
            const simplifiedCourses = uniqueCourses.map(course => ({
              id: course.id,
              title: course.title,
              teacher: course.teacher_name,
              brief: course.description.substring(0, 50) + '...'
            }));
            
            // 生成更簡潔的內容請求
            const chatContext = `
              你是線上課程平台的智能客服機器人。請簡短回答用戶問題。
              可用課程: ${JSON.stringify(simplifiedCourses)}
              用戶問題: ${userMessage}
            `;

            const result = await model.generateContent([chatContext]);
            updateApiUsage(); // 更新 API 使用量
            botResponse = result.response.text();
          } catch (apiError) {
            console.error('API 調用錯誤:', apiError);
            
            // 檢查是否是配額錯誤
            if (apiError.toString().includes('429')) {
              // 嘗試獲取新的 API 金鑰
              const newKey = getAvailableApiKey();
              if (newKey && newKey !== apiKey) {
                setApiKey(newKey);
                botResponse = '我需要思考一下您的問題。請稍後再問我一次，或是輸入「推薦課程」來查看熱門課程。';
              } else {
                setIsApiAvailable(false);
                botResponse = '很抱歉，AI 回應服務已達到今日使用限制。您可以使用以下功能：\n\n- 輸入「推薦課程」獲取課程推薦\n- 輸入「搜尋 [關鍵字]」尋找相關課程';
              }
            } else {
              botResponse = '抱歉，我暫時無法回答這個問題。您可以嘗試：\n\n- 輸入「推薦課程」獲取課程推薦\n- 輸入「搜尋 [關鍵字]」尋找相關課程';
            }
          }
        }
      }
      
      // 新增機器人回應
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        setIsLoading(false);
      }, 500); // 加入些微延遲，模擬思考時間
      
    } catch (error) {
      console.error('處理訊息時發生錯誤:', error);
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `抱歉，處理您的請求時遇到問題。請稍後再試或使用「推薦課程」功能查看熱門課程。` 
      }]);
      setIsLoading(false);
    }
  };

  // 切換聊天視窗
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // 首次開啟時顯示歡迎訊息
      setMessages([{ 
        sender: 'bot', 
        text: '您好！我是線上課程平台的客服機器人。您可以詢問我關於課程的任何問題，或是輸入「推薦課程」讓我為您推薦適合的課程。' 
      }]);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: 0 }}>課程客服助手</h3>
              {apiUsage.daily > 0 && apiKey && (
                <small style={{ 
                  fontSize: '11px', 
                  color: apiUsage.daily > apiUsage.limit * 0.8 ? '#ff4d4d' : '#888',
                  marginTop: '2px'
                }}>
                  API 用量: {apiUsage.daily}/{apiUsage.limit}
                  {!isApiAvailable && ' (已達上限)'}
                </small>
              )}
            </div>
            <button className="close-button" onClick={toggleChat}>×</button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                <div className={`message-bubble ${message.sender}`}>
                  {message.text.split('\n').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i < message.text.split('\n').length - 1 ? <br /> : null}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-bubble bot typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="請輸入您的問題..."
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              <svg viewBox="0 0 24 24" height="24" width="24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" height="24" width="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" height="24" width="24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}

export default ChatBot;