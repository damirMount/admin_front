import React from "react";


const StatusIndicator = (props) => {


    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Б';
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
    };
    return (
        <span className="status status-active">{formatFileSize(props)}</span>
    );
};

export default StatusIndicator;
