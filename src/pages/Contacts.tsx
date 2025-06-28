import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Upload, Trash2, Edit2, Search, UserPlus, FolderPlus, Download, X, ArrowLeft, Plus, ChevronDown, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

// Styled DataTable to filter out invalid props
const StyledDataTable = styled(DataTable).withConfig({
  shouldForwardProp: (prop) => !['allowOverflow', 'button'].includes(prop),
})``;

class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-400 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold">Something went wrong.</h2>
          <p className="text-base">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
          >
 spa            Try Again
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

interface UploadedContact {
  [key: string]: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onBack?: () => void;
  submitText?: string;
  cancelText?: string;
  showBackButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  onBack,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showBackButton = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
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
              className="text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="text-sm py-2 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
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
    <Modal isOpen={isOpen} onClose={onClose} title={title} onSubmit={handleSubmit} submitText={title}>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
        <input
          type="text"
          className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.name || ''}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
        <input
          type="tel"
          className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.phone_number || ''}
          onChange={(e) => setContact({ ...contact, phone_number: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Email (Optional)</label>
        <input
          type="email"
          className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
          value={contact.email || ''}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Assign to Groups</label>
        <select
          multiple
          className="w-full min-h-[100px] text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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
  onSubmit: (groupId: string, data: File, sourceType: 'file') => void;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit, groups, setGroups }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [previewData, setPreviewData] = useState<UploadedContact[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { currentWorkspaceId } = useWorkspace();
  const MAX_FILE_SIZE_MB = 10;
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
      return;
    }

    const fileType = uploadedFile.type;
    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();

    if (
      fileType === 'text/csv' ||
      fileExtension === 'csv' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileExtension === 'xls' ||
      fileExtension === 'xlsx'
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

          const formattedData = parsed.data.map((row: any) => {
            const name = row.name?.toString().trim() || '';
            let phone_number = row.phone_number?.toString().trim() || '';
            const email = row.email?.toString().trim() || '';

            if (!name) {
              setError('One or more rows are missing a name. Please correct the CSV file.');
              return null;
            }

            const parsedPhone = parsePhoneNumberFromString(phone_number, 'TZ');
            if (!parsedPhone || !parsedPhone.isValid()) {
              const fallbackParsed = parsePhoneNumberFromString(phone_number, 'US');
              phone_number = fallbackParsed?.format('E.164') || phone_number;
            } else {
              phone_number = parsedPhone.format('E.164');
            }

            return { name, phone_number, email };
          }).filter((row): row is UploadedContact => row !== null);

          if (formattedData.length === 0) {
            setError('No valid contacts found after formatting. Please check the CSV file.');
            return;
          }

          setFile(uploadedFile);
          setPreviewData(formattedData);
          setStep(2);
        } catch (err: any) {
          setError(`Failed to process CSV file: ${err.message}. Ensure the file is not corrupted.`);
        }
      };
      reader.onerror = () => setError('Failed to read the file. Please try again.');
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
      const groupPayload = {
        name: newGroupName.trim(),
        workspace_id: currentWorkspaceId,
      };
      const newGroup = await createGroup(groupPayload);
      setGroups((prev) => [...prev, { ...newGroup, count: 0 }]);
      setSelectedGroup(newGroup.group_id);
      setNewGroupName('');
      setError(null);
    } catch (error: any) {
      setError(`Failed to create group: ${error.message}. Please try again.`);
    }
  };

  const handleFinalImport = async () => {
    let interval: NodeJS.Timeout | null = null;
    
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected. Please select a workspace.');
      if (!file) throw new Error('No file selected for upload. Please upload a CSV file.');
      if (!selectedGroup || selectedGroup === 'all') throw new Error('Please select a valid group or create a new one.');

      setIsUploading(true);
      setUploadProgress(0);

      interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 80));
      }, 500);

      const response = await bulkUploadContacts(currentWorkspaceId, file, selectedGroup);

      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      setUploadProgress(100);

      const isSuccessful = response.success || response.status === 202 || response.status === 206 || response.status === 102;
      
      if (!isSuccessful) {
        throw new Error(`Bulk upload failed: ${response.message || 'Please check the file format and try again.'}`);
      }

      if (response.success) {
        setSuccessMessage(`Successfully imported ${response.contacts?.length || 0} contacts!`);
        setSuccessSubMessage(`Import completed at ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}`);
      } else {
        setSuccessMessage('Upload initiated successfully!');
        setSuccessSubMessage(`Processing ${response.contacts?.length || 'your'} contacts. You'll be notified when complete.`);
      }

      setShowSuccessNotification(true);
      
      setTimeout(() => {
        setShowSuccessNotification(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 3000);
      
    } catch (err: any) {
      setError(`Import failed: ${err.message}. Please verify the file and try again.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (interval) {
        clearInterval(interval);
      }
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    setError(null);
  };

  const submitText = step === 1 ? 'Next' : 'Import';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(1);
        setFile(null);
        setSelectedGroup('all');
        setNewGroupName('');
        setPreviewData([]);
        setError(null);
        setIsUploading(false);
        setUploadProgress(0);
        onClose();
      }}
      title="Import Contacts"
      onSubmit={step === 1 ? () => setStep(2) : handleFinalImport}
      onBack={step > 1 ? handleBack : undefined}
      submitText={submitText}
      cancelText="Cancel"
      showBackButton={step > 1}
    >
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4 text-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {['Upload File', 'Select Group'].map((label, index) => (
          <div key={label} className="flex items-center min-w-[120px]">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step >= index + 1 ? 'bg-[#fddf0d] text-[#00333e]' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${step >= index + 1 ? 'text-[#fddf0d]' : 'text-gray-400'} truncate`}
            >
              {label}
            </span>
            {index < 1 && <div className="w-12 h-1 bg-gray-300 mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-sm">
              Drag and drop a CSV/Excel file, or click to select. File must contain "name" and "phone_number" columns (email is optional).
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.xls,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] cursor-pointer"
            >
              Upload Files (CSV/Excel)
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-700 mb-2">Preview Data</h3>
            <div className="overflow-x-auto max-h-[250px] border border-gray-200 rounded-lg mb-4">
              <table className="w-full text-left text-gray-700">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="p-3 text-sm min-w-[120px]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-3 text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No preview data available.
                </div>
              )}
            </div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] mb-6"
            >
              {groups
                .filter((group) => group.group_id && group.group_id !== 'all')
                .map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Or Create New Group
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
                  placeholder="Enter group name"
                />
                <button
                  onClick={handleCreateGroup}
                  className="text-sm py-2 px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700 mb-2">Uploading...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#005a6e] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <CheckCircle className="w-10 h-10" />
              </motion.div>
              <span className="text-lg font-semibold text-center">
                {successMessage}
              </span>
              <p className="text-sm text-green-100 text-center">
                {successSubMessage}
              </p>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  const perPage = 10;

  const fetchAllContacts = useCallback(
    async (workspaceId: string, page: number = 1, pagesToFetch: number = 2): Promise<ContactsResponse> => {
      try {
        const startPage = page;
        const endPage = Math.min(page + pagesToFetch - 1, totalPages);
        let allContacts: Contact[] = [];
        let totalPagesCount = 0;
        let totalCount = 0;

        const pageRequests = Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const targetPage = startPage + i;
          return getContacts(workspaceId, targetPage, perPage);
        });

        const responses = await Promise.all(
          pageRequests.map(async (request) => {
            try {
              return await request;
            } catch (error) {
              console.error(`Failed to fetch page:`, error);
              return { contacts: [], total_count: 0, total_pages: 0, current_page: page };
            }
          })
        );

        responses.forEach((res) => {
          allContacts = [...allContacts, ...res.contacts];
          totalPagesCount = Math.max(totalPagesCount, res.total_pages);
          totalCount = res.total_count;
        });

        return { contacts: allContacts, total_count: totalCount, total_pages: totalPagesCount, current_page: page };
      } catch (error: any) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
    },
    [totalPages]
  );

  const fetchContactsAndGroups = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch groups with their contact counts first
      const groupsResponse = await getWorkspaceGroups(currentWorkspaceId);
      const updatedGroups = groupsResponse.map((group) => ({
        ...group,
        count: group.contact_count ?? 0,
      }));

      // Fetch contacts for the selected group or all contacts
      const contactsResponse = selectedGroup === 'all'
        ? await fetchAllContacts(currentWorkspaceId, 1, 2)
        : await getGroupContacts(currentWorkspaceId, selectedGroup, 1, perPage);
      setContacts(contactsResponse.contacts);
      setTotalPages(contactsResponse.total_pages);
      setCurrentPage(1);
      setTotalContacts(contactsResponse.total_count);

      const allGroup = {
        group_id: 'all',
        name: 'All Contacts',
        workspace_id: currentWorkspaceId,
        count: contactsResponse.total_count,
      };

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

  const handlePageChange = async (page: number) => {
    if (!currentWorkspaceId) return;

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
          group_id: contact.group_ids?.[0] || undefined,
        };
        const createdContact = await createContact(contactPayload);

        if (contact.group_ids?.length && contact.group_ids[0] !== 'all') {
          await addContactsToGroup(contact.group_ids[0], [createdContact.contact_id]);
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
          const currentGroupIds = (await getContactGroups(currentWorkspaceId, contact.contact_id)).map(g => g.group_id);
          const groupsToAdd = contact.group_ids.filter(id => !currentGroupIds.includes(id) && id !== 'all');
          await Promise.all(groupsToAdd.map(id => addContactsToGroup(id, [contact.contact_id])));
        }

        await fetchContactsAndGroups();
        setModalState((prev) => ({ ...prev, showEditContact: false }));
        setEditContact({ name: '', phone_number: '', email: '', workspace_id: '', group_ids: [] });
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
    async (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      setIsLoading(true);
      try {
        let fileToUpload: File;

        if (sourceType === 'file' && data instanceof File) {
          fileToUpload = data;
        } else if ((sourceType === 'text' || sourceType === 'phonebook') && Array.isArray(data)) {
          const validContacts = data
            .map((contact) => {
              const parsedPhone = parsePhoneNumberFromString(contact.phone_number, 'TZ');
              if (!parsedPhone || !parsedPhone.isValid() || !contact.name.trim()) {
                return null;
              }
              return {
                name: contact.name.trim(),
                phone_number: parsedPhone.format('E.164'),
                email: contact.email?.trim() || '',
              };
            })
            .filter((contact): contact is { name: string; phone_number: string; email: string } => contact !== null);

          if (validContacts.length === 0) {
            throw new Error('No valid contacts found after validation.');
          }

          const csv = Papa.unparse(validContacts, {
            header: true,
            columns: ['name', 'phone_number', 'email'],
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          fileToUpload = new File([blob], 'contacts.csv', { type: 'text/csv' });
        } else {
          throw new Error('Invalid data type for upload.');
        }

        const effectiveGroupId = groupId === 'all' && groups.length > 1 
          ? groups.find(g => g.group_id !== 'all')?.group_id 
          : groupId;
        if (!effectiveGroupId || effectiveGroupId === 'all') {
          throw new Error('Please select a valid group or create a new one.');
        }

        const response = await bulkUploadContacts(currentWorkspaceId, fileToUpload, effectiveGroupId);
        if (!response.success) {
          throw new Error(response.message || 'Bulk upload failed.');
        }

        await fetchContactsAndGroups();
        setError(null);
        setSelectedGroup(effectiveGroupId);
      } catch (err: any) {
        setError(err.message || 'Failed to import contacts.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups, groups]
  );

  const downloadTemplate = useCallback(() => {
    const csv = Papa.unparse([{
      name: 'John Doe',
      phone_number: '+255712345678',
      email: 'john@example.com'
    }]);
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
      { 
        name: 'Phone', 
        selector: (row) => row.phone_number, 
        sortable: true,
        wrap: true,
        minWidth: '150px'
      },
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
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDeleteContact(row.contact_id)}
              className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
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
        padding: '12px',
        fontSize: '14px',
        color: '#00333e',
      },
    },
    cells: {
      style: {
        padding: '12px',
        fontSize: '14px',
        color: '#374151',
      },
    },
    table: {
      style: {
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e5e7eb',
        padding: '10px',
        fontSize: '14px',
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
        className="min-h-screen bg-gray-100 p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#00333e]" />
                <h1 className="text-2xl md:text-3xl font-bold text-[#00333e]">Contacts</h1>
              </div>
              <div className="flex flex-wrap gap-3">
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
                  className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Contact
                </button>
                <button
                  onClick={() => setModalState((prev) => ({ ...prev, showImportModal: true }))}
                  className="flex items-center gap-2 text-sm py-2 px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200"
                >
                  <Upload className="w-5 h-5" />
                  Import Contacts
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
                className="w-full pl-10 text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#f9fafb] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Total Contacts</h3>
                <p className="text-xl font-bold text-[#33333e]">{totalContacts || 0}</p>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Groups</h3>
                <p className="text-xl font-bold text-[#33333e]">{groups.length - 1}</p>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Selected Group</h3>
                <p className="text-xl font-bold text-[#33333e]">
                  {groups.find((g) => g.group_id === selectedGroup)?.name || 'All Contacts'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-semibold text-[#33333e]">Contact Groups</h2>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, showAddGroup: true }))}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Create New Group
              </button>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg mb-4 text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <AnimatePresence>
                {groups.map((group) => (
                  <motion.div
                    key={group.group_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 rounded-lg border-2 ${
                      selectedGroup === group.group_id
                        ? 'border-[#fddf0d] bg-[#fddf0d]/10'
                        : 'border-gray-200 bg-gray-50'
                    } hover:bg-gray-100 transition-colors duration-200 cursor-pointer flex justify-between items-center`}
                    onClick={() => setSelectedGroup(group.group_id)}
                  >
                    <div>
                      <h3 className="text-sm font-medium text-[#00333e]">
                        {group.name || `Group ${group.group_id}`}
                      </h3>
                      <p className="text-sm text-gray-600">{group.count || 0} contacts</p>
                    </div>
                    {group.group_id !== 'all' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.group_id);
                        }}
                        className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <StyledDataTable
              columns={columns}
              data={filteredContacts}
              pagination
              paginationPerPage={perPage}
              paginationTotalRows={totalPages * perPage}
              paginationServer
              onChangePage={handlePageChange}
              paginationComponentOptions={{
                rowsPerPageText: 'Contacts per page:',
                rangeSeparatorText: 'of',
              }}
              progressPending={isLoading}
              progressComponent={
                <div className="p-4 text-center text-gray-500 text-sm">
                  Loading contacts...
                </div>
              }
              noDataComponent={
                <div className="p-4 text-center text-gray-500 text-sm">
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
      </motion.div>

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
          <label className="block text-sm font-medium mb-1 text-gray-700">Group Name</label>
          <input
            type="text"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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
        setGroups={setGroups}
      />
    </ErrorBoundary>
  );
};
export default Contacts;