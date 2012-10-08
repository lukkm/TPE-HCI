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
