/* ============================================================
   PlayLearn - Crossword
   The grid is generated fresh every round from the vocabulary
   of the active language, so it works in en / de / bg alike.
   Clues are pictures (emoji), perfect for early readers.
   ============================================================ */

/* ---------- pure generator (also unit-tested in Node) ---------- */

function cwKey(r, c) { return r + "," + c; }

function cwCanPlace(cells, word, r, c, dir, isFirst) {
  const dr = dir ? 1 : 0, dc = dir ? 0 : 1;
  if (cells[cwKey(r - dr, c - dc)] !== undefined) return -1;
  if (cells[cwKey(r + dr * word.length, c + dc * word.length)] !== undefined) return -1;
  let crossings = 0;
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i, cc = c + dc * i;
    const ex = cells[cwKey(rr, cc)];
    if (ex !== undefined) {
      if (ex !== word[i]) return -1;
      crossings++;
    } else if (dir === 0) {
      if (cells[cwKey(rr - 1, cc)] !== undefined || cells[cwKey(rr + 1, cc)] !== undefined) return -1;
    } else {
      if (cells[cwKey(rr, cc - 1)] !== undefined || cells[cwKey(rr, cc + 1)] !== undefined) return -1;
    }
  }
  if (!isFirst && crossings === 0) return -1;
  return crossings;
}

function cwGenerate(entries, target, tries) {
  tries = tries || 30;
  let best = null;
  for (let attempt = 0; attempt < tries; attempt++) {
    const order = shuffle(entries).sort(function (a, b) { return b.w.length - a.w.length; });
    const cells = {};
    const placed = [];
    const first = order[0];
    for (let i = 0; i < first.w.length; i++) cells[cwKey(0, i)] = first.w[i];
    placed.push({ w: first.w, e: first.e, r: 0, c: 0, dir: 0 });

    for (let wi = 1; wi < order.length; wi++) {
      const word = order[wi].w;
      const cands = [];
      Object.keys(cells).forEach(function (key) {
        const p = key.split(",");
        const rr = +p[0], cc = +p[1];
        const ch = cells[key];
        for (let li = 0; li < word.length; li++) {
          if (word[li] !== ch) continue;
          let sc = cwCanPlace(cells, word, rr, cc - li, 0, false);
          if (sc > 0) cands.push({ r: rr, c: cc - li, dir: 0 });
          sc = cwCanPlace(cells, word, rr - li, cc, 1, false);
          if (sc > 0) cands.push({ r: rr - li, c: cc, dir: 1 });
        }
      });
      if (!cands.length) continue;
      const pos = pickOne(cands);
      const dr = pos.dir ? 1 : 0, dc = pos.dir ? 0 : 1;
      for (let i = 0; i < word.length; i++) cells[cwKey(pos.r + dr * i, pos.c + dc * i)] = word[i];
      placed.push({ w: word, e: order[wi].e, r: pos.r, c: pos.c, dir: pos.dir });
    }
    if (!best || placed.length > best.placed.length) best = { cells: cells, placed: placed };
    if (best.placed.length >= target) break;
  }
  return cwNormalize(best);
}

function cwNormalize(b) {
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  Object.keys(b.cells).forEach(function (key) {
    const p = key.split(","); const r = +p[0], c = +p[1];
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    if (c < minC) minC = c; if (c > maxC) maxC = c;
  });
  const cells = {};
  Object.keys(b.cells).forEach(function (key) {
    const p = key.split(",");
    cells[cwKey(+p[0] - minR, +p[1] - minC)] = b.cells[key];
  });
  const words = b.placed.map(function (w) {
    return { w: w.w, e: w.e, r: w.r - minR, c: w.c - minC, dir: w.dir, num: 0 };
  });
  const startNums = {};
  let n = 0;
  words.slice().sort(function (a, b2) { return a.r - b2.r || a.c - b2.c; }).forEach(function (w) {
    const k = cwKey(w.r, w.c);
    if (startNums[k] === undefined) { n++; startNums[k] = n; }
    w.num = startNums[k];
  });
  return { w: maxC - minC + 1, h: maxR - minR + 1, cells: cells, words: words };
}

/* Pick words for a language + level and build a grid. */
function cwBuild(lang, level) {
  const conf = [null,
    { pool: 6,  maxLen: 5, target: 5 },
    { pool: 9,  maxLen: 7, target: 7 },
    { pool: 13, maxLen: 9, target: 9 }][level];
  const all = [];
  VOCAB_CATEGORIES.forEach(function (cat) {
    VOCAB[lang][cat.id].forEach(function (e) {
      if (e.w.length >= 3 && e.w.length <= conf.maxLen) all.push(e);
    });
  });
  let best = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const g = cwGenerate(shuffle(all).slice(0, conf.pool), conf.target, 30);
    if (!best || g.words.length > best.words.length) best = g;
    if (best.words.length >= conf.target) break;
  }
  return best;
}

