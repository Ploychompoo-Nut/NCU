import React from 'react';
import { Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons';

const { Text } = Typography;

const menuItems = [
    {
        key: 'profile',
        label: 'My Profile',
        icon: <UserOutlined />,
    },
    {
        key: 'settings',
        label: 'Settings',
        icon: <SettingOutlined />,
    },
    {
        type: 'divider',
    },
    {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        danger: true,
    },
];

function AppHeader() {
    return (
        <div className="header-content">
            <div className="header-left">
                <div className="logo-container">
                    <div className="logo-icon">
                        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="32" cy="32" r="30" stroke="url(#mandGrad)" strokeWidth="2" fill="none" />
                            <path d="M32 14C26 14 21 17 19 22C17 27 15 32 15 37C15 40 17 43 20 44.5C21.5 45.2 23 45.5 24.5 45.5C26.5 45.5 28 44.5 29 42.5L30 40C30.8 38 31.3 37 32 37C32.7 37 33.2 38 34 40L35 42.5C36 44.5 37.5 45.5 39.5 45.5C41 45.5 42.5 45.2 44 44.5C47 43 49 40 49 37C49 32 47 27 45 22C43 17 38 14 32 14Z"
                                stroke="url(#mandGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="url(#mandGrad)" fillOpacity="0.12" />
                            <path d="M24 29C24 27.5 25 26 26.5 26" stroke="url(#mandGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                            <path d="M40 29C40 27.5 39 26 37.5 26" stroke="url(#mandGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                            <circle cx="26.5" cy="31" r="1.5" fill="url(#mandGrad)" opacity="0.4" />
                            <circle cx="37.5" cy="31" r="1.5" fill="url(#mandGrad)" opacity="0.4" />
                            <defs>
                                <linearGradient id="mandGrad" x1="0" y1="0" x2="64" y2="64">
                                    <stop offset="0%" stopColor="#1890ff" />
                                    <stop offset="100%" stopColor="#36cfc9" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="logo-text">
                        <Text strong className="app-title">MandibleScan 3D</Text>
                        <Text className="app-subtitle">Dashboard</Text>
                    </div>
                </div>
            </div>
            <div className="header-right">
                <Badge count={3} size="small">
                    <BellOutlined className="header-icon" />
                </Badge>
                <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
                    <Space className="user-profile" style={{ cursor: 'pointer' }}>
                        <Avatar
                            size={36}
                            icon={<UserOutlined />}
                            style={{
                                background: 'linear-gradient(135deg, #e03040 0%, #ff6b6b 100%)',
                            }}
                        />
                        <div className="user-info">
                            <Text strong className="user-name">Dr. Smith</Text>
                            <Text className="user-role">Radiologist</Text>
                        </div>
                    </Space>
                </Dropdown>
            </div>
        </div>
    );
}

export default AppHeader;
