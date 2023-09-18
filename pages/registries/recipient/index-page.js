import TableWithPagination from '../../components/TableWithPagination';
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";

export default function IndexPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_RECIPIENT_INDEX_URL}`;
    const tableHeaders = ['ID','Name', 'Тип', 'Статус'];
    const tableValues = ['id', 'name', 'type', 'is_blocked'];
    const createRoute = `/registry/recipient/create-recipient`;
    const editRoute = `/registry/recipient/edit-recipient`;
    const deleteRoute = `${process.env.NEXT_PUBLIC_RECIPIENT_DELETE_URL}`;

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
