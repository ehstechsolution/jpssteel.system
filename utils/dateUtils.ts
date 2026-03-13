
export function parseMovementDate(vencimento: any): Date | null {
  if (!vencimento) return null;

  // Handle Firestore Timestamp or objects with seconds/nanoseconds
  if (typeof vencimento === 'object') {
    if (typeof vencimento.toDate === 'function') {
      return vencimento.toDate();
    }
    if (typeof vencimento.seconds === 'number') {
      return new Date(vencimento.seconds * 1000);
    }
  }
  
  const vStr = String(vencimento).trim();
  if (!vStr || vStr === '[object Object]') return null;

  // Case 1: YYYY-MM-DD (with optional time)
  if (/^\d{4}-\d{2}-\d{2}/.test(vStr)) {
    const datePart = vStr.split('T')[0];
    const parts = datePart.split('-').map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return new Date(year, month - 1, day, 12, 0, 0);
    }
  }

  // Case 2: DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(vStr)) {
    const datePart = vStr.split(' ')[0];
    const parts = datePart.split('/').map(Number);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day, 12, 0, 0);
    }
  }

  // Fallback for ISO or other formats
  const d = new Date(vStr);
  if (!isNaN(d.getTime())) {
    return d;
  }

  return null;
}

export function formatMovementDate(vencimento: any): string {
  const d = parseMovementDate(vencimento);
  if (!d) return '---';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}
