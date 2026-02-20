import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../App.css';

function Home() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); 

    useEffect(() => {
        populateServices();
    }, []);

    async function populateServices() {
        try {
            const response = await fetch('api/data/services');
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            } else {
                console.error("Помилка сервера:", response.status);
            }
        } catch (error) {
            console.error("Не вдалося завантажити дані:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleChooseService = (service) => {
        const token = localStorage.getItem('token'); 

        if (!token) {
            alert('Будь ласка, авторизуйтесь або зареєструйтесь, щоб замовити послугу 🚗');
            navigate('/login'); 
        } else {
            alert(`Круто! Ви обрали: ${service.name}. Скоро тут буде перехід до оформлення.`);
        }
    };

    return (
        <div className="container">
            <h1>🚙 Автодетейлінг: Наші послуги</h1>

            {loading ? (
                <p style={{ color: 'white' }}><em>Завантаження даних...</em></p>
            ) : (
                <div className="services-grid">
                    {services.map(service => (
                        <div key={service.id} className="card">
                            <h2>{service.name}</h2>
                            <p className="price">{service.basePrice} грн</p>
                            <p className="desc">{service.description}</p>

                            <button onClick={() => handleChooseService(service)}>
                                Обрати
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;