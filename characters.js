/* ============================================================
   PlayLearn - characters
   RENAME A CHARACTER: change its "name" below. Nothing else.
   The whole app (menus, phrases, stories) refers to characters
   only by their id (guide / math / words / explorer).
   ============================================================ */

const CHARACTERS = {
  guide:    { name: "Poko", color: "#F5A742", role: "guide" },     /* wise little fox, welcomes and helps */
  math:     { name: "Zumi", color: "#4D96FF", role: "math" },      /* cheerful robot, loves numbers */
  words:    { name: "Lala", color: "#C77DFF", role: "words" },     /* chatty parrot, loves letters */
  explorer: { name: "Bobo", color: "#6BCB77", role: "explorer" }   /* brave bear, stars in the stories */
};

/* Simple, friendly inline SVG avatars (no external images). */
function charSVG(id, size) {
  size = size || 96;
  const c = CHARACTERS[id] || CHARACTERS.guide;
  const col = c.color;
  let body = "";
  if (id === "guide") { /* fox */
    body =
      '<polygon points="18,34 30,10 42,32" fill="' + col + '"/>' +
      '<polygon points="82,34 70,10 58,32" fill="' + col + '"/>' +
      '<polygon points="22,32 30,16 38,31" fill="#FFE3BF"/>' +
      '<polygon points="78,32 70,16 62,31" fill="#FFE3BF"/>' +
      '<circle cx="50" cy="55" r="34" fill="' + col + '"/>' +
      '<ellipse cx="50" cy="66" rx="20" ry="16" fill="#FFF3E2"/>' +
      '<circle cx="38" cy="50" r="5.5" fill="#2E3A59"/>' +
      '<circle cx="62" cy="50" r="5.5" fill="#2E3A59"/>' +
      '<circle cx="40" cy="48" r="1.8" fill="#fff"/>' +
      '<circle cx="64" cy="48" r="1.8" fill="#fff"/>' +
      '<ellipse cx="50" cy="62" rx="4.5" ry="3.5" fill="#2E3A59"/>' +
      '<path d="M42 70 Q50 78 58 70" stroke="#2E3A59" stroke-width="3" fill="none" stroke-linecap="round"/>';
  } else if (id === "math") { /* robot */
    body =
      '<line x1="50" y1="8" x2="50" y2="20" stroke="#9AA7C7" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="50" cy="8" r="5" fill="#FFC94D"/>' +
      '<rect x="16" y="20" width="68" height="60" rx="18" fill="' + col + '"/>' +
      '<rect x="26" y="32" width="48" height="26" rx="12" fill="#EAF2FF"/>' +
      '<circle cx="40" cy="45" r="6" fill="#2E3A59"/>' +
      '<circle cx="60" cy="45" r="6" fill="#2E3A59"/>' +
      '<circle cx="42" cy="43" r="2" fill="#fff"/>' +
      '<circle cx="62" cy="43" r="2" fill="#fff"/>' +
      '<path d="M38 66 Q50 74 62 66" stroke="#EAF2FF" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="22" cy="50" r="4" fill="#FFC94D"/>' +
      '<circle cx="78" cy="50" r="4" fill="#FFC94D"/>';
  } else if (id === "words") { /* parrot */
    body =
      '<path d="M50 6 Q60 14 52 22 Q46 14 50 6" fill="#FF6B6B"/>' +
      '<path d="M42 8 Q50 16 44 24 Q38 15 42 8" fill="#FFC94D"/>' +
      '<circle cx="50" cy="55" r="34" fill="' + col + '"/>' +
      '<circle cx="38" cy="48" r="10" fill="#fff"/>' +
      '<circle cx="62" cy="48" r="10" fill="#fff"/>' +
      '<circle cx="39" cy="49" r="4.5" fill="#2E3A59"/>' +
      '<circle cx="61" cy="49" r="4.5" fill="#2E3A59"/>' +
      '<path d="M43 63 Q50 58 57 63 L50 74 Z" fill="#FFC94D"/>' +
      '<path d="M43 63 Q50 68 57 63" stroke="#E8A23D" stroke-width="2" fill="none"/>';
  } else { /* explorer bear */
    body =
      '<circle cx="26" cy="26" r="12" fill="' + col + '"/>' +
      '<circle cx="74" cy="26" r="12" fill="' + col + '"/>' +
      '<circle cx="26" cy="26" r="6" fill="#EAF7EC"/>' +
      '<circle cx="74" cy="26" r="6" fill="#EAF7EC"/>' +
      '<circle cx="50" cy="54" r="33" fill="' + col + '"/>' +
      '<ellipse cx="50" cy="64" rx="17" ry="13" fill="#EAF7EC"/>' +
      '<circle cx="39" cy="48" r="5" fill="#2E3A59"/>' +
      '<circle cx="61" cy="48" r="5" fill="#2E3A59"/>' +
      '<circle cx="41" cy="46" r="1.7" fill="#fff"/>' +
      '<circle cx="63" cy="46" r="1.7" fill="#fff"/>' +
      '<ellipse cx="50" cy="60" rx="5" ry="4" fill="#2E3A59"/>' +
      '<path d="M44 68 Q50 73 56 68" stroke="#2E3A59" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M28 80 Q50 92 72 80 L72 88 Q50 98 28 88 Z" fill="#FF6B6B"/>';
  }
  return '<svg viewBox="0 0 100 100" width="' + size + '" height="' + size + '" role="img" aria-label="' + c.name + '">' + body + '</svg>';
}
