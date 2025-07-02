import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store'; // Adjust path as needed
import { getWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '../services/api'; // Fixed import
import { logout } from '../store/slices/authSlice';

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
  user_id: string; // Added user_id property
  name: string;
  description: string;
  created_at: string;
  campaigns?: Campaign[]; // Ensure campaigns is optional
  senderIds?: SenderId[];
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
  isLoading: boolean; // Add loading state
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(() => {
    return localStorage.getItem('currentWorkspaceId') || null;
  });
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if token exists in localStorage if Redux state is not yet hydrated
      const storedToken = localStorage.getItem('token');
      if (!token && !storedToken) {
        setWorkspaces([]);
        setCurrentWorkspaceIdState(null);
        localStorage.removeItem('currentWorkspaceId');
        setIsLoading(false);
        return;
      }

      const data = await getWorkspaces();
      const formattedWorkspaces = Array.isArray(data)
        ? data.map((ws: Partial<Workspace>) => ({
            workspace_id: ws.workspace_id || '',
            user_id: ws.user_id || '',
            name: ws.name || 'Unnamed Workspace',
            description: ws.description || '',
            created_at: ws.created_at || '',
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
        if (newCurrentId) {
          localStorage.setItem('currentWorkspaceId', newCurrentId);
        } else {
          localStorage.removeItem('currentWorkspaceId');
        }
      }
    } catch (error: any) {
      console.error('Workspace fetch error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        // Unauthorized: Log out the user
        dispatch(logout());
        setWorkspaces([]);
        setCurrentWorkspaceIdState(null);
        localStorage.removeItem('currentWorkspaceId');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, currentWorkspaceId, dispatch]);

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
      const formattedNewWorkspace: Workspace = {
        workspace_id: newWorkspace.workspace_id || '',
        user_id: newWorkspace.user_id || '',
        name: newWorkspace.name || 'Unnamed Workspace',
        description: newWorkspace.description || '',
        created_at: newWorkspace.created_at || '',
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
      const updatedWorkspace = await updateWorkspace(id, data); // Fixed to use updateWorkspace
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.workspace_id === id
            ? {
                ...ws,
                ...updatedWorkspace,
                campaigns: updatedWorkspace.campaigns || ws.campaigns || [],
                senderIds: updatedWorkspace.senderIds || ws.senderIds || [],
              }
            : ws
        )
      );
      if (id === currentWorkspaceId) {
        await fetchWorkspaces();
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
          await fetchWorkspaces();
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
      isLoading, // Expose loading state
    }),
    [
      workspaces,
      currentWorkspaceId,
      handleAddWorkspace,
      handleUpdateWorkspace,
      handleDeleteWorkspace,
      getCurrentWorkspace,
      refreshWorkspaces,
      isLoading,
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