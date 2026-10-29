"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function MiniPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
