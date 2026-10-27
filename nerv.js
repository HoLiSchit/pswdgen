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

// Ablauf -----------------------------------------------------------------------
function exit() {
  timers.forEach((t) => { clearTimeout(t); clearInterval(t); });
  document.querySelectorAll('.nv-dim, .nv-bar, .nv-chat, .nv-notif, .nv-toast, .nv-ad, .nv-shift').forEach((e) => e.remove());
  const u = new URL(location.href);
  u.searchParams.delete('nerv');
  history.replaceState(null, '', u);
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
  later(() => { popAdAtPointer(); every(popAdAtPointer, 11000); }, 7000);
  every(() => rand([newsletter, subscription, rating, adblock])(), 32000);
  document.documentElement.addEventListener('mouseleave', (e) => {
    if (e.clientY > 0 || document.querySelector('.nv-dim')) return;
    const w = h('div', 'nv-center');
    let m;
    w.append(h('h2', '', 'Warte! Geh nicht! 😱'), h('p', '', 'Nimm wenigstens 10 % Rabatt auf nichts mit. Code: <b>BLEIB</b>'), btn('Gutschein einlösen', 'green', () => { m.close(); toast('Gutschein eingelöst: du sparst 0,00 €'); }));
    m = modal(w);
  });
});
later(() => toast('Tipp: Mit Esc ist sofort Ruhe.', 5000), 20000);
