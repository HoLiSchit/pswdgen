// Nervmodus (?nerv): Parodie darauf, wie aufdringlich manche Seiten sind.
// Alles hier ist Theater: kein Checkout, keine Eingabe wird gespeichert oder gesendet.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
const rand = (a) => a[Math.floor(Math.random() * a.length)];

const css = document.createElement('link');
css.rel = 'stylesheet';
css.href = new URL('nerv.css', import.meta.url).href;
document.head.append(css);

function h(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function toast(msg, ms = 3000) {
  const t = h('div', 'nv-toast');
  t.textContent = msg;
  document.body.append(t);
  later(() => t.remove(), ms);
}

/** Modal mit Abdunklung. Das X ist winzig und weicht den ersten drei Klicks aus. */
function modal(inner, { dodge = true, onClose } = {}) {
  const dim = h('div', 'nv-dim');
  const box = h('div', 'nv-box');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.append(inner);
  dim.append(box);
  const close = () => { dim.remove(); onClose?.(); };
  if (dodge) {
    const x = h('button', 'nv-x', '✕');
    x.setAttribute('aria-label', 'Schließen');
    let dodged = 0;
    const flee = (e) => {
      if (reduce || dodged >= 3) return;
      dodged++;
      e.preventDefault();
      x.style.transform = `translate(${-40 - Math.random() * 120}px, ${20 + Math.random() * 120}px)`;
    };
    x.addEventListener('pointerenter', flee);
    x.addEventListener('pointerdown', flee);
    x.addEventListener('click', close);
    box.append(x);
  }
  document.body.append(dim);
  return { dim, box, close };
}

const btn = (label, cls, fn) => { const b = h('button', 'nv-btn ' + (cls || ''), label); b.type = 'button'; b.addEventListener('click', fn); return b; };

// 1. Cookie-Banner ---------------------------------------------------------
function cookieBanner(done) {
  const wrap = h('div');
  let m;
  let saveTries = 0;
  const accept = () => { m.close(); toast('Super Entscheidung! 🍪'); done(); };

  const main = () => {
    wrap.replaceChildren();
    wrap.append(
      h('h2', '', 'Wir lieben Cookies 🍪'),
      h('p', '', 'Wir und <b>847 Partner</b> speichern Informationen auf deinem Gerät, um dir ein Passwort anzuzeigen. Das hätte auch ein Würfel gekonnt, aber so ist es persönlicher. Mit „Alle akzeptieren“ stimmst du außerdem zu, dass wir dein Passwort <i>gern haben</i>.'),
      h('p', 'nv-small', 'Zwecke: Personalisierte Anzeigen, Messung der Messung, Geräteeigenschaften aktiv abfragen, Standortdaten (ungefähr, aber hartnäckig), Wiedererkennung deines Lieblingszeichens, Verbesserung der Verbesserung.'),
      btn('Alle akzeptieren (empfohlen)', '', accept),
      btn('Einstellungen verwalten', 'ghost', settings),
    );
    const no = h('button', 'nv-tiny', 'Ablehnen');
    no.type = 'button';
    no.addEventListener('click', confirmNo);
    wrap.append(no);
  };

  const confirmNo = () => {
    wrap.replaceChildren(
      h('h2', '', 'Wirklich? 🥺'),
      h('p', '', 'Ohne Cookies wird dein Passwort <b>langweiliger</b>. Und wir sind traurig. Sehr.'),
      btn('Doch lieber akzeptieren', '', accept),
    );
    const sure = h('button', 'nv-tiny', 'Ja, ich bin sicher');
    sure.type = 'button';
    sure.addEventListener('click', settings);
    wrap.append(sure);
  };

  const settings = () => {
    const purposes = ['Unbedingt erforderlich (immer aktiv)', 'Funktional', 'Analyse', 'Marketing', 'Personalisierte Werbung', 'Werbung für Werbung', 'Social Media', 'Standort', 'Geräte-Fingerabdruck', 'Berechtigtes Interesse: Passwörter', 'Berechtigtes Interesse: Alles andere', 'Nicht näher bezeichnete Zwecke'];
    const list = h('div', 'nv-set');
    purposes.forEach((p, i) => {
      const l = h('label');
      const cb = h('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.disabled = i === 0 || i >= 9;
      l.append(h('span', '', p), cb);
      list.append(l);
    });
    wrap.replaceChildren(
      h('h2', '', 'Deine Einstellungen'),
      h('p', 'nv-small', 'Berechtigtes Interesse kann nicht deaktiviert werden. Es ist sehr berechtigt.'),
      list,
    );
    const save = btn('Auswahl speichern', '', () => {
      save.disabled = true;
      save.innerHTML = '<span class="nv-spin"></span> Speichere…';
      later(() => {
        saveTries++;
        if (saveTries < 2) {
          save.disabled = false;
          save.textContent = 'Auswahl speichern';
          wrap.append(h('p', 'nv-small', 'Fehler 0x80004005: Bitte erneut versuchen. Wir wissen auch nicht, warum.'));
          if (!reduce) { m.box.classList.remove('nv-shake'); void m.box.offsetWidth; m.box.classList.add('nv-shake'); }
        } else { m.close(); toast('Gespeichert. Fast alles blieb an. 🙂'); done(); }
      }, 2200);
    });
    wrap.append(save, btn('Doch alle akzeptieren', 'ghost', accept));
  };

  m = modal(wrap, { dodge: false });
  main();
  return m;
}

// 2. Newsletter ------------------------------------------------------------
function newsletter() {
  const w = h('div');
  w.append(
    h('span', 'nv-badge', 'EXKLUSIV'),
    h('h2', '', 'Verpasse keine Passwörter!'),
    h('p', '', 'Trag dich in unseren Newsletter ein und erhalte <b>jeden Tag</b> ein neues Passwort, das du gar nicht angefordert hast. Dazu 10 % Rabatt auf nichts.'),
  );
  const mail = h('input');
  mail.type = 'email';
  mail.placeholder = 'deine@mail.de';
  mail.style.cssText = 'width:100%;padding:12px;font:16px Arial;border:2px solid #ccc;border-radius:4px;margin-bottom:6px';
  let m;
  w.append(mail, btn('Ja, ich will!', '', () => {
    if (!mail.value.includes('@')) { mail.style.borderColor = '#e11'; return; }
    w.replaceChildren(h('h2', '', 'Danke! 🎉'), h('p', '', 'Leider ist deine Adresse zu sicher. Wir haben sie vorsichtshalber nicht gespeichert (wir haben sie überhaupt nicht gesendet, das hier ist Theater).'), btn('Okay', 'ghost', () => m.close()));
  }));
  const no = h('button', 'nv-link', 'Nein danke, ich mag unsichere Passwörter');
  no.type = 'button';
  no.addEventListener('click', () => m.close());
  w.append(no);
  m = modal(w);
}

// 3. Abo ----------------------------------------------------------------------
function subscription() {
  let secs = 9 * 60 + 59;
  const w = h('div', 'nv-center');
  const timer = h('div', 'nv-timer', '09:59');
  w.append(
    h('span', 'nv-badge', 'NUR HEUTE · LETZTE CHANCE'),
    h('h2', '', 'Hol dir pswd<span style="color:#ff2e93">+</span> Premium'),
    h('div', 'nv-price', '<s>4,99 €</s> 0,99 €<small style="font-size:.9rem">/Woche*</small>'),
    timer,
    h('ul', 'nv-list', '<li>✔ Passwörter mit mehr als 8 Zeichen</li><li>✔ Kopieren ohne Wartezeit</li><li>✔ Ein Passwort-Zwilling (gleich, aber teurer)</li><li>✔ Premium-Zufall (80 % zufälliger)</li>'),
    h('p', 'nv-small', '* wird jährlich mit 51,48 € abgerechnet. Kündigung per Brief, Fax oder Brieftaube. Nur noch <b>2 Lizenzen</b> verfügbar. 14 Personen schauen sich das gerade an.'),
  );
  let m;
  const tick = every(() => { secs = secs > 0 ? secs - 1 : 9 * 60 + 59; timer.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0'); }, 1000);
  w.append(btn('Jetzt upgraden', 'green', () => {
    clearInterval(tick);
    w.replaceChildren(
      h('h2', '', 'Kleiner Scherz 😄'),
      h('p', '', 'Das ist der Nervmodus. Es gibt kein Abo, keinen Checkout, und es wurde nichts gebucht oder gespeichert. So schlimm sind andere Seiten.'),
      btn('Danke, aufhören', 'ghost', () => m.close()),
    );
  }));
  const no = h('button', 'nv-link', 'Nein, ich zahle lieber mit meinen Daten');
  no.type = 'button';
  no.addEventListener('click', () => { clearInterval(tick); m.close(); toast('Schade. Wir fragen später nochmal. 😊'); });
  w.append(no);
  m = modal(w, { onClose: () => clearInterval(tick) });
}

// 4. Kleinkram -------------------------------------------------------------
function viewersBar() {
  const bar = h('div', 'nv-bar');
  const msgs = () => rand([
    `🔥 ${5 + Math.floor(Math.random() * 30)} Personen sehen sich gerade dieses Passwort an`,
    '⏰ Dein Passwort läuft in 09:59 ab (tut es nicht)',
    '⭐ „Das beste Passwort, das ich je gesehen habe“ – Jemand, 2026',
    '🚚 Kostenloser Versand! (Es gibt nichts zu versenden.)',
  ]);
  bar.textContent = msgs();
  document.body.append(bar);
  every(() => { bar.textContent = msgs(); }, 4500);
}

function chat() {
  const c = h('div', 'nv-chat');
  const head = h('header', '', '<span>Pwdi · online 🟢</span>');
  const x = h('button', 'nv-x', '✕');
  x.style.cssText = 'position:static;color:#fff;width:auto;transform:none';
  x.addEventListener('click', () => { c.remove(); later(chat, 12000); });
  head.append(x);
  const body = h('div', '', '<span class="dots">Pwdi tippt</span>');
  c.append(head, body);
  document.body.append(c);
  const lines = ['Hi! 👋 Ich bin Pwdi. Brauchst du Hilfe bei deinem Passwort?', 'Hallo? Jemand zu Hause?', 'Ich habe gesehen, dass du dir ein Passwort ansiehst. Wollen wir darüber sprechen?', 'Dein Passwort sieht einsam aus. Ein zweites dazu?'];
  let i = 0;
  later(() => { body.textContent = lines[0]; }, 1800);
  every(() => { if (c.isConnected) { i = (i + 1) % lines.length; body.innerHTML = '<span class="dots">Pwdi tippt</span>'; later(() => { body.textContent = lines[i]; }, 1500); } }, 9000);
}

function adblock() {
  const bar = h('div', 'nv-bar top', '🚫 Wir haben einen Werbeblocker erkannt (stimmt nicht). Bitte deaktiviere ihn, damit wir dich besser nerven können.');
  const x = h('button', 'nv-link', 'Ich habe keinen');
  x.style.color = '#222';
  x.addEventListener('click', () => { bar.textContent = 'Das sagen alle. 🤨'; later(() => bar.remove(), 1800); });
  bar.append(' ', x);
  document.body.append(bar);
}

function fakeNotification() {
  const n = h('div', 'nv-notif', '<b>pswdgen</b> möchte dir Benachrichtigungen senden <small>(nicht die vom Browser, nur Theater)</small>');
  const row = h('div', 'row');
  const reply = (t) => { n.textContent = t; later(() => n.remove(), 2000); };
  const block = h('button', '', 'Blockieren');
  block.addEventListener('click', () => reply('Wir fragen morgen wieder. 🔔'));
  const allow = h('button', '', 'Zulassen');
  allow.addEventListener('click', () => reply('Danke! Du bekommst alle 5 Minuten ein Passwort. (Nein.)'));
  row.append(block, allow);
  n.append(row);
  document.body.append(n);
}

function rating() {
  const w = h('div', 'nv-center');
  w.append(h('h2', '', 'Wie gefällt dir pswdgen?'), h('p', '', 'Bewerte uns jetzt, es dauert nur 3 Minuten!'));
  const stars = h('div', 'nv-stars');
  let m;
  for (let i = 0; i < 5; i++) {
    const s = h('button', '', '⭐');
    s.type = 'button';
    s.addEventListener('click', () => { w.replaceChildren(h('h2', '', 'Danke! 🙏'), h('p', '', 'Bitte jetzt noch eine Rezension schreiben, mindestens 200 Zeichen. (Kleiner Scherz.)'), btn('Okay', 'ghost', () => m.close())); });
    stars.append(s);
  }
  w.append(stars);
  m = modal(w);
}


// 5. Fake-Werbung genau dort, wo man hinwill -------------------------------------
const ADS = [
  ['Heiße Singles in deiner Nähe!', 'Sie suchen ein Passwort (und mehr).', '#ff2e93'],
  ['Ein Trick, den Hacker hassen!', 'Dieses Passwort-Gadget schockiert Experten.', '#111'],
  ['Du hast gewonnen! 🎁', '1.000.000. Besucher. Klicke hier, bevor es jemand anderes tut.', '#1db954'],
  ['Sofortkredit ohne Schufa', 'Auch für Leute, die gar nichts brauchen.', '#5b3df5'],
  ['Dein PC ist langsam!', '3 Viren gefunden (frei erfunden). Jetzt reparieren.', '#e11'],
  ['Opa entdeckt 1 Trick', 'Seitdem hat er nie wieder ein Passwort vergessen.', '#ff8a00'],
];
let lastPtr = { x: innerWidth / 2, y: innerHeight / 2 };
addEventListener('pointermove', (e) => { lastPtr = { x: e.clientX, y: e.clientY }; }, { passive: true });
addEventListener('pointerdown', (e) => { lastPtr = { x: e.clientX, y: e.clientY }; }, { passive: true });

function adHtml(a) {
  return `<small style="opacity:.75;font-size:9px;letter-spacing:.08em">ANZEIGE</small><b style="display:block;font-size:15px;margin:2px 0">${a[0]}</b><span style="font-size:12px">${a[1]}</span><span style="display:block;margin-top:6px;padding:5px;background:#fff;color:#111;font:800 12px Arial;text-align:center;border-radius:3px">JETZT ANSEHEN ›</span>`;
}

/** Werbung, die sich genau dorthin legt, wo zuletzt der Zeiger war. */
function popAdAtPointer() {
  if (document.querySelector('.nv-dim')) return;
  const a = rand(ADS);
  const ad = h('div', 'nv-ad', adHtml(a));
  ad.style.background = a[2];
  const w = Math.min(250, innerWidth - 16), hgt = 112;
  ad.style.width = w + 'px';
  ad.style.left = Math.max(8, Math.min(innerWidth - w - 8, lastPtr.x - w / 2)) + 'px';
  ad.style.top = Math.max(8, Math.min(innerHeight - hgt - 8, lastPtr.y - hgt / 2)) + 'px';
  const x = h('button', 'nv-x', '✕');
  x.setAttribute('aria-label', 'Werbung schließen');
  x.style.color = 'rgba(255,255,255,.6)';
  x.addEventListener('click', (e) => { e.stopPropagation(); ad.remove(); });
  ad.append(x);
  ad.addEventListener('click', () => { ad.remove(); toast('Du hast auf Werbung geklickt! 🎉 (Es passiert nichts.)', 2800); });
  document.body.append(ad);
  later(() => ad.remove(), 6000);
}

/** Banner schiebt den Inhalt nach unten, sobald der Zeiger dem Kopieren-Knopf nahe kommt. */
function layoutShiftAd() {
  const main = document.querySelector('.wrap');
  const a = rand(ADS);
  const ad = h('div', 'nv-shift', adHtml(a));
  ad.style.background = a[2];
  ad.addEventListener('click', () => toast('Das war Werbung. Der Knopf ist woanders. 😅', 2500));
  main.insertBefore(ad, document.querySelector('.result'));
  later(() => ad.remove(), 7000);
}

function shiftTrap() {
  let cooldown = 0;
  addEventListener('pointermove', (e) => {
    if (Date.now() < cooldown || document.querySelector('.nv-dim, .nv-shift')) return;
    const r = document.querySelector('#copy').getBoundingClientRect();
    const near = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 70 && e.clientY < r.bottom + 40;
    if (near) { cooldown = Date.now() + 14000; layoutShiftAd(); }
  }, { passive: true });
}

// Kopieren und Laenge nur "Premium" -------------------------------------------
function gate() {
  const copy = document.querySelector('#copy');
  let allow = false;
  copy.addEventListener('click', (e) => {
    if (allow) { allow = false; return; }
    e.stopImmediatePropagation();
    e.preventDefault();
    const w = h('div', 'nv-center');
    w.append(h('span', 'nv-badge', 'PREMIUM-FUNKTION'), h('h2', '', 'Kopieren ist ein Premium-Feature'), h('p', '', 'Du kannst es auch abtippen. Oder kurz warten.'));
    let left = 5, m;
    const go = btn('', 'ghost', () => { m.close(); allow = true; copy.click(); later(rating, 1200); });
    go.disabled = true;
    const paint = () => { go.textContent = left > 0 ? `Trotzdem kopieren (in ${left} s)` : 'Trotzdem kopieren'; go.disabled = left > 0; };
    paint();
    const t = every(() => { left--; paint(); if (left <= 0) clearInterval(t); }, 1000);
    w.append(btn('Premium holen', '', () => { m.close(); subscription(); }), go);
    m = modal(w, { onClose: () => clearInterval(t) });
  }, true);

  const guard = (el) => {
    el.addEventListener('input', () => {
      if (Number(el.value) > 8 && !el.dataset.nv) {
        el.dataset.nv = '1';
        later(() => { delete el.dataset.nv; }, 4000);
        toast('Mehr als 8 Zeichen gibt es nur mit Premium. 💎', 3500);
        later(subscription, 800);
      }
    });
  };
  guard(document.querySelector('#len'));
  guard(document.querySelector('#len-num'));
}


// 6. Captcha-Wall ------------------------------------------------------------------
function captcha() {
  if (document.querySelector('.nv-dim')) return;
  const w = h('div');
  let m, round = 0;
  const POOL = ['🚗', '🌳', '🚌', '🏠', '🚲', '🐕', '🪧', '🚦', '🚦', '🌉', '🛵', '🐈'];
  const fails = ['Falsch. Du hast die Ampel hinter dem Bus übersehen.', 'Nicht ganz. Zebrastreifen-Ampeln zählen auch.', 'Fast! Aber eine Ampel war nur zur Hälfte im Bild. Bitte erneut.'];

  const check = () => {
    w.replaceChildren(h('h2', '', 'Beweise, dass du kein Passwort bist'), h('p', '', 'Wähle alle Bilder mit <b>Ampeln</b>.'));
    const grid = h('div', 'nv-grid');
    const tile = () => rand(POOL);
    for (let i = 0; i < 9; i++) {
      const t = h('button', 'nv-tile', tile());
      t.type = 'button';
      t.addEventListener('click', () => {
        t.classList.toggle('on');
        if (t.textContent === '🚦') later(() => { t.classList.remove('on'); t.textContent = tile(); }, 500); // Kachel "laedt nach"
      });
      grid.append(t);
    }
    const msg = h('p', 'nv-small');
    msg.style.color = '#e11';
    const ok = btn('Bestätigen', '', () => {
      if (round < fails.length) {
        msg.textContent = fails[round++];
        grid.querySelectorAll('.nv-tile').forEach((t) => { t.classList.remove('on'); t.textContent = tile(); });
        if (!reduce) { m.box.classList.remove('nv-shake'); void m.box.offsetWidth; m.box.classList.add('nv-shake'); }
      } else {
        w.replaceChildren(h('h2', '', 'Geschafft 🎉'), h('p', '', 'Okay, du bist wohl ein Mensch. Oder ein sehr gutes Passwort.'), btn('Weiter', 'green', () => m.close()));
      }
    });
    w.append(grid, msg, ok, h('p', 'nv-small', 'Geschützt durch reCAPTCHA-ähnlich™. <u>Datenschutz</u> · <u>Nutzungsbedingungen</u> · <u>Wozu das alles</u>'));
  };

  const box = h('label', 'nv-check');
  const cb = h('input');
  cb.type = 'checkbox';
  box.append(cb, h('span', '', 'Ich bin kein Passwort'));
  cb.addEventListener('change', () => {
    box.replaceChildren(h('span', 'nv-spin dark'), h('span', '', 'Prüfe…'));
    later(check, 1600);
  });
  w.append(h('h2', '', 'Kurze Sicherheitsprüfung'), h('p', '', 'Wir müssen sichergehen, dass hier ein Mensch sitzt.'), box);
  m = modal(w, { dodge: false });
}

// 7. Fake-Datenleck --------------------------------------------------------------
function leak() {
  if (document.querySelector('.nv-dim')) return;
  const pw = document.querySelector('#pw').textContent;
  const masked = pw.slice(0, 2) + '•'.repeat(Math.max(0, pw.length - 2));
  const all = ['KrümelBook (2019) · 530 Mio. Konten', 'HotelPasswort24 (2021) · 12 Mio. Konten', 'MeinFitnessHamster (2023) · 4 Mio. Konten', 'Pizzabote.de (2020) · 800.000 Konten', 'Digitaler Reisepass Süd (2022) · 2 Mio. Konten', 'Katzenvideos Plus (2018) · 90 Mio. Konten'];
  const picks = all.sort(() => Math.random() - 0.5).slice(0, 3);
  const w = h('div');
  let m;
  w.append(
    h('span', 'nv-badge', '⚠ SICHERHEITSWARNUNG'),
    h('h2', '', 'Dein Passwort wurde in 3 Datenlecks gefunden!'),
    h('p', '', `<code style="background:#eee;padding:2px 6px">${masked.replace(/[<>&]/g, '')}</code> taucht in diesen Listen auf:`),
    h('ul', 'nv-list', picks.map((p) => `<li>🔓 ${p}</li>`).join('')),
    h('p', 'nv-small', 'Hacker könnten dein Passwort bereits kennen. Vielleicht. Wahrscheinlich. Handle jetzt.'),
  );
  w.append(btn('Passwort reinigen · 2,99 €/Monat', 'green', () => {
    w.replaceChildren(
      h('h2', '', 'Kleiner Scherz 😄'),
      h('p', '', 'Dein Passwort wurde gerade erst erzeugt und steht in keinem Leck. Es gibt keine Reinigung, kein Abo, und nichts wurde gesendet oder gebucht.'),
      btn('Puh, danke', 'ghost', () => m.close()),
    );
  }));
  const later_ = h('button', 'nv-link', 'Später erinnern (nicht empfohlen)');
  later_.type = 'button';
  later_.addEventListener('click', () => { m.close(); toast('Wir erinnern dich in 5 Minuten. Und danach. 🔔'); });
  w.append(later_);
  m = modal(w);
}

// 8. Ladebalken: haengt bei 99 % --------------------------------------------------
let loading = false;
function fakeLoader(done) {
  const result = document.querySelector('.result'), pw = document.querySelector('#pw');
  if (loading || !result) return done?.();
  loading = true;
  result.style.position = 'relative';
  const o = h('div', 'nv-load');
  o.style.top = pw.offsetTop + 'px';
  const label = h('div', 'nv-load-t', 'Passwort wird kalkuliert…');
  const bar = h('div', 'nv-load-bar', '<i></i>');
  const pct = h('div', 'nv-load-p', '0 %');
  o.append(label, bar, pct);
  result.append(o);
  pw.style.visibility = 'hidden';
  const t0 = performance.now();
  const set = (v) => { bar.firstChild.style.width = v + '%'; pct.textContent = Math.floor(v) + ' %'; };
  const msgs = ['Passwort wird kalkuliert…', 'Zufall wird angeworfen…', 'Warte auf den Server (es gibt keinen)…', 'Fast geschafft…', 'Wirklich gleich…'];
  let k = 0;
  const id = every(() => {
    const t = (performance.now() - t0) / 1000;
    const v = t < 1.2 ? (t / 1.2) * 70 : t < 2.4 ? 70 + ((t - 1.2) / 1.2) * 25 : t < 3 ? 95 + ((t - 2.4) / 0.6) * 4 : 99;
    set(Math.min(99, v));
    if (t > 3) { const n = Math.min(msgs.length - 1, 2 + Math.floor((t - 3) / 1.6)); if (n !== k) { k = n; label.textContent = msgs[n]; } }
    if (t > 7) { clearInterval(id); set(100); label.textContent = 'Fertig!'; later(() => { o.remove(); pw.style.visibility = ''; loading = false; done?.(); }, 450); }
  }, 60);
}

// 9. Maskottchen und Tab-Titel ----------------------------------------------------
let duckRaf = 0;
function mascot() {
  const d = h('div', 'nv-duck');
  const emoji = h('span', 'nv-duck-e', '🦆');
  const say = h('div', 'nv-duck-say');
  d.append(emoji, say);
  document.body.append(d);
  let x = innerWidth - 80, y = innerHeight - 120, flip = 1;
  const lines = ['Quak. Sicher, dass du das kopieren willst?', 'Ich folge dir. Nur so.', 'Dein Passwort ist nicht schlecht. Für ein Passwort.', 'Brauchst du Hilfe? Ich bin eine Ente.', 'Hast du schon Premium?', 'Quak!'];
  every(() => { say.textContent = rand(lines); say.style.opacity = 1; later(() => { say.style.opacity = 0; }, 3200); }, 11000);
  const tick = () => {
    const tx = lastPtr.x + 18, ty = lastPtr.y + 16;
    if (!reduce) {
      const dx = tx - x;
      x += dx * 0.06; y += (ty - y) * 0.06;
      if (Math.abs(dx) > 4) flip = dx > 0 ? 1 : -1;
    } else { x = innerWidth - 60; y = innerHeight - 100; }
    d.style.transform = `translate(${Math.max(0, Math.min(innerWidth - 40, x))}px, ${Math.max(0, Math.min(innerHeight - 40, y))}px)`;
    emoji.style.transform = `scaleX(${-flip})`;
    duckRaf = requestAnimationFrame(tick);
  };
  tick();
}

const baseTitle = document.title;
function tabTitle() {
  const sad = ['Komm zurück 😢', 'Hallo? 🥺', 'Dein Passwort vermisst dich', 'Ich warte… ⏳', 'Bitte geh nicht weg 💔'];
  let i = 0, t;
  document.addEventListener('visibilitychange', onVis = () => {
    clearInterval(t);
    if (document.hidden) {
      document.title = sad[0];
      t = every(() => { i = (i + 1) % sad.length; document.title = sad[i]; }, 1500);
    } else {
      document.title = 'Willkommen zurück! 🎉';
      later(() => { document.title = baseTitle; }, 2500);
    }
  });
}
let onVis;

// Ablauf der Regen-Klicks: Ladebalken, dann Captcha oder Leck-Warnung
function regenHooks() {
  let n = 0;
  document.querySelector('#regen').addEventListener('click', () => {
    n++;
    fakeLoader(() => { if (n % 3 === 0) captcha(); else if (n === 2 || n % 5 === 0) leak(); });
  });
}

// Ablauf -----------------------------------------------------------------------
function exit() {
  timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  document.querySelectorAll('.nv-dim, .nv-bar, .nv-chat, .nv-notif, .nv-toast, .nv-ad, .nv-shift, .nv-duck, .nv-load').forEach((e) => e.remove());
  const u = new URL(location.href);
  u.searchParams.delete('nerv');
  history.replaceState(null, '', u);
  cancelAnimationFrame(duckRaf);
  if (onVis) document.removeEventListener('visibilitychange', onVis);
  document.title = baseTitle;
  document.querySelector('#pw').style.visibility = '';
  loading = false;
  toast('Ruhe. 😌', 2500);
  document.removeEventListener('keydown', onKey);
}
const onKey = (e) => { if (e.key === 'Escape') exit(); };
document.addEventListener('keydown', onKey);

gate();
cookieBanner(() => {
  viewersBar();
  later(chat, 1500);
  later(newsletter, 4000);
  later(adblock, 9000);
  later(subscription, 15000);
  later(fakeNotification, 26000);
  shiftTrap();
  mascot();
  tabTitle();
  regenHooks();
  later(() => { popAdAtPointer(); every(popAdAtPointer, 11000); }, 7000);
  every(() => rand([newsletter, subscription, rating, adblock, captcha, leak])(), 32000);
  document.documentElement.addEventListener('mouseleave', (e) => {
    if (e.clientY > 0 || document.querySelector('.nv-dim')) return;
    const w = h('div', 'nv-center');
    let m;
    w.append(h('h2', '', 'Warte! Geh nicht! 😱'), h('p', '', 'Nimm wenigstens 10 % Rabatt auf nichts mit. Code: <b>BLEIB</b>'), btn('Gutschein einlösen', 'green', () => { m.close(); toast('Gutschein eingelöst: du sparst 0,00 €'); }));
    m = modal(w);
  });
});
later(() => toast('Tipp: Mit Esc ist sofort Ruhe.', 5000), 20000);
