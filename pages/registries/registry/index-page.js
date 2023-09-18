import TableWithPagination from '../../../components/TableWithPagination';
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";

export default function IndexPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_REGISTRY_FILE_INDEX_URL}`;
    const tableHeaders = ['ID','Название','Формат','Сервер', 'Сервисы','Статус'];
    const tableValues = ['id', 'name','formats','server_id','services_id','is_blocked'];
    const createRoute = `/registry/registry/create-registry`;
    const editRoute = `/registry/registry/edit-registry`;
    const deleteRoute = `${process.env.NEXT_PUBLIC_REGISTRY_FILE_DELETE_URL}`;

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div className="container body-container mt-5">
                <h1>Список файлов реестров</h1>
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
