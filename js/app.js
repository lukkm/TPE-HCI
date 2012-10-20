
// add validation support to all models
_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

var App = {

    Models: {},

    Collections: {},

    Views: {},

    Routers: {}

};

App.Models.Flight = Backbone.Model.extend();

App.Models.Query = Backbone.Model.extend({

    validation: {
        from: { required: true },
        to: { required: true },
        repeat: { oneOf: ["one-way", "round-trip"] },
        dep_date: function(value) {
            try {
                // @TODO: Add one or two days before its valid
                var departureDate = new Date(value),
                    valid = departureDate >= Date.now();

                if (valid) { return; }
            } catch(e) {}

            return "Invalid return date";
        },
        ret_date: function(value, key, form) {
            try {
                var returnDate = new Date(value),
                    departureDate = new Date(form.dep_date);
                    valid = form.repeat === "one-way" ||
                            returnDate >= departureDate;

                if (valid) { return; }
            } catch(e) {}

            return "Invalid return date";
        }
    }

});

App.Models.Query.fromSerializedArray = function(serializedArray) {

    var attributes = {};
    _.each(serializedArray, function(input) {
        attributes[input.name] = input.value;
    });

    attributes = _.omit(attributes, ["from-user", "to-user",
            "departure-date-user", "return-date-user" ]);

    return new App.Models.Query(attributes, { parse: true });
};

App.Collections.SearchResults = Backbone.Collection.extend({

    initialize: function() {
        this.query = null;
    },

    hasQuery: function() {
        return this.query !== null;
    },

    sync: function(method, collection, options) {
        var data, jqxhr;

        if (method !== "read") {
            throw "Attempt to modify read only collection";
        }

        data = collection.query.toJSON();

        if (data.repeat === "one-way") {
            jqxhr = API.Booking.getOneWayFlights(data, options);
        } else if (data.repeat === "round-trip") {
            jqxhr = API.Booking.getRoundTripFlights(data, options);
        } else {
            throw "Invalid repeat value";
        }
        return jqxhr;
    },

    sort: function(sort_key, sort_order) {
        sort_order = sort_order || 'asc';

        this.query.set("sort_key", sort_key);
        this.query.set("sort_order", sort_order);

        // @TODO: validate query model
        var that = this;
        this.fetch({ success: function() {
            that.trigger("update");
        } });
    },

    parse: function(response) {
        // @TODO: see if there is a cleaner way to handle errors
        if (response.error) {
            this.trigger("error", response.error);
            return [];
        }

        this.metadata = {
            currencyId: response.currencyId
        };
        this.filters = response.filters;
        this.pagination = {
            page:     response.page,
            pageSize: response.pageSize,
            total:    response.total,
            pages:    Math.ceil(response.total / response.pageSize),
            hasPages: Math.ceil(response.total / response.pageSize) > 1
        };

        this.extractRoutes(response);

        return response.flights;
    },

    getFlightById: function(id) {
        var flight = this.find(function(model) {
            return model.get("flightId") == id;
        });
        return flight;
    },

    extractRoutes: function(response) {

        var setRoutes = function(route) {
            route.departure = route.segments[0].departure;
            route.arrival = route.segments[route.segments.length - 1].arrival;

            var flightLength = route.segments.length;

            route.stopovers = (flightLength == 1) ? "Direct" : (flightLength-1) + " stopover";

            if (flightLength > 2) {
                route.stopovers += "s";
            }
        };

        var setSegment = function(segment){
            var dateToMoment = moment(segment.departure.date, "YYYY-MM-DD hh:mm:ss");
            segment.departure.formatedDate = dateToMoment.format("MMMM Do YYYY");
            segment.departure.formatedTime = dateToMoment.format("h:mm a"); 
            dateToMoment = moment(segment.arrival.date, "YYYY-MM-DD hh:mm:ss");
            segment.arrival.formatedDate = dateToMoment.format("MMMM Do YYYY");
            segment.arrival.formatedTime = dateToMoment.format("h:mm a"); 
        };

        var setSegments = function(route){
            _.forEach(route.segments, setSegment);
            route.id = _.uniqueId();
        };

        var setOneWayRoutes = function(flight, routes) { 

            flight.flightId = _.uniqueId();

            _.forEach(routes, setRoutes);
            _.forEach(routes, setSegments);

            flight.departure = routes[0].departure;
            flight.arrival = routes[0].arrival;
            flight.departureDateToMoment = moment(flight.departure.date, "YYYY-MM-DD hh:mm:ss");
            flight.arrivalDateToMoment = moment(flight.arrival.date, "YYYY-MM-DD hh:mm:ss");
            flight.departure.time = flight.departureDateToMoment.format("h:mm a");
            flight.arrival.time = flight.arrivalDateToMoment.format("h:mm a");
        };

        _.forEach(response.flights, function(flight) {
            if (typeof flight.outboundRoutes !== 'undefined') {
                setOneWayRoutes(flight, flight.outboundRoutes);
                flight.outboundDate = flight.departureDateToMoment.format("MMMM Do YYYY");
            }
            if (typeof flight.inboundRoutes !== 'undefined') {
                setOneWayRoutes(flight, flight.inboundRoutes);
                flight.inboundDate = flight.departureDateToMoment.format("MMMM Do YYYY");
            }
        });
    },

    setQuery: function(query) {
        this.query = query;
        return this;
    }

});

