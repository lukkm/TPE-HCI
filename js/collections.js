window.App = window.App || {};
App.Collections = App.Collections || {};

App.Collections.SearchResults = Backbone.Collection.extend({

    initialize: function() {
        this.query = null;
    },

    hasQuery: function() {
        return this.query !== null;
    },

    sync: function(method, collection, options) {
        var data, jqxhr;

        if (method !== "read") {
            throw "Attempt to modify read only collection";
        }

        data = collection.query.toJSON();

        if (data.repeat === "one-way") {
            jqxhr = API.Booking.getOneWayFlights(data, options);
        } else if (data.repeat === "round-trip") {
            jqxhr = API.Booking.getRoundTripFlights(data, options);
        } else {
            throw "Invalid repeat value";
        }
        return jqxhr;
    },

    sort: function(sort_key, sort_order) {
        sort_order = sort_order || 'asc';

        this.query.set("sort_key", sort_key);
        this.query.set("sort_order", sort_order);

        // @TODO: validate query model
        var that = this;
        this.fetch({ success: function() {
            that.trigger("change");
        } });
    },

    parse: function(response) {
        // @TODO: see if there is a cleaner way to handle errors
        if (response.error) {
            this.trigger("error", response.error);
            return [];
        }

        this.metadata = {
            currencyId: response.currencyId
        };
        this.filters = response.filters;
        this.pagination = {
            page:     response.page,
            pageSize: response.pageSize,
            total:    response.total,
            pages:    Math.ceil(response.total / response.pageSize),
            hasPages: Math.ceil(response.total / response.pageSize) > 1
        };

        this.extractRoutes(response);

        return response.flights;
    },

    getFlightById: function(id) {
        var flight = this.find(function(model) {
            return model.get("flightId") == id;
        });
        return flight;
    },

    extractRoutes: function(response) {

        var setRoutes = function(route) {
            route.departure = route.segments[0].departure;
            route.arrival = route.segments[route.segments.length - 1].arrival;

            var flightLength = route.segments.length;

            route.stopovers = (flightLength == 1) ? "Direct" : (flightLength-1) + " stopover";

            if (flightLength > 2) {
                route.stopovers += "s";
            }
        };

        var setSegment = function(segment){
            var dateToMoment = moment(segment.departure.date, "YYYY-MM-DD hh:mm:ss");
            segment.departure.formatedDate = dateToMoment.format("MMMM Do YYYY");
            segment.departure.formatedTime = dateToMoment.format("h:mm a"); 
            dateToMoment = moment(segment.arrival.date, "YYYY-MM-DD hh:mm:ss");
            segment.arrival.formatedDate = dateToMoment.format("MMMM Do YYYY");
            segment.arrival.formatedTime = dateToMoment.format("h:mm a"); 
            var filters = getAirlineFilters();
            segment.airlineLogo = getAirlineLogo(filters, segment.airlineId);
        };

        var setSegments = function(route){
            _.forEach(route.segments, setSegment);
            route.id = _.uniqueId();
        };

        var setOneWayRoutes = function(flight, routes) { 

            flight.flightId = _.uniqueId();

            _.forEach(routes, setRoutes);
            _.forEach(routes, setSegments);

            flight.departure = routes[0].departure;
            flight.arrival = routes[0].arrival;
            flight.departureDateToMoment = moment(flight.departure.date, "YYYY-MM-DD hh:mm:ss");
            flight.arrivalDateToMoment = moment(flight.arrival.date, "YYYY-MM-DD hh:mm:ss");
            flight.departure.time = flight.departureDateToMoment.format("h:mm a");
            flight.arrival.time = flight.arrivalDateToMoment.format("h:mm a");
        };

        var getAirlineFilters = function() { 
            var $content = response.filters;
            var ans;
            _.forEach($content, function(filter){
                if (filter.key == "airline"){
                    ans = filter;
                }
            });
            return ans;
        };

        var getAirlineLogo = function(airlineFilters, airlineId){
            var ans;
            _.forEach(airlineFilters.values, function(filter){
                if (filter.id = airlineId){
                    ans = filter.logo;
                }
            });
            return ans;
        }

        _.forEach(response.flights, function(flight) {
            if (typeof flight.outboundRoutes !== 'undefined') {
                setOneWayRoutes(flight, flight.outboundRoutes);
                flight.outboundDate = flight.departureDateToMoment.format("MMMM Do YYYY");
            }
            if (typeof flight.inboundRoutes !== 'undefined') {
                setOneWayRoutes(flight, flight.inboundRoutes);
                flight.inboundDate = flight.departureDateToMoment.format("MMMM Do YYYY");
            }

        });
    },

    setQuery: function(query) {
        this.query = query;
        return this;
    }

});
