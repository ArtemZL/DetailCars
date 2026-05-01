/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Стани для редагування профілю
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phoneNumber: '' });
    const [profileMsg, setProfileMsg] = useState('');

    // Стани для зміни пароля
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [passMsg, setPassMsg] = useState('');

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Ви не авторизовані!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/Auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                // Одразу заповнюємо форму редагування поточними даними
                setEditForm({ firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber });
            } else {
                setError('Не вдалося завантажити профіль.');
            }
        } catch (err) {
            setError('Помилка з\'єднання.');
        } finally {
            setLoading(false);
        }
    };

    // Збереження нових даних профілю
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg('');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/Auth/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                setProfileMsg('✅ Профіль успішно оновлено!');
                setIsEditing(false);
                fetchProfileData();
            } else {
                setProfileMsg('❌ Помилка при оновленні.');
            }
        } catch (err) {
            setProfileMsg('❌ Помилка з\'єднання.');
        }
    };

    // Надіслати лист для скидання пароля
    const handleSendPasswordReset = async () => {
        if (!profile?.email) {
            setPassMsg('❌ Email не знайдено.');
            return;
        }

        setPassMsg('');
        setIsSendingReset(true);

        try {
            const response = await fetch('/api/Auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: profile.email })
            });

            if (response.ok) {
                setPassMsg('✅ Лист для скидання пароля надіслано. Перевірте пошту.');
                setIsChangingPass(false);
            } else {
                const data = await response.json().catch(() => null);
                setPassMsg(`❌ ${data?.message || 'Помилка відправки листа.'}`);
            }
        } catch (err) {
            setPassMsg('❌ Помилка з\'єднання.');
        } finally {
            setIsSendingReset(false);
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Завантаження...</h2>;
    if (error) return <h2 style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white', marginBottom: '30px' }}>👤 Мій Профіль</h1>

            {profile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', margin: '0 auto' }}>

                    {/* БЛОК 1: ОСОБИСТІ ДАНІ */}
                    <div className="card" style={{ textAlign: 'left', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Особисті дані</h2>
                            {!isEditing && (
                                <button onClick={() => setIsEditing(true)} style={{ backgroundColor: '#f39c12', padding: '5px 15px', fontSize: '14px' }}>✏️ Редагувати</button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input type="text" placeholder="Ім'я" value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                <input type="text" placeholder="Прізвище" value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                <input type="tel" placeholder="Телефон" value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} required style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>Email: {profile.email} (не змінюється)</p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={{ flex: 1, backgroundColor: '#27ae60' }}>Зберегти</button>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1, backgroundColor: '#95a5a6' }}>Скасувати</button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <p style={{ fontSize: '18px', margin: '10px 0' }}><strong>Ім'я:</strong> {profile.firstName}</p>
                                <p style={{ fontSize: '18px', margin: '10px 0' }}><strong>Прізвище:</strong> {profile.lastName}</p>
                                <p style={{ fontSize: '18px', margin: '10px 0' }}><strong>Телефон:</strong> {profile.phoneNumber}</p>
                                <p style={{ fontSize: '18px', margin: '10px 0' }}><strong>Email:</strong> {profile.email}</p>
                            </div>
                        )}
                        {profileMsg && <p style={{ marginTop: '15px', fontWeight: 'bold', color: profileMsg.includes('✅') ? '#27ae60' : '#e74c3c' }}>{profileMsg}</p>}
                    </div>

                    {/* БЛОК 2: БЕЗПЕКА (ПАРОЛЬ) */}
                    <div className="card" style={{ textAlign: 'left', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Безпека</h2>
                            {!isChangingPass && (
                                <button onClick={() => setIsChangingPass(true)} style={{ backgroundColor: '#e74c3c', padding: '5px 15px', fontSize: '14px' }}>🔑 Змінити пароль</button>
                            )}
                        </div>

                        {isChangingPass && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <p style={{ margin: 0 }}>Ми надішлемо лист для скидання пароля на вашу пошту.</p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={handleSendPasswordReset} disabled={isSendingReset} style={{ flex: 1, backgroundColor: '#e74c3c' }}>
                                        {isSendingReset ? 'Відправка...' : 'Надіслати лист'}
                                    </button>
                                    <button type="button" onClick={() => setIsChangingPass(false)} style={{ flex: 1, backgroundColor: '#95a5a6' }}>Скасувати</button>
                                </div>
                            </div>
                        )}
                        {passMsg && <p style={{ marginTop: '15px', fontWeight: 'bold', color: passMsg.includes('✅') ? '#27ae60' : '#e74c3c' }}>{passMsg}</p>}
                    </div>

                </div>
            )}
        </div>
    );
}

export default Profile;