# CALLUM.B site rules

`CLAUDE.md` and `AGENTS.md` are the same rules. If you change one, change the other in the same commit. This is https://callumbcoaching.co.uk, repo `clockwork-ai/heritage-site`.

## Workflow

Start from the latest `main` on GitHub. Do not edit an old local copy, and do not upload files straight to Cloudflare or Vercel.

Work on a branch, open a pull request, and check the Vercel preview. Never push to `main`. Never merge unless Callum has approved it.

The committed HTML is the source of truth. Do not run `npm run build`. `tools/build_pages.py` is behind the live pages and would overwrite them.

## Hosting

The site is the Vercel project `callumb-coaching` on team `clockwork-ai1`. `vercel.json` uses clean URLs, so a page is served at `/about`.

The domain and DNS stay on Cloudflare. Do not change DNS records. Email for callum@callumbcoaching.co.uk is on layerip, so do not touch the MX records.

## Style

Use the Heritage palette: deep green canvas (`#09150F`), cream (`#F3EAD6`), gold (`#C9A96E`). Shared styles live in `heritage.css` and `components.css`.

The old black and acid green theme is retired. Do not bring back `#A4E84B`, `styles.css`, or `brand.css`.

## Writing

Write in Callum's voice: plain British English, first person. No AI buzzwords. Do not invent testimonials, results, or stats.

No em dashes (U+2014) and no en dashes (U+2013), including the HTML entities for those characters. That covers visible copy, titles, meta descriptions, og and twitter text, alt text, JSON-LD, scripts, and comments. In a title, use a pipe: `Keep the Muscle | CALLUM.B`. For a range, use "to": `3 to 5`. Do not substitute a double hyphen. Keep a normal hyphen in a compound word such as `first-person`.

## Offers

Coaching is online only. Do not add in-person training until Callum is qualified and insured.

Do not change prices or Stripe links unless Callum asks. Those links live in `assets/js/payment-links-v2.js` and must stay in step with the `plan=` values on the pages.

## Guide signup

`components.js` posts the free-guide form to `/api/lead.php`. `vercel.json` rewrites that URL to `api/lead.js`, which sends the subscriber to MailerLite.

Set these on the Vercel project. Do not commit them.

- `MAILERLITE_API_KEY` (required)
- `MAILERLITE_GROUP_ID` (optional; if it is unset, the subscriber is created and not added to a group)

Leave that post URL and `api/lead.js` alone unless Callum asks for a change.

## Calculators

The TDEE, protein, offset, and Physique OS calculators must keep returning the same numbers. A wording or layout change is not a reason to change the maths.

## Chatbot

A coaching chat assistant is being added on a separate branch. It is not part of this site yet. Once that branch is merged, its wording and rules live in `lib/business.ts`. Edit the assistant there.

## Tests

From the repo root, with Chrome installed:

```
npm install
npm test
```

`npm test` runs the Playwright checks in `tests/site.spec.mjs` on desktop (1440 wide) and on a phone size. It starts `node serve.mjs` at http://localhost:3000 unless that server is already running.

- Desktop only: `npm run test:desktop`
- Phone only: `npm run test:phone`
- The live site: `npm run test:live`
- A preview: `BASE_URL=https://the-preview-url npm test`

To look at a page yourself, run `npm run serve` and open http://localhost:3000. For a screenshot, run `node screenshot.mjs http://localhost:3000`. Do not screenshot a `file://` URL.
