// ---------------------------------------------------------------------------
// Renderer: small, dependency-free DOM helpers shared by every algorithm
// module. Nothing here knows about "two pointers" or "binary search" —
// it just draws array cells, pointer tags, and compare beams.
// ---------------------------------------------------------------------------

const Renderer = {
  /**
   * Renders a row of array cells into `container`.
   * `cells`: [{ value, classes: [], idxLabel }]
   * Returns the row element (position: relative, used as the anchor for
   * pointer tags and compare beams).
   */
  renderArrayRow(container, cells, rowClass = 'array-row') {
    const row = document.createElement('div');
    row.className = rowClass;
    cells.forEach((cell, i) => {
      const el = document.createElement('div');
      el.className = ['cell', ...(cell.classes || [])].join(' ');
      el.dataset.index = i;
      el.textContent = cell.value;
      if (cell.idxLabel !== false) {
        const idx = document.createElement('span');
        idx.className = 'idx';
        idx.textContent = cell.idxLabel !== undefined ? cell.idxLabel : i;
        el.appendChild(idx);
      }
      row.appendChild(el);
    });
    container.appendChild(row);
    return row;
  },

  /**
   * Places pointer tags (LEFT/RIGHT/MID/...) above the cells of `row`.
   * `pointers`: [{ index, label, type }] — type maps to a `.ptr-tag.<type>` class.
   * If two pointers land on the same index, offsets them horizontally so labels don't overlap.
   */
  placePointers(row, pointers) {
    const cellEls = row.querySelectorAll('.cell');
    const grouped = {};
    pointers.forEach((p) => {
      if (p.index < 0 || p.index >= cellEls.length) return;
      grouped[p.index] = grouped[p.index] || [];
      grouped[p.index].push(p);
    });

    Object.entries(grouped).forEach(([index, group]) => {
      const cellEl = cellEls[Number(index)];
      const centerLeft = cellEl.offsetLeft + cellEl.offsetWidth / 2;
      group.forEach((p, i) => {
        const tag = document.createElement('div');
        tag.className = `ptr-tag ${p.type}`;
        tag.textContent = p.label;
        // stack multiple pointers on the same cell vertically
        tag.style.top = `${-2 - i * 22}px`;
        tag.style.left = `${centerLeft}px`;
        row.appendChild(tag);
      });
    });
  },

  /** Draws a horizontal beam connecting the centers of two cells (a "comparison" beam). */
  placeCompareBeam(row, indexA, indexB) {
    const cellEls = row.querySelectorAll('.cell');
    if (indexA == null || indexB == null) return;
    if (indexA < 0 || indexB < 0 || indexA >= cellEls.length || indexB >= cellEls.length) return;
    const a = cellEls[indexA];
    const b = cellEls[indexB];
    const left = Math.min(a.offsetLeft, b.offsetLeft) + a.offsetWidth / 2;
    const width = Math.abs(b.offsetLeft - a.offsetLeft);
    const beam = document.createElement('div');
    beam.className = 'compare-beam show';
    beam.style.left = `${left}px`;
    beam.style.width = `${width}px`;
    row.appendChild(beam);
  },

  /** Clears a container's contents. */
  clear(container) {
    container.innerHTML = '';
  },

  /** Renders the pseudocode block with one <span class="line"> per line; returns the line elements. */
  renderPseudocode(container, lines) {
    container.innerHTML = '';
    return lines.map((line, i) => {
      const span = document.createElement('span');
      span.className = 'line';
      span.textContent = line === '' ? ' ' : line;
      span.dataset.line = i;
      container.appendChild(span);
      return span;
    });
  },

  /** Highlights a single pseudocode line by index (or none if index is null/undefined). */
  highlightLine(lineEls, activeIndex) {
    lineEls.forEach((el, i) => {
      el.classList.toggle('active-line', i === activeIndex);
    });
  },

  /** Renders the color legend from [{color, label}]. */
  renderLegend(container, items) {
    container.innerHTML = items
      .map(
        (item) => `
      <div class="legend-item">
        <span class="legend-swatch" style="background:${item.color}"></span>
        <span>${item.label}</span>
      </div>`
      )
      .join('');
  }
};
