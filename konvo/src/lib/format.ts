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

function extractTextFrom(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    const parts = value.map(extractTextFrom).filter(Boolean);
    return parts.join('\n');
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    // Direct keys (order matters)
    for (const key of ['body', 'text', 'content', 'message', 'caption']) {
      const out = extractTextFrom(obj[key]);
      if (out) return out;
    }
    // Nested text.body (WhatsApp/Sarufi)
    const text = obj.text;
    if (text && typeof text === 'object' && !Array.isArray(text)) {
      const out = extractTextFrom((text as Record<string, unknown>).body ?? text);
      if (out) return out;
    }
    // Recurse into first object value that might hold text
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') {
        const out = extractTextFrom(v);
        if (out && out.length < 5000) return out;
      }
    }
  }
  return '';
}

/** Extract display text from API message/response object (handles nested and array shapes). */
export function getMessagePreview(msg: Record<string, unknown>): string {
  if (!msg || typeof msg !== 'object') return '';
  const raw = extractTextFrom(msg);
  return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/** Normalize message for display: trim and preserve line breaks. */
export function formatMessageText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}
