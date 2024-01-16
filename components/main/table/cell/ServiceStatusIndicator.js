import React from "react";


const ServiceStatusIndicator = (status) => {

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex flex-column">
                <span className={`status status-active ${status ? 'status-disabled' : 'status-active'}`}>
                    {`${status !== undefined ? (status ? 'OFF' : 'ON') : 'Status undefined'}`}
                </span>
        </div>
    );
};

export default ServiceStatusIndicator;
