$(function() {

var Workspace = Backbone.Router.extend({
    routes: {
        "about": "about",
        "search/:query": "search"
    },

    help: function() {
        $(".container").html("Hello");
    }

});

var Flight = Backbone.Model.extend({

});

var FlightList = Backbone.Collection.extend({
    model = Flight
});

var Flights = new FlightList;

var FlightView = Backbone.View.extend({
    template = _.template($("template-flight".html()),

    render: function() {
        this.$el.html("Flight #1234");
        return this;
    }

});

var AppView = Backbone.View.extend({

    el: $("app"),

    initialize: function() {

    }

});

var App = new AppView;

});
