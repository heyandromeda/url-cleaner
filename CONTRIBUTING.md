# Contributing

## Production deploys

Production ships **only** from the `main` branch through [Vercel](https://vercel.com/)’s Git integration. Merging to `main` triggers the production deployment; there are no manual production deploys from this repo.

Preview deployments for pull requests are created automatically by the same integration.

## Build

Vercel and CI generate `dist/` with:

```bash
npm run build
```

The `dist/` directory is not committed; edit the root web assets and run the build to refresh it locally.

## Tests

Before opening a pull request, run:

```bash
npm test
npm run test:playwright
```

CI runs `npm run build`, then the same tests, on every push to `main` and on every pull request.
