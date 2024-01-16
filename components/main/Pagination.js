import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleLeft, faAngleRight} from "@fortawesome/free-solid-svg-icons";

const Pagination = ({page, totalPages, onPageChange}) => {
    const maxButtons = 5;
    let lastButton = 0;

    const handlePageChange = async (newPage) => {
        onPageChange(newPage);
    };

    const generatePaginationButtons = () => {
        const buttons = [];
        const half = Math.floor(maxButtons / 2);

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - half && i <= page + half)) {
                buttons.push(i);
            }
        }
        const paginationButtons = [];

        buttons.forEach((button) => {
            if (button - lastButton === 2) {
                paginationButtons.push('...');
            } else if (button - lastButton !== 1) {
                paginationButtons.push('...');
            }
            paginationButtons.push(button);
            lastButton = button;
        });

        return paginationButtons;
    };

    const paginationButtons = generatePaginationButtons();

    if (totalPages <= 1) {
        // Если всего одна страница или вообще нет страниц, не отображаем пагинацию
        return null;
    }

    return (
        <div className="d-flex justify-content-center mt-5">
            {page > 1 && (
                <button onClick={async () => await handlePageChange(page - 1)} className="btn btn-grey me-3">
                    <FontAwesomeIcon icon={faAngleLeft}/> Назад
                </button>
            )}
            {paginationButtons.map((button, index) => (
                <React.Fragment key={index}>
                    {button === '...' ? (
                        <span className="mx-1 align-self-end">...</span>
                    ) : (
                        <button
                            onClick={async () => await handlePageChange(button)}
                            className={`ms-1 me-1 btn ${button === page ? 'btn-purple' : 'btn-grey'}`}
                        >
                            {button}
                        </button>
                    )}
                </React.Fragment>
            ))}
            {page < totalPages && (
                <button onClick={async () => await handlePageChange(page + 1)} className="btn btn-grey ms-3">
                    Вперёд <FontAwesomeIcon icon={faAngleRight}/>
                </button>
            )}
        </div>
    );
};

export default Pagination;
