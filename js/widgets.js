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
            var options = { minDate: 0 };

            var altField = $(this).data("bind");
            if (typeof altField !== "undefined") {
                options.altField = "#" + altField;
                options.altFormat = "yy-mm-dd";
            }

            $(this).datepicker(options);
        });

    };

    var initAutocompletes = function() {

        // map strings to autocomplete datasources
        var sourceMap = {
            places: function(request, callback) {
                API.Geo.getAirportsByName({ name: request.term }, function(data) {
                    var list = _.first(_.map(data.airports, function(airport) {
                        return { _value: airport.airportId, label: airport.description };
                    }), 10);
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
                minLength: 3,
                select: function(e, ui) {
                    var bind = $el.data("bind");
                    if (typeof bind !== "undefined") {
                        $("#" + bind).val(ui.item._value);
                    }
                }
            });
        });

    };

    var initSelectDatepickers = function () {

        $("input[data-widget=datepicker-select]").each(function() {
            
            var $el = $(this);
            
            var content = '<label for="birth-day" class="select-label">Day</label> <select name="birth-day">';
            for (var i = 1; i <= 31; i++) {
                content += '<option value=' + i + '>' + i + '</option>'; 
            }
            content += '</select>';

            content += '<label for="birth-month" class="select-label">Month</label> <select name="birth-month">';
            for (i = 1; i <= 12; i++) {
                content += '<option value=' + i + '>' + i + '</option>'; 
            }
            content += '</select>';

            content += '<label for="birth-year" class="select-label">Year</label> <select name="birth-year">';
            for (i = new Date().getFullYear(); i >= 1900; i--) {
                content += '<option value=' + i + '>' + i + '</option>'; 
            }
            content += '</select>';

            $el.after(content).hide();

            $("select[name|=birth]").each(function(select) {
                $(this).change(function() {
                    var inputContent =  $("select[name=birth-day]").val() + "/" + $("select[name=birth-month]").val() + "/" + $("select[name=birth-year]").val();
                    $("input[name=birth-date]").val(inputContent);
                });
            }).first().trigger("change");


        });
    };

    var initButtonSets = function() {

        $("[data-widget=buttonset]").each(function() {
            $(this).buttonset();
        });
        
    };

    var initSelects = function() {

        $("[data-range-end]").each(function() {
            var select = $(this),
                start = select.data("range-start") || 0,
                end = select.data("range-end"),
                delta = (end - start) / Math.abs(end - start);

            var i = start;
            while (i != end) {
                var option = document.createElement("option");

                option.value = i;
                option.innerHTML = i;
                select.append(option);

                i += delta;
            }
        });

    };

    var initFancyBox = function() {
        $(".fancybox").fancybox({
            openEffect  : 'none',
            closeEffect : 'none',
            afterLoad   : function() {
                this.inner.prepend('<h1>Stopovers</h1>');
            }
        })
    };

    var initWidgets = function() {

        initSliders();
        initDatepickers();
        initAutocompletes();
        initSelectDatepickers();
        initButtonSets();
        initSelects();
        initFancyBox();

    };

    return {
        init: initWidgets
    };

}();
