import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaSearch, FaHeart } from 'react-icons/fa';
import { PiStudentBold } from 'react-icons/pi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { MdOutlineLanguage } from 'react-icons/md';
import '../App.css';
import LoginRegister from './LoginRegister';
import EditProfile from './EditProfile';
import i18n from '../i18n';

function Header({ currentUser, setCurrentUser, onSearch }) {
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setShowDropdown(false);
    Swal.fire({
      icon: 'success',
      title: i18n.t('logoutSuccessTitle'),
      text: i18n.t('logoutSuccessText'),
    });
    navigate('/');
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    setShowEditModal(false);
    setShowDropdown(false);
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

  return (
    <>
      <header className="navbar">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px' // 調整左側元素之間的距離
        }}>
          {/* Logo 和網站名稱 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer'
          }} onClick={() => navigate('/')}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ height: '32px', marginRight: '8px' }} 
            />
            <span style={{ 
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              color: 'var(--white)' 
            }}>Online class</span>
          </div>
          
          {/* 導覽區移到 Logo 旁邊 */}
          <div className="nav-left">
            <Link to="/" className="nav-item">{i18n.t('coursesOverview')}</Link>
            {currentUser?.role === 'student' && (
              <>
                <Link to="/my-courses" className="nav-item">{i18n.t('myCourses')}</Link>
                <Link 
                  to="/my-favorites" 
                  className="nav-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {i18n.t('myFavorites')}
                </Link>
              </>
            )}
            {currentUser?.role === 'teacher' && (
              <Link to="/teacher-courses" className="nav-item">{i18n.t('teacherCourses')}</Link>
            )}
          </div>
        </div>

        <div className="search-container">
          <input
            className="search-box"
            placeholder={i18n.t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
          />
          <button className="search-icon" onClick={handleSearchClick}>
            <FaSearch />
          </button>
        </div>

        <div className="nav-right">
          <div className="dropdown-container">
            <button
              className="dropdown-trigger language-trigger"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <MdOutlineLanguage style={{ fontSize: '1.5rem' }} />
              <span style={{ marginLeft: '8px' }}>
                {i18n.language === 'zh' ? '繁中' : 
                 i18n.language === 'en' ? 'EN' : 
                 i18n.language === 'ja' ? '日本' : '繁中'}
              </span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showLanguageDropdown && (
              <div className="dropdown-menu language-menu">
                <div 
                  className="dropdown-item" 
                  onClick={() => handleLanguageChange('zh')}
                >
                  🇹🇼 繁體中文
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => handleLanguageChange('en')}
                >
                  🇺🇸 English
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => handleLanguageChange('ja')}
                >
                  🇯🇵 日本語
                </div>
              </div>
            )}
          </div>

          {currentUser ? (
            <div className="dropdown-container">
              <button
                className="dropdown-trigger user-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="user-icon">
                  {currentUser.role === 'teacher' ? 
                    <FaChalkboardTeacher style={{ fontSize: '1.2rem' }} /> : 
                    <PiStudentBold style={{ fontSize: '1.2rem' }} />
                  }
                </div>
                <div className="user-info">
                  <span className="user-name">{currentUser.name}</span>
                  <span className="user-role">
                    {currentUser.role === 'teacher' ? i18n.t('teacher') : i18n.t('student')}
                  </span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>
              {showDropdown && (
                <div className="dropdown-menu user-menu">
                  <div 
                    className="dropdown-item" 
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    ⚙️ {i18n.t('editProfile')}
                  </div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    🚪 {i18n.t('logout')}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              {i18n.t('loginRegister')}
            </button>
          )}
        </div>
      </header>

      <LoginRegister
        visible={showModal}
        onClose={handleCloseModal}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowModal(false);
        }}
      />

      {showEditModal && (
        <EditProfile
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={currentUser}
          onUpdate={handleUpdateProfile}
        />
      )}
    </>
  );
}

export default Header;