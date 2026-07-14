# PlayLearn 🦊

A learning-games app for kids that runs entirely in the browser. No server, no build step, no accounts - just open it and play.

## Features

- **6 games, 3 difficulty levels each**
  - 🔠 Crossword - picture clues, generated fresh every round
  - 🔢 Sudoku - 4x4 with animal symbols, 6x6 and 9x9 with numbers, always a unique solution
  - ➕ Math Trainer - counting with pictures up to word problems, streaks and an optional timer
  - 🎴 Memory - emoji pairs, and word-to-picture pairs on hard for reading practice
  - 🔍 Word Search - per-language letter grids, diagonals on hard
  - ❓ Quiz - picture, word, counting and odd-one-out questions
- **📚 Story World** - interactive stories with branching choices and mini challenges
- **3 languages** - English, German, Bulgarian. One tap switches everything: menus, games, stories
- **Progress and rewards** - stars per level, 11 badges, up to 4 player profiles (great for siblings)
- **4 friendly characters** - renameable in one line (see below)
- **Kid-friendly** - big touch targets, gentle feedback, generated sounds with a mute switch, works offline once loaded

## Run it locally

Just open `index.html` in any modern browser (double-click it). Everything works from the file system - no server needed.

## Deploy on GitHub Pages (free hosting)

1. Create a new repository on GitHub (for example `playlearn`)
2. Upload all files and folders from this project to the repository root
3. In the repository go to **Settings > Pages**
4. Under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then Save
5. After a minute your app is live at `https://YOURNAME.github.io/playlearn/`

Progress is stored in the browser (localStorage), separately per device.

## Project structure

```
index.html              entry point, loads all scripts
css/styles.css          the whole look and feel
js/
  data/
    translations.js     every UI string in en / de / bg
    vocab.js            word lists per language (with emoji)
    stories.js          the interactive stories
  characters.js         character names, colors, SVG avatars
  storage.js            safe localStorage wrapper
  audio.js              Web Audio sound effects + mute
  i18n.js               translation engine
  progress.js           profiles, stars, badge rules
  util.js               small shared helpers
  games/
    crossword.js  sudoku.js  math.js
    memory.js  wordsearch.js  quiz.js
    registry.js         the list that drives the whole UI
  story/story.js        story engine (plays any story data)
js/app.js               app shell, screens, overlays
```

## How to rename a character

Open `js/characters.js` and change one line:

```js
guide: { name: "Poko", ... }   ->   guide: { name: "Luna", ... }
```

The new name appears everywhere automatically: greetings, cheers, math word problems and all stories in all languages.

## How to add a new game (5 steps)

1. Create `js/games/mygame.js` exporting a global object:
   ```js
   const MyGame = {
     id: "mygame",
     init: function (root, level, ctx) {
       // build your UI inside root (a DOM element)
       // level is 1, 2 or 3
       // call ctx.finish(stars) when the player wins (stars: 1-3)
     },
     destroy: function () { /* clear timers / listeners */ }
   };
   ```
2. Add a script tag for it in `index.html` (before `registry.js`)
3. Add one entry to the `GAMES` array in `js/games/registry.js`
4. Add its name and description to `js/data/translations.js` in every language: `g_mygame_n` and `g_mygame_d`
5. Done. It appears on the home screen with level select, stars and progress tracking - no other changes needed.

## How to add more words / puzzles

Open `js/data/vocab.js` and add entries like `{ w: "WHALE", e: "🐋" }` to any category, in each language block. The crossword, word search, memory and quiz all pick from these lists, so new words mean new puzzles instantly. Keep words in UPPERCASE.

## How to add a story

Open `js/data/stories.js` and copy the shape of an existing story. Scenes are plain data:

- `next: "s2"` continues to another scene
- `choices: [...]` creates a branch
- `challenge: {...}` inserts a mini task (`math`, `count`, `unscramble` or `pick`)
- `end: true` finishes the story (the player earns stars and possibly badges)

Give every text as `{ en: "...", de: "...", bg: "..." }`. Use `{guide}`, `{math}`, `{words}`, `{explorer}` in texts to insert character names. No engine changes needed.

## How to add a language

1. In `js/data/translations.js`: copy the whole `en:` block, translate the values, add the language code to the `LANGUAGES` array at the bottom
2. In `js/data/vocab.js`: add a matching word-list block and an alphabet in `ALPHABETS`
3. In `js/data/stories.js`: add the new language key to every `text`, `title` and choice/challenge text

The switcher button appears automatically.

## Badges

All badge rules live in the `BADGES` array in `js/progress.js`. To add one, add an entry there plus `b_xxx_n` / `b_xxx_d` strings in the translations.

## Tech notes

- Plain HTML, CSS and vanilla JavaScript. No frameworks, no dependencies, no build step
- All puzzle data lives in `.js` files (not JSON) so the app also works when opened directly from the file system
- Sounds are generated with the Web Audio API (no audio files)
- Avatars are inline SVG (no image files)
- If localStorage is blocked, the app still runs; it just cannot remember progress after a reload
