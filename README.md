# Finance Tracker

A private finance tracking prototype hosted as a static app and synced through Supabase.

## Privacy Model

- The app shell can be hosted on GitHub Pages.
- Finance entries, plan overrides, and plan data are stored in Supabase.
- The dashboard stays hidden until a Supabase user is signed in.
- `finance-data.json` and the original spreadsheet files are local-only and ignored by git.

## Supabase Setup

Run `supabase-private-setup.sql` in the Supabase SQL Editor before using the app online.

After deployment, add the GitHub Pages URL in Supabase:

1. Go to `Authentication > URL Configuration`.
2. Set `Site URL` to the GitHub Pages URL.
3. Add the same URL to `Redirect URLs`.

## GitHub Pages

Publish from:

- Branch: `main`
- Folder: `/root`

The app uses relative paths, so it can run from a GitHub Pages project URL.

## Local Development

Run a local static server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```
