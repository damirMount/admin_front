import React from "react";


const ServerCell = (props) => {

    const serverId = props ? props.server_id || '' : '';
    const services = props ? props.services_id || '' : '';

    function countServices(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} СЕРВИСОВ`;
        } else if (lastDigit === 1) {
            return `${value.length} СЕРВИС`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} СЕРВИСА`;
        } else {
            return `${value.length} СЕРВИСОВ`;
        }
    }

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex">
                <span className="status status-dashed">
                    ID {`${serverId}`}
                    <br/>
                    {`${countServices(services)}`}
                </span>
        </div>
    );
};

export default ServerCell;
