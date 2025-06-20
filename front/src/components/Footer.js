import React from 'react';

function Footer() {
  return (
    <footer style={{ 
      textAlign: 'center', 
      padding: '24px 0',
      background: 'linear-gradient(to right, #341441, #bb5265)',
      color: '#f8f8ff',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      marginTop: 'auto',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: '12px' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '40px', marginRight: '0', verticalAlign: 'middle' }} 
          />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', verticalAlign: 'middle' }}>Online class</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
          <a href="#" style={{ color: '#ffde59', textDecoration: 'none' }}>關於我們</a>
          <a href="#" style={{ color: '#ffde59', textDecoration: 'none' }}>聯絡方式</a>
          <a href="#" style={{ color: '#ffde59', textDecoration: 'none' }}>常見問題</a>
          <a href="#" style={{ color: '#ffde59', textDecoration: 'none' }}>隱私政策</a>
        </div>
        <p style={{ color: '#fdf3f8', margin: '0' }}>Copyright © 線上課程平台 All Rights Reserved. Designed by Wei-chun Chen</p>
      </div>
    </footer>
  );
}

export default Footer;