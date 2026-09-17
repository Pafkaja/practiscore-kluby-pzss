const test = require("node:test");
const assert = require("node:assert");
const { parsuj_csv, zapisz_csv, konwertuj_kolumne, znajdz_kolumne_klubow } = require("./csv.js");

test("parsuje cudzyslowy, przecinki, nowe linie i BOM", () => {
    const tekst = '﻿"First Name",Email,"Klub PZSS"\r\n"Jan ""Kowal""",a@b.pl,ardea-gdansk\r\n"Anna, Maria","x\ny",ksi-gdynia\r\n';
    const wynik = parsuj_csv(tekst);
    assert.strictEqual(wynik.separator, ",");
    assert.strictEqual(wynik.koniec_linii, "\r\n");
    assert.deepStrictEqual(wynik.wiersze, [
        ["First Name", "Email", "Klub PZSS"],
        ['Jan "Kowal"', "a@b.pl", "ardea-gdansk"],
        ["Anna, Maria", "x\ny", "ksi-gdynia"],
    ]);
});

test("wykrywa srednik (CSV zapisany przez Excel) i brak konca linii na koncu", () => {
    const wynik = parsuj_csv("a;b\n1;ardea-gdansk");
    assert.strictEqual(wynik.separator, ";");
    assert.strictEqual(wynik.koniec_linii, "\n");
    assert.deepStrictEqual(wynik.wiersze, [["a", "b"], ["1", "ardea-gdansk"]]);
});

test("zapis: BOM, cudzyslowy tylko gdy trzeba, parsowanie w obie strony", () => {
    const wiersze = [["First Name", "Klub PZSS"], ['Jan "Kowal"', "ARDEA Gdańsk"], ["Anna, Maria", "x\ny"], ["", " spacja"]];
    const tekst = zapisz_csv(wiersze, ",", "\r\n");
    assert.ok(tekst.startsWith("﻿"));
    assert.strictEqual(tekst, '﻿First Name,Klub PZSS\r\n"Jan ""Kowal""",ARDEA Gdańsk\r\n"Anna, Maria","x\ny"\r\n," spacja"\r\n');
    assert.deepStrictEqual(parsuj_csv(tekst).wiersze, wiersze);
});

test("konwersja kolumny: rozpoznane zamienione, reszta bez zmian, statystyki", () => {
    const slownik = new Map([["ardea-gdansk", "ARDEA Gdańsk"], ["ksi-gdynia", "KSI Gdynia"]]);
    const wiersze = [
        ["Imie", "Klub PZSS"],
        ["A", "ardea-gdansk"],
        ["B", "ardea-gdansk"],
        ["C", "mojego-klubu-nie-ma-na-liscie"],
        ["D", ""],
        ["E"],
    ];
    const wynik = konwertuj_kolumne(wiersze, 1, slownik);
    assert.deepStrictEqual(wynik.wiersze.map(w => w[1]),
        ["Klub PZSS", "ARDEA Gdańsk", "ARDEA Gdańsk", "mojego-klubu-nie-ma-na-liscie", "", undefined]);
    assert.deepStrictEqual(wynik.rozpoznane, [{ wartosc: "ardea-gdansk", nazwa: "ARDEA Gdańsk", ile: 2 }]);
    assert.deepStrictEqual(wynik.nierozpoznane, [{ wartosc: "mojego-klubu-nie-ma-na-liscie", ile: 1 }]);
    assert.strictEqual(wiersze[1][1], "ardea-gdansk", "wejscie nie jest modyfikowane");
});

test("wybiera kolumne z najwieksza liczba rozpoznanych klubow", () => {
    const slownik = new Map([["ardea-gdansk", "ARDEA Gdańsk"], ["option-1", "X"]]);
    const wiersze = [["Division", "Klub PZSS", "Inne"], ["option-1", "ardea-gdansk", "a"], ["b", "ardea-gdansk", "b"]];
    assert.strictEqual(znajdz_kolumne_klubow(wiersze, slownik), 1);
    assert.strictEqual(znajdz_kolumne_klubow([["a"], ["b"]], slownik), -1);
});
