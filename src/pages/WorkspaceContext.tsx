import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getWorkspaces, createWorkspace, apiUpdateWorkspace as updateWorkspace, deleteWorkspace } from '../services/api';

interface Workspace {
  workspace_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
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
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(() => {
    return localStorage.getItem('currentWorkspaceId');
  });
  
  // Stable token selector
  const token = useSelector((state: RootState) => state.auth.token);

  // Memoized workspace fetcher
  const fetchWorkspaces = useCallback(async () => {
    if (!token) {
      setWorkspaces([]);
      return;
    }

    try {
      const data = await getWorkspaces();
      setWorkspaces(data);

      // Validate current workspace ID
      const storedId = localStorage.getItem('currentWorkspaceId');
      const isValidId = data.some(ws => ws.workspace_id === storedId);
      const firstId = data[0]?.workspace_id || null;
      
      const newCurrentId = isValidId ? storedId : firstId;
      if (newCurrentId !== currentWorkspaceId) {
        setCurrentWorkspaceId(newCurrentId);
        localStorage.setItem('currentWorkspaceId', newCurrentId || '');
      }
    } catch (error) {
      console.error('Workspace fetch error:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized error
      }
    }
  }, [token, currentWorkspaceId]);

  // Initial fetch and token change handler
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Add workspace handler
  const handleAddWorkspace = useCallback(async (name: string) => {
    try {
      const newWorkspace = await createWorkspace(name);
      setWorkspaces(prev => [...prev, newWorkspace]);
      
      // Auto-select new workspace if no current selection
      if (!currentWorkspaceId) {
        setCurrentWorkspaceId(newWorkspace.workspace_id);
      }
    } catch (error) {
      console.error('Workspace creation failed:', error);
      throw error;
    }
  }, [currentWorkspaceId]);

  // Update workspace handler
  const handleUpdateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    try {
      const updatedWorkspace = await updateWorkspace(id, data);
      setWorkspaces(prev => 
        prev.map(ws => ws.workspace_id === id ? { ...ws, ...updatedWorkspace } : ws)
      );
    } catch (error) {
      console.error('Workspace update failed:', error);
      throw error;
    }
  }, []);

  // Delete workspace handler
  const handleDeleteWorkspace = useCallback(async (id: string) => {
    try {
      await deleteWorkspace(id);
      setWorkspaces(prev => {
        const updated = prev.filter(ws => ws.workspace_id !== id);
        
        // Update current workspace if deleted
        if (currentWorkspaceId === id) {
          const newId = updated[0]?.workspace_id || null;
          setCurrentWorkspaceId(newId);
          localStorage.setItem('currentWorkspaceId', newId || '');
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Workspace deletion failed:', error);
      throw error;
    }
  }, [currentWorkspaceId]);

  // Get current workspace
  const getCurrentWorkspace = useCallback(() => {
    return workspaces.find(ws => ws.workspace_id === currentWorkspaceId);
  }, [workspaces, currentWorkspaceId]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId: (id: string) => {
      localStorage.setItem('currentWorkspaceId', id);
      setCurrentWorkspaceId(id);
    },
    addWorkspace: handleAddWorkspace,
    updateWorkspace: handleUpdateWorkspace,
    deleteWorkspace: handleDeleteWorkspace,
    getCurrentWorkspace
  }), [
    workspaces,
    currentWorkspaceId,
    handleAddWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    getCurrentWorkspace
  ]);

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};