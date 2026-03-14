export function sanitizeJournalText(text) {
  return String(text)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 5000);
}
