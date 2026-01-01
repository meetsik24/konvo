export const normalizeResponse = <T>(response: any): T[] =>
  Array.isArray(response) ? response : response?.data || [];