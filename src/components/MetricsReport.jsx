import React from 'react';
import { Card, Select, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { metricsData, patients } from '../data/mockData';

const COLORS = ['#52c41a', '#1890ff', '#36cfc9'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value" style={{ color: payload[0].payload.fill }}>
                    Score: <strong>{payload[0].value.toFixed(3)}</strong>
                </p>
            </div>
        );
    }
    return null;
};

function MetricsReport({ selectedPatient, onPatientChange }) {
    const completedPatients = patients.filter(p => p.result === 'Success' || p.result === 'Failed');
    const data = metricsData[selectedPatient] || [];

    return (
        <Card
            title={
                <span style={{ fontWeight: 600, fontSize: 16 }}>
                    📊 Metrics Report
                </span>
            }
            className="metrics-card"
            extra={
                <Select
                    value={selectedPatient}
                    onChange={onPatientChange}
                    style={{ width: 160 }}
                    options={completedPatients.map(p => ({
                        label: p.id,
                        value: p.id,
                    }))}
                />
            }
        >
            {data.length > 0 ? (
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="metric"
                                tick={{ fontSize: 13, fill: '#595959' }}
                                axisLine={{ stroke: '#d9d9d9' }}
                            />
                            <YAxis
                                domain={[0, 1]}
                                tick={{ fontSize: 12, fill: '#8c8c8c' }}
                                axisLine={{ stroke: '#d9d9d9' }}
                                tickFormatter={(v) => v.toFixed(1)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                radius={[6, 6, 0, 0]}
                                barSize={50}
                                animationDuration={800}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="metrics-summary">
                        {data.map((item, idx) => (
                            <div key={idx} className="metric-item">
                                <span className="metric-dot" style={{ background: item.fill }} />
                                <span className="metric-name">{item.metric}</span>
                                <span className="metric-value" style={{ color: item.fill }}>
                                    {item.value.toFixed(3)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <Empty description="No metrics available for this patient" />
            )}
        </Card>
    );
}

export default MetricsReport;
