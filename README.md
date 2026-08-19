# suryanshsh.github.io

Personal website — résumé, projects, and random musings.

**Design language:** minimalist · modern · old money · soft · matrix · geek
A warm ivory ground with hunter-green and muted-brass accents, serif display
type (Fraunces / EB Garamond), monospace geek accents (JetBrains Mono), and a
faint matrix-rain whisper behind the hero. Ships with a light "parchment" theme
and a dark "matrix at midnight" theme.

## Stack
Plain HTML, CSS, and a little vanilla JS — no frameworks, no build step.

```
index.html    → structure & content
styles.css    → theme tokens, layout, responsive + print styles
main.js       → theme toggle, matrix rain, scroll reveals, mobile nav
favicon.svg   → monogram mark
.nojekyll     → tells GitHub Pages to serve files as-is
```

## Editing content
Search `index.html` for `EDIT ME` comments to update the résumé entries,
projects, musings, and contact links. Colours and fonts live at the top of
`styles.css` under `:root` and `[data-theme="dark"]`.

## Run locally
Open `index.html` directly, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy (GitHub Pages)
This repo is meant to be published as a **user site** at
`https://suryanshsh.github.io`.

```bash
git init && git add . && git commit -m "Personal website"
gh repo create suryanshsh.github.io --public --source=. --remote=origin --push
```

Then enable Pages: **Settings → Pages → Build and deployment → Deploy from a
branch → `main` / root**. The site goes live at
`https://suryanshsh.github.io` within a minute or two.
