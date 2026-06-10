# Mundial 2026 — Birthplace of Players

Interactive D3.js choropleth map of the 2026 FIFA World Cup showing **where players were born**: how many players born in each country are playing in the tournament, whether for that country or for another.

**Live:** https://mundial.cthiebaud.com/

---

## Pages

| URL | Description |
|---|---|
| https://mundial.cthiebaud.com/ | Entry point — redirects to the map |
| https://mundial.cthiebaud.com/wc2026_map_exported.html | Main choropleth map |
| https://mundial.cthiebaud.com/wc2026_correlation.html | FIFA ranking vs. exports scatter plot |
| https://mundial.cthiebaud.com/infographics/wc2026_top_exporters.html | Top birth-country infographic (1080×1920) |
| https://mundial.cthiebaud.com/infographics/wc2026_top_importers.html | Top importing-nation infographic (1080×1920) |
| https://mundial.cthiebaud.com/chains/wc2026_chain_parameterized.html | Chain renderer — `?data=wc2026_chain_main.json` (default), `_italy.json`, `_kaz.json`, `_loop.json`, `_longest.json` |
| https://mundial.cthiebaud.com/chains/wc2026_chain_longest.html | Snake renderer — `?data=wc2026_chain_longest.json` (default), any chain JSON |
| https://mundial.cthiebaud.com/chains/wc2026_chain_directed.html | Directed-graph renderer — hardcoded to `wc2026_chain_directed.json` |

---

## Main files

| File | Purpose |
|---|---|
| `index.html` | Entry point — redirects to the map |
| `wc2026_map_exported.html` | Main map page (Bootstrap 5) |
| `wc2026_map.js` | All D3 rendering, zoom, tooltips, dim/arc logic |
| `i18n.js` | Language detection, UI strings, `countryName()`, `wikiUrl()` |
| `wc2026_map_data.json` | App data: all players by birth country (natives + playing for another country) + population |
| `uk-nations.geojson` | Polygons for England, Scotland, Wales, Northern Ireland |
| `wc2026_og_v3.png` | 1200×640 Open Graph preview image |

## Data pipeline

| File | Purpose |
|---|---|
| `wc2026_birthplaces.py` | Scraper: Wikipedia → `wc2026_players.csv` |
| `build_json.py` | Rebuilds `wc2026_map_data.json` from CSV |
| `add_wiki_urls.py` | Enriches JSON with per-language Wikipedia links (`wiki_langs`) |
| `wc2026_players.csv` | Full squad roster with birth city/country (source of truth) |
| `wc2026_by_birthcountry.csv` | Aggregated ranking by birth country |
| `wc2026_make_ratio_chart.py` | Generates a bar chart of players born in a country but playing for another |

See `pipeline/README.md` for full instructions.

## chains/

Infographics visualising multi-hop birth-country → plays-for paths.

**Renderers:**

| File | Purpose |
|---|---|
| `wc2026_chain_parameterized.html` | Generic renderer — loads any chain via `?data=<file>` (default: `_main.json`) |
| `wc2026_chain_longest.html` | Snake renderer for the longest chain — loads any chain via `?data=<file>` (default: `_longest.json`) |
| `wc2026_chain_directed.html` | Directed-graph renderer — loads `_directed.json` |

**Data:**

| File | Content |
|---|---|
| `wc2026_chain_main.json` | UK → France → … → Croatia (7 hops) |
| `wc2026_chain_longest.json` | Full longest chain (12 edges, 13 nodes) |
| `wc2026_chain_directed.json` | Directed graph of all chains |
| `wc2026_chain_italy.json` | Italy variant (Marcus Thuram first link) |
| `wc2026_chain_kaz.json` | Kazakhstan → … → Algeria (5 hops) |
| `wc2026_chain_loop.json` | Bosnia ⇄ Croatia mutual cycle |

---

## Running locally

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

The map uses `fetch()` and requires an HTTP server — `file://` will not work.

## Responsive layout

The map is fully responsive. On screens narrower than 768px the desktop header is hidden and a compact title/subtitle appears inline with the legend.

**Portrait mobile only** (`max-width: 767.98px` + `orientation: portrait`):
- The map is fixed at the top of the viewport so it stays visible while the user scrolls the player table.
- The tab bar (Players / Longest path) is fixed at the bottom of the viewport, above the browser chrome.
- Body padding (`padding-top` and `padding-bottom`) keeps all scrollable content from sliding behind either fixed element.

Landscape mobile and desktop are unaffected.

## i18n

The UI language follows the browser locale. Supported: **French** (`fr`), **German** (`de`), **Italian** (`it`), **Spanish** (`es`), English (fallback). Country names use the browser's `Intl.DisplayNames` API. Wikipedia player links are available in all five languages; other locales fall back to the English Wikipedia URL.

## Tooltip

Hovering a country triggers one of several tooltip variants (desktop only — tooltips are disabled on mobile):

| Situation | Tooltip shown |
|---|---|
| Players born there, playing for another country (any country) | Export tooltip — single column; non-qualified countries show a *not qualified* badge |
| Qualified nation, no exports, but imported players | Import-only tooltip |
| Qualified nation with both exports and imports | Two-column tooltip: left = exports, right = imports |
| Qualified nation, no exports, no imports | Qualified tooltip with "no export / no import" message |

In dim mode (after clicking an exporting country), hovering a destination flag shows that nation's incoming players from the selected source; hovering a birth-country flag shows its players selected by the dim'd nation.

Player names in the dim-mode table link to their Wikipedia page in the UI language, with an `(en)` fallback.
