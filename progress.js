/* ============================================================
   PlayLearn - progress, profiles and badges
   Per-player progress is stored per profile (up to 4 profiles,
   nice for siblings). All badge rules live in the BADGES array.
   To add a badge: add an entry here plus b_xxx_n / b_xxx_d
   strings in translations.js.
   ============================================================ */

const BADGES = [
  { id: "b_first",       icon: "🎉", cond: function (p) { return p.puzzles >= 1; } },
  { id: "b_allgames",    icon: "🎮", cond: function (p) {
      if (typeof GAMES === "undefined") return false;
      return GAMES.every(function (g) { return p.playedGames.indexOf(g.id) >= 0; });
    } },
  { id: "b_math10",      icon: "➕", cond: function (p) { return p.mathBestStreak >= 10; } },
  { id: "b_quizperfect", icon: "🧠", cond: function (p) { return !!p.flags.quizPerfect; } },
  { id: "b_sudokuhard",  icon: "🔢", cond: function (p) { return !!p.flags.sudokuHard; } },
  { id: "b_wordmaster",  icon: "🔤", cond: function (p) {
      return (p.counts.crossword || 0) + (p.counts.wordsearch || 0) >= 5;
    } },
  { id: "b_story1",      icon: "📖", cond: function (p) { return p.stories.length >= 1; } },
  { id: "b_storyall",    icon: "🌟", cond: function (p) { return p.stories.length >= STORIES.length; } },
  { id: "b_stars25",     icon: "⭐", cond: function (p) { return p.totalStars >= 25; } },
  { id: "b_stars100",    icon: "🌠", cond: function (p) { return p.totalStars >= 100; } },
  { id: "b_polyglot",    icon: "🌍", cond: function (p) { return p.playedLangs.length >= 3; } }
];

const Progress = (function () {

  function blankProfile(name, avatar) {
    return {
      name: name, avatar: avatar || "🦊",
      stars: {},          /* stars[gameId][level] = best stars */
      counts: {},         /* completions per game */
      totalStars: 0,      /* cumulative stars ever earned */
      puzzles: 0,
      playedGames: [],
      playedLangs: [],
      stories: [],
      badges: [],
      mathBestStreak: 0,
      flags: {}
    };
  }

  function fix(p) { /* upgrade older saves safely */
    const b = blankProfile("x");
    Object.keys(b).forEach(function (k) { if (p[k] === undefined) p[k] = b[k]; });
    return p;
  }

  function profiles() {
    const st = Storage.state;
    return Object.keys(st.profiles).map(function (id) {
      const p = fix(st.profiles[id]); p.id = id; return p;
    });
  }

  function active() {
    const st = Storage.state;
    const id = st.activeProfile;
    if (id && st.profiles[id]) { const p = fix(st.profiles[id]); p.id = id; return p; }
    return null;
  }

  function createProfile(name, avatar) {
    const st = Storage.state;
    if (Object.keys(st.profiles).length >= 4) return null;
    const id = "p" + Date.now() + Math.floor(Math.random() * 999);
    st.profiles[id] = blankProfile(name, avatar);
    st.activeProfile = id;
    Storage.save();
    return id;
  }

  function deleteProfile(id) {
    const st = Storage.state;
    delete st.profiles[id];
    if (st.activeProfile === id) st.activeProfile = Object.keys(st.profiles)[0] || null;
    Storage.save();
  }

  function setActive(id) {
    Storage.state.activeProfile = id;
    Storage.save();
  }

  function checkBadges(p) {
    const won = [];
    BADGES.forEach(function (b) {
      if (p.badges.indexOf(b.id) < 0 && b.cond(p)) {
        p.badges.push(b.id);
        won.push(b);
      }
    });
    return won;
  }

  /* Called by every game when a puzzle/round is completed. */
  function record(gameId, level, stars, extra) {
    const p = active();
    if (!p) return { newBadges: [] };
    extra = extra || {};
    if (!p.stars[gameId]) p.stars[gameId] = {};
    p.stars[gameId][level] = Math.max(p.stars[gameId][level] || 0, stars);
    p.counts[gameId] = (p.counts[gameId] || 0) + 1;
    p.totalStars += stars;
    p.puzzles += 1;
    if (p.playedGames.indexOf(gameId) < 0) p.playedGames.push(gameId);
    if (p.playedLangs.indexOf(I18N.lang()) < 0) p.playedLangs.push(I18N.lang());
    if (extra.perfect && gameId === "quiz") p.flags.quizPerfect = true;
    if (gameId === "sudoku" && level === 3) p.flags.sudokuHard = true;
    const won = checkBadges(p);
    Storage.save();
    return { newBadges: won };
  }

  function updateMathStreak(streak) {
    const p = active();
    if (!p) return { newBadges: [] };
    if (streak > p.mathBestStreak) p.mathBestStreak = streak;
    const won = checkBadges(p);
    Storage.save();
    return { newBadges: won };
  }

  function recordStory(storyId) {
    const p = active();
    if (!p) return { newBadges: [], stars: 0 };
    if (p.stories.indexOf(storyId) < 0) p.stories.push(storyId);
    p.totalStars += 3;
    if (p.playedLangs.indexOf(I18N.lang()) < 0) p.playedLangs.push(I18N.lang());
    const won = checkBadges(p);
    Storage.save();
    return { newBadges: won, stars: 3 };
  }

  function bestStars(gameId, level) {
    const p = active();
    return (p && p.stars[gameId] && p.stars[gameId][level]) || 0;
  }

  function gameStars(gameId) {
    const p = active();
    if (!p || !p.stars[gameId]) return 0;
    let s = 0;
    Object.keys(p.stars[gameId]).forEach(function (l) { s += p.stars[gameId][l]; });
    return s;
  }

  return {
    profiles: profiles, active: active, createProfile: createProfile,
    deleteProfile: deleteProfile, setActive: setActive,
    record: record, recordStory: recordStory, updateMathStreak: updateMathStreak,
    bestStars: bestStars, gameStars: gameStars
  };
})();

window.Progress = Progress;
