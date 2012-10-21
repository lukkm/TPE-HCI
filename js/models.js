window.App = window.App || {};
App.Models = App.Models || {};

// add validation support to all models
_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

App.Models.Flight = Backbone.Model.extend();

App.Models.Query = Backbone.Model.extend({

    validation: {
        from: { required: true },
        to: { required: true },
        repeat: { oneOf: ["one-way", "round-trip"] },
        dep_date: function(value) {
            try {
                // @TODO: Add one or two days before its valid
                var departureDate = new Date(value),
                    valid = departureDate >= Date.now();

                if (valid) { return; }
            } catch(e) {}

            return "Invalid return date";
        },
        ret_date: function(value, key, form) {
            try {
                var returnDate = new Date(value),
                    departureDate = new Date(form.dep_date);
                    valid = form.repeat === "one-way" ||
                            returnDate >= departureDate;

                if (valid) { return; }
            } catch(e) {}

            return "Invalid return date";
        }
    }

});

App.Models.Query.fromSerializedArray = function(serializedArray) {
    var attributes = {};
    _.each(serializedArray, function(input) {
        attributes[input.name] = input.value;
    });

    attributes = _.omit(attributes, ["from-user", "to-user",
            "departure-date-user", "return-date-user" ]);

    return new App.Models.Query(attributes, { parse: true });
};
