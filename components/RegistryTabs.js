import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

const RegistryTabs = () => {
    const router = useRouter();

    return (
        <div className="create-button d-flex justify-content-between w-100 mb-3 mt-3">
            <div>
            <Link href="/registries/recipient/index-page"
                  className={`btn ${router.pathname === '/registries/recipient/index-page' ? 'btn-purple' : 'btn-grey'} me-2 `}>
                Получатели
            </Link>
            <Link href="/registries/registry/index-page"
                  className={`btn ${router.pathname === '/registries/registry/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                Реестры
            </Link>
            </div>
            <div>
            <Link href="/registries/registry-resend/index-page"
                  className={`btn ${router.pathname === '/registries/registry-resend/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                Перезапуск реестра
            </Link>
            </div>
            <div>
            <Link href="/registries/backup/index-page"
                  className={`btn ${router.pathname === '/registries/backup/index-page' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                Резервные копии
            </Link>
            <Link href="/registries/log/index-page"
                  className={`btn ${router.pathname === '/registries/log/index-page' ? 'btn-purple' : 'btn-grey'} ms-2`}>
                Логи
            </Link>
            </div>
        </div>
    )
}
export default RegistryTabs;