/* ============================================================
   PlayLearn - story data
   Each story: { id, icon, title:{en,de,bg}, start, scenes:{...} }
   Each scene: {
     art: emoji scene, text: {en,de,bg}, char: character id,
     and EXACTLY ONE of:
       next: "sceneId"                       simple continue
       choices: [{icon, text:{..}, next}]    branching choice
       challenge: {type, ..., next}          mini task to pass
       end: true                             final scene
   }
   Challenge types:
     math       { type:"math", a, b, op:"+"|"-" }
     count      { type:"count", emoji, n }
     unscramble { type:"unscramble", word:{en,de,bg}, emoji }
     pick       { type:"pick", q:{en,de,bg}, opts:[emoji,..], correct }
   Character names are inserted with {guide} {math} {words} {explorer}.
   Adding a new story requires NO engine changes - just add it here.
   ============================================================ */

const STORIES = [
  {
    id: "lost_star",
    icon: "⭐",
    title: { en: "The Lost Star", de: "Der verlorene Stern", bg: "Изгубената звезда" },
    start: "s1",
    scenes: {
      s1: {
        art: "🌙✨🌲", char: "explorer",
        text: {
          en: "One quiet night, {explorer} sees a little star tumble from the sky and land in Whisper Woods. \"I must help it!\" says {explorer}.",
          de: "In einer stillen Nacht sieht {explorer}, wie ein kleiner Stern vom Himmel purzelt und im Flüsterwald landet. \"Ich muss ihm helfen!\", sagt {explorer}.",
          bg: "В една тиха нощ {explorer} вижда как малка звезда пада от небето и се приземява в Шепнещата гора. \"Трябва да ѝ помогна!\", казва {explorer}."
        },
        next: "s2"
      },
      s2: {
        art: "🌲🛤️🏞️", char: "explorer",
        text: {
          en: "At the edge of the woods the path splits in two. Which way should {explorer} go?",
          de: "Am Waldrand teilt sich der Weg. Wohin soll {explorer} gehen?",
          bg: "В края на гората пътят се разделя на две. Накъде да тръгне {explorer}?"
        },
        choices: [
          { icon: "🌲", text: { en: "Through the dark trees", de: "Durch die dunklen Bäume", bg: "През тъмните дървета" }, next: "s3f" },
          { icon: "🏞️", text: { en: "Along the sparkling river", de: "Am glitzernden Fluss entlang", bg: "Покрай блестящата река" }, next: "s3r" }
        ]
      },
      s3f: {
        art: "🦉🌲🔤", char: "words",
        text: {
          en: "An old owl blocks the way. \"Only word wizards may pass,\" she hoots. \"Put my mixed-up letters in order!\"",
          de: "Eine alte Eule versperrt den Weg. \"Nur Wortzauberer dürfen passieren\", ruft sie. \"Bringe meine Buchstaben in Ordnung!\"",
          bg: "Стара сова препречва пътя. \"Само магьосници на думите минават\", казва тя. \"Подреди разбърканите ми букви!\""
        },
        challenge: { type: "unscramble", word: { en: "TREE", de: "BAUM", bg: "ДЪРВО" }, emoji: "🌳", next: "s4" }
      },
      s3r: {
        art: "🏞️🪨🧚", char: "math",
        text: {
          en: "Shiny stepping stones cross the river, but the water sprite asks: \"How many stones will you hop on? Count 4 and then 3 more!\"",
          de: "Glänzende Trittsteine führen über den Fluss, doch der Wassergeist fragt: \"Wie viele Steine springst du? Zähle 4 und dann noch 3!\"",
          bg: "Лъскави камъни пресичат реката, но водният дух пита: \"По колко камъка ще скочиш? Преброй 4 и още 3!\""
        },
        challenge: { type: "math", a: 4, b: 3, op: "+", next: "s4" }
      },
      s4: {
        art: "✨✨🧭", char: "explorer",
        text: {
          en: "Deep in the woods, hundreds of fireflies form a glowing arrow. \"Follow us!\" they hum. {explorer} tiptoes after their light.",
          de: "Tief im Wald bilden hunderte Glühwürmchen einen leuchtenden Pfeil. \"Folge uns!\", summen sie. {explorer} schleicht ihrem Licht hinterher.",
          bg: "Дълбоко в гората стотици светулки образуват светеща стрелка. \"Следвай ни!\", жужат те. {explorer} тръгва на пръсти след светлината им."
        },
        next: "s5"
      },
      s5: {
        art: "🦔🌉❓", char: "explorer",
        text: {
          en: "A sleepy hedgehog guards a tiny bridge. \"Answer this and you may cross: what shines in the sky at night?\"",
          de: "Ein schläfriger Igel bewacht eine kleine Brücke. \"Beantworte dies und du darfst hinüber: Was leuchtet nachts am Himmel?\"",
          bg: "Сънлив таралеж пази малко мостче. \"Отговори и ще минеш: какво свети на небето нощем?\""
        },
        challenge: {
          type: "pick",
          q: { en: "What shines in the sky at night?", de: "Was leuchtet nachts am Himmel?", bg: "Какво свети на небето нощем?" },
          opts: ["☀️", "🌙", "🌷"], correct: 1, next: "s6"
        }
      },
      s6: {
        art: "⭐😢🌿", char: "explorer",
        text: {
          en: "Behind a berry bush {explorer} finds the little star, sniffling. \"I slipped off the Milky Way and I cannot get home,\" it whispers.",
          de: "Hinter einem Beerenbusch findet {explorer} den kleinen Stern, der schnieft. \"Ich bin von der Milchstraße gerutscht und finde nicht nach Hause\", flüstert er.",
          bg: "Зад един храст с боровинки {explorer} намира малката звезда, която подсмърча. \"Подхлъзнах се от Млечния път и не мога да се прибера\", прошепва тя."
        },
        next: "s7"
      },
      s7: {
        art: "🤔💭⭐", char: "explorer",
        text: {
          en: "How can we get you back up there? {explorer} thinks hard.",
          de: "Wie kommst du wieder nach oben? {explorer} denkt scharf nach.",
          bg: "Как да те върнем горе? {explorer} мисли усилено."
        },
        choices: [
          { icon: "🌙", text: { en: "Ask the Moon for help", de: "Den Mond um Hilfe bitten", bg: "Да помолим Луната за помощ" }, next: "s8a" },
          { icon: "⛰️", text: { en: "Climb the highest hill", de: "Auf den höchsten Hügel klettern", bg: "Да изкачим най-високия хълм" }, next: "s8b" }
        ]
      },
      s8a: {
        art: "🌙🛝✨", char: "explorer",
        text: {
          en: "The kind Moon leans down and rolls out a silver moonbeam like a slide. \"Hop on, little one!\"",
          de: "Der freundliche Mond beugt sich herab und rollt einen silbernen Mondstrahl aus wie eine Rutsche. \"Spring auf, Kleiner!\"",
          bg: "Добрата Луна се навежда и спуска сребърен лунен лъч като пързалка. \"Качвай се, мъничко!\""
        },
        next: "s9"
      },
      s8b: {
        art: "⛰️🍃⭐", char: "explorer",
        text: {
          en: "From the top of Windy Hill, a warm night breeze scoops the star up like a leaf and carries it higher and higher.",
          de: "Auf dem Windigen Hügel hebt eine warme Nachtbrise den Stern wie ein Blatt empor und trägt ihn höher und höher.",
          bg: "От върха на Ветровития хълм топъл нощен полъх повдига звездата като листо и я носи все по-нагоре."
        },
        next: "s9"
      },
      s9: {
        art: "🌌⭐😊", char: "explorer",
        text: {
          en: "The little star zooms back into its place in the sky and winks three times: thank you, thank you, thank you! The whole sky sparkles.",
          de: "Der kleine Stern saust zurück an seinen Platz am Himmel und zwinkert dreimal: danke, danke, danke! Der ganze Himmel funkelt.",
          bg: "Малката звезда се стрелва обратно на мястото си в небето и намига три пъти: благодаря, благодаря, благодаря! Цялото небе заблестява."
        },
        next: "s10"
      },
      s10: {
        art: "🏠⭐💛", char: "explorer",
        text: {
          en: "{explorer} walks home smiling. From that night on, one little star always shines a tiny bit brighter over {explorer}'s window.",
          de: "{explorer} geht lächelnd nach Hause. Seit dieser Nacht leuchtet ein kleiner Stern immer ein bisschen heller über {explorer}s Fenster.",
          bg: "{explorer} се прибира усмихнат. От тази нощ една малка звезда винаги свети мъничко по-ярко над прозореца на {explorer}."
        },
        end: true
      }
    }
  },

  {
    id: "picnic",
    icon: "🧺",
    title: { en: "The Picnic Mystery", de: "Das Picknick-Rätsel", bg: "Загадката с пикника" },
    start: "s1",
    scenes: {
      s1: {
        art: "🧺😲🐜", char: "words",
        text: {
          en: "{words} and {math} set up a perfect picnic. But when they open the basket - the sandwiches are GONE! Only a trail of crumbs is left.",
          de: "{words} und {math} bauen ein perfektes Picknick auf. Doch als sie den Korb öffnen - die Sandwiches sind WEG! Nur eine Krümelspur ist übrig.",
          bg: "{words} и {math} приготвят перфектен пикник. Но когато отварят кошницата - сандвичите ги НЯМА! Останала е само пътечка от трохи."
        },
        next: "s2"
      },
      s2: {
        art: "🔎🍞", char: "math",
        text: {
          en: "\"A real detective counts the clues first,\" says {math}. How many crumbs can you count?",
          de: "\"Ein echter Detektiv zählt zuerst die Spuren\", sagt {math}. Wie viele Krümel zählst du?",
          bg: "\"Истинският детектив първо брои уликите\", казва {math}. Колко трохи преброяваш?"
        },
        challenge: { type: "count", emoji: "🍞", n: 6, next: "s3" }
      },
      s3: {
        art: "🍞🌳🦆", char: "math",
        text: {
          en: "The crumb trail splits! One line leads to the whispering bushes, the other to the duck pond.",
          de: "Die Krümelspur teilt sich! Eine führt zu den raschelnden Büschen, die andere zum Ententeich.",
          bg: "Пътечката от трохи се разделя! Едната води към шумолящите храсти, другата към езерото с патиците."
        },
        choices: [
          { icon: "🌳", text: { en: "Follow it to the bushes", de: "Zu den Büschen folgen", bg: "След нея към храстите" }, next: "s4b" },
          { icon: "🦆", text: { en: "Follow it to the pond", de: "Zum Teich folgen", bg: "След нея към езерото" }, next: "s4p" }
        ]
      },
      s4b: {
        art: "🌳🐿️👀", char: "words",
        text: {
          en: "In the bushes, two big shiny eyes peek out. It is a small squirrel - with crumbs all over its whiskers!",
          de: "In den Büschen blitzen zwei große Augen auf. Es ist ein kleines Eichhörnchen - mit Krümeln in den Schnurrhaaren!",
          bg: "В храстите надничат две големи блестящи очи. Това е малка катеричка - с трохи по мустачките!"
        },
        next: "s5"
      },
      s4p: {
        art: "🦆🐿️", char: "words",
        text: {
          en: "\"Quack! A small fluffy thief ran to the bushes!\" giggle the ducks. The friends tiptoe over - and find a squirrel with crumbs on its whiskers!",
          de: "\"Quak! Ein kleiner flauschiger Dieb ist zu den Büschen gerannt!\", kichern die Enten. Die Freunde schleichen hin - und finden ein Eichhörnchen mit Krümeln in den Schnurrhaaren!",
          bg: "\"Квак! Един малък пухкав крадец избяга към храстите!\", кикотят се патиците. Приятелите се промъкват натам - и намират катеричка с трохи по мустачките!"
        },
        next: "s5"
      },
      s5: {
        art: "🐿️🐣🐣🐣", char: "words",
        text: {
          en: "\"I am so sorry,\" squeaks the squirrel. \"Three baby birds were so hungry. I only wanted to feed them!\"",
          de: "\"Es tut mir so leid\", piepst das Eichhörnchen. \"Drei Vogelkinder waren so hungrig. Ich wollte sie nur füttern!\"",
          bg: "\"Много съжалявам\", писука катеричката. \"Три птичета бяха толкова гладни. Само исках да ги нахраня!\""
        },
        next: "s6"
      },
      s6: {
        art: "🔤🐦✨", char: "words",
        text: {
          en: "\"Who did you feed? Show us the word!\" says {words}, and shuffles her magic letters.",
          de: "\"Wen hast du gefüttert? Zeig uns das Wort!\", sagt {words} und mischt ihre Zauberbuchstaben.",
          bg: "\"Кого нахрани? Покажи ни думата!\", казва {words} и разбърква вълшебните си букви."
        },
        challenge: { type: "unscramble", word: { en: "BIRD", de: "VOGEL", bg: "ПТИЦА" }, emoji: "🐦", next: "s7" }
      },
      s7: {
        art: "🤝❓", char: "math",
        text: {
          en: "The friends look at each other. What should they do now?",
          de: "Die Freunde sehen sich an. Was sollen sie jetzt tun?",
          bg: "Приятелите се споглеждат. Какво да направят сега?"
        },
        choices: [
          { icon: "🥪", text: { en: "Share the rest of the picnic with everyone", de: "Den Rest des Picknicks mit allen teilen", bg: "Да споделят останалия пикник с всички" }, next: "s8a" },
          { icon: "🍪", text: { en: "Bake fresh cookies together", de: "Zusammen frische Kekse backen", bg: "Да изпекат заедно пресни бисквитки" }, next: "s8b" }
        ]
      },
      s8a: {
        art: "🧺🍓🥜🍰", char: "words",
        text: {
          en: "They spread the blanket wide. Berries for the birds, nuts for the squirrel, cake for the friends - the best picnic ever!",
          de: "Sie breiten die Decke weit aus. Beeren für die Vögel, Nüsse für das Eichhörnchen, Kuchen für die Freunde - das beste Picknick aller Zeiten!",
          bg: "Разстилат одеялото нашироко. Плодове за птичетата, ядки за катеричката, торта за приятелите - най-хубавият пикник!"
        },
        next: "s9"
      },
      s8b: {
        art: "🍪🦆😋", char: "words",
        text: {
          en: "Soon the meadow smells of warm cookies. Even the ducks waddle over for a bite. Crumbs for everyone - on purpose this time!",
          de: "Bald duftet die Wiese nach warmen Keksen. Sogar die Enten watscheln für einen Happen herbei. Krümel für alle - diesmal mit Absicht!",
          bg: "Скоро поляната ухае на топли бисквитки. Дори патиците идват за хапка. Трохи за всички - този път нарочно!"
        },
        next: "s9"
      },
      s9: {
        art: "🕵️❓", char: "math",
        text: {
          en: "\"One last detective question!\" laughs {math}. \"Who took the sandwiches?\"",
          de: "\"Eine letzte Detektivfrage!\", lacht {math}. \"Wer hat die Sandwiches genommen?\"",
          bg: "\"Последен детективски въпрос!\", смее се {math}. \"Кой взе сандвичите?\""
        },
        challenge: {
          type: "pick",
          q: { en: "Who took the sandwiches?", de: "Wer hat die Sandwiches genommen?", bg: "Кой взе сандвичите?" },
          opts: ["🦆", "🐿️", "🐻"], correct: 1, next: "s10"
        }
      },
      s10: {
        art: "🤝💛🧺", char: "math",
        text: {
          en: "Case closed! The friends learn that sharing makes every picnic taste twice as good. The squirrel and the baby birds agree completely.",
          de: "Fall gelöst! Die Freunde lernen: Teilen macht jedes Picknick doppelt so lecker. Das Eichhörnchen und die Vogelkinder stimmen völlig zu.",
          bg: "Случаят е разкрит! Приятелите научават, че споделянето прави всеки пикник двойно по-вкусен. Катеричката и птичетата са напълно съгласни."
        },
        end: true
      }
    }
  }
];
