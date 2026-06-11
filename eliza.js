'use strict';

const http = require('http');

const DEFAULT_PORT = Number(process.env.PORT) || 1337;
const DEFAULT_HOST = process.env.HOST || '127.0.0.1';

const doctorScript = {
  initial: 'How do you do. Please tell me your problem.',
  final: 'Goodbye. It was nice talking to you.',
  quits: ['bye', 'goodbye', 'done', 'exit', 'quit'],
  pres: {
    dont: "don't",
    cant: "can't",
    wont: "won't",
    recollect: 'remember',
    recall: 'remember',
    dreamt: 'dreamed',
    dreams: 'dream',
    maybe: 'perhaps',
    certainly: 'yes',
    machine: 'computer',
    machines: 'computer',
    computers: 'computer',
    were: 'was',
    "you're": 'you are',
    youre: 'you are',
    "i'm": 'i am',
    im: 'i am',
    same: 'alike',
    identical: 'alike',
    equivalent: 'alike'
  },
  posts: {
    am: 'are',
    are: 'am',
    was: 'were',
    were: 'was',
    me: 'you',
    myself: 'yourself',
    yourself: 'myself',
    i: 'you',
    you: 'I',
    my: 'your',
    your: 'my',
    "i'm": 'you are'
  },
  synonyms: {
    be: ['am', 'is', 'are', 'was', 'were'],
    belief: ['feel', 'think', 'believe', 'wish'],
    cannot: ["can't", 'cannot'],
    desire: ['want', 'need'],
    everyone: ['everyone', 'everybody', 'nobody', 'noone'],
    family: ['mother', 'mom', 'father', 'dad', 'sister', 'brother', 'wife', 'children', 'child'],
    happy: ['elated', 'glad', 'better'],
    sad: ['unhappy', 'depressed', 'sick', 'sad']
  },
  postTransforms: [
    [/ old old/g, ' old'],
    [/\bthey were( not)? me\b/g, 'it was$1 me'],
    [/\bthey are( not)? me\b/g, 'it is$1 me'],
    [/\bAre they( always)? me\b/, 'It is$1 me'],
    [/\bthat your( own)? (\w+)( now)?\?/i, 'that you have your$1 $2?'],
    [/\bI to have (\w+)/, 'I have $1'],
    [/Earlier you said your( own)? (\w+)( now)?\./, 'Earlier you talked about your $2.']
  ],
  keywords: [
    keyword('xnone', 0, [
      decomp('*', [
        "I'm not sure I understand you fully.",
        'Please go on.',
        'What does that suggest to you?',
        'Do you feel strongly about discussing such things?',
        'That is interesting. Please continue.',
        'Tell me more about that.',
        'Does talking about this bother you?'
      ])
    ]),
    keyword('sorry', 0, [
      decomp('*', [
        "Please don't apologise.",
        'Apologies are not necessary.',
        "I've told you that apologies are not required.",
        'It did not bother me. Please continue.'
      ])
    ]),
    keyword('apologise', 0, [
      decomp('*', ['goto sorry'])
    ]),
    keyword('apologize', 0, [
      decomp('*', ['goto sorry'])
    ]),
    keyword('remember', 5, [
      decomp('* i remember *', [
        'Do you often think of (2)?',
        'Does thinking of (2) bring anything else to mind?',
        'What else do you recollect?',
        'Why do you remember (2) just now?',
        'What in the present situation reminds you of (2)?',
        'What is the connection between me and (2)?',
        'What else does (2) remind you of?'
      ]),
      decomp('* do you remember *', [
        'Did you think I would forget (2)?',
        'Why do you think I should recall (2) now?',
        'What about (2)?',
        'goto what',
        'You mentioned (2)?'
      ]),
      decomp('* you remember *', [
        'How could I forget (2)?',
        'What about (2) should I remember?',
        'goto you'
      ])
    ]),
    keyword('forget', 5, [
      decomp('* i forget *', [
        'Can you think of why you might forget (2)?',
        "Why can't you remember (2)?",
        'How often do you think of (2)?',
        'Does it bother you to forget that?',
        'Could it be a mental block?',
        'Are you generally forgetful?',
        'Do you think you are suppressing (2)?'
      ]),
      decomp('* did you forget *', [
        'Why do you ask?',
        'Are you sure you told me?',
        'Would it bother you if I forgot (2)?',
        'Why should I recall (2) just now?',
        'goto what',
        'Tell me more about (2).'
      ])
    ]),
    keyword('if', 3, [
      decomp('* if *', [
        "Do you think it's likely that (2)?",
        'Do you wish that (2)?',
        'What do you know about (2)?',
        'Really, if (2)?',
        'What would you do if (2)?',
        'But what are the chances that (2)?',
        'What does this speculation lead to?'
      ])
    ]),
    keyword('dreamed', 4, [
      decomp('* i dreamed *', [
        'Really, (2)?',
        'Have you ever fantasized (2) while you were awake?',
        'Have you ever dreamed (2) before?',
        'goto dream'
      ])
    ]),
    keyword('dream', 3, [
      decomp('*', [
        'What does that dream suggest to you?',
        'Do you dream often?',
        'What persons appear in your dreams?',
        'Do you believe that dreams have something to do with your problem?'
      ])
    ]),
    keyword('perhaps', 0, [
      decomp('*', [
        "You don't seem quite certain.",
        'Why the uncertain tone?',
        "Can't you be more positive?",
        "You aren't sure?",
        "Don't you know?",
        'How likely, would you estimate?'
      ])
    ]),
    keyword('name', 15, [
      decomp('*', [
        'I am not interested in names.',
        "I've told you before, I don't care about names. Please continue."
      ])
    ]),
    keyword('deutsch', 0, [
      decomp('*', ['goto xforeign', "I told you before, I don't understand German."])
    ]),
    keyword('francais', 0, [
      decomp('*', ['goto xforeign', "I told you before, I don't understand French."])
    ]),
    keyword('italiano', 0, [
      decomp('*', ['goto xforeign', "I told you before, I don't understand Italian."])
    ]),
    keyword('espanol', 0, [
      decomp('*', ['goto xforeign', "I told you before, I don't understand Spanish."])
    ]),
    keyword('xforeign', 0, [
      decomp('*', ['I speak only English.'])
    ]),
    keyword('hello', 0, [
      decomp('*', [
        'How do you do. Please state your problem.',
        'Hi. What seems to be your problem?'
      ])
    ]),
    keyword('computer', 50, [
      decomp('*', [
        'Do computers worry you?',
        'Why do you mention computers?',
        'What do you think machines have to do with your problem?',
        "Don't you think computers can help people?",
        'What about machines worries you?',
        'What do you think about machines?',
        "You don't think I am a computer program, do you?"
      ])
    ]),
    keyword('am', 0, [
      decomp('* am i *', [
        'Do you believe you are (2)?',
        'Would you want to be (2)?',
        'Do you wish I would tell you you are (2)?',
        'What would it mean if you were (2)?',
        'goto what'
      ]),
      decomp('* i am *', ['goto i']),
      decomp('*', [
        "Why do you say 'am'?",
        "I don't understand that."
      ])
    ]),
    keyword('are', 0, [
      decomp('* are you *', [
        'Why are you interested in whether I am (2) or not?',
        "Would you prefer if I weren't (2)?",
        'Perhaps I am (2) in your fantasies.',
        'Do you sometimes think I am (2)?',
        'goto what',
        'Would it matter to you?',
        'What if I were (2)?'
      ]),
      decomp('* you are *', ['goto you']),
      decomp('* are *', [
        'Did you think they might not be (2)?',
        'Would you like it if they were not (2)?',
        'What if they were not (2)?',
        'Are they always (2)?',
        'Possibly they are (2).',
        'Are you positive they are (2)?'
      ])
    ]),
    keyword('your', 0, [
      decomp('* your *', [
        'Why are you concerned over my (2)?',
        'What about your own (2)?',
        "Are you worried about someone else's (2)?",
        'Really, my (2)?',
        'What makes you think of my (2)?',
        'Do you want my (2)?'
      ])
    ]),
    keyword('was', 2, [
      decomp('* was i *', [
        'What if you were (2)?',
        'Do you think you were (2)?',
        'Were you (2)?',
        'What would it mean if you were (2)?',
        "What does '(2)' suggest to you?",
        'goto what'
      ]),
      decomp('* i was *', [
        'Were you really?',
        'Why do you tell me you were (2) now?',
        'Perhaps I already know you were (2).'
      ]),
      decomp('* was you *', [
        'Would you like to believe I was (2)?',
        'What suggests that I was (2)?',
        'What do you think?',
        'Perhaps I was (2).',
        'What if I had been (2)?'
      ])
    ]),
    keyword('i', 0, [
      decomp('* i @desire *', [
        'What would it mean to you if you got (3)?',
        'Why do you want (3)?',
        'Suppose you got (3) soon.',
        'What if you never got (3)?',
        'What would getting (3) mean to you?',
        'What does wanting (3) have to do with this discussion?'
      ]),
      decomp('* i am* @sad *', [
        'I am sorry to hear that you are (3).',
        'Do you think coming here will help you not to be (3)?',
        "I'm sure it's not pleasant to be (3).",
        'Can you explain what made you (3)?'
      ]),
      decomp('* i am* @happy *', [
        'How have I helped you to be (3)?',
        'Has your treatment made you (3)?',
        'What makes you (3) just now?',
        'Can you explain why you are suddenly (3)?'
      ]),
      decomp('* i was *', ['goto was']),
      decomp('* i @belief i *', [
        'Do you really think so?',
        'But you are not sure you (3).',
        'Do you really doubt you (3)?'
      ]),
      decomp('* i* @belief *you *', ['goto you']),
      decomp('* i am *', [
        'Is it because you are (2) that you came to me?',
        'How long have you been (2)?',
        'Do you believe it is normal to be (2)?',
        'Do you enjoy being (2)?',
        'Do you know anyone else who is (2)?'
      ]),
      decomp('* i @cannot *', [
        "How do you know that you can't (3)?",
        'Have you tried?',
        'Perhaps you could (3) now.',
        'Do you really want to be able to (3)?',
        'What if you could (3)?'
      ]),
      decomp("* i don't *", [
        "Don't you really (2)?",
        "Why don't you (2)?",
        'Do you wish to be able to (2)?',
        'Does that trouble you?'
      ]),
      decomp('* i feel *', [
        'Tell me more about such feelings.',
        'Do you often feel (2)?',
        'Do you enjoy feeling (2)?',
        'Of what does feeling (2) remind you?'
      ]),
      decomp('* i * you *', [
        'Perhaps in your fantasies we (2) each other.',
        'Do you wish to (2) me?',
        'You seem to need to (2) me.',
        'Do you (2) anyone else?'
      ]),
      decomp('*', [
        'You say (1)?',
        'Can you elaborate on that?',
        'Do you say (1) for some special reason?',
        "That's quite interesting."
      ])
    ]),
    keyword('you', 0, [
      decomp('* you remind me of *', ['goto alike']),
      decomp('* you are *', [
        'What makes you think I am (2)?',
        'Does it please you to believe I am (2)?',
        'Do you sometimes wish you were (2)?',
        'Perhaps you would like to be (2).'
      ]),
      decomp('* you* me *', [
        'Why do you think I (2) you?',
        "You like to think I (2) you, don't you?",
        'What makes you think I (2) you?',
        'Really, I (2) you?',
        'Do you wish to believe I (2) you?',
        'Suppose I did (2) you, what would that mean?',
        'Does someone else believe I (2) you?'
      ]),
      decomp('* you *', [
        'We were discussing you, not me.',
        'Oh, I (2)?',
        "You're not really talking about me, are you?",
        'What are your feelings now?'
      ])
    ]),
    keyword('yes', 0, [
      decomp('*', [
        'You seem to be quite positive.',
        'You are sure.',
        'I see.',
        'I understand.'
      ])
    ]),
    keyword('no', 0, [
      decomp('* no one *', [
        'Are you sure, no one (2)?',
        'Surely someone (2).',
        'Can you think of anyone at all?',
        'Are you thinking of a very special person?',
        'Who, may I ask?',
        "You have a particular person in mind, don't you?",
        'Who do you think you are talking about?'
      ]),
      decomp('*', [
        'Are you saying no just to be negative?',
        'You are being a bit negative.',
        'Why not?',
        "Why 'no'?"
      ])
    ]),
    keyword('my', 2, [
      decomp('* my *', [
        'Does that have anything to do with the fact that your (2)?',
        'Lets discuss further why your (2).',
        'Earlier you said your (2).',
        'But your (2).'
      ], true),
      decomp('* my* @family *', [
        'Tell me more about your family.',
        'Who else in your family (4)?',
        'Your (3)?',
        'What else comes to your mind when you think of your (3)?'
      ]),
      decomp('* my *', [
        'Your (2)?',
        'Why do you say your (2)?',
        'Does that suggest anything else which belongs to you?',
        'Is it important to you that your (2)?'
      ])
    ]),
    keyword('can', 0, [
      decomp('* can you *', [
        'You believe I can (2), do you not?',
        'goto what',
        'You want me to be able to (2).',
        'Perhaps you would like to be able to (2) yourself.'
      ]),
      decomp('* can i *', [
        'Whether or not you can (2) depends on you more than on me.',
        'Do you want to be able to (2)?',
        "Perhaps you don't want to (2).",
        'goto what'
      ])
    ]),
    keyword('what', 0, [
      decomp('*', [
        'Why do you ask?',
        'Does that question interest you?',
        'What is it you really want to know?',
        'Are such questions much on your mind?',
        'What answer would please you most?',
        'What do you think?',
        'What comes to mind when you ask that?',
        'Have you asked such questions before?',
        'Have you asked anyone else?'
      ])
    ]),
    keyword('who', 0, [
      decomp('who *', ['goto what'])
    ]),
    keyword('when', 0, [
      decomp('when *', ['goto what'])
    ]),
    keyword('where', 0, [
      decomp('where *', ['goto what'])
    ]),
    keyword('how', 0, [
      decomp('how *', ['goto what'])
    ]),
    keyword('because', 0, [
      decomp('*', [
        'Is that the real reason?',
        "Don't any other reasons come to mind?",
        'Does that reason seem to explain anything else?',
        'What other reasons might there be?'
      ])
    ]),
    keyword('why', 0, [
      decomp("* why don't you *", [
        "Do you believe I don't (2)?",
        'Perhaps I will (2) in good time.',
        'Should you (2) yourself?',
        'You want me to (2)?',
        'goto what'
      ]),
      decomp("* why can't i *", [
        'Do you think you should be able to (2)?',
        'Do you want to be able to (2)?',
        'Do you believe this will help you to (2)?',
        "Have you any idea why you can't (2)?",
        'goto what'
      ]),
      decomp('*', ['goto what'])
    ]),
    keyword('everyone', 2, [
      decomp('* @everyone *', [
        'Really, (2)?',
        'Surely not (2).',
        'Can you think of anyone in particular?',
        'Who, for example?',
        'Are you thinking of a very special person?',
        'Who, may I ask?',
        'Someone special perhaps?',
        "You have a particular person in mind, don't you?",
        "Who do you think you're talking about?"
      ])
    ]),
    keyword('everybody', 2, [
      decomp('*', ['goto everyone'])
    ]),
    keyword('nobody', 2, [
      decomp('*', ['goto everyone'])
    ]),
    keyword('noone', 2, [
      decomp('*', ['goto everyone'])
    ]),
    keyword('always', 1, [
      decomp('*', [
        'Can you think of a specific example?',
        'When?',
        'What incident are you thinking of?',
        'Really, always?'
      ])
    ]),
    keyword('alike', 10, [
      decomp('*', [
        'In what way?',
        'What resemblance do you see?',
        'What does that similarity suggest to you?',
        'What other connections do you see?',
        'What do you suppose that resemblance means?',
        'What is the connection, do you suppose?',
        'Could there really be some connection?',
        'How?'
      ])
    ]),
    keyword('like', 10, [
      decomp('* @be *like *', ['goto alike'])
    ]),
    keyword('different', 0, [
      decomp('*', [
        'How is it different?',
        'What differences do you see?',
        'What does that difference suggest to you?',
        'What other distinctions do you see?',
        'What do you suppose that disparity means?',
        'Could there be some connection, do you suppose?',
        'How?'
      ])
    ])
  ]
};

