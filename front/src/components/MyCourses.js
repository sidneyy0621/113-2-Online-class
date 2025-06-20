import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 添加這行

function MyCourses({ user, onSelectCourse }) {
  const { t } = useTranslation(); // 添加這行
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:8080/Online-Classes/back/enrollments.php?action=list&student_id=${user.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log('取得課程資料:', data);
        if (!Array.isArray(data)) {
          throw new Error('API response is not an array');
        }
        setCourses(data);
      } catch (err) {
        console.error(t('courseLoadError'), err); // 使用翻譯
        setError(err.message);
      }
    };

    fetchCourses();
  }, [user, t]); // 添加 t 到依賴數組

  if (!user) {
    return (
      <div style={{ 
        padding: '30px 20px',
        textAlign: 'center',
        background: 'var(--light-bg)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          color: 'var(--primary-dark)',
          marginBottom: '20px',
          fontSize: '2rem'
        }}>
          {t('myCourses')}
        </h1>
        <p style={{ 
          color: '#666',
          fontSize: '1.1rem'
        }}>
          {t('pleaseLoginToViewCourses')}
        </p>
      </div>
    );
  }

  if (user.role !== 'student') {
    return (
      <div style={{ 
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>
          {t('accessDenied')}
        </h1>
        <p>{t('onlyStudentsCanView')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'var(--primary-dark)' }}>
          {t('myCourses')}
        </h1>
        <div style={{ color: '#d32f2f', fontSize: '1.1rem' }}>
          {t('errorLoadingCourses')}: {error}
        </div>
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
        width: 'fit-content'
      }}>
        {t('myCourses')}
      </h1>
      
      {courses.length === 0 ? (
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
            {t('noCoursesEnrolled')}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="modal-submit"
            style={{ marginTop: '0' }}
          >
            {t('browseCourses')}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '25px',
        }}>
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => {
                onSelectCourse({ ...course, enrolled: true });
                navigate('/course-detail');
              }}
              className="course-card"
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(187, 82, 101, 0.1)',
              }}
            >
              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px',
                color: 'white'
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
                  📚 {t('enrolledCourse')}
                </div>
              </div>
              
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
              
              <div style={{ 
                padding: '12px',
                background: 'var(--light-bg)',
                borderRadius: '8px',
                marginTop: '12px'
              }}>
                <p style={{ 
                  margin: '0',
                  color: '#666',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  <strong>{t('courseDescription')}：</strong>{course.description}
                </p>
              </div>
              
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
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;