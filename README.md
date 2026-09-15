# PractiScore dodaj kluby PZSS

Wtyczka do przeglądarki dla organizatorów zawodów strzeleckich w Polsce, którzy prowadzą zapisy przez [PractiScore](https://practiscore.com). Jednym kliknięciem wstawia do pola typu Drop Down w formularzu zapisów aktualną listę klubów licencjonowanych przez PZSS.

- Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/practiscore-dodaj-kluby-pzss/)
- Chrome / Edge: paczka budowana z tego repozytorium (`./buduj.sh`)

## Jak działa

1. Po otwarciu edytora formularza zapisów na practiscore.com (strona z `form#customForm`) skrypt w tle (`background.js`) pobiera publiczny rejestr klubów z `soz.pzss.org.pl/Clubs/IndexDataAjax`. Stan pobierania pokazuje duże okienko u góry strony.
2. Przy każdym polu Drop Down pojawia się przycisk **Dodaj kluby PZSS**. Ustawia etykietę „Klub PZSS”, podpowiedź, zaznacza pole jako wymagane i wstawia kluby w formacie `SKRÓT Miejscowość (Miasto)`.
3. Gdy PZSS nie odpowiada, używana jest lista wbudowana (`kluby_nazwy.js`).
4. Gdy wtyczka nie ma dostępu do `soz.pzss.org.pl`, okienko proponuje **Zezwól**. Przycisk otwiera stronę `uprawnienia.html` z `permissions.request()`, a po zgodzie karta PractiScore sama pobiera listę ponownie.

Wtyczka nie zbiera ani nie wysyła żadnych danych użytkownika.

## Pliki

| Plik | Rola |
|---|---|
| `manifest.json` | manifest MV3 (wersja dla Firefoksa; wersję dla Chrome generuje `buduj.sh`) |
| `background.js` | pobieranie listy klubów z PZSS, otwieranie strony zgody |
| `kluby_format.js` | zamiana odpowiedzi PZSS na posortowaną listę nazw bez dubli |
| `dodajKluby.js` | content script: okienko, przycisk i wstawianie klubów do formularza |
| `uprawnienia.html`, `uprawnienia.js` | strona udzielania zgody na dostęp do `soz.pzss.org.pl` |
| `kluby_nazwy.js` | lista wbudowana (zapasowa) |
| `jquery-3.6.3.min.js` | jQuery (licencja MIT) |
| `generuj_kluby_nazwy.js` | odświeża `kluby_nazwy.js` z rejestru PZSS |
| `kluby_format.test.js` | testy `kluby_format.js` |
| `buduj.sh` | testy, lint i budowa paczek |

## Budowanie

Wymagany Node.js 22+ oraz `zip`.

```bash
node generuj_kluby_nazwy.js   # opcjonalnie: odśwież listę wbudowaną przed wydaniem
./buduj.sh
```

Wynik:

- `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-firefox.zip`: Firefox (AMO)
- `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-chrome.zip`: Chrome Web Store i Edge Add-ons
- `dist/firefox`, `dist/chrome`: rozpakowane wersje do testów

Przed każdym wydaniem zwiększ `version` w `manifest.json`.

## Testowanie

- Testy jednostkowe: `node --test kluby_format.test.js`
- Firefox: `about:debugging#/runtime/this-firefox` → „Load Temporary Add-on…” → `manifest.json`
- Chrome / Edge: `chrome://extensions` / `edge://extensions` → Tryb dewelopera → „Załaduj rozpakowane” → `dist/chrome`

Potem otwórz edytor formularza zapisów na practiscore.com (wymaga zalogowania). Żeby sprawdzić scenariusz bez zgody, wyłącz dostęp do `soz.pzss.org.pl` w ustawieniach wtyczki i odśwież stronę.

## Pomysły

- Pole wyboru regionu: gdy region to PL, wybór klubu nie jest wymagany.

## Licencja

[MIT](LICENSE). Wtyczka jest niezależnym projektem i nie jest powiązana z PractiScore ani z Polskim Związkiem Strzelectwa Sportowego.
