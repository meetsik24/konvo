import { format, formatDistanceToNow } from 'date-fns';

export function formatRelativeTime(isoDate: string): string {
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true });
  } catch {
    return isoDate;
  }
}

export function formatMessageTime(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'h:mm a');
  } catch {
    return isoDate;
  }
}

/** Extract display text from API last_message object (may have body, text, etc.) */
export function getMessagePreview(msg: Record<string, unknown>): string {
  if (!msg || typeof msg !== 'object') return 'Message';
  if (typeof msg.body === 'string') return msg.body;
  if (typeof msg.text === 'string') return msg.text;
  if (typeof msg.content === 'string') return msg.content;
  const content = msg.content;
  if (content && typeof content === 'object' && 'text' in content) {
    const t = (content as { text?: unknown }).text;
    if (typeof t === 'string') return t;
  }
  return 'Message';
}
