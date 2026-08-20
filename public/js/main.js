// ---------------------------------------------------------------------------
// Home page controller. Two independent jobs:
//   1. Fetch algorithm metadata from the backend and render the four cards.
//   2. Run a small looping binary-search animation in the hero panel.
//
// Note: the hero loop below re-implements a minimal binary search rather
// than reusing public/js/visualize/algorithms/binarySearch.js. That module
// also handles input parsing, presets, and full step descriptions for the
// visualize page — pulling it in here just for a 10-line decorative loop
// would couple the home page to the visualizer's module system for no real
// benefit. This copy is intentionally small and self-contained.
// ---------------------------------------------------------------------------

const ICONS = {
  'two-pointers': '⇆',
  'binary-search': '÷2',
  'sliding-window': '▭',
  'prefix-sum': 'Σ'
};

async function loadAlgorithmCards() {
  const grid = document.getElementById('card-grid');
  try {
    const res = await fetch('/api/algorithms');
    if (!res.ok) throw new Error('Failed to load algorithms');
    const algorithms = await res.json();
    grid.innerHTML = algorithms.map(cardTemplate).join('');
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--text-muted)">Couldn't reach the backend (${err.message}). Make sure the Express server is running.</p>`;
  }
}

function cardTemplate(algo) {
  return `
    <article class="algo-card" data-slug="${algo.slug}">
      <div class="algo-card-top">
        <span class="algo-icon">${ICONS[algo.slug] || '•'}</span>
        <span class="algo-badge">${algo.useCase}</span>
      </div>
      <h3>${algo.name}</h3>
      <p class="desc">${algo.shortDescription}</p>
      <div class="algo-stats">
        <div class="stat-pill">
          <div class="label">Time</div>
          <div class="value">${algo.timeComplexity}</div>
        </div>
        <div class="stat-pill">
          <div class="label">Space</div>
          <div class="value">${algo.spaceComplexity}</div>
        </div>
      </div>
      <a class="card-visualize-btn" href="visualize.html?algo=${algo.slug}">
        Visualize →
      </a>
    </article>
  `;
}

// --- subtle mouse-follow glow on cards ---
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest('.algo-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  card.style.setProperty('--my', `${e.clientY - rect.top}px`);
});

// ---------------------------------------------------------------------------
// Hero mini binary-search loop
// ---------------------------------------------------------------------------
const HERO_ARRAY = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
const HERO_TARGET = 23;

function buildHeroSteps(arr, target) {
  const steps = [];
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ low, high, mid, found: arr[mid] === target });
    if (arr[mid] === target) break;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return steps;
}

function renderHeroStep(step, arr) {
  const container = document.getElementById('hero-mini-array');
  const caption = document.getElementById('hero-caption');
  container.innerHTML = arr
    .map((val, i) => {
      let cls = 'mini-cell';
      if (i < step.low || i > step.high) cls += ' dim';
      if (i === step.mid) cls += step.found ? ' hit' : ' active';
      return `<div class="${cls}">${val}</div>`;
    })
    .join('');
  caption.textContent = step.found
    ? `found ${arr[step.mid]} at index ${step.mid}`
    : `checking mid = index ${step.mid} (value ${arr[step.mid]})`;
}

function runHeroLoop() {
  const steps = buildHeroSteps(HERO_ARRAY, HERO_TARGET);
  let i = 0;
  renderHeroStep(steps[0], HERO_ARRAY);
  setInterval(() => {
    i = (i + 1) % (steps.length + 2); // pause briefly on the final hit
    const step = steps[Math.min(i, steps.length - 1)];
    renderHeroStep(step, HERO_ARRAY);
  }, 1400);
}

loadAlgorithmCards();
runHeroLoop();
