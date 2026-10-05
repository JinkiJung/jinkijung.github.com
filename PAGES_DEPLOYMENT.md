# GitHub Pages deployment

Only `dev` and `v2025` pushes trigger `.github/workflows/pages.yml`.
Both branches carry the same workflow. Each run checks out both branch tips,
installs from their lockfiles with Node 22, and deploys one complete artifact:

- `dev`: `npm run build`, `dist/` -> site root
- `v2025`: `BASE_PATH=/v2025 npm run build:site`, `build/` -> `/v2025/`

The archive uses SvelteKit prerendered routes with trailing slashes; its local
images, models, and PDF use the configured base. `build:site` deliberately
omits the old package-library publishing step (`prepack`).

Pages source must be GitHub Actions. The `github-pages` environment must allow
both `dev` and `v2025` branches. Keep the old master-only Svelte deployment
workflow disabled, and keep `dev` as the repository default branch for manual
runs and scheduled RSS updates. No additional repository secret is required.
One shared concurrency group serializes complete deployments across branches.
Changes to this workflow should be copied to both deployment branches.

The `v2025-backup-original` tag preserves the original master snapshot before
base-path and workflow changes. The master branch remains unchanged.

Validation before push: both local builds, 33 focused game/leaderboard tests,
and all local /v2025/ HTML references including every archive route passed.
Existing Svelte bundle-size warnings are nonfatal.
