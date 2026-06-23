export function parseDateString(dateStr) {
  if (!dateStr) return null;
  
  // Try to parse DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('-');
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Try standard parsing (e.g. YYYY-MM-DD or ISO string)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d;
  }
  
  throw Object.assign(new Error(`Invalid date format: ${dateStr}. Please use YYYY-MM-DD or DD-MM-YYYY`), { statusCode: 400 });
}
