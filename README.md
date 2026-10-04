# URL Cleaner

Remove common tracking parameters from URLs without stripping parameters that a page actually needs.

> **Built entirely with [ChatGPT Codex](https://openai.com/codex/).**

[![Open live tool](https://img.shields.io/badge/TRY%20IT-Live%20URL%20Cleaner-2563eb?style=for-the-badge)](https://url-cleaner.heyandromeda.chatgpt.site)
[![Browser only](https://img.shields.io/badge/RUNS%20LOCALLY-No%20backend-16a34a?style=flat-square)](https://github.com/heyandromeda/url-cleaner)

**[Open the live tool](https://url-cleaner.heyandromeda.chatgpt.site)** · **[Browse the source](https://github.com/heyandromeda/url-cleaner)** · **[View the tests](https://github.com/heyandromeda/url-cleaner/blob/main/tests/url-cleaner.test.js)**

## Why this exists

Many shared links contain analytics and advertising parameters that are useful to marketers but unnecessary for the person opening the link.

URL Cleaner removes known tracking parameters while taking a conservative approach:

> It removes only recognized trackers. Unknown parameters are kept.

That means search terms, product IDs, page numbers, language settings, invite codes, authentication parameters, and other page-specific values are preserved unless they are explicitly listed as trackers.

## Features

- Removes common UTM, Google Ads, Microsoft/Bing, social, email, analytics, affiliate, HubSpot, Matomo, and Adobe tracking parameters
- Removes tracker families such as `utm_*`, `hsa_*`, `mtm_*`, `pk_*`, `piwik_*`, and `_ga_*`
- Preserves unknown and functional parameters by default
- Keeps YouTube parameters such as `v`, `t`, and `list`
- Preserves URL paths, hashes, search queries, page numbers, product IDs, and language settings
- Paste directly from the clipboard with the **Paste** button
- Optionally cleans automatically whenever you paste
- Optionally copies every successfully cleaned URL automatically
- Remembers the two settings locally without storing URLs or clipboard contents
- Shows exactly which parameters were removed
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
- **Small and understandable:** plain HTML, CSS, and JavaScript with no framework or backend.

## Example

Before:

```
https://www.youtube.com/watch?v=abc123&utm_source=newsletter&gclid=example#comments
```

After:

```
https://www.youtube.com/watch?v=abc123#comments
```

The YouTube video ID and page fragment stay intact.

## Use the live tool

Open **[url-cleaner.heyandromeda.chatgpt.site](https://url-cleaner.heyandromeda.chatgpt.site)**, paste a URL, and select **Clean URL**.

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
   https://url-cleaner.heyandromeda.chatgpt.site/?url=[Encoded URL]
   ```
7. Add **Open URLs** using that Text action.
8. Save it as **Clean URL with URL Cleaner**.

Now share a URL from Safari or another app, choose the shortcut, and URL Cleaner will open with the URL loaded and cleaned automatically. Tap **Copy**, then paste or share the result wherever you need it.

### Share Sheet limitations

- The Shortcut handoff is local to the browser after the page opens; no URL is sent to a backend.
- iOS and macOS may block silent clipboard writes when a page opens without a direct user gesture. The app therefore always displays the cleaned URL, and the **Copy** button remains the reliable final step.
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
- Invalid input
- Case-insensitive tracker names

## Project structure

| File | Purpose |
| --- | --- |
| [index.html](./index.html) | Runnable app page |
| [styles.css](./styles.css) | Minimal styling |
| [cleaner.js](./cleaner.js) | URL-cleaning logic and tracker lists |
| [app.js](./app.js) | Form, clipboard, settings, and copy interactions |
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
