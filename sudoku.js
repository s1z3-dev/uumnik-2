/* ============================================================
   PlayLearn - Sudoku
   Easy   4x4 with animal symbols
   Medium 6x6 with numbers
   Hard   9x9 with numbers
   Puzzles are generated with a guaranteed unique solution.
   ============================================================ */

/* ---------- pure generator (also unit-tested in Node) ---------- */

function sdBoxDims(size) { return size === 4 ? [2, 2] : size === 6 ? [2, 3] : [3, 3]; }

function sdOk(g, size, br, bc, r, c, v) {
  for (let i = 0; i < size; i++) if (g[r][i] === v || g[i][c] === v) return false;
  const r0 = Math.floor(r / br) * br, c0 = Math.floor(c / bc) * bc;
  for (let i = 0; i < br; i++) for (let j = 0; j < bc; j++) if (g[r0 + i][c0 + j] === v) return false;
  return true;
}

function sdMakeSolved(size) {
  const dims = sdBoxDims(size), br = dims[0], bc = dims[1];
  const g = [];
  for (let i = 0; i < size; i++) g.push(new Array(size).fill(0));
  const vals = [];
  for (let v = 1; v <= size; v++) vals.push(v);
  function fill(pos) {
    if (pos === size * size) return true;
    const r = Math.floor(pos / size), c = pos % size;
    const order = shuffle(vals);
    for (let k = 0; k < order.length; k++) {
      if (sdOk(g, size, br, bc, r, c, order[k])) {
        g[r][c] = order[k];
        if (fill(pos + 1)) return true;
        g[r][c] = 0;
      }
    }
    return false;
  }
  fill(0);
  return g;
}

function sdCountSolutions(g, size, limit) {
  const dims = sdBoxDims(size), br = dims[0], bc = dims[1];
  let count = 0;
  function solve() {
    if (count >= limit) return;
    let r = -1, c = -1;
    for (let i = 0; i < size && r < 0; i++) {
      for (let j = 0; j < size; j++) {
        if (g[i][j] === 0) { r = i; c = j; break; }
      }
    }
    if (r < 0) { count++; return; }
    for (let v = 1; v <= size; v++) {
      if (sdOk(g, size, br, bc, r, c, v)) {
        g[r][c] = v;
        solve();
        g[r][c] = 0;
        if (count >= limit) return;
      }
    }
  }
  solve();
  return count;
}

function sdGenerate(size, holes) {
  const solution = sdMakeSolved(size);
  const puzzle = solution.map(function (row) { return row.slice(); });
  const cells = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) cells.push([r, c]);
  let removed = 0;
  const order = shuffle(cells);
  for (let i = 0; i < order.length && removed < holes; i++) {
    const r = order[i][0], c = order[i][1];
    const keep = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map(function (row) { return row.slice(); });
    if (sdCountSolutions(copy, size, 2) !== 1) puzzle[r][c] = keep;
    else removed++;
  }
  return { puzzle: puzzle, solution: solution };
}

/* ---------- game module ---------- */

