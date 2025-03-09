import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Trash2, Edit2, Search, UserPlus, FolderPlus, Download, X } from 'lucide-react';
import Papa from 'papaparse';
import { useWorkspace } from './WorkspaceContext';
import {
  createContact,
  deleteContact,
  getWorkspaceGroups,
  createGroup,
  deleteGroup,
  addContactsToGroup,
  getContacts,
  getGroupContacts
} from '../services/api';

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  workspace_id: string;
  group_id: string;
}

interface Group {
  group_id: string;
  name: string;
  workspace_id: string;
  created_at: string;
  count?: number;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  contact: { name: string; phone_number: string; email: string; group_id: string };
  setContact: (contact: any) => void;
  groups: Group[];
  title: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
  setContact,
  groups,
  title
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input w-full"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="input w-full"
              value={contact.phone_number}
              onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Group</label>
            <select
              className="input w-full"
              value={contact.group_id}
              onChange={(e) => setContact({ ...contact, group_id: e.target.value })}
            >
              {groups.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={onSubmit} className="btn btn-primary">
              {title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contacts: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newContact, setNewContact] = useState({ name: '', phone_number: '', email: '', group_id: 'all' });
  const [newGroup, setNewGroup] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) =>
      (selectedGroup === 'all' || contact.group_id === selectedGroup) &&
      (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contact.phone_number.includes(searchQuery) ||
       contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contacts, selectedGroup, searchQuery]);

  const fetchContactsAndGroups = useCallback(async () => {
    if (!currentWorkspaceId) return;
    
    setIsLoading(true);
    try {
      const [contactsResponse, groupsResponse] = await Promise.all([
        getContacts(currentWorkspaceId),
        getWorkspaceGroups(currentWorkspaceId)
      ]);

      const updatedGroups = [
        { 
          group_id: 'all', 
          name: 'All Contacts', 
          workspace_id: currentWorkspaceId, 
          created_at: '', 
          count: contactsResponse.length 
        },
        ...groupsResponse.map((group: Group) => ({
          ...group,
          count: contactsResponse.filter((c: Contact) => c.group_id === group.group_id).length,
        })),
      ];

      setContacts(contactsResponse);
      setGroups(updatedGroups);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Unable to fetch contacts or groups');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    fetchContactsAndGroups();
  }, [fetchContactsAndGroups]);

  const handleAddContact = async () => {
    if (!currentWorkspaceId) return;

    const trimmedName = newContact.name.trim();
    const trimmedPhone = newContact.phone_number.trim();
    const trimmedEmail = newContact.email.trim();

    if (!trimmedName || !trimmedPhone || !trimmedEmail) {
      setError('All fields are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const contactPayload = {
        name: trimmedName,
        phone_number: trimmedPhone,
        email: trimmedEmail,
        workspace_id: currentWorkspaceId,
        group_id: newContact.group_id === 'all' ? undefined : newContact.group_id
      };

      const createdContact = await createContact(contactPayload);
      
      // Optimistic update
      setContacts(prev => [...prev, createdContact]);
      
      if (createdContact.group_id) {
        await addContactsToGroup(createdContact.group_id, [createdContact.id]);
      }

      await fetchContactsAndGroups();
      setShowAddContact(false);
      setNewContact({ name: '', phone_number: '', email: '', group_id: 'all' });
    } catch (error: any) {
      console.error('Error adding contact:', error);
      setError(error.response?.data?.detail || 'Failed to add contact');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      await deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      await fetchContactsAndGroups();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setError('Failed to delete contact');
    }
  };

  const handleAddGroup = async () => {
    if (!currentWorkspaceId || !newGroup.name.trim()) return;

    try {
      const groupPayload = { 
        name: newGroup.name.trim(), 
        workspace_id: currentWorkspaceId 
      };
      
      const createdGroup = await createGroup(groupPayload);
      setGroups(prev => [...prev, { ...createdGroup, count: 0 }]);
      setShowAddGroup(false);
      setNewGroup({ name: '' });
    } catch (error: any) {
      console.error('Error adding group:', error);
      setError(error.response?.data?.detail || 'Failed to add group');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (groupId === 'all' || !window.confirm('Are you sure?')) return;

    try {
      await deleteGroup(groupId);
      setGroups(prev => prev.filter(g => g.group_id !== groupId));
      await fetchContactsAndGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentWorkspaceId) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validContacts = results.data
          .filter((row: any) => row.name && row.phone && row.email)
          .map((row: any) => ({
            name: row.name.toString(),
            phone_number: row.phone.toString(),
            email: row.email.toString(),
            workspace_id: currentWorkspaceId,
            group_id: selectedGroup === 'all' ? undefined : selectedGroup
          }));

        try {
          const createdContacts = await Promise.all(
            validContacts.map(contact => createContact(contact))
          );

          if (selectedGroup !== 'all') {
            await addContactsToGroup(
              selectedGroup,
              createdContacts.map(c => c.id)
            );
          }

          setContacts(prev => [...prev, ...createdContacts]);
          await fetchContactsAndGroups();
        } catch (error: any) {
          console.error('Error importing contacts:', error);
          setError('Failed to import some contacts');
        }
      }
    });
  };

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
      </div>
      
      {error && <div className="text-red-500 mb-4 p-3 rounded bg-red-50">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Groups Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Groups</h2>
              <button 
                onClick={() => setShowAddGroup(true)}
                className="btn btn-icon btn-ghost hover:bg-gray-100 rounded-full p-2"
              >
                <FolderPlus className="w-5 h-5 text-primary-500" />
              </button>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.group_id} className="flex justify-between items-center group">
                  <button
                    onClick={() => setSelectedGroup(group.group_id)}
                    className={`w-full text-left px-4 py-2 rounded-lg flex justify-between items-center transition-colors ${
                      selectedGroup === group.group_id 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{group.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{group.count}</span>
                  </button>
                  {group.group_id !== 'all' && (
                    <button
                      onClick={() => handleDeleteGroup(group.group_id)}
                      className="btn btn-icon btn-ghost text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
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
                  className="btn btn-ghost flex items-center gap-2 text-gray-600"
                >
                  <Download className="w-5 h-5" />
                  Template
                </button>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="input pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Contacts Table */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Phone</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 border-t">
                      <td className="py-3 px-4">{contact.name}</td>
                      <td className="py-3 px-4">{contact.phone_number}</td>
                      <td className="py-3 px-4">{contact.email}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setNewContact({
                                name: contact.name,
                                phone_number: contact.phone_number,
                                email: contact.email,
                                group_id: contact.group_id
                              });
                              setShowAddContact(true);
                            }}
                            className="btn btn-icon btn-ghost text-gray-600 hover:text-primary-500"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="btn btn-icon btn-ghost text-gray-600 hover:text-red-500"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {isLoading && (
                <div className="p-4 text-center text-gray-500">Loading contacts...</div>
              )}
              {!isLoading && filteredContacts.length === 0 && (
                <div className="p-4 text-center text-gray-500">No contacts found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSubmit={handleAddContact}
        contact={newContact}
        setContact={setNewContact}
        groups={groups}
        title="Add Contact"
      />

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Group</h2>
              <button 
                onClick={() => setShowAddGroup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  className="input w-full"
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
                <button 
                  onClick={handleAddGroup}
                  className="btn btn-primary"
                >
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