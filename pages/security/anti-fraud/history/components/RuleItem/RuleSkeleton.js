import React from 'react';
import {Card, Space} from 'antd';

const RuleSkeleton = () => {
    return (
        <Card
            size="small"
            className="af-rule-card shadow-sm"
            style={{borderLeft: '4px solid #f0f0f0', marginBottom: '12px'}}
        >
            <div className="d-flex justify-content-between align-items-center">
                <Space size={14}>
                    <div
                        className="af-skeleton-pulse"
                        style={{width: '42px', height: '42px', borderRadius: '10px'}}
                    />
                    <div>
                        <div
                            className="af-skeleton-pulse mb-2"
                            style={{width: '220px', height: '18px', borderRadius: '4px'}}
                        />
                        <Space size={8}>
                            <div
                                className="af-skeleton-pulse"
                                style={{width: '70px', height: '14px', borderRadius: '4px'}}
                            />
                            <div
                                className="af-skeleton-pulse"
                                style={{width: '90px', height: '14px', borderRadius: '4px'}}
                            />
                        </Space>
                    </div>
                </Space>
                <div className="text-end">
                    <div
                        className="af-skeleton-pulse mb-2"
                        style={{width: '50px', height: '12px', marginLeft: 'auto', borderRadius: '4px'}}
                    />
                    <div
                        className="af-skeleton-pulse"
                        style={{width: '85px', height: '26px', borderRadius: '6px'}}
                    />
                </div>
            </div>

            <div
                className="af-skeleton-pulse mt-3"
                style={{width: '100%', height: '1px', opacity: 0.3}}
            />
        </Card>
    );
};
export default RuleSkeleton;
