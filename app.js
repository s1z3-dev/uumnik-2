/* ============================================================
   PlayLearn - app shell
   Screen router, top bar (language switch, sound, player),
   home / level select / play / rewards / profiles screens,
   completion overlay and badge toasts.
   ============================================================ */

const App = (function () {
  const AVATARS = ["🦊", "🐻", "🐰", "🐸", "🦉", "🐯", "🐨", "🦄"];
  let current = { name: "home", params: {} };
  let activeGame = null;

  /* ---------------- top bar ---------------- */
  function renderTopbar() {
    const bar = document.getElementById("topbar");
    bar.innerHTML = "";

    const brand = el("button", "brand", '<span class="brand-svg">' + charSVG("guide", 34) + "</span><span>" + t("appTitle") + "</span>");
    brand.addEventListener("click", function () { if (Progress.active()) show("home"); });
    bar.appendChild(brand);

    const right = el("div", "top-actions");

    const langs = el("div", "langbtns");
    LANGUAGES.forEach(function (L) {
      const b = el("button", "lang" + (I18N.lang() === L.code ? " active" : ""), L.flag + " " + L.label);
      b.addEventListener("click", function () { AudioFX.click(); I18N.setLang(L.code); });
      langs.appendChild(b);
    });
    right.appendChild(langs);

    const snd = el("button", "iconbtn", AudioFX.muted() ? "🔇" : "🔊");
    snd.title = t("sound");
    snd.addEventListener("click", function () {
      AudioFX.toggleMute();
      snd.textContent = AudioFX.muted() ? "🔇" : "🔊";
      AudioFX.click();
    });
    right.appendChild(snd);

    const p = Progress.active();
    if (p) {
      const chip = el("button", "profile-chip", '<span class="chip-avatar">' + escapeHtml(p.avatar) + "</span><span class='chip-name'>" + escapeHtml(p.name) + "</span>");
      chip.addEventListener("click", function () { show("profiles"); });
      right.appendChild(chip);
    }
    bar.appendChild(right);
  }

  /* ---------------- router ---------------- */
  function show(name, params) {
    if (activeGame && activeGame.destroy) { try { activeGame.destroy(); } catch (e) {} }
    activeGame = null;
    closeOverlay();

    if (!Progress.active() && name !== "profileNew") {
      name = Progress.profiles().length ? "profiles" : "profileNew";
      params = { first: !Progress.profiles().length };
    }

    current = { name: name, params: params || {} };
    renderTopbar();
    const root = document.getElementById("screen");
    root.innerHTML = "";
    screens[name](root, current.params);
    window.scrollTo(0, 0);
  }

  function rerender() { show(current.name, current.params); }

  /* ---------------- screens ---------------- */
  const screens = {

    home: function (root) {
      const hero = el("div", "hero");
      hero.appendChild(el("div", "hero-char", charSVG("guide", 110)));
      hero.appendChild(el("div", "bubble hero-bubble", escapeHtml(I18N.phrase("guide", "welcome"))));
      root.appendChild(hero);

      root.appendChild(el("h2", "screen-title", "🎲 " + t("games")));
      const grid = el("div", "game-grid");
      GAMES.forEach(function (g) {
        const stars = Progress.gameStars(g.id);
        const card = el("button", "game-card",
          '<span class="gc-icon">' + g.icon + "</span>" +
          '<span class="gc-name">' + t(g.nameKey) + "</span>" +
          '<span class="gc-desc">' + t(g.descKey) + "</span>" +
          '<span class="gc-stars">⭐ ' + stars + " / 9</span>");
        card.addEventListener("click", function () { AudioFX.click(); show("levels", { id: g.id }); });
        grid.appendChild(card);
      });
      root.appendChild(grid);

      const wide = el("div", "big-cards");
      const storyCard = el("button", "wide-card berry",
        '<span class="wc-icon">📚</span><span class="wc-body"><span class="wc-title">' + t("storyWorld") +
        '</span><span class="wc-sub">' + t("storySub") + "</span></span>");
      storyCard.addEventListener("click", function () { AudioFX.click(); show("stories"); });
      wide.appendChild(storyCard);

      const p = Progress.active();
      const rewardsCard = el("button", "wide-card sun",
        '<span class="wc-icon">🏆</span><span class="wc-body"><span class="wc-title">' + t("myRewards") +
        '</span><span class="wc-sub">⭐ ' + p.totalStars + " · 🏅 " + p.badges.length + " / " + BADGES.length + "</span></span>");
      rewardsCard.addEventListener("click", function () { AudioFX.click(); show("rewards"); });
      wide.appendChild(rewardsCard);
      root.appendChild(wide);
    },

    levels: function (root, params) {
      const g = gameById(params.id);
      if (!g) return show("home");
      root.appendChild(backRow(function () { show("home"); }));
      root.appendChild(el("h2", "screen-title", g.icon + " " + t(g.nameKey)));
      root.appendChild(el("p", "screen-sub", t("chooseLevel")));
      const list = el("div", "level-list");
      [1, 2, 3].forEach(function (lvl) {
        const best = Progress.bestStars(g.id, lvl);
        const names = [null, t("levelEasy"), t("levelMedium"), t("levelHard")];
        const card = el("button", "level-card lvl" + lvl,
          '<span class="lv-name">' + names[lvl] + "</span>" +
          starsHTML(best) +
          '<span class="lv-go">' + t("play") + " →</span>");
        card.addEventListener("click", function () { AudioFX.click(); show("play", { id: g.id, level: lvl }); });
        list.appendChild(card);
      });
      root.appendChild(list);
    },

    play: function (root, params) {
      const g = gameById(params.id);
      if (!g) return show("home");
      const level = params.level || 1;
      const head = el("div", "play-head");
      head.appendChild(backRow(function () { show("levels", { id: g.id }); }));
      const names = [null, t("levelEasy"), t("levelMedium"), t("levelHard")];
      head.appendChild(el("h2", "screen-title small", g.icon + " " + t(g.nameKey) +
        ' <span class="level-chip">' + names[level] + "</span>"));
      root.appendChild(head);

      const gameRoot = el("div", "game-root");
      root.appendChild(gameRoot);

      const ctx = {
        finish: function (stars, extra) {
          extra = extra || {};
          const res = Progress.record(g.id, level, stars, extra);
          AudioFX.win();
          completionOverlay({
            stars: stars,
            sub: extra.sub || "",
            badges: res.newBadges,
            charId: g.host,
            onReplay: function () { show("play", { id: g.id, level: level }); },
            onNext: level < 3 ? function () { show("play", { id: g.id, level: level + 1 }); } : null,
            onHome: function () { show("levels", { id: g.id }); }
          });
        },
        toast: charToast,
        badgeToast: badgeToast
      };
      activeGame = g.module;
      g.module.init(gameRoot, level, ctx);
    },

    stories: function (root) {
      root.appendChild(backRow(function () { show("home"); }));
      StoryEngine.renderList(root);
    },

    storyPlay: function (root, params) {
      root.appendChild(backRow(function () { show("stories"); }));
      StoryEngine.renderPlay(root, params.id);
    },

    rewards: function (root) {
      root.appendChild(backRow(function () { show("home"); }));
      const p = Progress.active();
      root.appendChild(el("h2", "screen-title", "🏆 " + t("myRewards")));
      const stats = el("div", "stats-row");
      stats.appendChild(el("div", "stat-card", '<span class="stat-big">⭐ ' + p.totalStars + "</span><span>" + t("totalStars") + "</span>"));
      stats.appendChild(el("div", "stat-card", '<span class="stat-big">🧩 ' + p.puzzles + "</span><span>" + t("puzzlesSolved") + "</span>"));
      stats.appendChild(el("div", "stat-card", '<span class="stat-big">🏅 ' + p.badges.length + " / " + BADGES.length + "</span><span>" + t("badgesEarned") + "</span>"));
      root.appendChild(stats);

      const grid = el("div", "badge-grid");
      BADGES.forEach(function (b) {
        const got = p.badges.indexOf(b.id) >= 0;
        grid.appendChild(el("div", "badge" + (got ? "" : " lockedb"),
          '<span class="badge-icon">' + (got ? b.icon : "🔒") + "</span>" +
          '<span class="badge-name">' + t(b.id + "_n") + "</span>" +
          '<span class="badge-desc">' + (got ? t(b.id + "_d") : t("locked") + " · " + t(b.id + "_d")) + "</span>"));
      });
      root.appendChild(grid);
    },

    profiles: function (root) {
      if (Progress.active()) root.appendChild(backRow(function () { show("home"); }));
      root.appendChild(el("h2", "screen-title", "👋 " + t("whoPlays")));
      const list = el("div", "profile-list");
      Progress.profiles().forEach(function (p) {
        const isActive = Progress.active() && Progress.active().id === p.id;
        const card = el("div", "profile-card" + (isActive ? " active" : ""));
        const main = el("button", "profile-main",
          '<span class="p-avatar">' + escapeHtml(p.avatar) + "</span>" +
          '<span class="p-name">' + escapeHtml(p.name) + "</span>" +
          '<span class="p-stars">⭐ ' + p.totalStars + "</span>");
        main.addEventListener("click", function () {
          Progress.setActive(p.id);
          AudioFX.good();
          show("home");
        });
        card.appendChild(main);
        const delBtn = el("button", "p-delete", "✕");
        delBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          confirmBox(t("deleteConfirm"), function () {
            Progress.deleteProfile(p.id);
            show(Progress.profiles().length ? "profiles" : "profileNew", { first: !Progress.profiles().length });
          });
        });
        card.appendChild(delBtn);
        list.appendChild(card);
      });
      if (Progress.profiles().length < 4) {
        const add = el("button", "profile-card add", '<span class="p-avatar">➕</span><span class="p-name">' + t("newProfile") + "</span>");
        add.addEventListener("click", function () { show("profileNew", { first: false }); });
        list.appendChild(add);
      } else {
        root.appendChild(el("p", "screen-sub", t("maxProfiles")));
      }
      root.appendChild(list);
    },

    profileNew: function (root, params) {
      root.appendChild(el("h2", "screen-title", "🌟 " + t("newProfile")));
      root.appendChild(el("p", "screen-sub", t("enterName")));
      const input = el("input", "name-input");
      input.maxLength = 14;
      input.setAttribute("autocomplete", "off");
      root.appendChild(input);

      root.appendChild(el("p", "screen-sub", t("pickAvatar")));
      let chosen = AVATARS[0];
      const av = el("div", "avatar-grid");
      AVATARS.forEach(function (a, i) {
        const b = el("button", "avatar-opt" + (i === 0 ? " picked" : ""), a);
        b.addEventListener("click", function () {
          av.querySelectorAll(".avatar-opt").forEach(function (o) { o.classList.remove("picked"); });
          b.classList.add("picked");
          chosen = a;
          AudioFX.click();
        });
        av.appendChild(b);
      });
      root.appendChild(av);

      const rowBtns = el("div", "btn-row");
      const saveBtn = el("button", "btn", t("save"));
      saveBtn.addEventListener("click", function () {
        const name = input.value.trim();
        if (!name) { input.classList.add("shake"); setTimeout(function () { input.classList.remove("shake"); }, 450); return; }
        Progress.createProfile(name, chosen);
        AudioFX.good();
        show("home");
      });
      rowBtns.appendChild(saveBtn);
      if (!params.first) {
        const cancelBtn = el("button", "btn secondary", t("cancel"));
        cancelBtn.addEventListener("click", function () { show("profiles"); });
        rowBtns.appendChild(cancelBtn);
      }
      root.appendChild(rowBtns);
      setTimeout(function () { input.focus(); }, 50);
    }
  };

  function backRow(onBack) {
    const b = el("button", "btn small secondary backbtn", "← " + t("back"));
    b.addEventListener("click", function () { AudioFX.click(); onBack(); });
    return b;
  }

  /* ---------------- overlays and toasts ---------------- */
  function overlayRoot() { return document.getElementById("overlay-root"); }
  function closeOverlay() { overlayRoot().innerHTML = ""; }

  function completionOverlay(opts) {
    const o = overlayRoot();
    o.innerHTML = "";
    const shade = el("div", "overlay");
    const modal = el("div", "modal");

    modal.appendChild(el("div", "modal-char", charSVG(opts.charId || "guide", 90)));
    modal.appendChild(el("h2", "modal-title", opts.title || t("wellDone")));
    modal.appendChild(el("p", "modal-cheer", escapeHtml(I18N.phrase(opts.charId || "guide", "success"))));
    if (opts.sub) modal.appendChild(el("p", "modal-sub", opts.sub));

    const row = el("div", "stars-row");
    for (let i = 0; i < 3; i++) {
      const s = el("span", "star" + (i < opts.stars ? " pop" : " dim"), i < opts.stars ? "⭐" : "☆");
      s.style.animationDelay = (i * 0.25) + "s";
      row.appendChild(s);
      if (i < opts.stars) setTimeout(AudioFX.star, 300 + i * 250);
    }
    modal.appendChild(row);

    if (opts.badges && opts.badges.length) {
      const bwrap = el("div", "modal-badges");
      opts.badges.forEach(function (b) {
        bwrap.appendChild(el("div", "modal-badge", b.icon + " " + t("newBadge") + " " + t(b.id + "_n")));
      });
      modal.appendChild(bwrap);
    }

    const btns = el("div", "btn-row");
    if (opts.onReplay) {
      const r = el("button", "btn secondary", "🔄 " + t("playAgain"));
      r.addEventListener("click", function () { closeOverlay(); opts.onReplay(); });
      btns.appendChild(r);
    }
    if (opts.onNext) {
      const n = el("button", "btn", t("nextLevel") + " →");
      n.addEventListener("click", function () { closeOverlay(); opts.onNext(); });
      btns.appendChild(n);
    }
    const h = el("button", "btn " + (opts.onNext ? "secondary" : ""), "🏠 " + t("home"));
    h.addEventListener("click", function () {
      closeOverlay();
      if (opts.onHome) opts.onHome(); else show("home");
    });
    btns.appendChild(h);
    modal.appendChild(btns);

    shade.appendChild(modal);
    o.appendChild(shade);
  }

  function confirmBox(text, onYes) {
    const o = overlayRoot();
    o.innerHTML = "";
    const shade = el("div", "overlay");
    const modal = el("div", "modal small");
    modal.appendChild(el("p", "modal-sub", escapeHtml(text)));
    const btns = el("div", "btn-row");
    const yes = el("button", "btn danger", t("delete"));
    yes.addEventListener("click", function () { closeOverlay(); onYes(); });
    const no = el("button", "btn secondary", t("cancel"));
    no.addEventListener("click", closeOverlay);
    btns.appendChild(yes);
    btns.appendChild(no);
    modal.appendChild(btns);
    shade.appendChild(modal);
    o.appendChild(shade);
  }

  function makeToast(html) {
    const toast = el("div", "toast", html);
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add("show"); }, 30);
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 400);
    }, 2500);
  }

  function charToast(charId, kind) {
    makeToast('<span class="toast-char">' + charSVG(charId, 44) + "</span><span>" + escapeHtml(I18N.phrase(charId, kind)) + "</span>");
  }

  function badgeToast(badges) {
    badges.forEach(function (b, i) {
      setTimeout(function () {
        makeToast('<span class="toast-badge">' + b.icon + "</span><span><strong>" + t("newBadge") + "</strong> " + t(b.id + "_n") + "</span>");
        AudioFX.star();
      }, i * 900);
    });
  }

  /* ---------------- boot ---------------- */
  function init() {
    document.documentElement.lang = I18N.lang();
    if (!Progress.active()) {
      show(Progress.profiles().length ? "profiles" : "profileNew", { first: !Progress.profiles().length });
    } else {
      show("home");
    }
  }

  return {
    show: show,
    rerender: rerender,
    completionOverlay: completionOverlay,
    badgeToast: badgeToast,
    init: init
  };
})();

window.App = App;
App.init();
