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
                    var list = _.first(_.pluck(data.airports, "description"), 10);
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

    var initSelectDatepickers = function () {

        $("input[data-widget=datepicker-select]").each(function() {
            
            var $el = $(this);
            
            var content = '<label for="birth-day" class="select-label">Day</label> <select name="birth-day">';
            for (var i = 1; i <= 31; i++) { 
                content += '<option value=' + i + '>' + i + '</option>'; 
            }; 
            content += '</select>';

            content += '<label for="birth-month" class="select-label">Month</label> <select name="birth-month">';
            for (var i = 1; i <= 12; i++) { 
                content += '<option value=' + i + '>' + i + '</option>'; 
            }; 
            content += '</select>';

            content += '<label for="birth-year" class="select-label">Year</label> <select name="birth-year">';
            for (var i = new Date().getFullYear(); i >= 1900; i--) { 
                content += '<option value=' + i + '>' + i + '</option>'; 
            }; 
            content += '</select>';

            $el.after(content).hide();

            $("select[name|=birth]").each(function(select) {
                $(this).change(function() {
                    var inputContent =  $("select[name=birth-day]").val() + "/" + $("select[name=birth-month]").val() + "/" + $("select[name=birth-year]").val();
                    $("input[name=birth-date]").val(inputContent);
                });
            }).first().trigger("change");


        });
    }

    var initButtonSets = function() {

        $("[data-widget=buttonset]").each(function() {
            $(this).buttonset();
        });
        
    };

    var initWidgets = function() {

        initSliders();
        initDatepickers();
        initAutocompletes();
        initSelectDatepickers();
        initButtonSets();

    };

    return {
        init: initWidgets
    };

}();
