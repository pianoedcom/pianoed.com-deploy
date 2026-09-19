export type GlossaryCategory =
  | "Piano Anatomy"
  | "Dynamics"
  | "Notation"
  | "Music Theory"
  | "Technique"
  | "Tempo";

export interface LocalizedGlossaryContent {
  localizedName?: string;
  categoryLabel?: string;
  definition: string;
  analogy: string;
}

export interface GlossaryTerm {
  id: string;
  term: string; // Always in English as requested
  category: GlossaryCategory;
  aliases?: string[];
  definition: string;
  analogy: string;
  translations?: Partial<Record<string, LocalizedGlossaryContent>>;
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "Piano Anatomy",
  "Dynamics",
  "Notation",
  "Music Theory",
  "Technique",
  "Tempo",
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // --- A ---
  {
    id: "accelerando",
    term: "Accelerando",
    category: "Tempo",
    aliases: ["accel."],
    definition:
      'An Italian word meaning "accelerating." It tells you to gradually play faster until the music says otherwise.',
    analogy:
      "Picture a train pulling out of a station: it starts slowly and smoothly gathers speed rather than lurching forward. Keep your hands relaxed as you speed up, because tension is the enemy of fast playing.",
    translations: {
      de: {
        localizedName: "Beschleunigend (Accelerando)",
        categoryLabel: "Tempo",
        definition:
          'Ein italienisches Wort für „beschleunigend". Es weist Sie an, schrittweise schneller zu spielen, bis das Notenbild etwas anderes vorgibt.',
        analogy:
          "Stellen Sie sich einen Zug vor, der den Bahnhof verlässt: Er beginnt gemächlich und nimmt sanft Fahrt auf, anstatt abrupt loszustürmen. Halten Sie Ihre Hände locker, denn Anspannung bremst das Tempo.",
      },
      es: {
        localizedName: "Acelerando (Accelerando)",
        categoryLabel: "Tempo",
        definition:
          'Palabra italiana que significa "acelerar". Te indica tocar progresivamente más rápido hasta que la partitura indique lo contrario.',
        analogy:
          "Imagina un tren saliendo de la estación: arranca con lentitud y gana velocidad con suavidad en lugar de dar tirones. Mantén las manos relajadas al aumentar la velocidad.",
      },
      fr: {
        localizedName: "En accélérant (Accelerando)",
        categoryLabel: "Tempo",
        definition:
          'Mot italien signifiant « accélérant ». Il vous indique d\'accélérer progressivement le tempo jusqu\'à nouvelle indication.',
        analogy:
          "Visualisez un train quittant la gare : il démarre lentement et prend de la vitesse tout en douceur. Gardez les mains détendues en accélérant, la tension étant l'ennemie de la vélocité.",
      },
      hi: {
        localizedName: "गति बढ़ाना (Accelerando)",
        categoryLabel: "गति (Tempo)",
        definition:
          'एक इतालवी शब्द जिसका अर्थ है "तेज़ करना"। यह आपको धीरे-धीरे अपनी गति बढ़ाने का निर्देश देता है जब तक कि संगीत में अगला निर्देश न आए।',
        analogy:
          "स्टेशन से छूटती हुई ट्रेन की कल्पना करें: यह धीमी शुरुआत करती है और धीरे-धीरे गति पकड़ती है, न कि अचानक झटके से। गति बढ़ाते समय अपने हाथों को तनावमुक्त रखें।",
      },
      ar: {
        localizedName: "تسريع العزف (Accelerando)",
        categoryLabel: "السرعة (Tempo)",
        definition:
          'مصطلح إيطالي يعني "التسريع". يرشدك إلى العزف بوتيرة أسرع تدريجيًا حتى يوجهك النص الموسيقي لغير ذلك.',
        analogy:
          "تخيل قطارًا يغادر المحطة: يبدأ ببطء وتدرج ثم يكتسب السرعة بسلاسة دون اندفاع مفاجئ. حافظ على استرخاء يديك عند زيادة السرعة.",
      },
    },
  },
  {
    id: "accidental",
    term: "Accidental",
    category: "Notation",
    definition:
      "A symbol placed before a note that raises it, lowers it, or cancels a previous change. The three accidentals are the sharp (♯), the flat (♭), and the natural (♮).",
    analogy:
      "Think of a temporary detour sign on a road. It only applies until the end of the current measure, then you're back on the usual route set by the key signature.",
    translations: {
      de: {
        localizedName: "Versetzungszeichen (Accidental)",
        categoryLabel: "Notation",
        definition:
          "Ein Symbol vor einer Note, das diese erhöht, erniedrigt oder eine vorherige Änderung aufhebt. Die drei Versetzungszeichen sind das Kreuz (♯), das Be (♭) und das Auflösungszeichen (♮).",
        analogy:
          "Denken Sie an ein temporäres Umleitungsschild. Es gilt nur bis zum Ende des aktuellen Takts; danach gilt wieder die reguläre Tonart.",
      },
      es: {
        localizedName: "Alteración accidental (Accidental)",
        categoryLabel: "Notación",
        definition:
          "Símbolo colocado antes de una nota que la sube, la baja o cancela un cambio previo. Las tres alteraciones son el sostenido (♯), el bemol (♭) y el becuadro (♮).",
        analogy:
          "Piensa en una señal de desvío temporal en la carretera. Solo tiene efecto hasta el final del compás actual, luego regresas a la ruta marcada por la armadura de clave.",
      },
      fr: {
        localizedName: "Altération accidentelle (Accidental)",
        categoryLabel: "Notation",
        definition:
          "Symbole placé devant une note pour l'élever, l'abaisser ou annuler une altération antérieure. Les trois altérations sont le dièse (♯), le bémol (♭) et le bécarre (♮).",
        analogy:
          "Pensez à une déviation temporaire sur la route. Elle ne s'applique que jusqu'à la fin de la mesure en cours avant de revenir aux règles de l'armure.",
      },
      hi: {
        localizedName: "आकस्मिक स्वर-चिह्न (Accidental)",
        categoryLabel: "संकेतन (Notation)",
        definition:
          "किसी स्वर के आगे लगाया जाने वाला चिह्न जो उसे ऊँचा (तीव्र), नीचा (कोमल) करता है या पूर्व परिवर्तन को रद्द करता है (शार्प ♯, फ़्लैट ♭, नेचुरल ♮)।",
        analogy:
          "इसे सड़क पर किसी अस्थायी डायवर्जन बोर्ड की तरह समझें। यह केवल वर्तमान माप (measure) के अंत तक लागू होता है, फिर आप मुख्य की-सिग्नेचर पर लौट आते हैं।",
      },
      ar: {
        localizedName: "علامات التحويل العارضة (Accidental)",
        categoryLabel: "التدوين الموسيقي (Notation)",
        definition:
          "رمز يوضع قبل النغمة لرفعها بنصف بعد، خفضها بنصف بعد، أو إلغاء تغيير سابق (الدييز ♯، البيمول ♭، والبيكار ♮).",
        analogy:
          "فكر فيها كلافتة تحويل مسار مؤقتة على الطريق؛ تسري فقط حتى نهاية المازورة الحالية، ثم تعود للمسار الأساسي المحدد بدليل المقام.",
      },
    },
  },
  {
    id: "action",
    term: "Action",
    category: "Piano Anatomy",
    definition:
      "The system of levers, springs, and hammers inside a piano that turns the press of a key into a hammer striking a string. Digital pianos mimic this with weighted or hammer-action keys.",
    analogy:
      'It works like a row of dominoes. Your finger pushes the first one, the motion passes through a chain of tiny parts, and the last one delivers the "tap" that makes the sound.',
    translations: {
      de: {
        localizedName: "Klaviermechanik (Action)",
        categoryLabel: "Klavieranatomie",
        definition:
          "Das System aus Hebeln, Federn und Hämmern im Klavier, das den Tastendruck in den Anschlag eines Hammers auf die Saite übersetzt.",
        analogy:
          "Es funktioniert wie eine Kette von Dominosteinen: Der Fingerdruck setzt die feine Mechanik in Bewegung, bis der Hammer präzise die Saite anschlägt.",
      },
      es: {
        localizedName: "Mecanismo o Acción (Action)",
        categoryLabel: "Anatomía del Piano",
        definition:
          "El conjunto de palancas, resortes y macillos dentro del piano que transforma la pulsación de una tecla en el golpe del macillo contra las cuerdas.",
        analogy:
          "Funciona como una hilera de fichas de dominó. Tu dedo pulsa la tecla y el movimiento recorre una cadena de piezas precisas hasta producir el sonido.",
      },
      fr: {
        localizedName: "Mécanique du piano (Action)",
        categoryLabel: "Anatomie du piano",
        definition:
          "L'ensemble de leviers, ressorts et marteaux à l'intérieur du piano qui convertit l'enfoncement d'une touche en frappe du marteau sur la corde.",
        analogy:
          "Imaginez une chaîne de dominos : votre doigt actionne le premier levier, le mouvement traverse les articulations et le marteau produit la note parfaite.",
      },
      hi: {
        localizedName: "पियानो एक्शन व तंत्र (Action)",
        categoryLabel: "पियानो की बनावट (Piano Anatomy)",
        definition:
          "पियानो के भीतर लीवर, स्प्रिंग और हथौड़ों (hammers) की आंतरिक प्रणाली जो कुंजी दबाने पर हथौड़े द्वारा तार पर प्रहार कराती है।",
        analogy:
          "यह डोमिनोज़ की कतार की तरह काम करता है। आपकी उंगली कुंजी दबाती है, गति सूक्ष्म हिस्सों से गुजरती है और हथौड़ा तार पर चोट करके मधुर ध्वनि निकालता है।",
      },
      ar: {
        localizedName: "آلية حركة المفاتيح (Action)",
        categoryLabel: "أجزاء البيانو (Piano Anatomy)",
        definition:
          "منظومة العتلات والزنبركات والمطارق الداخلية التي تحوّل ضغطة إصبعك على المفتاح إلى ضربة مطرقة دقيقة على الأوتار.",
        analogy:
          "تعمل كأحجار الدومينو؛ يضغط إصبعك على المفتاح فتنتقل الحركة بسلاسة عبر السلسلة الميكانيكية ليضرب المطرقة الوتر وينطلق الصوت الرنان.",
      },
    },
  },
  {
    id: "adagio",
    term: "Adagio",
    category: "Tempo",
    definition:
      'An Italian word meaning "at ease." It marks a slow, calm tempo, generally around 66–76 beats per minute.',
    analogy:
      "Imagine a slow stroll through a quiet garden with nowhere to be. Give every note room to sing.",
  },
  {
    id: "allegro",
    term: "Allegro",
    category: "Tempo",
    definition:
      'An Italian word meaning "cheerful." It marks a fast, lively tempo, generally around 120–156 beats per minute.',
    analogy:
      "Think of a brisk, happy jog. It's energetic, but you can still keep control of every step.",
  },
  {
    id: "andante",
    term: "Andante",
    category: "Tempo",
    definition:
      'An Italian word meaning "walking." It marks a moderate, flowing tempo, generally around 76–108 beats per minute.',
    analogy:
      "This is your natural walking pace: steady, unhurried, and comfortable. If a piece is marked andante, imagine strolling to a friend's house.",
  },
  {
    id: "arpeggio",
    term: "Arpeggio",
    category: "Technique",
    definition:
      'A chord whose notes are played one after another instead of all at once. The word comes from the Italian for "harp."',
    analogy:
      "Imagine slowly strumming a guitar or running your fingers across harp strings, so the chord unfolds like a ribbon. Try C–E–G–C going up the keyboard to hear a C major arpeggio.",
    translations: {
      de: {
        localizedName: "Arpeggio (Harfenakkord)",
        categoryLabel: "Spieltechnik",
        definition:
          "Ein Akkord, dessen Töne nicht gleichzeitig, sondern nacheinander von unten nach oben gespielt werden (vom italienischen Wort für Harfe abgeleitet).",
        analogy:
          "Stellen Sie sich vor, wie Sie sanft über die Saiten einer Harfe streichen, sodass sich der Klang wie ein weiches Band entfaltet.",
      },
      es: {
        localizedName: "Arpegio (Arpeggio)",
        categoryLabel: "Técnica",
        definition:
          'Un acorde cuyas notas se tocan una tras otra en lugar de simultáneamente. Proviene del término italiano para "arpa".',
        analogy:
          "Imagina rasguear despacio un arpa o una guitarra, donde el acorde se despliega como una cinta de notas en cascada.",
      },
      fr: {
        localizedName: "Arpège (Arpeggio)",
        categoryLabel: "Technique",
        definition:
          "Accord dont les notes sont jouées successivement et rapidement l'une après l'autre plutôt que frappées ensemble.",
        analogy:
          "Imaginez caresser les cordes d'une harpe : l'accord se déploie dans l'air comme un ruban de son fluide et scintillant.",
      },
      hi: {
        localizedName: "आरपेजियो (Arpeggio)",
        categoryLabel: "तकनीक (Technique)",
        definition:
          'एक कॉर्ड जिसके स्वर एक साथ बजाने के बजाय क्रमवार एक-एक करके बजाए जाते हैं (वीणा या हार्प की तरह)।',
        analogy:
          "हार्प की तारों पर उंगलियां फेरने की कल्पना करें, जिससे स्वर एक सुंदर लहर की तरह खिलते हैं। C-E-G-C को एक-एक करके बजाकर देखें।",
      },
      ar: {
        localizedName: "آربيجيو (عزف النغمات التتابعي)",
        categoryLabel: "تقنية العزف (Technique)",
        definition:
          "كورد موسيقي تُعزف نغماته بتتابع سريع واحدة تلو الأخرى بدلاً من ضربها معاً في نفس اللحظة (مشتق من كلمة القيثار الإيطالية).",
        analogy:
          "تخيل تمرير أصابعك برقة على أوتار القيثارة، حيث تتفتح النغمات كشريط انسيابي متدفق واحدة تلو الأخرى.",
      },
    },
  },

