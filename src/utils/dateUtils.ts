
export function parseMovementDate(vencimento: any): Date | null {
  if (!vencimento) return null;
  
  const vStr = String(vencimento).trim();
  if (!vStr) return null;

  // Case 1: YYYY-MM-DD (with optional time)
  if (/^\d{4}-\d{2}-\d{2}/.test(vStr)) {
    const datePart = vStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    // Use noon to avoid timezone shifts
    return new Date(year, month - 1, day, 12, 0, 0);
  }

  // Case 2: DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(vStr)) {
    const datePart = vStr.split(' ')[0];
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
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
  return d.toLocaleDateString('pt-BR');
}
