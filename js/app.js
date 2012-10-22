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

    app.errorTip = { 
        width: 200,
        background: '#E73636',
        color: 'white',
        textAlign: 'center',
        border: {
          width: 1,
          radius: 5,
          color: '#E73636'
        },
        tip: 'bottomLeft',
        
    }


    Backbone.history.start();
    
};
