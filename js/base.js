var App = {

    Models: {},

    Collections: {},

    Views: {},

    Routers: {}

};

App.Models.Flight = Backbone.Model.extend();

App.Collections.FlightList = Backbone.Collection.extend({

    fetch: function(options) {
        var list = [
            new App.Models.Flight({ id: 1, currency: "US$", price: 599 }),
            new App.Models.Flight({ id: 2, currency: "US$", price: 899 }),
            new App.Models.Flight({ id: 3, currency: "US$", price: 1099 })
        ];
        var that = this;
        this.reset();
        $.each(list, function(key, value) {
            that.add(value, {silent: true});
        });
        this.trigger("change");
        options && options.success && options.success(this, list);
    }

});

App.Routers.Router = Backbone.Router.extend({

    routes: {
        ""          : "home",
        "about"     : "about",
        "search"    : "search",
        "buy/:id"   : "buy",
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

    buy: function(id) {
        this.switchPage("buy");
    },

    defaultRoute: function(actions) {
        alert("Invalid page");
        this.navigate("");
    },

    switchPage: function(pageName) {
        $(".current").removeClass("current");
        $("#page-" + pageName).addClass("current");
        $("a[href=#" + pageName + "]").addClass("current");

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

    el: '.container',

    initialize: function() {
        this.page = this.$(".page.current")[0];
        this.menu = this.$(".header-menu")[0];
    }

});

App.Views.FlightView = Backbone.View.extend({

    render: function() {
        // this.$el.html(this.model.get("name"))
        // this.$el.html(Mustache.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.Views.SearchFormView = Backbone.View.extend({
    
    el: $("#search-form"),

    events: {
        "click button": "submitForm"
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
        this.template = options.template;
        var that = this;
        this.collection.on("change", function() {
            that.render();
        });
    },

    render: function() {

        var that = this;

        this.$el.html(null);

        this.collection.forEach(function(flight) {
            that.$el.append(that.template(flight.toJSON()));
        });
        
        return this;
    }

});

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

$(function() {

    $("#search-form").on("click", "button", function() {
        var data = $(this).parents("form").serializeArray();
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
        template: Mustache.compile($("#template-flight").html()),
        collection: app.flightList
    });

    Backbone.history.start();

    app.flightList.fetch();

});
