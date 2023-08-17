import {useState} from 'react';
import {useRouter} from 'next/router';
import Link from 'next/link';

const RegistryTabs = () => {
    const router = useRouter();

    return (
        <div className="registry-tabs">
            <div className="vertical-tabs">
                <div className="vertical-tabs-wrapper">
                    <div className="tab-navigation">
                        <Link
                            href="/registry/index-page"
                            className={`tab-item ${router.pathname === '/registry/index-page' ? 'active' : ''}`}
                        >
                            Реестры
                        </Link>
                        <Link
                            href="/registry/registry-file/index-page"
                            className={`tab-item ${router.pathname === '/registry/registry-file/index-page' ? 'active' : ''}`}
                        >
                            Файлы реестров
                        </Link>
                    </div>
                </div>
            </div>
            <style jsx>{`
              .vertical-tabs {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }

              .registry-tabs {
                position: absolute;
              }

              .vertical-tabs-wrapper {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                width: 100%;
                max-width: 800px; /* Измените на свою нужную ширину контента */
              }

              .tab-navigation {
                flex: 0 0 150px;
                background-color: #f0f0f0;
                padding: 10px;
              }

              .tab-item {
                text-decoration: none;
                display: block;
                cursor: pointer;
                padding: 8px 12px;
                margin-bottom: 10px;
                background-color: #e0e0e0;
                border-radius: 4px;
                color: #000000;

              }

              .tab-item:hover {
                background-color: #d0d0d0;
              }

              .tab-item.active {
                background-color: #9d9d9d;
              }

              .content {
                flex: 1;
                padding: 20px;
              }
            `}</style>
        </div>
    );
};

export default RegistryTabs;
