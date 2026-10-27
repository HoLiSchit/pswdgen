// Reine Logik des Generators, ohne DOM. Zufall kommt ausschliesslich aus crypto.getRandomValues.

export const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!"§$%&/()=?',
  special: '`´^°<>|{}[]\\@€µ~*+#\'-_.,;:',
};

// Leicht zu verwechselnde Zeichen, optional ausgeschlossen
export const AMBIGUOUS = 'O0oIl1|';

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;

/** Gleichverteilte Zufallszahl in [0, max) ohne Modulo-Verzerrung (Rejection Sampling). */
export function randomInt(max, rng = globalThis.crypto) {
  if (!Number.isInteger(max) || max < 1 || max > 2 ** 32) throw new RangeError('max ausserhalb des Bereichs');
  const limit = Math.floor(2 ** 32 / max) * max;
  const buf = new Uint32Array(1);
  do {
    rng.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

/** Aktive Zeichenmengen laut Optionen, ggf. ohne verwechselbare Zeichen. */
export function activeSets(opts) {
  const strip = (s) => (opts.avoidAmbiguous ? [...s].filter((c) => !AMBIGUOUS.includes(c)).join('') : s);
  return ['lower', 'upper', 'digits', 'symbols', 'special']
    .filter((k) => opts[k])
    .map((k) => ({ key: k, chars: strip(SETS[k]) }))
    .filter((s) => s.chars.length > 0);
}

export function clampLength(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 20;
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, v));
}

/** Passwort erzeugen. Jede aktive Gruppe kommt mindestens einmal vor. Gibt '' zurueck, wenn nichts aktiv ist. */
export function generate(opts, rng = globalThis.crypto) {
  const sets = activeSets(opts);
  if (sets.length === 0) return '';
  const length = Math.max(clampLength(opts.length), sets.length);
  const pool = sets.map((s) => s.chars).join('');
  const out = sets.map((s) => s.chars[randomInt(s.chars.length, rng)]);
  while (out.length < length) out.push(pool[randomInt(pool.length, rng)]);
  // Fisher-Yates, damit die Pflichtzeichen nicht vorne stehen
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join('');
}

/** Entropie in Bit (Naeherung: gleichverteilt aus dem gesamten Pool). */
export function entropyBits(opts) {
  const sets = activeSets(opts);
  if (sets.length === 0) return 0;
  const size = new Set(sets.map((s) => s.chars).join('')).size;
  return Math.max(clampLength(opts.length), sets.length) * Math.log2(size);
}

/** Einstufung fuer die Anzeige. */
export function strengthLevel(bits) {
  if (bits < 40) return { id: 'weak', label: 'Schwach' };
  if (bits < 64) return { id: 'fair', label: 'Ausreichend' };
  if (bits < 100) return { id: 'good', label: 'Stark' };
  return { id: 'great', label: 'Sehr stark' };
}

/** Zeichenklasse fuer die Einfaerbung in der Anzeige. */
export function charClass(c) {
  if (/[0-9]/.test(c)) return 'digit';
  if (/[A-Za-z]/.test(c)) return 'letter';
  return 'sym';
}
