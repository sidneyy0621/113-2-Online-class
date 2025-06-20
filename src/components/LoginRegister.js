import React, { useState } from 'react';
import Swal from 'sweetalert2';
import '../App.css';
import { useTranslation } from 'react-i18next';

function LoginRegister({ visible, onClose, onLoginSuccess }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState(1);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regGender, setRegGender] = useState('male');

  if (!visible) return null;

  const reset = () => {
    setStep(1);
    setActiveTab('login');
    setLoginEmail('');
    setLoginPassword('');
    setRegEmail('');
    setRegPassword('');
    setRegName('');
    setRegRole('student');
    setRegGender('male');
  };

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('loginFailTitle'),
        text: '請輸入電子信箱和密碼',
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        onLoginSuccess(result.user);
        Swal.fire({
          icon: 'success',
          title: t('loginSuccessTitle'),
          text: t('loginSuccessText'),
        });
        onClose();
        reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: t('loginFailTitle'),
          text: result.error || t('loginFailText'),
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: t('loginFailTitle'),
        text: t('loginFailText'),
      });
    }
  };

  const handleRegisterStep1 = () => {
    // 基本驗證：檢查必填欄位
    if (!regEmail.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('registerFailTitle'),
        text: '請輸入電子信箱',
      });
      return;
    }

    if (!regPassword.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('registerFailTitle'),
        text: '請輸入密碼',
      });
      return;
    }

    // 驗證電子信箱必須包含 @gmail.com
    if (!regEmail.toLowerCase().endsWith('@gmail.com')) {
      Swal.fire({
        icon: 'error',
        title: t('registerFailTitle'),
        text: '電子信箱必須是 Gmail 帳號（以 @gmail.com 結尾）',
      });
      return;
    }

    // 直接進入下一步，不檢查email是否已存在
    setStep(2);
  };

  const handleRegister = async () => {
    // 驗證第二步的必填欄位
    if (!regName.trim()) {
      Swal.fire({
        icon: 'error',
        title: t('registerFailTitle'),
        text: '請輸入姓名',
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/Online-Classes/back/auth.php?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          gender: regGender,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log('Register result:', result);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('registerSuccessTitle'),
          text: t('registerSuccessText'),
        });
        // 註冊成功後切換到登入頁面，並將email帶過去方便登入
        setActiveTab('login');
        setStep(1);
        setLoginEmail(regEmail); // 將註冊的email帶到登入表單
        // 清空註冊表單
        setRegEmail('');
        setRegPassword('');
        setRegName('');
        setRegRole('student');
        setRegGender('male');
      } else {
        Swal.fire({
          icon: 'error',
          title: t('registerFailTitle'),
          text: result.error || t('registerFailText'),
        });
      }
    } catch (err) {
      console.error('Register error:', err);
      Swal.fire({
        icon: 'error',
        title: t('registerFailTitle'),
        text: '註冊時發生錯誤，請稍後再試',
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window fixed-size">
        <div className="modal-top-tabs">
          <span
            className={`tab-option ${activeTab === 'login' ? 'active-tab' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setStep(1);
            }}
          >
            {t('Login')}
          </span>
          <span
            className={`tab-option ${activeTab === 'register' ? 'active-tab' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setStep(1);
            }}
          >
            {t('Register')}
          </span>
          <button className="modal-close" onClick={() => { onClose(); reset(); }}>✕</button>
        </div>

        <div className="modal-body">
          {activeTab === 'login' && (
            <>
              <label>{t('Email')}：</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="請輸入電子信箱"
              />
              <label>{t('Password')}：</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="請輸入密碼"
              />
              <button className="modal-submit" onClick={handleLogin}>{t('Submit')}</button>
            </>
          )}

          {activeTab === 'register' && step === 1 && (
            <>
              <label>{t('Email')}：</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="請輸入電子信箱"
              />
              <small style={{ display: 'block', margin: '5px 0', color: '#666' }}>
                電子信箱必須是 Gmail 帳號（以 @gmail.com 結尾）
              </small>
              <label>{t('Password')}：</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="請輸入密碼"
              />
              <button className="modal-submit" onClick={handleRegisterStep1}>{t('Next')}</button>
            </>
          )}

          {activeTab === 'register' && step === 2 && (
            <>
              <label>{t('nameLabel')}：</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="請輸入您的姓名"
              />
              <label>{t('roleLabel')}：</label>
              <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="student">{t('studentRole')}</option>
                <option value="teacher">{t('teacherRole')}</option>
              </select>
              <label>{t('genderLabel')}：</label>
              <select value={regGender} onChange={(e) => setRegGender(e.target.value)}>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
                <option value="other">{t('other')}</option>
              </select>
              <button className="modal-submit" onClick={handleRegister}>{t('registerButton')}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;