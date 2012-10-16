// @TODO: register helpers for date and currency display

// Handlebars.registerHelper('fare', function(baseFare, quantity) {
    // baseFare = parseInt(baseFare, 10);
    // quantity = parseInt(quantity, 10);
    // return baseFare * quantity;
// });

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
        ret_date: { pattern: /\d{4}-\d{2}-\d{2}/ }
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
        this.filters = response.filters;
        return response.flights;
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
        var button = $("#back-purchase");
        button.attr("href", Handlebars.render(button.data("href-template"),
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

        if (pageTitle !== undefined) {
            document.title = pageTitle + separator + baseTitle;
        } else {
            document.title = baseTitle;
        }
    }

});

App.Views.AppView = Backbone.View.extend({

    initialize: function() {

        this.subviews = {};
    
        this.subviews.searchForm = new App.Views.SearchFormView({
            el: $(".search-form")
        });

        this.subviews.buyForm = new App.Views.BuyFormView({
            el: $(".buy-form")
        });

        this.subviews.searchResultsView = new App.Views.SearchResultsView({
            el: $("#page-search"),
            template: Handlebars.compile($("#template-flight").html()),
            collection: app.searchResults
        });

        this.subviews.newsletterView = new App.Views.NewsletterView({
            el: $(".newsletter-subscribe")
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
        "change #sort": "changeSort"
    },

    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        var $results = this.$el.find(".search-results");
        $results.html(null);

        this.updateCount();

        var view = this;
        this.collection.forEach(function(flight) {
            $results.append(view.template(flight.toJSON()));
        });
        
        return this;
    },

    updateCount: function() {
        var $header = this.$el.find(".search-results-header"),
            $count = $header.find(".count");

        var count = { total: this.collection.length };

        $count.html(Handlebars.compile($count.data("template"))(count));
    },

    changeSort: function(e) {
        var $select = $(e.target),
            value = $select.val().split(" "),
            sort_key = value[0],
            sort_order = value[1];

        this.collection.sort(sort_key, sort_order);
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
