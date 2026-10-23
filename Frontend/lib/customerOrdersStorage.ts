export interface StoredOrderRef {
  orderNumber: string;
  token: string;
}

const STORAGE_KEY = 'pragati_customer_orders_v1';

export function getRememberedOrderRefs(): StoredOrderRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.orderNumber === 'string' &&
        item.orderNumber.trim() !== '' &&
        typeof item.token === 'string' &&
        item.token.trim() !== ''
    );
  } catch (e) {
    console.error('Failed to read customer orders from localStorage:', e);
    return [];
  }
}

export function addRememberedOrderRef(orderNumber: string, token: string): void {
  if (typeof window === 'undefined' || !orderNumber || !token) return;
  try {
    const existing = getRememberedOrderRefs();
    // Deduplicate by orderNumber
    const filtered = existing.filter((item) => item.orderNumber !== orderNumber);
    filtered.unshift({ orderNumber, token });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to save order ref to localStorage:', e);
  }
}

export function removeRememberedOrderRef(orderNumber: string): void {
  if (typeof window === 'undefined' || !orderNumber) return;
  try {
    const existing = getRememberedOrderRefs();
    const filtered = existing.filter((item) => item.orderNumber !== orderNumber);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove order ref from localStorage:', e);
  }
}