App.Routers.Router = Backbone.Router.extend({

    routes: {
        ""          : "home",
        "about"     : "about",
        "toc"       : "toc",
        "search"    : "search",
        "buy/:id"   : "buy",
        "confirm"   : "confirm",
        "thanks"    : "thanks",
        "*actions"  : "defaultRoute"
    },

    initialize: function(options) {
        this.initPages();
    },

    home: function() {
        this.switchPage("home");
    },

    about: function() {
        this.switchPage("about");
    },

    toc: function() {
        this.switchPage("toc");
    },

    search: function() {
        // if no search was given, return to home
        if (!app.searchResults.hasQuery()) {
            this.navigate("", { trigger: true });
            return;
        }
        this.switchPage("search");
    },

    buy: function(id) {
        this.switchPage("buy");
        var $button = $("#back-purchase");
        $button.attr("href", Handlebars.compile($button.data("href-template"))(
                    { flightId: id }));
    },

    confirm: function(id) {
        this.switchPage("confirm");
    },

    thanks: function(id){
        this.switchPage("thanks");
    },

    defaultRoute: function(actions) {
        alert("Invalid page: " + actions);
        this.navigate("");
    },

    initPages: function() {
        this.pages = {};

        var router = this;

        $(".page").each(function(index, page) {
            var name = page.id.substring("page-".length);
            router.pages[name] = page;
            $(page).hide();
        });
    },

    switchPage: function(pageName) {

        $(".page.current").removeClass("current").hide();
        $(this.pages[pageName]).addClass("current").show();

        $("a.current").removeClass("current");
        $("a[href=#" + pageName + "]").addClass("current");

        window.scrollTo(0,0);

        this.updateTitle();
    },

    updateTitle: function() {
        var pageTitle = $(".page.current").data("title"),
            baseTitle = $("body").data("title-base"),
            separator = $("body").data("title-separator");

        if (typeof pageTitle !== 'undefined') {
            document.title = pageTitle + separator + baseTitle;
        } else {
            document.title = baseTitle;
        }
    }

});

App.Views.AppView = Backbone.View.extend({

    initialize: function() {

        this.setupTemplates();

        this.subviews = {};
    
        this.subviews.searchForm = new App.Views.SearchFormView({
            el: $(".search-form")
        });

        this.subviews.buyForm = new App.Views.BuyFormView({
            el: $("#buy-form")
        });

        this.subviews.searchResultsView = new App.Views.SearchResultsView({
            el: $("#page-search"),
            template: app.templates["search-results"],
            errorTemplate: app.templates["search-error"],
            collection: app.searchResults
        });

        this.subviews.newsletterView = new App.Views.NewsletterView({
            el: $(".newsletter-subscribe")
        });

    },

    setupTemplates: function() {

        Handlebars.registerHelper('currency', function(amount) {
            return (amount % 1 === 0) ? amount : amount.toFixed(2);
        });

        Handlebars.registerHelper('date', function (date, options) {
            var format = options && options.date || "mm/dd - h:mm";
            // @TODO: actually format date
            return date;
        });

        Handlebars.registerHelper('pagination', function(data) {
            var i, out = "<ul>";

            if (data.hasPages) {
                for (i = 1; i <= data.pages; i++) {
                    out += '<li><a href="#search/"' + i + '">' + i + '</a></li>';
                }
            }

            return out + "</ul>";
        });

        $("script.partial").each(function() {
            Handlebars.registerPartial(this.id, this.innerHTML);
        });

    },

    render: function() {
        for (var view in this.subviews) {
            view.render();
        }
    }

});

