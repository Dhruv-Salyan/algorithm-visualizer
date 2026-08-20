// ---------------------------------------------------------------------------
// Small, framework-free helpers for parsing and validating user input.
// Kept separate from rendering and algorithm logic on purpose.
// ---------------------------------------------------------------------------

const Utils = {
  /** Parses a comma/space separated string of integers. Returns {ok, values, error}. */
  parseIntList(raw, { min = 2, max = 14, label = 'Array' } = {}) {
    if (!raw || !raw.trim()) {
      return { ok: false, error: `${label} cannot be empty.` };
    }
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const values = [];
    for (const part of parts) {
      const n = Number(part);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        return { ok: false, error: `"${part}" is not a valid whole number.` };
      }
      values.push(n);
    }
    if (values.length < min) {
      return { ok: false, error: `${label} needs at least ${min} elements.` };
    }
    if (values.length > max) {
      return { ok: false, error: `${label} supports at most ${max} elements for a readable visualization.` };
    }
    return { ok: true, values };
  },

  /** Parses a single integer from a form value. */
  parseInt(raw, { label = 'Value' } = {}) {
    if (raw === '' || raw === null || raw === undefined) {
      return { ok: false, error: `${label} is required.` };
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return { ok: false, error: `${label} must be a whole number.` };
    }
    return { ok: true, value: n };
  },

  isSorted(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) return false;
    }
    return true;
  }
};
