var App = {

    Models: {},

    Collections: {},

    Views: {},

    Routers: {},

};

App.Models.Flight = Backbone.Model.extend();

App.Collections.FlightList = Backbone.Collection.extend({

    fetch: function() {
        var list = [
            new App.Models.Flight({ id: 1, currency: "US$", price: 599 }),
            new App.Models.Flight({ id: 2, currency: "US$", price: 899 }),
            new App.Models.Flight({ id: 3, currency: "US$", price: 1099 })
        ];
        return list;
    }

});

App.Routers.Router = Backbone.Router.extend({

    routes: {
        ""          : "home",
        "about"     : "about",
        "search"    : "search",
        "flight/:id": "flight",
        "*actions"  : "defaultRoute"
    },

    home: function() {
        this.switchPage("home");
    },

    about: function() {
        this.switchPage("about");
    },

    search: function(query) {
        this.switchPage("search");
    },

    flight: function(id) {
        alert("Selected flight id = " + id);
    },

    switchPage: function(pageName) {
        $(".page.current").removeClass("current");
        $("#page-" + pageName).addClass("current");
    },

    defaultRoute: function(actions) {
        alert("Invalid page");
        this.navigate("home");
    }

});

App.Views.FlightView = Backbone.View.extend({

    render: function() {
        this.$el.html(this.model.get("name"))
        // this.$el.html(Mustache.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.Views.SearchFormView = Backbone.View.extend({
    
    el: $("#search-form"),

    events: {
        "click input[type=button]": "submitForm"
    },

    submitForm: function() {
        app.router.navigate("search", { trigger: true });
        return false;
    }

});

// App.Views.GenericView = Backbone.View.extend({

    // getContext: function() {
        // return {};
    // },

    // render: function() {
        // var context = this.getContext() || {};
        // _.extend(context, {model: this.model.toJSON()});
        // this.$el.append(Mustache.render(this.template, context));
    // }

// })

// App.SearchResultsView = App.Views.GenericView.extend({

    // getContext: function() {
        // return { name: "sarasa" }
    // },

    // template: "{{name}}"

// });

App.Views.SearchResultsView = Backbone.View.extend({

    initialize: function(options) {
        this.template = options.template || "";
    },

    render: function() {
        var flights = this.collection.fetch();

        for (var i = 0; i < flights.length; i++) {
            this.addFlight(flights[i]);
        }
        
        return this;
    },

    addFlight: function(flight) {
        // var view = new App.Views.FlightView({ model: flight });
        this.$el.append(Mustache.render(this.template, flight.toJSON()));
    }

})

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
            var list = [ "Buenos Aires", "Miami", "New York", "Paris", "London" ],
                term = request.term;

            callback(_.filter(list, function(e) { return e.toLowerCase().lastIndexOf(term.toLowerCase(), 0) === 0 }));
        }
    }

    // initialize autocompletes (use data-source attribute to assign
    // source function)
    $("input[data-widget=autocomplete]").each(function() {
        var $el = $(this),
            source = sourceMap[$el.data("source")];

        $el.autocomplete({
            source: source,
            // minLength: 3
        });
    });

};

var initWidgets = function() {

    initSliders();
    initDatepickers();
    initAutocompletes();

};

$(function() {

    $("#search-form").on("click", "button", function() {
        app.router.navigate("search", { trigger: true });
        return false;
    });

    initWidgets();

    window.app = window.app || {};

    app.view       = new App.Views.AppView;
    app.router     = new App.Routers.Router;
    app.searchForm = new App.Views.SearchFormView;
    app.flightList = new App.Collections.FlightList({
        model: App.Models.Flight
    });
    app.searchResultsView = new App.Views.SearchResultsView({
        el: $("#search-results"),
        template: $("#template-flight").html(),
        collection: app.flightList
    });
    app.searchResultsView.render();

    Backbone.history.start();

});
