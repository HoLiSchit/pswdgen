import { generate, entropyBits, strengthLevel, charClass, clampLength, MIN_LENGTH, MAX_LENGTH } from './generator.js';

const KEY = 'pswdgen:settings';
const DEFAULTS = { length: 20, lower: true, upper: true, digits: true, symbols: true, special: false, avoidAmbiguous: false };

const $ = (s) => document.querySelector(s);
const pwEl = $('#pw'), emptyEl = $('#empty'), copyBtn = $('#copy'), copyLabel = $('#copy-label');
const lenRange = $('#len'), lenNum = $('#len-num');
const strengthEl = $('#strength');

let state = load();
let current = '';

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const s = { ...DEFAULTS };
    for (const k of Object.keys(DEFAULTS)) {
      if (k === 'length') s.length = clampLength(raw.length ?? DEFAULTS.length);
      else if (typeof raw[k] === 'boolean') s[k] = raw[k];
    }
    return s;
  } catch {
    return { ...DEFAULTS };
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* privater Modus: dann eben ohne */ }
}

function render() {
  current = generate(state);
  pwEl.textContent = '';
  for (const c of current) {
    const cls = charClass(c);
    if (cls === 'letter') pwEl.append(c);
    else {
      const s = document.createElement('span');
      s.className = cls;
      s.textContent = c;
      pwEl.append(s);
    }
  }
  const none = current === '';
  emptyEl.hidden = !none;
  pwEl.hidden = none;
  copyBtn.disabled = none;

  const bits = entropyBits(state);
  const lvl = strengthLevel(bits);
  strengthEl.dataset.level = none ? 'none' : lvl.id;
  $('#s-label').textContent = none ? '–' : lvl.label;
  $('#s-bits').textContent = none ? '' : `${Math.round(bits)} Bit`;
}

function syncControls() {
  lenRange.value = lenNum.value = state.length;
  lenRange.style.setProperty('--fill', ((state.length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100 + '%');
  document.querySelectorAll('[data-opt]').forEach((el) => { el.checked = !!state[el.dataset.opt]; });
}

function setLength(v) {
  state.length = clampLength(v);
  syncControls(); save(); render();
}

lenRange.addEventListener('input', () => setLength(lenRange.value));
lenNum.addEventListener('input', () => {
  if (lenNum.value === '') return;
  const n = Number(lenNum.value);
  if (n >= MIN_LENGTH && n <= MAX_LENGTH) setLength(n);
});
lenNum.addEventListener('change', () => setLength(lenNum.value));

document.querySelectorAll('[data-opt]').forEach((el) => {
  el.addEventListener('change', () => { state[el.dataset.opt] = el.checked; save(); render(); });
});

$('#regen').addEventListener('click', render);

let resetTimer;
copyBtn.addEventListener('click', async () => {
  if (!current) return;
  let ok = false;
  try { await navigator.clipboard.writeText(current); ok = true; } catch {
    // Fallback fuer Kontexte ohne Clipboard-API
    const r = document.createRange(); r.selectNodeContents(pwEl);
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    try { ok = document.execCommand('copy'); } catch { /* ignorieren */ }
  }
  copyLabel.textContent = ok ? 'Kopiert' : 'Markiert, bitte Strg+C';
  copyBtn.classList.toggle('done', ok);
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => { copyLabel.textContent = 'Kopieren'; copyBtn.classList.remove('done'); }, 1600);
});

$('#theme').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const next = dark ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('pswdgen:theme', next); } catch { /* egal */ }
});

syncControls();
render();
