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
                            <path d="M12 24 C10 36, 16 48, 24 54 C29 58, 35 58, 40 54 C48 48, 54 36, 52 24 C51 20, 47 18, 45 22 C43 26, 46 36, 41 44 C37 50, 27 50, 23 44 C18 36, 21 26, 19 22 C17 18, 13 20, 12 24 Z" stroke="url(#mandGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="url(#mandGrad)" fillOpacity="0.12" />
                            <path d="M19 22 C22 18, 24 24, 23 28 M45 22 C42 18, 40 24, 41 28" stroke="url(#mandGrad)" strokeWidth="2" strokeLinecap="round" />
                            <path d="M22 42 C26 38, 38 38, 42 42" stroke="url(#mandGrad)" strokeWidth="2" strokeLinecap="round" />
                            <path d="M25 40 L26 34 M29 39 L29 33 M32 39 L32 33 M35 39 L35 33 M39 40 L38 34" stroke="url(#mandGrad)" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="21" cy="46" r="1.5" fill="url(#mandGrad)" opacity="0.6" />
                            <circle cx="43" cy="46" r="1.5" fill="url(#mandGrad)" opacity="0.6" />
                            <defs>
                                <linearGradient id="mandGrad" x1="0" y1="0" x2="64" y2="64">
                                    <stop offset="0%" stopColor="#005088" />
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
                                background: 'linear-gradient(135deg, #005088 0%, #36cfc9 100%)',
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
