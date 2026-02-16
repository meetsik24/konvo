/**
 * Formats an ISO or custom date string to Dar es Salaam local time (GMT+3).
 * @param dateString The date string (e.g., from API "16-02-2026, 12:20").
 * @param includeTime Whether to include the time in the output.
 * @returns Formatted string in DD/MM/YYYY HH:mm format.
 */
export const formatToLocalTime = (dateString: string | null | undefined, includeTime: boolean = true): string => {
    if (!dateString || dateString === 'N/A') return 'N/A';

    try {
        let normalized = dateString.trim();

        // Handle the specific backend format: "DD-MM-YYYY, HH:mm"
        const customFormatMatch = normalized.match(/^(\d{2})-(\d{2})-(\d{4}),\s*(\d{2}):(\d{2})$/);
        if (customFormatMatch) {
            const [, day, month, year, hour, minute] = customFormatMatch;
            // Create ISO string in UTC: YYYY-MM-DDTHH:mm:00Z
            normalized = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
        } else {
            // General normalization for other formats
            normalized = normalized.replace(' ', 'T');
            if (!normalized.endsWith('Z') && normalized.includes('T')) {
                if (!/[+-]\d{2}(:?\d{2})?$/.test(normalized)) {
                    normalized += 'Z';
                }
            }
        }

        let date = new Date(normalized);

        // Fallback for non-standard formats that Date might still fail on
        if (isNaN(date.getTime())) {
            date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
        }

        return format(date, includeTime);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
};

const format = (date: Date, includeTime: boolean): string => {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Dar_es_Salaam',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = false;
    }

    return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
};
