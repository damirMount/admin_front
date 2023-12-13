import RegistryBackups from '../../../components/RegistryFilesList';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import {
    REGISTRY_BACKUP_INDEX_URL,
    REGISTRY_BACKUP_DOWNLOAD_URL} from '../../../routes/api'
export default function IndexPage() {
    const apiUrl = `${REGISTRY_BACKUP_INDEX_URL}`;
    const downloadUrl = `${REGISTRY_BACKUP_DOWNLOAD_URL}`;

    return (
        <div>
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
