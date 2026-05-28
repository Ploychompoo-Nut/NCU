import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Typography, ConfigProvider, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import AppHeader from './components/AppHeader';
import DashboardPage from './pages/DashboardPage';
import PatientQueuePage from './pages/PatientQueuePage';
import SystemLogsPage from './pages/SystemLogsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
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
          <svg className="sider-logo-icon" width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24 C10 36, 16 48, 24 54 C29 58, 35 58, 40 54 C48 48, 54 36, 52 24 C51 20, 47 18, 45 22 C43 26, 46 36, 41 44 C37 50, 27 50, 23 44 C18 36, 21 26, 19 22 C17 18, 13 20, 12 24 Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M19 22 C22 18, 24 24, 23 28 M45 22 C42 18, 40 24, 41 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M22 42 C26 38, 38 38, 42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M25 40 L26 34 M29 39 L29 33 M32 39 L32 33 M35 39 L35 33 M39 40 L38 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="21" cy="46" r="1.5" fill="currentColor" opacity="0.6" />
            <circle cx="43" cy="46" r="1.5" fill="currentColor" opacity="0.6" />
          </svg>
          {!collapsed && <span className="sider-logo-text">MandibleScan 3D</span>}
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
            <Route path="/" element={<Navigate to="/patients/demo_patient" replace />} />
            <Route path="/patients" element={<PatientQueuePage />} />
            <Route path="/patients/:id" element={<PatientDetailsPage />} />
            <Route path="/logs" element={<SystemLogsPage />} />
          </Routes>
        </Content>

        {/* Footer */}
        <div className="app-footer">
          <div className="footer-left">
            <Text className="footer-text">
              MandibleScan 3D {serverStatus.version}
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
              © 2026 MandibleScan 3D — NCU Research Lab
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
          colorPrimary: '#005088',
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
