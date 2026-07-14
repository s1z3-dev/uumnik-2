/* ============================================================
   PlayLearn - story engine
   Plays any story from STORIES (stories.js). Scenes, choices
   and challenges are pure data, so new stories need no code.
   ============================================================ */

const StoryEngine = (function () {

  function storyFinished(id) {
    const p = Progress.active();
    return !!(p && p.stories.indexOf(id) >= 0);
  }

  /* ---------- story list screen ---------- */
  function renderList(root) {
    root.appendChild(el("h2", "screen-title", "📚 " + t("storyWorld")));
    root.appendChild(el("p", "screen-sub", t("chooseStory")));
    const listEl = el("div", "story-list");
    STORIES.forEach(function (s) {
      const done = storyFinished(s.id);
      const card = el("button", "wide-card story-card" + (done ? " done" : ""),
        '<span class="wc-icon">' + s.icon + "</span>" +
        '<span class="wc-body"><span class="wc-title">' + escapeHtml(I18N.pick(s.title)) + "</span>" +
        '<span class="wc-sub">' + (done ? "✅ " + t("finished") : t("play") + " →") + "</span></span>");
      card.addEventListener("click", function () {
        AudioFX.click();
        App.show("storyPlay", { id: s.id });
      });
      listEl.appendChild(card);
    });
    root.appendChild(listEl);
  }

  /* ---------- scene player ---------- */
  function renderPlay(root, storyId) {
    const story = STORIES.filter(function (s) { return s.id === storyId; })[0];
    if (!story) { App.show("stories"); return; }
    const st = { sceneId: story.start, steps: 0 };

    const wrap = el("div", "story-wrap");
    root.appendChild(wrap);

    function go(id) {
      st.sceneId = id;
      st.steps++;
      render();
    }

    function failLine(charId) {
      const line = wrap.querySelector(".story-hintline");
      if (line) line.textContent = I18N.phrase(charId, "fail");
    }

    function render() {
      const scene = story.scenes[st.sceneId];
      wrap.innerHTML = "";

      /* progress dots */
      let dots = "";
      for (let i = 0; i <= st.steps; i++) dots += '<span class="dot on"></span>';
      wrap.appendChild(el("div", "story-progress", dots));

      wrap.appendChild(el("div", "story-art", escapeHtml(scene.art)));

      const row = el("div", "story-row");
      const avatar = el("div", "story-char", charSVG(scene.char || "guide", 64));
      const bubble = el("div", "story-text bubble", escapeHtml(I18N.pick(scene.text)));
      row.appendChild(avatar);
      row.appendChild(bubble);
      wrap.appendChild(row);

      const action = el("div", "story-action");
      wrap.appendChild(action);

      if (scene.end) {
        action.appendChild(el("div", "story-end", "🌟 " + t("theEnd") + " 🌟"));
        const btn = el("button", "btn", t("continue_"));
        btn.addEventListener("click", finishStory);
        action.appendChild(btn);
      } else if (scene.choices) {
        scene.choices.forEach(function (ch) {
          const b = el("button", "btn choice", ch.icon + " " + escapeHtml(I18N.pick(ch.text)));
          b.addEventListener("click", function () { AudioFX.click(); go(ch.next); });
          action.appendChild(b);
        });
      } else if (scene.challenge) {
        renderChallenge(action, scene);
      } else {
        const b = el("button", "btn", t("continue_") + " →");
        b.addEventListener("click", function () { AudioFX.click(); go(scene.next); });
        action.appendChild(b);
      }
    }

    /* ---------- challenges ---------- */
    function renderChallenge(action, scene) {
      const ch = scene.challenge;
      const charId = scene.char || "guide";

      function optionButtons(labels, correctIdx, kind) {
        const row = el("div", "story-opts");
        labels.forEach(function (lab, i) {
          const b = el("button", "opt " + kind, escapeHtml(String(lab)));
          b.addEventListener("click", function () {
            if (i === correctIdx) {
              b.classList.add("correct");
              AudioFX.good();
              setTimeout(function () { go(ch.next); }, 550);
            } else {
              b.classList.add("wrong");
              b.disabled = true;
              AudioFX.bad();
              failLine(charId);
            }
          });
          row.appendChild(b);
        });
        action.appendChild(row);
        action.appendChild(el("p", "story-hintline", ""));
      }

      if (ch.type === "math") {
        const ans = ch.op === "+" ? ch.a + ch.b : ch.a - ch.b;
        action.appendChild(el("div", "story-challenge-q", ch.a + " " + (ch.op === "+" ? "+" : "−") + " " + ch.b + " = ?"));
        let opts = [ans, ans + 1, ans > 1 ? ans - 1 : ans + 2];
        opts = shuffle(opts);
        optionButtons(opts, opts.indexOf(ans), "num");

      } else if (ch.type === "count") {
        action.appendChild(el("div", "story-count", escapeHtml(ch.emoji.repeat(ch.n))));
        let opts = shuffle([ch.n - 1, ch.n, ch.n + 1]);
        optionButtons(opts, opts.indexOf(ch.n), "num");

      } else if (ch.type === "pick") {
        optionButtons(ch.opts, ch.correct, "emoji");

      } else if (ch.type === "unscramble") {
        const word = ch.word[I18N.lang()] || ch.word.en;
        action.appendChild(el("div", "story-challenge-q", ch.emoji + " " + t("unscrambleTap")));
        const slots = el("div", "slots", "");
        const tilesRow = el("div", "tiles", "");
        action.appendChild(slots);
        action.appendChild(tilesRow);
        action.appendChild(el("p", "story-hintline", ""));

        let letters = shuffle(word.split(""));
        if (letters.join("") === word && word.length > 1) letters = letters.reverse();
        let built = "";

        function paintSlots() {
          slots.innerHTML = "";
          for (let i = 0; i < word.length; i++) {
            slots.appendChild(el("span", "slot" + (built[i] ? " filled" : ""), built[i] || ""));
          }
        }

        function reset() {
          built = "";
          tilesRow.querySelectorAll(".tile").forEach(function (tl) { tl.classList.remove("used"); });
          paintSlots();
        }

        letters.forEach(function (letter) {
          const tile = el("button", "tile", letter);
          tile.addEventListener("click", function () {
            if (tile.classList.contains("used") || built.length >= word.length) return;
            tile.classList.add("used");
            built += letter;
            AudioFX.click();
            paintSlots();
            if (built.length === word.length) {
              if (built === word) {
                AudioFX.good();
                setTimeout(function () { go(ch.next); }, 600);
              } else {
                AudioFX.bad();
                failLine(charId);
                setTimeout(reset, 700);
              }
            }
          });
          tilesRow.appendChild(tile);
        });

        const undo = el("button", "tile undo", "⌫");
        undo.addEventListener("click", function () {
          if (!built.length) return;
          const last = built[built.length - 1];
          built = built.slice(0, -1);
          const used = tilesRow.querySelectorAll(".tile.used");
          for (let i = used.length - 1; i >= 0; i--) {
            if (used[i].textContent === last) { used[i].classList.remove("used"); break; }
          }
          paintSlots();
        });
        tilesRow.appendChild(undo);
        paintSlots();
      }
    }

    function finishStory() {
      const res = Progress.recordStory(story.id);
      AudioFX.win();
      App.completionOverlay({
        title: t("storyComplete"),
        sub: escapeHtml(I18N.pick(story.title)),
        stars: res.stars,
        badges: res.newBadges,
        charId: "explorer",
        onReplay: function () { App.show("storyPlay", { id: story.id }); },
        onHome: function () { App.show("stories"); }
      });
    }

    render();
  }

  return { renderList: renderList, renderPlay: renderPlay };
})();
