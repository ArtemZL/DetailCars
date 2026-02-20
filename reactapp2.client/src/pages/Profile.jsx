function Profile() {
    return (
        <div className="container">
            <h1 style={{ color: 'white' }}>👤 Мій Профіль</h1>
            <div className="card" style={{ margin: '0 auto', maxWidth: '500px', textAlign: 'left' }}>
                <h2>Особисті дані</h2>
                <p>Тут ми будемо виводити Ім'я, Прізвище, Телефон та Email користувача.</p>
                <hr style={{ margin: '20px 0' }} />
                <p><em>Дані скоро підтягнуться з бази...</em></p>
            </div>
        </div>
    );
}

export default Profile;