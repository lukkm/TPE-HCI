window.App = window.App || {};
App.Routers = App.Routers || {};

App.Routers.Router = Backbone.Router.extend({

    routes: {
        ""            : "home",
        "about"       : "about",
        "tos"         : "tos",
        "search"      : "search",
        "buy/:id"     : "buy",
        "confirm"     : "confirm",
        "publish-rec" : "publishRec",
        "rec-posted"  : "recPosted",
        "find-rec"    : "findRec",
        "thanks"      : "thanks",
        "*actions"    : "defaultRoute"
    },

    initialize: function(options) {
        this.initPages();
    },

    home: function() {
        this.switchPage("home");
    },

    about: function() {
        this.switchPage("about");
    },

    tos: function() {
        this.switchPage("tos");
    },

    search: function() {
        // if no search was given, return to home
        if (!app.searchResults.hasQuery()) {
            this.navigate("", { trigger: true });
            return;
        }
        this.switchPage("search");
    },

    buy: function(id) {
        if (!app.info.get("currentFlight")) {
            this.navigate("", { trigger: true});
            return;
        }
        this.switchPage("buy");
        var $button = $("#back-purchase");
        $button.attr("href", Handlebars.compile($button.data("href-template"))(
                    { flightId: id }));
    },

    confirm: function(id) {
        this.switchPage("confirm");
    },

    publishRec: function(id){
        this.switchPage("publish-rec");
    },

    recPosted: function(id) {
        this.switchPage("rec-posted");
    },

    findRec: function(id){
        this.switchPage("find-rec");
    },

    thanks: function(id){
        this.switchPage("thanks");
    },

    defaultRoute: function(actions) {
        alert("Invalid page: " + actions);
        this.navigate("");
    },

    initPages: function() {
        this.pages = {};

        var router = this;

        $(".page").each(function(index, page) {
            var name = page.id.substring("page-".length);
            router.pages[name] = page;
            $(page).hide();
        });
    },

    switchPage: function(pageName) {

        $(".page.current").removeClass("current").hide();
        $(this.pages[pageName]).addClass("current").show();

        $("a.current").removeClass("current");
        $("a[href=#" + pageName + "]").addClass("current");

        window.scrollTo(0,0);

        this.updateTitle();
    },

    updateTitle: function() {
        var pageTitle = $(".page.current").data("title"),
            baseTitle = $("body").data("title-base"),
            separator = $("body").data("title-separator");

        if (typeof pageTitle !== 'undefined') {
            document.title = pageTitle + separator + baseTitle;
        } else {
            document.title = baseTitle;
        }
    }

});
