"use client";

import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { FeedbackAnalyticsResponse } from '@/api/types';

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

type Props = {
  data: FeedbackAnalyticsResponse | null | undefined;
  isLoading?: boolean;
  /** Chart title, e.g. "Quality of Service" */
  title?: string;
};

export function FeedbackAnalyticsPieChart({ data, isLoading }: Props) {
  const chartData = React.useMemo(() => {
    if (!data?.categories?.length) return [];
    return data.categories.map((c) => ({ name: String(c.value), value: c.count }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!data?.categories?.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No feedback data yet.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto h-48 w-full min-h-[192px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{
                borderRadius: '6px',
                border: '1px solid hsl(var(--border))',
                fontSize: '12px',
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name ?? index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {data.categories.map((cat, i) => (
          <div key={String(cat.value) + i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{String(cat.value)}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {Number(cat.percentage).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
