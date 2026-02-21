import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const service = location.state?.service;

    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!service) {
            navigate('/');
            return;
        }
        fetchMyCars();
    }, [service, navigate]);

    // Завантажуємо гараж клієнта
    const fetchMyCars = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/cars', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCars(data);
                // Якщо є машини, вибираємо першу за замовчуванням
                if (data.length > 0) {
                    setSelectedCarId(data[0].id);
                }
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

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/Orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userCarId: parseInt(selectedCarId),
                    serviceIds: [service.id], // бекенд чекає масив ID послуг
                    userComments: comments
                })
            });

            if (response.ok) {
                setMessage('✅ Замовлення успішно оформлено! Ми з вами зв\'яжемось.');
                setTimeout(() => navigate('/profile'), 1000);
            } else {
                setMessage('❌ Сталася помилка при оформленні.');
            }
        } catch (error) {
            setMessage('❌ Помилка з\'єднання з сервером.');
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Підготовка до оформлення...</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white' }}>🛒 Оформлення замовлення</h1>

            <div className="card" style={{ margin: '0 auto', maxWidth: '500px', textAlign: 'left', padding: '20px' }}>
                <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Ваше замовлення</h2>

                {/* Інформація про обрану послугу */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{service?.name}</h3>
                    <p style={{ margin: 0, color: '#7f8c8d' }}>Базова ціна: <strong>{service?.basePrice} грн</strong></p>
                    <p style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
                        * Фінальна вартість буде залежати від класу вашого авто.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <label style={{ fontWeight: 'bold' }}>Оберіть ваше авто:</label>
                    {cars.length === 0 ? (
                        <p style={{ color: '#e74c3c' }}>У вас немає доданих авто. Перейдіть в "Мої авто".</p>
                    ) : (
                        <select
                            value={selectedCarId}
                            onChange={(e) => setSelectedCarId(e.target.value)}
                            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        >
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.categoryName})
                                </option>
                            ))}
                        </select>
                    )}

                    <label style={{ fontWeight: 'bold' }}>Коментар до замовлення (необов'язково):</label>
                    <textarea
                        placeholder="Наприклад: Плями кави на сидінні..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="3"
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
                    />

                    <button type="submit" disabled={cars.length === 0} style={{ backgroundColor: '#27ae60', marginTop: '10px', opacity: cars.length === 0 ? 0.5 : 1 }}>
                        Підтвердити замовлення
                    </button>
                </form>

                {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center' }}>{message}</p>}
            </div>
        </div>
    );
}

export default Checkout;