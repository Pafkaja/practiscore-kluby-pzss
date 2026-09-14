$( document ).ready( function() {
    // szukamy czy na stronie jest <form id="customForm"
    const customForm = document.getElementById("customForm");
    if (customForm !== null) {
        pobierz_kluby();

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        var observer = new MutationObserver(function (mutations, observer) {
            // fired when a mutation occurs
            observer.disconnect();
            szukaj_formularza();
            observer.observe(document, {
                attributes: false, childList: true, subtree: true
            });
        });

        // define what element should be observed by the observer
        // and what types of mutations trigger the callback
        observer.observe(document, {
            attributes: false, childList: true, subtree: true
        });
    }
});


// Lista uzywana przez przycisk: do czasu pobrania z PZSS (albo gdy sie nie uda) - wbudowana.
let kluby_aktualne = kluby_nazwy;

// Po udzieleniu zgody na stronie uprawnienia.html wtyczka kaze pobrac kluby jeszcze raz.
browser.runtime.onMessage.addListener(function (wiadomosc) {
    if (wiadomosc && wiadomosc.typ === "uprawnieniaNadane") {
        pobierz_kluby();
    }
});

function pobierz_kluby() {
    pokaz_okienko("info", "Pobieram kluby z PZSS…", "Za chwilę lista klubów będzie gotowa.");
    browser.runtime.sendMessage({ typ: "pobierzKluby" }).then(function (wynik) {
        if (wynik && wynik.kluby) {
            kluby_aktualne = wynik.kluby;
            const okienko = pokaz_okienko("sukces", "Pobrano " + wynik.kluby.length + " klubów z PZSS",
                "Przycisk „Dodaj kluby PZSS” wstawi aktualną listę z rejestru PZSS.");
            setTimeout(function () { okienko.remove(); }, 10000);
        } else if (wynik && wynik.brakUprawnien) {
            pokaz_okienko("uwaga", "Potrzebna zgoda na pobieranie klubów z PZSS",
                "Wtyczka pobiera publiczną listę klubów z soz.pzss.org.pl i potrzebuje do tego Twojej zgody. " +
                "Bez niej użyje listy wbudowanej (" + kluby_nazwy.length + " klubów), która może być nieaktualna.",
                [
                    { tekst: "Zezwól", glowny: true, akcja: function () {
                        browser.runtime.sendMessage({ typ: "otworzUprawnienia" });
                    } },
                    { tekst: "Użyj listy wbudowanej", akcja: zamknij_okienko },
                ]);
        } else {
            nie_pobrano(wynik && wynik.blad ? wynik.blad : "brak odpowiedzi");
        }
    }, function (e) {
        nie_pobrano(String(e));
    });
}

function nie_pobrano(powod) {
    pokaz_okienko("blad", "Nie udało się pobrać klubów z PZSS",
        "Powód: " + powod + ". Używam listy wbudowanej (" + kluby_nazwy.length + " klubów), " +
        "która może być nieaktualna. Spróbuj odświeżyć stronę później.");
}

const KOLORY_OKIENKA = {
    info: "#337ab7",
    sukces: "#3c8d3c",
    uwaga: "#d9822b",
    blad: "#c9302c",
};
const ID_OKIENKA = "dodaj_kluby_pzss_okienko";

function zamknij_okienko() {
    const stare = document.getElementById(ID_OKIENKA);
    if (stare) {
        stare.remove();
    }
}

