import {useRouter} from 'next/router';
import Link from 'next/link';
import {
    RECIPIENT_INDEX_URL,
    REGISTRY_BACKUP_URL,
    REGISTRY_INDEX_URL,
    REGISTRY_LOGS_URL,
    REGISTRY_RESEND_URL
} from "../../../routes/web";

const RegistryNavigationTabs = () => {
    const router = useRouter();

    return (
        <div className="create-button d-flex justify-content-between w-100 mb-3 mt-3">
            <div>
                <Link href={RECIPIENT_INDEX_URL}
                      className={`btn ${router.pathname === RECIPIENT_INDEX_URL ? 'btn-purple' : 'btn-grey'} me-2 `}>
                    Получатели
                </Link>
                <Link href={REGISTRY_INDEX_URL}
                      className={`btn ${router.pathname === REGISTRY_INDEX_URL ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Реестры
                </Link>
            </div>
            <div>
                <Link href={REGISTRY_RESEND_URL}
                      className={`btn ${router.pathname === REGISTRY_RESEND_URL ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Перезапуск реестра
                </Link>
            </div>
            <div>
                <Link href={REGISTRY_BACKUP_URL}
                      className={`btn ${router.pathname === REGISTRY_BACKUP_URL ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Резервные копии
                </Link>
                <Link href={REGISTRY_LOGS_URL}
                      className={`btn ${router.pathname === REGISTRY_LOGS_URL ? 'btn-purple' : 'btn-grey'} ms-2`}>
                    Логи
                </Link>
            </div>
        </div>
    )
}
export default RegistryNavigationTabs;
