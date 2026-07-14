/* ============================================================
   PlayLearn - Math Trainer
   Easy   plus / minus up to 10, with picture help
   Medium up to 100, times tables 2-5 and 10
   Hard   all operations, exact division, word problems
   Tracks answer streaks for the Number Ninja badge.
   ============================================================ */

/* ---------- pure question generator (also unit-tested) ---------- */

function mathGen(level) {
  if (level === 1) {
    if (Math.random() < 0.55) {
      const a = randInt(1, 9), b = randInt(1, 10 - a);
      return { text: a + " + " + b + " = ?", ans: a + b, vis: { a: a, b: b, op: "+" } };
    }
    const a2 = randInt(2, 10), b2 = randInt(1, a2 - 1);
    return { text: a2 + " − " + b2 + " = ?", ans: a2 - b2, vis: { a: a2, b: b2, op: "-" } };
  }
  if (level === 2) {
    const r = Math.random();
    if (r < 0.4) { const a = randInt(10, 89), b = randInt(1, 99 - a); return { text: a + " + " + b + " = ?", ans: a + b }; }
    if (r < 0.7) { const a = randInt(10, 99), b = randInt(1, a); return { text: a + " − " + b + " = ?", ans: a - b }; }
    const tb = pickOne([2, 3, 4, 5, 10]), m = randInt(1, 10);
    return { text: tb + " × " + m + " = ?", ans: tb * m };
  }
  const r = Math.random();
  if (r < 0.25 && typeof t === "function" && typeof CHARACTERS !== "undefined") {
    const tpl = pickOne(["mathT1", "mathT2", "mathT3", "mathT4"]);
    const name = pickOne(Object.keys(CHARACTERS).map(function (k) { return CHARACTERS[k].name; }));
    let a, b, ans;
    if (tpl === "mathT1") { a = randInt(3, 20); b = randInt(2, 20); ans = a + b; }
    else if (tpl === "mathT4") { a = randInt(2, 6); b = randInt(2, 6); ans = a * b; }
    else { a = randInt(5, 20); b = randInt(1, a - 1); ans = a - b; }
    return { text: t(tpl, { name: name, a: a, b: b }), ans: ans, word: true };
  }
  if (r < 0.5) { const a = randInt(10, 89), b = randInt(1, 99 - a); return { text: a + " + " + b + " = ?", ans: a + b }; }
  if (r < 0.7) { const a = randInt(10, 99), b = randInt(1, a); return { text: a + " − " + b + " = ?", ans: a - b }; }
  if (r < 0.85) { const a = randInt(2, 10), b = randInt(2, 10); return { text: a + " × " + b + " = ?", ans: a * b }; }
  const d = randInt(2, 10), q = randInt(2, 10);
  return { text: (d * q) + " ÷ " + d + " = ?", ans: q };
}

/* ---------- game module ---------- */

const MathGame = (function () {
  let timer = null;

  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function init(root, level, ctx) {
    stopTimer();
    const TOTAL = 10;
    const st = { q: 0, correct: 0, streak: 0, timed: false, buf: "", locked: false, done: false };
    let cur = null;

    root.innerHTML = "";
    const toolbar = el("div", "game-toolbar");
    const progress = el("span", "toolbar-info strong", "");
    const streakEl = el("span", "toolbar-info", "");
    const timedBtn = el("button", "btn small toggle", "⏱️ " + t("timedMode"));
    toolbar.appendChild(progress);
    toolbar.appendChild(streakEl);
    toolbar.appendChild(timedBtn);
    root.appendChild(toolbar);

    const timeBar = el("div", "time-bar hidden", '<div class="time-fill"></div>');
    root.appendChild(timeBar);
    const timeFill = timeBar.querySelector(".time-fill");

    const qEl = el("div", "math-q", "");
    root.appendChild(qEl);
    const visEl = el("div", "math-visual", "");
    root.appendChild(visEl);
    const ansEl = el("div", "answer-display", "?");
    root.appendChild(ansEl);

    const pad = el("div", "numpad");
    "1 2 3 4 5 6 7 8 9".split(" ").forEach(addPadKey);
    addPadKey("C");
    addPadKey("0");
    addPadKey("✓");
    root.appendChild(pad);

    function addPadKey(k) {
      const b = el("button", "key" + (k === "✓" ? " ok" : k === "C" ? " danger" : ""), k);
      b.addEventListener("click", function () { press(k); });
      pad.appendChild(b);
    }

    timedBtn.addEventListener("click", function () {
      st.timed = !st.timed;
      timedBtn.classList.toggle("on", st.timed);
      timeBar.classList.toggle("hidden", !st.timed);
      restartTimer();
    });

    function press(k) {
      if (st.locked || st.done) return;
      if (k === "C") { st.buf = ""; }
      else if (k === "✓") { submit(); return; }
      else if (st.buf.length < 3) st.buf += k;
      AudioFX.click();
      ansEl.textContent = st.buf || "?";
    }

    function restartTimer() {
      stopTimer();
      if (!st.timed || st.done) { timeFill.style.width = "100%"; return; }
      const started = Date.now(), limit = 15000;
      timeFill.style.width = "100%";
      timer = setInterval(function () {
        const left = 1 - (Date.now() - started) / limit;
        timeFill.style.width = Math.max(0, left * 100) + "%";
        if (left <= 0) { stopTimer(); miss(); }
      }, 100);
    }

    function submit() {
      if (st.buf === "" || st.locked) return;
      stopTimer();
      if (parseInt(st.buf, 10) === cur.ans) {
        st.correct++;
        st.streak++;
        AudioFX.good();
        ansEl.classList.add("flash-good");
        const res = Progress.updateMathStreak(st.streak);
        if (res.newBadges.length && ctx.badgeToast) ctx.badgeToast(res.newBadges);
        after();
      } else miss();
    }

    function miss() {
      st.locked = true;
      st.streak = 0;
      AudioFX.bad();
      ansEl.classList.add("flash-bad");
      ansEl.textContent = "= " + cur.ans;
      setTimeout(nextQ, 1200);
    }

    function after() {
      st.locked = true;
      setTimeout(nextQ, 750);
    }

    function nextQ() {
      ansEl.classList.remove("flash-good", "flash-bad");
      st.q++;
      if (st.q >= TOTAL) return end();
      showQ();
    }

    function end() {
      st.done = true;
      stopTimer();
      let stars = 1;
      if (st.correct >= 9) stars = 3;
      else if (st.correct >= 7) stars = 2;
      ctx.finish(stars, { sub: t("resultScore", { a: st.correct, b: TOTAL }) });
    }

    function visual(vis) {
      if (!vis) return "";
      const emo = pickOne(["🍎", "🍓", "⭐", "🎈", "🐟"]);
      let html = "";
      if (vis.op === "+") {
        html = emo.repeat(vis.a) + ' <span class="vis-op">+</span> ' + emo.repeat(vis.b);
      } else {
        html = emo.repeat(vis.a - vis.b) + '<span class="vis-fade">' + emo.repeat(vis.b) + "</span>";
      }
      return html;
    }

    function showQ() {
      cur = mathGen(level);
      st.buf = "";
      st.locked = false;
      qEl.textContent = cur.text;
      qEl.classList.toggle("word", !!cur.word);
      visEl.innerHTML = visual(cur.vis);
      ansEl.textContent = "?";
      progress.textContent = t("questionOf", { a: st.q + 1, b: TOTAL });
      streakEl.textContent = "🔥 " + t("streak", { n: st.streak });
      restartTimer();
    }

    showQ();
  }

  return { id: "math", init: init, destroy: stopTimer };
})();