  // --- B ---
  {
    id: "bass-clef",
    term: "Bass Clef",
    category: "Notation",
    aliases: ["F Clef"],
    definition:
      "A clef used for lower notes, usually played by the left hand. Its two dots sit on either side of the F line, which is why it's also called the F clef.",
    analogy:
      "Think of it as the basement of the music. Everything down here has a deep, rumbling sound, like the foundation of a house.",
  },
  {
    id: "beat",
    term: "Beat",
    category: "Music Theory",
    definition:
      "The steady pulse that runs through a piece of music. It's the part you naturally tap your foot to.",
    analogy:
      "It's the heartbeat of the music, or the tick of a clock. Notes may be long or short, but the beat keeps going evenly underneath.",
  },
  {
    id: "black-keys",
    term: "Black Keys",
    category: "Piano Anatomy",
    definition:
      "The shorter, raised keys arranged in alternating groups of two and three. They play the sharps (♯) and flats (♭).",
    analogy:
      "The black key groups are street signs for navigating the keyboard. The white key just to the left of any two-black-key group is always C.",
  },

  // --- C ---
  {
    id: "chord",
    term: "Chord",
    category: "Music Theory",
    definition:
      "Three or more notes played at the same time. Chords give music its fullness and emotional color.",
    analogy:
      "If single notes are individual paint colors, a chord is those colors blended on the canvas. Play C, E, and G together to make a C major chord.",
  },
  {
    id: "clef",
    term: "Clef",
    category: "Notation",
    definition:
      "A symbol at the start of each staff that tells you which note each line and space stands for. Piano music mainly uses the treble clef and the bass clef.",
    analogy:
      "A clef is like the legend on a map. Without it, the dots on the staff are just decoration.",
  },
  {
    id: "crescendo",
    term: "Crescendo",
    category: "Dynamics",
    aliases: ["cresc."],
    definition:
      "A gradual increase in volume. It's often shown as a long hairpin shape that opens up to the right (<).",
    analogy:
      "Imagine slowly turning up a volume knob, or a wave building as it approaches the shore. Save your loudest sound for the end of the crescendo so it has room to grow.",
  },

