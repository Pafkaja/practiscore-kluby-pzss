// Strona konwertera CSV (otwierana ikona wtyczki na pasku narzedzi, background.js).
// Zamienia slugi klubow z eksportu PractiScore ("ardea-gdansk") na nazwy ("ARDEA Gdańsk").

const api = globalThis.browser || globalThis.chrome;
const UPRAWNIENIE_PZSS = { origins: ["https://soz.pzss.org.pl/*"] };

// Do czasu pobrania rejestru PZSS (albo gdy sie nie uda) - lista wbudowana i historyczna.
let slownik = zbuduj_slownik([], kluby_nazwy, kluby_historyczne);
let wczytany = null;   // { nazwa, wiersze, separator, koniec_linii }
let wynik = null;      // wynik konwertuj_kolumne dla wybranej kolumny

const el = function (id) { return document.getElementById(id); };

function pokaz_status(rodzaj, tekst, przycisk) {
    const status = el("status");
    status.className = "status " + rodzaj;
    status.textContent = tekst;
    if (przycisk) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = przycisk.tekst;
        b.addEventListener("click", przycisk.akcja);
        status.appendChild(document.createElement("br"));
        status.appendChild(b);
    }
}

const ZAPASOWA = "Rozpoznaję kluby z listy wbudowanej (" + kluby_nazwy.length +
    ") i z nazw używanych w starszych wersjach wtyczki.";

function wczytaj_liste_klubow() {
    pokaz_status("info", "Pobieram listę klubów z PZSS…");
    api.runtime.sendMessage({ typ: "pobierzKluby" }).then(function (odp) {
        if (odp && odp.kluby) {
            slownik = zbuduj_slownik(odp.kluby, kluby_nazwy, kluby_historyczne);
            pokaz_status("sukces", "Lista klubów pobrana z PZSS (" + odp.kluby.length + " klubów), " +
                "uzupełniona o nazwy używane w starszych wersjach wtyczki.");
        } else if (odp && odp.brakUprawnien) {
            pokaz_status("uwaga", "Brak zgody na pobieranie aktualnej listy klubów z soz.pzss.org.pl. " + ZAPASOWA,
                { tekst: "Zezwól na dostęp do soz.pzss.org.pl", akcja: popros_o_zgode });
        } else {
            pokaz_status("blad", "Nie udało się pobrać listy klubów z PZSS (" +
                (odp && odp.blad ? odp.blad : "brak odpowiedzi") + "). " + ZAPASOWA);
        }
        przelicz();
    }, function (e) {
        pokaz_status("blad", "Nie udało się pobrać listy klubów z PZSS (" + e + "). " + ZAPASOWA);
    });
}

function popros_o_zgode() {
    // Bez await przed request(), inaczej przegladarka uzna, ze to nie jest reakcja na klikniecie.
    api.permissions.request(UPRAWNIENIE_PZSS).then(function (nadane) {
        if (nadane) {
            wczytaj_liste_klubow();
        }
    });
}

function wczytaj_plik(plik) {
    if (!plik) {
        return;
    }
    plik.text().then(function (tekst) {
        const dane = parsuj_csv(tekst);
        if (dane.wiersze.length < 2) {
            pokaz_status("blad", "Plik „" + plik.name + "” nie zawiera danych zawodników.");
            return;
        }
        wczytany = Object.assign({ nazwa: plik.name }, dane);
        el("nazwa_pliku").textContent = plik.name;
        el("liczba_wierszy").textContent = (dane.wiersze.length - 1) + " zawodników";

        const lista = el("kolumna");
        lista.replaceChildren();
        dane.wiersze[0].forEach(function (naglowek, nr) {
            lista.add(new Option(naglowek || "(kolumna " + (nr + 1) + ")", String(nr)));
        });
        let kolumna = znajdz_kolumne_klubow(dane.wiersze, slownik);
        if (kolumna < 0) {
            kolumna = dane.wiersze[0].indexOf("Klub PZSS");
        }
        lista.value = String(Math.max(kolumna, 0));

        el("wynik").hidden = false;
        przelicz();
        el("wynik").scrollIntoView({ behavior: "smooth" });
    });
}

function wiersz_tabeli(komorki) {
    const tr = document.createElement("tr");
    komorki.forEach(function (k) {
        const td = document.createElement("td");
        td.textContent = k.tekst;
        if (k.klasa) {
            td.className = k.klasa;
        }
        tr.appendChild(td);
    });
    return tr;
}

function przelicz() {
    if (!wczytany) {
        return;
    }
    wynik = konwertuj_kolumne(wczytany.wiersze, Number(el("kolumna").value), slownik);
    const suma = function (lista) { return lista.reduce(function (s, p) { return s + p.ile; }, 0); };
    const ile_rozpoznanych = suma(wynik.rozpoznane);
    const ile_wypelnionych = ile_rozpoznanych + suma(wynik.nierozpoznane);

    el("podsumowanie").textContent = ile_wypelnionych === 0
        ? "Wybrana kolumna jest pusta."
        : "Rozpoznano klub u " + ile_rozpoznanych + " z " + ile_wypelnionych + " zawodników.";
    el("podsumowanie").style.color = ile_rozpoznanych === 0 ? "var(--blad)" : "";

    el("tabela_rozpoznane").replaceChildren.apply(el("tabela_rozpoznane"), wynik.rozpoznane.map(function (p) {
        return wiersz_tabeli([{ tekst: p.wartosc, klasa: "slug" }, { tekst: p.nazwa }, { tekst: String(p.ile), klasa: "ile" }]);
    }));
    el("tabela_nierozpoznane").replaceChildren.apply(el("tabela_nierozpoznane"), wynik.nierozpoznane.map(function (p) {
        return wiersz_tabeli([{ tekst: p.wartosc, klasa: "slug" }, { tekst: String(p.ile), klasa: "ile" }]);
    }));
    el("blok_rozpoznane").hidden = wynik.rozpoznane.length === 0;
    el("blok_nierozpoznane").hidden = wynik.nierozpoznane.length === 0;
    el("pobierz").disabled = ile_rozpoznanych === 0;
}

function pobierz() {
    const tekst = zapisz_csv(wynik.wiersze, wczytany.separator, wczytany.koniec_linii);
    const adres = URL.createObjectURL(new Blob([tekst], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = adres;
    link.download = wczytany.nazwa.replace(/\.csv$/i, "") + "-kluby.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(adres); }, 60000);
}

el("plik").addEventListener("change", function () {
    wczytaj_plik(this.files[0]);
    this.value = "";
});
el("kolumna").addEventListener("change", przelicz);
el("pobierz").addEventListener("click", pobierz);

const upusc = el("upusc");
["dragenter", "dragover"].forEach(function (zdarzenie) {
    upusc.addEventListener(zdarzenie, function (e) {
        e.preventDefault();
        upusc.classList.add("nad");
    });
});
["dragleave", "drop"].forEach(function (zdarzenie) {
    upusc.addEventListener(zdarzenie, function () { upusc.classList.remove("nad"); });
});
upusc.addEventListener("drop", function (e) {
    e.preventDefault();
    wczytaj_plik(e.dataTransfer.files[0]);
});
// Plik upuszczony obok pola nie powinien otwierac sie w karcie.
window.addEventListener("dragover", function (e) { e.preventDefault(); });
window.addEventListener("drop", function (e) { e.preventDefault(); });

wczytaj_liste_klubow();
