// Strona zgody otwierana z okienka na PractiScore (background.js, typ "otworzUprawnienia").
// permissions.request() dziala tylko tu, bezposrednio po kliknieciu uzytkownika.

const api = globalThis.browser || globalThis.chrome;
const UPRAWNIENIE_PZSS = { origins: ["https://soz.pzss.org.pl/*"] };
// Instrukcja recznego wlaczenia zalezy od przegladarki (Chrome nie ma obiektu browser).
if (typeof globalThis.browser === "undefined") {
    document.getElementById("instrukcja_firefox").hidden = true;
    document.getElementById("instrukcja_chrome").hidden = false;
}

const karta_practiscore = parseInt(new URLSearchParams(location.search).get("karta"), 10);

async function wroc_do_practiscore() {
    document.getElementById("zezwol").hidden = true;
    document.getElementById("odmowa").hidden = true;
    document.getElementById("sukces").hidden = false;
    if (Number.isInteger(karta_practiscore)) {
        try {
            await api.tabs.sendMessage(karta_practiscore, { typ: "uprawnieniaNadane" });
            await api.tabs.update(karta_practiscore, { active: true });
        } catch (e) {
            // karta PractiScore zamknieta albo przeladowana - zostajemy tutaj
            document.getElementById("sukces").textContent =
                "Gotowe. Odśwież stronę formularza na PractiScore, żeby pobrać kluby.";
            return;
        }
    }
    const ta_karta = await api.tabs.getCurrent();
    api.tabs.remove(ta_karta.id);
}

document.getElementById("zezwol").addEventListener("click", function () {
    // Bez await przed request(), inaczej przegladarka uzna, ze to nie jest reakcja na klikniecie.
    api.permissions.request(UPRAWNIENIE_PZSS).then(function (nadane) {
        if (nadane) {
            wroc_do_practiscore();
        } else {
            document.getElementById("odmowa").hidden = false;
        }
    });
});