  // --- D ---
  {
    id: "damper-pedal",
    term: "Damper Pedal",
    category: "Piano Anatomy",
    aliases: ["Sustain Pedal", "Sustaining Pedal"],
    definition:
      "The right-hand pedal. It lifts the dampers (felt pads) off the strings so notes keep ringing after you release the keys.",
    analogy:
      "It's like singing in a stairwell or a cathedral, where the sound lingers and blends together. Press the pedal down just after you play a chord, and lift it when the harmony changes to keep things from turning muddy.",
    translations: {
      de: {
        localizedName: "Dämpferpedal / Haltepedal (Damper Pedal)",
        categoryLabel: "Klavieranatomie",
        definition:
          "Das rechte Pedal des Klaviers. Es hebt die Filzdämpfer von den Saiten ab, sodass gespielte Töne auch nach dem Loslassen der Tasten weiterschwingen.",
        analogy:
          "Wie das Singen in einer Kathedrale: Der Klang schwebt im Raum. Treten Sie das Pedal kurz nach dem Akkordanschlag und wechseln Sie es bei jedem Harmoniewechsel.",
      },
      es: {
        localizedName: "Pedal de resonancia (Damper Pedal)",
        categoryLabel: "Anatomía del Piano",
        definition:
          "El pedal derecho del piano. Levanta los apagadores de las cuerdas para que las notas sigan vibrando y sonando tras soltar las teclas.",
        analogy:
          "Es como cantar en una gran catedral donde el eco se mantiene. Písalo justo después de tocar una nota y levántalo cuando cambie el acorde para no ensuciar el sonido.",
      },
      fr: {
        localizedName: "Pédale forte / Pédale de sustain (Damper Pedal)",
        categoryLabel: "Anatomie du piano",
        definition:
          "La pédale de droite. Elle soulève l'ensemble des étouffoirs afin que les cordes continuent de résonner même après avoir relâché les touches.",
        analogy:
          "Comme le chant sous la voûte d'une cathédrale : le son flotte et s'amplifie. Relevez la pédale à chaque changement d'accord pour éviter la dissonance.",
      },
      hi: {
        localizedName: "डैम्पर / सस्टेन पेडल (Damper Pedal)",
        categoryLabel: "पियानो की बनावट (Piano Anatomy)",
        definition:
          "पियानो का सबसे दायाँ पेडल। यह फेल्ट पैड्स (dampers) को तारों से हटाता है जिससे कुंजियाँ छोड़ने के बाद भी ध्वनि गूँजती रहती है।",
        analogy:
          "किसी बड़े मंदिर या हॉल में गूँज की तरह। नया कॉर्ड बदलते ही पेडल उठाकर दोबारा दबाएँ ताकि आवाज़ में मैलापन न आए।",
      },
      ar: {
        localizedName: "دواسة الرنين / التثبيت (Damper Pedal)",
        categoryLabel: "أجزاء البيانو (Piano Anatomy)",
        definition:
          "الدواسة اليمنى للبيانو. ترفع المخامد اللبدية عن الأوتار لتستمر النغمات في الرنين حتى بعد رفع أصابعك عن المفاتيح.",
        analogy:
          "يشبه الصدى الرخيم في قبة كاتدرائية واسعة. اضغط عليها برفق بعد النقر على المفاتيح وارفعها عند تبدل الهارموني لتفادي تشابك الأصوات.",
      },
    },
  },
  {
    id: "decrescendo",
    term: "Decrescendo",
    category: "Dynamics",
    aliases: ["Diminuendo", "decresc.", "dim."],
    definition:
      "A gradual decrease in volume. It's often shown as a hairpin shape that closes to the right (>).",
    analogy:
      "Picture the sun sinking below the horizon or a wave rolling back out to sea. The sound fades away gently, without a sudden drop.",
  },
  {
    id: "dotted-note",
    term: "Dotted Note",
    category: "Notation",
    definition:
      "A note with a small dot after it. The dot adds half of the note's original length.",
    analogy:
      "Think of the dot as a 50% tip on the note's value. A half note lasts 2 beats, so a dotted half note lasts 3 beats (2 plus 1).",
  },
  {
    id: "dynamics",
    term: "Dynamics",
    category: "Dynamics",
    definition:
      "The loudness and softness of music. Dynamics are shown with markings like pianissimo, piano, forte, and crescendo.",
    analogy:
      "Dynamics are the music's tone of voice, ranging from a whisper to a shout. The same words sound completely different depending on how you say them.",
  },

