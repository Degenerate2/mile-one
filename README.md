# Mile One

A visual driver-education course based on the Arizona Driver License Manual (March 2026 revision).
Independent study aid. Not affiliated with ADOT or the Arizona MVD.

## What is here
- `index.html` — the page and its styling
- `engine.js` — drawing kit, road layouts, vehicles, the animation stage
- `figs.js` — diagram types (sign grids, step lists, sliders)
- `miles/m01.js` … `m14.js` — lesson content, one file per mile
- `app.js` — accounts, learner profiles, progress, lessons, quizzes
- `cloud.js` — talks to Supabase (family accounts and saved progress)
- `config.js` — the Supabase project address and publishable key (public by design)
- `vendor/supabase.js` — Supabase browser library, version 2.118.0

## How it runs
A static site with no build step. Netlify publishes this folder as-is.
Accounts and progress live in a Supabase project (`mile-one`). Two tables, `learners` and `progress`,
are protected by row-level security so a parent can only reach their own family's rows.
