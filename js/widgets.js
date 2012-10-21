var Widgets = function() {

    var initSliders = function() {

        $("[data-widget=slider]").each(function() {
            var $el = $(this),
                $target = $("#" + $el.data("target")),
                min = $el.data("min"),
                max = $el.data("max");

            $el.slider({
                range: true,
                min: min,
                max: max,
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
            
            var $el = $(this),
                hasWidget = $el.data("has-widget");

            if (hasWidget) {
                return;
            }

            $el.data("has-widget", true);
            
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
                hasWidget = select.data("has-widget");

            if (hasWidget) {
                return;
            }

            select.data("has-widget", true);

            var start = select.data("range-start") || 0,
                end = select.data("range-end"),
                delta = (end - start) / Math.abs(end - start),
                selected = select.data("selected");

            var i = start,
                options = "",
                checked = "";

            while (i !== end) {
                checked = (i == selected) ? " selected" : "";
                options += '<option value="' + i + '"' + checked + '>' + i + '</option>';
                i += delta;
            }
            select.append(options);
        });

    };

    var initCommentRadios = function() {
        $("[data-radio]").each(function() {
            var select = $(this);

            var controlName = select.data("radio");
            select.html("");
            var inner = "<td><label for='" + controlName + "'>" + controlName + "</label>";

            for (i = 1; i <= 10; i++){
                inner +=  "<td>" + i + "<input type='radio' name='" + controlName + "' value=" + i + "></td>"
            }

            select.append(inner);

        });


        /*

        Falta terminar

        $("[data-radio]").change( function(){
            var avg = 0, cant = 0;
            $("[data-radio]").each( function() {
                var $el = $(this); 
                _.forEach($el, function(input){
                    console.log(input);
                    if (input.value != ""){
                        avg += input.value;
                        cant++;
                    }
                });
            });
            console.log(avg);
            console.log(cant);
            $("#av-score").html(avg/cant)
        });
        */

    };


    var initFancyBox = function() {

        $(".fancybox").fancybox({
            openEffect  : 'none',
            closeEffect : 'none'
        });

    };

    var initWidgets = function() {

        initSliders();
        initDatepickers();
        initAutocompletes();
        initSelectDatepickers();
        initButtonSets();
        initSelects();
        initCommentRadios();
        initFancyBox();

    };

    return {
        init: initWidgets
    };

}();
