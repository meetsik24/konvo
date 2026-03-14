import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, Pause, CreditCard as Edit, Copy, Trash2 } from 'lucide-react';

const flows = [
  {
    id: '1',
    name: 'Welcome Message',
    description: 'Greet new users and provide initial options',
    status: 'active',
    triggers: 'New conversation',
    lastUpdated: '2 days ago',
    usage: 847,
  },
  {
    id: '2',
    name: 'Order Tracking',
    description: 'Help users track their orders automatically',
    status: 'active',
    triggers: 'Keywords: track, order, shipping',
    lastUpdated: '5 days ago',
    usage: 1234,
  },
  {
    id: '3',
    name: 'FAQ Handler',
    description: 'Answer frequently asked questions',
    status: 'active',
    triggers: 'Keywords: help, question, faq',
    lastUpdated: '1 week ago',
    usage: 2156,
  },
  {
    id: '4',
    name: 'Product Recommendations',
    description: 'Suggest products based on user preferences',
    status: 'paused',
    triggers: 'Keywords: recommend, suggest, product',
    lastUpdated: '2 weeks ago',
    usage: 423,
  },
  {
    id: '5',
    name: 'Feedback Collection',
    description: 'Collect user feedback after interactions',
    status: 'active',
    triggers: 'After conversation ends',
    lastUpdated: '3 weeks ago',
    usage: 1847,
  },
];

export function Flows() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Chatbot Flows</h1>
          <p className="text-gray-500 mt-1">Design and manage automated conversation flows</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Flows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-sm text-gray-500 mt-1">5 active, 2 paused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">15,847</div>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">92.4%</div>
            <p className="text-sm text-emerald-600 mt-1">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Flows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flows.map((flow) => (
              <div
                key={flow.id}
                className="p-5 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{flow.name}</h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          flow.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {flow.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{flow.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Triggers: {flow.triggers}</span>
                      <span>•</span>
                      <span>Updated {flow.lastUpdated}</span>
                      <span>•</span>
                      <span>{flow.usage.toLocaleString()} executions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  {flow.status === 'active' ? (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
