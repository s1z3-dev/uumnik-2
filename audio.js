/* ============================================================
   PlayLearn - sounds
   All sounds are generated with the Web Audio API, so the app
   needs no audio files and works fully offline.
   ============================================================ */

const AudioFX = (function () {
  let ctx = null;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function muted() { return !!Storage.state.muted; }

  function toggleMute() {
    Storage.state.muted = !Storage.state.muted;
    Storage.save();
    return muted();
  }

  /* One short tone. freq in Hz, dur in seconds. */
  function tone(freq, dur, type, when, vol) {
    const a = ac();
    if (!a || muted()) return;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  return {
    toggleMute: toggleMute,
    muted: muted,
    click: function () { tone(600, 0.08, "triangle"); },
    flip:  function () { tone(420, 0.09, "sine"); },
    good:  function () { tone(660, 0.12, "triangle"); tone(880, 0.14, "triangle", 0.09); },
    bad:   function () { tone(220, 0.18, "sine"); tone(180, 0.2, "sine", 0.1); },
    star:  function () { tone(880, 0.1, "triangle"); tone(1175, 0.12, "triangle", 0.08); tone(1568, 0.16, "triangle", 0.16); },
    win:   function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.16, "triangle", i * 0.12, 0.16); });
    }
  };
})();
