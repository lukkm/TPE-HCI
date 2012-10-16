$(function() {

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

    App.init();

    Widgets.init();

    // test
    // app.flightList.fetch({ success: function() { app.searchResultsView.render(); } })

    $("#flight-type").on("click", "input", function(e) {

        var returnInput = $("#return-date").parent("div");

        if (this.id === "round-trip") {
            returnInput.show();
        } else if (this.id === "one-way") {
            returnInput.hide();
        }

    });

});

// convenient wrapper for debugging purposes
var log = function(d) { console.log(d); };
