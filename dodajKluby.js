$( document ).ready( function() {
    // szukamy czy na stronie jest <form id="customForm"
    const customForm = document.getElementById("customForm");
    if (customForm !== null) {

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


function dodaj_kluby( group, groupNumber ) {
    // console.log("DODAJ KLUBY", group, groupNumber);
    $(group).find("#required"+groupNumber).prop("checked",true);
    $(group).find("#label"+groupNumber).val("Klub PZSS")
    $(group).find("#helper_text"+groupNumber).val("Wybierz z listy klub PZSS, który reprezentujesz startując na tych zawodach")

    $(group).find("#properties_"+ groupNumber+" > div:nth-child(4)").empty();

    var new_html = "";
    var o = 0;
    kluby_nazwy.forEach( function(nazwa){
        // console.log("nazwa", nazwa);
        new_html = new_html + '<div class="optionEdit row"><div class="col-md-3"></div><div class="input-group col-xs-9 col-md-5">'+
                '<input readonly type="text" class="form-control" id="option_text_' + groupNumber + '_' + o + '" name="field[' + groupNumber + '][option][' + o + '][name]" required="required"'+
                'value="'+nazwa+'"/></div><div class="col-md-4"></div></div>';
        o++;
    });
    $(group).find("#properties_"+ groupNumber+" > div:nth-child(4)").append(new_html);
}
