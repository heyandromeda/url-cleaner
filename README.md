# URL Cleaner

Remove common tracking parameters from URLs without stripping parameters that a page actually needs.

> **Built entirely with [Cursor](https://cursor.com/), [Claude Code](https://www.anthropic.com/claude-code) and [ChatGPT Codex](https://openai.com/codex/).**

[![Open live tool](https://img.shields.io/badge/TRY%20IT-Live%20URL%20Cleaner-2563eb?style=for-the-badge)](https://andromeda-url-cleaner.vercel.app)
[![Browser only](https://img.shields.io/badge/RUNS%20LOCALLY-No%20backend-16a34a?style=flat-square)](https://github.com/heyandromeda/url-cleaner)

**[Open the live tool](https://andromeda-url-cleaner.vercel.app)** · **[Browse the source](https://github.com/heyandromeda/url-cleaner)** · **[View the tests](https://github.com/heyandromeda/url-cleaner/blob/main/tests/url-cleaner.test.js)**

## Why this exists

Many shared links contain analytics and advertising parameters that are useful to marketers but unnecessary for the person opening the link.

URL Cleaner removes known tracking parameters while taking a conservative approach:

> It removes only recognized trackers. Unknown parameters are kept.

That means search terms, product IDs, page numbers, language settings, invite codes, authentication parameters, and other page-specific values are preserved unless they are explicitly listed as trackers.

## Features

- Removes common UTM, Google Ads, Microsoft/Bing, social, email, analytics, affiliate, HubSpot, Matomo, and Adobe tracking parameters
- Removes tracker families such as `utm_*`, `hsa_*`, `mtm_*`, `piwik_*`, and `_ga_*`
- Removes explicit Matomo parameters such as `pk_campaign` and `pk_kwd` while preserving unrelated names such as `pk_live`
- Preserves unknown and functional parameters by default
- Applies site-specific rules conservatively, including removing `si` only from YouTube and Spotify links
- Keeps YouTube parameters such as `v`, `t`, and `list`
- Unwraps known Google (including country domains such as `google.co.uk`), Facebook, Instagram `l.instagram.com`, Outlook Safe Links, YouTube, LinkedIn `/safety/go` and `/redir/redirect`, and `href.li` redirect wrappers locally, then cleans the destination
- Limits nested wrapper unwrapping to five levels, says so when a link is still wrapped after that, and falls back safely when a destination is invalid
- Accepts only HTTP and HTTPS URLs
- Preserves URL paths, hashes, search queries, page numbers, product IDs, and language settings
- Writes kept parameters back exactly as they were written, so values are never re-encoded or reordered
- Paste directly from the clipboard with the **Paste** button
- Optionally cleans automatically whenever you paste
- If clipboard read is already permitted, offers to clean whatever is on the clipboard when the page opens
- Cleans a batch of URLs pasted one per line, with per-line success or failure and one-click copy of cleaned results
- Explains recognized removed tracking parameters from the results view; tap a name to expand a short local note, and unknown names are not described
- Shows a collapsible Tracker of the Day card with a richer local explanation, example URL, privacy notes, fun facts, and cited sources; expand/collapse preference is remembered in localStorage
- Installable as a PWA with a share target so a phone can hand a link to the local cleaner
- Optionally copies every successfully cleaned URL automatically
- Remembers your settings locally without storing URLs or clipboard contents
- Shows a mobile-friendly before/after view and highlights exactly which parameters were removed
- Shows a local tracking fingerprint: one count of tracking parameters, affiliate/referral parameters, and redirect wrappers, labeled from **Clean slate** to **Tracking parade**
- Lists every unwrapped redirect layer with its wrapper host, the parameter that held the destination, and where it pointed
- Includes a URL X-Ray view that breaks the link into scheme, host, port, path, fragment, and parameters tagged as tracking, affiliate/referral, redirect-related, functional, or unknown
- **Inspect URL** opens the X-Ray directly and never auto-copies
- Decodes double-encoded parameter values in the X-Ray so a buried destination such as `https%253A%252F%252F…` is shown readable, without opening or fetching it
- Optional **Aggressive cleaning** also removes broader referral and campaign names (`ref`, `source`, `src`, `campaign`, `partner`, `affiliate`, `clickid`, and similar), marks each one as `(aggressive)`, and is off by default because some sites need those names
- Optional **Remove identical duplicates** drops repeated parameters only when name and value are both identical (`tag=a&tag=a`), keeps repeats with different values (`item=1&item=2`), and is off by default so signed links stay untouched
- Flags unusual URL structure (without claiming malice) via the weirdness detector: very long queries, repeated parameter names, embedded usernames or passwords, punycode hosts, non-standard ports, double percent-encoding, percent-encoded plain letters or digits, nested `#` in parameter values, and stacked redirect wrappers
- Opens the native system Share Sheet for a cleaned URL on supported browsers
- Warns when a shortened link hides a destination that cannot be inspected locally
- Copies the cleaned URL with one click
- Picks the link out of shared text such as `check this out: https://…!`, dropping trailing punctuation and unmatched closing parentheses while keeping ones that belong to the URL, like `Urchin_(software)`
- Loads a `#url=` handoff into a tab that is already open, without a page reload
- Handles invalid URLs clearly
- Runs entirely in the browser with no backend, accounts, analytics, database, or external API
- **MCP server** (`mcp/`): zero-dependency stdio/HTTP adapter so Grok Bots, Cursor, Claude Code, Codex, and other MCP clients can call the same cleaning engine locally (URLs are never fetched)
- Optional unpacked Chrome extension and a one-line bookmarklet that reuse the same local cleaner and `#url=` handoff

## MCP server

The [`mcp/`](./mcp/) folder ships an official Model Context Protocol server that wraps the repo engine (`cleanUrl`, `inspectUrl`, batch clean, explanations, capabilities). Use **stdio** for local IDE and agent configs, or **HTTP** on `127.0.0.1` with a bearer token for tools that need a remote URL on your own machine.

It is not deployed with the static site on Vercel. Setup, tools, auth, and client examples: **[mcp/README.md](./mcp/README.md)**.

## Why choose URL Cleaner

Choose URL Cleaner when you want a link-cleaning tool that stays simple, transparent, and privacy-friendly:

- **Conservative by design:** removes recognized trackers while preserving unknown parameters that may be required by a page.
- **Private by default:** cleaning happens in your browser; URLs and clipboard contents are not uploaded or stored.
- **No account or setup:** open the live tool and use it immediately.
- **Easy on mobile:** paste from the clipboard, clean automatically on paste, or use the Copy button.
- **Share Sheet friendly:** use the included Apple Shortcut flow from iPhone, iPad, or Mac.
- **Open and reusable:** the source is public, MIT-licensed, and easy to run locally.
- **Honest about limits:** shortened links get an informational notice instead of a false safety claim.
- **Small and understandable:** plain HTML, CSS, and JavaScript with no framework or backend.

## Feature examples

### Remove trackers and keep functional values

Before:

```
https://www.youtube.com/watch?v=abc123&utm_source=newsletter&gclid=example#comments
```

After:

```
https://www.youtube.com/watch?v=abc123#comments
```

The YouTube video ID and page fragment stay intact while the tracking parameters are removed.

### Unwrap a known redirect locally

Before:

```
https://www.google.com/url?q=https%3A%2F%2Fexample.com%2Fpage%3Futm_source%3Dnews%26id%3D9&sa=D
```

After:

```
https://example.com/page?id=9
```

URL Cleaner extracts the destination from the Google wrapper without opening it or making a network request, removes `utm_source`, keeps `id=9`, and displays a **Redirect unwrapped** notice naming the wrapper host.

The same local behavior supports Google country domains and search-result links that use `url=`, Facebook `/l.php`, Instagram `l.instagram.com`, Outlook Safe Links, YouTube `/redirect`, LinkedIn `/safety/go` and `/redir/redirect`, and `href.li`. Nested known wrappers are handled up to five levels deep, including destinations that were percent-encoded twice. Cleaning, URL X-Ray, and the tracking fingerprint share one unwrap engine, so they always report the same layers.

### Apply tracker rules only where they belong

```
https://www.youtube.com/watch?v=abc123&si=SHAREID&t=30s
→ https://www.youtube.com/watch?v=abc123&t=30s
```

```
https://intranet.example/report?si=42&year=2024
→ https://intranet.example/report?si=42&year=2024
```

The `si` parameter is removed from YouTube and Spotify sharing links but preserved on unrelated sites. Matomo names such as `pk_campaign` and `pk_kwd` are removed, while unrelated names such as `pk_live` remain.

### Reject unsupported URL schemes

Inputs using `javascript:`, `data:`, `file:`, or `ftp:` are rejected with a clear HTTP/HTTPS validation message.

## Shortened links

Known shortened links receive an informational notice. URL Cleaner cleans the visible short URL but does not follow its redirect, make a network request, or claim to inspect the hidden destination.

## Use the live tool

Open **[andromeda-url-cleaner.vercel.app](https://andromeda-url-cleaner.vercel.app)**, paste a URL, and select **Clean URL**.

The app does not upload the URL anywhere. Copying and pasting use your browser's clipboard permission. See [Privacy](#privacy) for how handoffs from the Shortcut and share target work.

## Share Sheet shortcut for iPhone, iPad, and Mac

A native Share Sheet extension would require a separate Xcode app. The project stays a lightweight static website instead.

You can get the same practical flow with an Apple Shortcut:

**Share URL → open URL Cleaner → clean locally → copy/share the result**

### Create the Shortcut

1. Open the **Shortcuts** app and create a new shortcut.
2. Open the shortcut's details and enable **Show in Share Sheet**.
3. Set the accepted input to **URLs** (or URLs and text if you want broader input).
4. Add **Get URLs from Shortcut Input**.
5. Add **URL Encode** or **Encode URL**, using the URL from the previous action.
6. Add a **Text** action containing this URL, replacing the bracketed part with the encoded value:
   ```
   https://andromeda-url-cleaner.vercel.app/#url=[Encoded URL]
   ```
7. Add **Open URLs** using that Text action.
8. Save it as **Clean URL with URL Cleaner**.

Now share a URL from Safari or another app, choose the shortcut, and URL Cleaner will open with the URL loaded and cleaned automatically. Tap **Share** to open the system Share Sheet, or tap **Copy**.

### Share Sheet limitations

- The Shortcut passes the link after the `#`, which browsers never send to a server, so the link stays on your device. The Android share target POSTs into the service worker, which redirects to `/#url=` without a network request. Older Shortcuts that use `?url=` still work, but that form sends the link to the web host in the page request; switch them to `/#url=`.
- The **Share** button uses the browser's Web Share support. It appears only where that API is available; **Copy** remains the fallback.
- iOS and macOS may block silent clipboard writes when a page opens without a direct user gesture. The app therefore always displays the cleaned URL, and the **Share** and **Copy** buttons remain reliable final steps.
- The app removes the handoff value from the address bar after loading it.

## Browser extension + bookmarklet

The site already accepts `/#url=` handoffs. These two extras send the current page there, or clean it in the browser, without a store listing.

### Bookmarklet

Create a bookmark whose URL is this code. On a desktop browser you can also drag that bookmark onto the bookmarks bar. On iPhone Safari, add any bookmark, then edit its address to the code:

```
javascript:(()=>{window.open('https://andromeda-url-cleaner.vercel.app/#url='+encodeURIComponent(location.href),'_blank')})()
```

One tap opens URL Cleaner with the current page URL in the hash. No extra scripts and no tracking. The link is never sent as `?url=`.

### Load the unpacked extension

[`extension/`](./extension/) is a Manifest V3 add-on. It is not published to a store. Toolbar click cleans the current tab locally with `cleanUrl()`, copies the result, and shows one line about what was removed. Permissions are only `activeTab` and `clipboardWrite`. The page URL is never fetched.

1. From the repo root, run `npm run build` so `extension/vendor/` gets a copy of the engine.
2. In Chrome, open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked**, and choose the `extension/` folder.
3. Pin the icon if you want, then click it on any `http(s)` page.

`chrome://`, `file:`, and `about:blank` pages show **Nothing to clean on this page.** Shortened links are cleaned in place and warned about; they are not followed.

## Run locally

The app needs no build step and no package installation.

```bash
git clone https://github.com/heyandromeda/url-cleaner.git
cd url-cleaner
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

Using a local web server is recommended because browser module imports may be restricted when opening `index.html` directly as a `file://` URL.

## Run the tests

The project uses Node's built-in test runner:

```bash
npm test
```

The test suite covers:

- UTM-only URLs
- Additional ad, analytics, and affiliate trackers
- Trackers mixed with legitimate parameters
- YouTube links
- URLs without query strings
- Hash fragments
- Invalid and non-HTTP(S) input
- Case-insensitive tracker names
- Known redirect wrappers, including nested wrappers
- Site-scoped parameters such as YouTube and Spotify `si`
- Explicit Matomo parameters while preserving unrelated `pk_*` names
- Known opaque URL shorteners that are warned about without being followed
- Batch cleaning that continues after invalid lines
- Local tracker explanations, rich tracker-of-the-day profiles, and deterministic daily selection
- Tracking fingerprint scoring, URL X-Ray categorization, encoded value decoding, and weirdness flags
- Opt-in aggressive cleaning and identical-duplicate cleanup, including batch mode
- Share-target POST, `#url=` and `?url=` handoff parsing
- Manifest, service worker, and CSP constraints for the installable app
- Every root web file matching its `dist/` copy byte-for-byte, since Vercel serves `dist/`
- The unpacked extension popup: YouTube `si` cleanup, invalid input, long URLs, opaque shorteners, and non-http(s) pages

GitHub Actions runs `npm test` on every push to `main` and on pull requests.

## Project structure

| File | Purpose |
| --- | --- |
| [index.html](./index.html) | Runnable app page |
| [styles.css](./styles.css) | Minimal styling |
| [cleaner.js](./cleaner.js) | URL-cleaning logic, tracker lists, inspection helpers, and batch processing |
| [explanations.js](./explanations.js) | Local tracker explanations and tracker-of-the-day selection |
| [tracker-profiles.js](./tracker-profiles.js) | Sourced educational profiles for Tracker of the Day |
| [handoff.js](./handoff.js) | Share-target, hash handoff, and clipboard-permission helpers |
| [app.js](./app.js) | Form, clipboard, settings, and copy interactions |
| [manifest.webmanifest](./manifest.webmanifest) | Web app manifest and share target |
| [sw.js](./sw.js) | Service worker for installability and local share-target POST handoff (no caching, no network) |
| [middleware.js](./middleware.js) | Vercel Routing Middleware: 303 share-target POSTs to `/` without reading the body |
| [tests/](./tests) | Automated tests (cleaning, batch, explanations, handoff, PWA, favicon, production URL, `dist/` sync, extension popup) |
| [extension/](./extension/) | Unpacked MV3 add-on; imports `cleanUrl()` via a vendor copy of the engine |
| [vercel.json](./vercel.json) | Vercel config: serves `dist/` and sets the security headers |
| [.github/workflows/test.yml](./.github/workflows/test.yml) | Runs `npm test` in CI |
| [LICENSE](./LICENSE) | MIT License |
| [dist/](./dist) | Static-site copy used by the hosted deployment |

## Extend the tracker lists

The tracker lists live in [cleaner.js](./cleaner.js):

- Add a lowercase exact-match parameter to `TRACKING_PARAMETERS`
- Add a lowercase family prefix to `TRACKING_PARAMETER_PREFIXES`

For example, a family prefix of `example_` would remove `example_source` and `example_campaign`.

Avoid adding broad names such as `id`, `ref`, `source`, or `token`: those can be required for a page to work. Add only parameters confirmed to be tracking-related. Broader names that are usually but not always tracking belong in `AGGRESSIVE_PARAMETERS`, which only applies when aggressive cleaning is switched on.

## Important limitation

No tracker list can identify every parameter used by every website. This project intentionally favors preserving unknown parameters over making an aggressive guess that could break a link.

## Privacy

URL cleaning happens locally in your browser. URLs and clipboard contents are not uploaded or stored. Only six preferences are saved locally: whether to clean on paste, whether to auto-copy, whether aggressive cleaning and duplicate cleanup are on, whether the Tracker of the Day card is collapsed, and whether light or dark theme is selected. The app has no backend, accounts, analytics, database, or telemetry.

How a link reaches the app matters:

- **Paste, Paste button, clipboard offer:** the link never leaves the page.
- **Shortcut (`/#url=`):** the link is passed after the `#`. Browsers do not send that part to the server, so the host only sees a plain request for the page.
- **Android share target:** the installed PWA receives a POST. When the service worker is controlling the page, it intercepts that POST and redirects to a `/#url=&text=&title=` hash, so the shared fields never leave the device and an invalid `url` field can still fall back to a link in `text` or `title`. If the worker is not yet active (first launch or cleared storage), Vercel Routing Middleware responds `303` to `/` without reading the POST body, so the host never logs the shared link; the URL is dropped and you can paste or share again after install.
- **Bookmarklet and extension (`/#url=`):** same hash handoff as the Shortcut. The extension also cleans in the toolbar popup and never requests the page URL; it only asks for `activeTab` and `clipboardWrite`.
- **Old `?url=` links:** still work, but that form sends the link to the web host in the page request. Use `/#url=` or paste if you want to avoid that.

The hosted site enforces this with security headers set in [vercel.json](./vercel.json). The Content Security Policy uses `connect-src 'none'`, so the page cannot make network requests even if it tried, and only loads its own scripts and styles. It also sends `Referrer-Policy: no-referrer`, refuses to be framed, and disables camera, microphone, geolocation, payment, and USB access. The service worker exists for installability and to keep share-target POSTs on-device; it caches nothing and never fetches the shared URL.

## License

This project is released under the [MIT License](./LICENSE).

You are free to:

- Use it privately or commercially
- Copy, modify, and fork it
- Redistribute it
- Include it in other projects

The only requirement is to keep the copyright and license notice with copies or substantial portions of the software. The software is provided without warranty.
