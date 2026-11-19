// Entry program for the GTA 6 trophy guide (Node 22, standard library only).
// The guide itself is plain static files under app/ — an index page, a
// stylesheet, a small module script and the trophy data — served with no build
// step and no network access at run time. This program is the handover: it
// copies app/ and screenshots/ next to this file into the output directory
// and writes dossier.json there, using the vendored make.fun helper to build
// the dossier exactly as the scorer rebuilds it. vendor/makefun-frontend.ts
// must stay untouched, or the two dossiers will not match byte for byte.
//
// When run outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps from the scorer's reference: only text_max_bytes changes the dossier
// bytes; the rest reject an entry the scorer would reject anyway (more than
// 4 screenshots, one over 256 KiB, or app/ past 993 entries / 48 MiB, which
// would also overflow /output's own 1000-entry cap alongside dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
