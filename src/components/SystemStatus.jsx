import React from 'react';
import { Card, Progress, Table, Tag, Typography, Space, Badge } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { patients, processingStatus, systemLogs } from '../data/mockData';

const { Text } = Typography;

const statusConfig = {
    Success: { color: 'success', icon: <CheckCircleOutlined /> },
    Failed: { color: 'error', icon: <CloseCircleOutlined /> },
    Processing: { color: 'processing', icon: <SyncOutlined spin /> },
    Queued: { color: 'default', icon: <ClockCircleOutlined /> },
};

const columns = [
    {
        title: 'Patient ID',
        dataIndex: 'id',
        key: 'id',
        render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>,
    },
    {
        title: 'Patient Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        responsive: ['md'],
    },
    {
        title: 'Inference Time',
        dataIndex: 'inferenceTime',
        key: 'inferenceTime',
        render: (time) =>
            time !== null ? (
                <Text>{time.toFixed(1)} min</Text>
            ) : (
                <Text type="secondary">—</Text>
            ),
        sorter: (a, b) => (a.inferenceTime || 0) - (b.inferenceTime || 0),
    },
    {
        title: 'Status',
        dataIndex: 'result',
        key: 'result',
        render: (status) => {
            const config = statusConfig[status] || statusConfig.Queued;
            return (
                <Tag icon={config.icon} color={config.color} style={{ borderRadius: 12, padding: '2px 12px' }}>
                    {status}
                </Tag>
            );
        },
        filters: [
            { text: 'Success', value: 'Success' },
            { text: 'Failed', value: 'Failed' },
            { text: 'Processing', value: 'Processing' },
            { text: 'Queued', value: 'Queued' },
        ],
        onFilter: (value, record) => record.result === value,
    },
];

const logLevelColor = {
    INFO: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
};

function SystemStatus() {
    return (
        <div className="system-status-section">
            {/* Processing Progress */}
            <Card id="processing-status" className="status-card" title={
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                    ⚙️ Processing Status
                </span>
            }>
                <div className="processing-info">
                    <div className="processing-header">
                        <Badge status="processing" />
                        <Text strong style={{ marginLeft: 8 }}>
                            {processingStatus.message}
                        </Text>
                    </div>
                    <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
                        Stage: {processingStatus.stage}
                    </Text>
                    <Progress
                        percent={processingStatus.progress}
                        strokeColor={{
                            '0%': '#1890ff',
                            '100%': '#52c41a',
                        }}
                        trailColor="#f0f0f0"
                        strokeWidth={12}
                        style={{ marginBottom: 8 }}
                    />
                </div>
            </Card>

            {/* Patient Summary Table */}
            <Card id="patient-summary" className="table-card" title={
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                    📋 Patient Summary
                </span>
            }>
                <Table
                    columns={columns}
                    dataSource={patients}
                    rowKey="id"
                    size="middle"
                    pagination={{ pageSize: 5 }}
                    style={{ marginTop: 4 }}
                />
            </Card>

            {/* System Logs */}
            <Card id="system-logs" className="logs-card" title={
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                    🗒️ System Logs
                </span>
            }>
                <div className="logs-container">
                    {systemLogs.map((log, idx) => (
                        <div key={idx} className="log-entry">
                            <Text type="secondary" className="log-time">{log.time}</Text>
                            <Tag
                                color={logLevelColor[log.level]}
                                style={{ borderRadius: 4, minWidth: 65, textAlign: 'center' }}
                            >
                                {log.level}
                            </Tag>
                            <Text className="log-message">{log.message}</Text>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default SystemStatus;
