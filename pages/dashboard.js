import {useRouter} from 'next/router';
import Navigation from '../components/main/Navigation';
import Footer from "../components/main/Footer";

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div>
            <Navigation></Navigation>
            <div className="container body-container">
            <h1 className="mt-5">Страница Dashboard</h1>
            </div>
            <Footer></Footer>
        </div>
    );
}

