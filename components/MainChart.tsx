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
  stats: {
    visitors: number;
    bounceRate: number;
    sessionTime: string;
    liveVisitors: number;
  };
}

const generateChartData = (eventsTimestamps: string[]): ChartData[] => {
  const chartData = eventsTimestamps.reduce((acc, timestamp) => {
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

export default function Component({ eventsTimestamps, stats }: ComponentProps) {
  const formattedChartData = generateChartData(eventsTimestamps);

  const formatSeconds = (seconds: number) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between gap-4 mb-6">
          <StatItem
            title="Visitors"
            value={Math.round(stats.visitors).toString()}
          />
          <Separator orientation="vertical" className="h-12" />
          <StatItem
            title="Bounce Rate"
            value={`${Math.round(stats.bounceRate)}%`}
          />
          <Separator orientation="vertical" className="h-12" />
          <StatItem
            title="Session Time"
            value={formatSeconds(Math.round(Number(stats.sessionTime)))}
          />
          <Separator orientation="vertical" className="h-12" />
          <StatItem
            title="Live Visitors"
            value={Math.round(stats.liveVisitors).toString()}
            isLive
          />
        </div>
        <ChartContainer config={chartConfig}>
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
      <div className="flex gap-2 items-center">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        {isLive && <PulseDot />}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
