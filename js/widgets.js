var Widgets = function() {

    var initSliders = function() {

        $("[data-widget=slider]").each(function() {
            var $el = $(this),
                $target = $("#" + $el.data("target"));

            $el.slider({
                range: true,
                min: 0,
                max: 500,
                values: [ 75, 300 ],
                slide: function(event, ui) {
                    $target.val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                }
            });

            $target.val("$" + $el.slider("values", 0) +
                " - $" + $el.slider("values", 1));
        });

    };

    var initDatepickers = function() {

        $("input[data-widget=datepicker]").each(function() {
            $(this).datepicker({ minDate: 0 });
        });

    };

    var initAutocompletes = function() {

        // map strings to autocomplete datasources
        var sourceMap = {
            places: function(request, callback) {
                FlightsAPI.getAirportsByName(request.term, function(data) {
                    var list = _.pluck(data.airports, "description");
                    callback(list);
                });

            }
        };

        // initialize autocompletes (use data-source attribute to assign
        // source function)
        $("input[data-widget=autocomplete]").each(function() {
            var $el = $(this),
                source = sourceMap[$el.data("source")];

            $el.autocomplete({
                source: source,
                minLength: 3
            });
        });

    };

    var initWidgets = function() {

        initSliders();
        initDatepickers();
        initAutocompletes();

    };

    return {
        init: initWidgets
    };

}();
