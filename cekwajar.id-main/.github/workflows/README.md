# CI/CD Deployment Setup

This directory contains GitHub Actions workflows for automated deployment of cekwajar.id.

## Workflows

### [`deploy.yml`](./deploy.yml)
Deploys to Vercel production when changes are pushed to the `main` branch.

### [`ci.yml`](./ci.yml)
Runs type checking, linting, and building for all pull requests targeting `main`.

## Required GitHub Secrets

To enable deployment, add the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API access token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso authentication token |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `SENTRY_DSN` | Sentry DSN for client-side error tracking |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token |
| `SENTRY_ORG` | Sentry organization slug |
| `SENTRY_PROJECT` | Sentry project slug |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Getting VERCEL_TOKEN

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name (e.g., `github-actions-deploy`)
4. Copy the generated token
5. Add it as `VERCEL_TOKEN` in GitHub repository settings

## Getting VERCEL_ORG_ID and VERCEL_PROJECT_ID

Run this command in your local project directory:

```bash
vercel --yes
```

Then retrieve the values from `.vercel/project.json` or use:

```bash
vercel inspect <deployment-url>
```

## Adding Secrets to GitHub

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the name and value for each secret
5. Click **Add secret**

## Vercel GitHub App Integration

For the best experience, install the [Vercel GitHub App](https://github.com/apps/vercel):

1. Go to [Vercel GitHub App](https://github.com/apps/vercel)
2. Click "Configure"
3. Select your GitHub account or organization
4. Choose which repositories to grant access to
5. Approve and install

With the Vercel GitHub App installed, deployments can be managed directly from pull request comments and Vercel will automatically handle build hooks.
