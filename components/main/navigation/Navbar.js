import React from 'react';
import Image from 'next/image'
import {MAIN_PAGE_URL} from "../../../routes/web";

const Navbar = () => {

    return (<nav className="navbar navbar-expand shadow-sm">
        <div className="container-fluid">
            <div className="collapse navbar-collapse " id="navbarSupportedContent">
                <ul className="navbar-nav me-auto align-items-center justify-content-center  w-100 d-flex">
                    <li className="nav-item">
                        <a className="navbar-brand d-flex align-items-center" href={MAIN_PAGE_URL}>
                            <Image src="/favicon.ico" width='32' height='32' className="me-2" alt='Логотип'/>
                            Mancho Admin
                        </a>
                    </li>
                    {/*<li className="nav-item">*/}
                    {/*    <SearchInput onSearchSubmit={handleSearchSubmit}/>*/}
                    {/*</li>*/}
                </ul>
            </div>
        </div>
    </nav>);
}

export default Navbar;