class ElizaBot {
  constructor(script = doctorScript) {
    this.script = compileScript(script);
    this.memSize = 20;
    this.reset();
  }

  reset() {
    this.quit = false;
    this.limit = 1;
    this.memory = [];
    this.reassemblyCursor = new Map();
  }

  getInitial() {
    return this.script.initial;
  }

  getFinal() {
    return this.script.final;
  }

  transform(input) {
    const original = String(input || '').trim();

    if (!original) {
      return this.getInitial();
    }

    this.quit = false;
    this.advanceLimit();

    const sentences = this.toSentences(original);

    for (const sentence of sentences) {
      if (this.isQuit(sentence)) {
        this.quit = true;
        return this.getFinal();
      }

      const prepared = this.replaceWords(sentence, this.script.pres, this.script.preRegex);
      const response = this.respondToSentence(prepared);

      if (response) {
        return response;
      }
    }

    return this.recallMemory() || this.runKeyword('xnone', ' ') || 'Please continue.';
  }

  advanceLimit() {
    this.limit += 1;

    if (this.limit > 4) {
      this.limit = 1;
    }
  }

  toSentences(input) {
    const normalized = input
      .toLowerCase()
      .replace(/[^a-z0-9'.,?!;\-\s]/g, ' ')
      .replace(/\s+-+\s+/g, '.')
      .replace(/\s*\bbut\b\s*/g, '.')
      .replace(/\s*[.,?!;]+\s*/g, '.')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return normalized
      .split('.')
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  }

  isQuit(sentence) {
    return this.script.quits.has(sentence);
  }

  respondToSentence(sentence) {
    const candidates = this.keywordCandidates(sentence);

    for (const candidate of candidates) {
      const response = this.runRule(candidate, sentence);

      if (response) {
        return response;
      }
    }

    return '';
  }

  keywordCandidates(sentence) {
    const words = sentence.match(/[a-z0-9']+/g) || [];
    const seen = new Set();
    const candidates = [];

    for (const word of words) {
      const candidate = this.script.keywordMap.get(word);

      if (candidate && !seen.has(candidate.key)) {
        candidates.push(candidate);
        seen.add(candidate.key);
      }
    }

    candidates.sort((left, right) => {
      if (left.rank !== right.rank) {
        return right.rank - left.rank;
      }

      return left.order - right.order;
    });

    return candidates;
  }

  runKeyword(key, sentence, depth = 0) {
    const rule = this.script.keywordMap.get(key);
    return rule ? this.runRule(rule, sentence, depth) : '';
  }

  runRule(rule, sentence, depth = 0) {
    if (depth > 10) {
      return '';
    }

    for (const decompRule of rule.decomps) {
      const match = sentence.match(decompRule.regex);

      if (!match) {
        continue;
      }

      const template = decompRule.memory
        ? this.memoryReassembly(decompRule, sentence)
        : this.nextReassembly(rule.key, decompRule);

      if (/^goto\s+/i.test(template)) {
        return this.runKeyword(template.slice(5).trim().toLowerCase(), sentence, depth + 1);
      }

      const response = this.reassemble(template, match);

      if (decompRule.memory) {
        this.saveMemory(response);
      } else {
        return response;
      }
    }

    return '';
  }

  nextReassembly(keywordKey, decompRule) {
    const cursorKey = `${keywordKey}:${decompRule.index}`;
    const current = this.reassemblyCursor.get(cursorKey) || 0;
    const next = (current + 1) % decompRule.reassemblies.length;
    this.reassemblyCursor.set(cursorKey, next);
    return decompRule.reassemblies[current];
  }

  memoryReassembly(decompRule, sentence) {
    const words = sentence.match(/[a-z0-9']+/g) || [''];
    const index = hashWord(words[words.length - 1]) % decompRule.reassemblies.length;
    return decompRule.reassemblies[index];
  }

  reassemble(template, match) {
    const substituted = template.replace(/\(([0-9]+)\)/g, (_placeholder, groupNumber) => {
      const value = match[Number(groupNumber)] || '';
      return this.reflect(value);
    });

    return this.cleanOutput(substituted);
  }

  reflect(value) {
    const reflected = this.replaceWords(
      normalizeSpace(value.toLowerCase()),
      this.script.posts,
      this.script.postRegex
    );

    return normalizeSpace(reflected);
  }

  replaceWords(text, replacements, regex) {
    if (!regex) {
      return text;
    }

    return text.replace(regex, (whole, prefix, word) => {
      const normalizedWord = normalizeSpace(word.toLowerCase());
      return prefix + (replacements.get(normalizedWord) || word);
    });
  }

  cleanOutput(output) {
    let cleaned = normalizeSpace(output)
      .replace(/\s+([?.!,])/g, '$1')
      .replace(/\bi\b/g, 'I');

    for (const [regex, replacement] of this.script.postTransforms) {
      cleaned = cleaned.replace(regex, replacement);
    }

    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  saveMemory(response) {
    this.memory.push(response);

    if (this.memory.length > this.memSize) {
      this.memory.shift();
    }
  }

  recallMemory() {
    if (this.limit === 4 && this.memory.length > 0) {
      return this.memory.shift();
    }

    return '';
  }
}

function compileScript(script) {
  const compiled = {
    initial: script.initial,
    final: script.final,
    quits: new Set(script.quits),
    pres: new Map(Object.entries(script.pres)),
    posts: new Map(Object.entries(script.posts)),
    synonyms: script.synonyms,
    postTransforms: script.postTransforms,
    keywordMap: new Map()
  };

  compiled.preRegex = replacementRegex(compiled.pres.keys());
  compiled.postRegex = replacementRegex(compiled.posts.keys());

  script.keywords.forEach((rule, order) => {
    compiled.keywordMap.set(rule.key, {
      key: rule.key,
      rank: rule.rank,
      order,
      decomps: rule.decomps.map((decompRule, index) => ({
        index,
        memory: decompRule.memory,
        reassemblies: decompRule.reassemblies,
        regex: decompositionRegex(decompRule.pattern, script.synonyms)
      }))
    });
  });

  return compiled;
}

function keyword(key, rank, decomps) {
  return { key, rank, decomps };
}

function decomp(pattern, reassemblies, memory = false) {
  return { pattern, reassemblies, memory };
}

function decompositionRegex(pattern, synonyms) {
  const tokens = pattern
    .replace(/\*/g, ' * ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const parts = tokens.map((token) => {
    if (token === '*') {
      return '(.*)';
    }

    if (token.charAt(0) === '@') {
      const name = token.slice(1);
      const options = [name].concat(synonyms[name] || []);
      return `\\b(${options.map(escapeRegex).join('|')})\\b`;
    }

    return `\\b${escapeRegex(token)}\\b`;
  });

  return new RegExp(`^\\s*${parts.join('\\s*')}\\s*$`, 'i');
}

function replacementRegex(keys) {
  const alternatives = Array.from(keys)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegex)
    .map((key) => key.replace(/ /g, '\\s+'));

  if (alternatives.length === 0) {
    return null;
  }

  return new RegExp(`(^|[^a-z0-9'])(${alternatives.join('|')})(?=$|[^a-z0-9'])`, 'g');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSpace(value) {
  return String(value).replace(/\s{2,}/g, ' ').trim();
}

function hashWord(word) {
  return String(word).split('').reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  }, 0);
}

function createServer(bot = new ElizaBot()) {
  return http.createServer((req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (requestUrl.pathname === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (requestUrl.pathname === '/reset') {
      bot.reset();
      writeText(res, bot.getInitial());
      return;
    }

    const message = readMessage(requestUrl);
    const reply = message ? bot.transform(message) : bot.getInitial();

    writeText(res, reply);

    if (bot.quit) {
      bot.reset();
    }
  });
}

function readMessage(requestUrl) {
  const queryMessage = requestUrl.searchParams.get('q');

  if (queryMessage) {
    return queryMessage;
  }

  const pathMessage = requestUrl.pathname.slice(1);
  return pathMessage ? decodeURIComponent(pathMessage) : '';
}

function writeText(res, body) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

if (require.main === module) {
  createServer().listen(DEFAULT_PORT, DEFAULT_HOST, () => {
    console.log(`ELIZA is listening at http://${DEFAULT_HOST}:${DEFAULT_PORT}/`);
  });
}

module.exports = {
  ElizaBot,
  createServer,
  doctorScript
};
