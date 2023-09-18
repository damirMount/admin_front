import RegistryBackups from '../../../components/RegistryBackupsList';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import RegistryLogs from "../../../components/RegistryLogsList";

export default function IndexPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_REGISTRY_LOG_INDEX_URL}`;
    const downloadUrl = `${process.env.NEXT_PUBLIC_REGISTRY_LOG_DOWNLOAD_URL}`;

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>

            <div className="container body-container mt-5">
                <h1>Логи реестров</h1>
                <RegistryLogs
                    apiUrl={apiUrl}
                    downloadUrl={downloadUrl}
                />
            </div>
            <Footer></Footer>
        </div>
    );
};
