# Publikacja w Firefox Add-ons (AMO)

Paczka: `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-firefox.zip` (buduje ją `./buduj.sh`).
Developer Hub: https://addons.mozilla.org/developers/addons → PractiScore dodaj kluby PZSS → Upload New Version.

- Platformy: Firefox (Android opcjonalnie; wymaga Firefoksa dla Androida 142+).
- „Do You Need to Submit Source Code?” → **No** (kod nie jest budowany ani minifikowany; jQuery 3.6.3 to oficjalny plik).

---

## Podsumowanie (Summary, max 250 znaków)

```
Dodaje do formularza zapisów na PractiScore pole wyboru z aktualną listą klubów PZSS. Lista jest pobierana na bieżąco z rejestru PZSS, a jednym kliknięciem wstawiasz ponad 500 klubów zamiast wpisywać je ręcznie.
```

## Opis (Description, Markdown)

```markdown
Wtyczka dla organizatorów zawodów strzeleckich w Polsce, którzy prowadzą zapisy przez **PractiScore**. Jednym kliknięciem zamienia pole typu Drop Down w formularzu zapisów na listę wszystkich klubów licencjonowanych przez PZSS.

**Co robi**

* Po otwarciu edytora formularza na practiscore.com pobiera aktualną listę klubów z rejestru PZSS (soz.pzss.org.pl).
* Przy każdym polu typu Drop Down dodaje przycisk **Dodaj kluby PZSS**.
* Przycisk ustawia etykietę pola na „Klub PZSS”, dodaje podpowiedź dla zawodnika, oznacza pole jako wymagane i wstawia listę klubów w formacie „SKRÓT Miejscowość (Miasto)”.
* Gdy PZSS nie odpowiada, wtyczka używa listy wbudowanej i wyraźnie o tym informuje.

**Jak używać**

1. Zainstaluj wtyczkę.
2. Zaloguj się na practiscore.com i otwórz edytor formularza zapisów swoich zawodów.
3. U góry strony pojawi się komunikat „Pobieram kluby z PZSS…”, a po chwili „Pobrano N klubów z PZSS”.
4. Dodaj do formularza pole typu **Drop Down Field** albo użyj istniejącego.
5. Kliknij przycisk **Dodaj kluby PZSS** przy tym polu.
6. Zapisz formularz w PractiScore.

**Zgoda na dostęp do soz.pzss.org.pl**

Wtyczka pobiera listę klubów z serwera PZSS i Firefox wymaga do tego Twojej zgody. Jeśli jej nie ma, na stronie formularza pojawi się komunikat z przyciskiem **Zezwól**. Kliknij go, a na otwartej karcie kliknij „Zezwól na dostęp do soz.pzss.org.pl” i zaakceptuj okno Firefoksa. Wrócisz do PractiScore, a lista klubów pobierze się automatycznie.

Zgodę możesz też włączyć ręcznie: wpisz `about:addons` w pasku adresu, wybierz wtyczkę, otwórz zakładkę **Uprawnienia**, włącz dostęp do soz.pzss.org.pl i odśwież stronę formularza.

Bez zgody wtyczka nadal działa, tylko z listą wbudowaną, która może być nieaktualna.

**Prywatność**

Wtyczka nie zbiera ani nie wysyła żadnych danych. Tylko odczytuje publiczną listę klubów z rejestru PZSS. Działa wyłącznie na stronach practiscore.com.

**Uwaga**

Wtyczka jest niezależnym projektem i nie jest powiązana z PractiScore ani z Polskim Związkiem Strzelectwa Sportowego.

Wtyczka jest dostępna także dla Chrome i Edge.
```

## Informacje o wersji (Version notes)

### 2.0.1

```
Wersja 2.0.1
- Ten sam kod działa teraz także w Chrome i Edge.
- Strona zgody pokazuje instrukcję dla używanej przeglądarki.
- W Firefoksie działanie bez zmian względem 2.0.
```

### 2.0

```
Wersja 2.0
- Lista klubów pobierana na bieżąco z rejestru PZSS po otwarciu formularza (wcześniej wpisana na stałe w wtyczkę).
- Nazwy klubów z miejscowością siedziby, bez duplikatów.
- Wyraźne komunikaty o pobieraniu listy i łatwe udzielenie zgody na dostęp do soz.pzss.org.pl.
- Zapasowa lista wbudowana, gdy PZSS nie odpowiada.
- Wymaga Firefoksa 140 lub nowszego.
```

## Notatka dla recenzenta (Notes to Reviewer)

```
The add-on only acts on the PractiScore registration form editor (requires a logged-in PractiScore account; page with a form id="customForm"). On that page the background script fetches the public PZSS club register from soz.pzss.org.pl (POST /Clubs/IndexDataAjax) and the content script inserts club names into a Drop Down field when the user clicks "Dodaj kluby PZSS".

If the host permission for soz.pzss.org.pl is not granted, the page shows a notice with a button that opens the bundled uprawnienia.html page, where permissions.request() is called on a user click.

No user data is collected or sent anywhere. The remaining innerHTML warning in dodajKluby.js inserts a static button; club names coming from the network are HTML-escaped (escapuj_html) before insertion. jQuery 3.6.3 is the unmodified official build.
```
