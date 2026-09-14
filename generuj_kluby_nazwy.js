// Odswieza wbudowana (zapasowa) liste klubow kluby_nazwy.js z rejestru PZSS.
// Uruchom przed wydaniem nowej wersji: node generuj_kluby_nazwy.js
const fs = require("node:fs");
const path = require("node:path");
const { formatuj_kluby } = require("./kluby_format.js");

async function main() {
    const dane = new URLSearchParams({ draw: "1", start: "0", length: "20000" });
    const odpowiedz = await fetch("https://soz.pzss.org.pl/Clubs/IndexDataAjax", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        body: dane,
    });
    if (!odpowiedz.ok) {
        throw new Error("PZSS zwrócił HTTP " + odpowiedz.status);
    }
    const kluby = formatuj_kluby(await odpowiedz.json());
    if (kluby.length === 0) {
        throw new Error("PZSS zwrócił pustą listę klubów");
    }
    const tresc = "const kluby_nazwy=" + JSON.stringify(kluby, null, 4) + ";\n";
    fs.writeFileSync(path.join(__dirname, "kluby_nazwy.js"), tresc, "utf-8");
    console.log("Zapisano " + kluby.length + " klubów do kluby_nazwy.js");
}

main().catch(function (e) {
    console.error(e.message || e);
    process.exit(1);
});
