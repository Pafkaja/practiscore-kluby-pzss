// Zamienia odpowiedz PZSS (soz.pzss.org.pl/Clubs/IndexDataAjax) na posortowana
// liste nazw "Skrot (Miasto)" bez dubli. Uzywane przez background.js i generuj_kluby_nazwy.js.
function formatuj_kluby(payload) {
    const wiersze = payload && Array.isArray(payload.data) ? payload.data : [];
    const nazwy = new Set();
    wiersze.forEach(function (wiersz) {
        const skrot = (wiersz.ShortName || "").trim();
        if (!skrot) {
            return;
        }
        const miasto = (wiersz.City || "").trim();
        nazwy.add(miasto ? skrot + " (" + miasto + ")" : skrot);
    });
    return Array.from(nazwy).sort(function (a, b) {
        return a.localeCompare(b, "pl");
    });
}

// --- Funkcje dla konwertera CSV (konwerter.js) ---

const POLSKIE_LITERY = { "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "z", "ż": "z" };

// Wartosc opcji, ktora PractiScore sam tworzy z nazwy opcji pola Drop Down i zapisuje w eksporcie CSV
// ("ARDEA Gdańsk" -> "ardea-gdansk"): male litery, bez ogonkow, bez znakow innych niz litery i cyfry,
// odstepy i myslniki zamienione na pojedynczy myslnik.
function slug_practiscore(tekst) {
    return String(tekst).toLowerCase()
        .replace(/[ąćęłńóśźż]/g, function (litera) { return POLSKIE_LITERY[litera]; })
        .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

// "ARDEA Gdańsk (Gdańsk)" -> "ARDEA Gdańsk" (odcina tylko ostatni nawias, czyli miasto).
function skrot_z_nazwy(nazwa) {
    return nazwa.replace(/\s*\([^()]*\)$/, "");
}

// Slownik slug -> skrot klubu dla konwertera CSV. Formularze z wersji 1.0 wtyczki maja opcje
// "Skrot", od wersji 2.0 "Skrot (Miasto)", wiec kazdy klub trafia pod oba slugi.
// Kolejnosc zrodel = pierwszenstwo: aktualny rejestr, lista wbudowana, historyczne skroty.
function zbuduj_slownik(aktualne, wbudowane, historyczne) {
    const slownik = new Map();
    function dodaj(slug, skrot) {
        if (slug && !slownik.has(slug)) {
            slownik.set(slug, skrot);
        }
    }
    [aktualne, wbudowane].forEach(function (lista) {
        (lista || []).forEach(function (nazwa) {
            const skrot = skrot_z_nazwy(nazwa);
            dodaj(slug_practiscore(nazwa), skrot);
            dodaj(slug_practiscore(skrot), skrot);
        });
    });
    (historyczne || []).forEach(function (skrot) {
        dodaj(slug_practiscore(skrot), skrot);
    });
    return slownik;
}

if (typeof module !== "undefined") {
    module.exports = { formatuj_kluby, slug_practiscore, skrot_z_nazwy, zbuduj_slownik };
}
