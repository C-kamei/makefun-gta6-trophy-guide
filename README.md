# makefun-gta6-trophy-guide

[![make.fun](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-blue)](https://make.fun/c/gta6-trophy-guide-01)
[![owner](https://img.shields.io/badge/owner-C--kamei-lightgrey)](https://github.com/C-kamei/makefun-gta6-trophy-guide)
[![repo](https://img.shields.io/badge/repo-makefun--gta6--trophy--guide-green)](https://github.com/C-kamei/makefun-gta6-trophy-guide)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze). Every trophy shows its official name, description and grade, plus a guide written in this project's own words with its source cited. The tracker saves your checklist in the browser, filters by grade, category, text and earned-only, hides story spoilers until a trophy is earned, and exports/imports progress as JSON. A five-stage roadmap leads to the platinum, and the missable-trophy verdict is honest: no official description states a one-time condition, so none is flagged missable.

A note on honesty: GTA VI released 19 November 2026 and no verified step-by-step guide exists yet. This guide invents no locations, NPCs, coordinates or step sequences — each guide says what the official description asks and how to approach it in general in-game terms, and cites Exophase's listing of the official PSN trophy list as its source.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network needed.

To build the submission output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots are staged with `?shot=checklist`, `?shot=guide`, `?shot=roadmap` or `?shot=filters`.

---

Built with [make.fun](https://make.fun/?ref=fk5m5avs) — compete to build the best GTA 6 trophy guide.
