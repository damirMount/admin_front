import RegistryFiles from '../../../components/pages/registry/RegistryFilesBackupsList';
import {REGISTRY_LOG_DOWNLOAD_API, REGISTRY_LOG_INDEX_API} from '../../../routes/api'
import Head from "next/head";
import React from "react";
import ProtectedElement from "../../../components/main/system/ProtectedElement";

export default function RegistryFilesBackupsListPage() {
    return (
        <ProtectedElement allowedPermissions={'registry_management'}>
            <div>
                <Head>
                    <title>Логи реестров | {process.env.NEXT_PUBLIC_APP_NAME}</title>
                </Head>
                <div>
                    <h1>Логи реестров</h1>
                    <RegistryFiles
                        apiUrl={REGISTRY_LOG_INDEX_API}
                        downloadUrl={REGISTRY_LOG_DOWNLOAD_API}
                    />
                </div>
            </div>
        </ProtectedElement>
    );
};
