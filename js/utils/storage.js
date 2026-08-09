export function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;

    try {
      return JSON.parse(stored);
    } catch {
      // Support values written by older Prism builds without JSON encoding.
      return stored;
    }
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save ${key} to browser storage`, error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Unable to remove ${key} from browser storage`, error);
  }
}
