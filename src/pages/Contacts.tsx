import React, { useState, useEffect, useRef, useMemo, useCallback, Component } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Trash2, Edit2, Search, UserPlus, FolderPlus, Download, X, Book, ArrowLeft, Plus, ChevronDown } from 'lucide-react';
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

interface UploadedContact {
  [key: string]: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

interface BulkUploadResponse {
  success?: boolean;
  message?: {
    invalid?: any[];
    message?: string;
    status?: string;
    valid?: any[];
    contacts?: Contact[];
  } | string;
  contacts?: Contact[];
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-3xl">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#00333e]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">{children}</div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-1 sm:gap-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Back
            </button>
          )}
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

  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 640;

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

          // Validate and convert data
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
              const fallbackParsed = parsePhoneNumberFromString(phone_number, 'US'); // Try fallback country
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

  let interval: NodeJS.Timeout | undefined;

  const handleFinalImport = async () => {
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected. Please select a workspace.');
      if (!file) throw new Error('No file selected for upload. Please upload a CSV file.');
      if (!selectedGroup || selectedGroup === 'all') throw new Error('Please select a valid group or create a new one.');

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress updates (replace with actual API progress if supported)
      interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 80));
      }, 500);

      console.log("Uploading to group_id:", selectedGroup);
      const response = await bulkUploadContacts(currentWorkspaceId, file, selectedGroup);

      clearInterval(interval);
      setUploadProgress(100);

      // Handle nested response structure
      const responseData = typeof response.message === 'object' ? response.message : response;
      const status = typeof responseData === 'object' ? responseData.status : undefined;
      const message = typeof responseData === 'object' ? responseData.message : undefined;
      
      // Treat both 'started' and 'success' as successful responses
      if (response.success || status === 'started' || status === 'success') {
        let validCount = 0;
        let invalidCount = 0;
        
        // Try to get counts from arrays first
        if (typeof responseData === 'object') {
          validCount = responseData.valid?.length || responseData.contacts?.length || 0;
          invalidCount = responseData.invalid?.length || 0;
        }
        
        // If arrays are not available, try to extract from message text
        if (validCount === 0 && typeof responseData === 'object' && responseData.message) {
          const messageText = responseData.message;
          const validMatch = messageText.match(/Processing (\d+) valid contacts/);
          const invalidMatch = messageText.match(/Invalid (\d+) contacts found/);
          
          if (validMatch) {
            validCount = parseInt(validMatch[1], 10);
          }
          if (invalidMatch) {
            invalidCount = parseInt(invalidMatch[1], 10);
          }
        }
        
        let alertMessage = `Successfully processed ${validCount} contacts`;
        if (invalidCount > 0) {
          alertMessage += ` (${invalidCount} invalid contacts skipped)`;
        }
        alertMessage += ` at ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}.`;
        
        alert(alertMessage);
        onClose(); // Close modal after successful upload
      } else {
        throw new Error(`Bulk upload failed: ${message || 'Please check the file format and try again.'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import contacts.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (interval) clearInterval(interval); // Ensure interval is cleared
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
        <div className="text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {['Upload File', 'Select Group'].map((label, index) => (
          <div key={label} className="flex items-center min-w-[100px] sm:min-w-[120px]">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step >= index + 1 ? 'bg-[#fddf0d] text-[#00333e]' : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 text-xs sm:text-sm ${step >= index + 1 ? 'text-[#fddf0d]' : 'text-gray-400'} truncate`}
            >
              {label}
            </span>
            {index < 1 && <div className="w-6 sm:w-12 h-1 bg-gray-300 mx-1 sm:mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-2 sm:mb-4" />
            <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
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
              className="inline-block text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] cursor-pointer"
            >
              Upload Files (CSV/Excel)
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Preview Data</h3>
            <div className="overflow-x-auto max-h-[200px] sm:max-h-[250px] border border-gray-200 rounded-lg mb-4">
              <table className="w-full text-left text-gray-700">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length === 0 && (
                <div className="p-2 sm:p-3 text-center text-gray-500 text-xs sm:text-sm">
                  No preview data available.
                </div>
              )}
            </div>
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] mb-4 sm:mb-6"
            >
              {groups
                .filter((group) => group.group_id && group.group_id !== 'all')
                .map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                Or Create New Group
              </label>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
                  placeholder="Enter group name"
                />
                <button
                  onClick={handleCreateGroup}
                  className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Uploading...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#005a6e] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
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
  const perPage = 10;

  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string, page: number = 1, pagesToFetch: number = 2): Promise<ContactsResponse> => {
      try {
        const startPage = page;
        const endPage = Math.min(page + pagesToFetch - 1, totalPages);
        let allContacts: Contact[] = [];
        let totalPagesCount = 0;

        const pageRequests = Array.from({ length: endPage - startPage + 1 }, (_, i) => {
          const targetPage = startPage + i;
          return groupId
            ? getGroupContacts(workspaceId, groupId, targetPage, perPage)
            : getContacts(workspaceId, targetPage, perPage);
        });

        const responses = await Promise.all(pageRequests);
        responses.forEach((res) => {
          allContacts = [...allContacts, ...res.contacts];
          totalPagesCount = Math.max(totalPagesCount, res.total_pages);
        });

        return { contacts: allContacts, total_count: allContacts.length, total_pages: totalPagesCount, current_page: page };
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
      // Fetch first two pages of contacts
      const { contacts: initialContacts, total_pages: contactTotalPages } = await fetchAllContacts(currentWorkspaceId, selectedGroup === 'all' ? undefined : selectedGroup, 1, 2);
      setContacts(initialContacts);
      setTotalPages(contactTotalPages);
      setCurrentPage(1);

      // Fetch groups
      const groupsResponse = await getWorkspaceGroups(currentWorkspaceId);
      const updatedGroups = await Promise.all(
        groupsResponse.map(async (group) => {
          const { contacts: groupContacts, total_pages: groupTotalPages } = await fetchAllContacts(currentWorkspaceId, group.group_id, 1, 2);
          return { ...group, count: groupContacts.length, total_pages: groupTotalPages };
        })
      );

      const allGroup = {
        group_id: 'all',
        name: 'All Contacts',
        workspace_id: currentWorkspaceId,
        count: initialContacts.length,
        total_pages: contactTotalPages,
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
      const pagesToFetch = page === 2 ? 2 : 1; // Fetch next two pages when navigating to second page
      const { contacts: newContacts, total_pages: newTotalPages } = await fetchAllContacts(currentWorkspaceId, selectedGroup === 'all' ? undefined : selectedGroup, page, pagesToFetch);
      setContacts(newContacts);
      setTotalPages(newTotalPages);
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

      // Ensure groupId is a valid group ID, fallback to first group if 'all'
      const effectiveGroupId = groupId === 'all' && groups.length > 1 
        ? groups.find(g => g.group_id !== 'all')?.group_id 
        : groupId;
      if (!effectiveGroupId || effectiveGroupId === 'all') {
        throw new Error('Please select a valid group or create a new one.');
      }

      console.log("Uploading to group_id:", effectiveGroupId); // Debug log
      const response = await bulkUploadContacts(currentWorkspaceId, fileToUpload, effectiveGroupId);
      if (!response.success) {
        throw new Error(response.message || 'Bulk upload failed.');
      }

      await fetchContactsAndGroups();
      setError(null);
      setSelectedGroup(effectiveGroupId);
      alert(`Successfully imported ${response.contacts?.length || 0} contacts.`);
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
      { name: 'Name', selector: (row) => row.name, sortable: true },
      { name: 'Phone', selector: (row) => row.phone_number, sortable: true },
      {
        name: 'Email',
        selector: (row) => row.email || 'N/A',
        sortable: true,
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

  const dropdownOptions = useMemo(
    () => [
      { value: 'all', label: 'All Contacts' },
      ...groups
        .filter((group) => group.group_id && group.group_id !== 'all')
        .map((group) => ({
          value: group.group_id,
          label: `${group.name || `Group ${group.group_id}`} (${group.count})`,
        })),
    ],
    [groups]
  );

  // Minimal CustomDropdown implementation
  interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
  }

  const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange, options, className }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fddf0d] ${className || ''}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-100"
      >
        <div className="p-4 sm:p-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#00333e]" />
                <h1 className="text-2xl sm:text-3xl font-bold text-[#00333e]">Contacts</h1>
              </div>
              <div className="flex gap-2 sm:gap-3">
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
                  Import Contacts
                </button>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Template
                </button>
              </div>
            </div>

            <div className="relative mb-4 sm:mb-6">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="w-full pl-8 sm:pl-10 text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-[#f9fafb] p-3 sm:p-4 rounded">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Contacts</h3>
                <p className="text-lg sm:text-xl font-bold text-[#33333e]">{contacts.length}</p>
              </div>
              <div className="bg-[#f9fafb] p-3 sm:p-4 rounded">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Groups</h3>
                <p className="text-lg sm:text-xl font-bold text-[#33333e]">{groups.length - 1}</p>
              </div>
              <div className="bg-[#f9fafb] p-3 sm:p-4 rounded">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600">Selected Group</h3>
                <p className="text-lg sm:text-xl font-bold text-[#33333e]">
                  {groups.find((g) => g.group_id === selectedGroup)?.name || 'All Contacts'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded shadow-md mb-4 sm:mb-6" style={{ maxWidth: 'none', width: '100%' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#33333e]">Selected Group</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <CustomDropdown
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  options={dropdownOptions}
                  className="min-w-[200px]"
                />
                <button
                  onClick={() => setModalState((prev) => ({ ...prev, showAddGroup: true }))}
                  className="flex items-center gap-1 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#33333e] text-white rounded hover:bg-[#335a6e] transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create New
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 sm:p-4 rounded mb-3 sm:mb-4 text-xs sm:text-sm">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            <StyledDataTable<Contact>
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
          <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Group Name</label>
          <input
            type="text"
            className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
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