import React, { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useWorkspace } from './WorkspaceContext';
import { bulkUploadContacts, createGroup } from '../services/api';

interface Group {
  group_id: string;
  name: string;
  count: number;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupId: string, data: File, sourceType: 'file') => void;
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
}

interface UploadStats {
  totalContacts: number;
  duplicates: number;
  formatErrors: number;
  uploaded: number;
}

// Internal Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onBack?: () => void;
  submitText?: string;
  cancelText?: string;
  showBackButton?: boolean;
  isSubmitDisabled?: boolean;
}> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  onBack,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showBackButton = false,
  isSubmitDisabled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-3xl">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-[#00333e]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">{children}</div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-1 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
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
              disabled={isSubmitDisabled}
              className={`text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00333e] text-white hover:bg-[#005a6e]'} rounded-lg transition-colors duration-200`}
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit, groups, setGroups }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats] = useState<UploadStats>({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });
  const [showSummary, setShowSummary] = useState(false);

  const { currentWorkspaceId } = useWorkspace();
  const MAX_FILE_SIZE_MB = 10;

  useEffect(() => {
    if (groups.length > 0 && selectedGroup === '') {
      setSelectedGroup(groups[0].group_id);
    }
  }, [groups, selectedGroup]);

  const standardizePhoneNumber = (phoneNumber: string): string | null => {
    if (!phoneNumber) return null;

    let cleanNumber = phoneNumber.replace(/\D/g, '');

    if (cleanNumber.startsWith('0') && cleanNumber.length > 1) {
      cleanNumber = '255' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('255') && !cleanNumber.startsWith('+')) {
      cleanNumber = '+' + cleanNumber;
    } else if (!cleanNumber.startsWith('+255')) {
      cleanNumber = '+255' + cleanNumber;
    }

    if (!cleanNumber.match(/^\+255\d{9}$/)) {
      return null;
    }

    return cleanNumber;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setError(null);
    setStats({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });

    if (uploadedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File too large: Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
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
          const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
          const headers = parsed.meta.fields as string[] | undefined;

          if (!headers || !headers.includes('name') || !headers.includes('phone_number')) {
            setError('Missing required columns: Your file must include "name" and "phone_number" columns.');
            return;
          }

          const allData = parsed.data as any[];
          const phoneNumbersSet = new Set<string>();
          const uniqueAndFormattedData: any[] = [];
          let currentDuplicates = 0;
          let currentFormatErrors = 0;

          allData.forEach((row) => {
            const name = row.name?.toString().trim();
            const originalPhoneNumber = row.phone_number?.toString().trim();

            if (!name) {
              currentFormatErrors++;
              return;
            }

            const formattedPhoneNumber = standardizePhoneNumber(originalPhoneNumber);

            if (!formattedPhoneNumber) {
              currentFormatErrors++;
              return;
            }

            if (phoneNumbersSet.has(formattedPhoneNumber)) {
              currentDuplicates++;
              return;
            }

            phoneNumbersSet.add(formattedPhoneNumber);
            uniqueAndFormattedData.push({ ...row, name, phone_number: formattedPhoneNumber });
          });

          setStats({
            totalContacts: allData.length,
            duplicates: currentDuplicates,
            formatErrors: currentFormatErrors,
            uploaded: 0,
          });

          setFile(uploadedFile);
          setPreviewData(uniqueAndFormattedData);
          setStep(2);
          setError(null);
        } catch (err: any) {
          setError(`Error processing file: Could not parse your file. Please ensure it's a valid CSV/Excel format. Details: ${err.message}`);
          setStats({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });
        }
      };
      reader.onerror = () => {
        setError('File read failed: Unable to read the selected file. Please try again or use a different file.');
        setStats({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });
      };
      reader.readAsText(uploadedFile);
    } else {
      setError('Unsupported file format: Please upload a CSV (.csv) or Excel (.xls, .xlsx) file.');
      setStats({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });
    }
  };

  const handleCreateGroup = async () => {
    if (!currentWorkspaceId) {
      setError('Workspace not found: Please ensure a workspace is selected before creating a group.');
      return;
    }
    if (!newGroupName.trim()) {
      setError('Group name is required: Please enter a name for the new group.');
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
      setError(`Failed to create group "${newGroupName.trim()}": ${error.message || 'An unexpected error occurred.'} Please try again.`);
    }
  };

  const handleFinalImport = async () => {
    let interval: NodeJS.Timeout | null = null;

    try {
      if (!currentWorkspaceId) {
        throw new Error('No workspace selected. Please select a workspace.');
      }
      if (!file) {
        throw new Error('No file selected. Please upload a CSV or Excel file.');
      }
      if (!selectedGroup || selectedGroup === 'all') {
        throw new Error('No group selected. Please select an existing group or create a new one.');
      }

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      console.log("Uploading to group_id:", selectedGroup);
      const response = await bulkUploadContacts(currentWorkspaceId, file, selectedGroup);

      if (interval) clearInterval(interval);
      setUploadProgress(100);

      if (!response.success) {
        throw new Error(response.message || 'Upload failed. Please check the file and try again.');
      }

      const uploadedCount = response.contacts?.length || 0;
      setStats((prev) => ({ ...prev, uploaded: uploadedCount }));
      setError(null);
      setShowSummary(true);
    } catch (err: any) {
      if (interval) clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(`Upload failed: ${err.message || 'An unexpected error occurred during upload.'}`);
      setStats((prev) => ({ ...prev, uploaded: 0 }));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
    setError(null);
    setShowSummary(false);
  };

  const submitText = step === 1 ? 'Next' : (isUploading ? 'Uploading...' : 'Import Contacts');

  const resetModalState = () => {
    setStep(1);
    setFile(null);
    setSelectedGroup(groups.length > 0 ? groups[0].group_id : '');
    setNewGroupName('');
    setPreviewData([]);
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setStats({ totalContacts: 0, duplicates: 0, formatErrors: 0, uploaded: 0 });
    setShowSummary(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModalState();
        onClose();
      }}
      title="Import Contacts"
      onSubmit={step === 1 ? () => setStep(2) : (showSummary ? () => { resetModalState(); onClose(); } : handleFinalImport)}
      onBack={step > 1 && !showSummary ? handleBack : undefined}
      submitText={showSummary ? 'Done' : submitText}
      cancelText="Cancel"
      showBackButton={step > 1 && !showSummary}
      isSubmitDisabled={isUploading || (step === 1 && !file) || (step === 2 && !selectedGroup)}
    >
      {error && (
        <div className="text-red-600 bg-red-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm border border-red-200">
          <p className="font-semibold mb-1">Import Error:</p>
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

      {step === 1 && !showSummary && (
        <div className="space-y-4 sm:space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-2 sm:mb-4" />
            <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
              Drag and drop your contact file here, or click to select.
              <br />
              **Supported formats: CSV or Excel (.xls, .xlsx).**
              <br />
              **File must include "name" and "phone_number" columns.** Email is optional.
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
              className="inline-block text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] cursor-pointer transition-colors duration-200"
            >
              Browse Files
            </label>
            {file && (
              <p className="mt-2 text-gray-700 text-sm">Selected: <span className="font-medium">{file.name}</span></p>
            )}
          </div>
        </div>
      )}

      {step === 2 && !showSummary && (
        <div>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Preview Data ({previewData.length} records)</h3>
            <div className="overflow-x-auto max-h-[200px] sm:max-h-[250px] border border-gray-200 rounded-lg mb-4">
              <table className="w-full text-left text-gray-700">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    {previewData.length > 0 ? Object.keys(previewData[0]).map((header) => (
                      <th key={header} className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] font-semibold">
                        {header}
                      </th>
                    )) : (
                      <th className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] font-semibold">No headers available</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewData.length > 0 ? previewData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={100} className="p-2 sm:p-3 text-center text-gray-500 text-xs sm:text-sm">
                        No valid contacts to preview. Check for format errors or missing data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <label htmlFor="group-select" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">
              Select Group
            </label>
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent mb-4 sm:mb-6"
            >
              {groups.length === 0 && <option value="">No groups available. Create one below.</option>}
              {groups
                .filter((group) => group.group_id && group.group_id !== 'all')
                .map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name || `Group ${group.group_id}`}
                  </option>
                ))}
            </select>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="new-group-name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700">
                Or Create New Group
              </label>
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  id="new-group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent"
                  placeholder="Enter new group name"
                />
                <button
                  onClick={handleCreateGroup}
                  className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200 flex-shrink-0"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
          {isUploading && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Uploading Contacts...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#005a6e] h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{uploadProgress}% Complete</p>
            </div>
          )}
        </div>
      )}

      {showSummary && (
        <div className="text-center p-4 sm:p-6 transition-opacity duration-300 ease-in-out">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4 animate-bounce-once" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Contacts Upload Complete!</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Your contacts have been successfully processed and added to the selected group.</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="font-medium text-green-700 text-sm">Contacts Uploaded</p>
              <p className="text-lg font-bold text-green-800">{stats.uploaded}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-700 text-sm">Duplicates Ignored</p>
              <p className="text-lg font-bold text-yellow-800">{stats.duplicates}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="font-medium text-red-700 text-sm">Format Errors Discarded</p>
              <p className="text-lg font-bold text-red-800">{stats.formatErrors}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-700 text-sm">Total Processed</p>
              <p className="text-lg font-bold text-blue-800">{stats.totalContacts}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 sm:mt-6 border-t border-gray-200 pt-2 sm:pt-3">
        <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2">Upload Summary</h3>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <div className="flex-1 min-w-[100px] p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">Total Contacts</p>
            <p className="text-[#00333e] font-bold">{stats.totalContacts}</p>
          </div>
          <div className="flex-1 min-w-[100px] p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">Duplicates</p>
            <p className="text-[#00333e] font-bold">{stats.duplicates}</p>
          </div>
          <div className="flex-1 min-w-[100px] p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">Format Errors</p>
            <p className="text-[#00333e] font-bold">{stats.formatErrors}</p>
          </div>
          <div className="flex-1 min-w-[100px] p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="font-medium text-gray-700">Uploaded</p>
            <p className="text-[#00333e] font-bold">{stats.uploaded}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;