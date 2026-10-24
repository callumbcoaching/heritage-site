# CALLUM.B heritage site

The heritage green-and-gold redesign of callumbcoaching.co.uk.

- `index.html`: Home page
- `heritage.css` / `heritage.js`: shared design system and motion
- `brand_assets/`, `assets/photos/`: lion crest and photos

Preview locally: `node serve.mjs`, then open http://localhost:3000

## Source of truth

The committed HTML is the source of truth. It was mirrored from https://callumbcoaching.co.uk on 24 Oct 2026 (the live upload from 21 Oct, which is ahead of this repo's templates). Do not run `npm run build` until `tools/build_pages.py` is re-synced with that HTML. The build script regenerates pages from the templates and would overwrite the mirrored pages.

`tools/build_pages.py` generates `about.html`, `coaching.html`, `results.html`, `apply.html`, and `terms-coaching.html` by slicing markers in `index.html`. Those markers are not in the mirrored homepage, so a fresh build stops with `ValueError: substring not found` and cannot recreate any of those five pages. All five now diverge from the templates. `index.html` is the template input, not a generated page.
