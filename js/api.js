(function($) {

    var BASE_URL = "http://eiffel.itba.edu.ar/hci/service2/";

    var call = function(service, data, callback, options) {
        var url = BASE_URL + service + ".groovy";

        options = options || {};

        options.url      = options.url || url;
        options.data     = options.data || data;
        options.dataType = options.dataType || "jsonp";
        options.success   = options.success || callback;

        $.ajax(options);
    };

    var API = {};

    API.Misc = {
        
        getLanguages: function(callback) {
            call("Misc", { method: "GetLanguages" }, callback);
        },

        getCurrencies: function(callback, options) {
            var data = options || {};
            data.method = "GetCurrencies";
            call("Misc", data, callback);
        },

        getCurrencyById: function(id, callback) {
            call("Misc", { method: "GetCurrencyById", id: id }, callback);
        },

        getCurrenciesRatio: function(id1, id2, callback) {
            call("Misc", { method: "GetCurrenciesRatio", id1: id1, id2: id2 }, callback);
        },

        getAirlines: function(callback, options) {
            var data = options || {};
            data.method = "GetAirlines";
            call("Misc", data, callback);
        },

        getAirlineById: function(id, callback) {
            call("Misc", { method: "GetAirlineById", id: id }, callback);
        },

        getAirlinesByName: function(name, callback) {
            call("Misc", { method: "GetAirlinesByName", name: name }, callback);
        }
    
    };

    API.Geo = {

        getCountryById: function(id, callback) {
            call("Geo", { method: "GetCountryById", id: id }, callback);
        },

        getCountries: function(callback, options) {
            var data = options || {};
            data.method = "GetCountries";
            call("Geo", data, callback);
        },

        getCities: function(callback, options) {
            var data = options || {};
            data.method = "GetCities";
            call("Geo", data, callback);
        },

        getCityById: function(id, callback) {
            call("Geo", { method: "GetCityById", id: id }, callback);
        },

        getCitiesByName: function(name, callback) {
            call("Geo", { method: "GetCitiesByName", name: name }, callback);
        },

        getCitiesByPosition: function(lat, lng, callback, options) {
            var data = options || {};
            data.method = "GetCitiesByPosition";
            data.latitude = lat;
            data.longitude = lng;
            call("Geo", data, callback);
        },

        getAirports: function(callback, options) {
            var data = options || {};
            data.method = "GetAirports";
            call("Geo", data, callback);
        },

        getAirportById: function(id, callback) {
            call("Geo", { method: "GetAirportById", id: id }, callback);
        },

        getAirportsByName: function(name, callback) {
            call("Geo", { method: "GetAirportsByName", name: name }, callback);
        },

        getAirportsByPosition: function(lat, lng, callback, options) {
            var data = options || {};
            data.method = "GetAirportsByPosition";
            data.latitude = lat;
            data.longitude = lng;
            call("Geo", data, callback);
        },

        getCitiesAndAirportsByName: function(name, callback) {
            call("Geo", { method: "GetCitiesAndAirportsByName", name: name },
                    callback);
        }

    };

    API.Booking = {

        validateCreditCard: function(number, exp_date, sec_code, callback) {
            call("Booking", { method: "ValidateCreditCard", number: number,
                exp_date: exp_date, sec_code: sec_code }, callback);
        },

        getOneWayFlights: function(data, callback) {
            data.method = "GetOneWayFlights";
            call("Booking", data, callback);
        },

        bookFlight: function(data, callback) {
            data.method = "BookFlight";
            call("Booking", data, callback, { type: "POST" });
        }

    };

    API.Review = {

        getAirlineReviews: function(callback, options) {
            var data = options || {};
            data.method = "GetAirlineReviews";
            call("Review", data, callback);
        },

        reviewAirline: function(data, callback) {
            data.method = "ReviewAirline";
            call("Review", data, callback, { type: "POST" });
        }

    };

    window.API = API;

})(jQuery);
