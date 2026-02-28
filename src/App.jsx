import React, { useState } from 'react';
import { Layout, Menu, Badge, Typography, ConfigProvider, theme } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import AppHeader from './components/AppHeader';
import VascularViewer from './components/VascularViewer';
import MetricsReport from './components/MetricsReport';
import SystemStatus from './components/SystemStatus';
import { serverStatus } from './data/mockData';
import './App.css';

const { Sider, Content, Footer } = Layout;
const { Text } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('Patient_001');
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

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
          <div className="sider-logo">
            <HeartOutlined className="sider-logo-icon" />
            {!collapsed && <span className="sider-logo-text">VascularAI</span>}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
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
        <Layout className="main-layout" style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s ease' }}>
          {/* Header */}
          <div className="app-header">
            <AppHeader />
          </div>

          {/* Content */}
          <Content className="app-content">
            <div className="content-wrapper">
              {/* Top Section: 3D Viewer + Metrics */}
              <div className="top-section">
                <div className="viewer-section">
                  <VascularViewer />
                </div>
                <div className="metrics-section">
                  <MetricsReport
                    selectedPatient={selectedPatient}
                    onPatientChange={setSelectedPatient}
                  />
                </div>
              </div>

              {/* Bottom Section: System Status & Logs */}
              <div className="bottom-section">
                <SystemStatus />
              </div>
            </div>
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
    </ConfigProvider>
  );
}

export default App;
