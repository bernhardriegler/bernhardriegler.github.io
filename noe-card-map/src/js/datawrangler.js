(function() {
    window.noeCardPois = [];
    $.getJSON("map-src/noe-card-data.json")
        .done(function(dataClustered, textStatus) {
            console.log(textStatus);
            $.each(dataClustered, function (index) {
                // todo find 4 missing pois ... 324 expected 320 returned
                $.each(dataClustered[index].pois, function (jndex) {
                    noeCardPois.push(dataClustered[index].pois[jndex]);
                });
            });
            console.log(noeCardPois.length);
        })
        .fail(function(jqxhr, settings, exception) {
            console.log(exception);
        });

})();
