export function getSupabaseConfig(url: string | undefined, key: string | undefined) {
  const apiKey = key?.trim();
  if (!url?.trim() || !apiKey) return null;
  try {
    const parsed = new URL(url.trim());
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname ||
        parsed.username || parsed.password || parsed.search || parsed.hash) return null;
    return { url: parsed.toString().replace(/\/$/, ''), key: apiKey };
  } catch {
    return null;
  }
}
