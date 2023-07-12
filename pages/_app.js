import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {parseCookies, setCookie} from 'nookies';

function MyApp({Component, pageProps}) {
    const router = useRouter();

    useEffect(() => {
        const cookies = parseCookies();
        if (typeof cookies.authToken === 'undefined' && router.pathname !== '/login') {
            router.push('/login');
        } else if (typeof cookies.authToken !== 'undefined') {
            const authToken = JSON.parse(cookies.authToken);
            const {value, expiration} = authToken;
            if (router.pathname === '/') {
                // router.push('/dashboard');
            } else if (
                router.pathname === '/dashboard' ||
                router.pathname === '/update-db' ||
                router.pathname === '/registry/index' ||
                router.pathname === '/create-registry'
            ) {
                // Обновляем куку с продлением на 1 час
                setCookie(null, 'authToken', JSON.stringify({ value, expiration }), {
                    maxAge: 3600, // Время жизни куки в секундах (1 час)
                    path: '/', // Путь, на котором куки будет доступно
                });
            }
        }
    }, [router]);

    return <Component {...pageProps} />;
}

export default MyApp;