App.Views.SearchFormView = Backbone.View.extend({

    initialize: function(options) {
        _.extend(this, Backbone.events);

        this.on("validation", function(errors) {
            this.updateErrors(errors);
        });
    },
    
    events: {
        "click button": "submitForm",
        "focus input": "resetValidation"
    },

    submitForm: function(e) {

        var $form = this.$el.find("form"),
            parameters = $form.serializeArray(),
            query = App.Models.Query.fromSerializedArray(parameters);

        this.trigger("validation", query.validate());

        if (query.isValid(true)) {

            var collection = app.searchResults;
            collection.setQuery(query).fetch({ success: function() {
                collection.trigger("update");
            }});
            collection.trigger("fetch");

            this.updateFilterFields();

            app.router.navigate("search", { trigger: true });

        }

        e.preventDefault();

    },

    updateFilterFields: function() {

        _.forEach($("input[data-from]"), function(input) {
            var $input = $(input),
                value = $("#" + $input.data("from")).val();
            $input.val(value);
         });

    },

    resetValidation: function(e) {

        var $input = $(e.target);
        $input.removeClass("invalid");

    },

    updateErrors: function(errors) {

        var $form = this.$el.find("form");

        $form.find("input").each(function() {
            var name = $(this).attr("name");

            if (errors && errors[name]) {
                $(this).add($("[data-bind=" + name + "]"))
                    .addClass("invalid");
            } else {
                $(this).removeClass("invalid");
            }
        });

    }

});

