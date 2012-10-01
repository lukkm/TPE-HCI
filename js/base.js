window.App = {}

App.Flight = Backbone.Model.extend();

App.FlightList = Backbone.Collection.extend({
    model: App.Flight,

    fetch: function() {
        var list = [
            new Flight({ name: "Flight #1" }),
            new Flight({ name: "Flight #2" }),
            new Flight({ name: "Flight #3" })
        ];
        return list;
    }
});

App.Router = Backbone.Router.extend({
    routes: {
        "" : "home",
        "about": "about",
        "search/:query": "search"
    },

    home: function() {
        this.switchPage("home")
    },

    about: function() {
        this.switchPage("about")
    },

    search: function(query) {
        alert("query: " + query);
    },

    switchPage: function(pageName) {
        $(".page.current").removeClass("current");
        $("#page-" + pageName).addClass("current");
    },

    defaultRoute: function(actions) {
        alert(actions);
    }

});

App.FlightView = Backbone.View.extend({
    template: $("template-flight").html(),

    render: function() {
        this.$el.html(Mustache.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.AppView = Backbone.View.extend({

    el: $("#app"),

    initialize: function() {
        alert("initialized appview");
    }

});

$(function() {

    App.routing = new App.Router();

    Backbone.history.start();

    $("#departure-date").datepicker();
    $("#return-date").datepicker();

});
