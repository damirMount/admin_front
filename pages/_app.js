import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { destroyCookie, parseCookies } from 'nookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from "next/head";
import { AlertProvider } from "../contexts/AlertContext";
import Alert from "../components/main/Alert";
import Script from "next/script";
import Footer from "../components/main/Footer";
import SidebarNavigation from "../components/main/SidebarNavigation";
import Navbar from "../components/main/Navbar";
import authCheck from "../middleware/authCheck";
import {LOGIN_PAGE_URL} from "../routes/web";

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [checkToken, setCheckToken] = useState(null); // Инициализация стейта

    useEffect(() => {
        const cookies = parseCookies();
        const authToken = cookies.authToken ? JSON.parse(cookies.authToken) : null;
        setCheckToken(authToken);

    }, [router]);

    return (
        <div>
            <Script
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
                crossOrigin="anonymous"
            />
            <Head>
                <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <AlertProvider>
                <div className="d-flex w-100 overflow-hidden">
                    {router.pathname !== LOGIN_PAGE_URL && <SidebarNavigation />}
                    <div className="w-100 overflow-hidden">
                        <Navbar />
                        <div className="container w-100 overflow-x-auto overflow-y-hidden mt-5" style={{ maxWidth: '100vw' }}>
                            <div className="container body-container mt-5">
                                <Component {...pageProps} />
                            </div>
                            <Footer />
                        </div>
                    </div>
                </div>
                <Alert />
            </AlertProvider>
        </div>
    );
}

export default  authCheck(MyApp);
