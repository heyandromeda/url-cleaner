import {
  clearHorribleSettingsSnapshot,
  openAppStorage,
  readHorribleSettingsSnapshot,
  writeHorribleSettingsSnapshot
} from "../storage.js";
import {
  CAPTCHA_FRAGMENTS,
  HOLD_CLEAN_MS,
  HORRIBLE_THEMES,
  PROGRAMMERISM_SUCCESS,
  SHELL_CUP_COUNT,
  SLOT_TICKS,
  SOUND_CAPTIONS,
  THUMBWHEEL_WINDS_NEEDED,
  TOUR_STEPS,
  appendSliderChar,
  captchaCellHasUtm,
  cleaningOptionsChanged,
  charFromSlider,
  clampAsciiCode,
  dialupMs,
  evaluatePasswordRules,
  gravityIsOn,
  initialShellOrder,
  multiplyPrime,
  nextThumbwheelWinds,
  nextZoomScale,
  pickNarratorLine,
  pickSoundCaption,
  resetPrimes,
  shellIsClean,
  shuffleCups,
  shouldCommitSlotReveal,
  slotCharsForTick,
  splitCaptchaCell,
  stepGravity,
  holdMovedTooFar
} from "./logic.js";

function el(root, tag, className, text) {
  const node = root.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function setButtonLabel(button, text) {
  if (!button) return;
  const wrap = button.querySelector(".icon-button");
  if (wrap) {
    const icon = wrap.querySelector("svg");
    wrap.replaceChildren();
    if (icon) wrap.append(icon);
    wrap.append(rootText(button, text));
    return;
  }
  button.textContent = text;
}

function rootText(button, text) {
  return button.ownerDocument.createTextNode(text);
}

function readButtonLabel(button) {
  if (!button) return "";
  const wrap = button.querySelector(".icon-button");
  if (wrap) return wrap.textContent.trim();
  return button.textContent.trim();
}

function visuallyHide(node, hide) {
  if (!node) return;
  node.classList.toggle("horrible-visually-hidden", hide);
}

export function bindPlaybook({
  document: rootDocument = globalThis.document,
  onClean,
  spawnPopup,
  prefersReduced = () => false
} = {}) {
  const root = rootDocument;
  if (!root) return { enable() {}, disable() {}, beforeClean() { return false; }, afterClean() {} };

  const view = () => root.defaultView || globalThis;
  const reduced = () => prefersReduced(view());
  const isOn = () => root.documentElement.dataset.horrible === "on";

  const input = root.querySelector("#url-input");
  const form = root.querySelector("#clean-form");
  const cleanButton = root.querySelector("#clean-form button.primary-button[type='submit']");
  const pasteButton = root.querySelector("#paste-button");
  const inspectButton = root.querySelector("#inspect-button");
  const copyButton = root.querySelector("#copy-button");
  const notNowButton = root.querySelector("#clipboard-offer-dismiss");
  const themeToggle = root.querySelector("#theme-toggle");
  const cleanOnPaste = root.querySelector("#clean-on-paste");
  const autoCopy = root.querySelector("#auto-copy");
  const aggressiveMode = root.querySelector("#aggressive-mode");
  const removeDuplicates = root.querySelector("#remove-duplicates");
  const resultPanel = root.querySelector("#result-panel");
  const cleanedUrl = root.querySelector("#cleaned-url");
  const message = root.querySelector("#message");
  const settings = root.querySelector(".settings");
  const popupHost = root.querySelector("#horrible-popups");

  let enabled = false;
  let captchaDone = false;
  let splashDone = false;
  let tourIndex = 0;
  let swapLabels = false;
  let zoomSeed = 0;
  let narratorIndex = 0;
  let soundIndex = 0;
  let themeIndex = 0;
  let winds = 0;
  let holdTimer = 0;
  let holdStart = null;
  let gravityFrame = 0;
  let lastGravity = 0;
  let primes = resetPrimes();
  let shellOrder = initialShellOrder();
  let querrySpawned = false;
  let savedLabels = null;
  let savedSettings = null;
  let slotTimer = 0;
  let slotRevealTimer = 0;
  let slotGeneration = 0;
  const gravity = {
    paste: 100,
    copy: 0,
    aggressive: 0,
    duplicates: 0
  };

  const host = () => root.querySelector("#horrible-playbook");
  const overlays = () => root.querySelector("#horrible-overlays");
  const q = (selector) => root.querySelector(selector);

  const showSound = (phrase) => {
    const caption = q("[data-idea='32']");
    if (!caption) return;
    caption.textContent = phrase || pickSoundCaption(soundIndex);
    soundIndex += 1;
    caption.classList.add("is-on");
    view().setTimeout(() => caption.classList.remove("is-on"), 1800);
  };

  const showNarrator = (line) => {
    const bar = q("[data-idea='29']");
    if (!bar) return;
    bar.textContent = line || pickNarratorLine(narratorIndex);
    narratorIndex += 1;
  };

  const syncMarquee = () => {
    const mirror = q("[data-idea='1'] .horrible-marquee-text");
    if (mirror) mirror.textContent = input?.value || "type something. it will leave you.";
  };

  const syncPasswordRules = () => {
    const list = q("[data-idea='4']");
    if (!list) return;
    const results = evaluatePasswordRules(input?.value || "");
    for (const rule of results) {
      const item = list.querySelector(`[data-rule='${rule.id}']`);
      if (item) item.classList.toggle("is-ok", rule.ok);
    }
  };

  const settingsStorage = () => openAppStorage(view());

  const setCheckbox = (box, on, { persist = false } = {}) => {
    if (!box) return;
    if (box.checked !== on) box.checked = on;
    if (persist) box.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const syncGravityUi = () => {
    if (!enabled || !isOn()) return;
    const map = {
      paste: cleanOnPaste,
      copy: autoCopy,
      aggressive: aggressiveMode,
      duplicates: removeDuplicates
    };
    for (const [key, box] of Object.entries(map)) {
      const slider = q(`[data-gravity='${key}']`);
      if (slider) slider.value = String(Math.round(gravity[key]));
      setCheckbox(box, gravityIsOn(gravity[key]));
    }
  };

  const snapshotSettings = () => ({
    paste: Boolean(cleanOnPaste?.checked),
    copy: Boolean(autoCopy?.checked),
    aggressive: Boolean(aggressiveMode?.checked),
    duplicates: Boolean(removeDuplicates?.checked)
  });

  const rememberSettings = () => {
    const stored = readHorribleSettingsSnapshot(settingsStorage());
    savedSettings = stored || snapshotSettings();
    writeHorribleSettingsSnapshot(settingsStorage(), savedSettings);
  };

  const restoreSettings = () => {
    const snap = savedSettings || readHorribleSettingsSnapshot(settingsStorage());
    savedSettings = null;
    clearHorribleSettingsSnapshot(settingsStorage());
    if (!snap) return null;
    const before = snapshotSettings();
    setCheckbox(cleanOnPaste, snap.paste);
    setCheckbox(autoCopy, snap.copy);
    setCheckbox(aggressiveMode, snap.aggressive);
    setCheckbox(removeDuplicates, snap.duplicates);
    return { snap, cleaningChanged: cleaningOptionsChanged(before, snap) };
  };

  const stopSlotReveal = () => {
    if (slotTimer) view().clearInterval(slotTimer);
    if (slotRevealTimer) view().clearTimeout(slotRevealTimer);
    slotTimer = 0;
    slotRevealTimer = 0;
    slotGeneration += 1;
    const slot = q("[data-idea='11']");
    if (slot) {
      slot.hidden = true;
      slot.textContent = "";
    }
  };

  const tickGravity = (now) => {
    if (!enabled || !isOn() || reduced()) {
      gravityFrame = 0;
      return;
    }
    const dt = lastGravity ? Math.min(0.05, (now - lastGravity) / 1000) : 0.016;
    lastGravity = now;
    for (const key of Object.keys(gravity)) {
      gravity[key] = stepGravity(gravity[key], dt);
    }
    syncGravityUi();
    gravityFrame = view().requestAnimationFrame(tickGravity);
  };

  const startGravity = () => {
    if (reduced() || gravityFrame) return;
    lastGravity = 0;
    gravityFrame = view().requestAnimationFrame(tickGravity);
  };

  const stopGravity = () => {
    if (gravityFrame) view().cancelAnimationFrame(gravityFrame);
    gravityFrame = 0;
  };

  const syncPrimes = () => {
    const out = q("[data-idea='17'] .horrible-prime-product");
    if (out) out.textContent = `product ${primes.product}`;
    setCheckbox(aggressiveMode, primes.aggressive || gravityIsOn(gravity.aggressive));
  };

  const applyZoom = () => {
    root.documentElement.style.setProperty("--horrible-scale", String(nextZoomScale(zoomSeed)));
  };

  const applyTheme = () => {
    const name = HORRIBLE_THEMES[themeIndex % HORRIBLE_THEMES.length];
    root.documentElement.dataset.horribleTheme = name;
    const label = q("[data-idea='18']");
    if (label) label.textContent = `Theme: ${name.replace(/-/g, " ")}`;
  };

  const setSwap = (on) => {
    swapLabels = on;
    root.documentElement.classList.toggle("horrible-swap-labels", on);
    const chip = q("[data-idea='14']");
    if (chip) chip.hidden = !on;
  };

  const setCaseOpen = (open) => {
    q("[data-idea='12']")?.classList.toggle("is-open", open);
  };

  const setCaptchaOpen = (open) => {
    const panel = q("[data-idea='5']");
    if (panel) panel.hidden = !open;
  };

  const setSplashOpen = (open) => {
    const splash = q("[data-idea='26']");
    if (splash) splash.hidden = !open;
  };

  const setDialupOpen = (open) => {
    const panel = q("[data-idea='33']");
    if (panel) panel.hidden = !open;
  };

  const setCookieOpen = (open) => {
    const banner = q("[data-idea='23']");
    if (banner) banner.hidden = !open;
  };

  const renderTour = () => {
    const card = q("[data-idea='25']");
    if (!card) return;
    if (tourIndex < 0 || tourIndex >= TOUR_STEPS.length) {
      card.hidden = true;
      return;
    }
    const step = TOUR_STEPS[tourIndex];
    card.hidden = false;
    card.querySelector(".horrible-tour-count").textContent = `Step ${step.n} of ${step.of}`;
    card.querySelector(".horrible-tour-text").textContent = step.text;
    const next = card.querySelector(".horrible-tour-next");
    next.className = `horrible-tour-next horrible-tour-slot-${tourIndex}`;
  };

  const skipTour = () => {
    tourIndex = TOUR_STEPS.length;
    renderTour();
  };

  const fillCaptcha = (cells) => {
    const grid = q("[data-idea='5'] .horrible-captcha-grid");
    if (!grid) return;
    grid.replaceChildren();
    for (const text of cells) {
      const cell = el(root, "button", "horrible-captcha-cell", text);
      cell.type = "button";
      cell.dataset.fragment = text;
      cell.classList.toggle("has-utm", captchaCellHasUtm(text));
      grid.append(cell);
    }
  };

  const renderShell = () => {
    const stage = q("[data-idea='8'] .horrible-shell-stage");
    if (!stage) return;
    const cups = [...stage.querySelectorAll(".horrible-cup")];
    cups.forEach((cup, index) => {
      cup.dataset.kind = shellOrder[index] || "unclean-a";
      cup.style.setProperty("--cup-x", `${index * 34}%`);
      cup.querySelector(".horrible-cup-label").textContent =
        shellOrder[index] === "clean" ? "Clean?" : "That was the Unclean button";
    });
  };

  const shuffleShell = () => {
    if (reduced()) return;
    shellOrder = shuffleCups(shellOrder, Math.floor(Math.random() * SHELL_CUP_COUNT));
    renderShell();
  };

  const restoreLabels = () => {
    if (!savedLabels) return;
    for (const [button, text] of savedLabels) setButtonLabel(button, text);
    savedLabels = null;
  };

  const applyLabels = () => {
    if (savedLabels) return;
    savedLabels = [];
    const swaps = [
      [pasteButton, "Execute sanitizeQueryParams()"],
      [inspectButton, "inspectTrackingGraph()"],
      [copyButton, "Copy? / Copy, but sadder"],
      [notNowButton, "No thanks, I enjoy being tracked"],
      [cleanButton, "NO"]
    ];
    for (const [button, joke] of swaps) {
      if (!button) continue;
      savedLabels.push([button, readButtonLabel(button)]);
      setButtonLabel(button, joke);
    }
  };

  const requestPointerClean = () => {
    if (!enabled || !isOn()) return;
    if (!captchaDone) {
      setCaptchaOpen(true);
      showSound("[a tiny quiz fanfare, imagined]");
      return;
    }
    runGatedClean();
  };

  const runGatedClean = () => {
    const wait = dialupMs(reduced());
    if (!wait) {
      setDialupOpen(false);
      onClean?.();
      return;
    }
    setDialupOpen(true);
    showSound("[dial-up screaming]");
    view().setTimeout(() => {
      setDialupOpen(false);
      onClean?.();
    }, wait);
  };

  const spawnQuerry = () => {
    if (!enabled || !isOn() || querrySpawned || !spawnPopup) return;
    const popup = spawnPopup({
      title: "Querry thinks you're writing a URL",
      body: "It looks like you're pasting a URL. Would you like help? (it's a joke 🤡)",
      action: "no, Querry"
    });
    if (!popup) return;
    querrySpawned = true;
    const mascot = el(root, "div", "horrible-querry");
    mascot.setAttribute("aria-hidden", "true");
    mascot.textContent = "?";
    popup.prepend(mascot);
  };

  const onInput = () => {
    if (!enabled || !isOn()) return;
    syncMarquee();
    syncPasswordRules();
    showSound(pickSoundCaption(soundIndex));
    spawnQuerry();
  };

  const onCleanClick = (event) => {
    if (!enabled || !isOn()) return;
    if (event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    showSound("[a button that refuses]");
  };

  const onThemeClick = (event) => {
    if (!enabled || !isOn()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    themeIndex = (themeIndex + 1) % HORRIBLE_THEMES.length;
    applyTheme();
    showSound("[theme wardrobe collapsing]");
  };

  const onPlaybookClick = (event) => {
    if (!enabled || !isOn()) return;
    const target = event.target.closest("[data-act]");
    if (!target) return;
    const act = target.dataset.act;

    if (act === "begin-open") {
      q("[data-idea='9']")?.classList.toggle("is-open");
      return;
    }
    if (act === "here" || act === "begin-clean") {
      requestPointerClean();
      return;
    }
    if (act === "coward") {
      input?.focus();
      return;
    }
    if (act === "add-char") {
      if (!input) return;
      const slider = q("[data-idea='2'] input[type='range']");
      input.value = appendSliderChar(input.value, slider?.value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (act === "skip-captcha") {
      captchaDone = true;
      setCaptchaOpen(false);
      runGatedClean();
      return;
    }
    if (act === "hold") return;
    if (act === "cup") {
      const index = Number(target.dataset.index);
      if (shellIsClean(shellOrder, index)) requestPointerClean();
      else showSound("[wrong cup, politely]");
      return;
    }
    if (act === "prime") {
      primes = multiplyPrime(primes.product, Number(target.dataset.prime));
      if (primes.aggressive) gravity.aggressive = 80;
      syncPrimes();
      return;
    }
    if (act === "prime-reset") {
      primes = resetPrimes();
      syncPrimes();
      return;
    }
    if (act === "missile") {
      const box = root.querySelector(target.dataset.target);
      if (box) setCheckbox(box, !box.checked);
      const undo = q("[data-act='false-alarm']");
      if (undo) undo.hidden = false;
      return;
    }
    if (act === "false-alarm") {
      setCheckbox(cleanOnPaste, true);
      setCheckbox(autoCopy, false);
      setCheckbox(aggressiveMode, false);
      setCheckbox(removeDuplicates, false);
      gravity.paste = 100;
      gravity.copy = 0;
      gravity.aggressive = 0;
      gravity.duplicates = 0;
      primes = resetPrimes();
      syncGravityUi();
      syncPrimes();
      target.hidden = true;
      return;
    }
    if (act === "bob") {
      const box = root.querySelector(target.dataset.target);
      if (box) setCheckbox(box, !box.checked);
      return;
    }
    if (act === "cookie") {
      setCookieOpen(false);
      return;
    }
    if (act === "splash-clean") {
      splashDone = true;
      setSplashOpen(false);
      renderTour();
      return;
    }
    if (act === "splash-dead") {
      showSound("[a planet that goes nowhere]");
      return;
    }
    if (act === "tour-next") {
      tourIndex += 1;
      renderTour();
      return;
    }
    if (act === "tour-skip") {
      skipTour();
      return;
    }
    if (act === "hinge") {
      setCaseOpen(true);
      return;
    }
    if (act === "find95") {
      showSound("[Not available in this dialog]");
      return;
    }
    if (act === "mute") {
      target.textContent = "Already muted. We have no ears.";
      return;
    }
    if (act === "midi-volume") return;
  };

  const onCaptchaGridClick = (event) => {
    const cell = event.target.closest(".horrible-captcha-cell");
    if (!cell) return;
    const [left, right] = splitCaptchaCell(cell.dataset.fragment);
    const grid = cell.parentElement;
    const replacement = [left, right].map((text) => {
      const next = el(root, "button", "horrible-captcha-cell horrible-captcha-split", text);
      next.type = "button";
      next.dataset.fragment = text;
      next.classList.toggle("has-utm", captchaCellHasUtm(text));
      return next;
    });
    cell.replaceWith(...replacement);
    if (grid && grid.children.length > 18) {
      captchaDone = true;
      setCaptchaOpen(false);
    }
  };

  const onRangeInput = (event) => {
    const range = event.target.closest("input[type='range']");
    if (!range) return;
    if (range.dataset.gravity) {
      gravity[range.dataset.gravity] = Number(range.value) || 0;
      syncGravityUi();
      return;
    }
    if (range.dataset.phone) {
      const preview = q("[data-idea='2'] .horrible-phone-char");
      if (preview) preview.textContent = charFromSlider(range.value);
      return;
    }
  };

  const onWheelPointer = (event) => {
    if (!enabled || !isOn()) return;
    const wheel = event.target.closest("[data-idea='7'] .horrible-wheel");
    if (!wheel) return;
    if (event.type === "pointerdown") {
      wheel.setPointerCapture?.(event.pointerId);
      wheel.dataset.y = String(event.clientY);
      return;
    }
    if (event.type === "pointermove" && wheel.dataset.y) {
      const prev = Number(wheel.dataset.y);
      const delta = event.clientY - prev;
      wheel.dataset.y = String(event.clientY);
      const next = nextThumbwheelWinds(winds, delta);
      winds = next.winds;
      const offset = (Number.parseFloat(wheel.style.getPropertyValue("--wheel-y")) || 0) + delta;
      wheel.style.setProperty("--wheel-y", `${offset}px`);
      const count = q("[data-idea='7'] .horrible-wheel-count");
      if (count) {
        count.textContent = `${Math.min(winds, THUMBWHEEL_WINDS_NEEDED)} / ${THUMBWHEEL_WINDS_NEEDED} winds`;
      }
      if (next.armed) {
        winds = 0;
        requestPointerClean();
      }
    }
    if (event.type === "pointerup" || event.type === "pointercancel") {
      delete wheel.dataset.y;
    }
  };

  const onHoldPointer = (event) => {
    const button = event.target.closest("[data-act='hold']");
    if (!button) return;
    if (event.type === "pointerdown") {
      holdStart = { x: event.clientX, y: event.clientY };
      const bar = q("[data-idea='10'] .horrible-hold-bar");
      bar?.classList.add("is-filling");
      holdTimer = view().setTimeout(() => {
        holdTimer = 0;
        requestPointerClean();
      }, HOLD_CLEAN_MS);
      return;
    }
    if (event.type === "pointermove" && holdStart && holdMovedTooFar(holdStart, { x: event.clientX, y: event.clientY })) {
      view().clearTimeout(holdTimer);
      holdTimer = 0;
      holdStart = null;
      q("[data-idea='10'] .horrible-hold-bar")?.classList.remove("is-filling");
      return;
    }
    if (event.type === "pointerup" || event.type === "pointercancel") {
      view().clearTimeout(holdTimer);
      holdTimer = 0;
      holdStart = null;
      q("[data-idea='10'] .horrible-hold-bar")?.classList.remove("is-filling");
    }
  };

  const beforeClean = ({ source, proceed } = {}) => {
    stopSlotReveal();
    if (!enabled || !isOn()) return false;
    if (source === "form" || source === "keyboard") {
      captchaDone = true;
      setCaptchaOpen(false);
      proceed?.();
      return true;
    }
    return false;
  };

  const afterClean = ({ url } = {}) => {
    stopSlotReveal();
    if (!enabled || !isOn()) return;
    setSwap(!swapLabels);
    zoomSeed += 1;
    applyZoom();
    setCaseOpen(false);
    showNarrator();
    showSound(pickSoundCaption(soundIndex));
    if (message && message.dataset.kind === "success") {
      message.dataset.original = message.textContent;
      message.textContent = PROGRAMMERISM_SUCCESS;
    }
    const slot = q("[data-idea='11']");
    if (slot && url && !reduced()) {
      const generation = slotGeneration;
      slot.hidden = false;
      let tick = 0;
      slotTimer = view().setInterval(() => {
        if (!shouldCommitSlotReveal(generation, slotGeneration, enabled && isOn())) {
          stopSlotReveal();
          return;
        }
        tick += 1;
        slot.textContent = slotCharsForTick(url, tick);
        if (tick >= SLOT_TICKS) {
          view().clearInterval(slotTimer);
          slotTimer = 0;
          slot.textContent = url;
          slotRevealTimer = view().setTimeout(() => {
            slotRevealTimer = 0;
            if (!shouldCommitSlotReveal(generation, slotGeneration, enabled && isOn())) return;
            slot.hidden = true;
            if (cleanedUrl) cleanedUrl.textContent = url;
          }, 400);
        }
      }, 90);
    }
  };

  const bindOnce = () => {
    const rootHost = host();
    const overlayHost = overlays();
    if (!rootHost || rootHost.dataset.bound === "true") return;
    rootHost.dataset.bound = "true";
    rootHost.addEventListener("click", onPlaybookClick);
    rootHost.addEventListener("input", onRangeInput);
    rootHost.addEventListener("pointerdown", onWheelPointer);
    rootHost.addEventListener("pointermove", onWheelPointer);
    rootHost.addEventListener("pointerup", onWheelPointer);
    rootHost.addEventListener("pointercancel", onWheelPointer);
    rootHost.addEventListener("pointerdown", onHoldPointer);
    rootHost.addEventListener("pointermove", onHoldPointer);
    rootHost.addEventListener("pointerup", onHoldPointer);
    rootHost.addEventListener("pointercancel", onHoldPointer);
    overlayHost?.addEventListener("click", onPlaybookClick);
    q("[data-idea='5'] .horrible-captcha-grid")?.addEventListener("click", onCaptchaGridClick);
  };

  const enable = () => {
    enabled = true;
    bindOnce();
    rememberSettings();
    applyLabels();
    applyTheme();
    applyZoom();
    syncMarquee();
    syncPasswordRules();
    fillCaptcha(CAPTCHA_FRAGMENTS);
    setCaptchaOpen(false);
    captchaDone = false;
    setCookieOpen(true);
    setSplashOpen(!splashDone);
    if (splashDone) renderTour();
    else {
      const card = q("[data-idea='25']");
      if (card) card.hidden = true;
    }
    setDialupOpen(false);
    setCaseOpen(false);
    setSwap(false);
    renderShell();
    if (!reduced()) view().setTimeout(shuffleShell, 900);
    syncPrimes();
    gravity.paste = cleanOnPaste?.checked ? 100 : 0;
    gravity.copy = autoCopy?.checked ? 100 : 0;
    gravity.aggressive = aggressiveMode?.checked ? 100 : 0;
    gravity.duplicates = removeDuplicates?.checked ? 100 : 0;
    syncGravityUi();
    startGravity();
    visuallyHide(settings?.querySelector("legend"), false);
    if (cleanOnPaste) visuallyHide(cleanOnPaste.closest(".setting"), true);
    if (autoCopy) visuallyHide(autoCopy.closest(".setting"), true);
    if (aggressiveMode) visuallyHide(aggressiveMode.closest(".setting"), true);
    if (removeDuplicates) visuallyHide(removeDuplicates.closest(".setting"), true);
    view().setTimeout(spawnQuerry, 1200);
    const phone = q("[data-idea='2'] input[type='range']");
    if (phone) phone.value = String(clampAsciiCode(104));
    const preview = q("[data-idea='2'] .horrible-phone-char");
    if (preview) preview.textContent = "h";
    const midi = q("[data-idea='31'] .horrible-midi-bar");
    midi?.classList.toggle("is-playing", !reduced());
  };

  const disable = () => {
    enabled = false;
    stopGravity();
    stopSlotReveal();
    view().clearTimeout(holdTimer);
    holdTimer = 0;
    restoreLabels();
    const restored = restoreSettings();
    setCaptchaOpen(true);
    const captcha = q("[data-idea='5']");
    if (captcha) captcha.hidden = true;
    setSplashOpen(true);
    const splash = q("[data-idea='26']");
    if (splash) splash.hidden = true;
    setCookieOpen(true);
    const cookie = q("[data-idea='23']");
    if (cookie) cookie.hidden = true;
    setDialupOpen(false);
    skipTour();
    const tour = q("[data-idea='25']");
    if (tour) tour.hidden = true;
    setCaseOpen(false);
    setSwap(false);
    delete root.documentElement.dataset.horribleTheme;
    root.documentElement.style.removeProperty("--horrible-scale");
    root.documentElement.classList.remove("horrible-swap-labels");
    if (cleanOnPaste) visuallyHide(cleanOnPaste.closest(".setting"), false);
    if (autoCopy) visuallyHide(autoCopy.closest(".setting"), false);
    if (aggressiveMode) visuallyHide(aggressiveMode.closest(".setting"), false);
    if (removeDuplicates) visuallyHide(removeDuplicates.closest(".setting"), false);
    captchaDone = false;
    splashDone = false;
    tourIndex = 0;
    winds = 0;
    querrySpawned = false;
    primes = resetPrimes();
    themeIndex = 0;
    if (message?.dataset.original) {
      message.textContent = message.dataset.original;
      delete message.dataset.original;
    }
    return restored;
  };

  cleanButton?.addEventListener("click", onCleanClick);
  themeToggle?.addEventListener("click", onThemeClick, true);
  input?.addEventListener("input", onInput);
  form?.addEventListener("submit", () => {
    if (enabled && isOn()) showSound("[form submission, silently]");
  });

  return {
    enable,
    disable,
    beforeClean,
    afterClean,
    skipTour,
    requestPointerClean
  };
}

export { HORRIBLE_THEMES };
