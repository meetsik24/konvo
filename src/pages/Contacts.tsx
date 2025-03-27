import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Trash2, Edit2, Search, UserPlus, FolderPlus, Download, X } from 'lucide-react';
import Papa from 'papaparse';
import { useWorkspace } from './WorkspaceContext';
import {
  createContact,
  updateContact,
  deleteContact,
  getWorkspaceGroups,
  createGroup,
  deleteGroup,
  addContactsToGroup,
  getContacts,
  getGroupContacts,
} from '../services/api';
import DataTable, { TableColumn } from 'react-data-table-component';
import styled from 'styled-components';

// Styled DataTable to filter out invalid props
const StyledDataTable = styled(DataTable).withConfig({
  shouldForwardProp: (prop) => !['allowOverflow', 'button'].includes(prop),
})``;

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 sm:p-4 text-red-500 bg-red-50 rounded">
          <h2 className="text-base sm:text-lg font-semibold">Something went wrong.</h2>
          <p className="text-sm sm:text-base">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-1 sm:mt-2 btn btn-primary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Contact {
  contact_id: string;
  name: string;
  phone_number: string;
  email: string;
  workspace_id: string;
  created_at: string;
  group_ids?: string[];
}

interface Group {
  group_id: string;
  name: string;
  workspace_id: string;
  created_at?: string;
  count?: number;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Partial<Contact>) => void;
  contact: Partial<Contact>;
  setContact: (contact: Partial<Contact>) => void;
  groups: Group[];
  title: string;
  isEdit: boolean;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
  setContact,
  groups,
  title,
  isEdit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
              value={contact.name || ''}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
              value={contact.phone_number || ''}
              onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Email (Optional)</label>
            <input
              type="email"
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
              value={contact.email || ''}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Assign to Groups</label>
            <select
              multiple
              className="input w-full min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
              value={contact.group_ids || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
                setContact({ ...contact, group_ids: selectedOptions });
              }}
            >
              {groups
                .filter((group) => group.group_id && group.group_id !== 'all')
                .map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button onClick={onClose} className="btn btn-secondary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(contact)}
              className="btn btn-primary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
            >
              {title}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupId: string, file: File) => void;
  groups: Group[];
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit, groups }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (fileInputRef.current?.files?.[0]) {
      onSubmit(selectedGroup, fileInputRef.current.files[0]);
      onClose();
    } else {
      setError('Please select a CSV file to import.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">Import CSV</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Select Group</label>
            <select
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="all">All Contacts</option>
              {groups
                .filter((group) => group.group_id && group.group_id !== 'all')
                .map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Upload CSV File</label>
            <input
              type="file"
              ref={fileInputRef}
              className="input w-full text-xs sm:text-sm"
              accept=".csv"
              onChange={() => setError(null)}
            />
          </div>
          {error && <div className="text-red-500 text-xs sm:text-sm">{error}</div>}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button onClick={onClose} className="btn btn-secondary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
            >
              Import
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
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    phone_number: '',
    email: '',
    workspace_id: '',
    group_ids: [],
  });
  const [editContact, setEditContact] = useState<Partial<Contact>>({
    name: '',
    phone_number: '',
    email: '',
    workspace_id: '',
    group_ids: [],
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string) => {
      const perPage = 50; // Default perPage from API
      let allContacts: Contact[] = [];
      let totalPages = 1;
      let totalCount = 0;

      try {
        // Fetch the first page to get total_count and total_pages
        const firstResponse = groupId
          ? await getGroupContacts(workspaceId, groupId, 1, perPage)
          : await getContacts(workspaceId, 1, perPage);
        allContacts = firstResponse.contacts || [];
        totalCount = firstResponse.total_count || 0;
        totalPages = firstResponse.total_pages || 1;

        console.log(`Total contacts: ${totalCount}, Total pages: ${totalPages}`);

        if (totalPages > 1) {
          // Fetch remaining pages concurrently
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) => {
            const page = i + 2; // Start from page 2
            return groupId
              ? getGroupContacts(workspaceId, groupId, page, perPage)
              : getContacts(workspaceId, page, perPage);
          });

          const responses = await Promise.all(pageRequests);
          const additionalContacts = responses.flatMap((res) => res.contacts || []);
          allContacts = [...allContacts, ...additionalContacts];
        }

        return allContacts;
      } catch (error: any) {
        throw new Error(`Failed to fetch all contacts: ${error.message}`);
      }
    },
    []
  );

  const fetchContactsAndGroups = useCallback(async () => {
    if (!currentWorkspaceId) {
      console.error('No workspace selected. currentWorkspaceId is:', currentWorkspaceId);
      setError('No workspace selected.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching contacts for workspace:', currentWorkspaceId, 'and group:', selectedGroup);

      // Fetch all contacts
      const contactsData = selectedGroup === 'all'
        ? await fetchAllContacts(currentWorkspaceId)
        : await fetchAllContacts(currentWorkspaceId, selectedGroup);
      console.log('Fetched contacts:', contactsData.length);

      // Fetch all groups
      const groupsResponse = await getWorkspaceGroups(currentWorkspaceId);
      const groupsData = Array.isArray(groupsResponse) ? groupsResponse : groupsResponse?.data || [];
      console.log('Fetched groups:', groupsData);

      // Build a mapping of contacts to their groups
      const contactToGroupsMap: { [contactId: string]: string[] } = {};
      contactsData.forEach((contact) => {
        contactToGroupsMap[contact.contact_id] = [];
      });

      // Fetch group contacts to map contacts to groups
      const groupContactsPromises = groupsData.map(async (group) => {
        try {
          const groupContacts = await fetchAllContacts(currentWorkspaceId, group.group_id);
          groupContacts.forEach((contact) => {
            if (contactToGroupsMap[contact.contact_id]) {
              contactToGroupsMap[contact.contact_id].push(group.group_id);
            }
          });
          return { ...group, count: groupContacts.length };
        } catch (err) {
          console.warn(`Failed to fetch contacts for group ${group.group_id}:`, err);
          return { ...group, count: 0 };
        }
      });

      const updatedGroups = await Promise.all(groupContactsPromises);

      // Update contacts with their group_ids
      const updatedContacts = contactsData.map((contact) => ({
        ...contact,
        group_ids: contactToGroupsMap[contact.contact_id] || [],
      }));

      const allGroup = {
        group_id: 'all',
        name: 'All Contacts',
        workspace_id: currentWorkspaceId,
        created_at: '',
        count: contactsData.length,
      };

      setContacts(updatedContacts);
      setGroups([allGroup, ...updatedGroups]);
      setError(null);
    } catch (error: any) {
      console.error('Fetch error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, selectedGroup, fetchAllContacts]);

  useEffect(() => {
    fetchContactsAndGroups();
  }, [fetchContactsAndGroups]);

  const handleAddContact = useCallback(
    async (contact: Partial<Contact>) => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      const { name, phone_number, email, group_ids } = contact;
      const trimmedName = name?.trim() || '';
      const trimmedPhone = phone_number?.trim() || '';
      const trimmedEmail = email?.trim() || '';

      if (!trimmedName || !trimmedPhone) {
        setError('Name and phone number are required.');
        return;
      }

      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      try {
        const contactPayload = {
          name: trimmedName,
          phone_number: trimmedPhone,
          email: trimmedEmail || '',
          workspace_id: currentWorkspaceId,
        };
        const createdContact = await createContact(contactPayload);

        if (group_ids && group_ids.length > 0) {
          const groupsToAdd = group_ids.filter((groupId) => groupId !== 'all');
          await Promise.all(
            groupsToAdd.map(async (groupId) => {
              await addContactsToGroup(groupId, [createdContact.contact_id]);
            })
          );
        }

        await fetchContactsAndGroups();
        setShowAddContact(false);
        setNewContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
        setError(null);
      } catch (error: any) {
        console.error('Error adding contact:', error);
        setError(error.message || 'Failed to add contact.');
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups]
  );

  const handleUpdateContact = useCallback(
    async (contact: Partial<Contact>) => {
      if (!currentWorkspaceId || !contact.contact_id) {
        setError('No workspace or contact selected.');
        return;
      }

      const { contact_id, name, phone_number, email, group_ids } = contact;
      const trimmedName = name?.trim() || '';
      const trimmedPhone = phone_number?.trim() || '';
      const trimmedEmail = email?.trim() || '';

      if (!trimmedName || !trimmedPhone) {
        setError('Name and phone number are required.');
        return;
      }

      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setError('Please enter a valid email address.');
        return;
      }

      try {
        await updateContact(contact_id, {
          name: trimmedName,
          phone_number: trimmedPhone,
          email: trimmedEmail || '',
          workspace_id: currentWorkspaceId,
        });

        if (group_ids) {
          const contactToGroupsMap: { [contactId: string]: string[] } = { [contact_id]: [] };
          const groupsData = groups.filter((g) => g.group_id !== 'all');
          await Promise.all(
            groupsData.map(async (group) => {
              const groupContacts = await fetchAllContacts(currentWorkspaceId, group.group_id);
              if (groupContacts.some((c) => c.contact_id === contact_id)) {
                contactToGroupsMap[contact_id].push(group.group_id);
              }
            })
          );
          const currentGroupIds = contactToGroupsMap[contact_id];
          const groupsToAdd = group_ids.filter(
            (groupId) => !currentGroupIds.includes(groupId) && groupId !== 'all'
          );

          await Promise.all(
            groupsToAdd.map(async (groupId) => {
              await addContactsToGroup(groupId, [contact_id]);
            })
          );
        }

        await fetchContactsAndGroups();
        setShowEditContact(false);
        setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
        setError(null);
      } catch (error: any) {
        console.error('Error updating contact:', error);
        setError(error.message || 'Failed to update contact.');
      }
    },
    [currentWorkspaceId, groups, fetchContactsAndGroups, fetchAllContacts]
  );

  const handleDeleteContact = useCallback(
    async (contactId: string) => {
      if (!contactId) {
        setError('Contact ID is undefined. Cannot delete.');
        console.error('Attempted to delete contact with undefined ID');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this contact?')) return;

      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      try {
        await deleteContact(contactId);
        await fetchContactsAndGroups();
        setError(null);
      } catch (error: any) {
        console.error('Error deleting contact:', error);
        setError(error.message || 'Failed to delete contact.');
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups]
  );

  const handleAddGroup = useCallback(
    async () => {
      if (!currentWorkspaceId || !newGroupName.trim()) {
        setError('Group name is required.');
        return;
      }

      try {
        const groupPayload = {
          name: newGroupName.trim(),
          workspace_id: currentWorkspaceId,
        };
        const createdGroup = await createGroup(groupPayload);
        setGroups((prev) => [
          ...prev,
          { ...createdGroup, count: 0, created_at: new Date().toISOString() },
        ]);
        setShowAddGroup(false);
        setNewGroupName('');
        await fetchContactsAndGroups();
        setError(null);
      } catch (error: any) {
        console.error('Error adding group:', error);
        setError(error.message || 'Failed to add group.');
      }
    },
    [currentWorkspaceId, newGroupName, fetchContactsAndGroups]
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      if (groupId === 'all' || !window.confirm('Are you sure you want to delete this group?')) return;

      try {
        await deleteGroup(groupId);
        setGroups((prev) => prev.filter((g) => g.group_id !== groupId));
        if (selectedGroup === groupId) setSelectedGroup('all');
        await fetchContactsAndGroups();
        setError(null);
      } catch (error: any) {
        console.error('Error deleting group:', error);
        setError(error.message || 'Failed to delete group.');
      }
    },
    [selectedGroup, fetchContactsAndGroups]
  );

  const handleImportSubmit = useCallback(
    async (groupId: string, file: File) => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const validContacts = results.data
            .filter((row: any) => row.name && row.phone)
            .map((row: any) => ({
              name: row.name.toString(),
              phone_number: row.phone.toString(),
              email: row.email ? row.email.toString() : '',
              workspace_id: currentWorkspaceId,
            }));

          if (validContacts.length === 0) {
            setError('No valid contacts found in the CSV file.');
            return;
          }

          try {
            const createdContacts = await Promise.all(
              validContacts.map((contact) => createContact(contact))
            );

            if (groupId !== 'all') {
              console.log('Assigning contacts to group:', groupId, createdContacts.map((c) => c.contact_id));
              await addContactsToGroup(
                groupId,
                createdContacts.map((c) => c.contact_id)
              );
            }

            await fetchContactsAndGroups();
            setError(null);
            setSelectedGroup(groupId);
          } catch (error: any) {
            console.error('Error importing contacts:', error);
            setError(error.message || 'Failed to import some contacts.');
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setError('Failed to parse the CSV file.');
        },
      });
    },
    [currentWorkspaceId, fetchContactsAndGroups]
  );

  const downloadTemplate = useCallback(() => {
    const csv = Papa.unparse([{ name: '', phone: '', email: '' }]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const columns: TableColumn<Contact>[] = [
    {
      name: 'Name',
      selector: (row: Contact) => row.name,
      sortable: true,
    },
    {
      name: 'Phone',
      selector: (row: Contact) => row.phone_number,
      sortable: true,
    },
    {
      name: 'Email',
      selector: (row: Contact) => row.email || 'N/A',
      sortable: true,
      omit: window.innerWidth < 640, // Hide on mobile
    },
    {
      name: 'Groups',
      selector: (row: Contact) => {
        const groupNames = (row.group_ids || [])
          .map((groupId) => groups.find((g) => g.group_id === groupId)?.name)
          .filter(Boolean)
          .join(', ');
        return groupNames || 'None';
      },
      sortable: false,
      omit: window.innerWidth < 640, // Hide on mobile
    },
    {
      name: 'Actions',
      cell: (row: Contact) => (
        <div className="flex justify-end gap-1 sm:gap-2">
          <button
            onClick={() => {
              console.log('Editing contact:', row);
              setEditContact({
                contact_id: row.contact_id,
                name: row.name,
                phone_number: row.phone_number,
                email: row.email,
                workspace_id: row.workspace_id,
                group_ids: row.group_ids || [],
              });
              setShowEditContact(true);
            }}
            className="btn btn-icon btn-ghost text-gray-600 hover:text-primary-500"
          >
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => {
              console.log('Deleting contact:', row);
              handleDeleteContact(row.contact_id);
            }}
            className="btn btn-icon btn-ghost text-gray-600 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contacts, searchQuery]);

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Contacts</h1>
        </div>

        {error && (
          <div className="text-red-500 mb-3 sm:mb-4 p-2 sm:p-3 rounded bg-red-50 text-xs sm:text-sm">
            {typeof error === 'string' ? error : 'An unexpected error occurred.'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Groups</h2>
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="btn btn-icon btn-ghost hover:bg-gray-100 rounded-full p-1 sm:p-2"
                >
                  <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                </button>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {groups.map((group) => (
                  <div key={group.group_id} className="flex justify-between items-center group">
                    <button
                      onClick={() => setSelectedGroup(group.group_id)}
                      className={`w-full text-left px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex justify-between items-center transition-colors text-xs sm:text-sm ${
                        selectedGroup === group.group_id
                          ? 'bg-primary-50 text-primary-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{group.name}</span>
                      <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2">
                        {group.count}
                      </span>
                    </button>
                    {group.group_id !== 'all' && (
                      <button
                        onClick={() => handleDeleteGroup(group.group_id)}
                        className="btn btn-icon btn-ghost text-red-500 hover:text-red-700 ml-1 sm:ml-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setNewContact({
                        name: '',
                        phone_number: '',
                        email: '',
                        workspace_id: currentWorkspaceId || '',
                        group_ids: [],
                      });
                      setShowAddContact(true);
                    }}
                    className="btn btn-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn btn-secondary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Import CSV
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="btn btn-ghost flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    Template
                  </button>
                </div>
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="input pl-8 sm:pl-10 w-full text-xs sm:text-sm py-2 sm:py-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <StyledDataTable
                columns={columns}
                data={filteredContacts}
                pagination
                paginationPerPage={25}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                paginationComponentOptions={{
                  rowsPerPageText: 'Contacts per page:',
                  rangeSeparatorText: 'of',
                }}
                progressPending={isLoading}
                progressComponent={
                  <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                    Loading contacts...
                  </div>
                }
                noDataComponent={
                  <div className="p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm">
                    No contacts found.
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: '#f9fafb',
                      fontWeight: '600',
                      padding: '8px 12px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                    },
                  },
                  cells: {
                    style: {
                      padding: '8px 12px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                    },
                  },
                  table: {
                    style: {
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      overflow: 'auto',
                    },
                  },
                  pagination: {
                    style: {
                      borderTop: '1px solid #e5e7eb',
                      padding: '8px 10px',
                      fontSize: window.innerWidth < 640 ? '12px' : '14px',
                    },
                  },
                }}
                highlightOnHover
                striped
                responsive
              />
            </div>
          </div>
        </div>

        <ContactModal
          isOpen={showAddContact}
          onClose={() => {
            setShowAddContact(false);
            setNewContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
            setError(null);
          }}
          onSubmit={handleAddContact}
          contact={newContact}
          setContact={setNewContact}
          groups={groups}
          title="Add Contact"
          isEdit={false}
        />

        <ContactModal
          isOpen={showEditContact}
          onClose={() => {
            setShowEditContact(false);
            setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
            setError(null);
          }}
          onSubmit={handleUpdateContact}
          contact={editContact}
          setContact={setEditContact}
          groups={groups}
          title="Edit Contact"
          isEdit={true}
        />

        {showAddGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Add Group</h2>
                <button
                  onClick={() => {
                    setShowAddGroup(false);
                    setNewGroupName('');
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Group Name</label>
                  <input
                    type="text"
                    className="input w-full text-xs sm:text-sm py-2 sm:py-3"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setShowAddGroup(false);
                      setNewGroupName('');
                      setError(null);
                    }}
                    className="btn btn-secondary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    className="btn btn-primary text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3"
                  >
                    Add Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setError(null);
          }}
          onSubmit={handleImportSubmit}
          groups={groups}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Contacts;