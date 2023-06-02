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
            router.push('/create');
            console.log(cookies.authToken)
            const authToken = JSON.parse(cookies.authToken);
            const {value, expiration} = authToken;
            // Обновление куки с продлением на 1 час
            setCookie(null, 'authToken', JSON.stringify({value, expiration}), {
                maxAge: 3600, // Время жизни куки в секундах (1 час)
                path: '/', // Путь, на котором куки будет доступно
            });
        }
    }, [router]);

    return <Component {...pageProps} />;
}

export default MyApp;
