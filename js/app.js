
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
        dep_date: { pattern: /\d{4}-\d{2}-\d{2}/ },
        ret_date: { required: false, pattern: /\d{4}-\d{2}-\d{2}/ }
    }

});

App.Models.Query.fromSerializedArray = function(serializedArray) {

    var attributes = {};
    _.each(serializedArray, function(input) {
        attributes[input.name] = input.value;
    });

    attributes = _.omit(attributes, ["from-user", "to-user",
            "departure-date-user", "return-date" ]);

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
        this.fetch();
    },

    parse: function(response) {
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
        }

        var setSegments = function(route){
            _.forEach(route.segments, setSegment);
            route.id = _.uniqueId();
        }

        var setOneWayRoutes = function(flight, routes) { 

            _.forEach(routes, setRoutes);
            _.forEach(routes, setSegments);

            flight.departure      = routes[0].departure;
            flight.arrival        = routes[0].arrival;
            flight.departureDateToMoment   = moment(flight.departure.date, "YYYY-MM-DD hh:mm:ss");
            flight.arrivalDateToMoment   = moment(flight.arrival.date, "YYYY-MM-DD hh:mm:ss");
            flight.departure.time = flight.departureDateToMoment.format("h:mm a");
            flight.arrival.time   = flight.arrivalDateToMoment.format("h:mm a");
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

            flight.flightId = _.uniqueId();
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
        $button.attr("href", Handlebars.compile(button.data("href-template"))(
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
            el: $(".buy-form")
        });

        this.subviews.searchResultsView = new App.Views.SearchResultsView({
            el: $("#page-search"),
            template: Handlebars.compile($("#search-results").html()),
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
        this.on('error', function(e) {
            this.showErrors(e);
        });
    },
    
    events: {
        "click button": "submitForm",
        "change input": "resetValidation",
        "error": "showErrors"
    },

    submitForm: function(e) {

        var $form = this.$el.find("form"),
            parameters = $form.serializeArray(),
            query = App.Models.Query.fromSerializedArray(parameters);

        if (query.isValid(true)) {

            app.searchResults.setQuery(query).fetch({ success: function() {
                app.appView.subviews.searchResultsView.render();
            }});

            _.forEach($("input[data-from]"), function(input) {
                var $input = $(input),
                    value = $("#" + $input.data("from")).val();
                $input.val(value);
             });

            app.router.navigate("search", { trigger: true });

        } else {

            $form.data("errors", query.validate());
            this.trigger("error");
        
        }

        e.preventDefault();

    },

    resetValidation: function(e) {

        var $input = $(e.target);
        $input.removeClass("invalid");

    },

    showErrors: function(e) {

        var $form = this.$el.find("form"),
            errors = $form.data("errors");

        $form.find("input").each(function() {
            var name = $(this).attr("name");

            if (errors[name]) {
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

        var data = $(this).parents("form").serializeArray();

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
        "click .page": "changePage"
    },

    initialize: function(options) {
        this.template = options.template;
    },

    getContext: function() {
        return {
            flights: this.collection.toJSON(),
            pagination: this.collection.pagination,
            filters: this.collection.filters,
            metadata: this.collection.metadata
        };
    },

    render: function() {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(this.template(this.getContext()));
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
            this.$el.html("Thank you for subscribing to our newsletter!");
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
