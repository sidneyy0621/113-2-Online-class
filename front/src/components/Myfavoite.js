import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

function MyFavorites({ onSelectCourse, currentUser }) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8080/Online-Classes/back/favorites.php?action=listByStudent&id=${currentUser.id}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error('載入收藏清單失敗:', err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser, navigate]);

  // 移除收藏
  const handleRemoveFavorite = async (e, courseId) => {
    e.stopPropagation();
    
    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/favorites.php?action=remove', {
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
        setFavorites(favorites.filter(course => course.id !== courseId));
        Swal.fire({
          icon: 'success',
          title: '已取消收藏',
          text: '課程已從收藏列表中移除',
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
      console.error('移除收藏失敗:', err);
      Swal.fire({
        icon: 'error',
        title: '網路錯誤',
        text: '請檢查網路連線後再試',
      });
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        載入中...
      </div>
    );
  }

  return (
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
        fontWeight: 'bold',
        width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {t('myFavoriteCourses')}
      </h1>
      
      {favorites.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)'
        }}>
          <FaRegHeart style={{ 
            fontSize: '4rem', 
            color: '#ddd', 
            marginBottom: '20px' 
          }} />
          <p style={{ 
            color: '#666',
            fontSize: '1.2rem',
            marginBottom: '10px'
          }}>
            您還沒有收藏任何課程
          </p>
          <p style={{ 
            color: '#888',
            fontSize: '1rem'
          }}>
            在課程清單中點擊愛心圖標來收藏喜歡的課程吧！
          </p>
          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.target.style.transform = 'none'}
          >
            瀏覽課程
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '25px',
        }}>
          {favorites.map((course) => {
            const isFull = course.enrolled_count >= course.max_capacity;
            
            return (
              <div
                key={course.id}
                onClick={() => {
                  onSelectCourse(course);
                  navigate('/course-detail');
                }}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(187, 82, 101, 0.1)',
                  position: 'relative',
                  transform: hoveredCourse === course.id ? 'translateY(-5px)' : 'none'
                }}
              >
                {/* 移除收藏按鈕 */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    zIndex: 5,
                    background: '#555555',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: hoveredCourse === course.id ? 1 : 0,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                  onClick={(e) => handleRemoveFavorite(e, course.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.background = '#ff4757';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.background = '#555555';
                  }}
                >
                  <FaTrashAlt style={{ color: 'white', fontSize: '14px' }} />
                </div>

                {/* 收藏標記 */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    zIndex: 5,
                    background: '#ff4757',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <FaHeart style={{ color: 'white', fontSize: '16px' }} />
                </div>

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
                  background: 'rgba(202, 154, 88, 0.1)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  <span style={{ 
                    color: 'var(--accent)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    👆 {t('clickToViewDetails')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyFavorites;