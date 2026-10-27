import test from 'node:test';
import assert from 'node:assert/strict';
import { generate, activeSets, entropyBits, clampLength, randomInt, SETS, AMBIGUOUS } from '../generator.js';

const base = { length: 24, lower: true, upper: true, digits: true, symbols: true, special: true, avoidAmbiguous: false };

test('Laenge stimmt und wird begrenzt', () => {
  assert.equal(generate({ ...base, length: 30 }).length, 30);
  assert.equal(clampLength(1), 4);
  assert.equal(clampLength(9999), 128);
  assert.equal(clampLength('abc'), 20);
});

test('nichts aktiv ergibt leeren String', () => {
  assert.equal(generate({ length: 20 }), '');
});

test('nur Zahlen', () => {
  const p = generate({ length: 40, digits: true });
  assert.match(p, /^[0-9]{40}$/);
});

test('jede aktive Gruppe kommt vor, auch bei Mindestlaenge', () => {
  for (let i = 0; i < 300; i++) {
    const p = generate({ ...base, length: 5 });
    for (const k of ['lower', 'upper', 'digits', 'symbols', 'special']) {
      assert.ok([...p].some((c) => SETS[k].includes(c)), `${k} fehlt in ${p}`);
    }
  }
});

test('deaktivierte Gruppen tauchen nie auf', () => {
  for (let i = 0; i < 200; i++) {
    const p = generate({ ...base, special: false, symbols: false, length: 64 });
    assert.ok(![...p].some((c) => SETS.symbols.includes(c) || SETS.special.includes(c)));
  }
});

test('verwechselbare Zeichen werden ausgelassen', () => {
  for (let i = 0; i < 200; i++) {
    const p = generate({ ...base, avoidAmbiguous: true, length: 64 });
    assert.ok(![...p].some((c) => AMBIGUOUS.includes(c)));
  }
});

test('randomInt deckt den Bereich gleichmaessig ab', () => {
  const counts = new Array(7).fill(0);
  for (let i = 0; i < 70000; i++) counts[randomInt(7)]++;
  for (const c of counts) assert.ok(c > 9000 && c < 11000, `Verteilung auffaellig: ${counts}`);
});

test('Entropie waechst mit Laenge und Pool', () => {
  const a = entropyBits({ length: 10, lower: true });
  const b = entropyBits({ length: 20, lower: true });
  const c = entropyBits({ length: 20, lower: true, upper: true });
  assert.ok(b > a && c > b);
  assert.equal(activeSets({ lower: true }).length, 1);
});
