

const RecordStatusCell = (status) => {

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex">
                <span className={`status status-active ${status ? 'status-disabled' : 'status-active'}`}>
                    {`${status !== undefined ? (status ? 'OFF' : 'ON') : 'Status undefined'}`}
                </span>
        </div>
    );
};

export default RecordStatusCell;
