# Deploy to Vercel

The `deploy-vercel.yml` workflow deploys this app to Vercel on every push to `main`.

## Setup

### 1. Create a Vercel project

- Go to [vercel.com](https://vercel.com) and import this repo (or create a new project and link the repo).
- Note your **Project ID** (Settings → General).
- Note your **Team/Org ID** (Settings → General, or from the URL when in a project).

### 2. Create a Vercel token

- Vercel → [Account Settings → Tokens](https://vercel.com/account/tokens).
- Create a token with scope that allows deployment.

### 3. Add GitHub secrets

In this repo: **Settings → Secrets and variables → Actions**, add:

| Secret        | Description                    |
|---------------|--------------------------------|
| `VERCEL_TOKEN` | Token from step 2              |
| `VERCEL_ORG_ID` | Your Vercel team/org ID        |
| `VERCEL_PROJECT_ID` | Your Vercel project ID   |

### 4. (Optional) API URL for production

To set the API base URL in the built app, add a repository **variable** (not secret):

- **Name:** `VITE_API_URL`
- **Value:** e.g. `https://your-api.vercel.app/api` or `/api` if same origin

---

**Alternative:** You can skip the workflow and use Vercel’s built-in Git integration: connect the repo in the Vercel dashboard and Vercel will deploy on every push. `vercel.json` in the repo is already set for this Vite app.
