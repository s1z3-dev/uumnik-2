/* ============================================================
   PlayLearn - Quiz
   Questions are generated from the vocabulary of the active
   language, so every round is different:
     pic    which picture shows the word
     word   what is this picture called
     count  how many do you see
     odd    which one does not belong (hard levels)
   ============================================================ */

/* ---------- pure round generator (also unit-tested) ---------- */

function quizRound(level, lang) {
  const V = VOCAB[lang];
  const nOpts = level === 1 ? 3 : 4;
  const types = level === 1 ? ["pic", "count"]
    : level === 2 ? ["pic", "count", "word"]
    : ["pic", "count", "word", "odd"];
  const qs = [];

  for (let i = 0; i < 8; i++) {
    const type = pickOne(types);

    if (type === "pic") {
      const cat = pickOne(VOCAB_CATEGORIES).id;
      const opts = shuffle(V[cat]).slice(0, nOpts);
      const target = randInt(0, opts.length - 1);
      qs.push({
        text: t("whichPicture", { word: opts[target].w }),
        big: null,
        opts: opts.map(function (o) { return o.e; }),
        kind: "emoji",
        correct: target
      });

    } else if (type === "word") {
      const cat = pickOne(VOCAB_CATEGORIES).id;
      const opts = shuffle(V[cat]).slice(0, nOpts);
      const target = randInt(0, opts.length - 1);
      qs.push({
        text: t("whichWord"),
        big: opts[target].e,
        opts: opts.map(function (o) { return o.w; }),
        kind: "word",
        correct: target
      });

    } else if (type === "count") {
      const n = level === 1 ? randInt(3, 6) : level === 2 ? randInt(4, 9) : randInt(6, 12);
      const item = pickOne(V.animals.concat(V.food));
      let nums = [n, n - 1, n + 1];
      if (nOpts === 4) nums.push(n >= 3 ? n - 2 : n + 2);
      nums = shuffle(nums);
      qs.push({
        text: t("howManyQ", { e: item.e }),
        big: item.e.repeat(n),
        opts: nums.map(String),
        kind: "num",
        correct: nums.indexOf(n)
      });

    } else { /* odd one out */
      const catObj = pickOne(VOCAB_CATEGORIES);
      let otherObj = pickOne(VOCAB_CATEGORIES);
      while (otherObj.id === catObj.id) otherObj = pickOne(VOCAB_CATEGORIES);
      const three = shuffle(V[catObj.id]).slice(0, 3).map(function (o) { return o.e; });
      const outsider = pickOne(V[otherObj.id]).e;
      const opts = shuffle(three.concat([outsider]));
      qs.push({
        text: t("oddOneOut", { cat: t(catObj.key) }),
        big: null,
        opts: opts,
        kind: "emoji",
        correct: opts.indexOf(outsider)
      });
    }
  }
  return qs;
}

/* ---------- game module ---------- */

const QuizGame = (function () {

  function init(root, level, ctx) {
    const TOTAL = 8;
    const qs = quizRound(level, I18N.lang());
    const st = { i: 0, score: 0, locked: false };

    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const progress = el("span", "toolbar-info strong", "");
    const scoreEl = el("span", "toolbar-info", "");
    toolbar.appendChild(progress);
    toolbar.appendChild(scoreEl);
    root.appendChild(toolbar);

    const qEl = el("div", "quiz-q", "");
    const bigEl = el("div", "quiz-big", "");
    const optsEl = el("div", "quiz-opts", "");
    root.appendChild(qEl);
    root.appendChild(bigEl);
    root.appendChild(optsEl);

    function show() {
      const q = qs[st.i];
      st.locked = false;
      progress.textContent = t("questionOf", { a: st.i + 1, b: TOTAL });
      scoreEl.textContent = "🏆 " + st.score;
      qEl.textContent = q.text;
      bigEl.innerHTML = q.big ? escapeHtml(q.big) : "";
      bigEl.style.display = q.big ? "" : "none";
      optsEl.innerHTML = "";
      q.opts.forEach(function (o, idx) {
        const b = el("button", "opt " + q.kind, escapeHtml(o));
        b.addEventListener("click", function () { answer(idx, b); });
        optsEl.appendChild(b);
      });
    }

    function answer(idx, btn) {
      if (st.locked) return;
      st.locked = true;
      const q = qs[st.i];
      const buttons = optsEl.querySelectorAll(".opt");
      if (idx === q.correct) {
        st.score++;
        btn.classList.add("correct");
        AudioFX.good();
      } else {
        btn.classList.add("wrong");
        buttons[q.correct].classList.add("correct");
        AudioFX.bad();
      }
      setTimeout(function () {
        st.i++;
        if (st.i >= TOTAL) return end();
        show();
      }, 950);
    }

    function end() {
      let stars = 1;
      if (st.score === TOTAL) stars = 3;
      else if (st.score >= 6) stars = 2;
      ctx.finish(stars, {
        perfect: st.score === TOTAL,
        sub: t("resultScore", { a: st.score, b: TOTAL })
      });
    }

    show();
  }

  return { id: "quiz", init: init, destroy: function () {} };
})();
