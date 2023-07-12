import {useState} from 'react';
import {useRouter} from 'next/router';
import SelectWithSearch from '../components/SelectWithSearch';
import FormInput from '../components/FormInput';
import Navigation from '../components/Navigation';
import {parseCookies} from "nookies";

export default function DashboardPage() {
    const router = useRouter();

    return (
        <div>
            <Navigation></Navigation>
            <h1>Страница Dashboard</h1>
            <style jsx='true'>{`
              h1 {
                text-align: center;
                margin-top: 2rem;
                font-family: sans-serif;
                font-size: 1.5rem;
              }
            `}</style>
        </div>
    );
}

