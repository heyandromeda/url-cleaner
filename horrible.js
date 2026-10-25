import { STORAGE_KEYS, openAppStorage, readBooleanSetting, writeBooleanSetting } from "./storage.js";

export const HORRIBLE_STORAGE_KEY = STORAGE_KEYS.horrible;
export const HORRIBLE_NAG_SESSION_KEY = "url-cleaner.horrible-nag";
export const HORRIBLE_HITS_KEY = "url-cleaner.horrible-hits";
export const HORRIBLE_DODGE_CLASSES = ["horrible-dodge-a", "horrible-dodge-b", "horrible-dodge-c"];
export const HORRIBLE_DODGE_LIMIT = 3;

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

export function shouldShowHorribleNag(sessionStorageLike) {
  if (!sessionStorageLike) return true;
  try {
    return sessionStorageLike.getItem(HORRIBLE_NAG_SESSION_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

export function markHorribleNagDismissed(sessionStorageLike) {
  if (!sessionStorageLike) return;
  try {
    sessionStorageLike.setItem(HORRIBLE_NAG_SESSION_KEY, "dismissed");
  } catch {
    // Session hints are optional.
  }
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

export function bindHorriblePage({
  document: rootDocument = globalThis.document,
  stopButton,
  cleanButton,
  nag,
  nagButtons = [],
  hitCounter,
  guestbook,
  onStop
} = {}) {
  const root = rootDocument;
  if (!root) return { dispose() {} };

  const dodgeClasses = [...HORRIBLE_DODGE_CLASSES];
  let dodges = 0;
  let tiredUntil = 0;
  let lastTrail = 0;

  const isHorrible = () => root.documentElement.dataset.horrible === "on";

  const clearDodges = () => {
    if (!cleanButton) return;
    cleanButton.classList.remove(...dodgeClasses);
  };

  const onCleanEnter = () => {
    if (!isHorrible() || prefersReducedMotion(root.defaultView || globalThis)) return;
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
    if (!isHorrible() || prefersReducedMotion(root.defaultView || globalThis)) return;
    const now = Date.now();
    if (now - lastTrail < 40) return;
    lastTrail = now;
    const dot = root.createElement("span");
    dot.className = "horrible-trail-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.style.setProperty("--tx", `${event.clientX}px`);
    dot.style.setProperty("--ty", `${event.clientY}px`);
    root.body.append(dot);
    root.defaultView?.setTimeout(() => dot.remove(), 700);
  };

  const dismissNag = () => {
    if (nag) {
      nag.hidden = true;
      nag.classList.add("is-dismissed");
    }
    markHorribleNagDismissed(root.defaultView?.sessionStorage);
  };

  if (cleanButton) {
    cleanButton.addEventListener("mouseenter", onCleanEnter);
    cleanButton.addEventListener("focus", clearDodges);
  }
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  stopButton?.addEventListener("click", () => onStop?.());
  for (const button of nagButtons) {
    button.addEventListener("click", dismissNag);
  }
  guestbook?.addEventListener("click", () => {
    guestbook.textContent = "THANKS FOR SIGNING MY GUESTBOOK!!!1";
  });

  if (hitCounter) {
    const storage = openHorribleStorage(root.defaultView || globalThis);
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

  if (nag && isHorrible() && shouldShowHorribleNag(root.defaultView?.sessionStorage)) {
    nag.hidden = false;
    nag.classList.remove("is-dismissed");
  } else if (nag) {
    nag.hidden = true;
  }

  return {
    dispose() {
      cleanButton?.removeEventListener("mouseenter", onCleanEnter);
      cleanButton?.removeEventListener("focus", clearDodges);
      root.removeEventListener("pointermove", onPointerMove);
    },
    dismissNag,
    clearDodges
  };
}
