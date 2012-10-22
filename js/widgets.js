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
            },

            airlines: function(request, callback) {
                API.Misc.getAirlinesByName( { name: request.term } , function(data){
                    var list = _.first(_.map(data.airlines, function(airline) {
                        return { _value: airline.airlineId, label: airline.name };
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
            var controlNameParam = select.data("name");

            select.html("");
            var inner = "<td><label for='" + controlName + "'>" + controlName + "</label>";

            for (i = 1; i <= 9; i++){
                inner +=  "<td>" + i + "<input type='radio' data-selector='rating' name='" + controlNameParam + "' value=" + i + "></td>"
            }

            select.append(inner);

        });


        $("[data-radio]").change( function(){

            var sum = 0, cant = 0;

            _.forEach($(":checked[data-selector='rating']"), function(el){
                sum += Number(el.value);
                cant++;
            });

            var result = ((cant > 0) ? (sum/cant) : 0).toFixed(2);

            $("#av-score").html(result);
            $("#avg-score")[0].value = result;
        });
        

    };


    var initFancyBox = function() {

        $(".fancybox").fancybox({
            openEffect  : 'none',
            closeEffect : 'none'
        });

    };

    var initHomeSlider = function() {
        API.Booking.getFlightDeals({from: "BUE"}, function(data){
            var deals = _.first(data.deals, 5);
            var currency = data.currencyId;

            var urlList = _.map(deals, function(deal) {
                var data = {},
                    baseAdress = "http://maps.google.com/maps/api/staticmap?",
                    params = { center: [deal.cityLatitude, deal.cityLongitude].join(","),
                               zoom: 14,
                               size: "563x246",
                               sensor: false,
                               maptype: "roadmap",
                               markers: "color:red|label:Deal|" + [deal.cityLatitude, deal.cityLongitude].join(",") };
                    data.url = baseAdress + _.map(params, function(value, key) { return key + "=" + value; }).join("&"),
                    data.title = deal.cityName.split(",")[0];
                    data.price = deal.price;

                return data;
            });
        
            var sliderDiv = $("#nivo-slider");

            _.forEach(urlList, function(data){
                sliderDiv.append("<img src='" + data.url + "' data-slider='" + data.title + "' data-price='" + currency + " " + data.price + "'/>")
            });

            sliderDiv.nivoSlider({
                effect: 'sliceDown', // Specify sets like: 'fold,fade,sliceDown'
                slices: 15, // For slice animations
                animSpeed: 500, // Slide transition speed
                pauseTime: 6000, // How long each slide will show
                directionNav: true, // Next & Prev navigation
                controlNav: true, // 1,2,3... navigation
                controlNavThumbs: false, // Use thumbnails for Control Nav
                pauseOnHover: true, // Stop animation while hovering
                manualAdvance: false, // Force manual transitions
                prevText: 'Prev', // Prev directionNav text
                nextText: 'Next', // Next directionNav text
                randomStart: false, // Start on a random slide
                beforeChange: function(){}, // Triggers before a slide transition
                afterChange: function(){
                    var mainImg = $(".nivo-main-image");
                    var currImg = _.find($("[data-slider]"), function(img){
                        return img.getAttribute("src") ===  mainImg.attr("src");
                    });
                    $("#deal-title-text").html("Flights to " + currImg.getAttribute("data-slider") + " - From: " + currImg.getAttribute("data-price"));
                }, 
                slideshowEnd: function(){}, // Triggers after all slides have been shown
                lastSlide: function(){}, // Triggers when last slide is shown
                afterLoad: function(){
                    var mainImg = $(".nivo-main-image");
                    var currImg = _.find($("[data-slider]"), function(img){
                        return img.getAttribute("src") ===  mainImg.attr("src");
                    });
                    $("#deal-title-text").html("Flights to " + currImg.getAttribute("data-slider") + " - From: " + currImg.getAttribute("data-price"));
                }
            });

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
        initHomeSlider();
    };

    return {
        init: initWidgets
    };

}();
