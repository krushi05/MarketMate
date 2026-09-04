// Safe storage helper with in-memory fallback
// Protects against DOMException / SecurityError when running in sandboxed iframes

const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In sandboxed iframe or blocked storage
    }
    return memoryStorage.get(key) || null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // In sandboxed iframe or blocked storage
    }
    memoryStorage.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // In sandboxed iframe or blocked storage
    }
    memoryStorage.delete(key);
  },
};
