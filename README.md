# pswdgen

Passwortgenerator im Browser. Reines HTML, CSS und JavaScript, kein Build, keine Abhängigkeiten, keine Tracker.

Live: https://mineco.de/tools/pswdgen/

## Funktionen

- Länge 4 bis 128 (Regler oder Zahleneingabe)
- Kleinbuchstaben, Großbuchstaben, Zahlen
- Sonderzeichen `!"§$%&/()=?` und spezielle Sonderzeichen (`@€#*+-_.,;:<>[]{}|~^°` u. a.) getrennt schaltbar
- Optional: verwechselbare Zeichen (`O 0 l I 1`) vermeiden
- Stärkeanzeige in Bit
- Einstellungen und Hell/Dunkel bleiben im Browser (`localStorage`); das Passwort selbst wird nie gespeichert

## Sicherheit

Zufall kommt aus `crypto.getRandomValues`, Zeichen werden per Rejection Sampling ohne Verzerrung gewählt. Jede aktive Gruppe kommt mindestens einmal vor. Nichts verlässt den Browser.

## Entwicklung

```bash
node --test          # Tests der Generatorlogik
python3 -m http.server 8080   # lokal ansehen (ES-Module brauchen http, nicht file://)
```

## Deployment

Der Server `mineco.de` holt `main` per Cron (`git pull --ff-only`, jede Minute) nach `/var/www/html/guest/pswdgen`. Ein Push auf `main` ist damit nach spätestens einer Minute live.

## Lizenz

MIT
