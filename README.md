# URL Cleaner

Remove common tracking parameters from URLs without stripping parameters that a page actually needs.

> 🧪 **Want the experimental version? [Open URL Cleaner Nightly](https://andromeda-url-cleaner-nightly.vercel.app).** It is deployed separately from the stable `main` build.

> **Built entirely with [Cursor](https://cursor.com/), [Claude Code](https://www.anthropic.com/claude-code) and [ChatGPT Codex](https://openai.com/codex/).**

[![Open live tool](https://img.shields.io/badge/TRY%20IT-Live%20URL%20Cleaner-2563eb?style=for-the-badge)](https://andromeda-url-cleaner.vercel.app)
[![Nightly build](https://img.shields.io/badge/TRY%20NIGHTLY-Experimental-f59e0b?style=for-the-badge)](https://andromeda-url-cleaner-nightly.vercel.app)
[![Browser only](https://img.shields.io/badge/RUNS%20LOCALLY-No%20backend-16a34a?style=flat-square)](https://github.com/heyandromeda/url-cleaner)

**[Open the stable tool](https://andromeda-url-cleaner.vercel.app)** · **[Use the nightly build](https://andromeda-url-cleaner-nightly.vercel.app)** · **[Browse the source](https://github.com/heyandromeda/url-cleaner)** · **[View the tests](https://github.com/heyandromeda/url-cleaner/blob/main/tests/url-cleaner.test.js)**

### Try the nightly lab

The separate **[public nightly build](https://andromeda-url-cleaner-nightly.vercel.app)** currently includes three experiments that are not part of stable `main`:
- DEV-7 — Encoded value decoder
- DEV-9 — Opt-in aggressive cleaning
- DEV-12 — Opt-in identical-duplicate cleanup

Stable `main` now includes the former nightly experiments for URL X-Ray (DEV-2), tracking fingerprint (DEV-3), and the URL weirdness detector (DEV-11).

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
- Applies site-specific rules conservatively, including removing `si` only from YouTube links
- Keeps YouTube parameters such as `v`, `t`, and `list`
- Unwraps known Google, Facebook, Outlook Safe Links, YouTube, LinkedIn `/safety/go`, and `href.li` redirect wrappers locally, then cleans the destination
- Limits nested wrapper unwrapping to three levels and falls back safely when a destination is invalid
- Accepts only HTTP and HTTPS URLs
- Preserves URL paths, hashes, search queries, page numbers, product IDs, and language settings
- Paste directly from the clipboard with the **Paste** button
- Optionally cleans automatically whenever you paste
- If clipboard read is already permitted, offers to clean whatever is on the clipboard when the page opens
- Cleans a batch of URLs pasted one per line, with per-line success or failure and one-click copy of cleaned results
- Explains recognized removed tracking parameters from the results view; unknown names are not described
- Shows a collapsible Tracker of the Day card with a richer local explanation, example URL, privacy notes, fun facts, and cited sources; expand/collapse preference is remembered in localStorage
- Includes a bookmarklet that only opens URL Cleaner with the current page URL
- Installable as a PWA with a share target so a phone can hand a link to the local cleaner
- Optionally copies every successfully cleaned URL automatically
- Remembers the two settings locally without storing URLs or clipboard contents
- Shows a mobile-friendly before/after view and highlights exactly which parameters were removed
- Shows a local tracking fingerprint with a plain count and category breakdown
- Includes a URL X-Ray view that breaks the link into scheme, host, path, fragment, and categorized parameters
- Flags unusual URL structure (without claiming malice) via the weirdness detector
- Opens the native system Share Sheet for a cleaned URL on supported browsers
- Warns when a shortened link hides a destination that cannot be inspected locally
- Copies the cleaned URL with one click
- Supports pressing Enter to clean
- Handles invalid URLs clearly
- Runs entirely in the browser with no backend, accounts, analytics, database, or external API

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

The same local behavior supports Facebook `/l.php`, Outlook Safe Links, YouTube `/redirect`, and `href.li`. Nested known wrappers are handled up to three levels deep.

### Apply tracker rules only where they belong

```
https://www.youtube.com/watch?v=abc123&si=SHAREID&t=30s
→ https://www.youtube.com/watch?v=abc123&t=30s
```

```
https://intranet.example/report?si=42&year=2024
→ https://intranet.example/report?si=42&year=2024
```

The `si` parameter is removed from YouTube sharing links but preserved on unrelated sites. Matomo names such as `pk_campaign` and `pk_kwd` are removed, while unrelated names such as `pk_live` remain.

### Reject unsupported URL schemes

Inputs using `javascript:`, `data:`, `file:`, or `ftp:` are rejected with a clear HTTP/HTTPS validation message.

## Shortened links

Known shortened links receive an informational notice. URL Cleaner cleans the visible short URL but does not follow its redirect, make a network request, or claim to inspect the hidden destination.

## Use the live tool

Open **[andromeda-url-cleaner.vercel.app](https://andromeda-url-cleaner.vercel.app)**, paste a URL, and select **Clean URL**.

The app does not upload the URL anywhere. Copying and pasting use your browser's clipboard permission.

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
   https://andromeda-url-cleaner.vercel.app?url=[Encoded URL]
   ```
7. Add **Open URLs** using that Text action.
8. Save it as **Clean URL with URL Cleaner**.

Now share a URL from Safari or another app, choose the shortcut, and URL Cleaner will open with the URL loaded and cleaned automatically. Tap **Share** to open the system Share Sheet, or tap **Copy**.

### Publish a public install link

Apple creates public Shortcut links from an iPhone, iPad, or Mac signed in to iCloud; the link cannot be generated by this website or repository.

1. Open **Clean URL with URL Cleaner** in the Shortcuts app.
2. Select **Share**, then **Copy iCloud Link**.
3. Replace `PUBLIC_ICLOUD_SHORTCUT_LINK` below with the copied `https://www.icloud.com/shortcuts/...` URL:

   ```markdown
   [![Add URL Cleaner Shortcut](https://img.shields.io/badge/ADD-URL%20Cleaner%20Shortcut-7c3aed?style=for-the-badge)](PUBLIC_ICLOUD_SHORTCUT_LINK)
   ```

Keeping the public link in this README makes the Shortcut installable while leaving Apple as the trusted source for the signed Shortcut file.

### Share Sheet limitations

- The Shortcut handoff is local to the browser after the page opens; no URL is sent to a backend.
- The **Share** button uses the browser's Web Share support. It appears only where that API is available; **Copy** remains the fallback.
- iOS and macOS may block silent clipboard writes when a page opens without a direct user gesture. The app therefore always displays the cleaned URL, and the **Share** and **Copy** buttons remain reliable final steps.
- The app removes the `url` handoff value from the address bar after loading it.

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
- Site-scoped parameters such as YouTube `si`
- Explicit Matomo parameters while preserving unrelated `pk_*` names
- Known opaque URL shorteners that are warned about without being followed
- Batch cleaning that continues after invalid lines
- Local tracker explanations, rich tracker-of-the-day profiles, and deterministic daily selection
- Tracking fingerprint scoring, URL X-Ray categorization, and weirdness flags
- Share-target / `?url=` handoff parsing and bookmarklet redirect-only behavior
- Manifest, service worker, and CSP constraints for the installable app

## Project structure

| File | Purpose |
| --- | --- |
| [index.html](./index.html) | Runnable app page |
| [styles.css](./styles.css) | Minimal styling |
| [cleaner.js](./cleaner.js) | URL-cleaning logic, tracker lists, inspection helpers, and batch processing |
| [explanations.js](./explanations.js) | Local tracker explanations and tracker-of-the-day selection |
| [tracker-profiles.js](./tracker-profiles.js) | Sourced educational profiles for Tracker of the Day |
| [handoff.js](./handoff.js) | Share-target, bookmarklet, and clipboard-permission helpers |
| [app.js](./app.js) | Form, clipboard, settings, and copy interactions |
| [manifest.webmanifest](./manifest.webmanifest) | Web app manifest and share target |
| [sw.js](./sw.js) | Minimal service worker for installability (no caching) |
| [tests/url-cleaner.test.js](./tests/url-cleaner.test.js) | Automated tests |
| [LICENSE](./LICENSE) | MIT License |
| [dist/](./dist) | Static-site copy used by the hosted deployment |

## Extend the tracker lists

The tracker lists live in [cleaner.js](./cleaner.js):

- Add a lowercase exact-match parameter to `TRACKING_PARAMETERS`
- Add a lowercase family prefix to `TRACKING_PARAMETER_PREFIXES`

For example, a family prefix of `example_` would remove `example_source` and `example_campaign`.

Avoid adding broad names such as `id`, `ref`, `source`, or `token`: those can be required for a page to work. Add only parameters confirmed to be tracking-related.

## Important limitation

No tracker list can identify every parameter used by every website. This project intentionally favors preserving unknown parameters over making an aggressive guess that could break a link.

## Privacy

URL cleaning happens locally in your browser. URLs and clipboard contents are not uploaded or stored. Only the two setting preferences are saved locally: whether to clean on paste and whether to auto-copy. The app has no backend, accounts, analytics, database, or telemetry.

## License

This project is released under the [MIT License](./LICENSE).

You are free to:

- Use it privately or commercially
- Copy, modify, and fork it
- Redistribute it
- Include it in other projects

The only requirement is to keep the copyright and license notice with copies or substantial portions of the software. The software is provided without warranty.
