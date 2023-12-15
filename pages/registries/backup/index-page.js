import RegistryBackups from '../../../components/registry/RegistryFilesList';
import Navigation from "../../../components/main/Navigation";
import Footer from "../../../components/main/Footer";
import {
    REGISTRY_BACKUP_INDEX_URL,
    REGISTRY_BACKUP_DOWNLOAD_URL} from '../../../routes/api'
import Head from "next/head";
import React from "react";
export default function IndexPage() {
    const apiUrl = `${REGISTRY_BACKUP_INDEX_URL}`;
    const downloadUrl = `${REGISTRY_BACKUP_DOWNLOAD_URL}`;

    return (
        <div>
            <Head>
                <title>Резервные копии  реестров| {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container body-container mt-5">
                <h1>Резервные копии</h1>
                <RegistryBackups
                    apiUrl={apiUrl}
                    downloadUrl={downloadUrl}
                />
            </div>
            <Footer></Footer>
        </div>
    );
};
