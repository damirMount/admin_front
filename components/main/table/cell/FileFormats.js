import React from "react";


const FileFormats = (formats, size) => {


    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex">
            {formats.map((format, index) => (
                <span key={index} className={`status status-${size ? size : 'large'} ms-1 me-1`}>{`${format}`}</span>
            ))}
        </div>
    );
};

export default FileFormats;
