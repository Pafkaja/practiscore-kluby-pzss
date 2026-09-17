#!/usr/bin/env bash
# Buduje paczki wtyczki dla Firefoksa (AMO) i Chrome (Chrome Web Store / Edge Add-ons).
# manifest.json w repo jest wersja dla Firefoksa; wersje dla Chrome generujemy z niej.
# Wynik: web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-{firefox,chrome}.zip
# oraz rozpakowane katalogi dist/firefox i dist/chrome (do testow "Load unpacked").
set -euo pipefail
cd "$(dirname "$0")"

PLIKI=(
    manifest.json PaFka_ikona.png
    background.js kluby_format.js
    jquery-3.6.3.min.js kluby_nazwy.js dodajKluby.js
    uprawnienia.html uprawnienia.js
    konwerter.html konwerter.js kluby_historyczne.js csv.js
)

node --test kluby_format.test.js csv.test.js

rm -rf dist
mkdir -p dist/firefox dist/chrome web-ext-artifacts
cp "${PLIKI[@]}" dist/firefox/
cp "${PLIKI[@]}" dist/chrome/

node - <<'EOF'
const fs = require("node:fs");
const m = JSON.parse(fs.readFileSync("manifest.json", "utf-8"));
// Chrome MV3: tlo tylko jako service worker (kluby_format.js dociaga importScripts w background.js),
// bez kluczy specyficznych dla Firefoksa.
m.background = { service_worker: "background.js" };
delete m.browser_specific_settings;
m.minimum_chrome_version = "121";
fs.writeFileSync("dist/chrome/manifest.json", JSON.stringify(m, null, 2) + "\n");
EOF

WERSJA=$(node -p 'require("./manifest.json").version')

npx --yes web-ext lint --source-dir dist/firefox --self-hosted=false

for przegladarka in firefox chrome; do
    ZIP="web-ext-artifacts/practiscore_dodaj_kluby_pzss-${WERSJA}-${przegladarka}.zip"
    rm -f "$ZIP"
    (cd "dist/$przegladarka" && zip -q -X -r "../../$ZIP" .)
    echo "Gotowe: $ZIP"
done
