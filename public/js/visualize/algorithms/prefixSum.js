// ---------------------------------------------------------------------------
// Prefix Sum — build a running-total array, then answer range sums in O(1).
// ---------------------------------------------------------------------------

window.AlgoModules = window.AlgoModules || {};

window.AlgoModules['prefix-sum'] = {
  fields: [
    { id: 'array', label: 'Array', type: 'array', hint: 'Comma-separated integers.' },
    { id: 'left', label: 'Query left index (L)', type: 'number' },
    { id: 'right', label: 'Query right index (R)', type: 'number' }
  ],

  presets: [
    { label: 'Mid range', input: { array: [4, 2, 7, 1, 9, 3, 6, 5], query: { left: 2, right: 6 } } },
    { label: 'From start', input: { array: [4, 2, 7, 1, 9, 3, 6, 5], query: { left: 0, right: 4 } } },
    { label: 'Single element', input: { array: [4, 2, 7, 1, 9, 3, 6, 5], query: { left: 5, right: 5 } } }
  ],

  legend: [
    { color: 'var(--accent-green)', label: 'Prefix value already built' },
    { color: 'var(--accent-cyan)', label: 'Query range [L, R]' },
    { color: 'var(--accent-violet)', label: 'Values used in the subtraction' }
  ],

  randomInput() {
    const n = 5 + Math.floor(Math.random() * 6); // 5–10 elements
    const arr = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 9));
    let left = Math.floor(Math.random() * n);
    let right = Math.floor(Math.random() * n);
    if (right < left) [left, right] = [right, left];
    return { array: arr, query: { left, right } };
  },

  parseInput(values) {
    const arrRes = Utils.parseIntList(values.array, { min: 1, max: 12, label: 'Array' });
    if (!arrRes.ok) return { ok: false, errors: { array: arrRes.error } };
    const n = arrRes.values.length;

    const leftRes = Utils.parseInt(values.left, { label: 'Left index' });
    if (!leftRes.ok) return { ok: false, errors: { left: leftRes.error } };
    const rightRes = Utils.parseInt(values.right, { label: 'Right index' });
    if (!rightRes.ok) return { ok: false, errors: { right: rightRes.error } };

    if (leftRes.value < 0 || leftRes.value >= n) {
      return { ok: false, errors: { left: `Left index must be between 0 and ${n - 1}.` } };
    }
    if (rightRes.value < 0 || rightRes.value >= n) {
      return { ok: false, errors: { right: `Right index must be between 0 and ${n - 1}.` } };
    }
    if (leftRes.value > rightRes.value) {
      return { ok: false, errors: { right: 'Right index must be ≥ left index.' } };
    }

    return {
      ok: true,
      input: { array: arrRes.values, query: { left: leftRes.value, right: rightRes.value } }
    };
  },

  generateSteps(input) {
    const { array, query } = input;
    const n = array.length;
    const prefix = new Array(n).fill(null);
    const steps = [];

    prefix[0] = array[0];
    steps.push({
      phase: 'build', buildIndex: 0, prefix: [...prefix], action: 'build-first', codeLine: 0,
      description: `prefix[0] = arr[0] = ${array[0]}. The prefix array always starts as a copy of the first element.`
    });

    for (let i = 1; i < n; i++) {
      const prevPrefix = prefix[i - 1];
      prefix[i] = prevPrefix + array[i];
      steps.push({
        phase: 'build', buildIndex: i, prefix: [...prefix], action: 'build', codeLine: 2,
        description: `prefix[${i}] = prefix[${i - 1}] + arr[${i}] = ${prevPrefix} + ${array[i]} = ${prefix[i]}.`
      });
    }

    if (query) {
      const { left, right } = query;
      steps.push({
        phase: 'query', buildIndex: n - 1, prefix: [...prefix], action: 'query-setup', codeLine: 4, query,
        description: `Now answer a range-sum query for [${left}, ${right}] using the finished prefix array — no re-scanning needed.`
      });

      let result;
      if (left === 0) {
        result = prefix[right];
        steps.push({
          phase: 'query', buildIndex: n - 1, prefix: [...prefix], action: 'query-result', codeLine: 5, query, result, final: true, status: 'success',
          description: `Since L = 0, rangeSum = prefix[${right}] = ${result}.`
        });
      } else {
        result = prefix[right] - prefix[left - 1];
        steps.push({
          phase: 'query', buildIndex: n - 1, prefix: [...prefix], action: 'query-result', codeLine: 6, query, result, final: true, status: 'success',
          description: `rangeSum = prefix[${right}] − prefix[${left - 1}] = ${prefix[right]} − ${prefix[left - 1]} = ${result}.`
        });
      }
    }

    return steps;
  },

  render(container, step, input) {
    Renderer.clear(container);
    const { array } = input;

    const wrap = document.createElement('div');
    wrap.className = 'dual-array';

    const origBlock = document.createElement('div');
    const origLabel = document.createElement('div');
    origLabel.className = 'array-block-label';
    origLabel.textContent = 'Original array';
    origBlock.appendChild(origLabel);

    const origCells = array.map((v, i) => {
      const classes = [];
      if (step.phase === 'query' && step.query && i >= step.query.left && i <= step.query.right) {
        classes.push('query-range');
      } else {
        classes.push('in-range');
      }
      return { value: v, classes };
    });
    Renderer.renderArrayRow(origBlock, origCells);
    wrap.appendChild(origBlock);

    const prefixBlock = document.createElement('div');
    const prefixLabel = document.createElement('div');
    prefixLabel.className = 'array-block-label';
    prefixLabel.textContent = 'Prefix sum array';
    prefixBlock.appendChild(prefixLabel);

    const prefixCells = step.prefix.map((v, i) => {
      const classes = [];
      if (v === null) classes.push('out-range');
      else classes.push('prefix-built');
      if (step.phase === 'query' && step.query) {
        const { left, right } = step.query;
        if (i === right) classes.push('compare');
        if (left > 0 && i === left - 1) classes.push('compare');
      }
      return { value: v === null ? '·' : v, classes };
    });
    Renderer.renderArrayRow(prefixBlock, prefixCells);
    wrap.appendChild(prefixBlock);

    container.appendChild(wrap);

    const readout = document.createElement('div');
    readout.className = 'sum-readout';
    if (step.phase === 'query') {
      const { left, right } = step.query;
      readout.innerHTML = `
        <span>query = <b>[${left}, ${right}]</b></span>
        <span>range sum = <b>${step.result !== undefined ? step.result : '…'}</b></span>
      `;
    } else {
      readout.innerHTML = `<span>building prefix[<b>${step.buildIndex}</b>]</span>`;
    }
    container.appendChild(readout);
  }
};
