/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const service = location.state?.service;

    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [comments, setComments] = useState('');

    // 👇 СТАН ДЛЯ ФОТО 👇
    const [photoFile, setPhotoFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Щоб кнопка не натискалась двічі

    useEffect(() => {
        if (!service) {
            navigate('/');
            return;
        }
        fetchMyCars();
    }, [service, navigate]);

    const fetchMyCars = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/cars', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCars(data);
                if (data.length > 0) setSelectedCarId(data[0].id);
            }
        } catch (error) {
            console.error("Помилка завантаження авто");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cars.length === 0) {
            setMessage('❌ Спочатку додайте авто у розділі "Мої авто"!');
            return;
        }

        setIsSubmitting(true);
        setMessage('⏳ Обробка замовлення...');
        const token = localStorage.getItem('token');
        let uploadedPhotoUrl = null;

        try {
            // ЯКЩО Є ФОТО - СПОЧАТКУ ВІДПРАВЛЯЄМО ЙОГО
            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);

                const uploadRes = await fetch('/api/Upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData // Content-Type браузер встановить автоматично для FormData!
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedPhotoUrl = data.url; // Отримуємо наше посилання (/uploads/...)
                } else {
                    setMessage('❌ Помилка завантаження фотографії.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // 2. ВІДПРАВЛЯЄМО САМЕ ЗАМОВЛЕННЯ (з посиланням на фото або без нього)
            const orderResponse = await fetch('/api/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userCarId: parseInt(selectedCarId),
                    serviceIds: [service.id],
                    userComments: comments,
                    problemPhotoUrl: uploadedPhotoUrl // Передаємо посилання в БД
                })
            });

            if (orderResponse.ok) {
                setMessage('✅ Замовлення успішно оформлено!');
                setTimeout(() => navigate('/orders'), 2000);
            } else {
                setMessage('❌ Сталася помилка при оформленні.');
            }
        } catch (error) {
            setMessage('❌ Помилка з\'єднання з сервером.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Підготовка до оформлення...</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white' }}>🛒 Оформлення замовлення</h1>

            <div className="card" style={{ margin: '0 auto', maxWidth: '500px', textAlign: 'left', padding: '20px' }}>
                <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{service?.name}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                    <label style={{ fontWeight: 'bold' }}>Оберіть ваше авто:</label>
                    <select value={selectedCarId} onChange={(e) => setSelectedCarId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        {cars.map(car => (
                            <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
                        ))}
                    </select>

                    <label style={{ fontWeight: 'bold' }}>Коментар:</label>
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows="3" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                    {/* 👇 ПОЛЕ ДЛЯ ЗАВАНТАЖЕННЯ ФОТО 👇 */}
                    <div style={{ backgroundColor: '#f1f2f6', padding: '15px', borderRadius: '5px', border: '1px dashed #ccc' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                            📸 Фото проблеми (для ШІ-оцінки):
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhotoFile(e.target.files[0])}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: '12px', color: '#7f8c8d', margin: '5px 0 0 0' }}>
                            Завантажте фото брудного салону або кузова, щоб ми оцінили складність роботи.
                        </p>
                    </div>

                    <button type="submit" disabled={isSubmitting || cars.length === 0} style={{ backgroundColor: '#27ae60', marginTop: '10px' }}>
                        {isSubmitting ? 'Обробка...' : 'Підтвердити замовлення'}
                    </button>
                </form>

                {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('❌') ? '#e74c3c' : '#27ae60' }}>{message}</p>}
            </div>
        </div>
    );
}

export default Checkout;