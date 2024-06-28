import React from "react";


const StatusIndicator = (status) => {

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex flex-column">
                <span className={`status ${status ? 'status-disabled' : 'status-small'}`}>
                    {`${status !== undefined ? (status ? 'OFF' : 'ON') : 'Status undefined'}`}
                </span>
        </div>
    );
};

export default StatusIndicator;
