import React, { useState, useMemo } from 'react';
import {
    Card, Tag, Typography, Badge, Button, Input, Select, Tooltip, Space, Switch,
} from 'antd';
import {
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    CloudServerOutlined,
    ApiOutlined,
    ThunderboltOutlined,
    RocketOutlined,
    DownloadOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { systemLogs, serverStatus } from '../data/mockData';

const { Text, Title } = Typography;
const { Option } = Select;

// ─── Log level config ──────────────────────────────────────────────────────
const logConfig = {
    INFO: {
        color: '#52c41a',
        bg: 'rgba(82, 196, 26, 0.08)',
        border: 'rgba(82, 196, 26, 0.2)',
        icon: <CheckCircleOutlined />,
        dotColor: '#52c41a',
    },
    WARNING: {
        color: '#fa8c16',
        bg: 'rgba(250, 140, 22, 0.08)',
        border: 'rgba(250, 140, 22, 0.2)',
        icon: <ExclamationCircleOutlined />,
        dotColor: '#fa8c16',
    },
    ERROR: {
        color: '#ff4d4f',
        bg: 'rgba(255, 77, 79, 0.1)',
        border: 'rgba(255, 77, 79, 0.25)',
        icon: <CloseCircleOutlined />,
        dotColor: '#ff4d4f',
    },
};

// ─── Server info cards ─────────────────────────────────────────────────────
const serverCards = [
    {
        key: 'status',
        label: 'Server Status',
        icon: <CloudServerOutlined />,
        getValue: () => serverStatus.online ? 'Online' : 'Offline',
        isPulse: true,
    },
    {
        key: 'version',
        label: 'Version',
        icon: <ApiOutlined />,
        getValue: () => serverStatus.version,
    },
    {
        key: 'gpu',
        label: 'GPU',
        icon: <ThunderboltOutlined />,
        getValue: () => serverStatus.gpu,
    },
    {
        key: 'model',
        label: 'Model',
        icon: <RocketOutlined />,
        getValue: () => serverStatus.modelVersion,
    },
];


function SystemLogsPage() {
    const [levelFilter, setLevelFilter] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return systemLogs.filter(log => {
            const matchLevel = levelFilter === 'all' || log.level === levelFilter;
            const matchSearch = searchText === ''
                || log.message.toLowerCase().includes(searchText.toLowerCase());
            return matchLevel && matchSearch;
        });
    }, [levelFilter, searchText]);

    // Stats
    const logStats = useMemo(() => ({
        total: systemLogs.length,
        info: systemLogs.filter(l => l.level === 'INFO').length,
        warning: systemLogs.filter(l => l.level === 'WARNING').length,
        error: systemLogs.filter(l => l.level === 'ERROR').length,
    }), []);

    const handleExport = () => {
        const csv = ['Time,Level,Message', ...systemLogs.map(l => `${l.time},${l.level},"${l.message}"`)].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'system_logs.csv';
        link.click();
        URL.revokeObjectURL(link.href);
    };

    return (
        <div className="content-wrapper sl-page">
            {/* Page Header */}
            <div className="sl-page-header">
                <div>
                    <Title level={4} className="sl-page-title">🗒️ System Logs</Title>
                    <Text type="secondary">Real-time system activity and event monitoring</Text>
                </div>
            </div>

            {/* Server Status — Glassmorphism Cards */}
            <div className="sl-server-grid">
                {serverCards.map((card) => (
                    <div key={card.key} className="sl-glass-card">
                        <div className="sl-glass-icon">
                            {card.icon}
                        </div>
                        <div className="sl-glass-body">
                            <Text type="secondary" className="sl-glass-label">{card.label}</Text>
                            <div className="sl-glass-value">
                                {card.isPulse && serverStatus.online && (
                                    <span className="sl-pulse-dot" />
                                )}
                                <Text strong>{card.getValue()}</Text>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Log Stats Mini Bar */}
            <div className="sl-log-stats">
                <Tag color="green" className="sl-log-stat-tag">{logStats.info} INFO</Tag>
                <Tag color="orange" className="sl-log-stat-tag">{logStats.warning} WARNING</Tag>
                <Tag color="red" className="sl-log-stat-tag">{logStats.error} ERROR</Tag>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>Total: {logStats.total} entries</Text>
            </div>

            {/* Activity Log Card */}
            <Card
                className={`sl-log-card ${darkMode ? 'sl-dark' : ''}`}
                title={
                    <div className="sl-log-card-header">
                        <span className="sl-log-card-title">📜 Activity Log</span>
                        <div className="sl-log-card-controls">
                            <Tooltip title="Toggle terminal theme">
                                <div className="sl-theme-toggle">
                                    <BulbOutlined style={{ fontSize: 13, color: darkMode ? '#fadb14' : '#8c8c8c' }} />
                                    <Switch
                                        size="small"
                                        checked={darkMode}
                                        onChange={setDarkMode}
                                    />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                }
                extra={
                    <Space size={6}>
                        <Tooltip title="Export as CSV">
                            <Button
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                className="sl-header-btn"
                            >
                                Export
                            </Button>
                        </Tooltip>
                        <Tooltip title="Clear logs">
                            <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                danger
                                className="sl-header-btn"
                            />
                        </Tooltip>
                    </Space>
                }
            >
                {/* Filters */}
                <div className={`sl-filters ${darkMode ? 'sl-filters-dark' : ''}`}>
                    <Input
                        placeholder="Search logs..."
                        prefix={<SearchOutlined style={{ color: darkMode ? '#555' : '#bfbfbf' }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="sl-search"
                        allowClear
                        size="small"
                    />
                    <Select
                        value={levelFilter}
                        onChange={setLevelFilter}
                        className="sl-filter-select"
                        suffixIcon={<FilterOutlined />}
                        size="small"
                    >
                        <Option value="all">All Levels</Option>
                        <Option value="INFO">INFO</Option>
                        <Option value="WARNING">WARNING</Option>
                        <Option value="ERROR">ERROR</Option>
                    </Select>
                </div>

                {/* Timeline Log Entries */}
                <div className={`sl-timeline ${darkMode ? 'sl-timeline-dark' : ''}`}>
                    {filteredLogs.map((log, idx) => {
                        const cfg = logConfig[log.level] || logConfig.INFO;
                        return (
                            <div
                                key={idx}
                                className={`sl-timeline-entry ${log.level === 'ERROR' ? 'sl-entry-error' : ''}`}
                            >
                                {/* Timeline connector */}
                                <div className="sl-timeline-rail">
                                    <div className="sl-timeline-dot" style={{ background: cfg.dotColor, boxShadow: `0 0 8px ${cfg.dotColor}60` }} />
                                    {idx < filteredLogs.length - 1 && <div className="sl-timeline-line" />}
                                </div>

                                {/* Content */}
                                <div className="sl-timeline-content">
                                    <div className="sl-timeline-meta">
                                        <code className="sl-timestamp">{log.time}</code>
                                        <Tag
                                            className="sl-level-tag"
                                            style={{
                                                background: cfg.bg,
                                                color: cfg.color,
                                                border: `1px solid ${cfg.border}`,
                                            }}
                                        >
                                            {cfg.icon}
                                            <span style={{ marginLeft: 4 }}>{log.level}</span>
                                        </Tag>
                                    </div>
                                    <div className="sl-timeline-message">{log.message}</div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredLogs.length === 0 && (
                        <div className="sl-empty">
                            <Text type="secondary">No logs match your filter criteria</Text>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default SystemLogsPage;
