/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

function MyCars() {
    const [cars, setCars] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Стани форми
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [message, setMessage] = useState('');

    // Стан для відстеження режиму (додавання чи редагування)
    const [editingCarId, setEditingCarId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Ви не авторизовані!");
            setLoading(false);
            return;
        }

        try {
            const catResponse = await fetch('/api/data/categories');
            if (catResponse.ok) {
                const catData = await catResponse.json();
                setCategories(catData);
                if (catData.length > 0 && !editingCarId) setCategoryId(catData[0].id);
            }

            const carsResponse = await fetch('/api/cars', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (carsResponse.ok) {
                const carsData = await carsResponse.json();
                setCars(carsData);
            }
        } catch (err) {
            setError("Помилка завантаження даних.");
        } finally {
            setLoading(false);
        }
    };

    // Об'єднана функція: Створення або Оновлення
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');

        // Визначаємо URL і Метод залежно від того, чи ми зараз редагуємо
        const url = editingCarId ? `/api/cars/${editingCarId}` : '/api/cars';
        const method = editingCarId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    brand, model, licensePlate,
                    vehicleCategoryId: parseInt(categoryId)
                })
            });

            if (response.ok) {
                setMessage(editingCarId ? '✅ Зміни збережено!' : '✅ Авто успішно додано!');
                resetForm();
                fetchData(); // Оновлюємо список
            } else {
                setMessage('❌ Помилка при збереженні.');
            }
        } catch (err) {
            setMessage('❌ Помилка з\'єднання.');
        }
    };

    // Функція Видалення
    const handleDelete = async (id) => {
        if (!window.confirm("Ви точно хочете видалити це авто з гаража?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/cars/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchData(); // Оновлює список після видалення
            } else {
                alert("Помилка при видаленні авто.");
            }
        } catch (err) {
            alert("Помилка з'єднання.");
        }
    };

    const handleEditClick = (car) => {
        setEditingCarId(car.id);
        setBrand(car.brand);
        setModel(car.model);
        setLicensePlate(car.licensePlate || '');

        // Якщо car.vehicleCategoryId немає, беремо першу категорію зі списку
        if (car.vehicleCategoryId) {
            setCategoryId(car.vehicleCategoryId);
        } else if (categories.length > 0) {
            setCategoryId(categories[0].id);
        }

        // Плавно скролимо сторінку вгору до форми
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Скасувати редагування
    const resetForm = () => {
        setEditingCarId(null);
        setBrand(''); setModel(''); setLicensePlate('');
        if (categories.length > 0) setCategoryId(categories[0].id);
        setMessage('');
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Завантаження гаража...</h2>;
    if (error) return <h2 style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white' }}>🚗 Мій Гараж</h1>

            {/* ФОРМА */}
            <div className="card" style={{ margin: '0 auto 30px auto', maxWidth: '500px', textAlign: 'left', padding: '20px', borderTop: editingCarId ? '5px solid #f39c12' : 'none' }}>
                <h2>{editingCarId ? 'Редагувати авто' : 'Додати нове авто'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    <input type="text" placeholder="Марка (напр. Toyota)" value={brand} onChange={(e) => setBrand(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Модель (напр. Camry)" value={model} onChange={(e) => setModel(e.target.value)} required style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="text" placeholder="Номерний знак" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />

                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ backgroundColor: editingCarId ? '#f39c12' : '#27ae60', flex: 1 }}>
                            {editingCarId ? 'Зберегти зміни' : 'Зберегти авто'}
                        </button>

                        {/* Кнопка скасування (показуємо тільки при редагуванні) */}
                        {editingCarId && (
                            <button type="button" onClick={resetForm} style={{ backgroundColor: '#95a5a6', flex: 1 }}>
                                Скасувати
                            </button>
                        )}
                    </div>
                </form>
                {message && <p style={{ marginTop: '10px', fontWeight: 'bold' }}>{message}</p>}
            </div>

            {/* СПИСОК АВТО */}
            <div className="services-grid">
                {cars.length === 0 ? (
                    <p style={{ color: 'white', fontSize: '18px' }}>У вас ще немає доданих авто.</p>
                ) : (
                    cars.map(car => (
                        <div key={car.id} className="card" style={{ width: '250px', borderTop: '5px solid #3498db', position: 'relative', paddingBottom: '60px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{car.brand} {car.model}</h3>
                            <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Клас: <strong>{car.categoryName}</strong></p>

                            {car.licensePlate && (
                                <p style={{ backgroundColor: '#f1f2f6', display: 'inline-block', padding: '5px 10px', borderRadius: '5px', border: '1px solid #ccc', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                                    {car.licensePlate}
                                </p>
                            )}

                            {/* Кнопки керування */}
                            <div style={{ position: 'absolute', bottom: '15px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEditClick(car)} style={{ flex: 1, backgroundColor: '#f39c12', padding: '5px', fontSize: '14px' }}>✏️ Змінити</button>
                                <button onClick={() => handleDelete(car.id)} style={{ flex: 1, backgroundColor: '#e74c3c', padding: '5px', fontSize: '14px' }}>🗑️ Видалити</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MyCars;