  // --- E ---
  {
    id: "expression",
    term: "Expression",
    category: "Technique",
    definition:
      "The emotional shaping of music through dynamics, flexible timing, touch, pedaling, and phrasing. It's what turns correct notes into real music.",
    analogy:
      "Reading a story aloud is a good comparison. The notes are the words, and expression is how you say them: with pauses, emphasis, warmth, or excitement.",
  },

  // --- F ---
  {
    id: "fermata",
    term: "Fermata",
    category: "Notation",
    definition:
      "A symbol shaped like an arc with a dot underneath, placed over a note or rest. It tells you to hold it longer than its written value, and how much longer is up to you.",
    analogy:
      "It's the music's pause button, like a held breath before the next thought. Trust your ear and let the moment breathe.",
  },
  {
    id: "fingering",
    term: "Fingering",
    category: "Technique",
    definition:
      "The numbers written above or below notes that tell you which finger to use: 1 is the thumb, 2 the index, 3 the middle, 4 the ring, and 5 the pinky.",
    analogy:
      "Fingering is a GPS route for your hands. There are many ways to reach the destination, but a good route keeps you smooth and avoids awkward jumps.",
  },
  {
    id: "flat",
    term: "Flat",
    category: "Notation",
    aliases: ["♭"],
    definition:
      "A symbol (♭) that lowers a note by one half step, moving to the very next key on the left. It's often, but not always, a black key.",
    analogy:
      "Think of a flat tire sinking lower to the ground. A flat pushes the pitch down.",
  },
  {
    id: "forte",
    term: "Forte",
    category: "Dynamics",
    aliases: ["f"],
    definition:
      'An Italian word meaning "strong." It tells you to play loudly.',
    analogy:
      "Imagine speaking with confidence to a room full of people: clear and full-bodied, but not shouting. Loud playing should still sound beautiful, never harsh.",
  },
  {
    id: "fortissimo",
    term: "Fortissimo",
    category: "Dynamics",
    aliases: ["ff"],
    definition:
      'A marking meaning "very loud." It\'s one step louder than forte.',
    analogy:
      "Think of a stadium crowd erupting after a game-winning goal. Use your arm weight rather than tense fingers, and keep the tone full instead of banging.",
  },

  // --- G ---
  {
    id: "grand-piano",
    term: "Grand Piano",
    category: "Piano Anatomy",
    definition:
      "A piano whose frame, strings, and soundboard lie horizontally, with a large lid on top. Its action uses gravity to reset the hammers, which allows very fast repeated notes and a rich, resonant tone.",
    analogy:
      "This is the piano you picture on a concert stage. Its strings stretch out horizontally like the wing of a bird, and the lid can be propped open to project the sound into the room.",
  },
  {
    id: "grand-staff",
    term: "Grand Staff",
    category: "Notation",
    definition:
      "Two staves, one with a treble clef and one with a bass clef, joined by a brace. It's how piano music is written so both hands can be shown together.",
    analogy:
      "Imagine a two-story building: the treble staff is the upstairs floor, and the bass staff is the downstairs floor. Middle C sits in the stairwell between them.",
  },

  // --- H ---
  {
    id: "half-step",
    term: "Half Step",
    category: "Music Theory",
    aliases: ["Semitone"],
    definition:
      "The smallest distance between two notes on the piano: from one key to the very next key, whether it's black or white. E to F and B to C are half steps with no black key between them.",
    analogy:
      "Think of a single stair step. Two of them make a whole step.",
  },
  {
    id: "hammer",
    term: "Hammer",
    category: "Piano Anatomy",
    definition:
      "A small felt-covered wooden piece inside the piano that strikes the strings when you press a key. Each key has its own hammer.",
    analogy:
      "Picture a tiny drumstick that bounces right back after hitting the string. That quick bounce is what lets the string keep vibrating and singing.",
  },
  {
    id: "harmony",
    term: "Harmony",
    category: "Music Theory",
    definition:
      "The sound of multiple notes played together, especially the chords that support a melody.",
    analogy:
      "If the melody is the lead singer, harmony is the band behind them. It gives the tune depth, mood, and direction.",
  },

  // --- I ---
  {
    id: "interval",
    term: "Interval",
    category: "Music Theory",
    definition:
      'The distance between two notes, named by counting letter names including the starting note. C up to E is a "third" because you count C-D-E.',
    analogy:
      "An interval is like the gap between two stairs or the distance between two cities on a map. Learning to recognize common intervals on sight makes reading music far faster.",
  },

  // --- K ---
  {
    id: "key",
    term: "Key",
    category: "Music Theory",
    definition:
      'The "home base" of a piece of music, named for its main note and scale, as in "the key of C major." (It also means a physical key you press, but in music theory it describes the tonal center.)',
    analogy:
      "Think of a key as a song's hometown. The music wanders off and explores, but it usually feels most settled when it returns home.",
  },
  {
    id: "key-signature",
    term: "Key Signature",
    category: "Notation",
    definition:
      "A group of sharps (♯) or flats (♭) at the beginning of each staff that tells you which notes to raise or lower throughout the piece and reveals the key you're in.",
    analogy:
      'It\'s a standing instruction, like a note on a recipe that says "always use brown sugar." Instead of writing a sharp beside every F♯, the composer states it once at the start.',
  },

