# CI

The `ci.yml` workflow runs on push and pull requests to `main`: it installs deps and runs `npm run build` to verify the app builds. Deployment is handled by **Vercel** via the connected repo (no GitHub secrets required).
