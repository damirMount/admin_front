import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/app/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Head from "next/head";
import { AlertProvider } from "../contexts/AlertContext";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { AuthProvider} from "../contexts/AccessContext";
import authCheck from "../components/hocs/authCheck";

function MyApp({ Component, pageProps }) {
    const AuthCheckedComponent = authCheck(Component);

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
            <SessionProvider>
                <AlertProvider>
                    <AuthProvider>
                        <AuthCheckedComponent {...pageProps} />
                    </AuthProvider>
                </AlertProvider>
            </SessionProvider>
        </div>
    );
}

export default MyApp;
