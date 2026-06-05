# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-file Python script (`wc2026_birthplaces.py`) that scrapes the 2026 FIFA World Cup squads Wikipedia page and produces CSV analytics on player birthplaces.

## Commands

```bash
# Install dependencies
pip install requests beautifulsoup4 pandas lxml pdfplumber

# Run the script
python wc2026_birthplaces.py
```

**Output files generated:**
- `wc2026_players.csv` — full roster with birth information
- `wc2026_by_birthcountry.csv` — aggregated ranking by birth country

## Architecture

The script runs a linear pipeline:

1. **Fetch** (`fetch_soup`) — downloads the Wikipedia page with a browser User-Agent header
2. **Parse** — two-stage strategy:
   - **Primary** (`parse_wikipedia`): DOM traversal using BeautifulSoup; walks h2/h3 country headers and wikitables
   - **Fallback** (`parse_wikipedia_pandas`): `pandas.read_html()` if primary extracts fewer than 200 players
3. **Extract** (`extract_birth_info`) — parses "Birth City, Birth Country" strings; strips Wikipedia annotations (`[1]`, parentheticals)
4. **Transform** (`build_ranking`) — deduplicates rows, aggregates players by birth country
5. **Export** — writes both CSVs with a top-25 ranking and a French-born-players breakdown

The Wikipedia URL is hardcoded as a constant at the top of the file; the 200-player threshold controlling fallback activation is also defined there.
