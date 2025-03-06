// WorkspaceContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  addWorkspace: (name: string) => void;
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  getCurrentWorkspace: () => Workspace | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

  const addWorkspace = (name: string) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      dashboardData: { stats: [], data: [] },
      campaigns: [],
      contacts: [],
      senderIds: [],
      logs: [],
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    if (!currentWorkspaceId) setCurrentWorkspaceId(newWorkspace.id);
  };

  const updateWorkspace = (id: string, data: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, ...data } : ws))
    );
  };

  const getCurrentWorkspace = () => {
    return workspaces.find((ws) => ws.id === currentWorkspaceId);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        addWorkspace,
        updateWorkspace,
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