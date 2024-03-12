import React from "react";


const FileFormats = (formats) => {


    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex">
            {formats.map((format, index) => (
                <span key={index} className="status  status-formats ms-1 me-1">{`${format}`}</span>
            ))}
        </div>
    );
};

export default FileFormats;
