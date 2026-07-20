# Google Play Store Analytics — 6-Chart Time-Gated Dashboard

A single dashboard (`index.html`) containing **6 independent visualizations**, each built from the
Google Play Store dataset, each with its own filters, and each **only visible during its own IST time
window**. Outside a chart's window, it's replaced with a "not available right now" message — nothing is
shown, exactly as requested.

| # | Chart | Type | Visible (IST) |
|---|---|---|---|
| 1 | Avg rating & total reviews by category | Grouped bar | 3:00 PM – 5:00 PM |
| 2 | Global installs by category | Choropleth map | 6:00 PM – 8:00 PM |
| 3 | Free vs paid installs & revenue | Dual-axis chart | 1:00 PM – 2:00 PM |
| 4 | Installs trend over time by category | Line chart w/ growth shading | 6:00 PM – 9:00 PM |
| 5 | Size vs rating vs installs | Bubble chart | 5:00 PM – 7:00 PM |
| 6 | Cumulative installs over time | Stacked area chart | 4:00 PM – 6:00 PM |

Open `index.html` any time — every chart checks the real IST clock independently and rechecks every 15
seconds, so charts appear and disappear live as the day goes on without needing a page refresh.

## Files

| File | Purpose |
|---|---|
| `index.html` | The dashboard page — all 6 chart containers, markup, and styling |
| `dashboard.js` | All chart-rendering logic (Plotly.js) + the IST time-gating engine |
| `data_blob.js` | The 6 charts' pre-computed data, embedded as JS constants (so the dashboard needs no server/backend — it's fully static) |
| `prep.py` | Master cleaning script: loads both CSVs, cleans installs/price/size/Android version/dates, computes revenue, joins review sentiment |
| `chart1.py` … `chart6.py` | One script per chart: applies that chart's specific filters to the cleaned data and writes `chartN_data.json` |
| `chart1_data.json` … `chart6_data.json` | The exact aggregated data feeding each chart (same numbers `data_blob.js` embeds) |
| `play_clean.csv` | The fully cleaned Play Store dataset (before any per-chart filters), for anyone who wants to explore it further |
| `review_agg.csv` | Average sentiment subjectivity per app, computed from `User_Reviews.csv` |
| `Play_Store_Data.csv`, `User_Reviews.csv` | Original source files, included for reproducibility |

---

## How each chart was built

### Shared cleaning (`prep.py`)
Both CSVs are loaded once. From `Play_Store_Data.csv`:
- Duplicate `App` rows dropped (kept first occurrence); one malformed row with `Category = "1.9"` dropped.
- **Installs**: `"10,000+"` → integer.
- **Reviews**, **Rating**: cast to numeric.
- **Price → Revenue**: `Price` cleaned of `$`, then `Revenue = Price × Installs` (no revenue column exists
  in the source data, so this is the standard derived measure — free apps naturally have $0 revenue).
- **Size**: `"19M"` / `"800k"` / `"Varies with device"` → megabytes (unknown sizes excluded from any
  size filter).
- **Android Ver**: leading version number extracted (`"4.0.3 and up"` → `4.0`).
- **App name length**: character count including spaces/special characters.
- **Last Updated**: parsed to a real date, from which month, year, and a `YYYY-MM` label are derived —
  used as the time axis for charts 4 and 6, since the dataset has no true install-history log.

From `User_Reviews.csv`: `Sentiment_Subjectivity` is averaged per app (only ~1,074 of the ~9,660 apps
have any review-sentiment rows, so any chart using this field will only ever show that subset).

### Chart 1 — Avg Rating & Total Reviews (`chart1.py`)
Same as the previous grouped-bar dashboard: apps filtered to size ≥ 10MB and last updated in January,
grouped by category, ranked by total installs (top 10), then categories averaging below 4.0 stars are
dropped. Result: 7 categories (SPORTS, GAME, FAMILY, ENTERTAINMENT, PERSONALIZATION, LIFESTYLE, EDUCATION).

### Chart 2 — Global Installs Choropleth (`chart2.py`)
Categories starting with **A, C, G, or S are excluded**, then the top 5 remaining categories by total
installs are kept: **TOOLS, PRODUCTIVITY, PHOTOGRAPHY, FAMILY, VIDEO_PLAYERS** — all five comfortably
exceed 1M installs, so all five carry the "highlighted" badge and a warmer color scale.

**Important caveat:** this dataset has **no country-level install data** — Play Store listings don't
break installs down by geography. To still produce a genuine choropleth (as requested), each category's
total install figure is applied uniformly to every country in the world, so the map communicates relative
scale between categories (via the color scale/dropdown) rather than true geographic distribution. This is
flagged directly in the dashboard's caption too, so it's never presented as more than it is. A dropdown
lets you switch between the 5 categories.

### Chart 3 — Free vs Paid Installs & Revenue (`chart3.py`)
Identical filters and logic to the earlier dual-axis dashboard: installs ≥ 10,000, Android version > 4.0,
size > 15MB, Content Rating = "Everyone", app name ≤ 30 characters, and a $10,000 revenue filter applied
only to Paid apps (Free apps always have $0 derived revenue, so applying that filter to them too would
erase every Free app from the comparison). Top 3 categories by installs: **GAME, FAMILY, TOOLS**.

