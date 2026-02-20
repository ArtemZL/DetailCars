/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        // 1. Дістаємо токен з пам'яті браузера
        const token = localStorage.getItem('token');

        if (!token) {
            setError("Ви не авторизовані!");
            setLoading(false);
            return;
        }

        try {
            // 2. Робимо запит і ПРИКРІПЛЮЄМО токен у заголовки
            const response = await fetch('/api/Auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Ось так ми показуємо "пропуск"
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data); // Зберігаємо отримані дані
            } else {
                setError('Не вдалося завантажити профіль. Можливо, термін дії сесії минув.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Завантаження профілю...</h2>;
    if (error) return <h2 style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white', marginBottom: '30px' }}>👤 Мій Профіль</h1>

            {profile && (
                <div className="card" style={{ margin: '0 auto', maxWidth: '400px', textAlign: 'left', padding: '30px' }}>
                    <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                        Особисті дані
                    </h2>

                    <p style={{ fontSize: '18px', margin: '10px 0' }}>
                        <strong>Ім'я:</strong> {profile.firstName}
                    </p>
                    <p style={{ fontSize: '18px', margin: '10px 0' }}>
                        <strong>Прізвище:</strong> {profile.lastName}
                    </p>
                    <p style={{ fontSize: '18px', margin: '10px 0' }}>
                        <strong>Email:</strong> {profile.email}
                    </p>
                    <p style={{ fontSize: '18px', margin: '10px 0' }}>
                        <strong>Телефон:</strong> {profile.phoneNumber}
                    </p>
                </div>
            )}
        </div>
    );
}

export default Profile;