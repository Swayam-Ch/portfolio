// Catch the AI: Claude Haiku 4.5's real answers from my Escalator benchmark (no tools), against code
// that runs right here in your browser. Each game picks 5 of these at random.
const ROUNDS = [
  {
    question: "What is 48,917 multiplied by 7,382?",
    ai: "361,055,594",
    code: "return (48917n * 7382n).toLocaleString('en-US');",
    note: "BigInt multiplies exactly, however big the numbers get.",
  },
  {
    question: "What is 2 to the power 100, modulo 97?",
    ai: "16",
    code: "return String((2n ** 100n) % 97n);",
    note: "Raise to the power exactly, then take the remainder.",
  },
  {
    question: "I invest $500 at the end of every month for 20 years at 7% a year, compounded monthly. What is the final balance?",
    ai: "$240,984.20",
    code: "const r = 0.07 / 12, n = 20 * 12;\nconst fv = 500 * ((1 + r) ** n - 1) / r;\nreturn '$' + fv.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});",
    note: "The future value of an annuity, one formula.",
  },
  {
    question: "How many months in 2027 and 2028 have a Friday the 13th?",
    ai: "3",
    code: "let count = 0;\nfor (const year of [2027, 2028])\n  for (let month = 0; month < 12; month++)\n    if (new Date(year, month, 13).getDay() === 5) count++;\nreturn String(count);",
    note: "Just check all 24 months.",
  },
  {
    question: "How many prime numbers are there below 10,000?",
    ai: "1,229",
    code: "const n = 10000, prime = new Array(n).fill(true);\nprime[0] = prime[1] = false;\nfor (let i = 2; i * i < n; i++)\n  if (prime[i]) for (let j = i * i; j < n; j += i) prime[j] = false;\nreturn prime.filter(Boolean).length.toLocaleString('en-US');",
    note: "The sieve of Eratosthenes.",
  },
  {
    question: "What does this Python program print?\nprint(sum(i*i for i in range(1, 101) if i % 3 == 0))",
    ai: "166,650",
    code: "let total = 0;\nfor (let i = 1; i <= 100; i++) if (i % 3 === 0) total += i * i;\nreturn total.toLocaleString('en-US');",
    note: "The same loop, written in JavaScript.",
  },
  {
    question: "How many times does the letter e appear (upper or lower case) in: \"Every elephant entered the eerie, empty theatre, eventually exhausted.\"",
    ai: "20",
    code: "const s = 'Every elephant entered the eerie, empty theatre, eventually exhausted.';\nreturn String([...s.toLowerCase()].filter(c => c === 'e').length);",
    note: "Counting letters is surprisingly hard for a language model.",
  },
  {
    question: "What is the 60th Fibonacci number, if F(1) = 1 and F(2) = 1?",
    ai: "1,548,008,755,920",
    code: "let a = 1n, b = 1n;\nfor (let i = 3; i <= 60; i++) [a, b] = [b, a + b];\nreturn b.toLocaleString('en-US');",
    note: "Add up 58 times, exactly.",
  },
  {
    question: "$10,000 is invested at 4.5% a year, compounded quarterly, for 7 years. What is the final amount?",
    ai: "$13,498.59",
    code: "const amount = 10000 * (1 + 0.045 / 4) ** (4 * 7);\nreturn '$' + amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});",
    note: "Compound interest, 28 quarters.",
  },
  {
    question: "Starting from 27, halve the number if it's even, or replace it with 3n + 1 if it's odd. How many steps to reach 1?",
    ai: "111",
    code: "let n = 27, steps = 0;\nwhile (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; steps++; }\nreturn String(steps);",
    note: "The Collatz sequence from 27 is famously long.",
  },
];
const PER_GAME = 5;

const dialog = document.getElementById("game");
const body = document.getElementById("game-body");
let rounds = [], index = 0, caught = 0, wrongSeen = 0, correctCalls = 0, lastOpener = null;

const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of children) node.append(child);
  return node;
};

// The answer the code gives is the truth; the AI is wrong when its answer differs.
const run = (round) => new Function(round.code)();
const sameAnswer = (a, b) => a.replace(/[^0-9.\-]/g, "") === b.replace(/[^0-9.\-]/g, "");

