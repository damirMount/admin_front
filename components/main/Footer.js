import React from 'react';

const Footer = () => {
    return (
        <footer className='position-relative'>
            <div className="footer-container container">
                <span>{process.env.NEXT_PUBLIC_APP_NAME} - Alpha v1.3.5</span>
            </div>
        </footer>
    );
};

export default Footer;
