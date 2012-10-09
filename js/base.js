$(function() {

    $("#search-form").on("click", "button", function() {
        var data = $(this).parents("form").serializeArray();
        app.router.navigate("search", { trigger: true });
        return false;
    });

	$("#buy-form").on("click", "button", function() {

        var flight = app.flightList.get(app.information.get("flightId"));

        /* $("#confirm-flight-from-airport").html(flight.parameters.fromAirportName);*/

        var data = $(this).parents("form").serializeArray();

        _.forEach(data, function(input) {
            $("#confirm-" + input.name).html(input.value);
        });

        app.router.navigate("confirm", { trigger: true });
        return false;
    });

    $("form").on("change", "input", function(e) {
        var val = $(this).val(),
            param = $(this).data("validate");
        
        var ans = validate(param, val);
        if (!ans.isValid) {
            $(this).addClass("invalid");
            $(this).qtip({
                content: ans.message,
                position: 'right',
                style: {tip: 'rightMiddle'}
            });
        } else {
            $(this).removeClass("invalid");
        }

    });

    var validate = function(param, val) {

        var res = {};
        res.isValid = true;

        if (param === 'required') {
            if (val == ""){
                res.message = "This field is required";
                res.isValid = false;
            } else {
                res.isValid = true;
            }
        } else if (param == 'card-number' || param == 'card-expire-date') {

            cardNumber = $("#buy-form").find("[name=card-number]");
            expDate = $("#buy-form").find("[name=card-expire-date]");

            if (cardNumber !== "" && expDate !== "" 
//                !FlightsApi.validateCreditCard(cardNumber, expDate)) 
                ){
                    res.message = "Check the credit card information";
                    res.isValid = false;
                } else {
                    res.isValid = true;
                }
        }
        return res;
    }

    Widgets.init();

    App.init();

    $("#flight-type").on("click", "input", function(e) {

        var returnInput = $("#return-date").parent("div");

        if (this.id === "round-trip") {
            returnInput.show();
        } else if (this.id === "one-way") {
            returnInput.hide();
        }

    });

});
