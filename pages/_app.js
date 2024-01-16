import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import {destroyCookie, parseCookies, setCookie} from 'nookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/app/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from "next/head";
import {AlertProvider} from "../contexts/AlertContext";
import Alert from "../components/main/Alert";
import Navigation from "../components/main/Navigation";
import {NextUIProvider} from "@nextui-org/react";

function MyApp({Component, pageProps}) {
    const router = useRouter();


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
            } else if (router.pathname === '/') {
                // Если срок действия токена не истек и пользователь на главной, перенаправляем на /dashboard
                router.push('/update-db');
            } else if (
                // Обновляем куку с продлением на 12 часов для защищенных страниц
                // router.pathname === '/dashboard' ||
                router.pathname === '/update-db' ||
                router.pathname === '/recipient/index' ||
                router.pathname === '/recipient/create-recipient' ||
                router.pathname === '/registry/index' ||
                router.pathname === '/registry/create-registry' ||
                router.pathname === '/registry-resend/index' ||
                router.pathname === '/log/index' ||
                router.pathname === '/backup/index' ||
                router.pathname === '/acquiring/index' ||
                router.pathname === '/dealer/reports/export'
            ) {
                setCookie(null, 'authToken', JSON.stringify({value, expiration}), {
                    maxAge: 43200, // Время жизни куки в секундах (12 часов)
                    path: '/', // Путь, на котором куки будет доступно
                });
            }
        }
    }, [router]);

    return <div>
        <Head>
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
                    crossOrigin="anonymous"></script>
        </Head>
        <NextUIProvider>
            <AlertProvider>
                <Navigation/>
                <Component {...pageProps} />
                <Alert/>
            </AlertProvider>
        </NextUIProvider>

    </div>;
}

export default MyApp;
