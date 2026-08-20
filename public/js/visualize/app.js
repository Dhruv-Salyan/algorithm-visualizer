// ---------------------------------------------------------------------------
// App controller for the visualization page. Responsible for:
//   - loading algorithm metadata from the backend
//   - building the input form from the active module's field definitions
//   - driving playback (play/pause/step/reset/speed)
//   - keeping the pseudocode highlight, status text, and progress in sync
// The actual drawing is delegated to the algorithm module + Renderer.
// ---------------------------------------------------------------------------

const SPEED_MS = { 1: 1800, 2: 1100, 3: 700, 4: 450 };
const SPEED_LABELS = { 1: '0.5×', 2: '1×', 3: '1.5×', 4: '2×' };

const state = {
  slug: null,
  meta: null,
  moduleDef: null,
  lineEls: [],
  input: null,
  steps: [],
  stepIndex: 0,
  playing: false,
  intervalId: null,
  speed: 2
};

const els = {};

function cacheEls() {
  [
    'crumb-name', 'algo-title', 'algo-desc', 'algo-usecase', 'cx-time', 'cx-space',
    'stage-visual', 'stage-status', 'step-tag', 'status-text',
    'btn-reset', 'btn-prev', 'btn-play', 'btn-next', 'play-icon', 'play-label',
    'speed-range', 'speed-label', 'progress-fill', 'step-counter',
    'preset-row', 'input-form', 'legend', 'pseudocode', 'info-list'
  ].forEach((id) => { els[id] = document.getElementById(id); });
}

async function init() {
  cacheEls();
  const params = new URLSearchParams(window.location.search);
  state.slug = params.get('algo') || 'two-pointers';
  state.moduleDef = window.AlgoModules[state.slug];
  document.body.dataset.algo = state.slug;

  if (!state.moduleDef) {
    els['algo-title'].textContent = 'Unknown algorithm';
    els['stage-status'].innerHTML = `<span>No visualization exists for "${state.slug}".</span>`;
    return;
  }

  try {
    const res = await fetch(`/api/algorithms/${state.slug}`);
    if (!res.ok) throw new Error('Algorithm not found on the server');
    state.meta = await res.json();
  } catch (err) {
    els['stage-status'].innerHTML = `<span>Could not load metadata (${err.message}). Is the Express server running?</span>`;
    return;
  }

  renderHeader();
  renderInfoPanel();
  renderLegend();
  renderPseudocode();
  renderPresets();
  renderForm();
  bindControls();

  applyInputFromObject(state.meta.defaultInput);
}

function renderHeader() {
  const { meta } = state;
  document.title = `${meta.name} — Algorithm Visualizer`;
  els['crumb-name'].textContent = meta.name;
  els['algo-title'].textContent = meta.name;
  els['algo-desc'].textContent = meta.longDescription;
  els['algo-usecase'].textContent = meta.useCase;
  els['cx-time'].textContent = meta.timeComplexity;
  els['cx-space'].textContent = meta.spaceComplexity;
}

function renderLegend() {
  Renderer.renderLegend(els.legend, state.moduleDef.legend);
}

function renderInfoPanel() {
  const { meta } = state;
  const rows = [
    ['What it is', meta.whatItIs],
    ['When to use it', meta.whenToUse],
    ['Core idea', meta.coreIdea],
    ['Common pattern', meta.commonPattern],
    ['Example', meta.example]
  ];
  els['info-list'].innerHTML = rows
    .map(
      ([label, value]) => `
      <div class="info-row">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>`
    )
    .join('');
}

function renderPseudocode() {
  state.lineEls = Renderer.renderPseudocode(els.pseudocode, state.meta.pseudocode);
}

function renderPresets() {
  els['preset-row'].innerHTML = '';
  state.moduleDef.presets.forEach((preset, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-btn';
    btn.textContent = preset.label;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyInputFromObject(preset.input);
    });
    if (i === 0) btn.classList.add('active');
    els['preset-row'].appendChild(btn);
  });

  if (typeof state.moduleDef.randomInput === 'function') {
    const randomBtn = document.createElement('button');
    randomBtn.type = 'button';
    randomBtn.className = 'preset-btn random';
    randomBtn.textContent = '🎲 Random';
    randomBtn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
      applyInputFromObject(state.moduleDef.randomInput());
    });
    els['preset-row'].appendChild(randomBtn);
  }
}

function renderForm() {
  const form = els['input-form'];
  form.innerHTML = '';
  state.moduleDef.fields.forEach((field) => {
    const wrap = document.createElement('div');
    wrap.className = 'field';
    wrap.dataset.field = field.id;
    wrap.innerHTML = `
      <label for="f-${field.id}">${field.label}</label>
      <input type="${field.type === 'array' ? 'text' : 'number'}" id="f-${field.id}" name="${field.id}" />
      ${field.hint ? `<div class="hint">${field.hint}</div>` : ''}
      <div class="error"></div>
    `;
    form.appendChild(wrap);
  });
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'apply-btn';
  submit.textContent = 'Apply & Visualize';
  form.appendChild(submit);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
    applyInputFromForm();
  });
}

