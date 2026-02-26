const STORAGE_KEY_PREFIX = 'briq_default_sender';

function storageKey(workspaceId: string): string {
  return `${STORAGE_KEY_PREFIX}_${workspaceId}`;
}

export function getDefaultSenderId(workspaceId: string | null): string | null {
  if (!workspaceId) return null;
  try {
    return localStorage.getItem(storageKey(workspaceId));
  } catch {
    return null;
  }
}

export function setDefaultSenderId(workspaceId: string | null, senderId: string | null): void {
  if (!workspaceId) return;
  try {
    if (senderId) {
      localStorage.setItem(storageKey(workspaceId), senderId);
    } else {
      localStorage.removeItem(storageKey(workspaceId));
    }
  } catch {
    // ignore
  }
}