  // --- L ---
  {
    id: "ledger-line",
    term: "Ledger Line",
    category: "Notation",
    definition:
      "A short extra line drawn above or below the staff so notes that are too high or too low can still be written.",
    analogy:
      "Ledger lines are extra rungs added to the top or bottom of a ladder. They let you keep climbing beyond the five lines that were already there.",
  },
  {
    id: "legato",
    term: "Legato",
    category: "Technique",
    definition:
      'An Italian word meaning "tied together." It tells you to play smoothly, with no gaps between the notes.',
    analogy:
      "Speak a sentence in one flowing breath without stopping between words. On the piano, release each key just as the next one goes down.",
  },

  // --- M ---
  {
    id: "major-and-minor",
    term: "Major and Minor",
    category: "Music Theory",
    definition:
      "The two most common types of scales, keys, and chords. Major sounds bright and happy, while minor sounds darker and more serious.",
    analogy:
      "Think of a sunny day versus a cloudy one. Try playing C–E–G (major), then lower the middle note to C–E♭–G (minor) and listen to the mood shift.",
  },
  {
    id: "measure-bar",
    term: "Measure (Bar)",
    category: "Notation",
    aliases: ["Measure", "Bar"],
    definition:
      "A section of music between two vertical bar lines. Each measure holds a fixed number of beats, set by the time signature.",
    analogy:
      "Measures are like sentences in a paragraph. They break the music into small, readable chunks so you don't lose your place.",
  },
  {
    id: "melody",
    term: "Melody",
    category: "Music Theory",
    definition:
      "The main tune of a piece: a sequence of single notes that forms the part you'd hum or sing along with.",
    analogy:
      "The melody is what you'd hum in the shower. Everything else, like harmony and accompaniment, is there to support it.",
  },
  {
    id: "metronome",
    term: "Metronome",
    category: "Technique",
    definition:
      "A device or app that clicks at a steady speed you choose, measured in beats per minute (BPM). It helps you practice keeping an even tempo.",
    analogy:
      "A metronome is a tireless drummer who never speeds up or slows down. Start slower than you think you need to, then raise the speed a few BPM at a time as the passage gets easier.",
  },
  {
    id: "mezzo-forte",
    term: "Mezzo Forte",
    category: "Dynamics",
    aliases: ["mf"],
    definition:
      'A marking meaning "medium loud." It sits between forte and mezzo piano (moderately soft), and it\'s one of the most common dynamics in beginner music.',
    analogy:
      "Think of a normal, clear speaking voice in a room, present and easy to hear without being raised.",
  },
  {
    id: "middle-c",
    term: "Middle C",
    category: "Piano Anatomy",
    aliases: ["C4"],
    definition:
      "The C closest to the center of the keyboard. It's the white key just to the left of the two-black-key group nearest the middle, and it's the landmark that links the treble and bass staves.",
    analogy:
      'Middle C is the "You Are Here" pin on your keyboard map. Once you can find it instantly, you can find every other note relative to it.',
    translations: {
      de: {
        localizedName: "Eingestrichenes C / Schloss-C (Middle C)",
        categoryLabel: "Klavieranatomie",
        definition:
          "Das c' in der Mitte der Klaviatur. Es liegt direkt links neben der mittleren Zweiergruppe der schwarzen Tasten und verbindet den Violin- und Bassschlüssel.",
        analogy:
          'Das Schloss-C ist die „Sie befinden sich hier"-Nadel auf Ihrer Klavier-Landkarte. Von ihm aus erschließt sich die gesamte Tastatur.',
      },
      es: {
        localizedName: "Do central (Middle C)",
        categoryLabel: "Anatomía del Piano",
        definition:
          "El Do situado en el centro del teclado (C4). Es la tecla blanca justo a la izquierda del grupo central de dos teclas negras y sirve de nexo entre las claves de Sol y Fa.",
        analogy:
          "El Do central es el chincheta de «Usted está aquí» en el mapa del teclado. Cuando lo localizas de inmediato, encuentras todas las demás notas.",
      },
      fr: {
        localizedName: "Do central (Middle C)",
        categoryLabel: "Anatomie du piano",
        definition:
          "La note Do située au milieu du clavier (Do 3 / C4). C'est le point de repère fondamental entre la portée en clé de Sol et la portée en clé de Fa.",
        analogy:
          "Le Do central est le point de repère « Vous êtes ici » sur la carte du piano. Une fois repéré, tout le reste du clavier s'éclaire.",
      },
      hi: {
        localizedName: "मध्यम सा / मिडिल सी (Middle C)",
        categoryLabel: "पियानो की बनावट (Piano Anatomy)",
        definition:
          "पियानो कीबोर्ड के बिल्कुल बीच में स्थित C (C4)। यह ट्रेबल और बास दोनों स्टाफ के बीच का मुख्य मील का पत्थर है।",
        analogy:
          "मिडिल सी कीबोर्ड मानचित्र का 'आप यहाँ हैं' (You Are Here) पिन है। एक बार जब आप इसे पहचान लेते हैं, तो बाकी सभी स्वर आसानी से मिल जाते हैं।",
      },
      ar: {
        localizedName: "دو الوسطى (Middle C)",
        categoryLabel: "أجزاء البيانو (Piano Anatomy)",
        definition:
          "نغمة الدو (C4) الواقعة في مركز لوحة المفاتيح تقريباً. تمثل صلة الوصل وحجر الزاوية بين مدرج مفتاح صول ومدرج مفتاح فا.",
        analogy:
          "دو الوسطى هي نقطة 'أنت هنا' على خريطة مفاتيح البيانو. بمجرد تحديدها على الفور، يمكنك تحديد كافة النغمات الأخرى بسهولة تامة.",
      },
    },
  },
  {
    id: "moderato",
    term: "Moderato",
    category: "Tempo",
    definition:
      'An Italian word meaning "moderate." It marks a medium tempo, generally around 108–120 beats per minute.',
    analogy:
      "Picture a steady, unhurried drive down a quiet road: not slow, not fast, just comfortably in control.",
  },

