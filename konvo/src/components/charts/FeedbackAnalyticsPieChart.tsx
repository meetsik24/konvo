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

/** Human-readable label for feedback.data field names */
export function feedbackFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    quality_of_service: 'Quality of service',
    speed: 'Speed',
    satisfaction: 'Satisfaction',
    overall: 'Overall rating',
  };
  return labels[field] ?? field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  data: FeedbackAnalyticsResponse | null | undefined;
  isLoading?: boolean;
  /** Override label for the field (e.g. "Quality of service") */
  fieldLabel?: string;
};

export function FeedbackAnalyticsPieChart({ data, isLoading, fieldLabel }: Props) {
  const chartData = React.useMemo(() => {
    if (!data?.categories?.length) return [];
    return data.categories.map((c) => ({ name: String(c.value), value: c.count }));
  }, [data]);

  const displayLabel = fieldLabel ?? (data?.field ? feedbackFieldLabel(data.field) : 'Feedback');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
        <span>Loading…</span>
      </div>
    );
  }

  if (!data?.categories?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground text-center px-4">
        <span>No feedback data yet.</span>
        <span className="text-xs">
          Feedback is grouped by <strong>{displayLabel}</strong>. Ensure the bot sends feedback with this field in <code className="bg-muted px-1 rounded">data</code>.
        </span>
      </div>
    );
  }

  return (
    <>
      {data.total_count != null && data.total_count > 0 && (
        <p className="text-xs text-muted-foreground mb-3">
          {data.total_count} response{data.total_count === 1 ? '' : 's'} · grouped by {displayLabel}
        </p>
      )}
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
              {Number(cat.percentage).toFixed(0)}% <span className="text-gray-500 font-normal">({cat.count})</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
