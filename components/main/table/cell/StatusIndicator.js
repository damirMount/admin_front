import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const StatusIndicator = ({text, color, icon}) => {
    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex flex-column">
            <div
                className={
                    `d-flex align-items-center  justify-content-center status ${color ? `status-${color}` : 'status-default'}`
                }>
                {icon && (
                    <FontAwesomeIcon size={'xl'} className='me-2' icon={icon}/>
                )}
                <span>
                    {text !== undefined ? text : 'Status undefined'}
                </span>
            </div>
        </div>
    );
};

export default StatusIndicator;
