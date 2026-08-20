# Algorithm Visualizer — Interactive DSA Pattern Explorer

An interactive, step-by-step visualizer for four core data-structures-and-algorithms
(DSA) patterns: **Two Pointers**, **Binary Search**, **Sliding Window**, and
**Prefix Sum**. Built as a small full-stack project (Node.js/Express backend,
vanilla JavaScript frontend) to make algorithm behavior visible rather than
something you have to trace by hand on paper.

## Overview

Most DSA resources explain these patterns as pseudocode or a wall of code.
This project turns each one into a small interactive simulation: you can step
through the exact same comparisons and pointer movements the algorithm makes,
at your own pace, with a plain-language explanation of what's happening at
every step. It's aimed at students revising DSA patterns, self-taught
developers preparing for interviews, and anyone who learns better by watching
a process than by reading about it.

## Features

- **Two Pointers** visualization — pair-with-target-sum on a sorted array
- **Binary Search** visualization — locate a value by halving the search space
- **Sliding Window** visualization — smallest subarray with a sum ≥ target
- **Prefix Sum** visualization — build a running-total array and answer range queries
- Step-by-step animations with a "what's happening" explanation on every step
- Play / Pause, Next Step, Previous Step, and Reset controls
- Adjustable animation speed
- Custom input (with inline validation) plus example presets and a random-input generator
- Time and space complexity shown for every algorithm
- A compact "About this pattern" panel (what it is, when to use it, core idea, common pattern, example)
- Live pseudocode with the currently-executing line highlighted
- Responsive layout that works on desktop, tablet, and mobile

## Algorithms covered

| Algorithm | Main Idea | Time Complexity | Space Complexity |
|---|---|---|---|
| Two Pointers | Move two indices inward from opposite ends of a sorted array, using a comparison to decide which one moves | O(n) | O(1) |
| Binary Search | Repeatedly compare the target to the middle element and discard the half of the range that can't contain it | O(log n) | O(1) |
| Sliding Window | Expand a window to the right and contract it from the left to track the smallest/largest valid contiguous range | O(n) | O(1) |
| Prefix Sum | Precompute a running-total array once so any range sum can be answered with a single subtraction | O(n) build, O(1) per query | O(n) |

## Tech Stack

- **JavaScript** (ES6+) — frontend and backend
- **Node.js** — runtime
- **Express 4** — minimal backend server (static file hosting + JSON API)
- **HTML5 / CSS3** — page structure and styling (no CSS framework)
- **Google Fonts** (Sora, Inter, JetBrains Mono) — loaded via CDN in `style.css`

No frontend framework, bundler, database, or build step is used. The
frontend is plain HTML/CSS/JS served directly by Express.

## Project Structure

```
algo-visualizer/
├── server/
│   ├── index.js              # Express app: serves the frontend + JSON API
│   └── data/
│       └── algorithms.js     # All algorithm metadata (descriptions, complexity, pseudocode)
├── public/                   # Everything the browser loads directly
│   ├── index.html            # Landing page (hero + 4 algorithm cards)
│   ├── visualize.html        # Shared visualization page (used by all 4 algorithms)
│   ├── css/
│   │   ├── variables.css     # Design tokens: colors, fonts, spacing
│   │   └── style.css         # All page styling
│   └── js/
│       ├── main.js           # Home page logic (renders cards, hero mini-demo)
│       └── visualize/
│           ├── utils.js      # Input parsing/validation helpers
│           ├── renderer.js   # Generic DOM drawing helpers (cells, pointers, beams)
│           ├── app.js        # Playback controller (play/pause/step/reset/speed)
│           └── algorithms/   # One file per pattern: step generation + rendering
│               ├── twoPointers.js
│               ├── binarySearch.js
│               ├── slidingWindow.js
│               └── prefixSum.js
├── package.json
├── package-lock.json
├── render.yaml                # Render deployment configuration (optional Blueprint)
├── .gitignore
├── LICENSE
└── README.md
```

Each algorithm module in `public/js/visualize/algorithms/` is self-contained:
it validates its own input, generates the list of "steps" the algorithm goes
through, and knows how to draw any given step. `app.js` and `renderer.js`
don't know anything about the specific algorithms — they just drive playback
and provide generic drawing primitives (array cells, pointer tags, highlight
states). Adding a new pattern means adding one new file, not touching the
existing ones.

## How It Works

This is a small full-stack app, not a single-page app framework:

- **Backend (`server/index.js`)** is an Express server with two jobs:
  1. Serve the static files in `public/` (HTML, CSS, JS).
  2. Serve a small JSON API (`/api/algorithms`, `/api/algorithms/:slug`) that
     returns each algorithm's description, complexity, and pseudocode.
