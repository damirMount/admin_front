import React from 'react';
import {useRouter} from "next/router";
import Link from "next/link";

const Navigation = () => {
    const router = useRouter();

    return (
        <div>
        <nav>
            <ul className="nav-list">
                <li>
                    <Link href="/dashboard" className={router.pathname === '/dashboard' ? 'active' : ''}>
                        Главная
                    </Link>
                </li>
                <li>
                    <Link href="/update-db" className={router.pathname === '/update-db' ? 'active' : ''}>
                        Обновить БД
                    </Link>
                </li>
                <li>
                    <Link href="/registry/index-page" className={router.pathname === '/create-registry' ? 'active' : ''}>
                        Реестры
                    </Link>
                </li>
            </ul>
        </nav>
            <style jsx='true'>{`
              .nav-list {
                list-style: none;
                padding: 0;
                margin-top: 30px;
                display: flex;
                justify-content: center;
                background-color: #f2f2f2;
              }

              .nav-list li {
                margin-right: 1rem;
              }

              .nav-list li:last-child {
                margin-right: 0;
              }

              .nav-list li a {
                text-decoration: none;
                color: #333;
                padding: 0.5rem;
                border-radius: 4px;
              }

              .nav-list li a.active {
                background-color: #ccc;
              }

              h1 {
                text-align: center;
                margin-top: 2rem;
                font-family: sans-serif;
                font-size: 1.5rem;
              }
            `}</style>
        </div>
    );
}

export default Navigation;