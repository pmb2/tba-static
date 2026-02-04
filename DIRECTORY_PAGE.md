# Backus Agency Internal Directory

## Purpose
This page provides a clickable, internal-only index of Backus Agency subdomains. It lives at:

- `https://backus.agency/directory/`

## Access Control
The directory is intended for internal members and must be protected by the Authgear universal auth gateway. This repo is static-only, so access control must be enforced at the reverse proxy or edge layer (e.g., Traefik/Nginx/Cloudflare) by applying the Authgear forward-auth middleware to the `/directory/` path.

Recommended enforcement:
- Require Authgear session for `backus.agency/directory/*`
- Return 401/302 to Authgear login when unauthenticated

## Updating the List
The list of services is maintained inside:

- `directory/index.html`
- `out/directory/index.html`

Search for the `services` array and edit entries or add new ones. The deploy script copies `out/` to the root, so keep both files in sync. Each entry includes:

- `name`
- `url`
- `category`
- `tag`
- `description`

## How the Initial List Was Assembled
The initial list was derived from a repo-wide scan for `*.backus.agency` references on 2026-02-04. It did not use traffic analytics (not available from this environment). If you want 100% coverage, cross-check against DNS/Traefik/Cloudflare records.

## Notes
- `dmarc.backus.agency`, `domainkey.backus.agency`, and `wildcard.backus.agency` are DNS/internal records and are intentionally excluded from the directory.
- mTLS-only endpoints are labeled explicitly.
