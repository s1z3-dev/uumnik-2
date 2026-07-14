/* ============================================================
   PlayLearn - i18n engine
   t("key")            -> translated string for the active language
   t("key", {n: 3})    -> with {n} placeholders filled in
   I18N.names(str)     -> fills {guide} {math} {words} {explorer}
                          with character names and {name} with the
                          active player's name
   I18N.phrase(id, k)  -> random character phrase ("success" etc.)
   ============================================================ */

const I18N = (function () {

  function lang() {
    const l = Storage.state.lang;
    return TRANSLATIONS[l] ? l : "en";
  }

  function setLang(l) {
    if (!TRANSLATIONS[l]) return;
    Storage.state.lang = l;
    Storage.save();
    document.documentElement.lang = l;
    if (window.App) App.rerender();
  }

  function names(s) {
    if (typeof s !== "string") return s;
    Object.keys(CHARACTERS).forEach(function (id) {
      s = s.split("{" + id + "}").join(CHARACTERS[id].name);
    });
    const p = (window.Progress && Progress.active()) || null;
    s = s.split("{name}").join(p ? p.name : t("guest"));
    return s;
  }

  function t(key, vars) {
    const dict = TRANSLATIONS[lang()];
    let s = dict[key];
    if (s === undefined) s = TRANSLATIONS.en[key];
    if (s === undefined) s = key;
    if (typeof s !== "string") return s;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return names(s);
  }

  function phrase(charId, kind) {
    const dict = TRANSLATIONS[lang()].phrases || TRANSLATIONS.en.phrases;
    const set = dict[charId] || {};
    const arr = set[kind] || (TRANSLATIONS.en.phrases[charId] || {})[kind] || [];
    if (!arr.length) return "";
    return names(arr[Math.floor(Math.random() * arr.length)]);
  }

  /* text objects like {en:"..", de:"..", bg:".."} used by stories */
  function pick(obj) {
    if (!obj) return "";
    return names(obj[lang()] !== undefined ? obj[lang()] : obj.en);
  }

  return { t: t, lang: lang, setLang: setLang, phrase: phrase, names: names, pick: pick };
})();

/* Global shorthand used everywhere */
function t(key, vars) { return I18N.t(key, vars); }
