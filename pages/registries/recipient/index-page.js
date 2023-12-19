import RegistryListTable from '../../../components/registry/RegistryListTable';
import Navigation from "../../../components/main/Navigation";
import Footer from "../../../components/main/Footer";
import {
    RECIPIENT_INDEX_URL,
    RECIPIENT_DELETE_URL } from '../../../routes/api'
import Head from "next/head";

export default function IndexPage() {
    const apiUrl = `${RECIPIENT_INDEX_URL}`;
    const tableHeaders = ['ID','Name', 'Тип', 'Статус', 'Обновлено', 'Создано'];
    const tableValues = ['id', 'name', 'type', 'is_blocked', 'updatedAt', 'createdAt'];
    const createRoute = `/registries/recipient/create-recipient`;
    const editRoute = `/registries/recipient/edit-recipient`;
    const deleteRoute = `${RECIPIENT_DELETE_URL}`;

    return (
        <div>

            <Head>
                <title>Список получателей | {process.env.NEXT_PUBLIC_APP_NAME}</title>
            </Head>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container body-container mt-5">
                <h1>Список получателей</h1>
                <RegistryListTable
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
