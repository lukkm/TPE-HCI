var App = function() {

    this.router = new App.Router;
    this.view = new App.AppView;
    this.searchForm = new App.SearchFormView;
    this.flightList = new App.FlightList({
        model: App.Flight
    });
    this.searchResultsView = new App.SearchResultsView({
        el: $("#search-results"),
        template: $("#template-flight").html(),
        collection: this.flightList
    });

    Backbone.history.start();
};

App.Flight = Backbone.Model.extend();

App.FlightList = Backbone.Collection.extend({

    model: App.Flight,

    fetch: function() {
        var list = [
            new App.Flight({ id: 1, price: "US$599" }),
            new App.Flight({ id: 2, price: "US$599" }),
            new App.Flight({ id: 3, price: "US$599" })
        ];
        return list;
    }

});

App.Router = Backbone.Router.extend({
    routes: {
        "" : "home",
        "about": "about",
        "search": "search",
        "flight/:id": "flight",
        "*actions" : "defaultRoute"
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

App.FlightView = Backbone.View.extend({

    template: $("template-flight").html(),

    render: function() {
        // this.$el.html(this.model.get("name"))
        this.$el.html(Mustache.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.AppView = Backbone.View.extend({
    el: $("#app"),
});

App.SearchFormView = Backbone.View.extend({
    
    el: $("#search-form"),

    events: {
        "click input[type=button]": "submitForm"
    },

    submitForm: function() {
        app.router.navigate("search", { trigger: true });
        return false;
    }

});

// App.Views = App.View || {};

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

App.SearchResultsView = Backbone.View.extend({

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
        this.$el.append(Mustache.render(this.template, flight.toJSON()));
    }

})

$(function() {

    window.app = new App;

    $("#search-form").on("click", "input[type=submit]", function() {
        app.router.navigate("search", { trigger: true });
        return false;
    });

    $("#departure-date").datepicker();
    $("#return-date").datepicker();

    $( "#slider-range-price" ).slider({
            range: true,
            min: 0,
            max: 500,
            values: [ 75, 300 ],
            slide: function( event, ui ) {
                $( "#filter-price" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
            }
        });
    $( "#filter-price"  ).val( "$" + $( "#slider-range-price" ).slider( "values", 0 ) +
        " - $" + $( "#slider-range-price" ).slider( "values", 1 ) );

    app.searchResultsView.render();

});
