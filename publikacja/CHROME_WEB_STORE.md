# Publikacja w Chrome Web Store (i Microsoft Edge Add-ons)

Paczka: `web-ext-artifacts/practiscore_dodaj_kluby_pzss-<wersja>-chrome.zip` (buduje ją `./buduj.sh`).
Test przed wysyłką: `chrome://extensions` → Tryb dewelopera → „Załaduj rozpakowane” → katalog `dist/chrome`.

## Pierwsza publikacja, krok po kroku

1. Załóż konto dewelopera: https://chrome.google.com/webstore/devconsole (jednorazowo 5 USD).
   Uzupełnij adres e-mail kontaktowy i zweryfikuj go, bez tego nie da się wysłać wtyczki.
2. „Nowy element” → wgraj zip dla Chrome.
3. Zakładka **Informacje o produkcie**: teksty poniżej, grafiki z katalogu `publikacja/`.
4. Zakładka **Prywatność**: odpowiedzi poniżej.
5. Zakładka **Dystrybucja**: Publiczna, wszystkie regiony (albo tylko Polska), bezpłatna.
6. „Prześlij do sprawdzenia”. Przegląd trwa zwykle od kilku dni do tygodnia.

Kolejne wersje: zwiększ `version` w `manifest.json`, uruchom `./buduj.sh`, w konsoli dewelopera
„Pakiet” → „Prześlij nowy pakiet”.

---

## Informacje o produkcie

**Nazwa** (z manifestu): `PractiScore dodaj kluby PZSS`

**Podsumowanie** (z manifestu, max 132 znaki): `Dodaje listę klubów PZSS do pola dropdown w PractiScore`

**Kategoria:** Narzędzia (Tools)

**Język:** polski

**Opis** (zwykły tekst, sklep nie formatuje Markdown ani HTML):

```
Wtyczka dla organizatorów zawodów strzeleckich w Polsce, którzy prowadzą zapisy przez PractiScore. Jednym kliknięciem zamienia pole typu Drop Down w formularzu zapisów na listę wszystkich klubów licencjonowanych przez PZSS.

CO ROBI
• Po otwarciu edytora formularza na practiscore.com pobiera aktualną listę klubów z rejestru PZSS (soz.pzss.org.pl).
• Przy każdym polu typu Drop Down dodaje przycisk „Dodaj kluby PZSS”.
• Przycisk ustawia etykietę pola na „Klub PZSS”, dodaje podpowiedź dla zawodnika, oznacza pole jako wymagane i wstawia listę klubów w formacie „SKRÓT Miejscowość (Miasto)”.
• Gdy PZSS nie odpowiada, wtyczka używa listy wbudowanej i wyraźnie o tym informuje.

JAK UŻYWAĆ
1. Zainstaluj wtyczkę.
2. Zaloguj się na practiscore.com i otwórz edytor formularza zapisów swoich zawodów.
3. U góry strony pojawi się komunikat „Pobieram kluby z PZSS…”, a po chwili „Pobrano N klubów z PZSS”.
4. Dodaj do formularza pole typu Drop Down Field albo użyj istniejącego.
5. Kliknij przycisk „Dodaj kluby PZSS” przy tym polu.
6. Zapisz formularz w PractiScore.

DOSTĘP DO SOZ.PZSS.ORG.PL
Wtyczka pobiera listę klubów z serwera PZSS. Jeśli ograniczysz jej dostęp do tej strony, na formularzu pojawi się komunikat z przyciskiem „Zezwól”, który prowadzi do udzielenia zgody. Po zgodzie wrócisz do PractiScore, a lista klubów pobierze się automatycznie.
Dostęp można też włączyć ręcznie: chrome://extensions → Szczegóły przy wtyczce → Dostęp do witryn.
Bez dostępu wtyczka nadal działa, tylko z listą wbudowaną, która może być nieaktualna.

PRYWATNOŚĆ
Wtyczka nie zbiera ani nie wysyła żadnych danych. Tylko odczytuje publiczną listę klubów z rejestru PZSS. Działa wyłącznie na stronach practiscore.com.

Wtyczka jest niezależnym projektem i nie jest powiązana z PractiScore ani z Polskim Związkiem Strzelectwa Sportowego.
```

