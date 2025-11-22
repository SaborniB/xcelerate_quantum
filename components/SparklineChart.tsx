import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  trend: number; // Positive or negative trend
}

const SparklineChart: React.FC<SparklineProps> = ({ data, trend }) => {
  const chartData = data.map((val, idx) => ({ index: idx, value: val }));
  const strokeColor = trend >= 0 ? '#10b981' : '#f43f5e'; // Emerald or Rose

  return (
    <div className="h-24 w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden p-2">
      <div className="flex justify-between items-center px-2 mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Post Volume</span>
        <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
           {trend > 0 ? '+' : ''}{(trend * 100).toFixed(1)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', fontSize: '12px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: strokeColor }}
            formatter={(value: number) => [`${value} posts`, 'Volume']}
            labelStyle={{ display: 'none' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2} 
            dot={false} 
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparklineChart;