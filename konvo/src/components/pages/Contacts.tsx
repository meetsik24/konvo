import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, UserPlus, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const contacts = [
  { id: '1', name: 'John Smith', phone: '+1 234 567 8901', email: 'john@example.com', lastContact: '2 hours ago', tags: ['VIP', 'Active'] },
  { id: '2', name: 'Sarah Johnson', phone: '+1 234 567 8902', email: 'sarah@example.com', lastContact: '5 hours ago', tags: ['Active'] },
  { id: '3', name: 'Mike Wilson', phone: '+1 234 567 8903', email: 'mike@example.com', lastContact: '1 day ago', tags: ['New'] },
  { id: '4', name: 'Emily Davis', phone: '+1 234 567 8904', email: 'emily@example.com', lastContact: '2 days ago', tags: ['VIP'] },
  { id: '5', name: 'Robert Brown', phone: '+1 234 567 8905', email: 'robert@example.com', lastContact: '3 days ago', tags: ['Active'] },
  { id: '6', name: 'Lisa Anderson', phone: '+1 234 567 8906', email: 'lisa@example.com', lastContact: '4 days ago', tags: ['New'] },
  { id: '7', name: 'David Martinez', phone: '+1 234 567 8907', email: 'david@example.com', lastContact: '5 days ago', tags: ['VIP', 'Active'] },
  { id: '8', name: 'Jennifer Taylor', phone: '+1 234 567 8908', email: 'jennifer@example.com', lastContact: '1 week ago', tags: ['Active'] },
];

export function Contacts() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your WhatsApp contacts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            <UserPlus className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3,421</div>
            <p className="text-sm text-gray-500 mt-1">+234 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Contacts</CardTitle>
            <UserPlus className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2,847</div>
            <p className="text-sm text-gray-500 mt-1">83% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">VIP Contacts</CardTitle>
            <UserPlus className="w-5 h-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">284</div>
            <p className="text-sm text-gray-500 mt-1">Top tier users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Contacts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Contact</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell className="text-gray-500">{contact.lastContact}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {contact.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tag === 'VIP'
                              ? 'bg-amber-50 text-amber-700'
                              : tag === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
