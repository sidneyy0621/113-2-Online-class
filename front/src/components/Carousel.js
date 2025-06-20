import React, { useEffect, useState, useRef } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

const Carousel = ({ onSelectCourse, courses = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const totalSlides = 4;
  const autoPlayIntervalRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // 固定課程 ID 映射
  const courseMappings = {
    "插畫": 14,  // 插畫課 ID
    "網頁": 9,   // 網頁課 ID
    "Python": 7, // Python 課 ID
    "音樂": 15   // 音樂課 ID
  };

  const updateSlide = (slideIndex) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(slideIndex);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const nextSlide = () => {
    const newSlide = (currentSlide + 1) % totalSlides;
    updateSlide(newSlide);
  };

  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide(newSlide);
  };

  const goToSlide = (slideIndex) => {
    if (slideIndex !== currentSlide) {
      updateSlide(slideIndex);
    }
  };

  const startAutoPlay = () => {
    autoPlayIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }
  };

  // 處理課程選擇並導航
  const handleCourseSelect = (courseKey) => {
    console.log("尋找課程關鍵字:", courseKey);
    console.log("可用課程數量:", courses.length);
    
    if (!courses || courses.length === 0) {
      console.log("課程數據為空，無法匹配");
      navigate('/');
      return;
    }

    // 1. 首先嘗試使用固定 ID 查找課程
    const courseId = courseMappings[courseKey];
    if (courseId) {
      const courseById = courses.find(course => parseInt(course.id) === courseId);
      if (courseById) {
        console.log("按 ID 找到課程:", courseById);
        onSelectCourse(courseById);
        navigate('/course-detail');
        return;
      }
    }

    // 2. 如果按 ID 找不到，嘗試按標題關鍵字匹配
    const selectedCourse = courses.find(course => 
      course.title.toLowerCase().includes(courseKey.toLowerCase())
    );
    
    if (selectedCourse) {
      console.log("按標題找到課程:", selectedCourse);
      onSelectCourse(selectedCourse);
      navigate('/course-detail');
      return;
    }

    // 3. 最後嘗試在課程描述中查找
    const courseByDescription = courses.find(course => 
      course.description && course.description.toLowerCase().includes(courseKey.toLowerCase())
    );

    if (courseByDescription) {
      console.log("按描述找到課程:", courseByDescription);
      onSelectCourse(courseByDescription);
      navigate('/course-detail');
      return;
    }

    console.log("未找到匹配課程，導航到首頁");
    navigate('/');
  };

  // 觸控支援
  const addTouchSupport = () => {
    let startX = 0;
    let endX = 0;
    const container = document.querySelector('.carousel-container');

    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    });
  };

  // 組件掛載時設定自動播放和事件監聽
  useEffect(() => {
    startAutoPlay();
    addTouchSupport();

    // 鍵盤控制
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      stopAutoPlay();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 檢查課程數據
  useEffect(() => {
    console.log("Carousel 接收到的課程數據:", courses);
  }, [courses]);

  return (
    <div 
    className="carousel-container"
    onMouseEnter={stopAutoPlay}
    onMouseLeave={startAutoPlay}
    style={{ 
      width: '100vw',        // 設置為視口寬度
      maxWidth: '100%',      // 確保不會超出頁面
      margin: '0',           // 清除所有邊距
      borderRadius: '0',     // 移除圓角
      overflow: 'hidden'     // 隱藏溢出部分
    }}
    >
      <div 
      className="carousel-wrapper" 
      ref={wrapperRef}
      style={{
        transform: `translateX(-${currentSlide * 100}%)`,
        width: '100%'  // 確保包裝器佔滿容器
      }}
    >
        {/* 第一張幻燈片 */}
        <div className="carousel-slide slide-1">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">🎨</div>
            <div className="floating-icon icon-2">✨</div>
            <div className="floating-icon icon-3">🚀</div>
          </div>
          <div className="slide-content">
            <div className="slide-badge">熱銷超過 5000+人</div>
            <h2>沙發上的插畫課</h2>
            <p>🌟 用 iPad 畫出你的可愛風格</p>
            <button className="slide-cta" onClick={() => handleCourseSelect("插畫")}>
                立即探索你筆下的世界
            </button>
          </div>
        </div>

        {/* 第二張幻燈片 */}
        <div className="carousel-slide slide-2">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">💻</div>
            <div className="floating-icon icon-2">📱</div>
            <div className="floating-icon icon-3">🎯</div>
          </div>
          <div className="slide-content">
            <div className="slide-badge">新課程上線</div>
            <h2>網頁設計實戰</h2>
            <p>💻 從零開始學習現代網頁開發</p>
            <button className="slide-cta" onClick={() => handleCourseSelect("網頁")}>
              立即加入課程
            </button>
          </div>
        </div>
        
        {/* 第三張幻燈片 */}
        <div className="carousel-slide slide-3">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">📊</div>
            <div className="floating-icon icon-2">💡</div>
            <div className="floating-icon icon-3">🎪</div>
          </div>
          <div className="slide-content">
            <div className="slide-badge">數據分析專家</div>
            <h2>Python 數據科學</h2>
            <p>📊 掌握數據分析與機器學習</p>
            <button className="slide-cta" onClick={() => handleCourseSelect("Python")}>
              開始學習之旅
            </button>
          </div>
        </div>
        
        {/* 第四張幻燈片 */}
        <div className="carousel-slide slide-4">
          <div className="decorative-elements">
            <div className="floating-icon icon-1">🎵</div>
            <div className="floating-icon icon-2">🎸</div>
            <div className="floating-icon icon-3">🎤</div>
          </div>
          <div className="slide-content">
            <div className="slide-badge">音樂創作</div>
            <h2>音樂製作入門</h2>
            <p>🎵 創作屬於你的音樂作品</p>
            <button className="slide-cta" onClick={() => handleCourseSelect("音樂")}>
              音樂夢想從這裡開始
            </button>
          </div>
        </div>
      </div>

      {/* 左右箭頭 */}
      <button className="carousel-nav prev" onClick={prevSlide}>‹</button>
      <button className="carousel-nav next" onClick={nextSlide}>›</button>

      {/* 指示器 */}
      <div className="carousel-indicators">
        {[...Array(totalSlides)].map((_, index) => (
          <div 
            key={index}
            className={`indicator ${currentSlide === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;