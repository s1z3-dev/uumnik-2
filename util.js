/* ============================================================
   PlayLearn - tiny shared utilities
   ============================================================ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function randInt(min, max) { /* inclusive */
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* <div class="x">..</div> builder */
function el(tag, cls, html) {
  const d = document.createElement(tag);
  if (cls) d.className = cls;
  if (html !== undefined) d.innerHTML = html;
  return d;
}

/* ⭐⭐☆ row */
function starsHTML(n, max) {
  max = max || 3;
  let s = "";
  for (let i = 0; i < max; i++) s += '<span class="st ' + (i < n ? "on" : "off") + '">' + (i < n ? "⭐" : "☆") + "</span>";
  return '<span class="stars-inline">' + s + "</span>";
}
