// ---------------------------------------------------------------------------
// Sliding Window — smallest subarray with a sum >= target.
// Uses a variable-size window so both expansion and contraction are visible.
// ---------------------------------------------------------------------------

window.AlgoModules = window.AlgoModules || {};

window.AlgoModules['sliding-window'] = {
  fields: [
    { id: 'array', label: 'Array (non-negative integers)', type: 'array', hint: 'Comma-separated.' },
    { id: 'target', label: 'Target sum (≥)', type: 'number' }
  ],

  presets: [
    { label: 'Typical', input: { array: [2, 1, 5, 2, 3, 2, 8, 1, 6], target: 9 } },
    { label: 'Whole array needed', input: { array: [1, 1, 1, 1, 1], target: 5 } },
    { label: 'No valid window', input: { array: [1, 2, 1, 1], target: 20 } }
  ],

  legend: [
    { color: 'var(--accent-amber)', label: 'Current window' },
    { color: 'var(--accent-cyan)', label: 'Window left edge' },
    { color: 'var(--accent-violet)', label: 'Window right edge' },
    { color: 'var(--accent-green)', label: 'New best window length' }
  ],

  randomInput() {
    const n = 6 + Math.floor(Math.random() * 5); // 6–10 elements
    const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 8));
    const total = arr.reduce((a, b) => a + b, 0);
    // aim for a target that's comfortably achievable but still requires a real window
    const target = Math.max(4, Math.round(total * (0.35 + Math.random() * 0.35)));
    return { array: arr, target };
  },

  parseInput(values) {
    const arrRes = Utils.parseIntList(values.array, { min: 1, max: 12, label: 'Array' });
    if (!arrRes.ok) return { ok: false, errors: { array: arrRes.error } };
    if (arrRes.values.some((v) => v < 0)) {
      return { ok: false, errors: { array: 'Sliding window here assumes non-negative integers so the window sum grows monotonically.' } };
    }
    const targetRes = Utils.parseInt(values.target, { label: 'Target' });
    if (!targetRes.ok) return { ok: false, errors: { target: targetRes.error } };
    if (targetRes.value <= 0) {
      return { ok: false, errors: { target: 'Target sum should be a positive number.' } };
    }
    return { ok: true, input: { array: arrRes.values, target: targetRes.value } };
  },

  generateSteps(input) {
    const { array, target } = input;
    const steps = [];
    let left = 0;
    let windowSum = 0;
    let best = Infinity;

    steps.push({
      left, right: -1, windowSum: 0, best: null, action: 'init', codeLine: 0,
      description: `Start with an empty window and a running sum of 0. Looking for the smallest window with sum ≥ ${target}.`
    });

    for (let right = 0; right < array.length; right++) {
      windowSum += array[right];
      steps.push({
        left, right, windowSum, best: best === Infinity ? null : best, action: 'expand', codeLine: 2,
        description: `Expand right to index ${right}: add arr[${right}] = ${array[right]}. Window sum is now ${windowSum}.`
      });

      while (windowSum >= target) {
        const len = right - left + 1;
        const improved = len < best;
        if (improved) best = len;
        steps.push({
          left, right, windowSum, best, action: 'record',
          codeLine: 4, improved,
          description: `Window [${left}, ${right}] sums to ${windowSum} ≥ ${target} (length ${len}).${improved ? ' That is a new best length!' : ''}`
        });

        windowSum -= array[left];
        const oldLeft = left;
        left++;
        steps.push({
          left, right, windowSum, best, action: 'contract', codeLine: 5,
          description: `Shrink from the left: remove arr[${oldLeft}] = ${array[oldLeft]}. Window sum is now ${windowSum}.`
        });
      }
    }

    steps.push({
      left, right: array.length - 1, windowSum, best: best === Infinity ? null : best, action: 'done', codeLine: 7, final: true,
      status: best === Infinity ? 'fail' : 'success',
      description: best === Infinity
        ? `No contiguous window sums to at least ${target}.`
        : `Smallest window with sum ≥ ${target} has length ${best}.`
    });

    return steps;
  },

  render(container, step, input) {
    Renderer.clear(container);
    const { array } = input;
    const { left, right, action } = step;

    const cells = array.map((value, i) => {
      const classes = [];
      if (right >= 0 && i >= left && i <= right) classes.push('window');
      else classes.push('in-range');
      if (action === 'record' && step.improved && i >= left && i <= right) classes.push('found');
      return { value, classes };
    });

    const row = Renderer.renderArrayRow(container, cells);

    const pointers = [];
    if (right >= 0) {
      pointers.push({ index: left, label: 'L', type: 'left' });
      pointers.push({ index: right, label: 'R', type: 'right' });
    }
    Renderer.placePointers(row, pointers);

    const readout = document.createElement('div');
    readout.className = 'sum-readout';
    readout.innerHTML = `
      <span>window = <b>[${left}, ${right >= 0 ? right : '—'}]</b></span>
      <span>window sum = <b>${step.windowSum}</b></span>
      <span>target = <b>${input.target}</b></span>
      <span>best length = <b>${step.best !== null && step.best !== undefined ? step.best : '—'}</b></span>
    `;
    container.appendChild(readout);
  }
};
