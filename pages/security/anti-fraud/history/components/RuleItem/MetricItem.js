import React from 'react';
import {Col, Typography} from 'antd';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const {Text} = Typography;

export const MetricItem = ({label, val, subVal, color, icon, bg, isOverLimit}) => {
    {
        return (
            <Col span={12}>
                <div
                    className={`af-new-metric-card ${isOverLimit ? 'is-limit' : ''}`}
                    style={{background: bg || '#ffffff'}}
                >
                    <div className="af-metric-icon-wrapper" style={{background: `${color}15`, color: color}}>
                        <FontAwesomeIcon icon={icon}/>
                    </div>
                    <div>
                        <Text className="af-metric-label-new">{label}</Text>
                        <div>
                            <Text strong style={{color: color}}>
                                {val}
                            </Text>
                            {subVal && (
                                <Text type='secondary' className='fw-semibold'> / {subVal}</Text>
                            )}
                        </div>
                    </div>
                </div>
            </Col>
        );
    }
};
