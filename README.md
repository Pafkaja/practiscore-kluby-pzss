# PractiScore dodaj kluby PZSS

Wtyczka do przeglądarki dla organizatorów zawodów strzeleckich w Polsce, którzy prowadzą zapisy przez [PractiScore](https://practiscore.com). Jednym kliknięciem wstawia do pola typu Drop Down w formularzu zapisów aktualną listę klubów licencjonowanych przez PZSS.

## Instalacja

- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/practiscore-dodaj-kluby-pzss/)
- **Chrome:** [Chrome Web Store](https://chromewebstore.google.com/detail/practiscore-dodaj-kluby-p/cdmdfcdgdjnalpaoplhhcgbjefejljph)
- **Edge:** z [Chrome Web Store](https://chromewebstore.google.com/detail/practiscore-dodaj-kluby-p/cdmdfcdgdjnalpaoplhhcgbjefejljph). Edge przy pierwszej wizycie w sklepie poprosi o włączenie opcji „Zezwalaj na rozszerzenia z innych sklepów”.

Po instalacji otwórz edytor formularza zapisów na practiscore.com, dodaj pole **Drop Down Field** i kliknij przy nim **Dodaj kluby PZSS**.

## Eksport CSV z PractiScore

PractiScore w eksporcie zawodników (CSV) zapisuje zamiast nazwy opcji jej uproszczoną wersję (slug), np. `ardea-gdansk` zamiast `ARDEA Gdańsk`. Formularz nie ma na to wpływu, bo PractiScore tworzy te wartości sam.

Kliknij ikonę wtyczki na pasku narzędzi, żeby otworzyć **konwerter CSV**:

1. Przeciągnij albo wybierz plik CSV wyeksportowany z PractiScore.
2. Konwerter sam wybierze kolumnę z klubem i pokaże, co rozpoznał. Wartości spoza listy, np. opcja „Mojego klubu nie ma na liście”, zostają bez zmian.
3. **Pobierz poprawiony CSV**: kluby mają nazwy z rejestru PZSS, pozostałe kolumny są bez zmian, plik jest w UTF-8 (Excel pokaże polskie znaki).

Plik jest przetwarzany tylko w przeglądarce. Konwerter rozpoznaje formularze utworzone wszystkimi wersjami wtyczki, także kluby, których nie ma już w rejestrze PZSS (`kluby_historyczne.js`).

## Jak działa

1. Po otwarciu edytora formularza zapisów na practiscore.com (strona z `form#customForm`) skrypt w tle (`background.js`) pobiera publiczny rejestr klubów z `soz.pzss.org.pl/Clubs/IndexDataAjax`. Stan pobierania pokazuje duże okienko u góry strony.
2. Przy każdym polu Drop Down pojawia się przycisk **Dodaj kluby PZSS**. Ustawia etykietę „Klub PZSS”, podpowiedź, zaznacza pole jako wymagane i zastępuje opcje pola klubami w formacie `SKRÓT Miejscowość (Miasto)`. Przycisk **add option** zostaje, więc można dopisać własne opcje (np. „Mojego klubu nie ma na liście”).
3. Gdy PZSS nie odpowiada, używana jest lista wbudowana (`kluby_nazwy.js`).
4. Gdy wtyczka nie ma dostępu do `soz.pzss.org.pl`, okienko proponuje **Zezwól**. Przycisk otwiera stronę `uprawnienia.html` z `permissions.request()`, a po zgodzie karta PractiScore sama pobiera listę ponownie.

Wtyczka nie zbiera ani nie wysyła żadnych danych użytkownika.

## Pliki

| Plik | Rola |
|---|---|
| `manifest.json` | manifest MV3 (wersja dla Firefoksa; wersję dla Chrome generuje `buduj.sh`) |
| `background.js` | pobieranie listy klubów z PZSS, otwieranie strony zgody i konwertera |
| `kluby_format.js` | zamiana odpowiedzi PZSS na listę nazw; slug jak w PractiScore i słownik dla konwertera |
| `dodajKluby.js` | content script: okienko, przycisk i wstawianie klubów do formularza |
| `uprawnienia.html`, `uprawnienia.js` | strona udzielania zgody na dostęp do `soz.pzss.org.pl` |
| `konwerter.html`, `konwerter.js` | konwerter CSV (ikona wtyczki na pasku narzędzi) |
| `csv.js` | odczyt i zapis CSV, zamiana slugów na nazwy klubów |
| `kluby_nazwy.js` | lista wbudowana (zapasowa) |
| `kluby_historyczne.js` | skróty klubów ze starszych list wtyczki (dla konwertera) |
| `jquery-3.6.3.min.js` | jQuery (licencja MIT) |
| `generuj_kluby_nazwy.js` | odświeża `kluby_nazwy.js` z rejestru PZSS |
| `kluby_format.test.js`, `csv.test.js` | testy |
| `buduj.sh` | testy, lint i budowa paczek |

## Budowanie

Wymagany Node.js 22+ oraz `zip`.

```bash
node generuj_kluby_nazwy.js   # opcjonalnie: odśwież listę wbudowaną przed wydaniem
./buduj.sh
```

Wynik:

- `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-firefox.zip`: Firefox (AMO)
- `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-chrome.zip`: Chrome Web Store (i ewentualnie Edge Add-ons)
- `dist/firefox`, `dist/chrome`: rozpakowane wersje do testów

Przed każdym wydaniem zwiększ `version` w `manifest.json`.

## Testowanie

- Testy jednostkowe: `node --test kluby_format.test.js csv.test.js`
- Firefox: `about:debugging#/runtime/this-firefox` → „Load Temporary Add-on…” → `manifest.json`
- Chrome / Edge: `chrome://extensions` / `edge://extensions` → Tryb dewelopera → „Załaduj rozpakowane” → `dist/chrome`

Potem otwórz edytor formularza zapisów na practiscore.com (wymaga zalogowania). Żeby sprawdzić scenariusz bez zgody, wyłącz dostęp do `soz.pzss.org.pl` w ustawieniach wtyczki i odśwież stronę.

## Pomysły

- Pole wyboru regionu: gdy region to PL, wybór klubu nie jest wymagany.

## Licencja

[MIT](LICENSE). Wtyczka jest niezależnym projektem i nie jest powiązana z PractiScore ani z Polskim Związkiem Strzelectwa Sportowego.
