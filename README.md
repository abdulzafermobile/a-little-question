# 💌 Date Night — A Very Important Question

A playful mini-game that asks a very special person out on a date.
The **"No"** button runs away, shrinks, and pleads. The **"YES!"** button grows and glows.
Saying yes triggers full-screen confetti and a date card with an "Add to calendar" button.

No frameworks, no build step: just `index.html`, `style.css`, and `script.js`.

## ✏️ Personalise it

Open `script.js` and edit the `CONFIG` object at the top:

| Field | What it controls |
|---|---|
| `greeting` | Small line above the question |
| `dateText`, `timeText` | Date/time shown on the success card |
| `place`, `address`, `dressCode` | Venue details |
| `message` | The cute note on the success card |
| `imageUrl` | Path to a restaurant photo, e.g. `images/dinner.jpg` (leave `""` for the illustrated placeholder) |
| `calendar.start` | Local start time for the `.ics` file, `YYYY-MM-DDTHH:MM` |

To use a real photo:

```bash
mkdir images
cp ~/Downloads/restaurant.jpg images/dinner.jpg
# then set imageUrl: "images/dinner.jpg"
```

## 🧪 Test locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Test on your phone too: on mobile, tapping "No" makes it jump away.

## 🚀 Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "A very important question 💌"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)` → Save**.
After a minute your site is live at `https://<your-username>.github.io/<repo-name>/`.

## 🛠 Troubleshooting

| Problem | Fix |
|---|---|
| Page loads but has no styling | Filenames are case-sensitive on GitHub Pages: `style.css`, not `Style.css` |
| Photo doesn't show | Check the path in `imageUrl` matches the file exactly (including `.jpg` vs `.jpeg`) |
| 404 on the Pages URL | Wait 1–2 minutes after enabling Pages; confirm `index.html` is in the repo root |
| Old version still showing | Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) |
