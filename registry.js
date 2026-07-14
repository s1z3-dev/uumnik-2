/* ============================================================
   PlayLearn - game registry
   The home screen, level select and progress views are all
   generated from this list. TO ADD A GAME:
     1. create js/games/mygame.js defining an object with
        { id, init(root, level, ctx), destroy() }
     2. add a <script> tag for it in index.html (before this file)
     3. add one entry below
     4. add g_mygame_n / g_mygame_d strings in translations.js
   Done - it appears everywhere automatically.
   ============================================================ */

const GAMES = [
  { id: "crossword",  icon: "🔠", nameKey: "g_crossword_n",  descKey: "g_crossword_d",  host: "words",    module: CrosswordGame },
  { id: "sudoku",     icon: "🔢", nameKey: "g_sudoku_n",     descKey: "g_sudoku_d",     host: "math",     module: SudokuGame },
  { id: "math",       icon: "➕", nameKey: "g_math_n",       descKey: "g_math_d",       host: "math",     module: MathGame },
  { id: "memory",     icon: "🎴", nameKey: "g_memory_n",     descKey: "g_memory_d",     host: "guide",    module: MemoryGame },
  { id: "wordsearch", icon: "🔍", nameKey: "g_wordsearch_n", descKey: "g_wordsearch_d", host: "words",    module: WordsearchGame },
  { id: "quiz",       icon: "❓", nameKey: "g_quiz_n",       descKey: "g_quiz_d",       host: "guide",    module: QuizGame }
];

function gameById(id) {
  for (let i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
  return null;
}