  // --- N ---
  {
    id: "natural",
    term: "Natural",
    category: "Notation",
    aliases: ["♮"],
    definition:
      "A symbol (♮) that cancels a sharp or flat, returning the note to its plain version, which is usually a white key.",
    analogy:
      "A natural is the undo button. Whatever change came before, it puts the note back to normal.",
  },
  {
    id: "note",
    term: "Note",
    category: "Notation",
    definition:
      "A symbol on the staff that tells you two things: which key to play (its position on the staff) and how long to hold it (its shape, such as whole, half, quarter, or eighth).",
    analogy:
      'A note is like a short text message with two pieces of information: "play this key" and "hold it this long." Position answers the first, and shape answers the second.',
  },

  // --- O ---
  {
    id: "octave",
    term: "Octave",
    category: "Music Theory",
    definition:
      'The distance from one note to the next note with the same letter name, higher or lower. They sound like the "same" note at a different height, and on the keyboard, C to the next C is eight white keys.',
    analogy:
      "Imagine a man and a woman singing the same tune together, each in their own natural range. It's the same melody at two different heights, and that's how octaves sound.",
    translations: {
      de: {
        localizedName: "Oktave (Octave)",
        categoryLabel: "Musiktheorie",
        definition:
          "Der Abstand zwischen zwei Tönen mit demselben Namen im Frequenzverhältnis 1:2. Auf den weißen Tasten entspricht dies einem Schritt von 8 Tönen.",
        analogy:
          "Wie wenn Mann und Frau dieselbe Melodie in ihrer jeweiligen Stimmlage singen: Derselbe Toncharakter, aber auf einer anderen Höhenebene.",
      },
      es: {
        localizedName: "Octava (Octave)",
        categoryLabel: "Teoría Musical",
        definition:
          "La distancia entre una nota y la siguiente con el mismo nombre, hacia arriba o hacia abajo. En el piano, de un Do al siguiente Do son ocho teclas blancas.",
        analogy:
          "Imagina a una mujer y un hombre cantando la misma canción, cada uno en su tesitura natural. Es la misma melodía en dos alturas complementarias.",
      },
      fr: {
        localizedName: "Octave (Octave)",
        categoryLabel: "Théorie musicale",
        definition:
          "Intervalle séparant deux notes de même nom. Sur les touches blanches du piano, cela correspond à une distance de huit notes.",
        analogy:
          "Imaginez un homme et une femme entonnant le même air dans leurs registres respectifs : la même note à deux hauteurs harmonieuses.",
      },
      hi: {
        localizedName: "सप्तक / अष्टक (Octave)",
        categoryLabel: "संगीत सिद्धांत (Music Theory)",
        definition:
          "एक स्वर से उसी नाम के अगले उच्च या निम्न स्वर की दूरी। कीबोर्ड पर एक सा (C) से अगले सा तक 8 सफेद कुंजियों की दूरी होती है।",
        analogy:
          "जैसे पुरुष और महिला अपनी प्राकृतिक आवाज़ में एक ही धुन गा रहे हों। स्वर वही रहता है, बस उसकी ऊँचाई (pitch) बदल जाती है।",
      },
      ar: {
        localizedName: "الأوكتاف / الديوان (Octave)",
        categoryLabel: "النظريات الموسيقية (Music Theory)",
        definition:
          "المسافة الفاصلة بين نغمة ونظيرتها التالية التي تحمل نفس الاسم بدرجة أعلى أو أدنى (8 درجات بيضاء بين دو والتي تليها).",
        analogy:
          "تخيل صوت رجل وامرأة يغنيان نفس اللحن معاً؛ نفس النغمة بجرس متناسق وبارتفاعين مختلفين تماماً.",
      },
    },
  },

  // --- P ---
  {
    id: "pianissimo",
    term: "Pianissimo",
    category: "Dynamics",
    aliases: ["pp"],
    definition:
      'A marking meaning "very soft." It\'s one step quieter than piano.',
    analogy:
      "Think of whispering in a library or tiptoeing past a sleeping baby. Keep your touch light, but stay in control so every note still sounds.",
  },
  {
    id: "piano",
    term: "Piano (Dynamic)",
    category: "Dynamics",
    aliases: ["p"],
    definition:
      'An Italian word meaning "soft," marked as a small p. It tells you to play quietly. (The instrument\'s full name, pianoforte, means "soft-loud" because it could do both.)',
    analogy:
      "Imagine speaking gently to someone who's resting nearby. Soft playing is about control, not timidity.",
  },
  {
    id: "pitch",
    term: "Pitch",
    category: "Music Theory",
    definition:
      "How high or low a note sounds. On the piano, pitch rises as you move right and falls as you move left.",
    analogy:
      "Compare a bird's chirp to a bass drum. The chirp has a high pitch and the drum a low one, and your keyboard holds that whole range from left to right.",
  },
  {
    id: "polyphony",
    term: "Polyphony",
    category: "Music Theory",
    definition:
      'Music made of two or more independent melodies played at the same time. On digital pianos, "polyphony" also means how many notes the instrument can sound at once.',
    analogy:
      'It\'s like several people at a dinner table, each telling their own story, and you can still follow every one. A round like "Row, Row, Row Your Boat" is a simple example.',
  },
  {
    id: "presto",
    term: "Presto",
    category: "Tempo",
    definition:
      'An Italian word meaning "quick." It marks a very fast tempo, generally around 168–200 beats per minute.',
    analogy:
      "Think of a sprint. Practice presto passages slowly first, then bring them up to speed gradually.",
  },

  // --- R ---
  {
    id: "repeat-sign",
    term: "Repeat Sign",
    category: "Notation",
    definition:
      "A double bar line with two dots that tells you to go back and play a section again. A matching sign facing the other way marks where the repeat begins.",
    analogy:
      'It works like the "repeat" button on a music player. The dots are your signal to loop back.',
  },
  {
    id: "rest",
    term: "Rest",
    category: "Notation",
    definition:
      "A symbol for silence lasting a specific number of beats. Each type of note has a matching rest.",
    analogy:
      "Rests are the pauses in speech that give words meaning. Silence is part of the music, so count it as carefully as the notes.",
  },
  {
    id: "rhythm",
    term: "Rhythm",
    category: "Music Theory",
    definition:
      "The pattern of long and short notes and silences laid over the steady beat.",
    analogy:
      'The beat is a heartbeat, and rhythm is the pattern of syllables in a sentence. Try clapping the words of "Twinkle, Twinkle, Little Star" and you\'re clapping its rhythm.',
  },
  {
    id: "ritardando",
    term: "Ritardando",
    category: "Tempo",
    aliases: ["rit."],
    definition:
      "A marking that tells you to gradually slow down. It often appears near the end of a phrase or piece.",
    analogy:
      "Imagine coasting to a stop on a bicycle, easing off smoothly instead of slamming the brakes. It's the opposite of accelerando.",
  },

