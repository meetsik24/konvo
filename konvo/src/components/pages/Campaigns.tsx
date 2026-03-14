import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Send, Users, TrendingUp, CircleCheck as CheckCircle, Clock, Circle as XCircle } from 'lucide-react';

const campaigns = [
  {
    id: '1',
    name: 'Summer Sale Announcement',
    status: 'completed',
    sent: 2847,
    delivered: 2823,
    opened: 2156,
    clicked: 847,
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'New Product Launch',
    status: 'active',
    sent: 1234,
    delivered: 1198,
    opened: 856,
    clicked: 423,
    date: '5 hours ago',
  },
  {
    id: '3',
    name: 'Customer Feedback Request',
    status: 'scheduled',
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    date: 'Tomorrow at 10:00 AM',
  },
  {
    id: '4',
    name: 'Weekly Newsletter',
    status: 'completed',
    sent: 3421,
    delivered: 3398,
    opened: 2547,
    clicked: 1234,
    date: '1 week ago',
  },
];

export function Campaigns() {
  const stats = [
    {
      title: 'Total Campaigns',
      value: '24',
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Recipients',
      value: '12,847',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Avg Open Rate',
      value: '76.3%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Avg Click Rate',
      value: '34.2%',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { icon: CheckCircle, label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
      active: { icon: Clock, label: 'Active', className: 'bg-blue-50 text-blue-700' },
      scheduled: { icon: Clock, label: 'Scheduled', className: 'bg-amber-50 text-amber-700' },
      failed: { icon: XCircle, label: 'Failed', className: 'bg-red-50 text-red-700' },
    };

    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">Create and manage broadcast messages</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">{campaign.date}</p>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>

                {campaign.status !== 'scheduled' && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{campaign.sent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Sent</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-700">{campaign.delivered.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Delivered</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">{campaign.opened.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Opened</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-700">{campaign.clicked.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Clicked</p>
                    </div>
                  </div>
                )}

                {campaign.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Cancel</Button>
                  </div>
                )}

                {campaign.status === 'completed' && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Duplicate</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
