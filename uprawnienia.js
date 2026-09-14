// Strona zgody otwierana z okienka na PractiScore (background.js, typ "otworzUprawnienia").
// permissions.request() dziala tylko tu, bezposrednio po kliknieciu uzytkownika.

const UPRAWNIENIE_PZSS = { origins: ["https://soz.pzss.org.pl/*"] };
const karta_practiscore = parseInt(new URLSearchParams(location.search).get("karta"), 10);

async function wroc_do_practiscore() {
    document.getElementById("zezwol").hidden = true;
    document.getElementById("odmowa").hidden = true;
    document.getElementById("sukces").hidden = false;
    if (Number.isInteger(karta_practiscore)) {
        try {
            await browser.tabs.sendMessage(karta_practiscore, { typ: "uprawnieniaNadane" });
            await browser.tabs.update(karta_practiscore, { active: true });
        } catch (e) {
            // karta PractiScore zamknieta albo przeladowana - zostajemy tutaj
            document.getElementById("sukces").textContent =
                "Gotowe. Odśwież stronę formularza na PractiScore, żeby pobrać kluby.";
            return;
        }
    }
    const ta_karta = await browser.tabs.getCurrent();
    browser.tabs.remove(ta_karta.id);
}

document.getElementById("zezwol").addEventListener("click", function () {
    // Bez await przed request(), inaczej Firefox uzna, ze to nie jest reakcja na klikniecie.
    browser.permissions.request(UPRAWNIENIE_PZSS).then(function (nadane) {
        if (nadane) {
            wroc_do_practiscore();
        } else {
            document.getElementById("odmowa").hidden = false;
        }
    });
});