  // --- S ---
  {
    id: "scale",
    term: "Scale",
    category: "Music Theory",
    definition:
      "A series of notes arranged in order, going up or down, following a set pattern of whole steps and half steps. The C major scale uses only white keys from C to the next C.",
    analogy:
      "A scale is a staircase for your fingers, and it's also the alphabet a piece of music is written in. Learn the scale and you know which notes belong in that key.",
  },
  {
    id: "sharp",
    term: "Sharp",
    category: "Notation",
    aliases: ["♯"],
    definition:
      "A symbol (♯) that raises a note by one half step, moving to the very next key on the right. It's often, but not always, a black key.",
    analogy:
      "Think of an arrow pointing up. A sharp pushes the pitch higher.",
  },
  {
    id: "sight-reading",
    term: "Sight-Reading",
    category: "Technique",
    definition:
      "Playing a piece of music from the page the first time you see it, with no practice beforehand.",
    analogy:
      "It's like reading a new book aloud for the very first time. Keep going even if you stumble, and train your eyes to glance ahead so you always know what's coming.",
  },
  {
    id: "slur",
    term: "Slur",
    category: "Notation",
    definition:
      "A curved line over or under a group of notes with different pitches, telling you to play them smoothly as one legato phrase.",
    analogy:
      "A slur is a phrase said in a single breath. Don't confuse it with a tie, which connects two notes of the same pitch.",
  },
  {
    id: "soft-pedal",
    term: "Soft Pedal (Una Corda)",
    category: "Piano Anatomy",
    aliases: ["Una Corda", "Left Pedal"],
    definition:
      "The left-hand pedal, which makes the piano sound softer and slightly more mellow. On a grand piano, it shifts the action slightly so the hammers strike fewer strings.",
    analogy:
      "It's like draping a soft cloth over a speaker. The sound becomes warmer and more velvety, not just quieter.",
  },
  {
    id: "sostenuto-pedal",
    term: "Sostenuto Pedal",
    category: "Piano Anatomy",
    aliases: ["Middle Pedal"],
    definition:
      "The middle pedal on many grand pianos. It sustains only the notes whose keys are already held down when you press it, while notes played afterward are not sustained. On many upright pianos, the middle pedal does something different, such as muting the sound for quiet practice.",
    analogy:
      "Think of it as a selective freeze-frame. It holds some notes in place while the rest of the music keeps moving.",
  },
  {
    id: "staccato",
    term: "Staccato",
    category: "Technique",
    definition:
      'An Italian word meaning "detached." It tells you to play notes short and separated, and it\'s usually marked with a small dot above or below the note.',
    analogy:
      "Touch each key as if it were a hot stove: press and lift quickly. It's the opposite of legato.",
    translations: {
      de: {
        localizedName: "Stakkato / Abgesetzt (Staccato)",
        categoryLabel: "Spieltechnik",
        definition:
          "Kurz und getrennt gespielte Töne, gekennzeichnet durch einen kleinen Punkt über oder unter dem Notenkopf.",
        analogy:
          "Berühren Sie die Tasten wie eine heiße Herdplatte: Präziser Anschlag und sofortiges Zurückfedern.",
      },
      es: {
        localizedName: "Estacato (Staccato)",
        categoryLabel: "Técnica",
        definition:
          'Término italiano que significa "separado". Indica que las notas deben tocarse cortas y desprendidas unas de otras.',
        analogy:
          "Toca cada tecla como si fuera una plancha caliente: pulsa con vivacidad y retira el dedo de inmediato.",
      },
      fr: {
        localizedName: "Piqué / Détaché (Staccato)",
        categoryLabel: "Technique",
        definition:
          "Manière d'exécuter les notes de façon brève, détachée et bien séparée, marquée par un point au-dessus ou en dessous.",
        analogy:
          "Touchez chaque note comme un objet brûlant : un rebond vif et léger de la pulpe du doigt.",
      },
      hi: {
        localizedName: "स्टैकाटो / विलगित स्वर (Staccato)",
        categoryLabel: "तकनीक (Technique)",
        definition:
          "स्वरों को छोटा, अलग-थलग और झटके से बजाना। नोट के ऊपर या नीचे एक बिंदु द्वारा दर्शाया जाता है।",
        analogy:
          "कुंजी को ऐसे छुएं जैसे वह कोई गर्म सतह हो: दबाएं और तुरंत उंगली उठा लें। यह लेगाटो का विपरीत है।",
      },
      ar: {
        localizedName: "ستاكاتو / العزف المتقطع (Staccato)",
        categoryLabel: "تقنية العزف (Technique)",
        definition:
          "مصطلح إيطالي يعني النقر المنفصل القصير؛ يعزف الصوت مقتضباً وسريع الرفع، ويرمز له بنقطة أعلى أو أسفل النغمة.",
        analogy:
          "المس كل مفتاح كما لو كان ساخناً: انقر وارتد فوراً بخفة وسرعة، وهو نقيض العزف المتصل (ليغاتو).",
      },
    },
  },
  {
    id: "staff",
    term: "Staff",
    category: "Notation",
    aliases: ["Stave", "Staves"],
    definition:
      "The set of five horizontal lines (and the four spaces between them) on which music is written. The higher a note sits on the staff, the higher it sounds.",
    analogy:
      "The staff is lined paper for music. Just as handwriting sits on the lines, notes sit on lines and spaces, and their height tells you the pitch.",
  },
  {
    id: "sustaining-pedal",
    term: "Sustaining Pedal",
    category: "Piano Anatomy",
    aliases: ["Sustain Pedal"],
    definition:
      "Another name for the damper pedal, the right-hand pedal that lets notes keep ringing after you lift your fingers.",
    analogy:
      "The name says it all: it sustains. Notes keep floating in the air like a soap bubble that hasn't popped yet.",
  },

