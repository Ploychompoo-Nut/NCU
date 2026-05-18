import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
            {/* Mandible / Lower Jaw SVG */}
            <path d="M32 8C24 8 18 12 15 18C12 24 10 30 10 36C10 40 12 44 16 46C18 47 20 48 22 48C24 48 26 47 27 45L28 42C29 39 30 38 32 38C34 38 35 39 36 42L37 45C38 47 40 48 42 48C44 48 46 47 48 46C52 44 54 40 54 36C54 30 52 24 49 18C46 12 40 8 32 8Z"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M20 28C20 26 21 24 23 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <path d="M44 28C44 26 43 24 41 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <circle cx="23" cy="30" r="2" fill="currentColor" opacity="0.5" />
            <circle cx="41" cy="30" r="2" fill="currentColor" opacity="0.5" />
            <path d="M26 36H38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
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
            <Route path="/" element={<DashboardPage />} />
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
