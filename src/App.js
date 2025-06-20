import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import CourseList from './components/CourseList';
import CourseDetail from './components/CourseDetail';
import MyCourses from './components/MyCourses';
import TeacherCourses from './components/TeacherCourses';
import MyFavorites from './components/Myfavoite';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ChatBot from './components/ChatBot';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <Header
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onSearch={handleSearch}
        />

        <main style={{ flex: 1, overflow: 'hidden' }}>    
          <Routes>
            <Route
              path="/"
              element={
                <CourseList
                  onSelectCourse={(course) => {
                    console.log("選擇課程:", course);
                    setSelectedCourse(course);
                  }}
                  searchQuery={searchQuery}
                  currentUser={currentUser}
                />
              }
            />
            <Route
              path="/teacher-courses"
              element={
                currentUser?.role === 'teacher' ? (
                  <TeacherCourses user={currentUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/my-courses"
              element={
                currentUser?.role === 'student' ? (
                  <MyCourses
                    user={currentUser}
                    onSelectCourse={(course) => {
                      setSelectedCourse(course);
                    }}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/my-favorites"
              element={
                currentUser?.role === 'student' ? (
                  <MyFavorites
                    currentUser={currentUser}
                    onSelectCourse={(course) => {
                      setSelectedCourse(course);
                    }}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/course-detail"
              element={
                selectedCourse ? (
                  <CourseDetail
                    course={selectedCourse}
                    onBack={() => {
                      setSelectedCourse(null);
                    }}
                    user={currentUser}
                    mode={
                      currentUser?.role === 'student' && selectedCourse?.enrolled
                        ? 'my-courses'
                        : 'overview'
                    }
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route path="*" element={<div>未知頁面</div>} />
          </Routes>
        </main>

        {/* 使用 Footer 組件 */}
        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;