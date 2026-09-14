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
