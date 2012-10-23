window.App = window.App || {};
App.Models = App.Models || {};

// add validation support to all models
_.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

App.Models.Flight = Backbone.Model.extend();

App.Models.Query = Backbone.Model.extend({

    validation: {
        from: { required: true,
                msg: i18n.translate("translate_depart")},
        to: { required: true,
                msg: "We need to know where you are going"},
        repeat: { oneOf: ["one-way", "round-trip"] },
        dep_date: function(value) {
            try {
                // @TODO: Add one or two days before its valid
                var departureDate = new Date(value),
                    valid = departureDate >= Date.now();

                if (valid) { return; }
            } catch(e) {}

            return "Invalid departure date";
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


App.Models.Buy = Backbone.Model.extend({

    cardValidate: function(value, key, form) {
		try {
			var data = {},
				opt = {};
			data.number = form.card_number;
			data.exp_date = form.card_expire_date;
			data.sec_code = card_security_code;

			var	valid = API.Booking.validateCreditCard(data, opt);

			if (valid) { return; }
		} catch(e) {}

		return "Check the credit card information";
    },

	validation: {
		first_name: { required: true,
                        msg: i18n.translate("complete_name")},
        last_name: { required: true,
                    msg: "Complete your last name"},
        birth_date: { required: true },
        card_number: function() { this.cardValidate(arguments) },
        card_expire_date: this.cardValidate,
        card_security_code: this.cardValidate,
        card_holder: { required: true,
						msg: "Card holder is required"},
        card_document_number:[{ required: true, msg: "The document number is required" },
                                { pattern: 'number',
								msg: "The document number of the card holder has to be numerical"}],
        email: [{
				required: true,
				msg: "Please enter an email address"
			},{
			  pattern: 'email',
			  msg: "Please enter a valid email"
		}],
        phone_number:
        {
			required: true,
			pattern:  /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
            msg: "The phone number should have only numbers"
		},
        email_confirm: [{
				required: true,
				msg: "Please enter an email address"
			},{
			  equalTo: 'email',
			  msg: "The email address has to be the same"
		}],
        terms: { acceptance: true },
	}
});

App.Models.Buy.fromSerializedArray = function(serializedArray) {
    var attributes = {};
    _.each(serializedArray, function(input) {
        attributes[input.name] = input.value;
    });

    return new App.Models.Buy(attributes, { parse: true });
};

App.Models.Query.fromSerializedArray = function(serializedArray) {
    var attributes = {};
    _.each(serializedArray, function(input) {
        attributes[input.name] = input.value;
    });

    attributes = _.omit(attributes, ["from-user", "to-user",
            "departure-date-user", "return-date-user" ]);

    return new App.Models.Query(attributes, { parse: true });
};