- **Frontend (`public/`)** is plain HTML/CSS/JS. `index.html` fetches
  `/api/algorithms` to render the four cards. `visualize.html` is a single
  reusable page loaded for all four patterns (`visualize.html?algo=<slug>`);
  it fetches `/api/algorithms/:slug` for the metadata and then hands off to
  the matching algorithm module to generate and render the animation steps.

All requests from the frontend to the backend use relative paths
(`fetch('/api/algorithms')`), so the app works the same on `localhost` and
on a deployed domain with no configuration changes.

## Installation

Requires **Node.js 18+**.

```bash
git clone https://github.com/Dhruv-Salyan/algorithm-visualizer.git
cd algo-visualizer
npm install
npm start
```

Then open **http://localhost:3000**.

`npm run dev` runs the same server — there's no separate dev/build tooling,
it's plain Express serving static files.

## API

The backend exposes a small read-only JSON API:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/algorithms` | Returns metadata for all four algorithms (used by the home page cards) |
| GET | `/api/algorithms/:slug` | Returns metadata for one algorithm. `slug` is one of `two-pointers`, `binary-search`, `sliding-window`, `prefix-sum`. Returns `404` with `{ "error": "..." }` for an unknown slug |

Example:

```bash
curl http://localhost:3000/api/algorithms/binary-search
```

Any other route that doesn't match a static file or an API route returns a
plain `404`.

## Usage

1. Open the home page and pick a pattern, or go straight to
   `/visualize.html?algo=two-pointers` (also valid: `binary-search`,
   `sliding-window`, `prefix-sum`).
2. Use **Play** to auto-advance through the algorithm, or **Next/Previous**
   to step through it manually. Adjust **Speed** as needed.
3. Try the built-in **example presets**, click **🎲 Random** for a random
   valid input, or type your own array/target into the **Input** panel and
   click **Apply & Visualize** — invalid input (e.g. an unsorted array where
   sortedness is required) is rejected with an inline explanation.
4. Watch the pseudocode panel — the line currently executing is highlighted
   in sync with the animation, and the status bar explains each step in
   plain language.

## Deployment

This project deploys to [Render](https://render.com) as a single Node/Express
web service — no database, no environment variables, and no separate build
step required.

### Option A — Manual setup (Render dashboard)

1. Push this repository to GitHub (see commands below).
2. In the Render dashboard, click **New +** → **Web Service**.
3. Connect your GitHub account and select this repository.
4. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or any paid tier)
5. Click **Create Web Service**. Render builds and deploys automatically, and
   redeploys on every push to the connected branch.
6. Once deployed, Render gives you a public URL like
   `https://algorithm-visualizer-kbqw.onrender.com` — open it and the app should
   work exactly as it does locally.

### Option B — One-click Blueprint

This repo includes a `render.yaml` at the root. In the Render dashboard,
choose **New +** → **Blueprint**, point it at this repository, and Render
reads `render.yaml` and pre-fills the build/start commands and plan
automatically.

### Production notes

- The server listens on `process.env.PORT` (falling back to `3000` only for
  local development) — Render sets `PORT` automatically, no configuration needed.
- Static assets are served from `public/` via `express.static`, and all API
  calls from the frontend use relative paths — nothing is hardcoded to
  `localhost`, so the same code runs unchanged in production.
- No environment variables, API keys, or secrets are required to run this
  project anywhere.

## Environment Variables

**None required.** This project does not use a database, external API, or
any secrets. Render (and most hosts) set `PORT` automatically; no `.env`
file is needed.

## Future Improvements

These are not implemented — listed here as realistic next steps:

- Additional patterns: sorting algorithms (merge sort, quicksort), recursion
  and backtracking visualizations, graph traversal (BFS/DFS), dynamic programming
- Graph/tree visualizations with node-and-edge rendering
- Saving and sharing custom input sets (would require persistence, currently
  intentionally omitted to keep the project dependency-free)
- A quiz/practice mode built on top of the existing visualizations
- Dark/light theme toggle

## Screenshots

_Add screenshots here once the app is deployed or running locally._

```markdown
### Home page
![Home page](docs/screenshots/home.png)

### Two Pointers
![Two Pointers](docs/screenshots/two-pointers.png)

### Binary Search
![Binary Search](docs/screenshots/binary-search.png)

### Sliding Window
![Sliding Window](docs/screenshots/sliding-window.png)

### Prefix Sum
![Prefix Sum](docs/screenshots/prefix-sum.png)
```

