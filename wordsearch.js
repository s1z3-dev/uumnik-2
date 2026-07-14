/* ============================================================
   PlayLearn - Word Search
   Easy   6x6, 4 words, across and down
   Medium 8x8, 6 words, across and down
   Hard   10x10, 8 words, plus diagonals
   Selection: tap the FIRST letter, then the LAST letter.
   ============================================================ */

/* ---------- pure generator (also unit-tested in Node) ---------- */

function wsTryPlace(grid, size, word, dirs) {
  for (let attempt = 0; attempt < 250; attempt++) {
    const d = pickOne(dirs);
    const dr = d[0], dc = d[1], len = word.length;
    const rMin = dr < 0 ? len - 1 : 0;
    const rMax = dr > 0 ? size - len : size - 1;
    const cMin = dc < 0 ? len - 1 : 0;
    const cMax = dc > 0 ? size - len : size - 1;
    if (rMax < rMin || cMax < cMin) continue;
    const r0 = randInt(rMin, rMax), c0 = randInt(cMin, cMax);
    let ok = true;
    for (let i = 0; i < len; i++) {
      const ch = grid[r0 + dr * i][c0 + dc * i];
      if (ch && ch !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;
    for (let i = 0; i < len; i++) grid[r0 + dr * i][c0 + dc * i] = word[i];
    return { r: r0, c: c0, dr: dr, dc: dc };
  }
  return null;
}

function wsGenerate(entries, size, dirs, alphabet) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = [];
    for (let i = 0; i < size; i++) grid.push(new Array(size).fill(""));
    const placed = [];
    let ok = true;
    const sorted = entries.slice().sort(function (a, b) { return b.w.length - a.w.length; });
    for (let i = 0; i < sorted.length; i++) {
      const pos = wsTryPlace(grid, size, sorted[i].w, dirs);
      if (!pos) { ok = false; break; }
      placed.push({ w: sorted[i].w, e: sorted[i].e, pos: pos });
    }
    if (!ok) continue;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) grid[r][c] = pickOne(alphabet);
      }
    }
    return { grid: grid, words: placed, size: size };
  }
  return null;
}

function wsBuild(lang, level) {
  const conf = [null,
    { size: 6,  count: 4, dirs: [[0, 1], [1, 0]] },
    { size: 8,  count: 6, dirs: [[0, 1], [1, 0]] },
    { size: 10, count: 8, dirs: [[0, 1], [1, 0], [1, 1], [1, -1]] }][level];
  const all = [];
  VOCAB_CATEGORIES.forEach(function (cat) {
    VOCAB[lang][cat.id].forEach(function (e) {
      if (e.w.length >= 3 && e.w.length <= conf.size) all.push(e);
    });
  });
  for (let k = 0; k < 10; k++) {
    const g = wsGenerate(shuffle(all).slice(0, conf.count), conf.size, conf.dirs, ALPHABETS[lang]);
    if (g) return g;
  }
  const shorts = all.filter(function (e) { return e.w.length <= conf.size - 2; });
  return wsGenerate(shuffle(shorts).slice(0, conf.count), conf.size, conf.dirs, ALPHABETS[lang]);
}

/* ---------- game module ---------- */

const WordsearchGame = (function () {

  function init(root, level, ctx) {
    const lang = I18N.lang();
    const puz = wsBuild(lang, level);
    const size = puz.size;
    const st = { anchor: null, found: {}, hints: 0, done: false };

    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const hintBtn = el("button", "btn small secondary", "💡 " + t("hint"));
    const info = el("span", "toolbar-info", "");
    toolbar.appendChild(hintBtn);
    toolbar.appendChild(info);
    root.appendChild(toolbar);

    const grid = el("div", "ws-grid");
    const cellPx = clamp(Math.floor((Math.min(root.clientWidth, 520) - 20) / size), 28, 46);
    grid.style.gridTemplateColumns = "repeat(" + size + ", " + cellPx + "px)";
    grid.style.gridAutoRows = cellPx + "px";
    grid.style.fontSize = Math.floor(cellPx * 0.5) + "px";
    root.appendChild(grid);

    const cellEls = [];
    for (let r = 0; r < size; r++) {
      cellEls.push([]);
      for (let c = 0; c < size; c++) {
        const cell = el("button", "ws-cell", puz.grid[r][c]);
        (function (rr, cc) {
          cell.addEventListener("click", function () { tap(rr, cc); });
        })(r, c);
        grid.appendChild(cell);
        cellEls[r].push(cell);
      }
    }

    root.appendChild(el("p", "game-hint-text", t("wordsToFind")));
    const wordRow = el("div", "ws-words");
    const chipEls = {};
    puz.words.forEach(function (w) {
      const chip = el("span", "ws-word", w.e + " " + w.w);
      wordRow.appendChild(chip);
      chipEls[w.w] = chip;
    });
    root.appendChild(wordRow);

    hintBtn.addEventListener("click", function () {
      if (st.done) return;
      const remaining = puz.words.filter(function (w) { return !st.found[w.w]; });
      if (!remaining.length) return;
      const w = pickOne(remaining);
      const cell = cellEls[w.pos.r][w.pos.c];
      cell.classList.add("hintflash");
      setTimeout(function () { cell.classList.remove("hintflash"); }, 1400);
      st.hints++;
      AudioFX.flip();
      paint();
    });

    function tap(r, c) {
      if (st.done) return;
      if (!st.anchor) {
        st.anchor = [r, c];
        cellEls[r][c].classList.add("anchor");
        AudioFX.click();
        return;
      }
      const ar = st.anchor[0], ac = st.anchor[1];
      cellEls[ar][ac].classList.remove("anchor");
      if (ar === r && ac === c) { st.anchor = null; return; } /* deselect */
      st.anchor = null;
      const dR = r - ar, dC = c - ac;
      const straight = dR === 0 || dC === 0 || Math.abs(dR) === Math.abs(dC);
      if (!straight) { AudioFX.bad(); return; }
      const steps = Math.max(Math.abs(dR), Math.abs(dC));
      const dr = Math.sign(dR), dc = Math.sign(dC);
      const cells = [];
      let s = "";
      for (let i = 0; i <= steps; i++) {
        cells.push([ar + dr * i, ac + dc * i]);
        s += puz.grid[ar + dr * i][ac + dc * i];
      }
      const rev = s.split("").reverse().join("");
      const hit = puz.words.filter(function (w) {
        return !st.found[w.w] && (w.w === s || w.w === rev);
      })[0];
      if (hit) {
        st.found[hit.w] = true;
        cells.forEach(function (rc) { cellEls[rc[0]][rc[1]].classList.add("found"); });
        chipEls[hit.w].classList.add("found");
        AudioFX.good();
        paint();
        checkComplete();
      } else {
        AudioFX.bad();
        cells.forEach(function (rc) {
          cellEls[rc[0]][rc[1]].classList.add("badflash");
          setTimeout(function () { cellEls[rc[0]][rc[1]].classList.remove("badflash"); }, 450);
        });
      }
    }

    function checkComplete() {
      if (Object.keys(st.found).length < puz.words.length) return;
      st.done = true;
      const stars = 3 - Math.min(2, st.hints);
      setTimeout(function () { ctx.finish(stars); }, 450);
    }

    function paint() {
      info.textContent = Object.keys(st.found).length + " / " + puz.words.length + " · " + t("hintsLeft", { n: st.hints });
    }

    paint();
  }

  return { id: "wordsearch", init: init, destroy: function () {} };
})();
