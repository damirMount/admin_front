import TableWithPagination from '../../components/TableWithPagination';
import Navigation from "../../components/Navigation";
import RegistryTabs from "../../components/RegistryTabs";

export default function IndexPage() {
    const apiUrl = `${process.env.NEXT_PUBLIC_REGISTRY_INDEX_URL}`;
    const tableHeaders = ['ID','Name', 'Тип', 'Статус'];
    const tableValues = ['id', 'name', 'type', 'is_blocked'];
    const createRoute = `/registry/create-registry`;
    const editRoute = `/registry/edit-registry`;
    const deleteRoute = `${process.env.NEXT_PUBLIC_REGISTRY_DELETE_URL}`;

    return (
        <div>
            <div>
                <Navigation></Navigation>
            </div>
            <div>
                <RegistryTabs></RegistryTabs>
            </div>
            <div className="container">
                <h1>Список реестров</h1>
                <TableWithPagination
                    apiUrl={apiUrl}
                    tableHeaders={tableHeaders}
                    tableValues={tableValues}
                    createRoute={createRoute}
                    editRoute={editRoute}
                    deleteRoute={deleteRoute}
                />
                <style jsx>{`
                  .container {
                    max-width: 500px;
                    margin: 10px auto 0;
                    padding: 2rem;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                  }

                  .registry-tabs {
                    position: absolute;
                  }

                  h1 {
                    text-align: center;
                    margin-bottom: 2rem;
                    font-family: sans-serif;
                    font-size: 1.5rem;
                  }

                  .form-group {
                    margin-bottom: 2rem;
                  }

                  label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                    font-family: sans-serif;
                  }

                  button[type='submit'] {
                    background-color: grey;
                    color: #fff;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                  }

                  button[type='submit']:hover {
                    background-color: #0069d9;
                  }
                `}</style>
            </div>
        </div>
    );
};
