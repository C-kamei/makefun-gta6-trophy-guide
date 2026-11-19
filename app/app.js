// Leonida Trophy Guide: loads the 55 official trophies, renders the checklist
// with filters and a spoiler mode, saves progress in localStorage, and shows
// one trophy's cited guide at a time in the detail panel.
const STORAGE_KEY = 'gta6-trophy-progress-v1';
const SHOT_PRESETS = {
  checklist: { demoEarned: [2, 3, 4, 8, 9, 10, 15, 21, 35, 42, 44, 46] },
  guide: { openTrophyId: 17 },
  roadmap: { scrollToRoadmap: true },
  filters: { category: 'story', spoiler: true },
};

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const categoryEl = document.getElementById('category');
const earnedOnlyEl = document.getElementById('earned-only');
const spoilerEl = document.getElementById('spoiler');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const preset = SHOT_PRESETS[shot] || null;

let trophies = [];
let earned = loadProgress();
let openTrophyId = null;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.category === 'story' && !earned.has(trophy.name);
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden story trophy — earn it to reveal' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy) ? 'Story details hidden by the spoiler setting.' : trophy.description;
}

function trophyMatches(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query && !`${trophy.name} ${trophy.description}`.toLowerCase().includes(query)) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (categoryEl.value === 'missable' && !trophy.missable) return false;
  if (categoryEl.value !== 'all' && categoryEl.value !== 'missable' && trophy.category !== categoryEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(trophy.name)) return false;
  return true;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earned.has(trophy.name) ? ' earned' : '');
  const top = document.createElement('div');
  top.className = 'card-top';
  const title = document.createElement('h3');
  title.textContent = displayName(trophy);
  if (isSpoilerHidden(trophy)) title.classList.add('spoiler-hidden');
  const tag = document.createElement('span');
  tag.className = 'grade-tag grade-' + trophy.grade;
  tag.textContent = gradeLabel(trophy.grade);
  top.append(title, tag);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDescription(trophy);
  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [trophy.category, trophy.missable ? 'MISSABLE' : 'not missable'];
  if (earned.has(trophy.name)) bits.push('✓ Earned');
  meta.textContent = bits.join(' · ');
  const hint = document.createElement('p');
  hint.className = 'meta';
  hint.textContent = 'Click for the full guide + source';
  card.append(top, desc, meta, hint);
  card.addEventListener('click', () => openDetail(trophy));
  return card;
}

function renderList() {
  listEl.replaceChildren();
  const visible = trophies.filter(trophyMatches);
  if (visible.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'No trophies match these filters. Clear the search or widen the grade and category.';
    listEl.append(note);
  }
  for (const trophy of visible) listEl.append(buildTrophyCard(trophy));
  document.getElementById('result-count').textContent =
    `Showing ${visible.length} of ${trophies.length} trophies — ${earned.size} earned`;
}

function renderProgress() {
  const total = trophies.length || 55;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    `${earned.size} of ${total} earned — ${pct}% to the platinum`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel(g)} ${have}/${all}`;
  });
  document.getElementById('grade-counts').textContent = counts.join(' · ');
}

function renderAll() {
  renderProgress();
  renderList();
  if (openTrophyId !== null) renderDetail();
}

function openDetail(trophy) {
  openTrophyId = trophy.id;
  renderDetail();
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === openTrophyId);
  if (!trophy) {
    detailEl.hidden = true;
    return;
  }
  detailEl.hidden = false;
  detailEl.replaceChildren();
  const tag = document.createElement('span');
  tag.className = 'grade-tag grade-' + trophy.grade;
  tag.textContent = gradeLabel(trophy.grade) + ' trophy';
  const title = document.createElement('h2');
  title.textContent = displayName(trophy);
  const official = document.createElement('p');
  official.textContent = 'Official description: “' + displayDescription(trophy) + '”';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  const flags = document.createElement('p');
  flags.className = 'meta';
  flags.textContent = 'Category: ' + trophy.category + ' · ' +
    (trophy.missable ? 'Missable — earn it before the point of no return.' : 'Not missable — the official description states no one-time condition.');
  const source = document.createElement('p');
  source.className = 'source-line';
  source.textContent = 'Source: ' + (trophy.source || 'Exophase – Grand Theft Auto VI trophies (PSN); official trophy description') +
    ' — the guide above is written in this page’s own words from that description. No locations or steps are claimed beyond what the description supports.';
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(trophy.name) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    toggleEarned(trophy);
    renderDetail();
  });
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close guide';
  close.addEventListener('click', () => {
    openTrophyId = null;
    detailEl.hidden = true;
  });
  actions.append(toggle, close);
  detailEl.append(tag, title, official, guide, flags, source, actions);
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveProgress();
  renderAll();
}

function exportProgress() {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveProgress();
    renderAll();
  } catch {
    window.alert('That file is not a valid trophy-progress export from this guide.');
  }
}

function applyShotPreset() {
  if (!preset) return;
  // Screenshot staging: hide the sections above the subject so it sits at
  // the top of the viewport, instead of relying on scroll position.
  document.body.classList.add('shot-' + shot);
  if (preset.demoEarned) {
    // Screenshot staging only: shown in memory, never written to localStorage.
    earned = new Set([...earned, ...preset.demoEarned.map((id) => {
      const t = trophies.find((x) => x.id === id);
      return t ? t.name : null;
    }).filter(Boolean)]);
  }
  if (preset.openTrophyId) openTrophyId = preset.openTrophyId;
  if (preset.grade) gradeEl.value = preset.grade;
  if (preset.category) categoryEl.value = preset.category;
  if (preset.spoiler) spoilerEl.checked = true;
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies || data;
  applyShotPreset();
  renderAll();
  searchEl.addEventListener('input', renderList);
  gradeEl.addEventListener('change', renderList);
  categoryEl.addEventListener('change', renderList);
  earnedOnlyEl.addEventListener('change', renderList);
  spoilerEl.addEventListener('change', renderAll);
  document.getElementById('export').addEventListener('click', exportProgress);
  document.getElementById('import').addEventListener('change', (event) => {
    importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies in this browser?')) {
      earned = new Set();
      saveProgress();
      renderAll();
    }
  });
}

boot();
