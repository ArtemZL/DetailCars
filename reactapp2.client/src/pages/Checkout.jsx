/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const service = location.state?.service;

    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [comments, setComments] = useState('');
    const [photoFile, setPhotoFile] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Стан для вибору способу оплати (за замовчуванням - готівка)
    const [paymentMethod, setPaymentMethod] = useState('cash');

    useEffect(() => {
        if (!service) {
            navigate('/');
            return;
        }
        fetchMyCars();
    }, [service, navigate]);

    // 👇 НОВИЙ ЕФЕКТ: Завантажує вільні години, коли змінюється дата 👇
    useEffect(() => {
        if (!selectedDate || !service) return;

        const fetchAvailableSlots = async () => {
            setLoadingSlots(true);
            setSelectedTime(''); // Скидаємо обраний час при зміні дати
            try {
                // Якщо у service немає durationMinutes з бекенду, ставимо 60 як резерв
                const duration = service.durationMinutes || 60;
                const response = await fetch(`/api/Orders/available-slots?date=${selectedDate}&durationMinutes=${duration}`);

                if (response.ok) {
                    const slots = await response.json();
                    setAvailableSlots(slots);
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error("Помилка завантаження розкладу");
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailableSlots();
    }, [selectedDate, service]);

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

        if (!selectedTime) {
            setMessage('❌ Будь ласка, оберіть вільний час для запису!');
            return;
        }

        setIsSubmitting(true);
        setMessage('⏳ Обробка замовлення...');
        const token = localStorage.getItem('token');
        let uploadedPhotoUrl = null;

        try {
            if (photoFile) {
                const formData = new FormData();
                formData.append('file', photoFile);

                const uploadRes = await fetch('/api/Upload/image', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    uploadedPhotoUrl = data.url;
                } else {
                    setMessage('❌ Помилка завантаження фотографії.');
                    setIsSubmitting(false);
                    return;
                }
            }

            const scheduledStartTime = `${selectedDate}T${selectedTime}:00`;

            // Відправляємо замовлення на бекенд
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
                    problemPhotoUrl: uploadedPhotoUrl,
                    scheduledStartTime: scheduledStartTime,
                    paymentMethod: paymentMethod
                })
            });

            if (orderResponse.ok) {
                const orderData = await orderResponse.json();

                if (paymentMethod === 'card') {
                    setMessage('💸 Перехід до оплати...');
                    const payResponse = await fetch('/api/payments/create-mock-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData.orderId)
                    });

                    if (payResponse.ok) {
                        const payData = await payResponse.json();
                        navigate(payData.url);
                        // Видалено: navigate('/orders');
                        return;
                    } else {
                        setMessage('❌ Помилка ініціалізації оплати.');
                    }
                } else {
                    // Якщо обрана оплата готівкою - редірект на "Мої замовлення"
                    setMessage('✅ Замовлення успішно оформлено!');
                    navigate('/orders'); // Миттєвий редірект
                }
            } else {
                setMessage('❌ Сталася помилка при оформленні.');
            }
        } catch (error) {
            setMessage("❌ Помилка з'єднання з сервером.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/payments/create-mock-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(location.state.orderId) // Передаємо ID замовлення (число)
            });

            if (response.ok) {
                const data = await response.json();
                // Переходимо на нашу тестову сторінку оплати
                navigate(data.url);
            } else {
                alert("Помилка ініціалізації оплати");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        setIsLoading(true);
        try {
            // 1. ТУТ МАЄ БУТИ ВАШ КОД СТВОРЕННЯ ЗАМОВЛЕННЯ В БД
            // Наприклад, ви відправляєте вибрані послуги, час та авто:
            /*
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // ...ваші дані замовлення (Id авто, дата, послуги)
                })
            });
            const createdOrder = await orderResponse.json();
            const orderId = createdOrder.id; // Отримуємо згенерований ID з бази
            */

            // Для прикладу використаємо тимчасовий ID (замініть на реальний з бекенду):
            const orderId = 1;

            // 2. Логіка в залежності від способу оплати
            if (paymentMethod === 'card') {
                // Якщо карта - викликаємо наш Mock шлюз
                const payResponse = await fetch('/api/payments/create-mock-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderId)
                });

                if (payResponse.ok) {
                    const data = await payResponse.json();
                    navigate(data.url); // Перехід на FakePayment
                } else {
                    alert("Помилка ініціалізації оплати.");
                }
            } else {
                // Якщо готівка - просто завершуємо флоу
                alert("Замовлення успішно підтверджено! Оплата готівкою після послуги.");
                navigate('/myorders');
            }
        } catch (error) {
            console.error("Помилка підтвердження замовлення", error);
            alert("Сталася помилка.");
        } finally {
            setIsLoading(false);
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
                    {cars.length === 0 ? (
                        <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '6px', border: '1px solid #ffeeba' }}>
                            <p style={{ margin: '0 0 10px 0' }}>У вас ще немає доданих авто.</p>
                            <button type="button" onClick={() => navigate('/my-cars')} style={{ backgroundColor: '#3498db' }}>
                                ➕ Додати авто
                            </button>
                        </div>
                    ) : (
                        <select value={selectedCarId} onChange={(e) => setSelectedCarId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
                            ))}
                        </select>
                    )}

                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>📅 Оберіть дату візиту:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            min={new Date().toLocaleDateString('en-CA')} // Блокуємо минулі дати
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '15px' }}
                        />

                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>⏰ Доступні години:</label>
                        {loadingSlots ? (
                            <p style={{ margin: 0, color: '#7f8c8d' }}>Пошук вільних місць...</p>
                        ) : availableSlots.length === 0 ? (
                            <p style={{ margin: 0, color: '#e74c3c' }}>На жаль, на цю дату вільних місць немає.</p>
                        ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {availableSlots.map(time => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        style={{
                                            padding: '10px 15px',
                                            border: `2px solid ${selectedTime === time ? '#27ae60' : '#bdc3c7'}`,
                                            backgroundColor: selectedTime === time ? '#27ae60' : 'transparent',
                                            color: selectedTime === time ? 'white' : '#2c3e50',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: '0.2s'
                                        }}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <label style={{ fontWeight: 'bold' }}>Коментар:</label>
                    <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows="3" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

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

                    {/* НОВИЙ БЛОК ОПЛАТИ ВБУДОВАНИЙ У ФОРМУ */}
                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                            💳 Спосіб оплати:
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={() => setPaymentMethod('cash')}
                                    style={{ margin: 0, width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                Готівкою (після виконання послуги)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="card"
                                    checked={paymentMethod === 'card'}
                                    onChange={() => setPaymentMethod('card')}
                                    style={{ margin: 0, width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                Карткою в застосунку (онлайн)
                            </label>
                        </div>
                    </div>

                    {/* ЄДИНА КНОПКА ПІДТВЕРДЖЕННЯ */}
                    <button
                        type="submit"
                        disabled={isSubmitting || cars.length === 0 || !selectedTime}
                        styleBrands={{
                            backgroundColor: (!selectedTime || isSubmitting) ? '#95a5a6' : '#27ae60',
                            marginTop: '10px',
                            cursor: (!selectedTime || isSubmitting) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isSubmitting ? 'Обробка...' : (!selectedTime ? 'Оберіть час запису' : 'Підтвердити замовлення')}
                    </button>
                </form>

                {message && <p style={{ marginTop: '15px', fontWeight: 'bold', textAlign: 'center', color: message.includes('❌') ? '#e74c3c' : '#27ae60' }}>{message}</p>}
            </div>
        </div>
    );
}

export default Checkout;