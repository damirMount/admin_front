import {useRouter} from 'next/router';
import Link from 'next/link';

const ReportsNavigationTabs = () => {
    const router = useRouter();

    return (
        <div className="create-button d-flex justify-content-center w-100 mb-5 mt-5">
            <div>
            <Link href="/dealer/reports/export"
                  className={`btn ${router.pathname === '/dealer/reports/export' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                Создание отчёта
            </Link>
                <Link href="/dealer/reports/tsj-dealer"
                      className={`btn ${router.pathname === '/dealer/reports/tsj-dealer' ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Список дилеров ТСЖ
                </Link>
            </div>
        </div>
    )
}
export default ReportsNavigationTabs;