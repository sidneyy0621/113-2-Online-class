import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Carousel from './Carousel';

function CourseList({ onSelectCourse, searchQuery, currentUser }) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  // 追蹤滑鼠懸停的課程卡片
  const [hoveredCardId, setHoveredCardId] = useState(null);
  
  // 開發階段測試用戶 - 僅供測試不應出現在生產環境
  const DEV_MODE = true;
  
  // 確定用戶是否為已登入學生 - 全局變數
  const isUserStudent = currentUser && currentUser.role === 'student';
  
  // 開發模式下，為了測試愛心功能，允許未登入用戶也顯示愛心
  // 但對於已登入的老師，不顯示愛心圖標
  const shouldShowHeart = isUserStudent || (!currentUser && DEV_MODE);

  console.log('渲染 CourseList - isUserStudent:', isUserStudent);
  console.log('渲染 CourseList - currentUser:', currentUser);
  console.log('渲染 CourseList - shouldShowHeart:', shouldShowHeart);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=list');
        const data = await res.json();
        console.log("API 返回的課程數據:", data);
        setCourses(data);
        setFilteredCourses(data);
        setCoursesLoaded(true);
        
        // 如果用戶已登入且為學生，獲取收藏狀態
        if (isUserStudent) {
          fetchFavoriteStatus(currentUser.id);
        } else {
          // 未登入用戶不需要設置本地收藏
          setFavorites({});
        }
      } catch (err) {
        console.error(t('courseLoadError'), err);
        setCoursesLoaded(true); // 即使出錯也設置為已加載
      }
    };

    fetchCourses();
  }, [t, currentUser, isUserStudent]);

  // 獲取學生的收藏課程列表
  const fetchFavoriteStatus = async (studentId) => {
    try {
      const res = await fetch(`http://localhost:8080/Online-Classes/back/favorites.php?action=listByStudent&id=${studentId}`);
      const data = await res.json();
      
      // 將收藏列表轉換為{courseId: true}格式
      const favoritesMap = {};
      if (Array.isArray(data)) {
        data.forEach(course => {
          favoritesMap[course.id] = true;
        });
      }
      
      setFavorites(favoritesMap);
    } catch (err) {
      console.error('獲取收藏課程失敗:', err);
    }
  };

  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
      console.log("過濾後的課程數據:", filtered);
    }
  }, [searchQuery, courses]);

  // 滑鼠懸停處理函數 - 任何用戶都可觸發（開發模式）
  const handleMouseEnter = (courseId) => {
    console.log('滑鼠進入卡片:', courseId, '用戶是學生?', isUserStudent);
    setHoveredCardId(courseId);
  };

  const handleMouseLeave = () => {
    console.log('滑鼠離開卡片, 用戶是學生?', isUserStudent);
    setHoveredCardId(null);
  };

  // 切換收藏狀態
  const toggleFavorite = async (e, courseId) => {
    e.stopPropagation(); // 防止觸發卡片點擊事件
    
    // 先檢查是否已登入
    if (!currentUser) {
      // 未登入提示
      Swal.fire({
        icon: 'info',
        title: t('pleaseLogin'),
        text: t('loginToFavorite'),
        showConfirmButton: true
      });
      return;
    }
    
    // 再檢查是否為老師
    if (currentUser.role === 'teacher') {
      // 老師無法收藏課程
      Swal.fire({
        icon: 'info',
        title: t('teacherCannotFavorite'),
        text: t('teacherCannotFavoriteMessage'),
        showConfirmButton: true
      });
      return;
    }
    
    // 正常流程 - 學生收藏課程
    const isFavorited = favorites[courseId];
    const action = isFavorited ? 'remove' : 'add';
    
    try {
      const res = await fetch(`http://localhost:8080/Online-Classes/back/favorites.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: currentUser.id,
          course_id: courseId
        })
      });

      const data = await res.json();

      if (data.success) {
        const newFavorites = { ...favorites };
        if (isFavorited) {
          delete newFavorites[courseId];
        } else {
          newFavorites[courseId] = true;
        }
        
        setFavorites(newFavorites);
        
        // 顯示成功提示
        Swal.fire({
          icon: 'success',
          title: isFavorited ? '已取消收藏' : '收藏成功',
          text: isFavorited ? '課程已從收藏列表中移除' : '課程已加入收藏列表',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '操作失敗',
          text: data.error || '請稍後再試',
        });
      }
    } catch (err) {
      console.error('收藏操作失敗:', err);
      Swal.fire({
        icon: 'error',
        title: '網路錯誤',
        text: '請檢查網路連線後再試',
      });
    }
  };

  // 修改 return 部分的開頭，使輪播圖在容器外部
  return (
    <>
      {/* 將輪播圖移到最外層，讓它可以佔據整個寬度 */}
      {coursesLoaded && (  // 只在課程加載完成後渲染輪播圖
        <Carousel 
          onSelectCourse={onSelectCourse}
          courses={courses} // 傳遞所有課程數據給 Carousel，不受搜尋過濾影響
        />
      )}
      
      <div style={{ 
        padding: '30px 20px',
        background: 'var(--light-bg)',
        minHeight: '70vh'
      }}>
        <h1 style={{ 
          color: 'var(--primary-dark)', 
          borderBottom: '3px solid var(--accent-light)', 
          paddingBottom: '10px', 
          marginBottom: '30px',
          marginTop: '30px',
          fontWeight: 'bold',
          width: 'fit-content'
        }}>
          {t('coursesOverview')}
        </h1>
      
      {filteredCourses.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)'
        }}>
          <p style={{ 
            color: '#666',
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            {searchQuery ? t('noCourses') : t('noCoursesAvailable')}
          </p>
          {searchQuery && (
            <p style={{ 
              color: '#888',
              fontSize: '1rem'
            }}>
              {t('tryDifferentSearch')}
            </p>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '25px',
        }}>
          {filteredCourses.map((course) => {
            const isFull = course.enrolled_count >= course.max_capacity;
            console.log('渲染課程卡片:', course.id, '- shouldShowHeart:', shouldShowHeart);
            
            return (
              <div
                key={course.id}
                onClick={() => {
                  if (!isFull) {
                    onSelectCourse(course);
                    navigate('/course-detail');
                  }
                }}
                className="course-card"
                onMouseEnter={() => handleMouseEnter(course.id)}
                onMouseLeave={handleMouseLeave}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: isFull ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(187, 82, 101, 0.1)',
                  opacity: isFull ? 0.7 : 1,
                  position: 'relative',
                  filter: isFull ? 'grayscale(20%)' : 'none'
                }}
              >
                
                {/* 愛心圖標 - 只在課程卡片被懸停時顯示，或者已收藏的課程始終顯示 */}
                {shouldShowHeart && (hoveredCardId === course.id || favorites[course.id]) && (
                  <div 
                    className="heart-icon"
                    onClick={(e) => toggleFavorite(e, course.id)}
                    style={{
                      position: 'absolute',
                      top: '15px',
                      left: '15px',
                      zIndex: 100,  // 提高 z-index
                      background: '#555555',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: 1, // 顯示時始終為完全不透明
                      transform: 'scale(1.1)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                      border: '2px solid white'
                    }}
                  >
                    {favorites[course.id] ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    )}
                  </div>
                )}

                {/* 課程額滿標籤 */}
                {isFull && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}>
                    {t('courseFull')}
                  </div>
                )}

                {/* 課程頭部區域 */}
                <div style={{ 
                  background: isFull 
                    ? 'linear-gradient(135deg, #999, #666)' 
                    : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  color: 'white',
                  position: 'relative'
                }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    {course.title}
                  </h3>
                  <div style={{ 
                    fontSize: '0.9rem',
                    opacity: '0.9'
                  }}>
                    📚 {isFull ? t('unavailableCourse') : t('availableCourse')}
                  </div>
                </div>
                
                {/* 課程時間資訊 */}
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ 
                    margin: '8px 0',
                    color: 'var(--primary-dark)',
                    fontSize: '0.95rem'
                  }}>
                    <strong>🕒 {t('courseTime')}：</strong>
                    <br />
                    {new Date(course.start_time).toLocaleString()} 
                    <br />
                    ~ {new Date(course.end_time).toLocaleString()}
                  </p>
                </div>

                {/* 報名資訊 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: 'var(--light-bg)',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {t('maxCapacity')}
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                      {course.max_capacity}
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--light-bg)',
                    padding: '8px',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {t('enrolledCount')}
                    </div>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: isFull ? '#f44336' : 'var(--primary)'
                    }}>
                      {course.enrolled_count ?? 0}
                    </div>
                  </div>
                </div>
                
                {/* 課程描述 */}
                <div style={{ 
                  padding: '12px',
                  background: 'var(--light-bg)',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <p style={{ 
                    margin: '0',
                    color: '#666',
                    fontSize: '0.9rem',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    <strong>{t('courseDescription')}：</strong>
                    {course.description}
                  </p>
                </div>
                
                {/* 點擊提示 */}
                <div style={{ 
                  marginTop: '15px',
                  padding: '8px',
                  background: isFull 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(202, 154, 88, 0.1)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <span style={{ 
                    color: isFull 
                      ? '#f44336' 
                      : 'var(--accent)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {isFull 
                      ? `❌ ${t('courseFullMessage')}` 
                      : `👆 ${t('clickToViewDetails')}`
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}

export default CourseList;