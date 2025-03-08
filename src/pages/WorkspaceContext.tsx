import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '../services/api'; // Updated imports

interface Workspace {
  workspace_id: string; // Changed from id
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  dashboardData?: { stats: any[]; data: any[] };
  campaigns?: { id: string; name: string }[];
  contacts?: { id: string; name: string; email: string }[];
  senderIds?: { id: string; value: string }[];
  logs?: { id: string; message: string; timestamp: string }[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
  addWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  getCurrentWorkspace: () => Workspace | undefined;
  getWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(localStorage.getItem('currentWorkspaceId'));
  const { token } = useSelector((state: RootState) => state.auth);

  const setCurrentWorkspaceId = (id: string) => {
    console.log('Setting currentWorkspaceId to:', id);
    setCurrentWorkspaceIdState(id);
    localStorage.setItem('currentWorkspaceId', id);
  };

  const getWorkspace = async () => {
    console.log('Fetching workspaces with token:', token);
    try {
      const workspaceData = await getWorkspaces();
      console.log('Workspaces fetched:', workspaceData);
      setWorkspaces(workspaceData);
      if (workspaceData.length > 0) {
        const storedId = localStorage.getItem('currentWorkspaceId');
        const validId = workspaceData.some((ws) => ws.workspace_id === storedId) ? storedId : workspaceData[0].workspace_id;
        console.log('Setting currentWorkspaceId on fetch:', validId);
        setCurrentWorkspaceId(validId || workspaceData[0].workspace_id);
      } else {
        console.log('No workspaces available, resetting currentWorkspaceId');
        setCurrentWorkspaceId(null);
        localStorage.removeItem('currentWorkspaceId');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - redirecting to login');
        // Handle unauthorized access, e.g., redirect to login page
      } else {
        console.error('Failed to fetch workspaces:', error);
      }
    }
  };

  useEffect(() => {
    if (token) {
      console.log('Token present, initiating fetch');
      getWorkspace();
    } else {
      console.log('No token, skipping fetch');
    }
  }, [token]);

  const addWorkspace = async (name: string) => {
    console.log('Adding workspace:', name);
    try {
      const newWorkspace = await createWorkspace(name);
      console.log('New workspace added:', newWorkspace);
      setWorkspaces((prev) => [...prev, newWorkspace]);
      if (!currentWorkspaceId) {
        console.log('No current workspace, setting to:', newWorkspace.workspace_id);
        setCurrentWorkspaceId(newWorkspace.workspace_id);
      }
    } catch (error) {
      console.error('Failed to add workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    console.log('Updating workspace ID:', id, 'with data:', data);
    try {
      const updatedWorkspace = await updateWorkspace(id, data);
      setWorkspaces((prev) => prev.map((ws) => (ws.workspace_id === id ? { ...ws, ...updatedWorkspace } : ws)));
    } catch (error) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (id: string) => {
    console.log('Deleting workspace ID:', id);
    try {
      await deleteWorkspace(id); // Call the API function directly
      setWorkspaces((prev) => {
        const updated = prev.filter((ws) => ws.workspace_id !== id); // Changed from ws.id
        console.log('Workspaces after deletion:', updated);
        return updated;
      });
      if (currentWorkspaceId === id) {
        const newId = workspaces.length > 1 ? workspaces[0].workspace_id : null; // Changed from workspaces[0].id
        console.log('Current workspace deleted, new currentWorkspaceId:', newId);
        setCurrentWorkspaceId(newId);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  };

  const getCurrentWorkspace = () => {
    const current = workspaces.find((ws) => ws.workspace_id === currentWorkspaceId); // Changed from ws.id
    console.log('Current workspace:', current);
    return current;
  };

  console.log('WorkspaceProvider state:', { workspaces, currentWorkspaceId });

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        getWorkspace,
        getCurrentWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};