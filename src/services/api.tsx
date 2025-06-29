const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSubmit, groups }) => {
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
      setSelectedGroup(newGroup.group_id);
      setNewGroupName('');
      setError(null);
      onClose(); // Close modal to trigger parent re-fetch
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
                  className="bg-[#005a6e] h-2.5 rounded-full transition-all duration-200"
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
                <CheckCircle className="w- estejam 10 h-10" />
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
};tificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
    console.log(`Notification ${notificationId} marked as read`);
  } catch (error: any) {
    handleApiError(error, `Failed to mark notification ${notificationId} as read`);
  }
};



// New function to generate an SMS message using the /draft_generate_message endpoint
export const generateMessage = async (prompt: string): Promise<string> => {
  try {
    const provider = 'anthropic'; // Predefine the provider as "anthropic"
    console.log('Sending request to /draft:', prompt, 'and provider:', provider);
    const response = await api.post('/draft', { prompt, provider });
    console.log('Raw response from /draft:', response.data);

    // Handle the response format based on the API specification
    if (response.data && typeof response.data === 'object' && 'draft' in response.data) {
      const generatedMessage = response.data.draft;
      if (typeof generatedMessage !== 'string') {
        throw new Error('The "draft" field in the response is not a string');
      }
      return generatedMessage;
    } else {
      throw new Error('Unexpected response format from /draft_generate_message');
    }
  } catch (error: any) {
    handleApiError(error, 'Failed to generate SMS message');
  }
};


// API KEYS
export const listApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await api.get("/api-keys/");
    console.log("listApiKeys API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API keys");
    return [];
  }
};

export const createApiKey = async (data: { name: string; expires_at?: string }): Promise<ApiKey> => {
  try {
    const response = await api.post("/api-keys/", data);
    console.log("createApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create API key");
  }
};

export const getApiKey = async (keyId: string): Promise<ApiKey> => {
  try {
    const response = await api.get(`/api-keys/${keyId}`);
    console.log("getApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API key");
  }
};

export const updateApiKey = async (keyId: string, data: { name?: string; status?: "active" | "inactive" }): Promise<ApiKey> => {
  try {
    const response = await api.put(`/api-keys/${keyId}`, data);
    console.log("updateApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update API key");
  }
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  try {
    await api.delete(`/api-keys/${keyId}`);
    console.log("API key deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete API key");
  }
};

// CALLS
export const makeCall = async (
  workspaceId: string,
  data: CallRequest
): Promise<{ call_log_id: string; status: string }> => {
  console.log('makeCall API call initiated for workspace:', workspaceId, 'with data:', data);
  try {
    if (!data.tts_message && !data.audio_url) {
      throw new Error('Either tts_message or audio_url must be provided');
    }

    console.log('Request URL:', `${api.defaults.baseURL}/calls/make`);
    console.log('Headers:', api.defaults.headers);
    const response = await api.post(`/calls/make`, {
      workspace_id: workspaceId,
      ...data,
    });
    console.log('makeCall API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to make call');
    throw error; // Ensure the error is rethrown for the caller
  }
};

export const getCallLogs = async (
  userId: string
): Promise<CallLogsResponse | undefined> => {
  console.log('getCallLogs API call initiated for user:', userId);
  try {
    const response = await api.get(`/calls/logs`, {
      params: { user_id: userId },
    });
    console.log('getCallLogs API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to fetch call logs');
  }
  return undefined; // Ensure all code paths return a value
};



export default api;