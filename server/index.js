const path = require('path');
const express = require('express');
const algorithms = require('./data/algorithms');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static frontend (public/) — index.html, visualize.html, CSS, and
// client JS. This is a small multi-page static site, not a single-page app,
// so express.static already resolves "/" -> index.html and
// "/visualize.html" -> visualize.html with no extra routing needed.
app.use(express.static(path.join(__dirname, '..', 'public')));

/**
 * GET /api/algorithms
 * Returns metadata for all four patterns — powers the home page cards.
 */
app.get('/api/algorithms', (req, res) => {
  res.json(algorithms);
});

/**
 * GET /api/algorithms/:slug
 * Returns metadata for a single pattern — powers the visualization page.
 */
app.get('/api/algorithms/:slug', (req, res) => {
  const algo = algorithms.find((a) => a.slug === req.params.slug);
  if (!algo) {
    return res.status(404).json({ error: `No algorithm found for "${req.params.slug}"` });
  }
  res.json(algo);
});

// Anything else (unknown API route or missing file) is a genuine 404.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Algorithm Visualizer listening on port ${PORT}`);
});
