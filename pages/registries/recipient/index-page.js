import TableWithPagination from '../../../components/TableWithPagination';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";
import {
    RECIPIENT_INDEX_URL,
    RECIPIENT_DELETE_URL } from '../../../routes/api'

export default function IndexPage() {
    const apiUrl = `${RECIPIENT_INDEX_URL}`;
    const tableHeaders = ['ID','Name', 'Тип', 'Статус', 'Обновлено', 'Создано'];
    const tableValues = ['id', 'name', 'type', 'is_blocked', 'updatedAt', 'createdAt'];
    const createRoute = `/registries/recipient/create-recipient`;
    const editRoute = `/registries/recipient/edit-recipient`;
    const deleteRoute = `${RECIPIENT_DELETE_URL}`;

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container body-container mt-5">
                <h1>Список получателей</h1>
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
