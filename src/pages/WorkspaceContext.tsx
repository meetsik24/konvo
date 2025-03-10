import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { getWorkspaces, createWorkspace, apiUpdateWorkspace as updateWorkspace, deleteWorkspace } from '../services/api';

// Define interfaces for Campaigns and SenderIds to match SendSMS and SenderID components
interface Campaign {
  campaign_id: string;
  workspace_id: string;
  name: string;
  description: string;
  launch_date: string;
  created_by: string;
  created_at: string;
}

interface SenderId {
  sender_id: string;
  user_id: string;
  is_approved: boolean;
  approved_at?: string;
  name: string;
  created_at?: string;
  request_id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requested_at?: string;
  reviewed_at?: string;
}

interface Workspace {
  workspace_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  campaigns?: Campaign[]; // Add campaigns as an optional field
  senderIds?: SenderId[]; // Add senderIds as an optional field
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string) => void;
  addWorkspace: (name: string) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  getCurrentWorkspace: () => Workspace | undefined;
  refreshWorkspaces: () => Promise<void>;
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
      // Ensure each workspace has campaigns and senderIds fields (even if empty)
      const formattedWorkspaces = Array.isArray(data)
        ? data.map((ws: Workspace) => ({
            ...ws,
            campaigns: ws.campaigns || [],
            senderIds: ws.senderIds || [],
          }))
        : [];
      setWorkspaces(formattedWorkspaces);

      // Validate and update current workspace ID
      const storedId = localStorage.getItem('currentWorkspaceId');
      const isValidId = formattedWorkspaces.some((ws) => ws.workspace_id === storedId);
      const newCurrentId = isValidId ? storedId : formattedWorkspaces[0]?.workspace_id || null;

      if (newCurrentId !== currentWorkspaceId) {
        setCurrentWorkspaceIdState(newCurrentId);
        localStorage.setItem('currentWorkspaceId', newCurrentId || '');
      }
    } catch (error: any) {
      console.error('Workspace fetch error:', error.response?.data || error.message);
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
      localStorage.removeItem('currentWorkspaceId');
      if (error.response?.status === 401) {
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
      // Initialize campaigns and senderIds as empty arrays
      const formattedNewWorkspace = {
        ...newWorkspace,
        campaigns: [],
        senderIds: [],
      };
      setWorkspaces((prev) => [...prev, formattedNewWorkspace]);
      if (!currentWorkspaceId) {
        setCurrentWorkspaceIdState(newWorkspace.workspace_id);
        localStorage.setItem('currentWorkspaceId', newWorkspace.workspace_id);
      }
    } catch (error: any) {
      console.error('Workspace creation failed:', error.response?.data || error.message);
      throw error;
    }
  }, [currentWorkspaceId]);

  // Update workspace
  const handleUpdateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    if (!id || !data) throw new Error('Invalid workspace ID or data');
    try {
      const updatedWorkspace = await updateWorkspace(id, data);
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.workspace_id === id
            ? {
                ...ws,
                ...updatedWorkspace,
                campaigns: updatedWorkspace.campaigns || ws.campaigns || [], // Preserve or update campaigns
                senderIds: updatedWorkspace.senderIds || ws.senderIds || [], // Preserve or update senderIds
              }
            : ws
        )
      );
      if (id === currentWorkspaceId) {
        await fetchWorkspaces(); // Re-fetch to ensure consistency
      }
    } catch (error: any) {
      console.error('Workspace update failed:', error.response?.data || error.message);
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
      } catch (error: any) {
        console.error('Workspace deletion failed:', error.response?.data || error.message);
        throw error;
      }
    }
  }, [currentWorkspaceId, workspaces, fetchWorkspaces]);

  // Get current workspace
  const getCurrentWorkspace = useCallback(() => {
    return workspaces.find((ws) => ws.workspace_id === currentWorkspaceId);
  }, [workspaces, currentWorkspaceId]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
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
    }),
    [
      workspaces,
      currentWorkspaceId,
      handleAddWorkspace,
      handleUpdateWorkspace,
      handleDeleteWorkspace,
      getCurrentWorkspace,
      refreshWorkspaces,
    ]
  );

  return <WorkspaceContext.Provider value={contextValue}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};