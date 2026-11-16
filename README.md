# Mile One

A visual driver-education course based on the Arizona Driver License Manual (March 2026 revision).
Independent study aid. Not affiliated with ADOT or the Arizona MVD.

## What is here
- `index.html` — the page and its styling
- `engine.js` — drawing kit, road layouts, vehicles, the animation stage
- `figs.js` — diagram types (sign grids, step lists, sliders)
- `miles/m01.js` … `m14.js` — lesson content, one file per mile
- `app.js` — accounts, learner profiles, linked learner devices, progress, lessons, quizzes
- `cloud.js` — talks to Supabase (family accounts, learner join codes and saved progress)
- `config.js` — the Supabase project address and publishable key (public by design)
- `vendor/supabase.js` — Supabase browser library, version 2.118.0

## How it runs
A static site with no build step. Netlify publishes this folder as-is.
Accounts and progress live in a Supabase project (`mile-one`). Two tables, `learners` and `progress`,
are protected by row-level security so a parent can only reach their own family's rows.

## Learner devices
A learner does not get a login. The parent taps **Get code** on a learner's profile, which makes a
one-time 8-character code (48 hours). The learner enters it once on their own phone, and the phone
is then linked to that one profile. The link is a random secret kept on the phone; the database
stores only a hash of it (`learner_devices`), and only a hash of the code (`learner_codes`).
A linked phone reads and saves progress through the database functions `device_pull` and
`device_put`, which check the secret. Wrong code guesses are counted per address (`join_attempts`).
A parent can unlink a learner's devices from the family page; up to 5 devices stay linked per learner.
