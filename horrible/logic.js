export const PLAYBOOK_IDEAS = [
  { id: 1, name: "Marquee input", file: "horrible/playbook.js" },
  { id: 2, name: "Phone-slider URL entry", file: "horrible/playbook.js" },
  { id: 3, name: "Upside-down field", file: "horrible/playbook.js" },
  { id: 4, name: "URL password rules", file: "horrible/playbook.js" },
  { id: 5, name: "Tracker CAPTCHA", file: "horrible/playbook.js" },
  { id: 6, name: "NO / here", file: "horrible/playbook.js" },
  { id: 7, name: "Thumbwheel Clean", file: "horrible/playbook.js" },
  { id: 8, name: "Shell game", file: "horrible/playbook.js" },
  { id: 9, name: "Begin menu", file: "horrible/playbook.js" },
  { id: 10, name: "Hold to clean", file: "horrible/playbook.js" },
  { id: 11, name: "Slot machine reveal", file: "horrible/playbook.js" },
  { id: 12, name: "RealCD results", file: "horrible/playbook.js" },
  { id: 13, name: "Find95 menu bar", file: "horrible/playbook.js" },
  { id: 14, name: "Swapped labels", file: "horrible/playbook.js" },
  { id: 15, name: "Missile-menu settings", file: "horrible/playbook.js" },
  { id: 16, name: "Gravity sliders", file: "horrible/playbook.js" },
  { id: 17, name: "Prime-factor aggressiveness", file: "horrible/playbook.js" },
  { id: 18, name: "Theme roulette", file: "horrible/playbook.js" },
  { id: 19, name: "Bob's living room", file: "horrible/playbook.js" },
  { id: 20, name: "Programmerisms", file: "horrible/playbook.js" },
  { id: 21, name: "Confirmshaming buttons", file: "horrible/playbook.js" },
  { id: 22, name: "Slow T&Cs", file: "horrible/playbook.js" },
  { id: 23, name: "Cookie banner for no cookies", file: "horrible/playbook.js" },
  { id: 24, name: "The Helpful Paperclip-adjacent Thing", file: "horrible/playbook.js" },
  { id: 25, name: "Step 3 of 2", file: "horrible/playbook.js" },
  { id: 26, name: "Space Jam splash", file: "horrible/playbook.js" },
  { id: 27, name: "Comic Sans if you've got it", file: "horrible.css" },
  { id: 28, name: "Zoom roulette", file: "horrible/playbook.js" },
  { id: 29, name: "Narrator captions", file: "horrible/playbook.js" },
  { id: 30, name: "Permanent hourglass", file: "horrible/playbook.css" },
  { id: 31, name: "Silent MIDI player", file: "horrible/playbook.js" },
  { id: 32, name: "Subtitles for nonexistent sound", file: "horrible/playbook.js" },
  { id: 33, name: "Dial-up handshake", file: "horrible/playbook.js" }
];

export const SLIDER_ASCII_MIN = 32;
export const SLIDER_ASCII_MAX = 126;
export const THUMBWHEEL_WINDS_NEEDED = 5;
export const HOLD_CLEAN_MS = 3000;
export const HOLD_MOVE_LIMIT_PX = 2;
export const GRAVITY_OFF_RATE = 18;
export const PRIME_FACTORS = [2, 3, 5, 7];
export const ZOOM_MIN = 0.9;
export const ZOOM_MAX = 1.3;
export const DIALUP_MS = 1500;
export const SLOT_TICKS = 8;
export const SHELL_CUP_COUNT = 3;

export const HORRIBLE_THEMES = [
  "light",
  "dark",
  "darker",
  "beige",
  "fax",
  "night-vision",
  "wet-paper",
  "y1997",
  "back-to-light"
];

