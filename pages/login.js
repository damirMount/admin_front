import { useState } from 'react';
import { useRouter } from 'next/router';
import { setCookie } from 'nookies'; // Подключение библиотеки nookies для работы с куками
import {POST_LOGIN_API} from '../routes/api'

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const apiUrl = `${POST_LOGIN_API}`;
        // Проверка учетных данных и генерация токена аутентификации
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const { token } = await response.json();

                // Вычисление времени истечения токена (12 часов)
                const expirationTime = new Date();
                expirationTime.setHours(expirationTime.getHours() + 12);

                const tokenData = {
                    value: token,
                    expiration: expirationTime.getTime(),
                };

                // Сохранение токена в куки с продлением на 12 час
                setCookie(null, 'authToken', JSON.stringify(tokenData), {
                    maxAge: 43200, // Время жизни куки в секундах (1 час = 3600 секунд)
                    path: '/', // Путь, на котором куки будет доступно
                });

                await router.push('/update-db');
            } else {
                const errorData = await response.json();

                // Обработка ошибки аутентификации
            }
        } catch (error) {
            console.log('Произошла ошибка при отправке запроса:', error);
            // Обработка ошибки при выполнении запроса
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', fontFamily: 'sans-serif' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Вход</h1>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="username">Логин:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div className="d-flex justify-content-center">
                    <button
                        type="submit" className="btn btn-purple">
                        Войти
                    </button>
                </div>
            </form>
        </div>
    );
}
