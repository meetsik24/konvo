import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Send, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { usePharmacyConversations, useFeedbackAnalytics } from '@/hooks/use-pharmacy';
import { formatRelativeTime } from '@/lib/format';
import { MessageTrendsLineChart } from '@/components/charts/MessageTrendsLineChart';
import { FeedbackAnalyticsPieChart } from '@/components/charts/FeedbackAnalyticsPieChart';

export function Dashboard() {
  const { data, isLoading: conversationsLoading, error: conversationsError } = usePharmacyConversations({ limit: 50 });
  const {
    data: feedbackAnalytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useFeedbackAnalytics({ field: 'quality_of_service' });
  const conversations = data?.conversations ?? [];
  const totalConversations = data?.count ?? conversations.length;
  const activeConversations = conversations.filter((c) => c.unread_count > 0).length;

  const stats = [
    {
      title: 'Total Conversations',
      value: conversationsLoading ? '—' : totalConversations.toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Chats',
      value: conversationsLoading ? '—' : activeConversations.toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Messages Sent Today',
      value: '—',
      change: '—',
      trend: 'down' as const,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Unread',
      value: conversationsLoading ? '—' : conversations.reduce((n, c) => n + c.unread_count, 0).toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: MessageSquare,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/30',
    },
  ];

  const recentActivity = [...conversations]
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    .slice(0, 5)
    .map((c) => ({
      user: c.contact_name ?? c.user_phone,
      message: c.last_message_preview ?? 'Message',
      time: formatRelativeTime(c.last_message_at),
      status: (c.unread_count > 0 ? 'human' : 'bot') as 'bot' | 'human',
    }));

  const hasError = !!conversationsError;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your WhatsApp chatbot performance</p>
      </div>

      {hasError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {conversationsError && `Conversations: ${conversationsError.message}. `}
          Check VITE_API_URL and that the pharmacy API is reachable.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendIcon
                    className={`w-4 h-4 ${
                      stat.trend === 'up' ? 'text-primary' : 'text-red-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-primary' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MessageTrendsLineChart conversations={conversations} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback: Quality of Service</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsError ? (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Analytics unavailable. Check API.
              </div>
            ) : (
              <FeedbackAnalyticsPieChart
                data={feedbackAnalytics ?? null}
                isLoading={analyticsLoading}
                title="Quality of Service"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading…
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No recent activity yet.</p>
            ) : (
              recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-500">{activity.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'bot'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {activity.status === 'bot' ? 'Bot' : 'Human'}
                  </span>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
