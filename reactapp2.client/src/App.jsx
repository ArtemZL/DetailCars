import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        populateServices();
    }, []);

    async function populateServices() {
        try {
            // Запит на сервер
            const response = await fetch('api/data/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            } else {
                console.error("Помилка сервера, статус:", response.status);
            }
        } catch (error) {
            console.error("Помилка з'єднання:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container">
            <h1>🚙 Автодетейлінг: Наші послуги</h1>

            {loading ? (
                <p><em>Завантаження даних...</em></p>
            ) : (
                <div className="services-grid">
                    {services.map(service => (
                        <div key={service.id} className="card">
                            <h2>{service.name}</h2>
                            <p className="price">{service.basePrice} грн</p>
                            <p className="desc">{service.description}</p>
                            <button>Обрати</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;