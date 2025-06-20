import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaClock, FaUsers } from 'react-icons/fa';
import '../App.css';
import { useTranslation } from 'react-i18next';

function TeacherCourses({ user }) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    max_capacity: '',
    start_time: '',
    end_time: '',
  });
  const [editCourseId, setEditCourseId] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`http://localhost:8080/Online-Classes/back/courses.php?action=listByTeacher&teacher_id=${user.id}`);
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(t('courseLoadError'), error);
      Swal.fire({
        icon: 'error',
        title: t('loadErrorTitle'),
        text: t('loadErrorText'),
      });
    }
  };

  useEffect(() => {
    if (user?.role === 'teacher') fetchCourses();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async () => {
    const payload = {
      ...formData,
      teacher_id: user.id,
    };

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('addCourseSuccessTitle'),
          text: t('addCourseSuccessText'),
          confirmButtonText: 'OK'
        });
        setShowModal(false);
        setFormData({ title: '', description: '', max_capacity: '', start_time: '', end_time: '' });
        fetchCourses();
      } else {
        Swal.fire({
          icon: 'error',
          title: t('addCourseFailTitle'),
          text: result.error || t('addCourseFailText'),
        });
      }
    } catch (error) {
      console.error('Add course error:', error);
      Swal.fire({
        icon: 'error',
        title: t('addCourseFailTitle'),
        text: t('addCourseFailText'),
      });
    }
  };

  const handleEditCourse = (course) => {
    setEditCourseId(course.id);
    setFormData({
      title: course.title,
      description: course.description,
      max_capacity: course.max_capacity,
      start_time: course.start_time,
      end_time: course.end_time,
    });
    setShowEditModal(true);
  };

  const handleSaveEditCourse = async () => {
    const payload = {
      ...formData,
      course_id: editCourseId,
    };

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('editCourseSuccessTitle'),
          text: t('editCourseSuccessText'),
          confirmButtonText: 'OK'
        });
        setShowEditModal(false);
        setFormData({ title: '', description: '', max_capacity: '', start_time: '', end_time: '' });
        fetchCourses();
      } else {
        Swal.fire({
          icon: 'error',
          title: t('editCourseFailTitle'),
          text: result.error || t('editCourseFailText'),
        });
      }
    } catch (error) {
      console.error('Edit course error:', error);
      Swal.fire({
        icon: 'error',
        title: t('editCourseFailTitle'),
        text: t('editCourseFailText'),
      });
    }
  };

  const handleDelete = async (courseId) => {
    Swal.fire({
      icon: 'question',
      title: t('deleteCourseConfirmTitle'),
      text: t('deleteCourseConfirmText'),
      showCancelButton: true,
      confirmButtonText: t('deleteButton'),
      cancelButtonText: t('cancelButton'),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('http://localhost:8080/Online-Classes/back/courses.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_id: courseId }),
          });

          const result = await res.json();
          if (result.success) {
            Swal.fire({
              icon: 'success',
              title: t('deleteCourseSuccessTitle'),
              text: t('deleteCourseSuccessText'),
              confirmButtonText: 'OK'
            });
            fetchCourses();
          } else {
            Swal.fire({
              icon: 'error',
              title: t('deleteCourseFailTitle'),
              text: result.error || t('deleteCourseFailText'),
            });
          }
        } catch (error) {
          console.error('Delete course error:', error);
          Swal.fire({
            icon: 'error',
            title: t('deleteCourseFailTitle'),
            text: t('deleteCourseFailText'),
          });
        }
      }
    });
  };

  return (
    <div style={{ 
      padding: '30px 20px',
      background: 'var(--light-bg)',
      minHeight: '70vh'
    }}>
      {/* 頁面標題 */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          color: 'var(--primary-dark)', 
          borderBottom: '3px solid var(--accent-light)', 
          paddingBottom: '10px', 
          marginBottom: '30px',
          fontWeight: 'bold',
          width: 'fit-content'
        }}>
           {t('teacherCoursesTitle')}
        </h1>
        
        {/* 新增課程按鈕移到標題下方 */}
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            color: 'var(--primary-dark)',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(202, 154, 88, 0.3)',
            width: 'fit-content',
            alignSelf: 'flex-start'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(202, 154, 88, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(202, 154, 88, 0.3)';
          }}
        >
          <FaPlus /> {t('addCourseButton')}
        </button>
      </div>

      {/* 課程卡片網格 */}
      {courses.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📝</div>
          <p style={{ 
            color: '#666',
            fontSize: '1.2rem',
            marginBottom: '20px'
          }}>
            {t('noCoursesYet')}
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="modal-submit"
            style={{ marginTop: '0' }}
          >
            {t('createFirstCourse')}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '25px',
        }}>
          {courses.map((course) => (
            <div 
              key={course.id} 
              style={{ 
                background: 'white',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(187, 82, 101, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* 課程標題區 */}
              <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                margin: '-25px -25px 20px -25px',
                padding: '20px 25px',
                color: 'white'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0',
                  fontSize: '1.4rem',
                  fontWeight: 'bold'
                }}>
                  {course.title}
                </h3>
                <div style={{ 
                  fontSize: '0.9rem',
                  opacity: '0.9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FaUsers size={14} />
                  {t('maxCapacity')} {course.max_capacity} {t('people')}
                </div>
              </div>

              {/* 課程描述 */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ 
                  color: '#555',
                  lineHeight: '1.6',
                  margin: '0',
                  fontSize: '0.95rem'
                }}>
                  <strong style={{ color: 'var(--primary-dark)' }}>📝 {t('courseDescription')}：</strong>
                  <br />
                  {course.description}
                </p>
              </div>

              {/* 課程時間 */}
              <div style={{ 
                background: 'var(--light-bg)',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <FaClock style={{ color: 'var(--accent)' }} />
                  <strong style={{ color: 'var(--primary-dark)' }}>{t('courseTime')}</strong>
                </div>
                <div style={{ 
                  fontSize: '0.9rem',
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  <div>{t('startTime')}：{new Date(course.start_time).toLocaleString()}</div>
                  <div>{t('endTime')}：{new Date(course.end_time).toLocaleString()}</div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div style={{ 
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={() => handleEditCourse(course)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    color: 'var(--primary-dark)',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(202, 154, 88, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(202, 154, 88, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 3px 10px rgba(202, 154, 88, 0.3)';
                  }}
                >
                  <FaEdit size={14} /> {t('editButton')}
                </button>
                
                <button 
                  onClick={() => handleDelete(course.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 3px 10px rgba(244, 67, 54, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 3px 10px rgba(244, 67, 54, 0.3)';
                  }}
                >
                  <FaTrash size={14} /> {t('deleteButton')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增課程彈窗 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window fixed-size">
            <div className="modal-top-tabs">
              <span className="tab-option active-tab">{t('addCourseTitle')}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>{t('courseTitlePlaceholder')}：</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('enterCourseName')}
              />
              <label>{t('courseDescriptionPlaceholder')}：</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('enterCourseDescription')}
                rows="3"
              />
              <label>{t('maxCapacityPlaceholder')}：</label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleInputChange}
                placeholder={t('enterMaxCapacity')}
                min="1"
              />
              <label>{t('startTimePlaceholder')}：</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
              />
              <label>{t('endTimePlaceholder')}：</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
              <button className="modal-submit" onClick={handleAddCourse}>{t('submitButton')}</button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯課程彈窗 */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-window fixed-size">
            <div className="modal-top-tabs">
              <span className="tab-option active-tab">{t('editCourseTitle')}</span>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <label>{t('courseTitlePlaceholder')}：</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('enterCourseName')}
              />
              <label>{t('courseDescriptionPlaceholder')}：</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('enterCourseDescription')}
                rows="3"
              />
              <label>{t('maxCapacityPlaceholder')}：</label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleInputChange}
                placeholder={t('enterMaxCapacity')}
                min="1"
              />
              <label>{t('startTimePlaceholder')}：</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
              />
              <label>{t('endTimePlaceholder')}：</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
              />
              <button className="modal-submit" onClick={handleSaveEditCourse}>{t('saveButton')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherCourses;