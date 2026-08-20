// ---------------------------------------------------------------------------
// Binary Search — locate a value in a sorted array by halving the range.
// ---------------------------------------------------------------------------

window.AlgoModules = window.AlgoModules || {};

window.AlgoModules['binary-search'] = {
  fields: [
    { id: 'array', label: 'Sorted array', type: 'array', hint: 'Comma-separated, ascending order.' },
    { id: 'target', label: 'Target value', type: 'number' }
  ],

  presets: [
    { label: 'Found', input: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 23 } },
    { label: 'Not found', input: { array: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91], target: 20 } },
    { label: 'Edge (first)', input: { array: [3, 6, 9, 12, 15], target: 3 } }
  ],

  legend: [
    { color: 'var(--accent-cyan)', label: 'Low boundary' },
    { color: 'var(--accent-violet)', label: 'High boundary / mid' },
    { color: 'var(--accent-green)', label: 'Target found' },
    { color: 'var(--accent-red)', label: 'Eliminated half' }
  ],

  randomInput() {
    const n = 6 + Math.floor(Math.random() * 6); // 6–11 elements
    const arr = [];
    let v = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < n; i++) {
      arr.push(v);
      v += 1 + Math.floor(Math.random() * 6);
    }
    // 70% of the time target an element that exists, otherwise a value guaranteed to miss
    const targetExists = Math.random() < 0.7;
    const target = targetExists ? arr[Math.floor(Math.random() * n)] : arr[arr.length - 1] + 3;
    return { array: arr, target };
  },

  parseInput(values) {
    const arrRes = Utils.parseIntList(values.array, { min: 1, max: 14, label: 'Array' });
    if (!arrRes.ok) return { ok: false, errors: { array: arrRes.error } };
    if (!Utils.isSorted(arrRes.values)) {
      return { ok: false, errors: { array: 'Array must be sorted in ascending order for Binary Search to work.' } };
    }
    const targetRes = Utils.parseInt(values.target, { label: 'Target' });
    if (!targetRes.ok) return { ok: false, errors: { target: targetRes.error } };
    return { ok: true, input: { array: arrRes.values, target: targetRes.value } };
  },

  generateSteps(input) {
    const { array, target } = input;
    const steps = [];
    let low = 0;
    let high = array.length - 1;

    steps.push({
      low, high, mid: null, action: 'init', codeLine: 0,
      description: `Start with the full search range: index 0 to ${high}.`
    });

    let found = false;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (array[mid] === target) {
        steps.push({
          low, high, mid, action: 'found', codeLine: 3, final: true, status: 'success',
          description: `arr[${mid}] = ${array[mid]} equals the target ${target}. Found at index ${mid}!`
        });
        found = true;
        break;
      } else if (array[mid] < target) {
        steps.push({
          low, high, mid, action: 'move-low', codeLine: 4,
          description: `arr[${mid}] = ${array[mid]} is less than ${target}, so discard the left half — search moves to index ${mid + 1}..${high}.`
        });
        low = mid + 1;
      } else {
        steps.push({
          low, high, mid, action: 'move-high', codeLine: 5,
          description: `arr[${mid}] = ${array[mid]} is greater than ${target}, so discard the right half — search moves to index ${low}..${mid - 1}.`
        });
        high = mid - 1;
      }
    }

    if (!found) {
      steps.push({
        low, high, mid: null, action: 'not-found', codeLine: 6, final: true, status: 'fail',
        description: `Search range is empty (low > high). ${target} is not in the array.`
      });
    }

    return steps;
  },

  render(container, step, input) {
    Renderer.clear(container);
    const { array } = input;
    const { low, high, mid, action } = step;

    const cells = array.map((value, i) => {
      const classes = [];
      if (i < low || i > high) classes.push('discarded');
      else classes.push('in-range');

      if (i === mid) classes.push(action === 'found' ? 'found' : 'mid-active');
      return { value, classes };
    });

    const row = Renderer.renderArrayRow(container, cells);

    const pointers = [];
    if (low >= 0 && low < array.length) pointers.push({ index: low, label: 'LOW', type: 'low' });
    if (high >= 0 && high < array.length) pointers.push({ index: high, label: 'HIGH', type: 'high' });
    if (mid !== null && mid >= 0 && mid < array.length && action !== 'found') {
      pointers.push({ index: mid, label: 'MID', type: 'mid' });
    }
    Renderer.placePointers(row, pointers);

    const readout = document.createElement('div');
    readout.className = 'sum-readout';
    readout.innerHTML = `
      <span>low = <b>${low}</b></span>
      <span>high = <b>${high}</b></span>
      <span>mid = <b>${mid !== null ? mid : '—'}</b> (${mid !== null ? array[mid] : '—'})</span>
      <span>target = <b>${input.target}</b></span>
    `;
    container.appendChild(readout);
  }
};
