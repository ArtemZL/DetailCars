/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Отримуємо параметри з URL, які прийшли з посилання на пошті
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email || !token) {
            setError('Некоректне посилання для відновлення пароля.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Паролі не співпадають.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, newPassword }),
            });

            if (response.ok) {
                setMessage('Пароль успішно змінено! Перенаправлення на сторінку входу...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000); // Перенаправити на логін через 3 секунди
            } else {
                const data = await response.json();
                setError(data.message || 'Не вдалося скинути пароль(Можливо, термін дії посилання минув).');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !token) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h3 style={{ color: 'red' }}>Помилка!</h3>
                <p>Некоректне або неповне посилання. Будь ласка, перейдіть за посиланням з email ще раз.</p>
                <Link to="/forgot-password">Запросити посилання знову</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Створити новий пароль</h2>
            <p>Встановіть новий пароль для акаунта <strong>{email}</strong></p>

            {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="newPassword">Новий пароль</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword">Підтвердіть новий пароль</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
                    {isLoading ? 'Збереження...' : 'Зберегти пароль'}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;