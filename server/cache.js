const store = new Map();

module.exports = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
    return entry.data;
  },
  set(key, data, ttlMs) {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
  },
  invalidate(key) { store.delete(key); },
};
