"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[];
  xKey: string;
  yKey: string;
}

const BarChartComponent: React.FC<ChartProps> = ({ list, xKey, yKey }) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={list}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={yKey} fill="#8884d8" barSize={50} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;
