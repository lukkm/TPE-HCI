var App = function() {
    this.router = new App.Router();
    this.view = new App.AppView();
    this.searchForm = new App.SearchFormView();
    this.flights = new App.FlightList();

    Backbone.history.start();
};

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
        "search": "search"
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
});

App.SearchFormView = Backbone.View.extend({
    
    el: $("#search-form"),

    events: {
        "click input[type=button]": "submitForm"
    },

    submitForm: function() {
        app.navigate("search");
        return false;
    }

});

$(function() {

    window.app = new App();

    $("#search-form").on("click", "input[type=submit]", function() {
        app.router.navigate("search", { trigger: true });
        return false;
    });

    $("#departure-date").datepicker();
    $("#return-date").datepicker();

});
