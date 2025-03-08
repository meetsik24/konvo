import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getWorkspaces, createWorkspace, updateWorkspace as apiUpdateWorkspace, deleteWorkspace as apiDeleteWorkspace } from '../services/api';

interface Workspace {
  id: string;
  name: string;
  dashboardData: { stats: any[]; data: any[] };
  campaigns: { id: string; name: string }[];
  contacts: { id: string; name: string; email: string }[];
  senderIds: { id: string; value: string }[];
  logs: { id: string; message: string; timestamp: string }[];
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
  addWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  getCurrentWorkspace: () => Workspace | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(localStorage.getItem('currentWorkspaceId'));
  const { user, token } = useSelector((state: RootState) => state.auth);

  const setCurrentWorkspaceId = (id: string) => {
    console.log('Setting currentWorkspaceId to:', id);
    setCurrentWorkspaceIdState(id);
    localStorage.setItem('currentWorkspaceId', id);
  };

  useEffect(() => {
    const fetchWorkspaces = async () => {
      console.log('Fetching workspaces with token:', token);
      try {
        const workspaceData = await getWorkspaces();
        console.log('Workspaces fetched:', workspaceData);
        setWorkspaces(workspaceData);
        if (workspaceData.length > 0) {
          const storedId = localStorage.getItem('currentWorkspaceId');
          const validId = workspaceData.some((ws) => ws.id === storedId) ? storedId : workspaceData[0].id;
          console.log('Setting currentWorkspaceId on fetch:', validId);
          setCurrentWorkspaceId(validId || workspaceData[0].id);
        } else {
          console.log('No workspaces available, resetting currentWorkspaceId');
          setCurrentWorkspaceId(null);
          localStorage.removeItem('currentWorkspaceId');
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    };

    if (token) {
      console.log('Token present, initiating fetch');
      fetchWorkspaces();
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
        console.log('No current workspace, setting to:', newWorkspace.id);
        setCurrentWorkspaceId(newWorkspace.id);
      }
    } catch (error) {
      console.error('Failed to add workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    console.log('Updating workspace ID:', id, 'with data:', data);
    try {
      const updatedWorkspace = await apiUpdateWorkspace(id, data);
      setWorkspaces((prev) => prev.map((ws) => (ws.id === id ? { ...ws, ...updatedWorkspace } : ws)));
    } catch (error) {
      console.error('Failed to update workspace:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (id: string) => {
    console.log('Deleting workspace ID:', id);
    try {
      await apiDeleteWorkspace(id);
      setWorkspaces((prev) => {
        const updated = prev.filter((ws) => ws.id !== id);
        console.log('Workspaces after deletion:', updated);
        return updated;
      });
      if (currentWorkspaceId === id) {
        const newId = workspaces.length > 1 ? workspaces[0].id : null;
        console.log('Current workspace deleted, new currentWorkspaceId:', newId);
        setCurrentWorkspaceId(newId);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  };

  const getCurrentWorkspace = () => {
    const current = workspaces.find((ws) => ws.id === currentWorkspaceId);
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