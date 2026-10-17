# Contributing

## Production deploys

Production ships **only** from the `main` branch through [Vercel](https://vercel.com/)’s Git integration. Merging to `main` triggers the production deployment; there are no manual production deploys from this repo.

Preview deployments for pull requests are created automatically by the same integration.

## Tests

Before opening a pull request, run:

```bash
npm test
npm run test:playwright
```

CI runs the same commands on every push to `main` and on every pull request.
