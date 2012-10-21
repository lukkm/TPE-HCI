window.App = window.App || {};
App.Views = App.Views || {};

App.Views.AppView = Backbone.View.extend({

    initialize: function() {

        this.setupTemplates();

        this.subviews = {};

        this.setupViews();

        this.render();

    },

    setupViews: function() {

        this.subviews.header = new App.Views.Header({
            el: $(".header"),
            template: app.templates.header
        });

        this.subviews.footer = new App.Views.Footer({
            el: $(".footer"),
            template: app.templates.footer
        });

        this.subviews.languageSelect = new App.Views.LanguageSelect({
            el: $(".language-select"),
            template: app.templates["language-select"]
        });
    
        this.subviews.searchForm = new App.Views.SearchFormView({
            el: $(".search-form"),
            template: app.templates["search-form"]
        });

        this.subviews.buyForm = new App.Views.BuyFormView({
            el: $("#buy-form")
        });

        this.subviews.recommendationsForm = new App.Views.RecommendationsFormView({
            el: $("#recommendations-form")
        });

        this.subviews.searchResultsView = new App.Views.SearchResultsView({
            el: $("#page-search"),
            template: app.templates["search-results"],
            errorTemplate: app.templates["search-error"],
            collection: app.searchResults
        });

        this.subviews.newsletterView = new App.Views.NewsletterView({
            el: $(".newsletter-subscribe")
        });

    },

    registerHelpers: function() {

        var helpers = {

            "currency": function(amount) {
                return (amount % 1 === 0) ? amount : amount.toFixed(2);
            },

            "date": function (date, options) {
                var format = options && options.date || "mm/dd - h:mm";
                // @TODO: actually format date
                return date;
            },

            "pagination": function(data) {
                var i, out = "<ul>";

                if (data.hasPages) {
                    for (i = 1; i <= data.pages; i++) {
                        out += '<li><a href="#search/"' + i + '">' + i + '</a></li>';
                    }
                }

                return out + "</ul>";
            },

            "i18n": function(key, params) {
                var trans = i18n.translate(key);

                if (!trans) {
                    console.log("Missing translation for key: ", key);
                    return key;
                }

                return Handlebars.compile(trans)(params.hash);
            }

        };

        var helper;
        for (helper in helpers) {
            Handlebars.registerHelper(helper, helpers[helper]);
        }

    },

    registerPartials: function() {

        $("script.partial").each(function() {
            Handlebars.registerPartial(this.id, this.innerHTML);
        });

    },

    setupTemplates: function() {

        this.registerHelpers();
        this.registerPartials();

    },

    render: function() {

        var view;
        for (view in this.subviews) {
            this.subviews[view].render();
        }

    }

});

App.Views.Header = Backbone.View.extend({

    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        this.$el.html(this.template());
    }

});

App.Views.Footer = Backbone.View.extend({

    initialize: function(options) {
        this.template = options.template;
    },

    render: function() {
        this.$el.html(this.template());
    }

});

App.Views.LanguageSelect = Backbone.View.extend({
    
    initialize: function(options) {
        this.template = options.template;
    },

    events: {
        "click a": "changeLanguage"
    },

    changeLanguage: function(e) {
        var $link = $(e.target),
            language = $link.attr("hreflang");

        i18n.setLanguage(language);

        window.location.reload();

        e.preventDefault();
    },

    render: function() {
        this.$el.html(this.template());
    }

});

App.Views.RecommendationsFormView = Backbone.View.extend({

    events:{
        "click #publish-rec" : "publishRecommendation"
    },

    publishRecommendation: function(e){
        app.router.navigate("publish-rec", { trigger: true });
    }

});

App.Views.SearchFormView = Backbone.View.extend({

    initialize: function(options) {
        _.extend(this, Backbone.events);

        this.template = options.template;

        this.on("validation", function(errors) {
            this.updateErrors(errors);
        });
    },
    
    events: {
        "click button": "submitForm",
        "focus input": "resetValidation",
        "click #one-way": "setOneWayRepeat",
        "click #round-trip": "setRoundTripRepeat"
    },

    setOneWayRepeat: function(e) {

        $("#return-date-user").parent("div").hide();
    
    },

    setRoundTripRepeat: function(e) {

        $("#return-date-user").parent("div").show();

    },

    submitForm: function(e) {

        var $form = this.$el.find("form"),
            parameters = $form.serializeArray(),
            query = App.Models.Query.fromSerializedArray(parameters);

        this.trigger("validation", query.validate());

        if (query.isValid(true)) {

            var collection = app.searchResults;
            collection.setQuery(query).fetch({ success: function() {
                collection.trigger("change");
            }});
            collection.trigger("fetch");

            this.updateFilterFields();

            app.router.navigate("search", { trigger: true });

        }

        e.preventDefault();

    },

    updateFilterFields: function() {

        _.forEach($("input[data-from]"), function(input) {
            var $input = $(input),
                value = $("#" + $input.data("from")).val();
            $input.val(value);
         });

    },

    resetValidation: function(e) {

        var $input = $(e.target);
        $input.removeClass("invalid");

    },

    updateErrors: function(errors) {

        var $form = this.$el.find("form");

        $form.find("input").each(function() {
            var name = $(this).attr("name");

            if (errors && errors[name]) {
                $(this).add($("[data-bind=" + name + "]"))
                    .addClass("invalid");
            } else {
                $(this).removeClass("invalid");
            }
        });

    },

    render: function() {
        
        this.$el.html(this.template());

    }

});

App.Views.FlightView = Backbone.View.extend({

    render: function() {
        // this.$el.html(this.model.get("name"))
        // this.$el.html(Handlebars.render(this.template, { name: "Flight #1234" }));
        return this;
    }

});

