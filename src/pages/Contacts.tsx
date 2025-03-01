import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Plus, Upload, Trash2, Edit2, Search, 
  UserPlus, FolderPlus, Download, X 
} from 'lucide-react';
import Papa from 'papaparse';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  groupId: string;
}

interface Group {
  id: string;
  name: string;
  count: number;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([
    { id: 'all', name: 'All Contacts', count: 0 },
  ]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    groupId: 'all'
  });

  const [newGroup, setNewGroup] = useState({
    name: ''
  });

  const handleAddContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact
    };
    setContacts([...contacts, contact]);
    setShowAddContact(false);
    setNewContact({ name: '', phone: '', email: '', groupId: 'all' });
  };

  const handleAddGroup = () => {
    const group: Group = {
      id: Date.now().toString(),
      name: newGroup.name,
      count: 0
    };
    setGroups([...groups, group]);
    setShowAddGroup(false);
    setNewGroup({ name: '' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const newContacts = results.data.map((row: any) => ({
          id: Date.now().toString() + Math.random(),
          name: row.name || '',
          phone: row.phone || '',
          email: row.email || '',
          groupId: selectedGroup
        }));
        setContacts([...contacts, ...newContacts]);
      }
    });
  };

  const filteredContacts = contacts.filter(contact => 
    (selectedGroup === 'all' || contact.groupId === selectedGroup) &&
    (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     contact.phone.includes(searchQuery) ||
     contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const downloadTemplate = () => {
    const csv = Papa.unparse([{ name: '', phone: '', email: '' }]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 p-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Groups</h2>
              <button
                onClick={() => setShowAddGroup(true)}
                className="btn btn-icon btn-ghost"
              >
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex justify-between items-center ${
                    selectedGroup === group.id ? 'bg-primary-50 text-primary-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{group.name}</span>
                  <span className="text-sm text-gray-500">{group.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddContact(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Contact
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Import CSV
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <button
                  onClick={downloadTemplate}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Template
                </button>
              </div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b">
                      <td className="py-3 px-4">{contact.name}</td>
                      <td className="py-3 px-4">{contact.phone}</td>
                      <td className="py-3 px-4">{contact.email}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="btn btn-icon btn-ghost">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="btn btn-icon btn-ghost text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Contact</h2>
              <button onClick={() => setShowAddContact(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="input"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <select
                  className="input"
                  value={newContact.groupId}
                  onChange={(e) => setNewContact({ ...newContact, groupId: e.target.value })}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleAddContact} className="btn btn-primary">
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Group</h2>
              <button onClick={() => setShowAddGroup(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  className="input"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddGroup(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleAddGroup} className="btn btn-primary">
                  Add Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Contacts;
