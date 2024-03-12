import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClockRotateLeft} from "@fortawesome/free-solid-svg-icons";
import {faEnvelope} from "@fortawesome/free-regular-svg-icons";


const TypeSend = (props) => {

    const type = props ? props.type || '' : '';
    const emailsCount = props ? props.emails.split(', ') || '' : '';

    function formatTypeValue(value) {
        let answer;
        if (value === 1) {
            answer = 'Каждый день';
        }
        if (value === 2) {
            answer = 'Раз в неделю';
        }
        if (value === 3) {
            answer = 'Раз в месяц';
        }
        if (value === 4) {
            answer = 'Каждый год';
        }
        return answer;
    }

    function countEmails(value) {
        const lastDigit = value.length % 10;
        const lastTwoDigits = value.length % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            return `${value.length} Почт`;
        } else if (lastDigit === 1) {
            return `${value.length} Почта`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${value.length} Почты`;
        } else {
            return `${value.length} Почт`;
        }
    }

    return (
        <div className="col-auto action-table-buttons flex-nowrap d-flex flex-column">
                <span className="status text-start status-dashed d-flex flex-column">
                    <div>
                        <FontAwesomeIcon className="me-2" icon={faClockRotateLeft} size="lg"/>
                        {formatTypeValue((type))}
                    </div>
                    <div className="mt-1">
                        <FontAwesomeIcon className="me-2" icon={faEnvelope} size="lg"/>
                        {countEmails(emailsCount)}
                    </div>
                </span>
        </div>
    );
};

export default TypeSend;
