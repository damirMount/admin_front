import TableWithPagination from '../../../components/main/TableWithPagination';
import Navigation from "../../../components/main/Navigation";
import Footer from "../../../components/main/Footer";
import {REGISTRY_DELETE_URL, REGISTRY_INDEX_URL} from "../../../routes/api";
import Head from "next/head";

export default function IndexPage() {
    const apiUrl = `${REGISTRY_INDEX_URL}`;
    const tableHeaders = ['ID','Название','Формат','Сервер', 'Сервисы','Статус', 'Обновлено'];
    const tableValues = ['id', 'name','formats','server_id','services_id','is_blocked','updatedAt'];
    const createRoute = `/registries/registry/create-registry`;
    const editRoute = `/registries/registry/edit-registry`;
    const deleteRoute = `${REGISTRY_DELETE_URL}`;

    return (
        <div>
            <Head>
                <title>Список реестров | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container body-container mt-5">
                <h1>Список реестров</h1>
                <TableWithPagination
                    apiUrl={apiUrl}
                    tableHeaders={tableHeaders}
                    tableValues={tableValues}
                    createRoute={createRoute}
                    editRoute={editRoute}
                    deleteRoute={deleteRoute}
                />
            </div>
            <Footer></Footer>
        </div>

);
};
