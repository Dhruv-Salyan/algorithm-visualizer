// ---------------------------------------------------------------------------
// Two Pointers — pair with target sum in a sorted array.
// ---------------------------------------------------------------------------

window.AlgoModules = window.AlgoModules || {};

window.AlgoModules['two-pointers'] = {
  fields: [
    { id: 'array', label: 'Sorted array', type: 'array', hint: 'Comma-separated, ascending order.' },
    { id: 'target', label: 'Target sum', type: 'number' }
  ],

  presets: [
    { label: 'Pair exists', input: { array: [2, 4, 7, 11, 15, 18, 22, 26], target: 26 } },
    { label: 'No pair', input: { array: [1, 3, 6, 8, 14], target: 5 } },
    { label: 'Small', input: { array: [1, 2, 3, 4, 6], target: 7 } }
  ],

  legend: [
    { color: 'var(--accent-cyan)', label: 'Left pointer' },
    { color: 'var(--accent-violet)', label: 'Right pointer' },
    { color: 'var(--accent-green)', label: 'Pair found' },
    { color: 'var(--accent-red)', label: 'Eliminated from consideration' }
  ],

  randomInput() {
    const n = 5 + Math.floor(Math.random() * 5); // 5–9 elements
    const arr = [];
    let v = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < n; i++) {
      arr.push(v);
      v += 1 + Math.floor(Math.random() * 5);
    }
    const i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (j === i) j = (j + 1) % n;
    const target = arr[i] + arr[j];
    return { array: arr, target };
  },

  parseInput(values) {
    const arrRes = Utils.parseIntList(values.array, { min: 2, max: 12, label: 'Array' });
    if (!arrRes.ok) return { ok: false, errors: { array: arrRes.error } };
    if (!Utils.isSorted(arrRes.values)) {
      return { ok: false, errors: { array: 'Array must be sorted in ascending order for Two Pointers to work.' } };
    }
    const targetRes = Utils.parseInt(values.target, { label: 'Target' });
    if (!targetRes.ok) return { ok: false, errors: { target: targetRes.error } };
    return { ok: true, input: { array: arrRes.values, target: targetRes.value } };
  },

  generateSteps(input) {
    const { array, target } = input;
    const steps = [];
    let left = 0;
    let right = array.length - 1;

    steps.push({
      left, right, sum: null, action: 'init', codeLine: 0,
      description: `Start with left at index 0 and right at index ${right}. Looking for a pair that sums to ${target}.`
    });

    let found = false;
    while (left < right) {
      const sum = array[left] + array[right];
      if (sum === target) {
        steps.push({
          left, right, sum, action: 'found', codeLine: 3, final: true, status: 'success',
          description: `arr[${left}] + arr[${right}] = ${sum} equals the target ${target}. Pair found!`
        });
        found = true;
        break;
      } else if (sum < target) {
        steps.push({
          left, right, sum, action: 'move-left', codeLine: 4,
          description: `arr[${left}] + arr[${right}] = ${sum} is less than ${target}, so move the left pointer right to increase the sum.`
        });
        left++;
      } else {
        steps.push({
          left, right, sum, action: 'move-right', codeLine: 5,
          description: `arr[${left}] + arr[${right}] = ${sum} is greater than ${target}, so move the right pointer left to decrease the sum.`
        });
        right--;
      }
    }

    if (!found) {
      steps.push({
        left, right, sum: null, action: 'not-found', codeLine: 6, final: true, status: 'fail',
        description: `Left and right pointers met at index ${left} without finding a pair that sums to ${target}. No pair exists.`
      });
    }

    return steps;
  },

  render(container, step, input) {
    Renderer.clear(container);
    const { array } = input;
    const { left, right, action } = step;

    const cells = array.map((value, i) => {
      const classes = [];
      if (i < left || i > right) classes.push('discarded');
      else classes.push('in-range');

      if (action === 'found' && (i === left || i === right)) classes.push('found');
      else if (i === left || i === right) {
        if (action !== 'init' && action !== 'not-found') classes.push('compare');
        if (i === left) classes.push('left-active');
        if (i === right) classes.push('right-active');
      }
      return { value, classes };
    });

    const row = Renderer.renderArrayRow(container, cells);

    const pointers = [];
    if (left <= right && left >= 0 && left < array.length) pointers.push({ index: left, label: 'L', type: 'left' });
    if (right >= 0 && right < array.length && right !== left) pointers.push({ index: right, label: 'R', type: 'right' });
    Renderer.placePointers(row, pointers);

    if (action !== 'init' && action !== 'not-found' && left < right) {
      Renderer.placeCompareBeam(row, left, right);
    }

    const readout = document.createElement('div');
    readout.className = 'sum-readout';
    readout.innerHTML = `
      <span>left = <b>${left}</b> (${array[left] !== undefined ? array[left] : '—'})</span>
      <span>right = <b>${right}</b> (${array[right] !== undefined ? array[right] : '—'})</span>
      <span>sum = <b>${step.sum !== null ? step.sum : '—'}</b></span>
      <span>target = <b>${input.target}</b></span>
    `;
    container.appendChild(readout);
  }
};
