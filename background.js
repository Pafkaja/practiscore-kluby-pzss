// Pobiera liste klubow z rejestru PZSS na prosbe content scriptu (dodajKluby.js).
// Zapytanie idzie stad, a nie ze strony PractiScore, bo content script podlega CORS.
// Firefox laduje ten plik jako background.scripts (razem z kluby_format.js),
// Chrome jako service worker - wtedy kluby_format.js dociagamy przez importScripts.

if (typeof importScripts === "function") {
    importScripts("kluby_format.js");
}

const api = globalThis.browser || globalThis.chrome;

const KLUBY_DATA_URL = "https://soz.pzss.org.pl/Clubs/IndexDataAjax";
const UPRAWNIENIE_PZSS = "https://soz.pzss.org.pl/*";
const LIMIT_CZASU_MS = 30000;

// Parametry DataTables server-side (jak w zawodyxyz/zawodnik/pzss_kluby.py).
function parametry_datatables() {
    const dane = new URLSearchParams({
        "draw": "1", "start": "0", "length": "20000",
        "search[value]": "", "search[regex]": "false",
        "order[0][column]": "0", "order[0][dir]": "asc",
        "name": "", "address": "", "voivoidship": "", "alsoDeleted": "false",
    });
    for (let i = 0; i < 8; i++) {
        dane.append("columns[" + i + "][data]", String(i));
        dane.append("columns[" + i + "][searchable]", "true");
        dane.append("columns[" + i + "][orderable]", "true");
        dane.append("columns[" + i + "][search][value]", "");
        dane.append("columns[" + i + "][search][regex]", "false");
    }
    return dane;
}

async function pobierz_kluby_z_pzss() {
    const przerwij = new AbortController();
    const zegar = setTimeout(function () { przerwij.abort(); }, LIMIT_CZASU_MS);
    try {
        const odpowiedz = await fetch(KLUBY_DATA_URL, {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            body: parametry_datatables(),
            signal: przerwij.signal,
        });
        if (!odpowiedz.ok) {
            throw new Error("PZSS zwrócił HTTP " + odpowiedz.status);
        }
        const kluby = formatuj_kluby(await odpowiedz.json());
        if (kluby.length === 0) {
            throw new Error("PZSS zwrócił pustą listę klubów");
        }
        return { kluby: kluby };
    } catch (e) {
        const opis = e.name === "AbortError" ? "PZSS nie odpowiedział w czasie" : String(e.message || e);
        return { blad: opis };
    } finally {
        clearTimeout(zegar);
    }
}

async function pobierz_kluby_jesli_wolno() {
    const wolno = await api.permissions.contains({ origins: [UPRAWNIENIE_PZSS] });
    if (!wolno) {
        return { brakUprawnien: true };
    }
    return pobierz_kluby_z_pzss();
}

// Odpowiedz przez sendResponse + return true (Chrome nie obsluguje zwracania Promise z listenera).
api.runtime.onMessage.addListener(function (wiadomosc, nadawca, sendResponse) {
    if (!wiadomosc) {
        return;
    }
    if (wiadomosc.typ === "pobierzKluby") {
        pobierz_kluby_jesli_wolno().then(sendResponse, function (e) {
            sendResponse({ blad: String(e.message || e) });
        });
        return true;
    }
    if (wiadomosc.typ === "otworzUprawnienia" && nadawca.tab) {
        // Zgode mozna wywolac tylko ze strony wtyczki, wiec otwieramy ja w nowej karcie.
        // Id karty PractiScore w adresie, zeby po zgodzie do niej wrocic.
        api.tabs.create({
            url: api.runtime.getURL("uprawnienia.html") + "?karta=" + nadawca.tab.id,
            index: nadawca.tab.index + 1,
        });
    }
});
