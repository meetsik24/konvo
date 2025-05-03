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
        <div className="p-3 sm:p-4 text-red-400 bg-red-50 rounded">
          <h2 className="text-base sm:text-lg font-semibold">Something went wrong.</h2>
          <p className="text-sm sm:text-base">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-1 sm:mt-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
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

// Generic Modal Props for reusability
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
}

// Generic Modal Component to reduce redundancy
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#00333e]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {children}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              {cancelText}
            </button>
            {onSubmit && (
              <button
                onClick={onSubmit}
                className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
              >
                {submitText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Partial<Contact>) => void;
  contact: Partial<Contact>;
  setContact: (contact: Partial<Contact>) => void;
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
  title,
}) => {
  const handleSubmit = () => onSubmit(contact);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} onSubmit={handleSubmit} submitText={title}>
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Name</label>
        <input
          type="text"
          className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.name || ''}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Phone Number</label>
        <input
          type="tel"
          className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.phone_number || ''}
          onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Email (Optional)</label>
        <input
          type="email"
          className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.email || ''}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Assign to Groups</label>
        <select
          multiple
          className="w-full min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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
    </Modal>
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

  const handleSubmit = () => {
    if (fileInputRef.current?.files?.[0]) {
      onSubmit(selectedGroup, fileInputRef.current.files[0]);
      onClose();
    } else {
      setError('Please select a CSV file to import.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import CSV" onSubmit={handleSubmit} submitText="Import">
      <div>
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Select Group</label>
        <select
          className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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
        <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Upload CSV File</label>
        <input
          type="file"
          ref={fileInputRef}
          className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          accept=".csv"
          onChange={() => setError(null)}
        />
      </div>
      {error && <div className="text-red-400 text-xs sm:text-sm">{error}</div>}
    </Modal>
  );
};

const Contacts: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [modalState, setModalState] = useState({
    showAddContact: false,
    showEditContact: false,
    showAddGroup: false,
    showImportModal: false,
  });
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

  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string) => {
      const perPage = 50;
      let allContacts: Contact[] = [];
      let totalPages = 1;

      try {
        const firstResponse = groupId
          ? await getGroupContacts(workspaceId, groupId, 1, perPage)
          : await getContacts(workspaceId, 1, perPage);
        allContacts = firstResponse.contacts || [];
        totalPages = firstResponse.total_pages || 1;

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) =>
            groupId
              ? getGroupContacts(workspaceId, groupId, i + 2, perPage)
              : getContacts(workspaceId, i + 2, perPage)
          );
          const responses = await Promise.all(pageRequests);
          allContacts = [...allContacts, ...responses.flatMap((res) => res.contacts || [])];
        }
        return allContacts;
      } catch (error: any) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
    },
    []
  );

  const fetchContactsAndGroups = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    setIsLoading(true);
    try {
      const contactsData = selectedGroup === 'all'
        ? await fetchAllContacts(currentWorkspaceId)
        : await fetchAllContacts(currentWorkspaceId, selectedGroup);

      const groupsResponse = await getWorkspaceGroups(currentWorkspaceId);
      const groupsData = Array.isArray(groupsResponse) ? groupsResponse : groupsResponse?.data || [];

      const contactToGroupsMap: { [contactId: string]: string[] } = {};
      contactsData.forEach((contact) => {
        contactToGroupsMap[contact.contact_id] = [];
      });

      const groupContactsPromises = groupsData.map(async (group) => {
        const groupContacts = await fetchAllContacts(currentWorkspaceId, group.group_id);
        groupContacts.forEach((contact) => {
          if (contactToGroupsMap[contact.contact_id]) {
            contactToGroupsMap[contact.contact_id].push(group.group_id);
          }
        });
        return { ...group, count: groupContacts.length };
      });

      const updatedGroups = await Promise.all(groupContactsPromises);
      const updatedContacts = contactsData.map((contact) => ({
        ...contact,
        group_ids: contactToGroupsMap[contact.contact_id] || [],
      }));

      const allGroup = {
        group_id: 'all',
        name: 'All Contacts',
        workspace_id: currentWorkspaceId,
        count: contactsData.length,
      };

      setContacts(updatedContacts);
      setGroups([allGroup, ...updatedGroups]);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, selectedGroup, fetchAllContacts]);

  useEffect(() => {
    fetchContactsAndGroups();
  }, [fetchContactsAndGroups]);

  const validateContact = (contact: Partial<Contact>): string | null => {
    const { name, phone_number, email } = contact;
    const trimmedName = name?.trim() || '';
    const trimmedPhone = phone_number?.trim() || '';
    const trimmedEmail = email?.trim() || '';

    if (!trimmedName || !trimmedPhone) return 'Name and phone number are required.';
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return 'Please enter a valid email address.';
    return null;
  };

  const handleAddContact = useCallback(
    async (contact: Partial<Contact>) => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      const validationError = validateContact(contact);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const contactPayload = {
          name: contact.name!.trim(),
          phone_number: contact.phone_number!.trim(),
          email: contact.email?.trim() || '',
          workspace_id: currentWorkspaceId,
        };
        const createdContact = await createContact(contactPayload);

        if (contact.group_ids?.length) {
          const groupsToAdd = contact.group_ids.filter((groupId) => groupId !== 'all');
          await Promise.all(
            groupsToAdd.map((groupId) => addContactsToGroup(groupId, [createdContact.contact_id]))
          );
        }

        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showAddContact: false }));
        setNewContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
        setError(null);
      } catch (error: any) {
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

      const validationError = validateContact(contact);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        await updateContact(contact.contact_id, {
          name: contact.name!.trim(),
          phone_number: contact.phone_number!.trim(),
          email: contact.email?.trim() || '',
          workspace_id: currentWorkspaceId,
        });

        if (contact.group_ids) {
          const contactToGroupsMap: { [contactId: string]: string[] } = { [contact.contact_id]: [] };
          const groupsData = groups.filter((g) => g.group_id !== 'all');
          await Promise.all(
            groupsData.map(async (group) => {
              const groupContacts = await fetchAllContacts(currentWorkspaceId, group.group_id);
              if (groupContacts.some((c) => c.contact_id === contact.contact_id)) {
                contactToGroupsMap[contact.contact_id].push(group.group_id);
              }
            })
          );
          const currentGroupIds = contactToGroupsMap[contact.contact_id];
          const groupsToAdd = contact.group_ids.filter(
            (groupId) => !currentGroupIds.includes(groupId) && groupId !== 'all'
          );

          await Promise.all(
            groupsToAdd.map((groupId) => addContactsToGroup(groupId, [contact.contact_id]))
          );
        }

        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showEditContact: false }));
        setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
        setError(null);
      } catch (error: any) {
        setError(error.message || 'Failed to update contact.');
      }
    },
    [currentWorkspaceId, groups, fetchContactsAndGroups, fetchAllContacts]
  );

  const handleDeleteContact = useCallback(
    async (contactId: string) => {
      if (!contactId || !window.confirm('Are you sure you want to delete this contact?')) return;
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      try {
        await deleteContact(contactId);
        await fetchContactsAndGroups();
        setError(null);
      } catch (error: any) {
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
        await createGroup(groupPayload);
        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showAddGroup: false }));
        setNewGroupName('');
        setError(null);
      } catch (error: any) {
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
            .filter((row: any) => row.name && row.phone_number)
            .map((row: any) => ({
              name: row.name.toString(),
              phone_number: row.phone_number.toString(),
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
              await addContactsToGroup(groupId, createdContacts.map((c) => c.contact_id));
            }

            await fetchContactsAndGroups();
            setError(null);
            setSelectedGroup(groupId);
          } catch (error: any) {
            setError(error.message || 'Failed to import some contacts.');
          }
        },
        error: () => {
          setError('Failed to parse the CSV file.');
        },
      });
    },
    [currentWorkspaceId, fetchContactsAndGroups]
  );

  const downloadTemplate = useCallback(() => {
    const csv = Papa.unparse([{ name: '', phone_number: '', email: '' }]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const columns: TableColumn<Contact>[] = useMemo(
    () => [
      { name: 'Name', selector: (row) => row.name, sortable: true },
      { name: 'Phone', selector: (row) => row.phone_number, sortable: true },
      {
        name: 'Email',
        selector: (row) => row.email || 'N/A',
        sortable: true,
        omit: window.innerWidth < 640,
      },
      {
        name: 'Groups',
        selector: (row) =>
          (row.group_ids || [])
            .map((groupId) => groups.find((g) => g.group_id === groupId)?.name)
            .filter(Boolean)
            .join(', ') || 'None',
        sortable: false,
        omit: window.innerWidth < 640,
      },
      {
        name: 'Actions',
        cell: (row: Contact) => (
          <div className="flex justify-end gap-1 sm:gap-2">
            <button
              onClick={() => {
                setEditContact({
                  contact_id: row.contact_id,
                  name: row.name,
                  phone_number: row.phone_number,
                  email: row.email,
                  workspace_id: row.workspace_id,
                  group_ids: row.group_ids || [],
                });
                setModalState((prev) => ({ ...prev, showEditContact: true }));
              }}
              className="p-2 rounded-full text-[#00333e] hover:bg-[#fddf0d] transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => handleDeleteContact(row.contact_id)}
              className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [groups, handleDeleteContact]
  );

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [contacts, searchQuery]);

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: '#f9fafb',
        fontWeight: '600',
        padding: '8px 12px',
        fontSize: window.innerWidth < 640 ? '12px' : '14px',
        color: '#00333e',
      },
    },
    cells: {
      style: {
        padding: '8px 12px',
        fontSize: window.innerWidth < 640 ? '12px' : '14px',
        color: '#374151',
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
        color: '#00333e',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#fddf0d',
          color: '#00333e',
        },
      },
      stripedStyle: {
        backgroundColor: '#f9fafb',
      },
    },
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 sm:space-y-6 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#00333e]" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#00333e]">Contacts</h1>
        </div>

        {error && (
          <div className="text-red-400 mb-3 sm:mb-4 p-2 sm:p-3 rounded bg-red-50 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-[#00333e]">Groups</h2>
                <button
                  onClick={() => setModalState((prev) => ({ ...prev, showAddGroup: true }))}
                  className="p-1 sm:p-2 rounded-full text-[#00333e] hover:bg-[#fddf0d] transition-colors duration-200"
                >
                  <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="space-y-1 sm:space-y-2">
                {groups.map((group) => (
                  <div key={group.group_id} className="flex justify-between items-center group">
                    <button
                      onClick={() => setSelectedGroup(group.group_id)}
                      className={`w-full text-left px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex justify-between items-center transition-colors text-xs sm:text-sm ${
                        selectedGroup === group.group_id
                          ? 'bg-[#fddf0d] text-[#00333e]'
                          : 'hover:bg-[#005a6e] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{group.name}</span>
                      <span className="text-xs sm:text-sm ml-1 sm:ml-2">{group.count}</span>
                    </button>
                    {group.group_id !== 'all' && (
                      <button
                        onClick={() => handleDeleteGroup(group.group_id)}
                        className="p-1 sm:p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200 ml-1 sm:ml-2"
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
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
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
                      setModalState((prev) => ({ ...prev, showAddContact: true }));
                    }}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
                  >
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setModalState((prev) => ({ ...prev, showImportModal: true }))}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Import CSV
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
                    className="w-full pl-8 sm:pl-10 text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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
                customStyles={customStyles}
                highlightOnHover
                striped
                responsive
              />
            </div>
          </div>
        </div>

        <ContactModal
          isOpen={modalState.showAddContact}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showAddContact: false }));
            setNewContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
            setError(null);
          }}
          onSubmit={handleAddContact}
          contact={newContact}
          setContact={setNewContact}
          groups={groups}
          title="Add Contact"
        />

        <ContactModal
          isOpen={modalState.showEditContact}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showEditContact: false }));
            setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
            setError(null);
          }}
          onSubmit={handleUpdateContact}
          contact={editContact}
          setContact={setEditContact}
          groups={groups}
          title="Edit Contact"
        />

        <Modal
          isOpen={modalState.showAddGroup}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showAddGroup: false }));
            setNewGroupName('');
            setError(null);
          }}
          title="Add Group"
          onSubmit={handleAddGroup}
          submitText="Add Group"
        >
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Group Name</label>
            <input
              type="text"
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </div>
        </Modal>

        <ImportModal
          isOpen={modalState.showImportModal}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showImportModal: false }));
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