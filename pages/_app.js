import React, {useEffect} from 'react';
import {useRouter} from 'next/router';
import {destroyCookie, parseCookies, setCookie} from 'nookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/app/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from "next/head";
import {AlertProvider} from "../contexts/AlertContext";
import Alert from "../components/main/Alert";
import Navigation from "../components/main/navbar";
import Script from "next/script";

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
            }
        }
    }, [router]);


    return <div>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
                crossOrigin="anonymous"/>
        <Head>
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        </Head>
        <AlertProvider>
            <Navigation/>
            <Component {...pageProps} />
            <Alert/>
        </AlertProvider>

    </div>;
}

export default MyApp;
