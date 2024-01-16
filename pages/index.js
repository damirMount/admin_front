import {useRouter} from 'next/router';

import Footer from "../components/main/Footer";

export default function Home() {
    const router = useRouter();

    return (
        <div>

            <div className="container body-container">
                <h1 className="mt-5">Страница Dashboard</h1>
            </div>
            <Footer></Footer>
        </div>
    );
}
