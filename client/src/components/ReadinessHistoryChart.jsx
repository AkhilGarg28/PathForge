import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="chart-custom-tooltip">
        <p className="tooltip-date">{label}</p>
        <p className="tooltip-score">
          Readiness: <strong>{item.score}%</strong>
        </p>
        {item.event && <p className="tooltip-event">{item.event}</p>}
      </div>
    );
  }
  return null;
};

const ReadinessHistoryChart = ({ history = [] }) => {
  // Requirement: hide it when there are fewer than 2 points
  if (!history || history.length < 2) {
    return null;
  }

  const chartData = history.map((item, index) => {
    const d = item.date ? new Date(item.date) : null;
    const formattedDate =
      d && !isNaN(d.getTime())
        ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : `Milestone ${index + 1}`;

    let eventLabel = 'Milestone Update';
    if (item.event === 'roadmap_created') eventLabel = 'Roadmap Created';
    if (item.event === 'module_complete') eventLabel = 'Module Completed';
    if (item.event === 'diagnostic_retake') eventLabel = 'Diagnostic Retake';

    return {
      name: formattedDate,
      score: typeof item.readinessScore === 'number' ? Math.round(item.readinessScore) : 0,
      event: eventLabel,
    };
  });

  return (
    <div className="readiness-history-card">
      <div className="chart-header">
        <h3 className="chart-title">Readiness Growth Over Time</h3>
        <p className="chart-subtitle">Historical progression across milestones</p>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 24, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#D97706"
              strokeWidth={3}
              dot={{ fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReadinessHistoryChart;
