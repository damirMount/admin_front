import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {parseCookies} from 'nookies';
import {LOGIN_PAGE_URL} from "../routes/web";

const AuthCheck = (WrappedComponent) => {
    const Check = (props) => {
        const router = useRouter();
        const [checkToken, setCheckToken] = useState(null); // Инициализация стейта

        useEffect(() => {
            const cookies = parseCookies();
            const authToken = cookies.authToken ? JSON.parse(cookies.authToken) : null;
            setCheckToken(authToken)
            const currentTime = Math.floor(Date.now() / 1000);

            if (!authToken || authToken.expiration <= currentTime) {
                // Перенаправляем на страницу входа, если пользователь не авторизован или токен истек
                router.replace(LOGIN_PAGE_URL);
            }
        }, []);

        if (!checkToken && router.pathname !== LOGIN_PAGE_URL) {
            return null; // Возвращаем null, пока идет проверка аутентификации
        } else {
            return <WrappedComponent {...props} />;
        }
    };

    return Check;
};

export default AuthCheck;
