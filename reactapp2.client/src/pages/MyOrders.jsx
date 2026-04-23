/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active'); // 'active' або 'history'

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
                // Сортуємо: найновіші зверху
                data.sort((a, b) => new Date(b.scheduledStartTime) - new Date(a.scheduledStartTime));
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

    const handleCancel = async (orderId) => {
        if (!window.confirm("Ви впевнені, що хочете скасувати це замовлення?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/Orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchOrders(); 
            } else {
                const errorText = await response.text();
                alert(`Увага: ${errorText}`);
            }
        } catch (error) {
            console.error("Помилка з'єднання з сервером.");
        }
    };

    // для перекладу статусів 
    const translateStatus = (status) => {
        switch (status) {
            case 'Pending': return { text: 'В очікуванні ⏳', color: '#f39c12' };
            case 'Paid': return { text: 'Оплачено 💳', color: '#8e44ad' };     
            case 'InProgress': return { text: 'В роботі ⚙️', color: '#3498db' };
            case 'Completed': return { text: 'Виконано ✅', color: '#27ae60' };
            case 'Cancelled': return { text: 'Скасовано ❌', color: '#e74c3c' };
            default: return { text: status, color: '#95a5a6' };
        }
    };

    if (loading) return <h2 style={{ color: 'white', textAlign: 'center' }}>Завантаження історії...</h2>;
    if (error) return <h2 style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</h2>;

    // Фільтруємо замовлення залежно від відкритої вкладки
    const activeStatuses = ['Pending', 'Paid', 'InProgress'];
    const displayedOrders = orders.filter(o => 
        activeTab === 'active' 
            ? activeStatuses.includes(o.status) 
            : !activeStatuses.includes(o.status)
    );

    return (
        <div className="container">
            <h1 style={{ color: 'white', textAlign: 'center' }}>📦 Мої замовлення</h1>

            {/* Вкладки (Tabs) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('active')}
                    style={{ 
                        padding: '10px 20px', 
                        cursor: 'pointer', 
                        backgroundColor: activeTab === 'active' ? '#3498db' : '#2c3e50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    Активні
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    style={{ 
                        padding: '10px 20px', 
                        cursor: 'pointer', 
                        backgroundColor: activeTab === 'history' ? '#3498db' : '#2c3e50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    Історія
                </button>
            </div>

            {displayedOrders.length === 0 ? (
                <p style={{ color: 'white', fontSize: '18px', textAlign: 'center' }}>
                    {activeTab === 'active' ? "У вас немає активних замовлень." : "Ваша історія замовлень порожня."}
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    {displayedOrders.map(order => {
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
                                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#7f8c8d' }}>
                                    <strong>📅 Час візиту: </strong>
                                    <span style={{ color: '#2980b9', fontWeight: 'bold' }}>
                                        {new Date(order.scheduledStartTime).toLocaleString('uk-UA', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </p>

                                <div style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Послуги:</p>
                                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                        {order.serviceNames.map((name, index) => (
                                            <li key={index} style={{ color: '#2c3e50' }}>{name}</li>
                                        ))}
                                    </ul>
                                </div>

                                {order.aiRecommendedAddon && (
                                    <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#f0fdf4', borderLeft: '5px solid #2ecc71', borderRadius: '5px' }}>
                                        <p style={{ margin: '0 0 10px 0', color: '#27ae60', fontWeight: 'bold', fontSize: '16px' }}>
                                            🤖 Рекомендація ШІ після аналізу фото:
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                                            <strong>Знайдена проблема:</strong> {order.aiProblemType === 'Stain' ? 'Пляма' :
                                                order.aiProblemType === 'Scratch' ? 'Подряпина' :
                                                    order.aiProblemType === 'Dirt' ? 'Сильне забруднення' :
                                                        order.aiProblemType}
                                        </p>
                                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#2c3e50' }}>
                                            <strong>Рекомендована послуга:</strong> {order.aiRecommendedAddon}
                                            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}> (+{order.aiExtraPrice} грн)</span>
                                        </p>
                                    </div>
                                )}

                                {order.userComments && (
                                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#7f8c8d' }}>
                                        <strong>Ваш коментар:</strong> {order.userComments}
                                    </p>
                                )}

                                <p style={{ margin: '15px 0 0 0', fontSize: '18px', textAlign: 'right', color: '#2c3e50' }}>
                                    <strong>Спосіб оплати: <span style={{ color: '#2980b9' }}>
                                        {order.paymentMethod === 'card' ? 'Сплачено' : '💵 Готівкою'}
                                    </span></strong>
                                </p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '18px', textAlign: 'right', color: '#2c3e50' }}>
                                    <strong>Сума: <span style={{ color: '#27ae60' }}>{order.totalPrice} грн</span></strong>
                                </p>

                                {/* Змінюємо умову, щоб кнопка показувалася і для Pending, і для Paid */}
                                {(order.status === 'Pending' || order.status === 'Paid') && (
                                    <button 
                                        onClick={() => handleCancel(order.id)} 
                                        style={{ marginTop: '15px', width: '100%', backgroundColor: '#e74c3c', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Скасувати замовлення
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyOrders;