const test = require("node:test");
const assert = require("node:assert");
const { formatuj_kluby } = require("./kluby_format.js");

test("formatuje jako 'Skrot (Miasto)' i sortuje po polsku", () => {
    const payload = {
        data: [
            { ShortName: "ŻUŁAWY Braniewo", City: "Braniewo" },
            { ShortName: "TARCZA Poznań", City: "Borówiec" },
            { ShortName: "ŚLĄSK Wrocław", City: "Wrocław" },
            { ShortName: "ARDEA Gdańsk", City: "Gdańsk" },
        ],
    };
    assert.deepStrictEqual(formatuj_kluby(payload), [
        "ARDEA Gdańsk (Gdańsk)",
        "ŚLĄSK Wrocław (Wrocław)",
        "TARCZA Poznań (Borówiec)",
        "ŻUŁAWY Braniewo (Braniewo)",
    ]);
});

test("usuwa duble i bialy znak", () => {
    const payload = {
        data: [
            { ShortName: "BUNKIER Zduńska Wola", City: "Zduńska Wola" },
            { ShortName: " BUNKIER Zduńska Wola ", City: "Zduńska Wola " },
        ],
    };
    assert.deepStrictEqual(formatuj_kluby(payload), ["BUNKIER Zduńska Wola (Zduńska Wola)"]);
});

test("bez miasta sam skrot, bez skrotu pomija", () => {
    const payload = {
        data: [
            { ShortName: "KS Gdańsk", City: null },
            { ShortName: "", City: "Kraków" },
            { City: "Kraków" },
        ],
    };
    assert.deepStrictEqual(formatuj_kluby(payload), ["KS Gdańsk"]);
});

test("zla odpowiedz daje pusta liste", () => {
    assert.deepStrictEqual(formatuj_kluby(null), []);
    assert.deepStrictEqual(formatuj_kluby({}), []);
    assert.deepStrictEqual(formatuj_kluby({ data: "x" }), []);
});

const { slug_practiscore, skrot_z_nazwy, zbuduj_slownik } = require("./kluby_format.js");

test("slug jak w PractiScore (wartosci z prawdziwego eksportu CSV)", () => {
    const przypadki = {
        "ARDEA Gdańsk": "ardea-gdansk",
        "ZIEMIA CHEŁMIŃSKA Toruń": "ziemia-chelminska-torun",
        "KS Kołobrzeg": "ks-kolobrzeg",
        "FLOTA Elbląg": "flota-elblag",
        "STRZELCY Bytów": "strzelcy-bytow",
        "10 Olsztyn": "10-olsztyn",
        "CZ5 Gdańsk": "cz5-gdansk",
        "Mojego klubu nie ma na liście": "mojego-klubu-nie-ma-na-liscie",
        "Option 1": "option-1",
        "ŻÓŁW Źródła": "zolw-zrodla",
        "7,62 Trzcianka": "762-trzcianka",
        "KALIBER.22 Czaplinek": "kaliber22-czaplinek",
        "10-KA Sulmierzyce (Sulmierzyce)": "10-ka-sulmierzyce-sulmierzyce",
        "  GROM  -  Sławno ": "grom-slawno",
    };
    for (const [nazwa, slug] of Object.entries(przypadki)) {
        assert.strictEqual(slug_practiscore(nazwa), slug, nazwa);
    }
});

test("skrot z nazwy 'Skrot (Miasto)'", () => {
    assert.strictEqual(skrot_z_nazwy("ARDEA Gdańsk (Gdańsk)"), "ARDEA Gdańsk");
    assert.strictEqual(skrot_z_nazwy("AZS Częstochowa (nie) (Częstochowa)"), "AZS Częstochowa (nie)");
    assert.strictEqual(skrot_z_nazwy("KS Gdańsk"), "KS Gdańsk");
});

test("slownik: slugi skrotu i pelnej nazwy, pierwsze zrodlo wygrywa", () => {
    const slownik = zbuduj_slownik(
        ["ARDEA Gdańsk (Gdańsk)", "TARCZA Poznań (Borówiec)"],
        ["ARDEA Gdańsk (Gdańsk)", "STARY Klub (Stare)"],
        ["CZ5 Gdańsk", "Tarcza Poznań"],
    );
    assert.strictEqual(slownik.get("ardea-gdansk"), "ARDEA Gdańsk");
    assert.strictEqual(slownik.get("ardea-gdansk-gdansk"), "ARDEA Gdańsk");
    assert.strictEqual(slownik.get("tarcza-poznan-borowiec"), "TARCZA Poznań");
    assert.strictEqual(slownik.get("tarcza-poznan"), "TARCZA Poznań");
    assert.strictEqual(slownik.get("stary-klub"), "STARY Klub");
    assert.strictEqual(slownik.get("cz5-gdansk"), "CZ5 Gdańsk");
    assert.strictEqual(slownik.get("mojego-klubu-nie-ma-na-liscie"), undefined);
});
