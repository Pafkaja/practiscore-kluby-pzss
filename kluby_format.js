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

if (typeof module !== "undefined") {
    module.exports = { formatuj_kluby };
}
