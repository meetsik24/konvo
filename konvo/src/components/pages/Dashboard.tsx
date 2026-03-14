import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Send, ArrowUpRight, ArrowDownRight, Zap, Loader2 } from 'lucide-react';
import { useChats } from '@/hooks/use-chats';
import { usePriorityLeads } from '@/hooks/use-priority-leads';
import { formatRelativeTime, getMessagePreview } from '@/lib/format';

export function Dashboard() {
  const { data: chats = [], isLoading: chatsLoading, error: chatsError } = useChats();
  const { data: priorityLeads = [], isLoading: leadsLoading, error: leadsError } = usePriorityLeads();

  const totalChats = chats.length;
  const activeChats = chats.filter((c) => c.unread_count > 0).length;

  const stats = [
    {
      title: 'Total Conversations',
      value: chatsLoading ? '—' : totalChats.toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Chats',
      value: chatsLoading ? '—' : activeChats.toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
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
      title: 'Priority Leads',
      value: leadsLoading ? '—' : priorityLeads.length.toLocaleString(),
      change: '—',
      trend: 'up' as const,
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const recentActivity: Array<{ user: string; message: string; time: string; status: 'bot' | 'human' }> =
    [...chats]
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      .slice(0, 5)
      .map((c) => ({
        user: c.phone_number,
        message: getMessagePreview(c.last_message as Record<string, unknown>),
        time: formatRelativeTime(c.last_message_at),
        status: (c.unread_count > 0 ? 'human' : 'bot') as 'bot' | 'human',
      }));

  const hasError = !!chatsError || !!leadsError;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Monitor your WhatsApp chatbot performance</p>
      </div>

      {hasError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {chatsError && `Chats: ${chatsError.message}. `}
          {leadsError && `Priority leads: ${leadsError.message}. `}
          Ensure the API is running and /api is proxied to your backend.
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
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 88, 95, 72, 58, 82, 90, 75, 68].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-gray-500 text-center mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray="175.93 251.33"
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="20"
                    strokeDasharray="75.40 251.33"
                    strokeDashoffset="-175.93"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">70%</div>
                    <div className="text-xs text-gray-500">Bot</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-700">Bot Responses</span>
                </div>
                <span className="text-sm font-medium text-gray-900">70%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-700">Human Responses</span>
                </div>
                <span className="text-sm font-medium text-gray-900">30%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {priorityLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority Leads</CardTitle>
            <p className="text-sm text-gray-500 mt-1">High-intent leads with suggested actions</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.phone_number}
                  className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name ?? lead.phone_number}</p>
                    <p className="text-xs text-gray-500">{lead.phone_number}</p>
                    <p className="text-xs text-gray-600 mt-1">Score: {lead.lead_score}</p>
                    {lead.proposed_actions?.length > 0 && (
                      <ul className="mt-1 text-xs text-emerald-700 list-disc list-inside">
                        {lead.proposed_actions.slice(0, 2).map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatRelativeTime(lead.last_message_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chatsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading chats…
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
                        ? 'bg-emerald-50 text-emerald-700'
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
