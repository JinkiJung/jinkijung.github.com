# GitHub Pages deployment

Pushes to `dev`, `v2025`, and `v2021` trigger the same combined Pages workflow.
Every run checks out all three branch tips and publishes one complete artifact:

- `dev`: Node 22, `npm ci && npm run build`; `dist/` serves the root.
- `v2025`: Node 22, `BASE_PATH=/v2025 npm run build:site`; `build/` serves `/v2025/`.
- `v2021`: static `index.html`, `works.html`, `assets/`, and `images/` serve `/v2021/`. No npm build is required. Relative links preserve the subpath.

The static archive uses an explicit allowlist, excluding local dependencies,
build leftovers, and work files. All three branches must be allowed in the
`github-pages` environment. Pages source is GitHub Actions; the default branch
remains `dev`. No additional secrets are required.

Keep `.github/workflows/pages.yml` identical on all three branches. Shared
concurrency prevents separate runs from overwriting the other archives.
The `v2025-backup-original` tag and `master` remain unchanged.