// Duze okienko u gory, na srodku ekranu. Zostaje, dopoki uzytkownik go nie zamknie
// (poza komunikatem o sukcesie, ktory znika po 10 s).
function pokaz_okienko(rodzaj, tytul, opis, przyciski) {
    zamknij_okienko();
    const kolor = KOLORY_OKIENKA[rodzaj];

    const okienko = document.createElement("div");
    okienko.id = ID_OKIENKA;
    okienko.setAttribute("role", "alert");
    okienko.style.cssText = "position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:2147483647;" +
        "width:min(560px, calc(100vw - 32px));box-sizing:border-box;padding:20px 48px 20px 24px;" +
        "background:#fff;color:#222;border:3px solid " + kolor + ";border-top-width:10px;border-radius:8px;" +
        "box-shadow:0 10px 40px rgba(0,0,0,.45);font:16px/1.45 system-ui,sans-serif;text-align:left;";

    const naglowek = document.createElement("div");
    naglowek.style.cssText = "font-size:20px;font-weight:700;margin-bottom:6px;color:" + kolor + ";";
    naglowek.textContent = tytul;
    okienko.appendChild(naglowek);

    const tresc = document.createElement("div");
    tresc.textContent = opis;
    okienko.appendChild(tresc);

    const zamknij = document.createElement("button");
    zamknij.type = "button";
    zamknij.title = "Zamknij";
    zamknij.textContent = "×";
    zamknij.style.cssText = "position:absolute;top:8px;right:10px;border:0;background:none;" +
        "font-size:28px;line-height:1;color:#666;cursor:pointer;padding:4px;";
    zamknij.addEventListener("click", zamknij_okienko);
    okienko.appendChild(zamknij);

    if (przyciski && przyciski.length) {
        const pasek = document.createElement("div");
        pasek.style.cssText = "margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;";
        przyciski.forEach(function (p) {
            const przycisk = document.createElement("button");
            przycisk.type = "button";
            przycisk.textContent = p.tekst;
            przycisk.style.cssText = "padding:10px 18px;font:600 16px system-ui,sans-serif;border-radius:6px;" +
                "cursor:pointer;border:2px solid " + kolor + ";" +
                (p.glowny ? "background:" + kolor + ";color:#fff;" : "background:#fff;color:" + kolor + ";");
            przycisk.addEventListener("click", p.akcja);
            pasek.appendChild(przycisk);
        });
        okienko.appendChild(pasek);
    }

    document.body.appendChild(okienko);
    return okienko;
}


function szukaj_formularza() {
    // console.log("znalazłem formularz");
    var dropdown_groups = $("small:contains('Drop Downer Field')").parent().parent();
    if (dropdown_groups.length === 0) {
        dropdown_groups = $("small:contains('Drop Down Field')").parent().parent();
    }
    if (dropdown_groups.length > 0) {
        // console.log("znalazłem grupy dropdown");

        dropdown_groups.each(function (idx, group) {
            // console.log(group)
            var jest_zatinstalowane = $(group).find("a[id^=dodaj_kluby_]");
            if ( jest_zatinstalowane.length>0) {
                // console.log("Wtyczka już działa");
                return;
            }
            var groupNumber = group.attributes.id.value.replace('group_', '');
            // console.log("groupNumber", groupNumber);
            const button_id = "dodaj_kluby_" + groupNumber;
            group.innerHTML = '<div className="pull-right"><a class="btn btn-xs btn-default" id="' + button_id + '" href="#dodajkluby">' +
                '<i className="fas fa-cog"></i> Dodaj kluby PZSS</a> </div>' + group.innerHTML;

            $("#" + button_id).click(function (event) {
                dodaj_kluby(group, groupNumber);
                return false;
            });
        });
    }

}


// Nazwy przychodza z PZSS, wiec przed wstawieniem do HTML trzeba je zabezpieczyc.
function escapuj_html(tekst) {
    return String(tekst).replace(/&/g, "&amp;").replace(/"/g, "&quot;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function dodaj_kluby( group, groupNumber ) {
    // console.log("DODAJ KLUBY", group, groupNumber);
    $(group).find("#required"+groupNumber).prop("checked",true);
    $(group).find("#label"+groupNumber).val("Klub PZSS")
    $(group).find("#helper_text"+groupNumber).val("Wybierz z listy klub PZSS, który reprezentujesz startując na tych zawodach")

    $(group).find("#properties_"+ groupNumber+" > div:nth-child(4)").empty();

    var new_html = "";
    var o = 0;
    kluby_aktualne.forEach( function(nazwa){
        // console.log("nazwa", nazwa);
        new_html = new_html + '<div class="optionEdit row"><div class="col-md-3"></div><div class="input-group col-xs-9 col-md-5">'+
                '<input readonly type="text" class="form-control" id="option_text_' + groupNumber + '_' + o + '" name="field[' + groupNumber + '][option][' + o + '][name]" required="required"'+
                'value="'+escapuj_html(nazwa)+'"/></div><div class="col-md-4"></div></div>';
        o++;
    });
    $(group).find("#properties_"+ groupNumber+" > div:nth-child(4)").append(new_html);
}
