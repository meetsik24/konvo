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

// Error Boundary Component (unchanged)
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

interface UploadedContact {
  [key: string]: string;
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
        <div className="space-y-3 sm:space-y-4">
          {children}
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
  onSubmit: (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => void;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit, groups, setGroups }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [uploadedData, setUploadedData] = useState<UploadedContact[]>([]);
  const [columnMappings, setColumnMappings] = useState<{ [key: string]: string }>({});
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [defaultCountry, setDefaultCountry] = useState<string>('TZ'); // Default to Tanzania
  const { currentWorkspaceId } = useWorkspace();
  const MAX_PASTED_CONTACTS = 500;
  const MAX_FILE_SIZE_MB = 10;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 640;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    // File size limit
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
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileExtension === 'xls' ||
      fileExtension === 'xlsx'
    ) {
      setFile(uploadedFile);

      if (fileExtension === 'xls' || fileExtension === 'xlsx') {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1).map((row: any) =>
              headers.reduce((obj, header, index) => {
                obj[header] = row[index] || '';
                return obj;
              }, {} as UploadedContact)
            );

            setUploadedData(rows);
            setStep(2);
          } catch (err: any) {
            setError('Failed to parse the Excel file: ' + err.message);
          }
        };
        reader.onerror = () => setError('Failed to read the Excel file.');
        reader.readAsArrayBuffer(uploadedFile);
      } else {
        Papa.parse(uploadedFile, {
          header: true,
          complete: (results) => {
            setUploadedData(results.data as UploadedContact[]);
            setStep(2);
          },
          error: () => setError('Failed to parse the CSV file.'),
        });
      }
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };

  const handleTextPaste = () => {
    const rows = textInput.split('\n').filter((row) => row.trim() !== '');
    if (rows.length === 0) {
      setError('No data provided in the text input.');
      return;
    }
    if (rows.length > MAX_PASTED_CONTACTS) {
      setError(`Too many contacts (${rows.length}). Maximum is ${MAX_PASTED_CONTACTS} for pasted text.`);
      return;
    }
    Papa.parse(rows.join('\n'), {
      header: true,
      complete: (results) => {
        setUploadedData(results.data as UploadedContact[]);
        setStep(2);
      },
      error: () => setError('Failed to parse the pasted text.'),
    });
  };

  const handleImportFromPhoneBook = async () => {
    if (!('contacts' in navigator && 'select' in (navigator.contacts as any))) {
      setError('Phone book access is not supported on this device.');
      return;
    }

    try {
      const contacts = await (navigator.contacts as any).select(['name', 'tel', 'email'], { multiple: true });
      if (contacts.length === 0) {
        setError('No contacts selected.');
        return;
      }
      if (contacts.length > MAX_PASTED_CONTACTS) {
        setError(`Too many contacts (${contacts.length}). Maximum is ${MAX_PASTED_CONTACTS} for phonebook imports.`);
        return;
      }

      const formattedContacts = contacts.map((contact: any) => ({
        name: contact.name?.[0] || '',
        phone_number: contact.tel?.[0] || '',
        email: contact.email?.[0] || '',
      }));

      setUploadedData(formattedContacts);
      setStep(2);
    } catch (err: any) {
      setError('Failed to access phone book: ' + err.message);
    }
  };

  const handleColumnMapping = (column: string, field: string) => {
    setColumnMappings((prev) => {
      const newMappings = { ...prev };
      Object.keys(newMappings).forEach((key) => {
        if (newMappings[key] === field && key !== column && field !== '') {
          delete newMappings[key];
        }
      });
      if (field) {
        newMappings[column] = field;
      } else {
        delete newMappings[column];
      }
      return newMappings;
    });
  };

  const validateMappings = () => {
    const hasName = Object.values(columnMappings).includes('name');
    const hasPhoneNumber = Object.values(columnMappings).includes('phone_number');
    if (!hasName || !hasPhoneNumber) {
      setError('Please map both Name and Phone Number fields.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleProceedToGroupSelection = () => {
    if (validateMappings()) {
      setStep(3);
    }
  };

  const handleGroupSelection = () => {
    if (validateMappings()) {
      setStep(4);
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
      setGroups((prev) => [
        ...prev,
        { ...newGroup, count: 0 },
      ]);
      setSelectedGroup(newGroup.group_id);
      setNewGroupName('');
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to create group.');
    }
  };

  const handleFinalImport = async () => {
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected.');
      if (!validateMappings()) return;

      const sourceType: 'file' | 'text' | 'phonebook' = file ? 'file' : textInput ? 'text' : 'phonebook';

      if (sourceType !== 'file' && uploadedData.length > MAX_PASTED_CONTACTS) {
        throw new Error(`Too many contacts (${uploadedData.length}). Maximum is ${MAX_PASTED_CONTACTS} for pasted/phonebook imports.`);
      }

      const contactsToImport = uploadedData
        .map((data) => {
          const nameColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'name');
          const phoneColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'phone_number');
          const emailColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'email');

          const name = nameColumn ? data[nameColumn]?.toString().trim() : '';
          let phone_number = phoneColumn ? data[phoneColumn]?.toString().trim() : '';
          const email = emailColumn ? data[emailColumn]?.toString().trim() : '';

          // Normalize phone numbers for text/phonebook
          if (sourceType !== 'file' && phone_number) {
            const parsed = parsePhoneNumberFromString(phone_number, defaultCountry);
            if (parsed && parsed.isValid()) {
              phone_number = parsed.format('E.164'); // e.g., "0712345678" -> "+255712345678"
            } else {
              return null;
            }
          }

          return { name, phone_number, email, workspace_id: currentWorkspaceId };
        })
        .filter((contact): contact is Contact => contact && contact.name && contact.phone_number);

      if (contactsToImport.length === 0) throw new Error('No valid contacts found.');

      await onSubmit(selectedGroup, sourceType === 'file' && file ? file : contactsToImport, sourceType);
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import contacts.');
    }
  };

  const duplicates = useMemo(() => {
    const emailColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'email');
    const phoneColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'phone_number');
    if (!emailColumn && !phoneColumn) return { email: 0, phone: 0 };

    const emails = emailColumn ? uploadedData.map((data) => data[emailColumn] || '') : [];
    const phones = phoneColumn ? uploadedData.map((data) => data[phoneColumn] || '') : [];

    return {
      email: emails.filter((email, index) => email && emails.indexOf(email) !== index).length,
      phone: phones.filter((phone, index) => phone && phones.indexOf(phone) !== index).length,
    };
  }, [uploadedData, columnMappings]);

  const invalid = useMemo(() => {
    const emailColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'email');
    if (!emailColumn) return 0;
    return uploadedData.filter((data) => {
      const email = data[emailColumn] || '';
      return email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }).length;
  }, [uploadedData, columnMappings]);

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    setError(null);
  };

  const submitText = step === 1 ? 'Next' : step === 2 ? 'Next' : step === 3 ? 'Next' : 'Import';

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(1);
        setUploadedData([]);
        setColumnMappings({});
        setSelectedGroup('all');
        setTextInput('');
        setFile(null);
        setNewGroupName('');
        setDefaultCountry('TZ');
        setError(null);
        onClose();
      }}
      title="Import Contacts"
      onSubmit={
        step === 1
          ? handleTextPaste
          : step === 2
          ? handleProceedToGroupSelection
          : step === 3
          ? handleGroupSelection
          : handleFinalImport
      }
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

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {['Upload File', 'Map Columns', 'Select Group', 'Preview & Import'].map((label, index) => (
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
            {index < 3 && <div className="w-6 sm:w-12 h-1 bg-gray-300 mx-1 sm:mx-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload File, Paste Text, or Import from Phone Book */}
      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <select
              value={defaultCountry}
              onChange={(e) => setDefaultCountry(e.target.value)}
              className="mb-2 sm:mb-4 w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg"
            >
              <option value="TZ">Tanzania (+255)</option>
              <option value="US">United States (+1)</option>
              <option value="GB">United Kingdom (+44)</option>
            </select>
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-2 sm:mb-4" />
            <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
              Drag and drop a CSV/Excel file, or click to select. Use E.164 phone numbers (e.g., +255712345678).
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
            <p className="text-gray-500 mt-2 sm:mt-4 text-xs sm:text-sm">
              Or paste contacts below (CSV format: name,phone_number,email, max {MAX_PASTED_CONTACTS} contacts)
            </p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] mt-2 sm:mt-4"
              rows={4}
              placeholder="John Doe,+255712345678,john@example.com"
            />
          </div>
          {isMobile && (
            <button
              onClick={handleImportFromPhoneBook}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] flex items-center justify-center gap-2"
            >
              <Book className="w-4 h-4 sm:w-5 sm:h-5" />
              Import from Phone Book
            </button>
          )}
        </div>
      )}

      {/* Step 2: View Uploaded Data and Map Columns */}
      {step === 2 && uploadedData.length > 0 && (
        <div>
          <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px] border border-gray-200 rounded-lg">
            <table className="w-full text-left text-gray-700">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  {Object.keys(uploadedData[0]).map((column) => (
                    <th key={column} className="p-2 sm:p-3 min-w-[120px]">
                      <select
                        value={columnMappings[column] || ''}
                        onChange={(e) => handleColumnMapping(column, e.target.value)}
                        className="w-full text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                      >
                        <option value="">Select...</option>
                        <option value="name">Name</option>
                        <option value="phone_number">Phone Number</option>
                        <option value="email">Email</option>
                      </select>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadedData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    {Object.values(row).map((value, i) => (
                      <td
                        key={i}
                        className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Select or Create Group */}
      {step === 3 && (
        <div>
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] mb-4 sm:mb-6"
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
        </div>
      )}

      {/* Step 4: Preview and Process */}
      {step === 4 && (
        <div>
          <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px] border border-gray-200 rounded-lg">
            <table className="w-full text-left text-gray-700">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px]">Name</th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px]">Phone Number</th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px]">Email</th>
                </tr>
              </thead>
              <tbody>
                {uploadedData.map((row, index) => {
                  const nameColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'name');
                  const phoneColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'phone_number');
                  const emailColumn = Object.keys(columnMappings).find((key) => columnMappings[key] === 'email');

                  const phone_number = phoneColumn && row[phoneColumn]
                    ? (file ? row[phoneColumn] : parsePhoneNumberFromString(row[phoneColumn], defaultCountry)?.format('E.164') || row[phoneColumn])
                    : 'N/A';

                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {nameColumn ? row[nameColumn] || 'N/A' : 'N/A'}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {phone_number}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                        {emailColumn ? row[emailColumn] || 'N/A' : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 sm:mt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#005a6e] h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-gray-600 text-right mt-1 sm:mt-2 text-xs sm:text-sm">Completed</p>
          </div>
          <div className="flex flex-wrap justify-between mt-2 sm:mt-4 gap-2">
            <div className="flex flex-wrap space-x-2 gap-2">
              <span className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-[#005a6e] text-[#005a6e] text-xs sm:text-sm">
                Total Records: {uploadedData.length}
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-red-500 text-red-500 text-xs sm:text-sm">
                Invalid Records: {invalid}
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-yellow-500 text-yellow-500 text-xs sm:text-sm">
                Duplicate Emails: {duplicates.email}
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-yellow-500 text-yellow-500 text-xs sm:text-sm">
                Duplicate Phones: {duplicates.phone}
              </span>
              <span className="px-2 sm:px-3 py-1 sm:py-2 rounded border border-green-500 text-green-500 text-xs sm:text-sm">
                Valid Records: {uploadedData.length - invalid - duplicates.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const CustomDropdown = ({ value, onChange, options, className }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative w-full sm:w-auto ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-between text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {options.find((opt) => opt.value === value)?.label || 'Select a group'}
        </span>
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 ml-2 text-[#00333e]" />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full sm:w-auto mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#00333e] hover:bg-[#fddf0d] hover:text-[#00333e] transition-colors duration-200 truncate"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
    async (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }

      setIsLoading(true);
      try {
        let createdContacts: Contact[] = [];
        let fileToUpload: File;

        if (sourceType === 'file' && data instanceof File) {
          fileToUpload = data;
        } else if ((sourceType === 'text' || sourceType === 'phonebook') && Array.isArray(data)) {
          // Validate and normalize contacts
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

          // Convert to CSV
          const csv = Papa.unparse(validContacts, {
            header: true,
            columns: ['name', 'phone_number', 'email'],
          });
          const blob = new Blob([csv], { type: 'text/csv' });
          fileToUpload = new File([blob], 'contacts.csv', { type: 'text/csv' });
        } else {
          throw new Error('Invalid data type for upload.');
        }

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (groupId !== 'all') {
          formData.append('group_id', groupId);
        }

        // Call bulkUploadContacts
        const response = await bulkUploadContacts(currentWorkspaceId, fileToUpload);
        createdContacts = response.contacts || [];
        if (!Array.isArray(createdContacts) || !response.success) {
          throw new Error(response.message || 'Bulk upload failed.');
        }

        await fetchContactsAndGroups();
        setError(null);
        setSelectedGroup(groupId);
        alert(`Successfully imported ${createdContacts.length} contacts.`);
      } catch (err: any) {
        setError(err.message || 'Failed to import contacts.');
      } finally {
        setIsLoading(false);
      }
    },
    [currentWorkspaceId, fetchContactsAndGroups]
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

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gray-100"
      >
        {/* Main Content */}
        <div className="p-4 sm:p-6">
          {/* Header Section */}
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

            {/* Search Bar */}
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

            {/* Stats Cards */}
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

          {/* Main Card with Wider Layout and Styled Dropdown */}
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