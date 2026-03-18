# CI

The `ci.yml` workflow:

- Runs on **push** and **pull requests** to `main` when files under `konvo/` change.
- **Build:** runs `npm ci` and `npm run build` inside the `konvo/` folder.
- **Deploy:** on push to `main`, calls your Vercel Deploy Hook so the latest commit is deployed and changes show up.

## Make deployments reflect your changes (Vercel Deploy Hook)

1. **Vercel** → your project → **Settings** → **Git**.
2. Scroll to **Deploy Hooks**. Create a hook (e.g. “GitHub push”), copy the URL.
3. **GitHub** → this repo → **Settings** → **Secrets and variables** → **Actions**.
4. New repository secret: name **`VERCEL_DEPLOY_HOOK_URL`**, value = the hook URL.
5. From now on, every push to `main` that touches `konvo/` will build in CI and trigger a Vercel deployment so the site updates.

If you don’t set `VERCEL_DEPLOY_HOOK_URL`, the workflow still runs the build; Vercel may deploy from its own Git integration.