### Chart 4 — Installs Trend Over Time (`chart4.py`)
Filters: category starts with **E, C, or B**; app name does **not** start with x/y/z; app name does
**not** contain the letter "S"; reviews > 500. 198 apps passed, across 8 categories (COMMUNICATION,
BOOKS_AND_REFERENCE, ENTERTAINMENT, EDUCATION, BUSINESS, COMICS, BEAUTY, EVENTS).

Installs are summed per category per month (using `Last Updated` as the time axis), plotted as one line
per category, with the area beneath lightly filled. Any month where a category's installs grew **more
than 20%** over the previous month gets a shaded vertical band in that category's color, so growth spikes
are visually obvious at a glance.

**Translations**: Beauty is labelled **ब्यूटी** (Hindi) and Business **வணிகம்** (Tamil) in the legend.
Dating was also requested to be labelled in German, but Dating doesn't start with E, C, or B, so it never
appears in this particular chart — that's expected, not an oversight.

### Chart 5 — Size vs Rating Bubble Chart (`chart5.py`)
Filters: rating > 3.5; category in {Game, Beauty, Business, Comics, Communication, Dating, Entertainment,
Social, Events}; reviews > 500; app name does not contain "S"; average sentiment subjectivity > 0.5;
installs > 50,000. Because the subjectivity filter requires a match in `User_Reviews.csv` (only ~1,074
apps have any), the final bubble set is small — **23 apps** across GAME, DATING, BUSINESS, COMMUNICATION,
ENTERTAINMENT, and SOCIAL (no Beauty, Comics, or Events apps satisfied every filter simultaneously).

Bubble size = installs (square-root scaled so bubble *area* is roughly proportional to installs, not
radius, which is the correct way to avoid visually exaggerating differences). The **Game** category is
rendered in **pink**, as requested. Beauty/Business/Dating labels are translated in the legend wherever
they appear (Beauty didn't survive the filters this time, but the translation is wired in and will show
automatically if the underlying data changes).

### Chart 6 — Cumulative Installs Stacked Area (`chart6.py`)
Filters: rating ≥ 4.2; app name contains no digits; category starts with **T or P**; reviews > 1,000;
size between 20–80MB. 110 apps passed, across 6 categories: PHOTOGRAPHY, TRAVEL_AND_LOCAL, TOOLS,
PRODUCTIVITY, PERSONALIZATION, PARENTING.

Installs are summed per category per month, then **cumulatively summed over time** and stacked (each
category is a colored band, stacked on top of the others) so you can read both each category's running
total and the combined total across all six. Months where a category's *monthly* (non-cumulative)
installs grew more than 25% over the prior month are marked with a diamond marker on that band.

**Translations**: Travel & Local → **Voyages et Local** (French), Productivity → **Productividad**
(Spanish), Photography → **写真** (Japanese), shown directly in the legend. Tools, Personalization, and
Parenting were not in the translation list, so they keep their original English names.

---

## How the time-gating works

Every chart section carries `data-start` / `data-end` hour attributes. `dashboard.js` reads the visitor's
system clock, converts it to IST (`UTC + 5:30`) regardless of where the browser physically is, and every
15 seconds checks each section against its own window. When true, the chart canvas is shown (and rendered
the first time it becomes visible, so nothing draws needlessly in the background); when false, the canvas
is hidden and replaced with a placeholder message. This means:
- Six charts can each have completely different, even overlapping, visibility windows.
- The page never needs a manual refresh — a chart will pop into view the moment its window opens.

---

## How to run it yourself

1. Install Python packages:
   ```bash
   pip install pandas pycountry
   ```
2. Regenerate all data (optional — the JSON/`data_blob.js` files are already included and current):
   ```bash
   python prep.py
   python chart1.py && python chart2.py && python chart3.py
   python chart4.py && python chart5.py && python chart6.py
   ```
   If you re-run chart2/chart5/chart6 you'll also need to regenerate `data_blob.js` — a short script to
   re-embed the six `chartN_data.json` files (and `country_list.json`, generated once via `pycountry`)
   into `data_blob.js` is simple to add if you plan to change the filters; ask if you'd like that script
   included too.
3. Open `index.html` in any browser. Since it's a fully static page (all data is embedded in
   `data_blob.js`), you can open it directly as a file — no local server required. Charts will only
   render during their respective IST windows; temporarily change your system clock to preview any chart
   outside its window.

---

## How to host and share it

### Option A — GitHub Pages (recommended)
1. Create a new public GitHub repository (e.g. `play-store-dashboard`).
2. Upload every file in this folder.
3. **Settings → Pages** → Source: `main` branch, `/ (root)` → Save.
4. Your live dashboard will be at `https://<username>.github.io/play-store-dashboard/`.
5. Share that link, plus the repo link for the code and this README.

### Option B — Netlify Drop
1. Go to https://app.netlify.com/drop and drag this whole folder in.
2. Share the instant public URL Netlify gives you.

Either way — remember each chart is *designed* to hide outside its stated IST window, so a reviewer
opening the link at, say, 11 AM IST will correctly see some charts live and others showing the "not
available" placeholder. That's expected behavior per the brief, not a bug.
