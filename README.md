# Simple Fat Loss & Training Workbook

A lightweight, mobile-first coaching app covering training, nutrition, macros,
hidden calories, food swaps, cardio zones and troubleshooting for a simple
fat-loss and strength routine.

## Opening it locally

No install, no build step, no server required.

1. Open the `app` folder.
2. Double-click `index.html` (or right-click → Open With → your browser).
3. That's it — the app works entirely offline as a static page.

If you move or share this app, keep the whole `app` folder together —
`index.html`, `styles.css`, `app.js` and `assets/images/` all need to stay
in the same relative locations.

## Sharing with the client

Zip the entire `app` folder (not just `index.html`) and send that. Tell them:

> Unzip the folder, then open `index.html` in any browser.

## What's inside

```
app/
├── index.html          — all content, single page with anchor sections
├── styles.css           — all styling (mobile-first, CSS variables)
├── app.js               — minimal JS: workout tabs + active bottom-nav state
├── README.md             — this file
└── assets/
    └── images/
        ├── plate-method.jpg
        ├── nutrition-basics.jpg
        ├── hidden-calories.jpg
        ├── food-swaps.jpg
        ├── macro-targets.jpg
        ├── training-schedule.jpg
        ├── heart-rate-zones.jpg
        ├── progress-trend.jpg
        ├── troubleshooting-flow.jpg
        └── IMAGE_MAPPING.md   — source → final filename mapping and notes
```

Note: images are `.jpg`, not `.png` as originally specified in the build
prompt. See `assets/images/IMAGE_MAPPING.md` for why — short version: the
source PNGs were 5–6MB each, far above the TRD's own performance budget,
and JPEG at quality 80 gets each file under 260KB with no visible quality
loss on this flat, high-contrast artwork.

## If JavaScript fails

The page still works. `app.js` only powers the Push/Pull tab switcher (all
four sessions are still in the page and reachable — the tabs just won't
auto-hide/show without JS) and the "highlight the current section" state
on the bottom nav. All content, navigation links and tables work with
plain HTML/CSS alone.

## Future hosting (optional — not required for V1)

This folder can be deployed as-is, with no code changes, to:

- **Netlify** — drag-and-drop the `app` folder onto app.netlify.com/drop
- **GitHub Pages** — push the contents of `app/` to a repo and enable Pages
- **Cloudflare Pages** or **Vercel** — same static-folder deploy flow

No backend, database, login or build step is needed for any of these.

## Editing content

All content is hardcoded directly in `index.html` (no JSON fetch, so it
works from `file://`). To change wording, targets or tables, edit the
relevant `<section>` directly.