/* ---------- game module ---------- */

const CrosswordGame = (function () {
  let keyHandler = null;

  function removeKeys() {
    if (keyHandler) { document.removeEventListener("keydown", keyHandler); keyHandler = null; }
  }

  function init(root, level, ctx) {
    removeKeys();
    const lang = I18N.lang();
    const puz = cwBuild(lang, level);
    const st = { user: {}, locked: {}, solved: {}, sel: null, hints: 0, mistakes: 0, done: false };

    /* ---- helpers over puzzle data ---- */
    function wordKeys(w) {
      const out = [], dr = w.dir ? 1 : 0, dc = w.dir ? 0 : 1;
      for (let i = 0; i < w.w.length; i++) out.push(cwKey(w.r + dr * i, w.c + dc * i));
      return out;
    }
    const wordCellCache = puz.words.map(wordKeys);
    function wordsAt(key) {
      const out = [];
      for (let i = 0; i < puz.words.length; i++) if (wordCellCache[i].indexOf(key) >= 0) out.push(i);
      return out;
    }

    /* ---- DOM ---- */
    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const hintBtn = el("button", "btn small secondary", "💡 " + t("hint"));
    const info = el("span", "toolbar-info", "");
    toolbar.appendChild(hintBtn);
    toolbar.appendChild(info);
    root.appendChild(toolbar);

    const grid = el("div", "cw-grid");
    root.appendChild(grid);
    const cw = clamp(Math.floor((Math.min(root.clientWidth, 560) - 16) / puz.w), 26, 46);
    grid.style.gridTemplateColumns = "repeat(" + puz.w + ", " + cw + "px)";
    grid.style.gridAutoRows = cw + "px";
    grid.style.fontSize = Math.floor(cw * 0.52) + "px";

    const numAt = {};
    puz.words.forEach(function (w) {
      const k = cwKey(w.r, w.c);
      if (!numAt[k]) numAt[k] = w.num;
    });

    const cellEls = {};
    for (let r = 0; r < puz.h; r++) {
      for (let c = 0; c < puz.w; c++) {
        const key = cwKey(r, c);
        if (puz.cells[key] === undefined) {
          grid.appendChild(el("div", "cw-cell void"));
        } else {
          const cell = el("div", "cw-cell");
          if (numAt[key]) cell.appendChild(el("span", "cw-num", numAt[key]));
          cell.appendChild(el("span", "cw-letter", ""));
          cell.addEventListener("click", function () { selectCell(key); });
          grid.appendChild(cell);
          cellEls[key] = cell;
        }
      }
    }

    const clues = el("div", "cw-clues");
    root.appendChild(clues);
    const clueEls = [];
    [0, 1].forEach(function (dir) {
      const group = el("div", "cw-clue-group");
      group.appendChild(el("div", "cw-clue-title", dir === 0 ? t("across") : t("down")));
      const row = el("div", "cw-clue-row");
      puz.words.forEach(function (w, i) {
        if (w.dir !== dir) return;
        const chip = el("button", "clue",
          '<span class="clue-num">' + w.num + (dir === 0 ? "→" : "↓") + '</span>' +
          '<span class="clue-emoji">' + w.e + '</span>' +
          '<span class="clue-len">' + w.w.length + '</span>');
        chip.addEventListener("click", function () {
          st.sel = { wordIdx: i, cellKey: firstOpenCell(i) };
          paint();
        });
        row.appendChild(chip);
        clueEls[i] = chip;
      });
      group.appendChild(row);
      clues.appendChild(group);
    });

    const kb = el("div", "kb");
    ALPHABETS[lang].forEach(function (letter) {
      const k = el("button", "key", letter);
      k.addEventListener("click", function () { input(letter); });
      kb.appendChild(k);
    });
    const back = el("button", "key wide", "⌫");
    back.addEventListener("click", backspace);
    kb.appendChild(back);
    root.appendChild(kb);

    /* ---- logic ---- */
    function firstOpenCell(wi) {
      const keys = wordCellCache[wi];
      for (let i = 0; i < keys.length; i++) if (!st.locked[keys[i]]) return keys[i];
      return keys[0];
    }

    function selectCell(key) {
      if (st.done) return;
      const idxs = wordsAt(key);
      if (!idxs.length) return;
      let wi;
      if (st.sel && st.sel.cellKey === key && idxs.length > 1) {
        wi = idxs[(idxs.indexOf(st.sel.wordIdx) + 1) % idxs.length]; /* toggle direction */
      } else if (st.sel && idxs.indexOf(st.sel.wordIdx) >= 0) {
        wi = st.sel.wordIdx;
      } else {
        wi = idxs[0];
        for (let i = 0; i < idxs.length; i++) if (!st.solved[idxs[i]]) { wi = idxs[i]; break; }
      }
      st.sel = { wordIdx: wi, cellKey: key };
      AudioFX.click();
      paint();
    }

    function input(letter) {
      if (st.done || !st.sel) return;
      const keys = wordCellCache[st.sel.wordIdx];
      let idx = keys.indexOf(st.sel.cellKey);
      while (idx < keys.length && st.locked[keys[idx]]) idx++;
      if (idx >= keys.length) return;
      const target = keys[idx];
      st.user[target] = letter;
      let nxt = idx + 1;
      while (nxt < keys.length && st.locked[keys[nxt]]) nxt++;
      st.sel.cellKey = keys[Math.min(nxt, keys.length - 1)];
      AudioFX.click();
      checkAt(target);
      paint();
    }

    function backspace() {
      if (st.done || !st.sel) return;
      const keys = wordCellCache[st.sel.wordIdx];
      let idx = keys.indexOf(st.sel.cellKey);
      if (!st.locked[keys[idx]] && st.user[keys[idx]]) {
        delete st.user[keys[idx]];
      } else {
        let prev = idx - 1;
        while (prev >= 0 && st.locked[keys[prev]]) prev--;
        if (prev >= 0) { st.sel.cellKey = keys[prev]; delete st.user[keys[prev]]; }
      }
      paint();
    }

    function checkAt(key) {
      wordsAt(key).forEach(function (wi) {
        if (st.solved[wi]) return;
        const keys = wordCellCache[wi];
        for (let i = 0; i < keys.length; i++) if (!st.user[keys[i]]) return;
        let built = "";
        keys.forEach(function (k) { built += st.user[k]; });
        if (built === puz.words[wi].w) {
          st.solved[wi] = true;
          keys.forEach(function (k) { st.locked[k] = true; });
          AudioFX.good();
          checkComplete();
        } else {
          st.mistakes++;
          AudioFX.bad();
          keys.forEach(function (k) {
            if (cellEls[k]) {
              cellEls[k].classList.add("badflash");
              setTimeout(function () { cellEls[k].classList.remove("badflash"); }, 550);
            }
          });
        }
      });
    }

    function checkComplete() {
      for (let i = 0; i < puz.words.length; i++) if (!st.solved[i]) return;
      st.done = true;
      let stars = 3;
      if (st.hints > 0 || st.mistakes > 4) stars = 2;
      if (st.hints > 2 || st.mistakes > 8) stars = 1;
      setTimeout(function () { ctx.finish(stars); }, 450);
    }

    function hint() {
      if (st.done) return;
      if (!st.sel) {
        for (let i = 0; i < puz.words.length; i++) {
          if (!st.solved[i]) { st.sel = { wordIdx: i, cellKey: firstOpenCell(i) }; break; }
        }
        if (!st.sel) return;
      }
      const keys = wordCellCache[st.sel.wordIdx];
      let target = null;
      for (let i = 0; i < keys.length; i++) {
        if (st.user[keys[i]] !== puz.cells[keys[i]]) { target = keys[i]; break; }
      }
      if (!target) return;
      st.user[target] = puz.cells[target];
      st.hints++;
      AudioFX.flip();
      checkAt(target);
      paint();
    }
    hintBtn.addEventListener("click", hint);

    function paint() {
      Object.keys(cellEls).forEach(function (key) {
        const cell = cellEls[key];
        cell.classList.remove("sel", "word-sel", "good");
        if (st.locked[key]) cell.classList.add("good");
        cell.querySelector(".cw-letter").textContent = st.user[key] || "";
      });
      if (st.sel) {
        wordCellCache[st.sel.wordIdx].forEach(function (k) {
          if (cellEls[k]) cellEls[k].classList.add("word-sel");
        });
        if (cellEls[st.sel.cellKey]) cellEls[st.sel.cellKey].classList.add("sel");
      }
      puz.words.forEach(function (w, i) {
        if (!clueEls[i]) return;
        clueEls[i].classList.toggle("done", !!st.solved[i]);
        clueEls[i].classList.toggle("active", !!(st.sel && st.sel.wordIdx === i));
      });
      info.textContent = t("hintsLeft", { n: st.hints }) + " · " + t("mistakes", { n: st.mistakes });
    }

    /* physical keyboard */
    keyHandler = function (e) {
      if (st.done) return;
      if (e.key === "Backspace") { e.preventDefault(); backspace(); return; }
      if (e.key && e.key.length === 1) {
        const up = e.key.toUpperCase();
        if (ALPHABETS[lang].indexOf(up) >= 0) input(up);
      }
    };
    document.addEventListener("keydown", keyHandler);

    /* preselect the first word */
    st.sel = { wordIdx: 0, cellKey: wordCellCache[0][0] };
    paint();
  }

  return {
    id: "crossword",
    init: init,
    destroy: removeKeys
  };
})();
