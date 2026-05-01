/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();''
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setMessage('Перевірте вашу пошту. Ми надіслали посилання для скидання пароля.');
                setEmail('');
            } else {
                const data = await response.json();
                setError(data.message || 'Сталася помилка при відправці запиту.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h2>Відновлення пароля</h2>
            {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px' }}>
                    {isLoading ? 'Відправка...' : 'Надіслати'}
                </button>
            </form>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/login">Повернутися до входу</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;