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
  refreshWorkspaces: () => Promise<void>; // New method to force refresh
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(() => {
    return localStorage.getItem('currentWorkspaceId') || null;
  });
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    if (!token) {
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
      localStorage.removeItem('currentWorkspaceId');
      return;
    }

    try {
      const data = await getWorkspaces();
      setWorkspaces(data);

      // Validate and update current workspace ID
      const storedId = localStorage.getItem('currentWorkspaceId');
      const isValidId = data.some((ws) => ws.workspace_id === storedId);
      const newCurrentId = isValidId ? storedId : data[0]?.workspace_id || null;

      if (newCurrentId !== currentWorkspaceId) {
        setCurrentWorkspaceIdState(newCurrentId);
        localStorage.setItem('currentWorkspaceId', newCurrentId || '');
      }
    } catch (error) {
      console.error('Workspace fetch error:', error);
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
      localStorage.removeItem('currentWorkspaceId');
      if (error.response?.status === 401) {
        // Handle unauthorized (e.g., logout or redirect)
        console.warn('Unauthorized access, consider logging out');
      }
    }
  }, [token, currentWorkspaceId]);

  // Refresh workspaces on demand
  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Initial fetch and token change handler
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Add workspace
  const handleAddWorkspace = useCallback(async (name: string) => {
    if (!name.trim()) throw new Error('Workspace name cannot be empty');
    try {
      const newWorkspace = await createWorkspace(name);
      setWorkspaces((prev) => [...prev, newWorkspace]);
      if (!currentWorkspaceId) {
        setCurrentWorkspaceIdState(newWorkspace.workspace_id);
        localStorage.setItem('currentWorkspaceId', newWorkspace.workspace_id);
      }
    } catch (error) {
      console.error('Workspace creation failed:', error);
      throw error;
    }
  }, [currentWorkspaceId]);

  // Update workspace
  const handleUpdateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    if (!id || !data) throw new Error('Invalid workspace ID or data');
    try {
      const updatedWorkspace = await updateWorkspace(id, data);
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.workspace_id === id ? { ...ws, ...updatedWorkspace } : ws))
      );
      if (id === currentWorkspaceId) {
        await fetchWorkspaces(); // Re-fetch to ensure consistency
      }
    } catch (error) {
      console.error('Workspace update failed:', error);
      throw error;
    }
  }, [currentWorkspaceId, fetchWorkspaces]);

  // Delete workspace
  const handleDeleteWorkspace = useCallback(async (id: string) => {
    if (!id) throw new Error('Invalid workspace ID');
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(id);
        setWorkspaces((prev) => prev.filter((ws) => ws.workspace_id !== id));
        if (currentWorkspaceId === id) {
          const newId = workspaces[0]?.workspace_id || null;
          setCurrentWorkspaceIdState(newId);
          localStorage.setItem('currentWorkspaceId', newId || '');
          await fetchWorkspaces(); // Re-fetch to ensure consistency
        }
      } catch (error) {
        console.error('Workspace deletion failed:', error);
        throw error;
      }
    }
  }, [currentWorkspaceId, workspaces, fetchWorkspaces]);

  // Get current workspace
  const getCurrentWorkspace = useCallback(() => {
    return workspaces.find((ws) => ws.workspace_id === currentWorkspaceId);
  }, [workspaces, currentWorkspaceId]);

  // Memoized context value
  const contextValue = useMemo(() => ({
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId: (id: string) => {
      if (workspaces.some((ws) => ws.workspace_id === id)) {
        setCurrentWorkspaceIdState(id);
        localStorage.setItem('currentWorkspaceId', id);
      } else {
        console.warn('Invalid workspace ID:', id);
        setCurrentWorkspaceIdState(null);
        localStorage.removeItem('currentWorkspaceId');
      }
    },
    addWorkspace: handleAddWorkspace,
    updateWorkspace: handleUpdateWorkspace,
    deleteWorkspace: handleDeleteWorkspace,
    getCurrentWorkspace,
    refreshWorkspaces,
  }), [
    workspaces,
    currentWorkspaceId,
    handleAddWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    getCurrentWorkspace,
    refreshWorkspaces,
  ]);

  return <WorkspaceContext.Provider value={contextValue}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};