App.Views.BuyFormView = Backbone.View.extend({
    
    events: {
        "click button": "submitForm",
        "change input": "validateForm" 
    },
    
    submitForm: function(e) {
        var flight = app.searchResults.getFlightById(app.info.get("flightId"));
        
        var data = $("#buy-form").serializeArray();


        _.forEach(data, function(input) {
            $("#confirm-" + input.name).html(input.value);
        });

        app.router.navigate("confirm", { trigger: true });
        e.preventDefault();
    },

    validateForm: function() {
    
    }
    
});

App.Views.SearchResultsView = Backbone.View.extend({

    events: {
        "change #sort": "changeSort",
        "click .page": "changePage",
        "click .fancybox": "loadMaps"
    },

    filterRenderers: {
        "airline": "renderAirlineFilter",
        "stopover": "renderStopoverFilter",
        "price": "renderPriceFilter"
    },

    initialize: function(options) {
        this.template = options.template;

        var view = this;
        this.collection.on("change", function() {
            view.render();
        });
        this.collection.on("error", function(error) {
            view.showError(error);
        });
        this.collection.on("fetch", function() {
            view.showLoadingMessage();
        });
    },

    loadMaps: function(e) {

        var getAirport = function(travel) {
            return API.Geo.getAirportById ({ id: travel.airportId });
        };     

        var getMarker = function (jqxhr) {
            var airportPosition = new google.maps.LatLng(jqxhr[0].airport.latitude, jqxhr[0].airport.longitude);
            return new google.maps.Marker({
                position: airportPosition,
                title: jqxhr[0].airport.description
            });

        };     

        var generateOptions = function(zoom, center) {
            return {
                zoom: zoom,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        }  
               
        var $link = $(e.target);
        var myFlightId = $link.data("flightid");
        var myId = $link.data("id");

        var bound = $link.data("bound");

        var flight = app.searchResults.getFlightById(myFlightId);

        var route = _.find(flight.get(bound + "Routes"), function(route){
            return route.id == myId; 
        });

        var myOptions = generateOptions(4, new google.maps.LatLng(0,0));

        var el = document.getElementById("map-canvas-" + bound + "-" + myId)
        var map = new google.maps.Map(el, myOptions);


        _.forEach(route.segments, function(segment){

            $.when(getAirport(segment.departure), 
                   getAirport(segment.arrival)).done( function (arg1, arg2) {

                        marker1 = getMarker(arg1);
                        marker2 = getMarker(arg2);

                        var flightPath = new google.maps.Polyline({
                            path: [ marker1.position, marker2.position ],
                            strokeColor: "#FF0000",
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });

                        marker1.setMap(map);
                        marker2.setMap(map);

                        flightPath.setMap(map);

                        if (segment == route.segments[0]) {
                            map.setCenter(marker1.position);
                        }

                   });
        });
    },

    getContext: function() {
        return {
            flights:    this.collection.toJSON(),
            pagination: this.collection.pagination,
            filters:    this.collection.filters,
            metadata:   this.collection.metadata
        };
    },

    showError: function(error) {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(app.templates["search-error"](error));
    },

    showLoadingMessage: function() {
        var $wrap = this.$el.find(".search-wrap");
        $wrap.html(app.templates["search-loading"]());
    },

    render: function() {
        var $wrap;

        if (this.collection.length > 0) {

            $wrap = this.$el.find(".search-wrap");
            $wrap.html(this.template(this.getContext()));
            this.renderFilters();

        }

        return this;
    },

    changeSort: function(e) {
        var $select = $(e.target),
            value = $select.val().split(" "),
            sort_key = value[0],
            sort_order = value[1];

        this.collection.sort(sort_key, sort_order);
    },

    changePage: function(e) {
        var page = $(this).data("page");
        this.collection.query.set("page", page);
        this.collection.fetch();
    },

    renderFilters: function() {
        var filter,
            $el = this.$el.find(".dynamic-filters");

        $el.html(null);

        var that = this;
        _.each(this.collection.filters, function(filter) {
            var func = that.filterRenderers[filter.key];
            that[func]($el, filter);
        });
    },

    renderAirlineFilter: function($el, filter) {
        if (filter.values.length > 1) {
            var template = app.templates["filter-airline"];
            $el.append(template({ airlines: filter.values }));
        }
    },

    renderPriceFilter: function($el, filter) {
        if (filter.min && filter.max && filter.min !== filter.max) {
            var template = app.templates["filter-price"];
            $el.append(template({ max: filter.max, min: filter.min }));
        }
        Widgets.init();
    },

    renderStopoverFilter: function($el, filter) {
        if (filter.value.length > 1) {
            var template = app.templates["filter-stopovers"];
            $el.append(template({ stopovers: filter.values }));
        }
    }

});

App.Views.NewsletterView = Backbone.View.extend({

    initialize: function() {

        this.subscribed = false; 

        var view = this;
        this.on("change", function() {
            view.render();
        });

    },

    events: {
        "click button" : "subscribe"
    },

    subscribe: function(e) {

        var form = this.$el.find("form"),
            input = form.find("input[name=email]"),
            email = input.val();
        
        if (email !== "") {
            // @TODO: validate email using a simple regex (do not try an
            // exhaustive validation. It's a slippery slope from there.
            console.log("Subscribing " + email + " to the newsletter");
            this.subscribed = true;
            this.trigger("change");
        } else {
            input.trigger("focus");
        }

        e.preventDefault();

    },

    render: function() {

        if (!this.subscribed) {
            this.$el.html(app.templates["newsletter-subscribe"]);
        } else {
            this.$el.html(app.templates["newsletter-thanks"]);
        }

    }

});