export const URL_PASSWORD_RULES = [
  {
    id: "vegetable",
    label: "at least one vegetable",
    test: (value) => /carrot|celery|broccoli|kale|onion|beet|turnip|leek|yam|pea|spinach|radish/i.test(value)
  },
  {
    id: "palindrome",
    label: "a palindrome",
    test: (value) => {
      const compact = String(value).replace(/[^a-z0-9]/gi, "").toLowerCase();
      return compact.length > 2 && compact === [...compact].reverse().join("");
    }
  },
  {
    id: "vowels",
    label: "fewer vowels than trackers",
    test: (value) => {
      const text = String(value);
      const trackers = text.match(/utm_|fbclid|gclid|mc_eid|_ga|msclkid/gi) || [];
      const leftover = text.replace(/utm_|fbclid|gclid|mc_eid|_ga|msclkid/gi, "");
      const vowels = (leftover.match(/[aeiou]/gi) || []).length;
      return trackers.length > vowels;
    }
  }
];

export const CAPTCHA_FRAGMENTS = [
  "utm_source=newsletter",
  "ref=home",
  "utm_medium=email",
  "id=42",
  "utm_source=ads",
  "page=2",
  "fbclid=abc",
  "utm_campaign=spring",
  "q=search"
];

export const SOUND_CAPTIONS = [
  "[ominous fax noises]",
  "[dial-up screaming]",
  "[a single kazoo, far away]",
  "[the sound of a modem thinking about it]",
  "[hold music, but imagined]",
  "[someone dropping a stapler in 1998]"
];

export const NARRATOR_LINES = [
  "A brave URL enters, covered in utm.",
  "The trackers gasp. The query string trembles.",
  "Our hero has been sanitized. The audience pretends to clap.",
  "Meanwhile, fbclid writes a sad postcard.",
  "The cleaned link takes a bow. Nobody asked it to."
];

export const TOUR_STEPS = [
  { n: "3", of: "2", text: "First, paste a URL. This is step 3. Do not ask questions." },
  { n: "2", of: "2", text: "Next is also a step. The Next button has moved. Again." },
  { n: "1", of: "2", text: "Congratulations. This is step 1 of 2. You are done, probably." }
];

export const PROGRAMMERISM_SUCCESS = "Error 0x0000UTM: The operation completed successfully";

export function clampAsciiCode(value) {
  const code = Number.isFinite(Number(value)) ? Math.round(Number(value)) : SLIDER_ASCII_MIN;
  return Math.min(SLIDER_ASCII_MAX, Math.max(SLIDER_ASCII_MIN, code));
}

export function charFromSlider(value) {
  return String.fromCharCode(clampAsciiCode(value));
}

export function appendSliderChar(current, sliderValue) {
  return `${current ?? ""}${charFromSlider(sliderValue)}`;
}

export function evaluatePasswordRules(value) {
  return URL_PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    ok: rule.test(value ?? "")
  }));
}

export function captchaCellHasUtm(text) {
  return /utm_source/i.test(String(text));
}

export function splitCaptchaCell(text) {
  const value = String(text || "");
  const mid = Math.max(1, Math.ceil(value.length / 2));
  const left = value.slice(0, mid);
  const right = value.slice(mid);
  return [left, right || "utm"];
}

export function nextThumbwheelWinds(winds, deltaY, needed = THUMBWHEEL_WINDS_NEEDED) {
  const current = Math.max(0, Math.trunc(winds) || 0);
  if (deltaY < -8) {
    const next = current + 1;
    return { winds: next, armed: next >= needed };
  }
  return { winds: current, armed: current >= needed };
}

export function holdMovedTooFar(start, current, limit = HOLD_MOVE_LIMIT_PX) {
  if (!start || !current) return false;
  return Math.hypot((current.x ?? 0) - (start.x ?? 0), (current.y ?? 0) - (start.y ?? 0)) > limit;
}

export function initialShellOrder() {
  return ["clean", "unclean-a", "unclean-b"];
}