function start(first) {
  const rest = ROUNDS.filter((_, i) => i !== first).sort(() => Math.random() - 0.5);
  rounds = (first === undefined ? rest : [ROUNDS[first], ...rest]).slice(0, PER_GAME);
  index = caught = wrongSeen = correctCalls = 0;
  intro();
}

function intro() {
  body.replaceChildren(
    el("p", {class: "game-lede"},
      "These are real answers Claude Haiku 4.5 gave in my benchmark, with no tools. Some are right, some are wrong. ",
      "Guess which, then run the code to find out."),
    el("p", {class: "game-why"},
      "Every project I build comes back to this moment: an AI sounds sure, and running the code shows whether it's right."),
    el("button", {class: "btn primary", type: "button", onclick: showRound}, `Start (${PER_GAME} questions)`),
  );
  body.querySelector("button").focus();
}

function showRound() {
  const round = rounds[index];
  body.replaceChildren(
    el("p", {class: "progress"}, `Question ${index + 1} of ${rounds.length}`),
    el("p", {class: "question"}, round.question),
    el("div", {class: "ai-answer"}, el("span", {}, "The AI answered"), el("b", {}, round.ai)),
    el("p", {class: "prompt"}, "Is it right?"),
    el("div", {class: "choices"},
      el("button", {class: "btn", type: "button", onclick: () => reveal(true)}, "Looks right"),
      el("button", {class: "btn", type: "button", onclick: () => reveal(false)}, "I think it's wrong"),
    ),
  );
  body.querySelector(".choices .btn").focus();
}

function reveal(saidRight) {
  const round = rounds[index];
  const truth = run(round);
  const aiRight = sameAnswer(truth, round.ai);
  const youRight = saidRight === aiRight;
  if (youRight) correctCalls++;
  if (!aiRight) { wrongSeen++; if (!saidRight) caught++; }
  const verdict = aiRight
    ? (youRight ? "You're right: the AI got this one." : "The AI was right this time.")
    : (youRight ? "Caught it! The AI was wrong." : "It fooled you: the AI was wrong.");
  const last = index === rounds.length - 1;
  body.replaceChildren(
    el("p", {class: "progress"}, `Question ${index + 1} of ${rounds.length}`),
    el("p", {class: "question small"}, round.question),
    el("p", {class: "code-label"}, "Running this code in your browser:"),
    el("pre", {class: "code"}, round.code),
    el("div", {class: "outputs"},
      el("div", {class: "ai-answer"}, el("span", {}, "The AI said"), el("b", {}, round.ai)),
      el("div", {class: "ai-answer truth"}, el("span", {}, "The code says"), el("b", {}, truth)),
    ),
    el("p", {class: `verdict ${youRight ? "ok" : "bad"}`, role: "status"}, verdict),
    el("p", {class: "note"}, round.note),
    el("button", {class: "btn primary", type: "button", onclick: last ? finish : () => { index++; showRound(); }},
      last ? "See my score" : "Next question"),
  );
  body.querySelector(".btn.primary").focus();
}

function finish() {
  const line = wrongSeen
    ? `You caught ${caught} of the ${wrongSeen} wrong answers.`
    : "The AI got all of these right. Play again for a harder set.";
  body.replaceChildren(
    el("p", {class: "score"}, `${correctCalls} / ${rounds.length}`),
    el("p", {class: "score-line"}, line),
    el("p", {class: "game-lede"},
      "My agents check AI answers the same way. In proofset, Claude Haiku wrote 31 wrong answer keys over three runs, and code caught every one before it reached a worksheet."),
    el("div", {class: "choices"},
      el("button", {class: "btn primary", type: "button", onclick: () => start()}, "Play again"),
      el("a", {class: "btn", href: "#projects", onclick: close}, "See the projects"),
    ),
  );
  body.querySelector(".btn.primary").focus();
}

function open(event) {
  lastOpener = event?.currentTarget || null;
  const first = lastOpener?.dataset.first;
  start(first === undefined ? undefined : Number(first));
  dialog.showModal();
  if (first !== undefined) showRound();  // the teaser card jumps straight to its question
}

function close() {
  dialog.close();
}

dialog.addEventListener("close", () => lastOpener?.focus());
dialog.addEventListener("click", (e) => { if (e.target === dialog) close(); });  // click outside closes
document.querySelectorAll("[data-open-game]").forEach((b) => b.addEventListener("click", open));
document.querySelector("[data-close-game]").addEventListener("click", close);
if (location.hash === "#catch-the-ai") open();
