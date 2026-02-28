import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Typography, ConfigProvider, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import AppHeader from './components/AppHeader';
import DashboardPage from './pages/DashboardPage';
import PatientQueuePage from './pages/PatientQueuePage';
import SystemLogsPage from './pages/SystemLogsPage';
import { serverStatus } from './data/mockData';
import './App.css';

const { Sider, Content } = Layout;
const { Text } = Typography;

// Route ↔ menu key mapping
const routeToKey = {
  '/': 'dashboard',
  '/patients': 'patients',
  '/logs': 'logs',
};
const keyToRoute = {
  dashboard: '/',
  patients: '/patients',
  logs: '/logs',
};

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active menu key from current route
  const activeKey = routeToKey[location.pathname] || 'dashboard';

  // Handle menu click → navigate
  const handleMenuClick = useCallback(({ key }) => {
    const route = keyToRoute[key];
    if (route) {
      navigate(route);
      // Scroll to top when changing pages
      const content = document.querySelector('.app-content');
      if (content) content.scrollTop = 0;
    }
  }, [navigate]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'patients',
      icon: <TeamOutlined />,
      label: (
        <span>
          Patient Queue
          <Badge count={2} size="small" style={{ marginLeft: 8 }} />
        </span>
      ),
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: 'System Logs',
    },
  ];

  return (
    <Layout className="app-layout">
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        className="app-sider"
        breakpoint="lg"
        collapsedWidth={80}
        width={240}
      >
        <div
          className="sider-logo"
          onClick={() => { navigate('/'); }}
          style={{ cursor: 'pointer' }}
        >
          <HeartOutlined className="sider-logo-icon" />
          {!collapsed && <span className="sider-logo-text">VascularAI</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={handleMenuClick}
          items={menuItems}
          className="sider-menu"
        />
        {!collapsed && (
          <div className="sider-footer">
            <div className="server-badge">
              <Badge status={serverStatus.online ? 'success' : 'error'} />
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                {serverStatus.online ? 'Server Online' : 'Server Offline'}
              </Text>
            </div>
          </div>
        )}
      </Sider>

      {/* Main Layout */}
      <Layout
        className="main-layout"
        style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s ease' }}
      >
        {/* Header */}
        <div className="app-header">
          <AppHeader />
        </div>

        {/* Content — scrollable area */}
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientQueuePage />} />
            <Route path="/logs" element={<SystemLogsPage />} />
          </Routes>
        </Content>

        {/* Footer */}
        <div className="app-footer">
          <div className="footer-left">
            <Text className="footer-text">
              VascularAI Dashboard {serverStatus.version}
            </Text>
            <Text className="footer-text" type="secondary">
              Model: {serverStatus.modelVersion}
            </Text>
          </div>
          <div className="footer-center">
            <Badge
              status={serverStatus.online ? 'success' : 'error'}
              text={
                <Text className="footer-text" style={{ color: serverStatus.online ? '#52c41a' : '#ff4d4f' }}>
                  {serverStatus.online ? '● Server Online' : '● Server Offline'}
                </Text>
              }
            />
          </div>
          <div className="footer-right">
            <Text className="footer-text" type="secondary">
              © 2026 VascularAI — NCU Research Lab
            </Text>
          </div>
        </div>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          colorPrimary: '#e03040',
          borderRadius: 8,
        },
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
