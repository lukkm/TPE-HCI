$(function() {

    $("#search-form").on("click", "button", function() {
        var data = $(this).parents("form").serializeArray();
        app.router.navigate("search", { trigger: true });
        return false;
    });
	
	$("#buy-form").on("click", "button", function() {
        var data = $(this).parents("form").serializeArray();
        app.router.navigate("confirm", { trigger: true });
        return false;
    });

    Widgets.init();

    App.init();

});
