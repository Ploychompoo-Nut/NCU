import React, { useMemo } from 'react';
import { Card, Select, Tooltip as AntTooltip, Typography, Empty } from 'antd';
import { InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { metricsData, modelAverage, patients } from '../data/mockData';

const { Text } = Typography;

// Medical-grade palette
const COLORS = {
    clDice: { patient: '#1890ff', average: '#bae0ff' },  // Deep Blue
    dice: { patient: '#71c1ff', average: '#d6f0ff' },  // Sky Blue
    iou: { patient: '#52c41a', average: '#d9f7be' },  // Emerald Green
};

// Metric descriptions for info tooltip
const METRIC_INFO = {
    clDice: 'Centerline Dice — measures vessel connectivity preservation. Higher = better topology.',
    'Dice Score': 'Dice Coefficient — overlap between predicted and ground-truth segmentation.',
    IoU: 'Intersection over Union — strictest overlap metric, penalizes both FP and FN.',
};

// Custom Tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="metrics-tooltip">
                <div className="metrics-tooltip-header">{label}</div>
                {payload.map((entry, i) => (
                    <div key={i} className="metrics-tooltip-row">
                        <span className="metrics-tooltip-dot" style={{ background: entry.fill || entry.color }} />
                        <span className="metrics-tooltip-name">{entry.name}</span>
                        <span className="metrics-tooltip-value">{entry.value.toFixed(3)}</span>
                    </div>
                ))}
                <div className="metrics-tooltip-desc">
                    {METRIC_INFO[label] || ''}
                </div>
            </div>
        );
    }
    return null;
};

// Trend arrow component
function TrendIndicator({ current, average }) {
    const diff = current - average;
    const absDiff = Math.abs(diff);

    if (absDiff < 0.005) {
        return <MinusOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />;
    }
    if (diff > 0) {
        return (
            <span className="trend-up">
                <ArrowUpOutlined /> +{absDiff.toFixed(3)}
            </span>
        );
    }
    return (
        <span className="trend-down">
            <ArrowDownOutlined /> -{absDiff.toFixed(3)}
        </span>
    );
}


function MetricsReport({ selectedPatient, onPatientChange }) {
    const availablePatients = patients.filter(
        p => metricsData[p.id] !== undefined
    );

    const patientMetrics = metricsData[selectedPatient];

    // Build grouped chart data
    const chartData = useMemo(() => {
        if (!patientMetrics) return [];
        return [
            {
                metric: 'clDice',
                Patient: patientMetrics.clDice,
                Average: modelAverage.clDice,
            },
            {
                metric: 'Dice Score',
                Patient: patientMetrics.dice,
                Average: modelAverage.dice,
            },
            {
                metric: 'IoU',
                Patient: patientMetrics.iou,
                Average: modelAverage.iou,
            },
        ];
    }, [patientMetrics]);

    // Summary cards data
    const summaryCards = useMemo(() => {
        if (!patientMetrics) return [];
        return [
            { key: 'clDice', label: 'clDice', value: patientMetrics.clDice, avg: modelAverage.clDice, color: COLORS.clDice.patient },
            { key: 'dice', label: 'Dice Score', value: patientMetrics.dice, avg: modelAverage.dice, color: COLORS.dice.patient },
            { key: 'iou', label: 'IoU', value: patientMetrics.iou, avg: modelAverage.iou, color: COLORS.iou.patient },
        ];
    }, [patientMetrics]);

    return (
        <Card
            title={
                <div className="metrics-header">
                    <span className="metrics-title">📊 Performance Analytics</span>
                    <AntTooltip
                        title={
                            <div>
                                <p><b>clDice</b>: Vessel connectivity accuracy</p>
                                <p><b>Dice</b>: Segmentation overlap score</p>
                                <p><b>IoU</b>: Intersection over Union</p>
                                <p style={{ marginTop: 4, opacity: 0.7 }}>All metrics range from 0.0 to 1.0</p>
                            </div>
                        }
                        placement="bottomLeft"
                    >
                        <InfoCircleOutlined className="metrics-info-icon" />
                    </AntTooltip>
                </div>
            }
            className="metrics-card"
            extra={
                <Select
                    value={selectedPatient}
                    onChange={onPatientChange}
                    style={{ width: 155 }}
                    options={availablePatients.map(p => ({
                        label: (
                            <span style={{ fontSize: 13 }}>
                                {p.id}
                                <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                                    {p.name.split(' ')[0]}
                                </Text>
                            </span>
                        ),
                        value: p.id,
                    }))}
                />
            }
        >
            {patientMetrics ? (
                <div className="metrics-content">
                    {/* Subtitle */}
                    <div className="metrics-subtitle">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Vessel Connectivity & Accuracy — {selectedPatient}
                        </Text>
                    </div>

                    {/* Grouped Bar Chart */}
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
                                barCategoryGap="25%"
                                barGap={4}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="metric"
                                    tick={{ fontSize: 12, fill: '#595959', fontWeight: 500 }}
                                    axisLine={{ stroke: '#e8e8e8' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                                    tick={{ fontSize: 11, fill: '#8c8c8c' }}
                                    axisLine={{ stroke: '#e8e8e8' }}
                                    tickLine={false}
                                    tickFormatter={(v) => v.toFixed(1)}
                                />
                                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                    iconType="square"
                                    iconSize={10}
                                />

                                {/* Threshold reference line */}
                                <ReferenceLine
                                    y={0.85}
                                    stroke="#bfbfbf"
                                    strokeDasharray="6 4"
                                    strokeWidth={1.5}
                                    label={{
                                        value: 'High Performance (0.85)',
                                        position: 'insideTopRight',
                                        fill: '#8c8c8c',
                                        fontSize: 10,
                                        fontWeight: 500,
                                    }}
                                />

                                <Bar
                                    dataKey="Patient"
                                    name="Current Patient"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                    animationDuration={600}
                                    fill="#1890ff"
                                >
                                    {chartData.map((entry, index) => {
                                        const fills = [COLORS.clDice.patient, COLORS.dice.patient, COLORS.iou.patient];
                                        return <rect key={`p-${index}`} fill={fills[index]} />;
                                    })}
                                </Bar>
                                <Bar
                                    dataKey="Average"
                                    name="Model Average"
                                    radius={[4, 4, 0, 0]}
                                    barSize={32}
                                    animationDuration={600}
                                    fill="#d9d9d9"
                                    opacity={0.7}
                                >
                                    {chartData.map((entry, index) => {
                                        const fills = [COLORS.clDice.average, COLORS.dice.average, COLORS.iou.average];
                                        return <rect key={`a-${index}`} fill={fills[index]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Cards */}
                    <div className="metrics-summary-cards">
                        {summaryCards.map((card) => (
                            <div key={card.key} className="summary-card" style={{ borderTop: `3px solid ${card.color}` }}>
                                <div className="summary-card-label">{card.label}</div>
                                <div className="summary-card-value" style={{ color: card.color }}>
                                    {card.value.toFixed(3)}
                                </div>
                                <div className="summary-card-trend">
                                    <TrendIndicator current={card.value} average={card.avg} />
                                    <span className="summary-card-avg">avg {card.avg.toFixed(3)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="metrics-footer">
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            Dataset: <b>ImageCAS</b> &nbsp;|&nbsp; Model: <b>NeCA (Self-supervised)</b>
                        </Text>
                    </div>
                </div>
            ) : (
                <Empty description="No metrics available for this patient" />
            )}
        </Card>
    );
}

export default MetricsReport;
