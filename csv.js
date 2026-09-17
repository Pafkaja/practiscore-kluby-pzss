// Odczyt i zapis CSV dla konwertera (konwerter.js) oraz zamiana slugow klubow na nazwy.

// Parser RFC 4180: pola w cudzyslowach moga zawierac separator, "" i nowe linie.
// Separator (przecinek z PractiScore albo srednik po zapisie w Excelu) i koniec linii wykrywane z naglowka.
function parsuj_csv(tekst) {
    if (tekst.charCodeAt(0) === 0xFEFF) {
        tekst = tekst.slice(1);
    }
    const pierwsza_linia = tekst.split(/\r?\n/, 1)[0];
    const separator = (pierwsza_linia.split(";").length > pierwsza_linia.split(",").length) ? ";" : ",";
    const koniec_linii = /\r\n/.test(tekst) ? "\r\n" : "\n";

    const wiersze = [];
    let wiersz = [];
    let pole = "";
    let w_cudzyslowie = false;
    for (let i = 0; i < tekst.length; i++) {
        const znak = tekst[i];
        if (w_cudzyslowie) {
            if (znak === '"') {
                if (tekst[i + 1] === '"') {
                    pole += '"';
                    i++;
                } else {
                    w_cudzyslowie = false;
                }
            } else {
                pole += znak;
            }
        } else if (znak === '"') {
            w_cudzyslowie = true;
        } else if (znak === separator) {
            wiersz.push(pole);
            pole = "";
        } else if (znak === "\n" || znak === "\r") {
            if (znak === "\r" && tekst[i + 1] === "\n") {
                i++;
            }
            wiersz.push(pole);
            wiersze.push(wiersz);
            wiersz = [];
            pole = "";
        } else {
            pole += znak;
        }
    }
    if (pole !== "" || wiersz.length > 0) {
        wiersz.push(pole);
        wiersze.push(wiersz);
    }
    return { wiersze: wiersze, separator: separator, koniec_linii: koniec_linii };
}

// Zapis z BOM, zeby Excel od razu rozpoznal UTF-8 (polskie znaki).
function zapisz_csv(wiersze, separator, koniec_linii) {
    function pole(wartosc) {
        const tekst = wartosc === undefined || wartosc === null ? "" : String(wartosc);
        if (tekst.includes(separator) || /["\r\n]/.test(tekst) || tekst !== tekst.trim()) {
            return '"' + tekst.replace(/"/g, '""') + '"';
        }
        return tekst;
    }
    return "﻿" + wiersze.map(function (wiersz) {
        return wiersz.map(pole).join(separator);
    }).join(koniec_linii) + koniec_linii;
}

// Zamienia slugi w kolumnie (bez naglowka) na nazwy ze slownika. Nie modyfikuje wejscia.
// Zwraca nowe wiersze i zestawienie wartosci rozpoznanych / nierozpoznanych (od najczestszych).
function konwertuj_kolumne(wiersze, kolumna, slownik) {
    const rozpoznane = new Map();
    const nierozpoznane = new Map();
    const nowe = wiersze.map(function (wiersz, nr) {
        const kopia = wiersz.slice();
        const wartosc = wiersz[kolumna];
        if (nr === 0 || wartosc === undefined || wartosc.trim() === "") {
            return kopia;
        }
        const klucz = wartosc.trim();
        const nazwa = slownik.get(klucz);
        if (nazwa !== undefined) {
            kopia[kolumna] = nazwa;
            rozpoznane.set(klucz, (rozpoznane.get(klucz) || 0) + 1);
        } else {
            nierozpoznane.set(klucz, (nierozpoznane.get(klucz) || 0) + 1);
        }
        return kopia;
    });
    function zestawienie(mapa, z_nazwa) {
        return Array.from(mapa, function (para) {
            const pozycja = { wartosc: para[0] };
            if (z_nazwa) {
                pozycja.nazwa = slownik.get(para[0]);
            }
            pozycja.ile = para[1];
            return pozycja;
        }).sort(function (a, b) {
            return b.ile - a.ile || a.wartosc.localeCompare(b.wartosc, "pl");
        });
    }
    return {
        wiersze: nowe,
        rozpoznane: zestawienie(rozpoznane, true),
        nierozpoznane: zestawienie(nierozpoznane, false),
    };
}

// Indeks kolumny z najwieksza liczba wartosci rozpoznanych jako kluby albo -1.
function znajdz_kolumne_klubow(wiersze, slownik) {
    let najlepsza = -1;
    let najwiecej = 0;
    const naglowek = wiersze[0] || [];
    naglowek.forEach(function (_, kolumna) {
        let ile = 0;
        for (let nr = 1; nr < wiersze.length; nr++) {
            const wartosc = wiersze[nr][kolumna];
            if (wartosc !== undefined && slownik.has(wartosc.trim())) {
                ile++;
            }
        }
        if (ile > najwiecej) {
            najwiecej = ile;
            najlepsza = kolumna;
        }
    });
    return najlepsza;
}

if (typeof module !== "undefined") {
    module.exports = { parsuj_csv, zapisz_csv, konwertuj_kolumne, znajdz_kolumne_klubow };
}