export function shuffleCups(order, swapIndex = 0) {
  const next = [...order];
  const index = Math.abs(Math.trunc(swapIndex)) % next.length;
  const other = (index + 1) % next.length;
  [next[index], next[other]] = [next[other], next[index]];
  return next;
}

export function shellIsClean(order, index) {
  return order[index] === "clean";
}

export function stepGravity(value, dtSeconds, rate = GRAVITY_OFF_RATE) {
  const current = Number.isFinite(value) ? value : 0;
  const dt = Number.isFinite(dtSeconds) ? Math.max(0, dtSeconds) : 0;
  return Math.max(0, current - rate * dt);
}

export function gravityIsOn(value) {
  return Number(value) > 50;
}

export function multiplyPrime(product, prime) {
  const current = Number.isFinite(product) && product > 0 ? product : 1;
  const factor = PRIME_FACTORS.includes(prime) ? prime : 1;
  const next = current * factor;
  return { product: next, aggressive: next > 50 };
}

export function resetPrimes() {
  return { product: 1, aggressive: false };
}

export function nextHorribleTheme(current) {
  const index = HORRIBLE_THEMES.indexOf(current);
  return HORRIBLE_THEMES[(index + 1) % HORRIBLE_THEMES.length];
}

export function clampZoom(scale) {
  const value = Number(scale);
  if (!Number.isFinite(value)) return 1;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

export function nextZoomScale(seed = 0) {
  const t = Math.abs(Number(seed)) % 9;
  return clampZoom(ZOOM_MIN + (t / 8) * (ZOOM_MAX - ZOOM_MIN));
}

export function dialupMs(reducedMotion) {
  return reducedMotion ? 0 : DIALUP_MS;
}

export function pickSoundCaption(index = 0) {
  return SOUND_CAPTIONS[Math.abs(Math.trunc(index)) % SOUND_CAPTIONS.length];
}

export function pickNarratorLine(index = 0) {
  return NARRATOR_LINES[Math.abs(Math.trunc(index)) % NARRATOR_LINES.length];
}

export function slotCharsForTick(finalText, tick, alphabet = "abcdefghijklmnopqrstuvwxyz0123456789:/?&=._-%") {
  const text = String(finalText ?? "");
  if (tick >= SLOT_TICKS) return text;
  return [...text].map((char, index) => {
    if (/\s/.test(char)) return char;
    const pick = (index * 13 + tick * 7) % alphabet.length;
    return alphabet[pick];
  }).join("");
}

export function isCleanWindow(now, cleanWindowUntil) {
  return Number(cleanWindowUntil) > Number(now);
}

export function applyPopupDismissal({
  openCount,
  closes,
  now,
  cap,
  multiply,
  cleanWindowUntil = 0,
  every,
  windowMs
} = {}) {
  const nextCloses = (Number(closes) || 0) + 1;
  const started = nextCleanWindow(nextCloses, now, every, windowMs);
  const windowUntil = started || cleanWindowUntil || 0;
  const inWindow = Boolean(started) || isCleanWindow(now, windowUntil);
  const extras = extrasAfterClose(openCount, cap, multiply, inWindow);
  return {
    closes: nextCloses,
    cleanWindowUntil: windowUntil,
    extras,
    inWindow
  };
}

export function nextCleanWindow(closesAfterThis, now, every = 3, windowMs = 6000) {
  if (closesAfterThis > 0 && closesAfterThis % every === 0) return now + windowMs;
  return 0;
}

export function extrasAfterClose(openCount, cap, multiply = 2, inCleanWindow = false) {
  if (inCleanWindow) return 0;
  const afterRemoval = Math.max(0, (Number(openCount) || 0) - 1);
  return Math.min(multiply, Math.max(0, cap - afterRemoval));
}

export function nextSpawnDelay(now, cleanWindowUntil, baseMs) {
  if (cleanWindowUntil > now) return Math.max(16, cleanWindowUntil - now);
  return Math.max(16, baseMs);
}
