import { useState, useEffect } from 'react';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Ви не авторизовані!");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/Orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                setError("Не вдалося завантажити замовлення.");
            }
        } catch (err) {
            setError("Помилка з'єднання з сервером.");
        } finally {
            setLoading(false);
        }
    };

    // для перекладу статусів 
    const translateStatus = (status) => {
        switch (status) {
            case 'Pending': return { text: 'В очікуванні ⏳', color: '#f39c12' };
            case 'InProgress': return { text: 'В роботі ⚙️', color: '#3498db' };
            case 'Completed': return { text: 'Виконано ✅', color: '#27ae60' };
            case 'Cancelled': return { text: 'Скасовано ❌', color: '#e74c3c' };
            default: return { text: status, color: '#95a5a6' };
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Завантаження історії...</h2>;
    if (error) return <h2 style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</h2>;

    return (
        <div className="container">
            <h1 style={{ color: 'white' }}>📦 Мої замовлення</h1>

            {orders.length === 0 ? (
                <p style={{ color: 'white', fontSize: '18px' }}>У вас ще немає замовлень.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    {orders.map(order => {
                        const statusInfo = translateStatus(order.status);

                        return (
                            <div key={order.id} className="card" style={{ textAlign: 'left', padding: '20px', borderLeft: `5px solid ${statusInfo.color}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0 }}>Замовлення #{order.id}</h3>
                                    <span style={{ fontWeight: 'bold', color: statusInfo.color }}>
                                        {statusInfo.text}
                                    </span>
                                </div>

                                <p style={{ margin: '5px 0' }}><strong>Авто:</strong> {order.carInfo}</p>
                                <p style={{ margin: '5px 0' }}><strong>Дата:</strong> {new Date(order.createdAt).toLocaleString('uk-UA')}</p>

                                <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Послуги:</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {order.serviceNames.map((name, index) => (
                                            <li key={index}>{name}</li>
                                        ))}
                                    </ul>
                                </div>

                                {order.userComments && (
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#7f8c8d' }}>
                                        <strong>Ваш коментар:</strong> {order.userComments}
                                    </p>
                                )}

                                <p style={{ margin: '15px 0 0 0', fontSize: '18px', textAlign: 'right' }}>
                                    <strong>Сума: <span style={{ color: '#27ae60' }}>{order.totalPrice} грн</span></strong>
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyOrders;