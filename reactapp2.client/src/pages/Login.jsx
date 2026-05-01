/* eslint-disable no-unused-vars */
import { useState } from 'react';
// Додаємо імпорт Link з react-router-dom
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('token', data.accessToken);

                setMessage('✅ Вхід успішний! Переходимо на головну...');

                setTimeout(() => {
                    navigate('/');
                }, 100);
            } else {
                setMessage('❌ Неправильний Email або Пароль.');
            }
        } catch (error) {
            setMessage('❌ Помилка з\'єднання з сервером.');
        }
    };

    return (
        <div className="card" style={{ margin: '0 auto', marginTop: '50px', width: '300px' }}>
            <h2>Вхід</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input
                    type="email"
                    placeholder="Ваш Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit">Увійти</button>
            </form>
            
            {/* Додано посилання на відновлення пароля */}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#007bff' }}>
                    Забули пароль?
                </Link>
            </div>

            {/* Додано посилання на реєстрацію, якщо його ще не було (за бажанням) */}
            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.9em' }}>
                Немає акаунту? <Link to="/register" style={{ textDecoration: 'none', color: '#007bff' }}>Зареєструватися</Link>
            </div>

            {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
}

export default Login;