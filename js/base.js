

$(function() {

    $("#departure-date").datepicker();
    $("#return-date").datepicker();

    var Workspace = Backbone.Router.extend({
        routes: {
            "/about": "about",
            "/search/:query": "search"
       },

        about: function() {
            alert("About!");
            $(".container").html("Hello");
        }

    });

    var Flight = Backbone.Model.extend();

    var Flight = new Flight();


    var FlightList = Backbone.Collection.extend({
        model: Flight
    });

    var Flights = new FlightList;

    var FlightView = Backbone.View.extend({
        template: $("template-flight").html(),

        render: function() {
            this.$el.html(Mustache.render(this.template, { name: "Flight #1234" }));
            return this;
        }

    });

    var AppView = Backbone.View.extend({

        el: $("app"),

        initialize: function() {

        }

    });

    var App = new AppView;

    // Backbone.history.start();

});
