"use client";

import { PieChart, Pie, Cell } from "recharts";

export default function MiniPieChart({ data }) {
  return (
    <PieChart width={100} height={100}>
      <Pie
        data={data}
        cx={50}
        cy={50}
        innerRadius={30}
        outerRadius={45}
        paddingAngle={5}
        dataKey="value"
        isAnimationActive={false}
      >
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  );
}
