var i18n = (function() {

    var language = "en";

    var locales = {
        "en": {
            "search_form_title"           : "Search flights",
            "from_label"                  : "From",
            "to_label"                    : "To",
            "depart_label"                : "Depart",
            "return_label"                : "Return",
            "sort_label"                  : "Sort by",
            "flights_found"               : "{{total}} flights found",
            "total_asc"                   : "Total - Low to High",
            "total_desc"                  : "Total - Hight to Low",
            "airline_asc"                 : "Airline - A to Z",
            "airline_desc"                : "Airline - Z to A",
            "duration_asc"                : "Duration - Shorter",
            "duration_desc"               : "Duration - Longer",
            "fare_asc"                    : "Fare - Low to High",
            "fare_desc"                   : "Fare - High to Low",
            "stopovers_asc"               : "Stops - Less",
            "stopovers_desc"              : "Stops - More",
            "searching_message"           : "Searching...",
            "select_button"               : "Select",
            "airlines"                    : "Airlines",
            "stopovers"                   : "Paradas",
            "price"                       : "Price",
            "departs"                     : "Departs",
            "returns"                     : "Returns",
            "adults"                      : "Adults",
            "total"                       : "Total",
            "charges"                     : "Charges",
            "fare"                        : "Fare",
            "taxes"                       : "Taxes",
            "children"                    : "Children",
            "infants"                     : "Infants",
            "duration"                    : "Duration",
            "flight"                      : "Flight",
            "flight_class"                : "Class",
            "departs_from"                : "Departs from",
            "arrives_to"                  : "Arrives to",
            "total_duration"              : "Total duration",
            "newsletter_subscribe_button" : "Subscribe",
            "newsletter_subscribe_label"  : "Subscribe to our newsletter:",
            "newsletter_thanks"           : "Thanks for subscribing to our newsletter.",
            "home"                        : "Home",
            "about"                       : "About",
            "privacy"                     : "Privacy",
            "feedback"                    : "Feedback",
            "help"                        : "Help",
            "one_way"                     : "One Way",
            "round_trip"                  : "Round Trip",
            "number_adults"               : "Number of adults",
            "number_children"             : "Number of children",
            "number_children_hint"        : "(2-11 years)",
            "number_infants"              : "Number of infants",
            "number_infants_hint"         : "(0-2 years)",
            "search_button"               : "Search",
            "filter_results"              : "Filter Results"
        },
        "es": {
            "search_form_title"           : "Buscar Vuelos",
            "from_label"                  : "Desde",
            "to_label"                    : "Hasta",
            "depart_label"                : "Partida",
            "return_label"                : "Regreso",
            "flights_found"               : "{{total}} vuelos encontrados",
            "sort_label"                  : "Ordenar por",
            "total_asc"                   : "Total - Menor a mayor",
            "total_desc"                  : "Total - Mayor a menor",
            "airline_asc"                 : "Aerolínea - Ascendiente",
            "airline_desc"                : "Aerolínea - Descendiente",
            "duration_asc"                : "Duración - Menor",
            "duration_desc"               : "Duración - Mayor",
            "fare_asc"                    : "Tarifa - Menor a mayor",
            "fare_desc"                   : "Tarifa - Mayor a menor",
            "stopovers_asc"               : "Paradas - Menos",
            "stopovers_desc"              : "Paradas - Más",
            "searching_message"           : "Buscando...",
            "select_button"               : "Comprar",
            "airlines"                    : "Aerolíneas",
            "stopovers"                   : "Paradas",
            "price"                       : "Precio",
            "departs"                     : "Sale",
            "returns"                     : "Regresa",
            "adults"                      : "Adultos",
            "total"                       : "Total",
            "charges"                     : "Tasas",
            "fare"                        : "Tarifa",
            "taxes"                       : "Impuestos",
            "children"                    : "Niños",
            "infants"                     : "Infantes",
            "duration"                    : "Duración",
            "flight"                      : "Vuelo",
            "flight_class"                : "Clase",
            "departs_from"                : "Sale de",
            "arrives_to"                  : "Llega a",
            "total_duration"              : "Duración total",
            "newsletter_subscribe_button" : "Suscribirme",
            "newsletter_subscribe_label"  : "Suscríbete al newsletter:",
            "newsletter_thanks"           : "Gracias por suscribirte a nuestro newsletter.",
            "home"                        : "Inicio",
            "about"                       : "Acerca de",
            "privacy"                     : "Política de privacidad",
            "feedback"                    : "Feedback",
            "help"                        : "Ayuda",
            "one_way"                     : "Sólo ida",
            "round_trip"                  : "Ida y vuelta",
            "number_adults"               : "Número de adultos",
            "number_children"             : "Número de niños",
            "number_children_hint"        : "(2-11 años)",
            "number_infants"              : "Número de infantes",
            "number_infants_hint"         : "(0-2 años)",
            "search_button"               : "Buscar",
            "filter_results"              : "Filtrar resultados"
        }
    };

    return {

        init: function() {
            var storedLanguage = localStorage.getItem("lang");
            if (storedLanguage) {
                language = storedLanguage;
            } else {
                localStorage.setItem("lang", language);
            }
        },

        setLanguage: function(newLanguage) {
            language = newLanguage;
            localStorage.setItem("lang", language);
        },

        getLanguage: function() {
            return language;
        },

        translate: function(key) {
            return locales[language][key];
        }

    };

})();
