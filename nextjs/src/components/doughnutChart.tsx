"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const getColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`; 
};

interface ChartProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  list: any[];
  xKey: string;
  yKey: string;
}

const DoughnutChartComponent: React.FC<ChartProps> = ({ list, xKey, yKey }) => {
 
  const uniqueKeys = Array.from(new Set(list.map(item => item[xKey])));

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie data={list} dataKey={yKey} cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8">
            {list.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColorFromString(entry[xKey])} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

     
      <div className="flex flex-wrap justify-center mt-2">
        {uniqueKeys.map((key, index) => (
          <div key={index} className="flex items-center mx-3">
            <span className="w-4 h-4 mr-2" style={{ backgroundColor: getColorFromString(key) }}></span>
            <span className="text-sm font-medium">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoughnutChartComponent;
