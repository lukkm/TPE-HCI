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

        this.reset();

        var collection = this;
        $.each(list, function(key, value) {
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
        app.router.navigate("search", { trigger: true });
        return false;
    }

});

App.Views.BuyFormView = Backbone.View.extend({
	
	el: $("#buy-form"),
	
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
    app.searchForm = new App.Views.SearchFormView;
	app.buyForm    = new App.Views.BuyFormView;
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

    app.flightList.fetch();
    
};
