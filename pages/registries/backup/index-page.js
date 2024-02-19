import RegistryFiles from "../../../components/pages/registry/RegistryFilesBackupsList";
import Footer from "../../../components/main/Footer";
import {REGISTRY_BACKUP_DOWNLOAD_API, REGISTRY_BACKUP_INDEX_API} from '../../../routes/api'
import Head from "next/head";
import React from "react";

export default function IndexPage() {
    const apiUrl = `${REGISTRY_BACKUP_INDEX_API}`;
    const downloadUrl = `${REGISTRY_BACKUP_DOWNLOAD_API}`;

    return (
        <div>
            <Head>
                <title>Резервные копии реестров | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>

            </div>
            <div className=" mt-5">
                <h1>Резервные копии</h1>
                <RegistryFiles
                    apiUrl={apiUrl}
                    downloadUrl={downloadUrl}
                />
            </div>
           
        </div>
    );
};
