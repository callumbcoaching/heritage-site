# Uploading CALLUM.B to cPanel

Until the domain points at Vercel, callumbcoaching.co.uk is served from the LayerIP cPanel host (Apache and PHP) behind Cloudflare. This pack is the static site plus `.htaccess`. It does not include the Node functions, and it does not include any keys.

## Build the pack

From the repo root:

```
npm run build:cpanel
```

That writes a `cpanel/` folder and `cpanel-upload.zip`. In cPanel File Manager, open `public_html`, upload the zip, and extract it there so `index.html` and `.htaccess` sit in `public_html`, not in a subfolder.

Upload the domain root only. Do not upload `node_modules`, `api/`, `lib/`, `server/`, or a `.env` file. Do not change DNS or MX records. Email stays on LayerIP.

## Chat and the free guide, with no key on cPanel

The chat widget and the free-guide form call `https://callumb-coaching.vercel.app` when the page is not on Vercel. The MailerLite key stays on the Vercel project `callumb-coaching`, as `MAILERLITE_API_KEY`. You do not put that key, or `MAILERLITE_GROUP_ID`, on cPanel.

`https://callumb-coaching.vercel.app/api/chat` and `/api/lead` have to be public. Vercel Authentication should protect preview deployments only, not the production `*.vercel.app` URL.

The pack sets `<meta name="callumb-api-base" content="https://callumb-coaching.vercel.app">` on each page. On Vercel itself that tag is absent. The widget then uses the same origin, including once `callumbcoaching.co.uk` points at Vercel. To force same origin yourself, set `window.CALLUMB_API_BASE` to an empty string before the chat script runs.

## Clean URLs and the old guide

`.htaccess` serves `/about` from `about.html`, and `/start/` from `start/index.html`.

`/guides/five-numbers.pdf` redirects to `/guides/the-five-foundations.pdf`. The file at the old path is the same PDF, so the new guide still downloads if the rewrite is not applied. New signups get the new file from the thank-you button and from the lead API.

## After the domain points at Vercel

Stop using this pack. The Vercel project serves the pages and calls its own `/api/chat` and `/api/lead.php`. Leave the MX records where they are.
