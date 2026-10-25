import { STORAGE_KEYS, openAppStorage, readBooleanSetting, writeBooleanSetting } from "./storage.js";

export const HORRIBLE_STORAGE_KEY = STORAGE_KEYS.horrible;
export const HORRIBLE_HITS_KEY = "url-cleaner.horrible-hits";
export const HORRIBLE_DODGE_CLASSES = ["horrible-dodge-a", "horrible-dodge-b", "horrible-dodge-c"];
export const HORRIBLE_DODGE_LIMIT = 3;
export const HORRIBLE_POPUP_CAP = 8;
export const HORRIBLE_POPUP_CAP_REDUCED = 2;
export const HORRIBLE_POPUP_MULTIPLY = 2;
export const HORRIBLE_CLEAN_WINDOW_EVERY = 3;
export const HORRIBLE_CLEAN_WINDOW_MS = 6000;
export const HORRIBLE_JOKE_TAG = "it's a joke 🤡";

export const HORRIBLE_POPUP_COPY = [
  { title: "HOT TRACKERS IN YOUR AREA", body: "want to follow you!!!", action: "wow ok" },
  { title: "YOUR LAPTOP HAS 47 UTM PARAMETERS!!!", body: "CLEAN NOW or they will tell your bookmarks.", action: "i guess" },
  { title: "Congratulations, you are the 1,000,000th URL!", body: "You won nothing. Absolutely nothing.", action: "claim nothing" },
  { title: "Download more RAM", body: "We will not. This button does not download anything.", action: "no thanks" },
  { title: "Your fbclid misses you", body: "It wrote you a sad little query string.", action: "tell it no" },
  { title: "Click here to remove 1 weird tracker", body: "Just kidding. That would be too easy.", action: "nice try" },
  { title: "URGENT: gclid ate the group project", body: "It left a note that says utm_medium=chaos.", action: "unbelievable" },
  { title: "Install Toolbar 99 (joke)", body: "There is no toolbar. There is no installer. There is only this box.", action: "decline" }
];

export function readHorriblePreference(storage) {
  return readBooleanSetting(storage, STORAGE_KEYS.horrible, false);
}

export function writeHorriblePreference(storage, enabled) {
  writeBooleanSetting(storage, STORAGE_KEYS.horrible, Boolean(enabled));
}

export function toggleHorribleMode(currentlyEnabled, storage) {
  const next = !currentlyEnabled;
  writeHorriblePreference(storage, next);
  return next;
}

export function applyHorribleAttribute(documentElement, enabled) {
  if (!documentElement) return;
  if (enabled) {
    documentElement.dataset.horrible = "on";
  } else {
    delete documentElement.dataset.horrible;
  }
}

export function openHorribleStorage(globalObject) {
  return openAppStorage(globalObject);
}

export function resolveHorribleMode(globalObject) {
  const storage = openHorribleStorage(globalObject);
  return storage ? readHorriblePreference(storage) : false;
}

