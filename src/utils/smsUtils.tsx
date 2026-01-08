import { getContacts, getGroupContacts } from '../services/api.tsx';

export interface Contact {
  contact_id: string;
  phone_number: string;
}

export const fetchAllContacts = async (workspaceId: string, groupId?: string): Promise<Contact[]> => {
  const perPage = 50;
  let items: Contact[] = [];
  let totalPages = 1;
  try {
    console.log(`Fetching contacts for ${groupId || 'all'}...`);
    const response = await (groupId
      ? getGroupContacts(workspaceId, groupId, 1, perPage)
      : getContacts(workspaceId, 1, perPage));
    items = response.contacts || [];
    totalPages = response.total_pages || 1;
    console.log(`Fetched ${items.length} contacts, total pages: ${totalPages}`);
    if (totalPages > 1) {
      const requests = Array.from({ length: totalPages - 1 }, (_, i) =>
        groupId
          ? getGroupContacts(workspaceId, groupId, i + 2, perPage)
          : getContacts(workspaceId, i + 2, perPage)
      );
      const responses = await Promise.all(requests);
      items = [...items, ...responses.flatMap((res) => res.contacts || [])];
    }
    return items;
  } catch (error) {
    console.error('Contact fetch error:', error);
    throw new Error('Failed to fetch contacts');
  }
};

export const getRecipients = async (
  workspaceId: string,
  groupIds: string[],
  contactCache: Map<string, Contact[]>
): Promise<string[]> => {
  if (!workspaceId) {
    console.warn('No workspace ID');
    return [];
  }
  const phones: string[] = [];
  for (const groupId of groupIds) {
    if (contactCache.has(groupId)) {
      phones.push(...contactCache.get(groupId)!.map((c) => c.phone_number));
      continue;
    }
    try {
      const contacts = await fetchAllContacts(workspaceId, groupId);
      contactCache.set(groupId, contacts);
      phones.push(...contacts.map((c) => c.phone_number));
    } catch (err) {
      console.error(`Error fetching contacts for group ${groupId}:`, err);
    }
  }
  const validPhones = [...new Set(phones)].filter((p) => p && /^\+?\d{10,15}$/.test(p.trim()));
  console.log('Recipients fetched:', validPhones);
  return validPhones;
};