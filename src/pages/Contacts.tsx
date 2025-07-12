import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Upload, Trash2, Edit2, Search, UserPlus, Download, X, ArrowLeft, Plus, CheckCircle, Folder } from 'lucide-react';
import Papa from 'papaparse';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
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
  bulkUploadContacts,
} from '../services/api';
import DataTable, { TableColumn } from 'react-data-table-component';
import styled from 'styled-components';

const StyledDataTable = styled(DataTable).withConfig({
  shouldForwardProp: (prop) => !['allowOverflow', 'button'].includes(prop),
})``;

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        <h2 className="text-lg font-semibold">Something went wrong.</h2>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
        >
          Try Again
        </button>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (err: any) {
    setError(err.message || 'An unexpected error occurred.');
    return null;
  }
};

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
  count?: number;
}

interface UploadedContact {
  [key: string]: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total_count: number;
  total_pages: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

interface ContactModalProps extends Omit<ModalProps, 'children' | 'onSubmit'> {
  onSubmit: (contact: Partial<Contact>) => void;
  contact: Partial<Contact>;
  setContact: (contact: Partial<Contact>) => void;
  groups: Group[];
  isLoading?: boolean;
}

interface ImportModalProps extends Omit<ModalProps, 'children' | 'onSubmit'> {
  onSubmit: (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => void;
  groups: Group[];
  defaultGroupId?: string;
  isLoading?: boolean;
  onCreateGroup: (name: string, callback: (groupId: string) => void) => Promise<void>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  showBackButton = false,
  onBack,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#00333e]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-4">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contact,
  setContact,
  groups,
  title,
  isLoading = false,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const validateInput = () => {
    if (!contact.name?.trim()) return 'Name is required.';
    if (!contact.phone_number?.trim()) return 'Phone number is required.';
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim()))
      return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = () => {
    const error = validateInput();
    if (error) {
      setLocalError(error);
      return;
    }
    setLocalError(null);
    onSubmit(contact);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleSubmit}
      submitText={title.includes('Add') ? 'Add Contact' : 'Update Contact'}
    >
      {localError && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md text-sm">
          <p className="font-semibold">Error:</p>
          <p>{localError}</p>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#00333e]">Name</label>
          <input
            type="text"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={contact.name || ''}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#00333e]">Phone Number</label>
          <input
            type="tel"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={contact.phone_number || ''}
            onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#00333e]">Email (Optional)</label>
          <input
            type="email"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={contact.email || ''}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-[#00333e]">Assign to Groups</label>
          <select
            multiple
            className="w-full min-h-[100px] text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={contact.group_ids || []}
            onChange={(e) =>
              setContact({ ...contact, group_ids: Array.from(e.target.selectedOptions, (option) => option.value) })
            }
            disabled={isLoading || !groups.length}
          >
            {groups
              .filter((group) => group.group_id !== 'all')
              .map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.name || `Group ${group.group_id}`}
                </option>
              ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  groups,
  defaultGroupId,
  isLoading = false,
  onCreateGroup,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroupId || 'all');
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [previewData, setPreviewData] = useState<UploadedContact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentWorkspaceId } = useWorkspace();
  const MAX_FILE_SIZE_MB = 10;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    const fileType = uploadedFile.type;
    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (
      fileType === 'text/csv' ||
      fileExtension === 'csv' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = Papa.parse(text, { header: true, preview: 5, skipEmptyLines: true });
          const headers = parsed.meta.fields as string[] | undefined;
          if (!headers || !headers.includes('name') || !headers.includes('phone_number')) {
            setError('CSV file must contain "name" and "phone_number" columns.');
            return;
          }

          const invalidContacts: string[] = [];
          const formattedData = parsed.data
            .map((row: any, index: number) => {
              const name = row.name?.toString().trim() || '';
              let phone_number = row.phone_number?.toString().trim() || '';
              const email = row.email?.toString().trim() || '';

              if (!name) {
                invalidContacts.push(`Row ${index + 1}: Missing name`);
                return null;
              }

              const parsedPhone = parsePhoneNumberFromString(phone_number, 'TZ') || parsePhoneNumberFromString(phone_number, 'US');
              if (!parsedPhone || !parsedPhone.isValid()) {
                invalidContacts.push(`Row ${index + 1}: Invalid phone number (${phone_number})`);
                return null;
              }
              phone_number = parsedPhone.format('E.164');

              return { name, phone_number, email };
            })
            .filter((row): row is UploadedContact => row !== null);

          if (formattedData.length === 0) {
            setError(`No valid contacts found. Errors: ${invalidContacts.join('; ')}`);
            return;
          }

          if (invalidContacts.length > 0) {
            setError(`Some contacts were invalid: ${invalidContacts.join('; ')}`);
          }

          setFile(uploadedFile);
          setPreviewData(formattedData);
          setStep(2);
        } catch (err: any) {
          setError(`Failed to process CSV file: ${err.message}.`);
        }
      };
      reader.onerror = () => setError('Failed to read the file.');
      reader.readAsText(uploadedFile);
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };

  const handleCreateGroup = async () => {
    if (!currentWorkspaceId || !newGroupName.trim()) {
      setError('Group name is required.');
      return;
    }
    try {
      await onCreateGroup(newGroupName.trim(), (newGroupId) => {
        setSelectedGroup(newGroupId);
        setNewGroupName('');
        setError(null);
      });
    } catch (error: any) {
      setError(`Failed to create group: ${error.message}.`);
    }
  };

  const handleFinalImport = async () => {
    if (!currentWorkspaceId || !file || !selectedGroup || selectedGroup === 'all') {
      setError('Please select a valid group and file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => setUploadProgress((prev) => Math.min(prev + 20, 80)), 500);

    try {
      const response = await bulkUploadContacts(currentWorkspaceId, file, selectedGroup);
      clearInterval(interval);
      setUploadProgress(100);

      if (!response.success && ![202, 206, 102].includes(response.status)) {
        throw new Error(response.message || 'Bulk upload failed.');
      }

      setSuccessMessage(
        response.success
          ? `Successfully imported ${response.contacts?.length || 0} contacts!`
          : 'Upload initiated successfully!'
      );
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(`Import failed: ${err.message}.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(interval);
    }
  };

  const resetState = () => {
    setStep(1);
    setFile(null);
    setSelectedGroup(defaultGroupId || 'all');
    setNewGroupName('');
    setPreviewData([]);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetState}
      title="Import Contacts"
      onSubmit={step === 1 ? () => setStep(2) : handleFinalImport}
      submitText={step === 1 ? 'Next' : 'Import'}
      showBackButton={step > 1}
      onBack={() => {
        setStep(1);
        setError(null);
      }}
    >
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md text-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {['Upload File', 'Select Group'].map((label, index) => (
          <div key={label} className="flex items-center min-w-[120px]">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step > index ? 'bg-[#fddf0d] text-[#00333e]' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span className={`ml-2 text-sm ${step > index ? 'text-[#fddf0d]' : 'text-gray-400'} truncate`}>
              {label}
            </span>
            {index < 1 && <div className="w-12 h-1 bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>
      {step === 1 && (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-sm">
            Drag and drop a CSV/Excel file, or click to select. File must contain "name" and "phone_number" columns.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-block text-sm py-2 px-4 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e] ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            Upload Files (CSV/Excel)
          </label>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="text-base font-medium text-[#00333e] mb-2">Preview Data</h3>
          <div className="overflow-x-auto max-h-[250px] border border-gray-200 rounded-md mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {previewData.length > 0 &&
                    Object.keys(previewData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-[#00333e]">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
                {!previewData.length && (
                  <tr>
                    <td colSpan={3} className="p-3 text-center text-[#00333e] text-sm">
                      No preview data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <label className="block text-sm font-medium mb-2 text-[#00333e]">Select Group</label>
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-sm py-3 pl-4 pr-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#fddf0d] appearance-none cursor-pointer hover:border-[#005a6e] transition-colors"
              disabled={isLoading || !groups.length}
            >
              {groups
                .filter((group) => group.group_id !== 'all')
                .map((group) => (
                  <option
                    key={group.group_id}
                    value={group.group_id}
                    className="text-[#00333e] bg-white hover:bg-[#f5f5f5]"
                  >
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-[#00333e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <label className="block text-sm font-medium mt-4 mb-2 text-[#00333e]">Or Create New Group</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Enter group name"
              disabled={isLoading}
            />
            <button
              onClick={handleCreateGroup}
              className={`text-sm py-2 px-3 bg-[#005a6e] text-white rounded-md hover:bg-[#00333e] ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              Create
            </button>
          </div>
          {isUploading && (
            <div className="mt-6">
              <h3 className="text-base font-medium text-[#00333e] mb-2">Uploading...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#fddf0d] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-sm text-[#00333e] mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-green-500 text-white p-4 rounded-md shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
                <CheckCircle className="w-10 h-10" />
              </motion.div>
              <span className="text-lg font-semibold text-center">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [editContact, setEditContact] = useState<Partial<Contact>>({});
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupCreating, setIsGroupCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const perPage = 10;

  const fetchContactsAndGroups = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [groupsResponse, allContactsTotalResponse] = await Promise.all([
        getWorkspaceGroups(currentWorkspaceId),
        getContacts(currentWorkspaceId, 1, 1),
      ]);

      const updatedGroups = groupsResponse.map((group) => ({
        ...group,
        count: typeof group.contact_count === 'number' ? group.contact_count : 0,
      }));

      setTotalContacts(allContactsTotalResponse.total_count);

      const response = selectedGroup === 'all'
        ? await getContacts(currentWorkspaceId, 1, perPage)
        : await getGroupContacts(currentWorkspaceId, selectedGroup, 1, perPage);

      setContacts(response.contacts);
      setTotalPages(response.total_pages);
      setCurrentPage(1);

      setGroups([{ group_id: 'all', name: 'All Contacts', workspace_id: currentWorkspaceId, count: allContactsTotalResponse.total_count }, ...updatedGroups]);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, selectedGroup]);

  useEffect(() => {
    fetchContactsAndGroups();
  }, [fetchContactsAndGroups]);

  const handlePageChange = async (page: number) => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    setIsLoading(true);
    try {
      const response = selectedGroup === 'all'
        ? await getContacts(currentWorkspaceId, page, perPage)
        : await getGroupContacts(currentWorkspaceId, selectedGroup, page, perPage);

      setContacts(response.contacts);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = useCallback(
    async (contact: Partial<Contact>) => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      const trimmedContact = {
        name: contact.name?.trim(),
        phone_number: contact.phone_number?.trim(),
        email: contact.email?.trim() || '',
      };

      if (!trimmedContact.name || !trimmedContact.phone_number) {
        setError('Name and phone number are required.');
        return;
      }

      if (trimmedContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact.email)) {
        setError('Invalid email address.');
        return;
      }

      try {
        const createdContact = await createContact({ ...trimmedContact, workspace_id: currentWorkspaceId });
        if (contact.group_ids?.length) {
          const effectiveGroupIds = contact.group_ids.filter((id) => id !== 'all');
          await Promise.all(effectiveGroupIds.map((groupId) => addContactsToGroup(groupId, [createdContact.contact_id])));
        }
        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showAddContact: false }));
        setNewContact({});
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

      const trimmedContact = {
        name: contact.name?.trim(),
        phone_number: contact.phone_number?.trim(),
        email: contact.email?.trim() || '',
      };

      if (!trimmedContact.name || !trimmedContact.phone_number) {
        setError('Name and phone number are required.');
        return;
      }

      if (trimmedContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact.email)) {
        setError('Invalid email address.');
        return;
      }

      try {
        await updateContact(contact.contact_id, { ...trimmedContact, workspace_id: currentWorkspaceId });
        if (contact.group_ids) {
          const currentContactGroups = await getContactGroups(currentWorkspaceId, contact.contact_id);
          const currentGroupIds = currentContactGroups.map((g) => g.group_id);
          const newGroupIds = contact.group_ids.filter((id) => id !== 'all');
          const groupsToAdd = newGroupIds.filter((id) => !currentGroupIds.includes(id));
          const groupsToRemove = currentGroupIds.filter((id) => !newGroupIds.includes(id));

          await Promise.all([
            ...groupsToAdd.map((id) => addContactsToGroup(id, [contact.contact_id!])),
            ...groupsToRemove.map((id) => removeContactsFromGroup(id, [contact.contact_id!])),
          ]);
        }
        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showEditContact: false }));
        setEditContact({});
        setError(null);
      } catch (error: any) {
        setError(error.message || 'Failed to update contact.');
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups]
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
    async (name: string, callback?: (groupId: string) => void) => {
      if (!currentWorkspaceId || !name.trim()) {
        setError('Group name is required.');
        return;
      }

      setIsGroupCreating(true);
      try {
        const createdGroup = await createGroup({ name: name.trim(), workspace_id: currentWorkspaceId });
        await fetchContactsAndGroups();
        if (callback) callback(createdGroup.group_id);
        else setSelectedGroup(createdGroup.group_id);
        setModalState((prev) => ({ ...prev, showAddGroup: false }));
        setNewGroupName('');
        setError(null);
      } catch (error: any) {
        setError(error.message || 'Failed to add group.');
      } finally {
        setIsGroupCreating(false);
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups]
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
    async (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => {
      if (!currentWorkspaceId || isGroupCreating) {
        setError('No workspace selected or group creation in progress.');
        return;
      }

      setIsLoading(true);
      try {
        let fileToUpload: File;
        let effectiveGroupId = groupId;

        if (sourceType === 'file' && data instanceof File) {
          fileToUpload = data;
        } else if ((sourceType === 'text' || sourceType === 'phonebook') && Array.isArray(data)) {
          const validContacts = data
            .map((contact) => {
              const parsedPhone = parsePhoneNumberFromString(contact.phone_number, 'TZ') || parsePhoneNumberFromString(contact.phone_number, 'US');
              if (!parsedPhone || !parsedPhone.isValid() || !contact.name.trim()) return null;
              return {
                name: contact.name.trim(),
                phone_number: parsedPhone.format('E.164'),
                email: contact.email?.trim() || '',
              };
            })
            .filter((contact): contact is { name: string; phone_number: string; email: string } => contact !== null);

          if (!validContacts.length) throw new Error('No valid contacts found.');
          const csv = Papa.unparse(validContacts, { header: true, columns: ['name', 'phone_number', 'email'] });
          fileToUpload = new File([new Blob([csv], { type: 'text/csv' })], 'contacts.csv', { type: 'text/csv' });
        } else {
          throw new Error('Invalid data type for upload.');
        }

        if (groupId === 'all') {
          const nonAllGroups = groups.filter((g) => g.group_id !== 'all');
          if (!nonAllGroups.length) {
            await handleAddGroup('Imported Contacts', (newGroupId) => (effectiveGroupId = newGroupId));
            if (!effectiveGroupId) throw new Error('Failed to create a default group.');
          } else {
            effectiveGroupId = nonAllGroups[0].group_id;
          }
        }

        const response = await bulkUploadContacts(currentWorkspaceId, fileToUpload, effectiveGroupId);
        if (!response.success) throw new Error(response.message || 'Bulk upload failed.');

        await fetchContactsAndGroups();
        setSelectedGroup(effectiveGroupId);
        setModalState((prev) => ({ ...prev, showImportModal: false }));
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to import contacts.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkspaceId, isGroupCreating, groups, handleAddGroup, fetchContactsAndGroups]
  );

  const downloadTemplate = useCallback(() => {
    const csv = Papa.unparse([{ name: 'John Doe', phone_number: '+255712345678', email: 'john@example.com' }], {
      header: true,
    });
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
      { name: 'Name', selector: (row) => row.name, sortable: true, wrap: true },
      { name: 'Phone', selector: (row) => row.phone_number, sortable: true, wrap: true, minWidth: '150px' },
      {
        name: 'Email',
        selector: (row) => row.email || 'N/A',
        sortable: true,
        minWidth: '200px',
        omit: window.innerWidth < 768,
      },
      {
        name: 'Actions',
        cell: (row: Contact) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditContact({ ...row, group_ids: row.group_ids || [] });
                setModalState((prev) => ({ ...prev, showEditContact: true }));
              }}
              className="p-2 rounded-full text-[#00333e] hover:bg-[#fddf0d]"
              title="Edit Contact"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteContact(row.contact_id)}
              className="p-2 rounded-full text-red-500 hover:bg-red-100"
              title="Delete Contact"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        minWidth: '100px',
      },
    ],
    [handleDeleteContact]
  );

  const filteredContacts = useMemo(
    () =>
      contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [contacts, searchQuery]
  );

  const customStyles = {
    headCells: { style: { backgroundColor: '#f9fafb', fontWeight: '600', padding: '12px', fontSize: '12px', color: '#00333e', textTransform: 'uppercase' } },
    cells: { style: { padding: '12px', fontSize: '14px', color: '#00333e' } },
    table: { style: { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' } },
    pagination: { style: { borderTop: '1px solid #e5e7eb', padding: '10px', fontSize: '14px', color: '#00333e' } },
    rows: { style: { '&:hover': { backgroundColor: '#f5f5f5' } }, stripedStyle: { backgroundColor: '#f9fafb' } },
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter"
      >
        <div className="bg-white rounded-md p-6 border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#00333e]" />
              <h1 className="text-2xl font-semibold text-[#00333e]">Contacts</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setNewContact({ workspace_id: currentWorkspaceId || '' });
                  setModalState((prev) => ({ ...prev, showAddContact: true }));
                }}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
              >
                <UserPlus className="w-5 h-5" />
                Add Contact
              </button>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, showImportModal: true }))}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-[#005a6e] text-white rounded-md hover:bg-[#00333e]"
              >
                <Upload className="w-5 h-5" />
                Import Contacts
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <Download className="w-5 h-5" />
                Template
              </button>
            </div>
          </div>
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-10 text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-md p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-lg font-medium text-[#00333e]">{totalContacts}</p>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-md p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-md bg-gradient-to-r from-green-500 to-green-600">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">Groups</p>
                  <p className="text-lg font-medium text-[#00333e]">{groups.length > 0 ? groups.length - 1 : 0}</p>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-[#00333e]">Select Group</label>
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full text-sm py-3 pl-4 pr-10 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#fddf0d] appearance-none cursor-pointer hover:border-[#005a6e] transition-colors"
                >
                  {groups.map((group) => (
                    <option
                      key={group.group_id}
                      value={group.group_id}
                      className="text-[#00333e] bg-white hover:bg-[#f5f5f5] py-2"
                    >
                      {group.name || `Group ${group.group_id}`} ({group.count || 0} contacts)
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-[#00333e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <button
              onClick={() => setModalState((prev) => ({ ...prev, showAddGroup: true }))}
              className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
            >
              <Plus className="w-5 h-5" />
              Create New Group
            </button>
          </div>
          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md mb-4 text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="bg-white rounded-md p-6 border border-gray-200">
          <StyledDataTable
            columns={columns}
            data={filteredContacts}
            pagination
            paginationPerPage={perPage}
            paginationTotalRows={totalContacts}
            paginationServer
            onChangePage={handlePageChange}
            paginationComponentOptions={{ rowsPerPageText: 'Contacts per page:', rangeSeparatorText: 'of' }}
            progressPending={isLoading}
            progressComponent={<div className="p-4 text-center text-[#00333e] text-sm">Loading contacts...</div>}
            noDataComponent={<div className="p-4 text-center text-[#00333e] text-sm">No contacts found.</div>}
            customStyles={customStyles}
            highlightOnHover
            striped
            responsive
          />
        </div>
        <ContactModal
          isOpen={modalState.showAddContact}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showAddContact: false }));
            setNewContact({});
            setError(null);
          }}
          onSubmit={handleAddContact}
          contact={newContact}
          setContact={setNewContact}
          groups={groups}
          title="Add Contact"
          isLoading={isLoading}
        />
        <ContactModal
          isOpen={modalState.showEditContact}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showEditContact: false }));
            setEditContact({});
            setError(null);
          }}
          onSubmit={handleUpdateContact}
          contact={editContact}
          setContact={setEditContact}
          groups={groups}
          title="Edit Contact"
          isLoading={isLoading}
        />
        <Modal
          isOpen={modalState.showAddGroup}
          onClose={() => {
            setModalState((prev) => ({ ...prev, showAddGroup: false }));
            setNewGroupName('');
            setError(null);
          }}
          title="Add Group"
          onSubmit={() => handleAddGroup(newGroupName)}
          submitText="Add Group"
        >
          <div>
            <label htmlFor="newGroupName" className="block text-sm font-medium mb-1 text-[#00333e]">
              Group Name
            </label>
            <input
              id="newGroupName"
              type="text"
              className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
              disabled={isGroupCreating}
            />
          </div>
        </Modal>
        <ImportModal
          isOpen={modalState.showImportModal}
          onClose={() => setModalState((prev) => ({ ...prev, showImportModal: false }))}
          onSubmit={handleImportSubmit}
          groups={groups}
          defaultGroupId={selectedGroup}
          isLoading={isLoading || isGroupCreating}
          onCreateGroup={handleAddGroup}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Contacts;
export { ContactModal, ImportModal };