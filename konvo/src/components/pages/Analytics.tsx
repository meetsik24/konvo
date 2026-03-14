import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Users, Clock } from 'lucide-react';

export function Analytics() {
  const messageData = [
    { day: 'Mon', messages: 324 },
    { day: 'Tue', messages: 289 },
    { day: 'Wed', messages: 412 },
    { day: 'Thu', messages: 356 },
    { day: 'Fri', messages: 478 },
    { day: 'Sat', messages: 234 },
    { day: 'Sun', messages: 198 },
  ];

  const maxMessages = Math.max(...messageData.map(d => d.messages));

  const stats = [
    {
      title: 'Avg Response Time',
      value: '2.3s',
      change: '-0.5s',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Messages',
      value: '12,847',
      change: '+18.2%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Active Users',
      value: '3,421',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Bot Accuracy',
      value: '94.2%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const topIntents = [
    { intent: 'Order Tracking', count: 1234, percentage: 28 },
    { intent: 'Product Inquiry', count: 987, percentage: 22 },
    { intent: 'Account Help', count: 856, percentage: 19 },
    { intent: 'Shipping Info', count: 645, percentage: 15 },
    { intent: 'Returns', count: 432, percentage: 10 },
    { intent: 'Other', count: 287, percentage: 6 },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Detailed insights into your chatbot performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
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
                <p className="text-sm text-emerald-600 mt-1">{stat.change} from last week</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messageData.map((data) => (
                <div key={data.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{data.day}</span>
                    <span className="text-gray-500">{data.messages} messages</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${(data.messages / maxMessages) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bot vs Human Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-48 h-48">
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
                    <div className="text-3xl font-bold text-gray-900">70%</div>
                    <div className="text-sm text-gray-500">Automated</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">Bot Handled</span>
                </div>
                <span className="text-sm font-bold text-gray-900">70%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium text-gray-700">Human Handled</span>
                </div>
                <span className="text-sm font-bold text-gray-900">30%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top User Intents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topIntents.map((intent, index) => (
              <div key={intent.intent} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{intent.intent}</span>
                  </div>
                  <span className="text-sm text-gray-500">{intent.count} requests</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
                    style={{ width: `${intent.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
