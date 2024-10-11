"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

interface ChartData {
  time: string;
  events: number;
}

interface ComponentProps {
  eventsTimestamps: string[];
}

const generateChartData = (eventsTimestamps: string[]): ChartData[] => {
  const chartData = eventsTimestamps.reduce((acc, timestamp) => {
    const date = new Date(timestamp);
    const timeKey = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    acc[timeKey] = (acc[timeKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(chartData).map(([time, count]) => ({
    time,
    events: count,
  }));
};

const chartConfig: ChartConfig = {
  events: {
    label: "Eventi",
    color: "hsl(var(--chart-1))",
  },
};

export default function Component({ eventsTimestamps }: ComponentProps) {
  const formattedChartData = generateChartData(eventsTimestamps);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4 mb-6">
          <StatItem title="Visitors" value="1,234" />
          <Separator orientation="vertical" className="h-12" />
          <StatItem title="Bounce Rate" value="42%" />
          <Separator orientation="vertical" className="h-12" />
          <StatItem title="Session Time" value="2m 15s" />
          <Separator orientation="vertical" className="h-12" />
          <StatItem title="Live Visitors" value="56" />
        </div>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={formattedChartData}
            margin={{
              left: 40,
              right: 40,
              top: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-events)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-events)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="events"
              type="monotone"
              fill="url(#fillEvents)"
              fillOpacity={0.4}
              stroke="var(--color-events)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function StatItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
