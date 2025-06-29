import { useState } from 'react';
import Papa from 'papaparse';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Modal from './Modal';

interface Group {
  group_id: string;
  name: string;
  workspace_id: string;
  count: number;
}

interface Contact {
  contact_id?: string;
  name: string;
  phone_number: string;
  email?: string;
  workspace_id?: string;
  group_ids?: string[];
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (groupId: string, data: File | Contact[], sourceType: 'file' | 'text' | 'phonebook') => void;
  groups: Group[];
  handleAddGroup: (callback?: (newGroupId: string) => void) => Promise<void>;
  isGroupCreating: boolean;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  groups,
  handleAddGroup,
  isGroupCreating,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [importData, setImportData] = useState<File | Contact[] | null>(null);
  const [sourceType, setSourceType] = useState<'file' | 'text' | 'phonebook'>('file');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);

  const handleGroupCreation = async () => {
    if (!newGroupName.trim()) {
      setGroupError('Group name is required.');
      return;
    }

    setGroupError(null);
    await handleAddGroup((newGroupId: string) => {
      setSelectedGroup(newGroupId);
      setShowCreateGroup(false);
      setNewGroupName('');
    });
  };

  const handleImportSubmit = () => {
    if (!importData) {
      setGroupError('Please select a file or enter contact data.');
      return;
    }
    if (isGroupCreating) {
      setGroupError('Please wait until group creation is complete.');
      return;
    }
    onSubmit(selectedGroup, importData, sourceType);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setShowCreateGroup(false);
        setNewGroupName('');
        setGroupError(null);
        setImportData(null);
        setSelectedGroup('all');
      }}
      title="Import Contacts"
      onSubmit={handleImportSubmit}
      submitText="Import"
      submitDisabled={isGroupCreating || !importData}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="groupSelect" className="block text-sm font-medium mb-1 text-gray-700">
            Select Group
          </label>
          <select
            id="groupSelect"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isGroupCreating}
          >
            {groups.map((group) => (
              <option key={group.group_id} value={group.group_id}>
                {group.name} ({group.count} contacts)
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="mt-2 text-sm text-[#00333e] hover:text-[#005a6e] underline"
            disabled={isGroupCreating}
          >
            Create New Group
          </button>
        </div>

        {showCreateGroup && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Group</h3>
            <input
              type="text"
              placeholder="Enter group name"
              className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              disabled={isGroupCreating}
            />
            {groupError && <p className="text-red-600 text-sm mt-1">{groupError}</p>}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGroupCreation}
                className="text-sm py-2 px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] disabled:bg-gray-400"
                disabled={isGroupCreating}
              >
                {isGroupCreating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Group'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateGroup(false);
                  setNewGroupName('');
                  setGroupError(null);
                }}
                className="text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                disabled={isGroupCreating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Import Source
          </label>
          <select
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as 'file' | 'text' | 'phonebook')}
            disabled={isGroupCreating}
          >
            <option value="file">CSV File</option>
            <option value="text">Text Input</option>
            <option value="phonebook">Phonebook</option>
          </select>
        </div>

        {sourceType === 'file' ? (
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportData(e.target.files?.[0] || null)}
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg"
            disabled={isGroupCreating}
          />
        ) : (
          <textarea
            placeholder="Enter contacts (one per line, format: name,phone,email)"
            className="w-full text-sm py-3 px-4 border border-gray-300 rounded-lg"
            rows={5}
            onChange={(e) => {
              const contacts = e.target.value
                .split('\n')
                .map((line) => {
                  const [name, phone_number, email] = line.split(',');
                  return { name, phone_number, email };
                })
                .filter((c) => c.name && c.phone_number);
              setImportData(contacts);
            }}
            disabled={isGroupCreating}
          />
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;