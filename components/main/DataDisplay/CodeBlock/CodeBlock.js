import React, { useState } from "react";
import { Divider, message, Space, Tooltip, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCode, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import './CodeBlock.css';

const { Text } = Typography;

const CodeBlock = ({ code, space = 4, title = "Блок кода" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        // Копируем чистые данные без лишних оберток
        const textToCopy = typeof code === 'object' ? JSON.stringify(code, null, space) : code;

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            message.success({
                content: 'Скопировано в буфер обмена',
                style: { marginTop: '10vh' }
            });
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    };

    if (!code) {
        return null;
    }

    return (
        <div className="code-block mt-3">
            <div
                className="code-block__header"
                onClick={() => {
                    setIsVisible(!isVisible);
                }}
            >
                <Space size={12}>
                    <div className={`code-block__icon-box ${isVisible ? 'code-block__icon-box--active' : ''}`}>
                        <FontAwesomeIcon
                            icon={faCode}
                            style={{ color: isVisible ? '#0284c7' : '#64748b', fontSize: '14px' }}
                        />
                    </div>
                    <Text strong style={{ color: '#334155' }}>
                        {title}
                    </Text>
                </Space>

                <Space size={0}>
                    <Tooltip title={copied ? "Готово" : "Копировать всё"}>
                        <div
                            className="code-block__copy-btn"
                            onClick={handleCopy}
                        >
                            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                        </div>
                    </Tooltip>

                    <Divider type="vertical" className="code-block__divider" />

                    <div className="px-2" style={{ minWidth: '80px', textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: '12px', marginRight: '8px' }}>
                            {isVisible ? 'Скрыть' : 'Показать'}
                        </Text>
                        <FontAwesomeIcon
                            icon={isVisible ? faChevronUp : faChevronDown}
                            style={{ fontSize: '10px', color: '#94a3b8' }}
                        />
                    </div>
                </Space>
            </div>

            {isVisible && (
                <div className="animate__animated animate__fadeIn">
                    <pre className="code-block__content">
                        {typeof code === 'object' ? JSON.stringify(code, null, space) : code}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default CodeBlock;