export function prefersReducedMotion(globalObject = globalThis) {
  try {
    return Boolean(globalObject.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  } catch {
    return false;
  }
}

export function nextDodgeClass(step) {
  return HORRIBLE_DODGE_CLASSES[Math.abs(step) % HORRIBLE_DODGE_CLASSES.length];
}

export function resolveCleanDodge(dodges, tiredUntil, now, restMs = 4000) {
  if (now < tiredUntil) return { action: "stay", dodges, tiredUntil };
  if (dodges >= HORRIBLE_DODGE_LIMIT) {
    return { action: "rest", dodges: 0, tiredUntil: now + restMs };
  }
  return { action: "dodge", dodges: dodges + 1, tiredUntil };
}

export function formatHitCounter(count) {
  const safe = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 1337;
  return String(safe).padStart(8, "0");
}

export function bumpHitCounter(storage, current = 1337) {
  const next = (Number.parseInt(String(current), 10) || 1337) + 1;
  if (storage) {
    try {
      storage.setItem(HORRIBLE_HITS_KEY, String(next));
    } catch {
      // The joke counter is optional.
    }
  }
  return next;
}

export function popupCap(reducedMotion) {
  return reducedMotion ? HORRIBLE_POPUP_CAP_REDUCED : HORRIBLE_POPUP_CAP;
}

export function popupsToSpawnOnClose(openCount, cap, multiply = HORRIBLE_POPUP_MULTIPLY, inCleanWindow = false) {
  if (inCleanWindow) return 0;
  const afterRemoval = Math.max(0, openCount - 1);
  return Math.min(multiply, Math.max(0, cap - afterRemoval));
}

export function nextCleanWindowUntil(closesAfterThis, now, every = HORRIBLE_CLEAN_WINDOW_EVERY, windowMs = HORRIBLE_CLEAN_WINDOW_MS) {
  if (closesAfterThis > 0 && closesAfterThis % every === 0) return now + windowMs;
  return 0;
}

export function pickPopupSlot(usedSlots, slotCount = HORRIBLE_POPUP_CAP) {
  for (let index = 0; index < slotCount; index += 1) {
    if (!usedSlots.has(index)) return index;
  }
  return 0;
}

export function nextPopupCopy(index) {
  return HORRIBLE_POPUP_COPY[Math.abs(index) % HORRIBLE_POPUP_COPY.length];
}

export function spawnHorribleConfetti(root, { pieceCount = 20, ttlMs = 1800 } = {}) {
  if (!root || prefersReducedMotion(root.defaultView || globalThis)) return null;
  if (root.documentElement?.dataset.horrible !== "on") return null;

  const burst = root.createElement("div");
  burst.className = "horrible-burst";
  burst.setAttribute("aria-hidden", "true");
  for (let index = 0; index < pieceCount; index += 1) {
    const piece = root.createElement("span");
    piece.className = "horrible-burst-piece";
    burst.append(piece);
  }
  root.body.append(burst);
  root.defaultView?.setTimeout(() => burst.remove(), ttlMs);
  return burst;
}

export function popHorribleStamp(stamp) {
  if (!stamp || prefersReducedMotion()) return;
  stamp.classList.add("is-popping");
  globalThis.setTimeout(() => stamp.classList.remove("is-popping"), 1600);
}

function bindRunawayClose(button, root) {
  if (!button) return;
  let dodges = 0;
  let tiredUntil = 0;
  button.addEventListener("mouseenter", () => {
    if (prefersReducedMotion(root.defaultView || globalThis)) return;
    const now = Date.now();
    const next = resolveCleanDodge(dodges, tiredUntil, now);
    dodges = next.dodges;
    tiredUntil = next.tiredUntil;
    button.classList.remove(...HORRIBLE_DODGE_CLASSES);
    if (next.action === "dodge") {
      button.classList.add(nextDodgeClass(dodges - 1));
    }
  });
}

export function bindHorriblePage({
  document: rootDocument = globalThis.document,
  stopButton,
  cleanButton,
  popupHost,
  hitCounter,
  guestbook,
  onStop
} = {}) {
  const root = rootDocument;
  if (!root) return { dispose() {}, setEnabled() {}, clearPopups() {} };

  const dodgeClasses = [...HORRIBLE_DODGE_CLASSES];
  let dodges = 0;
  let tiredUntil = 0;
  let lastTrail = 0;
  let copyIndex = 0;
  let closes = 0;
  let cleanWindowUntil = 0;
  let spawnTimer = 0;
  let enabled = false;

  const isHorrible = () => root.documentElement.dataset.horrible === "on";
  const view = () => root.defaultView || globalThis;
  const reduced = () => prefersReducedMotion(view());
  const cap = () => popupCap(reduced());
  const usedSlots = () => new Set([...popupHost?.querySelectorAll("[data-slot]") || []].map((node) => Number(node.dataset.slot)));

  const clearDodges = () => {
    if (!cleanButton) return;
    cleanButton.classList.remove(...dodgeClasses);
  };

  const onCleanEnter = () => {
    if (!isHorrible() || reduced()) return;
    const now = Date.now();
    const next = resolveCleanDodge(dodges, tiredUntil, now);
    dodges = next.dodges;
    tiredUntil = next.tiredUntil;
    if (next.action === "stay") return;
    clearDodges();
    if (next.action === "dodge") {
      cleanButton.classList.add(nextDodgeClass(dodges - 1));
    }
  };

  const onPointerMove = (event) => {
    if (!isHorrible() || reduced()) return;
    const now = Date.now();
    if (now - lastTrail < 40) return;
    lastTrail = now;
    const dot = root.createElement("span");
    dot.className = "horrible-trail-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.style.setProperty("--tx", `${event.clientX}px`);
    dot.style.setProperty("--ty", `${event.clientY}px`);
    root.body.append(dot);
    view().setTimeout(() => dot.remove(), 700);
  };

  const openCount = () => popupHost?.querySelectorAll(".horrible-popup").length || 0;

  const spawnPopup = () => {
    if (!enabled || !isHorrible() || !popupHost) return null;
    if (openCount() >= cap()) return null;
    if (Date.now() < cleanWindowUntil) return null;

    const copy = nextPopupCopy(copyIndex);
    copyIndex += 1;
    const slot = pickPopupSlot(usedSlots());
    const skin = (slot % 4) + 1;
    const popup = root.createElement("aside");
    popup.className = `horrible-popup horrible-popup-slot-${slot} horrible-popup-skin-${skin}`;
    popup.dataset.slot = String(slot);
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", "Joke popup");

    const tag = root.createElement("p");
    tag.className = "horrible-joke-tag";
    tag.textContent = HORRIBLE_JOKE_TAG;

    const close = root.createElement("button");
    close.type = "button";
    close.className = "horrible-popup-x";
    close.setAttribute("aria-label", "Close joke popup");
    close.textContent = "X";

    const title = root.createElement("h2");
    title.textContent = copy.title;

    const body = root.createElement("p");
    body.textContent = copy.body;

    const action = root.createElement("button");
    action.type = "button";
    action.className = "horrible-popup-action";
    action.textContent = copy.action;

    popup.append(tag, close, title, body, action);
    popupHost.append(popup);
    bindRunawayClose(close, root);
    close.addEventListener("click", () => dismissPopup(popup));
    action.addEventListener("click", () => dismissPopup(popup));
    return popup;
  };

  const dismissPopup = (popup) => {
    if (!popup?.isConnected) return;
    const current = openCount();
    const inWindow = Date.now() < cleanWindowUntil;
    const extras = popupsToSpawnOnClose(current, cap(), HORRIBLE_POPUP_MULTIPLY, inWindow);
    popup.remove();
    closes += 1;
    const nextWindow = nextCleanWindowUntil(closes, Date.now());
    if (nextWindow) cleanWindowUntil = nextWindow;
    for (let index = 0; index < extras; index += 1) spawnPopup();
  };

  const clearPopups = () => {
    if (!popupHost) return;
    popupHost.replaceChildren();
  };

  const stopStorm = () => {
    if (spawnTimer) view().clearInterval(spawnTimer);
    spawnTimer = 0;
    clearPopups();
    cleanWindowUntil = 0;
    closes = 0;
  };

  const startStorm = () => {
    stopStorm();
    enabled = true;
    spawnPopup();
    if (!reduced()) spawnPopup();
    const interval = reduced() ? 5000 : 2800;
    spawnTimer = view().setInterval(() => {
      if (Date.now() >= cleanWindowUntil) spawnPopup();
    }, interval);
  };

  const setEnabled = (nextEnabled) => {
    enabled = Boolean(nextEnabled);
    if (enabled && isHorrible()) startStorm();
    else stopStorm();
  };

  const stopEverything = () => {
    enabled = false;
    stopStorm();
    onStop?.();
  };

  const onEscape = (event) => {
    if (event.key !== "Escape") return;
    if (!isHorrible() && !enabled) return;
    event.preventDefault();
    stopEverything();
  };

  if (cleanButton) {
    cleanButton.addEventListener("mouseenter", onCleanEnter);
    cleanButton.addEventListener("focus", clearDodges);
  }
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  stopButton?.addEventListener("click", stopEverything);
  view().addEventListener?.("keydown", onEscape);
  guestbook?.addEventListener("click", () => {
    guestbook.textContent = "THANKS FOR SIGNING MY GUESTBOOK!!!1";
  });

  if (hitCounter) {
    const storage = openHorribleStorage(view());
    let current = 1337;
    try {
      const stored = storage?.getItem(HORRIBLE_HITS_KEY);
      if (stored) current = Number.parseInt(stored, 10) || 1337;
    } catch {
      current = 1337;
    }
    if (isHorrible()) {
      current = bumpHitCounter(storage, current);
    }
    hitCounter.textContent = formatHitCounter(current);
  }

  return {
    dispose() {
      stopStorm();
      cleanButton?.removeEventListener("mouseenter", onCleanEnter);
      cleanButton?.removeEventListener("focus", clearDodges);
      root.removeEventListener("pointermove", onPointerMove);
      view().removeEventListener?.("keydown", onEscape);
    },
    setEnabled,
    clearPopups,
    spawnPopup
  };
}
