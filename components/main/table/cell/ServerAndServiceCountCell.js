import React from "react";


const ServerAndServiceCountCell = (props) => {

    const serverId = props ? props.server_id || '' : '';
    const services = props ? props.services_id || '' : '';

    function countServices(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} УСЛУГ`;
        } else if (lastDigit === 1) {
            return `${value.length} УСЛУГА`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} УСЛУГИ`;
        } else {
            return `${value.length} УСЛУГ`;
        }
    }

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex">
                <span className="status status-dashed">
                    ID {`${serverId}`}
                    <br/>
                    {props.send_type === 2 ? 'ПО СЕРВЕРУ' : `${countServices(services)}`}
                </span>
        </div>
    );
};

export default ServerAndServiceCountCell;