  // --- T ---
  {
    id: "tempo",
    term: "Tempo",
    category: "Tempo",
    definition:
      "The speed of the music, or how fast the beat moves. It's often described with Italian words like allegro or adagio, or with beats per minute (BPM).",
    analogy:
      "Tempo is the pace of your walk, whether a slow amble or a brisk march. A metronome can help you find and keep it.",
  },
  {
    id: "tie",
    term: "Tie",
    category: "Notation",
    definition:
      "A curved line connecting two notes of the same pitch. You play the first note and hold it for the combined length of both.",
    analogy:
      'Picture two train cars coupled together into one long car. You only "press" once, but the sound lasts for both.',
  },
  {
    id: "time-signature",
    term: "Time Signature",
    category: "Notation",
    definition:
      "Two stacked numbers at the start of a piece. The top number tells you how many beats are in each measure, and the bottom number tells you which type of note gets one beat.",
    analogy:
      "Think of a recipe: the top number is how many cups, and the bottom number is the size of the cup. In 4/4, you have four quarter-note beats in every measure.",
  },
  {
    id: "treble-clef",
    term: "Treble Clef",
    category: "Notation",
    aliases: ["G Clef"],
    definition:
      "A clef used for higher notes, usually played by the right hand. Its spiral curls around the G line, which is why it's also called the G clef.",
    analogy:
      "Think of it as the upstairs floor of the music, where the brighter, higher sounds live.",
  },
  {
    id: "triad",
    term: "Triad",
    category: "Music Theory",
    definition:
      "The most basic type of chord, made of three notes: a root, a third above it, and a fifth above it. Major, minor, diminished, and augmented triads are the most common types.",
    analogy:
      "Imagine three stacked blocks with one key skipped between each: for example, C, E, and G. Once you can build a triad on any note, you've unlocked the foundation of most songs.",
  },

  // --- U ---
  {
    id: "una-corda",
    term: "Una Corda",
    category: "Piano Anatomy",
    aliases: ["Soft Pedal"],
    definition:
      'An Italian term meaning "one string." It refers to the soft pedal, because on early pianos it made the hammers strike just one string per note. The marking "tre corde" ("three strings") tells you to release the pedal.',
    analogy:
      'When you see una corda in the score, think "softer, with a gentler color." It changes the tone as well as the volume.',
    translations: {
      de: {
        localizedName: "Verschiebungspedal / Eine Saite (Una Corda)",
        categoryLabel: "Klavieranatomie",
        definition:
          'Italienisch für „eine Saite". Bezeichnet das linke Leisepedal, da bei historischen Hammerklavieren der Hammer nur eine statt aller Saiten anschlug. „Tre corde" hebt diese Spielweise wieder auf.',
        analogy:
          "Wenn Sie 'una corda' in den Noten sehen, denken Sie an eine sanfte, intime Klangfarbe. Es dämpft nicht nur die Lautstärke, sondern verändert den Charakter.",
      },
      es: {
        localizedName: "Una cuerda / Pedal celeste (Una Corda)",
        categoryLabel: "Anatomía del Piano",
        definition:
          'Término italiano que significa "una cuerda". Se refiere al pedal izquierdo, pues en los primeros pianos desplazaba el mecanismo para que el macillo golpeara una sola cuerda.',
        analogy:
          "Cuando veas una corda, busca un color aterciopelado e íntimo. Cambia tanto el timbre como el volumen del piano.",
      },
      fr: {
        localizedName: "Pédale douce / Une corde (Una Corda)",
        categoryLabel: "Anatomie du piano",
        definition:
          'Terme italien signifiant « une corde ». Désigne la pédale de gauche décalant le clavier pour adoucir le timbre. La mention « tre corde » indique son relâchement.',
        analogy:
          "Une couleur feutrée et mystérieuse. Plus qu'une baisse de volume, c'est une métamorphose du timbre sonore.",
      },
      hi: {
        localizedName: "उना कोर्डा / कोमल पेडल (Una Corda)",
        categoryLabel: "पियानो की बनावट (Piano Anatomy)",
        definition:
          'एक इतालवी शब्द जिसका अर्थ है "एक तार"। यह बाएँ पेडल को दर्शाता है जो ध्वनि को अत्यंत कोमल और रेशमी बना देता है।',
        analogy:
          "जब आप स्कोर में 'una corda' देखें, तो एक मखमली, शांत माहौल की कल्पना करें। यह केवल आवाज़ धीमी नहीं करता, बल्कि सुर का रंग भी बदल देता है।",
      },
      ar: {
        localizedName: "أونا كوردا / الدواسة الخافتة (Una Corda)",
        categoryLabel: "أجزاء البيانو (Piano Anatomy)",
        definition:
          'مصطلح إيطالي يعني "وتراً واحداً". يشير إلى الدواسة اليسرى التي تُزحزح المطارق لتضرب وتراً واحداً، مما يضفي صوتاً دافئاً مخملياً.',
        analogy:
          "حين ترى 'una corda' في النوتة، استشعر لوناً ناعماً هادئاً كالحرير. تغير الدواسة من طابع النغمة وليس مستوى الصوت فحسب.",
      },
    },
  },
  {
    id: "upright-piano",
    term: "Upright Piano",
    category: "Piano Anatomy",
    aliases: ["Vertical Piano"],
    definition:
      "A piano whose strings and soundboard are arranged vertically, so it stands against a wall and takes up much less room than a grand piano. It's the most common type of acoustic piano in homes and schools.",
    analogy:
      "Imagine a grand piano stood on its end to save floor space. It's compact, practical, and perfect for daily practice.",
  },

  // --- W ---
  {
    id: "white-keys",
    term: "White Keys",
    category: "Piano Anatomy",
    aliases: ["Natural Keys"],
    definition:
      "The longer, lower keys on the piano that play the seven natural notes: A, B, C, D, E, F, and G. That pattern repeats across the entire keyboard.",
    analogy:
      "The white keys are a short alphabet that starts over every seven letters. Learn A through G once, and you can find them everywhere.",
  },
  {
    id: "whole-step",
    term: "Whole Step",
    category: "Music Theory",
    aliases: ["Whole Tone"],
    definition:
      "A distance of two half steps: you skip exactly one key in between. C to D is a whole step because C♯ sits between them.",
    analogy:
      "Think of taking two stair steps at once. Scales are built from a specific pattern of these long and short steps.",
  },
];

/**
 * Returns a dictionary of terms grouped by initial letter (A-Z).
 */
export function getTermsByLetter(terms: GlossaryTerm[] = GLOSSARY_TERMS): Record<string, GlossaryTerm[]> {
  const grouped: Record<string, GlossaryTerm[]> = {};
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    grouped[letter] = [];
  }
  for (const term of terms) {
    const firstLetter = term.term.trim().charAt(0).toUpperCase();
    if (grouped[firstLetter]) {
      grouped[firstLetter].push(term);
    } else {
      grouped[firstLetter] = [term];
    }
  }
  return grouped;
}
