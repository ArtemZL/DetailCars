import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const FakePayment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    const [isLoading, setIsLoading] = useState(false);

    const handleSimulatorPay = async () => {
        setIsLoading(true);
        try {
            // Симулюємо відправку вебхука на бекенд, щоб змінити статус
            const response = await fetch(`/api/payments/confirm-mock-payment/${orderId}`, {
                method: 'POST'
            });

            if (response.ok) {
                alert("✅ Оплата пройшла успішно! Статус замовлення змінено.");
                navigate('/myorders'); // Повертаємо користувача до його замовлень
            }
        } catch (error) {
            console.error(error);
            alert("Помилка при оплаті.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ textAlign: 'center', color: '#333' }}>Тестовий Платіжний Шлюз</h3>
            <p style={{ textAlign: 'center', color: '#666' }}>Режим симуляції для курсової роботи</p>

            <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                <h5>До сплати: <strong>{amount} грн</strong></h5>
                <p>Замовлення №{orderId}</p>
            </div>

            <div>
                <label>Номер картки (довільний)*</label>
                <input type="text" className="form-control mb-3" placeholder="1111 2222 3333 4444" defaultValue="4149 4323 1234 5678" />

                <div style={{ display: 'flex', gap: '10px' }} className="mb-3">
                    <div>
                        <label>MM/YY</label>
                        <input type="text" className="form-control" placeholder="12/26" defaultValue="12/25" />
                    </div>
                    <div>
                        <label>CVC</label>
                        <input type="text" className="form-control" placeholder="123" defaultValue="123" />
                    </div>
                </div>
            </div>

            <button 
                className="btn btn-success w-100 mt-2" 
                onClick={handleSimulatorPay}
                disabled={isLoading}
            >
                {isLoading ? "Обробка транзакції..." : "Сплатити"}
            </button>
            <button 
                className="btn btn-outline-danger w-100 mt-2" 
                onClick={() => navigate('/myorders')}
            >
                Відмінити
            </button>
        </div>
    );
};

export default FakePayment;