const SudokuGame = (function () {

  function init(root, level, ctx) {
    const conf = level === 1
      ? { size: 4, holes: 8, syms: ["🐱", "🐶", "🐰", "🦊"], emoji: true }
      : level === 2
        ? { size: 6, holes: 16, syms: ["1", "2", "3", "4", "5", "6"], emoji: false }
        : { size: 9, holes: 42, syms: ["1", "2", "3", "4", "5", "6", "7", "8", "9"], emoji: false };

    const gen = sdGenerate(conf.size, conf.holes);
    const size = conf.size;
    const dims = sdBoxDims(size), br = dims[0], bc = dims[1];
    const st = { board: gen.puzzle.map(function (r) { return r.slice(); }), sel: null, hints: 0, mistakes: 0, show: true, done: false };

    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const hintBtn = el("button", "btn small secondary", "💡 " + t("hint"));
    const showBtn = el("button", "btn small toggle on", "👀 " + t("showMistakes"));
    const info = el("span", "toolbar-info", "");
    toolbar.appendChild(hintBtn);
    toolbar.appendChild(showBtn);
    toolbar.appendChild(info);
    root.appendChild(toolbar);

    if (conf.emoji) root.appendChild(el("p", "game-hint-text", t("chooseSymbol")));

    const grid = el("div", "sd-grid");
    const cellPx = clamp(Math.floor((Math.min(root.clientWidth, 520) - 24) / size), 30, 56);
    grid.style.gridTemplateColumns = "repeat(" + size + ", " + cellPx + "px)";
    grid.style.gridAutoRows = cellPx + "px";
    grid.style.fontSize = Math.floor(cellPx * (conf.emoji ? 0.58 : 0.5)) + "px";
    root.appendChild(grid);

    const cellEls = [];
    for (let r = 0; r < size; r++) {
      cellEls.push([]);
      for (let c = 0; c < size; c++) {
        const cell = el("div", "sd-cell");
        if (c % bc === 0 && c !== 0) cell.classList.add("bl");
        if (r % br === 0 && r !== 0) cell.classList.add("bt");
        if (gen.puzzle[r][c] !== 0) cell.classList.add("given");
        (function (rr, cc) {
          cell.addEventListener("click", function () {
            if (st.done || gen.puzzle[rr][cc] !== 0) return;
            st.sel = [rr, cc];
            AudioFX.click();
            paint();
          });
        })(r, c);
        grid.appendChild(cell);
        cellEls[r].push(cell);
      }
    }

    const palette = el("div", "sd-palette");
    conf.syms.forEach(function (s, i) {
      const b = el("button", "key" + (conf.emoji ? " emoji" : ""), s);
      b.addEventListener("click", function () { setVal(i + 1); });
      palette.appendChild(b);
    });
    const erase = el("button", "key wide", "🧽");
    erase.addEventListener("click", function () { setVal(0); });
    palette.appendChild(erase);
    root.appendChild(palette);

    showBtn.addEventListener("click", function () {
      st.show = !st.show;
      showBtn.classList.toggle("on", st.show);
      paint();
    });

    hintBtn.addEventListener("click", function () {
      if (st.done) return;
      let target = null;
      if (st.sel && st.board[st.sel[0]][st.sel[1]] !== gen.solution[st.sel[0]][st.sel[1]]) target = st.sel;
      if (!target) {
        for (let r = 0; r < size && !target; r++) {
          for (let c = 0; c < size; c++) {
            if (gen.puzzle[r][c] === 0 && st.board[r][c] !== gen.solution[r][c]) { target = [r, c]; break; }
          }
        }
      }
      if (!target) return;
      st.board[target[0]][target[1]] = gen.solution[target[0]][target[1]];
      st.hints++;
      AudioFX.flip();
      paint();
      checkComplete();
    });

    function setVal(v) {
      if (st.done || !st.sel) return;
      const r = st.sel[0], c = st.sel[1];
      st.board[r][c] = v;
      if (v !== 0 && v !== gen.solution[r][c]) { st.mistakes++; AudioFX.bad(); }
      else if (v !== 0) AudioFX.click();
      paint();
      checkComplete();
    }

    function checkComplete() {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (st.board[r][c] !== gen.solution[r][c]) return;
        }
      }
      st.done = true;
      let stars = 1;
      if (st.hints === 0 && st.mistakes <= 2) stars = 3;
      else if (st.hints <= 2 && st.mistakes <= 6) stars = 2;
      setTimeout(function () { ctx.finish(stars); }, 400);
    }

    function paint() {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = cellEls[r][c];
          const v = st.board[r][c];
          cell.textContent = v === 0 ? "" : conf.syms[v - 1];
          cell.classList.toggle("sel", !!(st.sel && st.sel[0] === r && st.sel[1] === c));
          cell.classList.toggle("bad", st.show && v !== 0 && gen.puzzle[r][c] === 0 && v !== gen.solution[r][c]);
        }
      }
      info.textContent = t("hintsLeft", { n: st.hints }) + " · " + t("mistakes", { n: st.mistakes });
    }

    paint();
  }

  return { id: "sudoku", init: init, destroy: function () {} };
})();
