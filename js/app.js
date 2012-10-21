window.App = window.App || {};

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

    // init templates
    var templates = app.templates = {};
    $("script[type='text/x-handlebars-template']").each(function() {
        templates[this.id] = Handlebars.compile(this.innerHTML);
    });

    // initialize main router
    app.router = new App.Routers.Router();

    // initialize the search results collection
    app.searchResults = new App.Collections.SearchResults(null, {
        model: App.Models.Flight
    });

    // initialize app view
    app.appView = new App.Views.AppView({
        el: $("body")
    });

    // intialize app key-value store
    app.info = new App.Info();

    Backbone.history.start();
    
};
