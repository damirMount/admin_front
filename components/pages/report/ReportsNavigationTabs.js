import {useRouter} from 'next/router';
import Link from 'next/link';
import {REPORT_DEALERS_ACCOUNT_HISTORY_URL, REPORT_DEALERS_TSJ_URL} from "../../../routes/web";

const ReportsNavigationTabs = () => {
    const router = useRouter();

    return (
        <div className="create-button d-flex justify-content-center w-100 mb-5 mt-5">
            <div>
                <Link href={REPORT_DEALERS_ACCOUNT_HISTORY_URL}
                      className={`btn ${router.pathname === REPORT_DEALERS_ACCOUNT_HISTORY_URL ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Создание отчёта
                </Link>
                <Link href={REPORT_DEALERS_TSJ_URL}
                      className={`btn ${router.pathname === REPORT_DEALERS_TSJ_URL ? 'btn-purple' : 'btn-grey'} me-2 ms-2`}>
                    Список дилеров ТСЖ
                </Link>
            </div>
        </div>
    )
}
export default ReportsNavigationTabs;
