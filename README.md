# URL Cleaner

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Open%20URL%20Cleaner-2563eb?style=for-the-badge)](https://url-cleaner.heyandromeda.chatgpt.site)
[![Browser Only](https://img.shields.io/badge/Browser--only-No%20backend-16a34a?style=flat-square)](https://github.com/heyandromeda/url-cleaner)

Remove common tracking parameters from URLs without removing parameters that a page actually needs.

**[Open the live tool](https://url-cleaner.heyandromeda.chatgpt.site)** · **[View the source](https://github.com/heyandromeda/url-cleaner)**

## Features

- Removes common `utm_*`, `fbclid`, `gclid`, and other known tracking parameters
- Keeps unknown and functional parameters intact
- Preserves YouTube parameters such as `v`, `t`, and `list`
- Preserves paths, hashes, search queries, page numbers, product IDs, and language settings
- Shows exactly which parameters were removed
- Copies the cleaned URL with one click
- Works with the Enter key
- Handles invalid URLs clearly
- Runs entirely in the browser with no backend, accounts, analytics, database, or external API

## Example

Before:

```
https://www.youtube.com/watch?v=abc123&utm_source=newsletter&fbclid=example#comments
```

After:

```
https://www.youtube.com/watch?v=abc123#comments
```

The YouTube video ID and page fragment stay intact while the tracking parameters are removed.

## Use it locally

No build step or package installation is required for the app itself.

```bash
git clone https://github.com/heyandromeda/url-cleaner.git
cd url-cleaner
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Run the tests

The project uses Node's built-in test runner:

```bash
npm test
```

The tests cover:

- UTM-only URLs
- Tracking parameters mixed with legitimate parameters
- YouTube links
- URLs without query strings
- Hash fragments
- Invalid input
- Case-insensitive tracker names

## Project structure

| File | Purpose |
| --- | --- |
| [index.html](./index.html) | Main page |
| [styles.css](./styles.css) | Minimal styling |
| [cleaner.js](./cleaner.js) | URL-cleaning logic and tracker list |
| [app.js](./app.js) | Form, results, and copy interactions |
| [tests/url-cleaner.test.js](./tests/url-cleaner.test.js) | Automated tests |
| [dist/](./dist) | Static-site copy used by the hosted deployment |

## Extend the tracker list

Add lowercase exact-match names to the `TRACKING_PARAMETERS` set in [cleaner.js](./cleaner.js). Parameters beginning with `utm_` are removed automatically.

The cleaner deliberately does **not** remove every query parameter. Unknown parameters are preserved by default so links keep working.

## Privacy

URL cleaning happens locally in your browser. URLs are not uploaded, stored, or sent to an external service.

## License

No license has been added yet. Add one before redistributing the code under specific reuse terms.
