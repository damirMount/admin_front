import RegistryBackups from '../../../components/RegistryFilesList';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";

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
                <RegistryBackups
                    apiUrl={apiUrl}
                    downloadUrl={downloadUrl}
                />
            </div>
            <Footer></Footer>
        </div>
    );
};