To add real screenshots: create a `docs/screenshots/` folder, drop PNGs in
it with the names above, and uncomment/use the markdown block.

## How to Explain This Project in a Viva

Quick talking points if you're asked to walk through this project out loud:

1. **Why I built this** — DSA patterns like Two Pointers and Sliding Window are
   usually taught as pseudocode you trace by hand. I wanted to see the exact
   state (pointers, comparisons, eliminated regions) change on screen, step
   by step, instead of imagining it.
2. **Why these four patterns** — they're four of the most common interview
   patterns, they all operate on a plain array (so one visualization "shape"
   can represent all of them), and each one demonstrates a different way of
   reducing work: pointer convergence, search-space halving, window
   resizing, and precomputation.
3. **How the visualization engine works** — each algorithm module doesn't
   animate directly. It first runs the real algorithm once and records every
   intermediate state as a "step" object (pointer positions, comparisons,
   what changed, why). The player then just walks through that array of
   steps — play, pause, next, and previous are all just moving an index
   into an already-computed list, which is why they're instant and never
   get out of sync with the algorithm.
4. **How JavaScript controls the animation** — there's no animation library.
   `setInterval` advances the step index at a speed the user chooses; each
   step re-renders a small set of DOM elements (array cells, pointer tags),
   and CSS transitions animate the *change* between renders (position,
   color, opacity) so it reads as smooth movement rather than a slideshow.
5. **Why Node.js/Express** — the frontend needed a place to load algorithm
   metadata (descriptions, complexity, pseudocode) from instead of hardcoding
   it into the HTML, so a tiny Express server serves that as a JSON API and
   also hosts the static frontend — one deployable unit, no database needed.
6. **How frontend communicates with backend** — plain `fetch()` calls to two
   read-only JSON endpoints (`/api/algorithms`, `/api/algorithms/:slug`).
   No authentication, no state written back to the server — the backend is
   purely a content source.
7. **Time and space complexity of each algorithm** — see the table above;
   be ready to explain *why* each one holds (e.g. binary search is O(log n)
   because the search range halves every step; prefix sum is O(n) space
   because it stores one running total per input element).
8. **Challenges faced** — keeping the visualization *honest* to the real
   algorithm (the animation had to be generated from the same logic that
   decides correctness, not a separate "fake" animation); handling edge
   cases like single-element arrays, duplicate values, and no-solution
   cases without special-casing the renderer; and keeping four different
   algorithms behind one consistent, reusable UI.
9. **Possible future improvements** — see the Future Improvements section
   above (more patterns, graph/tree visualizations, a practice/quiz mode).

### 60–90 second explanation you can say out loud

> "This is an Algorithm Visualizer I built to make four common DSA patterns —
> Two Pointers, Binary Search, Sliding Window, and Prefix Sum — easier to
> understand by watching them run instead of just reading pseudocode. The
> backend is a small Node.js and Express server that serves the algorithm
> descriptions, complexities, and pseudocode as a JSON API, plus the static
> frontend files. The frontend is plain JavaScript with no framework: for
> each algorithm, I run the real logic once and record every step it goes
> through — pointer positions, comparisons, what changed and why — into an
> array. The player is just a small controller that walks through that array
> with play, pause, next, previous, and speed controls, re-rendering the
> array on screen and letting CSS transitions animate the difference between
> steps. Because the animation is generated from the same code that decides
> the algorithm's correctness, what you see on screen is guaranteed to match
> what the algorithm actually does — it's not a separate, hand-animated
> version. I also added input validation, example presets, a random-input
> generator, and a short explanation panel for each pattern, so it works
> both as a demo and as a small study tool. It's deployed as a single Node
> web service with no database and no environment variables, which kept the
> whole project small enough to fully understand and explain end to end."

## Learning Outcomes

This project was built to demonstrate:

**DSA concepts**
- Two-pointer technique and why sortedness enables it
- Binary search invariants (loop conditions, boundary updates, avoiding
  infinite loops and off-by-one errors)
- Variable-size sliding windows and amortized O(n) analysis
- Prefix sums and reducing repeated-range-sum queries from O(n) to O(1)

**Software engineering practices**
- Separating algorithm logic, rendering, and UI/playback control into
  distinct modules instead of one large script
- Designing a small, dependency-free REST API with Express
- Client-side input validation with clear user feedback
- Building a reusable visualization page driven by a consistent
  module interface, instead of one hard-coded page per algorithm
- Preparing a small Node app for real-world deployment (relative URLs,
  `process.env.PORT`, no hardcoded environment assumptions)

## License

Released under the [MIT License](LICENSE) — free to use, modify, and
distribute.
