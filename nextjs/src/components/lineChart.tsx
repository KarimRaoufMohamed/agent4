"use client";
 
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[]; 
  xKey: string;
  yKey: string;
}

const LineChartComponent: React.FC<ChartProps> = ({ list, xKey, yKey }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={list}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yKey} stroke="#82ca9d" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
