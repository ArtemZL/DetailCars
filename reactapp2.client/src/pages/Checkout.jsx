/* eslint-disable react-hooks/exhaustive-deps */
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
    const [photoFile, setPhotoFile] = useState(null);

    // 👇 НОВІ СТАНИ ДЛЯ КАЛЕНДАРЯ 👇
    // Встановлюємо сьогоднішню дату як дату за замовчуванням (формат YYYY-MM-DD)
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        // Перевірка, чи обрав клієнт час
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

            // Збираємо дату та час у правильний формат для DateTime 
            const scheduledStartTime = `${selectedDate}T${selectedTime}:00`;

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
                    scheduledStartTime: scheduledStartTime // ВІДПРАВЛЯЄМО ЧАС НА БЕКЕНД
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

                    <button
                        type="submit"
                        disabled={isSubmitting || cars.length === 0 || !selectedTime}
                        style={{
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