App.Views.FlightView = Backbone.View.extend({

    render: function() {
        // this.$el.html(this.model.get("name"))
        // this.$el.html(Handlebars.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.Views.BuyFormView = Backbone.View.extend({
    
    events: {
        "click button": "submitForm",
        "change input": "validateForm" 
    },
    
    submitForm: function(e) {
        var flight = app.searchResults.get(app.information.get("flightId"));
        
        var data = $("#buy-form").serializeArray();


        _.forEach(data, function(input) {
            $("#confirm-" + input.name).html(input.value);
        });

        app.router.navigate("confirm", { trigger: true });
        e.preventDefault();
    },

    validateForm: function() {
    
    }
    
});

App.Views.SearchResultsView = Backbone.View.extend({

    events: {
        "change #sort": "changeSort",
        "click .page": "changePage",
        "click .fancybox": "loadMaps"
    },

    filterRenderers: {
        "airline": "renderAirlineFilter",
        "stopover": "renderStopoverFilter",
        "price": "renderPriceFilter"
    },

    initialize: function(options) {
        this.template = options.template;

        var view = this;
        this.collection.on("update", function() {
            view.render();
        });
        this.collection.on("error", function(error) {
            view.showError(error);
        });
        this.collection.on("fetch", function() {
            view.showLoadingMessage();
        });
    },



    loadMaps: function(e) {

        function getTravelMarker(travel, obj, field) {
            API.Geo.getAirportById({ id: travel.airportId }, function(data) {
            
                var airport = data.airport; 
                
                var airportLatLng = new google.maps.LatLng(airport.latitude, airport.longitude);
                var marker = new google.maps.Marker({
                    position: airportLatLng,
                    title: airport.description
                });
            
                obj[field] = marker;
            });
        }
        
        var $link = $(e.target);
        var myFlightId = $link.data("flightid");
        var myId = $link.data("id");

        $("#stopovers-outbound-" + myFlightId).append(""); 

        var flight = app.searchResults.getFlightById(myFlightId);

        var route = _.find(flight.get("outboundRoutes"), function(route){
            return route.id == myId; 
        });

        var myOptions = {
            zoom: 4,
            center: new google.maps.LatLng(0,0),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        API.Geo.getAirportById({ id: route.segments[0].departure.airportId }, function(data) {
            var airport = data.airport;     
            map.setCenter(new google.maps.LatLng(airport.latitude, airport.longitude));
        });

        var el = document.getElementById("map-canvas-outbound-" + myId);
        var map = new google.maps.Map(el, myOptions);


        _.forEach(route.segments, function(segment){
           
            var travel = {};

            getTravelMarker(segment.departure, travel, "departurePos");
            getTravelMarker(segment.arrival, travel, "arrivalPos");

            console.log(travel);

            var marker1 = travel.departurePos;

            console.log(marker1);

            var flightPath = new google.maps.Polyline({
                path: [ marker1.position, marker2.position ],
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            marker1.setMap(map);
            marker2.setMap(map);

            flightPath.setMap(map);

            console.log(travel);

        });
    },

    getContext: function() {
        return {
            flights:    this.collection.toJSON(),
            pagination: this.collection.pagination,
            filters:    this.collection.filters,
            metadata:   this.collection.metadata
        };
    },

    showError: function(error) {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(app.templates["search-error"](error));
    },

    showLoadingMessage: function() {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(app.templates["search-loading"]());
    },

    render: function() {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(this.template(this.getContext()));

        this.renderFilters();

        return this;
    },

    changeSort: function(e) {
        var $select = $(e.target),
            value = $select.val().split(" "),
            sort_key = value[0],
            sort_order = value[1];

        this.collection.sort(sort_key, sort_order);
    },

    changePage: function(e) {
        var page = $(this).data("page");
        this.collection.query.set("page", page);
        this.collection.fetch();
    },

    renderFilters: function() {
        var filter,
            $el = this.$el.find(".dynamic-filters");

        $el.html(null);

        var that = this;
        _.each(this.collection.filters, function(filter) {
            var func = that.filterRenderers[filter.key];
            that[func]($el, filter);
        });
    },

    renderAirlineFilter: function($el, filter) {
        if (filter.values.length > 1) {
            var template = app.templates["filter-airline"];
            $el.append(template({ airlines: filter.values }));
        }
    },

    renderPriceFilter: function($el, filter) {
        if (filter.min && filter.max && filter.min !== filter.max) {
            var template = app.templates["filter-price"];
            $el.append(template({ max: filter.max, min: filter.min }));
        }
        Widgets.init();
    },

    renderStopoverFilter: function($el, filter) {
        if (filter.value.length > 1) {
            var template = app.templates["filter-stopovers"];
            $el.append(template({ stopovers: filter.values }));
        }
    }

});

App.Views.NewsletterView = Backbone.View.extend({

    events: {
        "click button" : "subscribe"
    },

    subscribe: function(e) {
        var form = this.$el.find("form"),
            input = form.find("input[name=email]"),
            email = input.val();
        
        if (email !== "") {
            this.$el.html("<p>Thank you for subscribing to our newsletter!</p>");
            console.log("Subscribing " + email + " to the newsletter!");
        } else {
            input.trigger("focus");
        }

        e.preventDefault();
    }

});

App.Info = function() {

    this.dictionary = {};

    this.get = function(key) {
        return this.dictionary[key];
    };

    this.set = function(key, value) {
        this.dictionary[key] = value;
    };

};

App.init = function() {

    window.app = {};

    // init templates
    var templates = app.templates = {};
    $("script[type='text/x-handlebars-template']").each(function() {
        templates[this.id] = Handlebars.compile(this.innerHTML);
    });

    // initialize main router
    app.router = new App.Routers.Router();

    // initialize the search results collection
    app.searchResults = new App.Collections.SearchResults({
        model: App.Models.Flight
    });

    // initialize app view
    app.appView = new App.Views.AppView({
        el: $("body")
    });

    // intialize app key-value store
    app.info = new App.Info();

    // setup history
    Backbone.history.start();
    
};
