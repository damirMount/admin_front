import RegistryBackups from '../../../components/RegistryFilesList';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import {
    REGISTRY_LOG_INDEX_URL,
    REGISTRY_LOG_DOWNLOAD_URL} from '../../../routes/api'
export default function IndexPage() {
    const apiUrl = `${REGISTRY_LOG_INDEX_URL}`;
    const downloadUrl = `${REGISTRY_LOG_DOWNLOAD_URL}`;

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
