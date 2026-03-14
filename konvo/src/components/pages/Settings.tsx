import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function Settings() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and chatbot preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-emerald-600 bg-emerald-50">
                General
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                WhatsApp Connection
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Team Members
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-700">
                Billing
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue="ChatBot Hub" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="admin@chatbothub.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 234 567 8900" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" defaultValue="America/New_York (EST)" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto-reply</p>
                  <p className="text-sm text-gray-500">Automatically respond to messages outside business hours</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Smart routing</p>
                  <p className="text-sm text-gray-500">Automatically route complex queries to human agents</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Message analytics</p>
                  <p className="text-sm text-gray-500">Track detailed analytics for all conversations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Save Changes
                </Button>
                <Button variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch defaultChecked={!['Saturday', 'Sunday'].includes(day)} />
                      <span className="font-medium text-gray-900 w-24">{day}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="time"
                        defaultValue="09:00"
                        className="w-32"
                        disabled={['Saturday', 'Sunday'].includes(day)}
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        defaultValue="17:00"
                        className="w-32"
                        disabled={['Saturday', 'Sunday'].includes(day)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-900 mb-1">Delete Account</h3>
                <p className="text-sm text-red-700 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