**Witryna:** `https://pafka.net`
**Adres URL pomocy:** `https://pafka.net` (albo adres e-mail kontaktowy)

### Grafiki

| Pole | Wymagane | Plik |
|---|---|---|
| Ikona sklepu 128×128 | tak | `PaFka_ikona.png` (z paczki) |
| Zrzuty ekranu 1280×800 (1–5) | min. 1 | `publikacja/zrzut_zgoda_1280x800.png` + **zrzuty z prawdziwego PractiScore do zrobienia** |
| Mały kafelek promocyjny 440×280 | tak | `publikacja/kafelek_440x280.png` |
| Kafelek marquee 1400×560 | nie | `publikacja/marquee_1400x560.png` |

Zrzuty z PractiScore (zrób sam, w oknie ustawionym na 1280×800 albo przytnij do tego rozmiaru):
1. Formularz z dużym okienkiem „Pobrano 500 klubów z PZSS”.
2. Pole Drop Down po kliknięciu „Dodaj kluby PZSS” z widoczną listą klubów.
3. Opcjonalnie: pomarańczowe okienko „Potrzebna zgoda…”.

Zasłoń na zrzutach dane osobowe zawodników i swoje dane konta.

---

## Prywatność (zakładka „Prywatność”)

**Jedyny cel (Single purpose):**

```
Wstawia aktualną listę klubów z rejestru Polskiego Związku Strzelectwa Sportowego (PZSS) do pola wyboru w edytorze formularza zapisów na practiscore.com.
```

**Uzasadnienie uprawnień do hosta (Host permission justification):**

```
Dostęp do https://soz.pzss.org.pl/* jest potrzebny, żeby pobrać publiczną listę klubów licencjonowanych przez PZSS (zapytanie POST do /Clubs/IndexDataAjax). Zapytanie jest wykonywane tylko po otwarciu edytora formularza zapisów na practiscore.com. Do PZSS nie są wysyłane żadne dane użytkownika. Content script działa tylko na *://*.practiscore.com/*, gdzie dodaje przycisk wstawiający listę klubów do pola Drop Down.
```

**Czy używasz kodu zewnętrznego (Remote code)?** Nie, nie używam kodu zewnętrznego.
(Wtyczka pobiera tylko dane JSON; cały kod, łącznie z jQuery, jest w paczce.)

**Wykorzystanie danych (Data usage):** nie zaznaczaj żadnej kategorii danych.
Zaznacz wszystkie trzy oświadczenia:
- nie sprzedaję ani nie przekazuję danych użytkowników stronom trzecim poza zatwierdzonymi przypadkami użycia,
- nie wykorzystuję ani nie przekazuję danych użytkowników w celach niezwiązanych z jedynym celem produktu,
- nie wykorzystuję ani nie przekazuję danych użytkowników do określania zdolności kredytowej ani udzielania pożyczek.

**Polityka prywatności (URL):** nie jest wymagana, gdy wtyczka nie zbiera danych. Jeśli chcesz ją podać,
opublikuj tekst z `publikacja/POLITYKA_PRYWATNOSCI.md` na pafka.net i wklej adres.

## Notatka dla recenzenta (Test instructions)

```
The extension only acts on the PractiScore registration form editor (requires a logged-in PractiScore account; page with a form id="customForm"). On that page the service worker fetches the public PZSS club register from soz.pzss.org.pl and a large notice shows the result. Clicking "Dodaj kluby PZSS" next to a Drop Down field inserts the club names as options. No user data is collected or transmitted.
```

---

## Microsoft Edge Add-ons (opcjonalnie, bezpłatnie)

https://partner.microsoft.com/dashboard/microsoftedge → „Utwórz nowe rozszerzenie” → ten sam zip dla Chrome.
Teksty, grafiki i odpowiedzi o prywatności takie same jak wyżej (Edge wymaga też polityki prywatności
tylko przy zbieraniu danych).
