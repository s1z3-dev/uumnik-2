/* ============================================================
   PlayLearn - vocabulary data
   One block per language. Each word: { w: "WORD", e: "emoji" }.
   These lists power the crossword, word search, memory (word
   mode) and quiz games. To add puzzles, just add words here.
   ============================================================ */

const ALPHABETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  de: "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ".split(""),
  bg: "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ".split("")
};

const VOCAB = {
  en: {
    animals: [
      { w: "CAT", e: "🐱" }, { w: "DOG", e: "🐶" }, { w: "FOX", e: "🦊" },
      { w: "BEAR", e: "🐻" }, { w: "LION", e: "🦁" }, { w: "FISH", e: "🐟" },
      { w: "BIRD", e: "🐦" }, { w: "FROG", e: "🐸" }, { w: "DUCK", e: "🦆" },
      { w: "HORSE", e: "🐴" }, { w: "SHEEP", e: "🐑" }, { w: "MOUSE", e: "🐭" },
      { w: "TIGER", e: "🐯" }, { w: "RABBIT", e: "🐰" }, { w: "MONKEY", e: "🐵" }
    ],
    food: [
      { w: "APPLE", e: "🍎" }, { w: "BREAD", e: "🍞" }, { w: "CAKE", e: "🍰" },
      { w: "MILK", e: "🥛" }, { w: "EGG", e: "🥚" }, { w: "CHEESE", e: "🧀" },
      { w: "BANANA", e: "🍌" }, { w: "PIZZA", e: "🍕" }, { w: "HONEY", e: "🍯" },
      { w: "SOUP", e: "🍲" }, { w: "CARROT", e: "🥕" }, { w: "LEMON", e: "🍋" }
    ],
    colors: [
      { w: "RED", e: "🔴" }, { w: "BLUE", e: "🔵" }, { w: "GREEN", e: "🟢" },
      { w: "YELLOW", e: "🟡" }, { w: "PINK", e: "🌸" }, { w: "BLACK", e: "⚫" },
      { w: "WHITE", e: "⚪" }, { w: "ORANGE", e: "🟠" }, { w: "BROWN", e: "🟤" },
      { w: "PURPLE", e: "🟣" }
    ],
    school: [
      { w: "BOOK", e: "📖" }, { w: "PEN", e: "🖊️" }, { w: "BAG", e: "🎒" },
      { w: "RULER", e: "📏" }, { w: "CLOCK", e: "⏰" }, { w: "CHAIR", e: "🪑" },
      { w: "SCISSORS", e: "✂️" }, { w: "PENCIL", e: "✏️" }, { w: "PAPER", e: "📄" }
    ],
    nature: [
      { w: "SUN", e: "☀️" }, { w: "MOON", e: "🌙" }, { w: "STAR", e: "⭐" },
      { w: "TREE", e: "🌳" }, { w: "RAIN", e: "🌧️" }, { w: "SNOW", e: "❄️" },
      { w: "CLOUD", e: "☁️" }, { w: "FLOWER", e: "🌼" }, { w: "SEA", e: "🌊" },
      { w: "STONE", e: "🪨" }
    ]
  },

  de: {
    animals: [
      { w: "KATZE", e: "🐱" }, { w: "HUND", e: "🐶" }, { w: "FUCHS", e: "🦊" },
      { w: "BÄR", e: "🐻" }, { w: "LÖWE", e: "🦁" }, { w: "FISCH", e: "🐟" },
      { w: "VOGEL", e: "🐦" }, { w: "FROSCH", e: "🐸" }, { w: "ENTE", e: "🦆" },
      { w: "PFERD", e: "🐴" }, { w: "SCHAF", e: "🐑" }, { w: "MAUS", e: "🐭" },
      { w: "TIGER", e: "🐯" }, { w: "HASE", e: "🐰" }, { w: "AFFE", e: "🐵" }
    ],
    food: [
      { w: "APFEL", e: "🍎" }, { w: "BROT", e: "🍞" }, { w: "KUCHEN", e: "🍰" },
      { w: "MILCH", e: "🥛" }, { w: "EI", e: "🥚" }, { w: "KÄSE", e: "🧀" },
      { w: "BANANE", e: "🍌" }, { w: "PIZZA", e: "🍕" }, { w: "HONIG", e: "🍯" },
      { w: "SUPPE", e: "🍲" }, { w: "KAROTTE", e: "🥕" }, { w: "ZITRONE", e: "🍋" }
    ],
    colors: [
      { w: "ROT", e: "🔴" }, { w: "BLAU", e: "🔵" }, { w: "GRÜN", e: "🟢" },
      { w: "GELB", e: "🟡" }, { w: "ROSA", e: "🌸" }, { w: "SCHWARZ", e: "⚫" },
      { w: "WEISS", e: "⚪" }, { w: "ORANGE", e: "🟠" }, { w: "BRAUN", e: "🟤" },
      { w: "LILA", e: "🟣" }
    ],
    school: [
      { w: "BUCH", e: "📖" }, { w: "STIFT", e: "🖊️" }, { w: "TASCHE", e: "🎒" },
      { w: "LINEAL", e: "📏" }, { w: "UHR", e: "⏰" }, { w: "STUHL", e: "🪑" },
      { w: "SCHERE", e: "✂️" }, { w: "BLEISTIFT", e: "✏️" }, { w: "PAPIER", e: "📄" }
    ],
    nature: [
      { w: "SONNE", e: "☀️" }, { w: "MOND", e: "🌙" }, { w: "STERN", e: "⭐" },
      { w: "BAUM", e: "🌳" }, { w: "REGEN", e: "🌧️" }, { w: "SCHNEE", e: "❄️" },
      { w: "WOLKE", e: "☁️" }, { w: "BLUME", e: "🌼" }, { w: "MEER", e: "🌊" },
      { w: "STEIN", e: "🪨" }
    ]
  },

  bg: {
    animals: [
      { w: "КОТКА", e: "🐱" }, { w: "КУЧЕ", e: "🐶" }, { w: "ЛИСИЦА", e: "🦊" },
      { w: "МЕЧКА", e: "🐻" }, { w: "ЛЪВ", e: "🦁" }, { w: "РИБА", e: "🐟" },
      { w: "ПТИЦА", e: "🐦" }, { w: "ЖАБА", e: "🐸" }, { w: "ПАТИЦА", e: "🦆" },
      { w: "КОН", e: "🐴" }, { w: "ОВЦА", e: "🐑" }, { w: "МИШКА", e: "🐭" },
      { w: "ТИГЪР", e: "🐯" }, { w: "ЗАЕК", e: "🐰" }, { w: "МАЙМУНА", e: "🐵" }
    ],
    food: [
      { w: "ЯБЪЛКА", e: "🍎" }, { w: "ХЛЯБ", e: "🍞" }, { w: "ТОРТА", e: "🍰" },
      { w: "МЛЯКО", e: "🥛" }, { w: "ЯЙЦЕ", e: "🥚" }, { w: "СИРЕНЕ", e: "🧀" },
      { w: "БАНАН", e: "🍌" }, { w: "ПИЦА", e: "🍕" }, { w: "МЕД", e: "🍯" },
      { w: "СУПА", e: "🍲" }, { w: "МОРКОВ", e: "🥕" }, { w: "ЛИМОН", e: "🍋" }
    ],
    colors: [
      { w: "ЧЕРВЕН", e: "🔴" }, { w: "СИН", e: "🔵" }, { w: "ЗЕЛЕН", e: "🟢" },
      { w: "ЖЪЛТ", e: "🟡" }, { w: "РОЗОВ", e: "🌸" }, { w: "ЧЕРЕН", e: "⚫" },
      { w: "БЯЛ", e: "⚪" }, { w: "ОРАНЖЕВ", e: "🟠" }, { w: "КАФЯВ", e: "🟤" },
      { w: "ЛИЛАВ", e: "🟣" }
    ],
    school: [
      { w: "КНИГА", e: "📖" }, { w: "ХИМИКАЛ", e: "🖊️" }, { w: "ЧАНТА", e: "🎒" },
      { w: "ЛИНИЙКА", e: "📏" }, { w: "ЧАСОВНИК", e: "⏰" }, { w: "СТОЛ", e: "🪑" },
      { w: "НОЖИЦА", e: "✂️" }, { w: "МОЛИВ", e: "✏️" }, { w: "ХАРТИЯ", e: "📄" }
    ],
    nature: [
      { w: "СЛЪНЦЕ", e: "☀️" }, { w: "ЛУНА", e: "🌙" }, { w: "ЗВЕЗДА", e: "⭐" },
      { w: "ДЪРВО", e: "🌳" }, { w: "ДЪЖД", e: "🌧️" }, { w: "СНЯГ", e: "❄️" },
      { w: "ОБЛАК", e: "☁️" }, { w: "ЦВЕТЕ", e: "🌼" }, { w: "МОРЕ", e: "🌊" },
      { w: "КАМЪК", e: "🪨" }
    ]
  }
};

/* Category keys mapped to their translated labels */
const VOCAB_CATEGORIES = [
  { id: "animals", key: "catAnimals" },
  { id: "food", key: "catFood" },
  { id: "colors", key: "catColors" },
  { id: "school", key: "catSchool" },
  { id: "nature", key: "catNature" }
];
