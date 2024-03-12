import RegistryFiles from '../../../components/pages/registry/RegistryFilesBackupsList';
import {REGISTRY_LOG_DOWNLOAD_API, REGISTRY_LOG_INDEX_API} from '../../../routes/api'
import Head from "next/head";
import React from "react";

export default function RegistryFilesBackupsListPage() {
    return (
        <div>
            <Head>
                <title>Логи реестров | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>

            </div>

            <div className=" mt-5">
                <h1>Логи реестров</h1>
                <RegistryFiles
                    apiUrl={REGISTRY_LOG_INDEX_API}
                    downloadUrl={REGISTRY_LOG_DOWNLOAD_API}
                />
            </div>
           
        </div>
    );
};