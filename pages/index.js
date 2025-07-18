import Head from "next/head";
import PaymentsChart from "../components/main/charts/PaymentsChart";

export default function Home() {
    return (
        <div>
            <Head>
                <title>Главная страница | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <PaymentsChart/>
        </div>
    );
}
