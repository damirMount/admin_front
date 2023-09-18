import {useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../components/SelectWithSearch';
import FormInput from '../components/FormInput';
import Navigation from '../components/Navigation';
import {parseCookies} from "nookies";
import Footer from "../components/Footer";

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

