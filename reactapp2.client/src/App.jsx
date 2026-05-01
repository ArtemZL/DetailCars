import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import MyCars from './pages/MyCars';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import FakePayment from './pages/FakePayment';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import './App.css';

function App() {
    const navigate = useNavigate();

    const isAuthenticated = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token'); 
        navigate('/'); 
    };

    return (
        <div>
            <nav style={{ padding: '20px', backgroundColor: '#2c3e50', marginBottom: '20px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Головна</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/profile" style={{ color: '#f39c12', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Профіль</Link>
                        <Link to="/orders" style={{ color: '#3498db', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Замовлення</Link>
                        <Link to="/my-cars" style={{ color: '#34db8a', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Мої авто</Link>
                        <button onClick={handleLogout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Вийти</button>
                    </>
                ) : (
                    <>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Реєстрація</Link>
                        <Link to="/login" style={{ color: '#f1c40f', textDecoration: 'none', fontSize: '18px', fontWeight: 'bold' }}>Вхід</Link>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/my-cars" element={<MyCars />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<MyOrders />} />
                <Route path="/fake-payment" element={<FakePayment />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
        </div>
    );
}

export default App;