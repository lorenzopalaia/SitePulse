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
  timestamps: string[];
  stats: {
    visitors: number;
    events: number;
    bounceRate: number;
    sessionTime: string;
    liveVisitors: number;
  };
}

const generateChartData = (timestamps: string[]): ChartData[] => {
  const chartData = timestamps.reduce((acc, timestamp) => {
    const date = new Date(timestamp);
    const timeKey = date.toLocaleTimeString([], {
      month: "short",
      day: "numeric",
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
    label: "Events",
    color: "hsl(var(--chart-1))",
  },
};

export default function MainChart({ timestamps, stats }: ComponentProps) {
  const formattedChartData = generateChartData(timestamps);

  const formatSeconds = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formattedStats = [
    {
      title: "Visitors",
      value: stats.visitors.toString(),
    },
    {
      title: "Events",
      value: stats.events.toString(),
    },
    {
      title: "Bounce Rate",
      value: `${Math.round(stats.bounceRate)}%`,
    },
    {
      title: "Session Time",
      value: formatSeconds(Math.round(Number(stats.sessionTime))),
    },
    {
      title: "Live Visitors",
      value: stats.liveVisitors.toString(),

      isLive: true,
    },
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid justify-between grid-cols-3 gap-4 px-4 mb-6 md:grid-cols-5">
          {formattedStats.map(({ title, value, isLive }, index) => (
            <div key={title} className={index !== 0 ? "flex gap-4" : ""}>
              {index !== 0 && (
                <Separator
                  orientation="vertical"
                  className="hidden h-12 md:block"
                />
              )}
              <StatItem title={title} value={value} isLive={isLive} />
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="w-full h-96">
          <AreaChart accessibilityLayer data={formattedChartData}>
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

const PulseDot = () => (
  <span className="relative flex items-center justify-center size-4">
    <span className="absolute inline-flex w-full h-full rounded-full opacity-75 bg-primary animate-ping"></span>
    <span className="relative inline-flex size-2.5 rounded-full bg-primary"></span>
  </span>
);

function StatItem({
  title,
  value,
  isLive,
}: {
  title: string;
  value: string;
  isLive?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        {isLive && <PulseDot />}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
