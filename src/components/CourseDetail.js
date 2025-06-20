import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import CourseComments from './CourseComments';
import { useTranslation } from 'react-i18next';

function CourseDetail({ course, onBack, user, mode = 'overview' }) {
  const { t } = useTranslation();
  const [enrolledCount, setEnrolledCount] = useState(course.enrolled_count);
  const [loading, setLoading] = useState(false);

  // 獲取最新的報名人數
  useEffect(() => {
    const fetchEnrolledCount = async () => {
      if (course.enrolled_count !== undefined) {
        return; // 如果已經有資料就不用重新獲取
      }

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/Online-Classes/back/courses.php?action=getEnrolledCount&course_id=${course.id}`);
        const data = await res.json();
        
        if (data.success) {
          setEnrolledCount(data.enrolled_count);
        } else {
          // 如果後端沒有這個API，嘗試從課程列表API獲取
          const coursesRes = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=list');
          const coursesData = await coursesRes.json();
          const foundCourse = coursesData.find(c => c.id === course.id);
          
          if (foundCourse && foundCourse.enrolled_count !== undefined) {
            setEnrolledCount(foundCourse.enrolled_count);
          } else {
            setEnrolledCount(0); // 預設值
          }
        }
      } catch (err) {
        console.error('Failed to fetch enrolled count:', err);
        setEnrolledCount(0); // 預設值
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCount();
  }, [course.id, course.enrolled_count]);

  const handleJoinCourse = async () => {
    if (!user || user.role !== 'student') {
      Swal.fire({
        icon: 'info',
        title: '請先登入',
        text: '登入為學生帳號後才可加入課程',
      });
      return;
    }

    // 檢查課程是否已額滿
    const currentEnrolledCount = enrolledCount || 0;
    if (currentEnrolledCount >= course.max_capacity) {
      Swal.fire({
        icon: 'error',
        title: t('joinCourseFailTitle'),
        text: t('courseFullMessage'),
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/enrollments.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          course_id: course.id,
        }),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('joinCourseSuccessTitle'),
          text: t('joinCourseSuccessText'),
        });
        // 更新本地的報名人數
        setEnrolledCount(prev => (prev || 0) + 1);
        onBack();
      } else {
        Swal.fire({
          icon: 'error',
          title: t('joinCourseFailTitle'),
          text: result.error || t('joinCourseFailText'),
        });
      }
    } catch (err) {
      console.error(t('joinCourseFailText'), err);
      Swal.fire({
        icon: 'error',
        title: t('joinCourseFailTitle'),
        text: t('joinCourseFailText'),
      });
    }
  };

  const handleRemoveCourse = async () => {
    Swal.fire({
      icon: 'question',
      title: t('removeCourseConfirmTitle'),
      text: t('removeCourseConfirmText'),
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('http://localhost:8080/Online-Classes/back/enrollments.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_id: user.id,
              course_id: course.id,
            }),
          });

          const result = await res.json();
          if (result.success) {
            Swal.fire({
              icon: 'success',
              title: t('removeCourseSuccessTitle'),
              text: t('removeCourseSuccessText'),
            });
            // 更新本地的報名人數
            setEnrolledCount(prev => Math.max((prev || 0) - 1, 0));
            onBack();
          } else {
            Swal.fire({
              icon: 'error',
              title: t('removeCourseFailTitle'),
              text: result.error || t('removeCourseFailText'),
            });
          }
        } catch (err) {
          console.error(t('removeCourseFailText'), err);
          Swal.fire({
            icon: 'error',
            title: t('removeCourseFailTitle'),
            text: t('removeCourseFailText'),
          });
        }
      }
    });
  };

  // 檢查課程是否已額滿
  const isFull = enrolledCount >= course.max_capacity;

  return (
    <div style={{ 
      padding: '30px 40px',
      background: 'var(--light-bg)',
      minHeight: '100vh'
    }}>
      {/* 美化的返回按鈕 */}
      <button 
        onClick={onBack} 
        className="back-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          marginBottom: '30px',
          transition: 'all 0.3s ease',
          boxShadow: '0 3px 10px rgba(187, 82, 101, 0.3)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 5px 15px rgba(187, 82, 101, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 3px 10px rgba(187, 82, 101, 0.3)';
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>←</span>
        {t('backButton')}
      </button>

      {/* 課程詳細內容容器 */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
        marginBottom: '30px'
      }}>
        {/* 課程標題區域 */}
        <div style={{ position: 'relative' }}>
          <h1 style={{ 
            color: 'var(--primary-dark)',
            fontSize: '2.2rem',
            marginBottom: '20px',
            borderBottom: '3px solid var(--accent-light)',
            paddingBottom: '15px'
          }}>
            {course.title}
          </h1>
          
          {/* 額滿標籤 */}
          {isFull && (
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'linear-gradient(135deg, #f44336, #d32f2f)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 3px 10px rgba(244, 67, 54, 0.3)'
            }}>
              🚫 {t('courseFull')}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          <div className="course-info-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>📅 {t('courseTime')}</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              {new Date(course.start_time).toLocaleString()} 
              <br />
              <strong>~</strong>
              <br />
              {new Date(course.end_time).toLocaleString()}
            </p>
          </div>

          <div className="course-info-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>👥 {t('enrollmentInfo')}</h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
              <strong>{t('maxCapacity')}：</strong>{course.max_capacity}
              <br />
              <strong>{t('enrolledCount')}：</strong>
              {loading ? (
                <span style={{ color: '#666' }}>載入中...</span>
              ) : (
                <span style={{ 
                  color: isFull ? '#f44336' : 'var(--primary)',
                  fontWeight: 'bold'
                }}>
                  {enrolledCount !== undefined ? enrolledCount : t('noData')}
                </span>
              )}
              {isFull && (
                <span style={{ 
                  color: '#f44336', 
                  fontSize: '0.9rem',
                  display: 'block',
                  marginTop: '5px'
                }}>
                  ⚠️ 課程已額滿
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="course-info-card" style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>📝 {t('courseDescription')}</h3>
          <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#555' }}>
            {course.description}
          </p>
        </div>

        {/* 操作按鈕區域 - 只有學生角色才顯示按鈕 */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          justifyContent: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          {mode === 'overview' && user?.role === 'student' && (
            <button 
              onClick={handleJoinCourse} 
              disabled={isFull}
              className="action-button primary-action"
              style={{
                padding: '12px 30px',
                background: isFull 
                  ? 'linear-gradient(135deg, #ccc, #999)'
                  : 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                color: isFull ? '#666' : 'var(--primary-dark)',
                border: 'none',
                borderRadius: '25px',
                cursor: isFull ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: isFull 
                  ? '0 2px 5px rgba(0, 0, 0, 0.1)'
                  : '0 4px 15px rgba(202, 154, 88, 0.3)',
                opacity: isFull ? 0.6 : 1
              }}
            >
              {isFull ? '🚫 課程已額滿' : `🎓 ${t('joinCourseButton')}`}
            </button>
          )}
          {user?.role === 'student' && mode === 'my-courses' && (
            <button 
              onClick={handleRemoveCourse} 
              className="action-button danger-action"
              style={{
                padding: '12px 30px',
                background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
              }}
            >
              🗑️ {t('removeCourseButton')}
            </button>
          )}
        </div>
      </div>

      {/* 評論區塊 */}
      <CourseComments courseId={course.id} user={user} />
    </div>
  );
}

export default CourseDetail;