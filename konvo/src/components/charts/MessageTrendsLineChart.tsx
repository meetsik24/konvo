"use client";

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type Props = {
  conversations: Array<{ last_message_at: string; unread_count: number }>;
};

type TrendPoint = {
  day: string;
  updated: number;
  unread: number;
};

function buildTrend(conversations: Props['conversations']): TrendPoint[] {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const buckets = new Map<string, TrendPoint>();
  days.forEach((d) => {
    const key = format(d, 'yyyy-MM-dd');
    buckets.set(key, { day: format(d, 'EEE'), updated: 0, unread: 0 });
  });

  conversations.forEach((c) => {
    if (!c.last_message_at) return;
    const date = new Date(c.last_message_at);
    if (Number.isNaN(date.getTime())) return;
    const d = startOfDay(date);
    const key = format(d, 'yyyy-MM-dd');
    const b = buckets.get(key);
    if (!b) return;
    b.updated += 1;
    b.unread += c.unread_count;
  });

  return Array.from(buckets.values());
}

const MARGIN = { top: 12, right: 12, bottom: 24, left: 36 };

function buildPath(points: number[], width: number, height: number): string {
  if (points.length === 0) return '';
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const range = max - min || 1;
  const w = (width - MARGIN.left - MARGIN.right) / (points.length - 1 || 1);
  const h = height - MARGIN.top - MARGIN.bottom;
  return points
    .map((v, i) => {
      const x = MARGIN.left + i * w;
      const y = MARGIN.top + h - ((v - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function MessageTrendsLineChart({ conversations }: Props) {
  const chartData = React.useMemo(() => buildTrend(conversations), [conversations]);
  const totalUpdated = React.useMemo(
    () => chartData.reduce((acc, p) => acc + p.updated, 0),
    [chartData]
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 400, height: 256 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 400, height: 256 };
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = size;
  const pathUpdated = React.useMemo(
    () => buildPath(chartData.map((d) => d.updated), width, height),
    [chartData, width, height]
  );
  const pathUnread = React.useMemo(
    () => buildPath(chartData.map((d) => d.unread), width, height),
    [chartData, width, height]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Trends</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
            No recent conversation activity to display.
          </div>
        ) : (
          <div ref={containerRef} className="h-64 w-full min-h-[256px]">
            <svg width={width} height={height} className="overflow-visible">
              <path
                d={pathUpdated}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={pathUnread}
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              {chartData.map((d, i) => {
                const w = (width - MARGIN.left - MARGIN.right) / (chartData.length - 1 || 1);
                const x = MARGIN.left + i * w;
                return (
                  <text
                    key={d.day}
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded bg-primary" /> Updated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded bg-accent" /> Unread
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending (derived from activity) <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Conversations updated in the last 7 days: {totalUpdated.toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
