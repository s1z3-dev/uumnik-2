/* ============================================================
   PlayLearn - safe storage
   Wraps localStorage. If storage is blocked (private mode,
   sandboxed preview, etc.) the app keeps working in memory,
   it just will not remember progress after a reload.
   ============================================================ */

const Storage = (function () {
  const KEY = "playlearn_v1";
  let mem = null;

  function load() {
    if (mem) return mem;
    try {
      mem = JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      mem = {};
    }
    if (!mem.profiles) mem.profiles = {};
    return mem;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(mem));
    } catch (e) { /* in-memory only - fine */ }
  }

  return {
    get state() { return load(); },
    save: save
  };
})();
