import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Upload, Download, Search, Trash2, Edit2, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  createContact,
  updateContact,
  deleteContact,
  getWorkspaceGroups,
 
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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#00333e]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="text-sm py-1 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="text-sm py-1 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e]"
            >
              {submitText}
            </button>
          )}
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
    <Modal isOpen={isOpen} onClose={onClose} title={title} onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
          value={contact.name || ''}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
          value={contact.phone_number || ''}
          onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
        <input
          type="email"
          className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
          value={contact.email || ''}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Assign to Groups</label>
        <select
          multiple
          className="w-full min-h-[80px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
          value={contact.group_ids || []}
          onChange={(e) =>
            setContact({ ...contact, group_ids: Array.from(e.target.selectedOptions, (o) => o.value) })
          }
        >
          {groups.map((group) => (
            <option key={group.group_id} value={group.group_id}>
              {group.name || `Group ${group.group_id}`}
            </option>
          ))}
        </select>
      </div>
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [activeContacts, setActiveContacts] = useState(0);
  const [inactiveContacts, setInactiveContacts] = useState(0);
  const [perPage, setPerPage] = useState(10);

  const fetchAllContacts = useCallback(async (workspaceId: string, groupId?: string) => {
    const response = groupId
      ? await getGroupContacts(workspaceId, groupId, 1, perPage)
      : await getContacts(workspaceId, 1, perPage);
    return response.contacts || [];
  }, [perPage]);

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
      const groupsData = await getWorkspaceGroups(currentWorkspaceId);
      setContacts(contactsData);
      setGroups(groupsData);
      setTotalContacts(contactsData.length);
      setActiveContacts(contactsData.length); // Adjust logic based on your definition of active/inactive
      setInactiveContacts(0);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, selectedGroup, fetchAllContacts]);

  useEffect(() => {
    fetchContactsAndGroups();
  }, [fetchContactsAndGroups]);

  const handleAddContact = async (contact: Partial<Contact>) => {
    if (!currentWorkspaceId || !contact.name || !contact.phone_number) return;
    try {
      const createdContact = await createContact({
        name: contact.name.trim(),
        phone_number: contact.phone_number.trim(),
        email: contact.email?.trim() || '',
        workspace_id: currentWorkspaceId,
      });
      if (contact.group_ids?.length) {
        await addContactsToGroup(contact.group_ids[0], [createdContact.contact_id]);
      }
      await fetchContactsAndGroups();
      setModalState((prev) => ({ ...prev, showAddContact: false }));
      setNewContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
    } catch (error: any) {
      setError(error.message || 'Failed to add contact.');
    }
  };

  const handleUpdateContact = async (contact: Partial<Contact>) => {
    if (!currentWorkspaceId || !contact.contact_id) return;
    try {
      await updateContact(contact.contact_id, {
        name: contact.name!.trim(),
        phone_number: contact.phone_number!.trim(),
        email: contact.email?.trim() || '',
      });
      await fetchContactsAndGroups();
      setModalState((prev) => ({ ...prev, showEditContact: false }));
      setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
    } catch (error: any) {
      setError(error.message || 'Failed to update contact.');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!contactId || !window.confirm('Are you sure?')) return;
    try {
      await deleteContact(contactId);
      await fetchContactsAndGroups();
    } catch (error: any) {
      setError(error.message || 'Failed to delete contact.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0 || !window.confirm(`Delete ${selectedRows.length} contacts?`)) return;
    try {
      await Promise.all(selectedRows.map((row) => deleteContact(row.contact_id)));
      await fetchContactsAndGroups();
      setSelectedRows([]);
    } catch (error: any) {
      setError(error.message || 'Failed to delete contacts.');
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(
      (contact) =>
        contact.contact_id.includes(searchQuery) ||
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const columns: TableColumn<Contact>[] = [
    {
      name: '',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.some((selected) => selected.contact_id === row.contact_id)}
          onChange={() =>
            setSelectedRows((prev) =>
              prev.some((selected) => selected.contact_id === row.contact_id)
                ? prev.filter((selected) => selected.contact_id !== row.contact_id)
                : [...prev, row]
            )
          }
        />
      ),
      width: '40px',
    },
    { name: 'Contacts', selector: (row) => row.contact_id, sortable: true, minWidth: '150px' },
    {
      name: 'Updated At',
      selector: (row) => new Date(row.created_at).toDateString().split(' ').slice(1).join(' '),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: 'Status',
      cell: () => <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">Subscribe</span>,
      minWidth: '120px',
    },
    { name: 'First Name', selector: (row) => row.name.split(' ')[0] || '-', minWidth: '120px' },
    { name: 'Last Name', selector: (row) => row.name.split(' ').slice(1).join(' ') || '-', minWidth: '120px' },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="flex gap-1">
          <button className="text-blue-500 hover:text-blue-700"><MessageSquare className="w-5 h-5" /></button>
          <button className="text-green-500 hover:text-green-700"><Send className="w-5 h-5" /></button>
          <button className="text-purple-500 hover:text-purple-700" onClick={() => { setEditContact(row); setModalState((prev) => ({ ...prev, showEditContact: true })); }}><Edit2 className="w-5 h-5" /></button>
          <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteContact(row.contact_id)}><Trash2 className="w-5 h-5" /></button>
        </div>
      ),
      minWidth: '150px',
    },
  ];

  const customStyles = {
    headCells: { style: { backgroundColor: '#f9fafb', fontWeight: '600', padding: '12px', fontSize: '14px', color: '#6b7280', borderBottom: '2px solid #e5e7eb' } },
    cells: { style: { padding: '12px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb' } },
    table: { style: { border: '1px solid #e5e7eb', borderRadius: '8px', width: '100%' } },
    rows: { style: { '&:nth-child(odd)': { backgroundColor: '#f9fafb' } } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-4"
    >
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
        <div className="flex space-x-4">
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg bg-purple-500 text-white">Contacts</button>
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg hover:bg-gray-100">Settings</button>
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg hover:bg-gray-100">Message</button>
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg hover:bg-gray-100">Manage Fields</button>
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg hover:bg-gray-100">Keywords</button>
          <button className="text-sm font-medium text-gray-700 px-3 py-1 rounded-t-lg hover:bg-gray-100">Import History</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="bg-purple-500 text-white text-sm font-medium px-2 py-1 rounded-full">449</span>
          <span className="text-sm text-gray-700">Total</span>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">449 Active Contacts</span>
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full"><Users className="w-3 h-3" /></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">0 Inactive Contacts</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full"><X className="w-3 h-3" /></span>
        </div>
      </div>

      {/* Action Buttons and Search */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button className="text-sm font-medium text-white px-3 py-1 bg-purple-500 rounded-lg hover:bg-purple-600">Actions ▼</button>
          <button className="text-sm font-medium text-white px-3 py-1 bg-green-500 rounded-lg hover:bg-green-600"><UserPlus className="w-4 h-4" /> Add New</button>
          <button className="text-sm font-medium text-white px-3 py-1 bg-gray-400 rounded-lg hover:bg-gray-500"><Upload className="w-4 h-4" /> Import</button>
          <button className="text-sm font-medium text-white px-3 py-1 bg-cyan-500 rounded-lg hover:bg-cyan-600"><Download className="w-4 h-4" /> Export</button>
          <button className="text-sm font-medium text-white px-3 py-1 bg-purple-500 rounded-lg hover:bg-purple-600">Columns ▼</button>
        </div>
        <div className="flex space-x-2">
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="text-sm px-2 py-1 border border-gray-300 rounded-lg"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              className="text-sm pl-8 py-1 px-3 border border-gray-300 rounded-lg w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <StyledDataTable
          columns={columns}
          data={filteredContacts}
          pagination
          paginationPerPage={perPage}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          progressPending={isLoading}
          progressComponent={<div className="p-4 text-center text-gray-500">Loading...</div>}
          noDataComponent={<div className="p-4 text-center text-gray-500">No contacts found.</div>}
          customStyles={customStyles}
          highlightOnHover
          striped
          responsive
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 bg-red-50 p-2 rounded-lg">{error}</div>}

      {/* Modals */}
      <ContactModal
        isOpen={modalState.showAddContact}
        onClose={() => setModalState((prev) => ({ ...prev, showAddContact: false }))}
        onSubmit={handleAddContact}
        contact={newContact}
        setContact={setNewContact}
        groups={groups}
        title="Add Contact"
      />
      <ContactModal
        isOpen={modalState.showEditContact}
        onClose={() => setModalState((prev) => ({ ...prev, showEditContact: false }))}
        onSubmit={handleUpdateContact}
        contact={editContact}
        setContact={setEditContact}
        groups={groups}
        title="Edit Contact"
      />
    </motion.div>
  );
};

export default Contacts;