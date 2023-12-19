import React from 'react';

const Footer = () => {
    return (
<footer>
    <div className="footer-container container">
        <span>{process.env.NEXT_PUBLIC_APP_NAME} - Alpha v0.8.4</span>
    </div>
</footer>
    );
};

export default Footer;