import React, { useState, useMemo } from 'react';
import {
    Card, Table, Tag, Input, Typography, Badge, Avatar, Space,
    Select, Button, Dropdown, Progress, Tooltip,
} from 'antd';
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    UserOutlined,
    MoreOutlined,
    EyeOutlined,
    DownloadOutlined,
    FilterOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    WarningOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { patients } from '../data/mockData';

const { Text, Title } = Typography;
const { Option } = Select;

// ─── Status config ─────────────────────────────────────────────────────────
const statusConfig = {
    Success: { color: '#52c41a', bg: '#f6ffed', border: '#b7eb8f', icon: <CheckCircleOutlined />, text: 'Success' },
    Failed: { color: '#ff4d4f', bg: '#fff2f0', border: '#ffa39e', icon: <CloseCircleOutlined />, text: 'Failed' },
    Processing: { color: '#1890ff', bg: '#e6f7ff', border: '#91d5ff', icon: <SyncOutlined spin />, text: 'Processing' },
    Queued: { color: '#8c8c8c', bg: '#fafafa', border: '#d9d9d9', icon: <ClockCircleOutlined />, text: 'Queued' },
};

// ─── Stat card config ──────────────────────────────────────────────────────
const statCards = [
    { key: 'total', label: 'Total Patients', icon: <TeamOutlined />, color: '#595959', bg: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', iconBg: '#f0f0f0' },
    { key: 'success', label: 'Successful', icon: <CheckCircleOutlined />, color: '#52c41a', bg: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', iconBg: '#d9f7be' },
    { key: 'failed', label: 'Failed', icon: <CloseCircleOutlined />, color: '#ff4d4f', bg: 'linear-gradient(135deg, #fff2f0 0%, #ffd8d2 100%)', iconBg: '#ffd8d2' },
    { key: 'processing', label: 'In Progress', icon: <ThunderboltOutlined />, color: '#1890ff', bg: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', iconBg: '#bae7ff' },
];

// ─── Action dropdown menu ──────────────────────────────────────────────────
const getActionItems = (record) => ({
    items: [
        { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
        { key: 'download', icon: <DownloadOutlined />, label: 'Download Report' },
        { key: 'log', icon: <FileTextOutlined />, label: 'View Logs' },
    ],
});


function PatientQueuePage() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Compute stats
    const stats = useMemo(() => ({
        total: patients.length,
        success: patients.filter(p => p.result === 'Success').length,
        failed: patients.filter(p => p.result === 'Failed').length,
        processing: patients.filter(p => p.result === 'Processing').length,
    }), []);

    // Filtered data
    const filteredData = useMemo(() => {
        return patients.filter(p => {
            const matchesSearch = searchText === ''
                || p.name.toLowerCase().includes(searchText.toLowerCase())
                || p.id.toLowerCase().includes(searchText.toLowerCase());
            const matchesFilter = statusFilter === 'all' || p.result === statusFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchText, statusFilter]);

    // Table columns
    const columns = [
        {
            title: 'Patient',
            key: 'patient',
            render: (_, record) => (
                <div className="pq-patient-cell">
                    <Avatar
                        size={38}
                        icon={<UserOutlined />}
                        className="pq-avatar"
                        style={{
                            background: `linear-gradient(135deg, ${statusConfig[record.result]?.color || '#8c8c8c'}22, ${statusConfig[record.result]?.color || '#8c8c8c'}44)`,
                            color: statusConfig[record.result]?.color || '#8c8c8c',
                            border: `1.5px solid ${statusConfig[record.result]?.color || '#d9d9d9'}40`,
                        }}
                    />
                    <div>
                        <Text strong className="pq-patient-name">{record.name}</Text>
                        <Text type="secondary" className="pq-patient-id">{record.id}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            width: 70,
            sorter: (a, b) => a.age - b.age,
            render: (age) => <Text className="pq-tabular">{age}</Text>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            render: (date) => <Text className="pq-tabular" type="secondary">{date}</Text>,
        },
        {
            title: 'Inference Time',
            dataIndex: 'inferenceTime',
            key: 'inferenceTime',
            width: 130,
            render: (time) =>
                time !== null ? (
                    <Text className="pq-tabular">{time.toFixed(1)} <span style={{ color: '#bfbfbf', fontSize: 11 }}>min</span></Text>
                ) : (
                    <Text type="secondary">—</Text>
                ),
            sorter: (a, b) => (a.inferenceTime || 0) - (b.inferenceTime || 0),
        },
        {
            title: 'Status',
            dataIndex: 'result',
            key: 'result',
            width: 130,
            render: (status) => {
                const cfg = statusConfig[status] || statusConfig.Queued;
                return (
                    <Tag
                        icon={cfg.icon}
                        className="pq-status-tag"
                        style={{
                            background: cfg.bg,
                            color: cfg.color,
                            border: `1px solid ${cfg.border}`,
                        }}
                    >
                        {cfg.text}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'actions',
            width: 48,
            render: (_, record) => (
                <Dropdown menu={getActionItems(record)} trigger={['click']} placement="bottomRight">
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="pq-action-btn"
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="content-wrapper pq-page">
            {/* Page Header */}
            <div className="pq-page-header">
                <div>
                    <Title level={4} className="pq-page-title">👥 Patient Queue</Title>
                    <Text type="secondary">Manage and monitor the vascular reconstruction pipeline</Text>
                </div>
            </div>

            {/* Statistic Cards */}
            <div className="pq-stats-grid">
                {statCards.map((card) => {
                    const value = stats[card.key];
                    const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
                    return (
                        <div key={card.key} className="pq-stat-card" style={{ background: card.bg }}>
                            <div className="pq-stat-icon" style={{ background: card.iconBg, color: card.color }}>
                                {card.icon}
                            </div>
                            <div className="pq-stat-body">
                                <Text type="secondary" className="pq-stat-label">{card.label}</Text>
                                <div className="pq-stat-value" style={{ color: card.color }}>{value}</div>
                                <Progress
                                    percent={card.key === 'total' ? 100 : pct}
                                    showInfo={false}
                                    strokeColor={card.color}
                                    trailColor="rgba(0,0,0,0.04)"
                                    strokeWidth={4}
                                    className="pq-stat-progress"
                                />
                                {card.key !== 'total' && (
                                    <Text type="secondary" className="pq-stat-pct">{pct}% of total</Text>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Patient Table */}
            <Card className="pq-table-card">
                {/* Table Header with Search & Filter */}
                <div className="pq-table-header">
                    <Text strong style={{ fontSize: 15 }}>📋 Patient Records</Text>
                    <div className="pq-table-actions">
                        <Input
                            placeholder="Search patient..."
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="pq-search"
                            allowClear
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="pq-filter-select"
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="Success">Success</Option>
                            <Option value="Failed">Failed</Option>
                            <Option value="Processing">Processing</Option>
                            <Option value="Queued">Queued</Option>
                        </Select>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} patients` }}
                    size="middle"
                    className="pq-table"
                    rowClassName="pq-table-row"
                />
            </Card>
        </div>
    );
}

export default PatientQueuePage;
