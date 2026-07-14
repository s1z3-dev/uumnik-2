/* ============================================================
   PlayLearn - Memory
   Easy   3 emoji pairs
   Medium 6 emoji pairs
   Hard   10 word-picture pairs (match the word to its emoji,
          great reading practice in the active language)
   ============================================================ */

const MemoryGame = (function () {
  let unflipTimer = null;

  function init(root, level, ctx) {
    if (unflipTimer) { clearTimeout(unflipTimer); unflipTimer = null; }
    const conf = level === 1
      ? { pairs: 3, cols: 3, words: false }
      : level === 2
        ? { pairs: 6, cols: 4, words: false }
        : { pairs: 10, cols: 5, words: true };

    const lang = I18N.lang();
    const pool = [];
    const seen = {};
    VOCAB_CATEGORIES.forEach(function (cat) {
      VOCAB[lang][cat.id].forEach(function (e) {
        if (!seen[e.e]) { seen[e.e] = true; pool.push(e); }
      });
    });
    const chosen = shuffle(pool).slice(0, conf.pairs);

    let deck = [];
    chosen.forEach(function (e, i) {
      deck.push({ pid: i, face: e.e, word: false });
      deck.push(conf.words ? { pid: i, face: e.w, word: true } : { pid: i, face: e.e, word: false });
    });
    deck = shuffle(deck);

    const st = { open: [], matched: 0, moves: 0, lock: false, done: false };

    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const info = el("span", "toolbar-info strong", "");
    toolbar.appendChild(info);
    root.appendChild(toolbar);

    const grid = el("div", "mem-grid");
    grid.style.gridTemplateColumns = "repeat(" + conf.cols + ", 1fr)";
    root.appendChild(grid);

    const cardEls = [];
    deck.forEach(function (card, idx) {
      const c = el("button", "mem-card" + (card.word ? " word" : ""),
        '<span class="mem-inner">' +
          '<span class="mem-face front">❔</span>' +
          '<span class="mem-face back">' + escapeHtml(card.face) + "</span>" +
        "</span>");
      c.addEventListener("click", function () { flip(idx); });
      grid.appendChild(c);
      cardEls.push(c);
    });

    function flip(idx) {
      if (st.done || st.lock) return;
      const cardEl = cardEls[idx];
      if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;
      cardEl.classList.add("flipped");
      AudioFX.flip();
      st.open.push(idx);
      if (st.open.length === 2) {
        st.moves++;
        const a = st.open[0], b = st.open[1];
        st.open = [];
        if (deck[a].pid === deck[b].pid) {
          st.matched++;
          AudioFX.good();
          cardEls[a].classList.add("matched");
          cardEls[b].classList.add("matched");
          paint();
          if (st.matched === conf.pairs) end();
        } else {
          st.lock = true;
          paint();
          unflipTimer = setTimeout(function () {
            cardEls[a].classList.remove("flipped");
            cardEls[b].classList.remove("flipped");
            st.lock = false;
          }, 850);
        }
      } else paint();
    }

    function end() {
      st.done = true;
      let stars = 1;
      if (st.moves <= Math.ceil(conf.pairs * 1.7)) stars = 3;
      else if (st.moves <= Math.ceil(conf.pairs * 2.5)) stars = 2;
      setTimeout(function () {
        ctx.finish(stars, { sub: t("moves", { n: st.moves }) });
      }, 500);
    }

    function paint() {
      info.textContent = t("pairs", { a: st.matched, b: conf.pairs }) + " · " + t("moves", { n: st.moves });
    }

    paint();
  }

  return {
    id: "memory",
    init: init,
    destroy: function () { if (unflipTimer) { clearTimeout(unflipTimer); unflipTimer = null; } }
  };
})();
