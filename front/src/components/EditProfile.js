import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../App.css';
import { useTranslation } from 'react-i18next'; // 引入 useTranslation

function EditProfileModal({ visible, onClose, user, onUpdate }) {
  const { t } = useTranslation(); // 使用 useTranslation
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGender(user.gender || '');
      setBirthday(user.birthday || '');
      setNewPassword('');
    }
  }, [user]);

  if (!visible || !user) return null;

  const handleUpdate = async () => {
    const payload = {
      id: user.id,
      name,
      gender,
      birthday,
    };
    if (newPassword) {
      payload.password = newPassword;
    }

    const res = await fetch('http://localhost:8080/Online-Classes/back/users.php?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: t('updateSuccessTitle'),
        text: t('updateSuccessText'),
      });
      const updatedUser = { ...user, name, gender, birthday };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdate(updatedUser);
      onClose();
    } else {
      Swal.fire({
        icon: 'error',
        title: t('updateFailTitle'),
        text: result.error || t('updateFailText'),
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window fixed-size">
        <div className="modal-top-tabs">
          <span className="tab-option active-tab">{t('editProfileTitle')}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <label>{t('nameLabel')}：</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

          <label>{t('genderLabel')}：</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">{t('selectGender')}</option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
            <option value="other">{t('other')}</option>
          </select>

          <label>{t('birthdayLabel')}：</label>
          <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />

          <label>{t('newPasswordLabel')}：</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

          <button className="modal-submit" onClick={handleUpdate}>{t('saveChangesButton')}</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;