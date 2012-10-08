var App = {

    Models: {},

    Collections: {},

    Views: {},

    Routers: {}

};

App.Models.Flight = Backbone.Model.extend();

App.Collections.FlightList = Backbone.Collection.extend({

    initialize: function() {
        this.parameters = {};
    },

    setParameters: function(parameters) {
        var collection = this;
        _.each(parameters, function(input) {
            collection.parameters[input.name] = input.value;
        });

        var from = this.parameters.from.split(", ");
        this.parameters.fromAirportName = from[0];
        this.parameters.fromCityName = from[1];
        this.parameters.fromCountryName = from[2];

        var to = this.parameters.to.split(", ");
        this.parameters.toAirportName = to[0];
        this.parameters.toCityName = to[1];
        this.parameters.toCountryName = to[2];

        return this;
    },

    fetch: function(options) {

        var list = [];
        var prices = [599, 899, 1099, 2599];
        for (i = 1; i <= 10; i++) {
            var model = new App.Models.Flight({
                id: i,
                currency: "US$",
                price: prices[Math.floor(Math.random() * prices.length)]
            });
            _.extend(model.attributes, this.parameters);
            list.push(model);
        }

        this.reset();

        var collection = this;
        _.each(list, function(value) {
            collection.add(value, { silent: true });
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
		"confirm"   : "confirm",
        "thanks"    : "thanks",
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
        app.information.set("flightId", id);
        var button = $("#back-purchase");
        button.attr("href", Mustache.render(button.data("href-template"), { flightId: app.information.get("flightId") }));
    },
	
	confirm: function(id) {
		this.switchPage("confirm");
	},

    thanks: function(id){
        this.switchPage("thanks");
    },

    defaultRoute: function(actions) {
        alert("Invalid page");
        this.navigate("");
    },

    switchPage: function(pageName) {
        $(".current").removeClass("current");
        $("#page-" + pageName).addClass("current");
        $("a[href=#" + pageName + "]").addClass("current");

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
        var parameters = this.$el.find("form").serializeArray();
        app.flightList.setParameters(parameters).fetch();
        app.router.navigate("search", { trigger: true });
        return false;
    }

});

App.Views.BuyFormView = Backbone.View.extend({
	
	events: {
		"click button": "submitForm"
	},
	
	submitForm: function() {
		app.router.navigate("confirm", { trigger: true });
		return false;
	}
	
});

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

    app.router     = new App.Routers.Router;
    app.searchForm = new App.Views.SearchFormView({
        el: $(".search-form")
    });
	app.buyForm    = new App.Views.BuyFormView({
        el: $(".buy-form")
    });
    app.flightList = new App.Collections.FlightList({
        model: App.Models.Flight
    });
    app.searchResultsView = new App.Views.SearchResultsView({
        el: $("#search-results"),
        template: Mustache.compile($("#template-flight").html()),
        collection: app.flightList
    });

    app.information = new App.Info;

    Backbone.history.start();
    
};
