import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeedbacks } from '@/hooks/use-pharmacy';
import { format } from 'date-fns';
import { MessageSquare, Loader2 } from 'lucide-react';
import type { Feedback } from '@/api/types';

function FeedbackRow({ f }: { f: Feedback }) {
  const dataEntries = Object.entries(f.data ?? {}).filter(([, v]) => v != null);
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-gray-900">{f.phone_number}</span>
        {f.created_at && (
          <span className="text-xs text-gray-500">
            {format(new Date(f.created_at), 'MMM d, yyyy HH:mm')}
          </span>
        )}
      </div>
      {dataEntries.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          {dataEntries.map(([key, value]) => (
            <span key={key}>
              <span className="text-gray-500">{key}:</span>{' '}
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Feedbacks() {
  const { data: feedbacks, isLoading, error } = useFeedbacks();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Feedbacks</h1>
        <p className="text-gray-500 mt-1">Customer feedback from the pharmacy bot</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.message}. Check API and /pharmacy/feedbacks.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Recent feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading…
            </div>
          ) : !feedbacks?.length ? (
            <p className="text-sm text-gray-500 py-8">No feedback yet.</p>
          ) : (
            <div className="divide-y-0">
              {feedbacks.map((f, i) => (
                <FeedbackRow key={f.id ?? `${f.phone_number}-${i}`} f={f} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
