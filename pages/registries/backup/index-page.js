import RegistryBackups from '../../../components/RegistryBackupsList';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";

export default function IndexPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_REGISTRY_BACKUP_INDEX_URL}`;
    const downloadUrl = `${process.env.NEXT_PUBLIC_REGISTRY_BACKUP_DOWNLOAD_URL}`;

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
