"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

const generateChartData = (eventsTimestamps: string[]) => {
  const data = new Array(24).fill(0).map((_, index) => ({
    hour: index,
    events: 0,
  }));

  eventsTimestamps.forEach((timestamp) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
    data[hour].events += 1;
  });

  return data;
};

export default function PlainChart({
  eventsTimestamps,
}: {
  eventsTimestamps: string[];
}) {
  const chartData = generateChartData(eventsTimestamps);

  return (
    <div className="w-full h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <Line
            type="monotone"
            dataKey="events"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
