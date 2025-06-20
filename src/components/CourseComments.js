import React, { useState, useEffect } from 'react';
import '../App.css';
import { useTranslation } from 'react-i18next'; // 引入 useTranslation

function CourseComments({ courseId, user }) {
  const { t } = useTranslation(); // 使用 useTranslation
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:8080/Online-Classes/back/comment.php?action=list&course_id=${courseId}`);
      const data = await res.json();
      setComments(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(t('loadCommentsError'), err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/comment.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          course_id: courseId,
          content: newComment,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setNewComment('');
        setShowModal(false);
        fetchComments();
      } else {
        alert(result.error || t('submitCommentError'));
      }
    } catch (err) {
      console.error(err);
      alert(t('submitCommentError'));
    }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">{t('courseCommentsTitle')}</h3>
      {comments.length === 0 ? (
        <p className="no-comments">{t('noComments')}</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment, idx) => (
            <div key={idx} className="comment-item">
              <div className="comment-header">
                <strong>{comment.user_name || t('anonymous')}</strong>
                <span className="comment-time">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {user?.role === 'student' && (
        <button className="comment-add-btn" onClick={() => setShowModal(true)}>
          {t('addCommentButton')}
        </button>
      )}


      {showModal && (
              <div className="modal-overlay">
                <div className="modal-window fixed-size">
                  <div className="modal-top-tabs">
                    <span className="tab-option active-tab">{t('addCommentTitle')}</span>
                    <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                  </div>

                  <div className="modal-body">
                    <label>{t('commentPlaceholder')}：</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                      rows="4"
                      placeholder={t('commentPlaceholder')}
                    />
                    <button className="modal-submit" onClick={handleSubmit}>{t('submitCommentButton')}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }

export default CourseComments;