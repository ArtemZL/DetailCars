/* eslint-disable no-unused-vars */
import { useState } from 'react';

function Register() {
    // Додаємо нові стани для нових полів
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/Auth/register-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    phoneNumber,
                    email,
                    password
                })
            });

            if (response.ok) {
                setMessage('✅ Реєстрація успішна! Тепер можете увійти.');
                setFirstName(''); setLastName(''); setPhoneNumber('');
                setEmail(''); setPassword('');
            } else {
                setMessage('❌ Помилка. Пароль має містити велику літеру, цифру та спецсимвол (!@#). Або такий Email вже існує.');
            }
        } catch (error) {
            setMessage('❌ Помилка з\'єднання з сервером.');
        }
    };

    return (
        <div className="card" style={{ margin: '0 auto', marginTop: '50px', maxWidth: '400px' }}>
            <h2>Реєстрація клієнта</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                <input
                    type="text" placeholder="Ім'я" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="text" placeholder="Прізвище" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="tel" placeholder="Номер телефону (напр. 0991234567)" value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <input
                    type="email" placeholder="Ваш Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <input
                    type="password" placeholder="Пароль" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />

                <button type="submit">Зареєструватися</button>
            </form>
            {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
}

export default Register;