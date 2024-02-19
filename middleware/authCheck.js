import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {destroyCookie, parseCookies} from 'nookies';
import {LOGIN_PAGE_URL} from "../routes/web";

const AuthCheck = (WrappedComponent) => {
    const Check = (props) => {
        const router = useRouter();
        const [checkToken, setCheckToken] = useState(null); // Инициализация стейта

        useEffect(() => {
            const cookies = parseCookies();
            const authToken = cookies.authToken ? JSON.parse(cookies.authToken) : null;
            const currentTime = Math.floor(Date.now() / 1000); // Текущее время в секундах

            if (!authToken && router.pathname !== '/login') {
                // Если нет токена и не на странице логина, перенаправляем на страницу логина
                router.replace('/login');
            } else if (authToken) {
                const {value, expiration} = authToken;

                if (expiration <= currentTime) {
                    destroyCookie(null, 'authToken'); // Удаляем токен
                    router.replace('/login'); // Перенаправляем на страницу логина
                }
            }
        }, [router]);

        if (!checkToken && router.pathname !== LOGIN_PAGE_URL) {
            return null; // Возвращаем null, пока идет проверка аутентификации
        } else {
            return <WrappedComponent {...props} />;
        }
    };

    return Check;
};

export default AuthCheck;
