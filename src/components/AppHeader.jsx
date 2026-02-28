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
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="15" stroke="url(#grad)" strokeWidth="2" fill="none" />
                            <path
                                d="M16 6 C10 10, 8 14, 10 18 C12 22, 16 26, 16 26 C16 26, 20 22, 22 18 C24 14, 22 10, 16 6Z"
                                fill="url(#grad)"
                                opacity="0.9"
                            />
                            <path
                                d="M13 14 Q16 10, 19 14 Q20 16, 18 18 Q16 20, 14 18 Q12 16, 13 14Z"
                                fill="white"
                                opacity="0.5"
                            />
                            <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#e03040" />
                                    <stop offset="100%" stopColor="#ff6b6b" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="logo-text">
                        <Text strong className="app-title">VascularAI</Text>
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