/** Converts a module's structured input object into raw form field values keyed by field id. */
function inputToFieldValues(input) {
  const values = { array: input.array.join(', ') };
  if (input.target !== undefined) values.target = input.target;
  if (input.query) {
    values.left = input.query.left;
    values.right = input.query.right;
  }
  return values;
}

function setFormValues(values) {
  state.moduleDef.fields.forEach((field) => {
    const el = document.getElementById(`f-${field.id}`);
    if (el && values[field.id] !== undefined) el.value = values[field.id];
  });
}

function readFormValues() {
  const values = {};
  state.moduleDef.fields.forEach((field) => {
    values[field.id] = document.getElementById(`f-${field.id}`).value;
  });
  return values;
}

function clearFieldErrors() {
  document.querySelectorAll('#input-form .field').forEach((f) => {
    f.classList.remove('invalid');
    f.querySelector('.error').textContent = '';
  });
}

function showFieldErrors(errors) {
  clearFieldErrors();
  Object.entries(errors).forEach(([fieldId, message]) => {
    const wrap = document.querySelector(`#input-form .field[data-field="${fieldId}"]`);
    if (!wrap) return;
    wrap.classList.add('invalid');
    wrap.querySelector('.error').textContent = message;
  });
}

function applyInputFromObject(inputObj) {
  setFormValues(inputToFieldValues(inputObj));
  applyInputFromForm();
}

function applyInputFromForm() {
  const raw = readFormValues();
  const result = state.moduleDef.parseInput(raw);
  if (!result.ok) {
    showFieldErrors(result.errors);
    return;
  }
  clearFieldErrors();
  stopPlaying();
  state.input = result.input;
  state.steps = state.moduleDef.generateSteps(result.input);
  state.stepIndex = 0;
  renderCurrentStep();
}

function renderCurrentStep() {
  if (!state.steps.length) return;
  const step = state.steps[state.stepIndex];

  state.moduleDef.render(els['stage-visual'], step, state.input);

  els['step-tag'].textContent = `STEP ${state.stepIndex}`;
  els['status-text'].textContent = step.description;
  els['stage-status'].classList.remove('status-success', 'status-fail');
  if (step.status === 'success') els['stage-status'].classList.add('status-success');
  if (step.status === 'fail') els['stage-status'].classList.add('status-fail');
  Renderer.highlightLine(state.lineEls, step.codeLine);

  const pct = state.steps.length > 1 ? (state.stepIndex / (state.steps.length - 1)) * 100 : 100;
  els['progress-fill'].style.width = `${pct}%`;
  els['step-counter'].textContent = `Step ${state.stepIndex} / ${state.steps.length - 1}`;

  const atStart = state.stepIndex === 0;
  const atEnd = state.stepIndex === state.steps.length - 1;
  els['btn-prev'].disabled = atStart;
  els['btn-next'].disabled = atEnd;
  els['btn-play'].disabled = atEnd;

  if (atEnd) stopPlaying();
}

function stepForward() {
  if (state.stepIndex >= state.steps.length - 1) {
    stopPlaying();
    return;
  }
  state.stepIndex++;
  renderCurrentStep();
}

function stepBackward() {
  if (state.stepIndex <= 0) return;
  state.stepIndex--;
  renderCurrentStep();
}

function resetSteps() {
  stopPlaying();
  state.stepIndex = 0;
  renderCurrentStep();
}

function startPlaying() {
  if (state.stepIndex >= state.steps.length - 1) return;
  // Defensive: never allow two intervals to run at once, even if this is
  // somehow called while one is already active (rapid clicks, stray events).
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.playing = true;
  els['play-icon'].textContent = '❚❚';
  els['play-label'].textContent = 'Pause';
  state.intervalId = setInterval(stepForward, SPEED_MS[state.speed]);
}

function stopPlaying() {
  state.playing = false;
  els['play-icon'].textContent = '▶';
  els['play-label'].textContent = 'Play';
  if (state.intervalId) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

function togglePlay() {
  if (state.playing) stopPlaying();
  else startPlaying();
}

let controlsBound = false;
function bindControls() {
  // init() only runs once per page load, but this guards against the
  // controller ever being re-initialized and double-binding click handlers
  // (which would fire each action twice and desync playback state).
  if (controlsBound) return;
  controlsBound = true;

  els['btn-play'].addEventListener('click', togglePlay);
  els['btn-next'].addEventListener('click', () => { stopPlaying(); stepForward(); });
  els['btn-prev'].addEventListener('click', () => { stopPlaying(); stepBackward(); });
  els['btn-reset'].addEventListener('click', resetSteps);

  els['speed-range'].addEventListener('input', (e) => {
    state.speed = Number(e.target.value);
    els['speed-label'].textContent = SPEED_LABELS[state.speed];
    if (state.playing) {
      stopPlaying();
      startPlaying();
    }
  });
  els['speed-label'].textContent = SPEED_LABELS[state.speed];

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') { stopPlaying(); stepForward(); }
    if (e.code === 'ArrowLeft') { stopPlaying(); stepBackward(); }
  });
}

init();
