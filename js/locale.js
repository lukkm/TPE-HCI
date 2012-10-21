var i18n = (function() {

    var language = "en";

    var locales = {
        "en": {
            "about"                       : "About",
            "adults"                      : "Adults",
            "airline_asc"                 : "Airline - A to Z",
            "airline_desc"                : "Airline - Z to A",
            "airlines"                    : "Airlines",
            "arrives"                     : "Arrives",
            "arrives_to"                  : "Arrives to",
            "charges"                     : "Charges",
            "children"                    : "Children",
            "depart_label"                : "Depart",
            "departs"                     : "Departs",
            "departs_from"                : "Departs from",
            "duration"                    : "Duration",
            "duration_asc"                : "Duration - Shorter",
            "duration_desc"               : "Duration - Longer",
            "fare"                        : "Fare",
            "fare_asc"                    : "Fare - Low to High",
            "fare_desc"                   : "Fare - High to Low",
            "feedback"                    : "Feedback",
            "filter_results"              : "Filter Results",
            "flight"                      : "Flight",
            "flight_class"                : "Class",
            "flights_found"               : "{{total}} flights found",
            "from_label"                  : "From",
            "help"                        : "Help",
            "home"                        : "Home",
            "infants"                     : "Infants",
            "newsletter_subscribe_button" : "Subscribe",
            "newsletter_subscribe_label"  : "Subscribe to our newsletter:",
            "newsletter_thanks"           : "Thanks for subscribing to our newsletter.",
            "number_adults"               : "Number of adults",
            "number_children"             : "Number of children",
            "number_children_hint"        : "(2-11 years)",
            "number_infants"              : "Number of infants",
            "number_infants_hint"         : "(0-2 years)",
            "one_way"                     : "One Way",
            "price"                       : "Price",
            "privacy"                     : "Privacy",
            "return_label"                : "Return",
            "round_trip"                  : "Round Trip",
            "search_button"               : "Search",
            "search_error"                : "Search Error",
            "search_form_title"           : "Search flights",
            "searching_message"           : "Searching...",
            "select_button"               : "Select",
            "sort_label"                  : "Sort by",
            "stopovers"                   : "Paradas",
            "stopovers_asc"               : "Stops - Less",
            "stopovers_desc"              : "Stops - More",
            "taxes"                       : "Taxes",
            "to_label"                    : "To",
            "total"                       : "Total",
            "total_asc"                   : "Total - Low to High",
            "total_desc"                  : "Total - Hight to Low",
            "total_duration"              : "Total duration"
        },
        "es": {
            "about"                       : "Acerca de",
            "adults"                      : "Adultos",
            "airline_asc"                 : "Aerolínea - Ascendiente",
            "airline_desc"                : "Aerolínea - Descendiente",
            "airlines"                    : "Aerolíneas",
            "arrives"                     : "Llega",
            "arrives_to"                  : "Llega a",
            "charges"                     : "Tasas",
            "children"                    : "Niños",
            "depart_label"                : "Partida",
            "departs"                     : "Sale",
            "departs_from"                : "Sale de",
            "duration"                    : "Duración",
            "duration_asc"                : "Duración - Menor",
            "duration_desc"               : "Duración - Mayor",
            "fare"                        : "Tarifa",
            "fare_asc"                    : "Tarifa - Menor a mayor",
            "fare_desc"                   : "Tarifa - Mayor a menor",
            "feedback"                    : "Feedback",
            "filter_results"              : "Filtrar resultados",
            "flight"                      : "Vuelo",
            "flight_class"                : "Clase",
            "flights_found"               : "{{total}} vuelos encontrados",
            "from_label"                  : "Desde",
            "help"                        : "Ayuda",
            "home"                        : "Inicio",
            "infants"                     : "Infantes",
            "newsletter_subscribe_button" : "Suscribirme",
            "newsletter_subscribe_label"  : "Suscríbete al newsletter:",
            "newsletter_thanks"           : "Gracias por suscribirte a nuestro newsletter.",
            "number_adults"               : "Número de adultos",
            "number_children"             : "Número de niños",
            "number_children_hint"        : "(2-11 años)",
            "number_infants"              : "Número de infantes",
            "number_infants_hint"         : "(0-2 años)",
            "one_way"                     : "Sólo ida",
            "price"                       : "Precio",
            "privacy"                     : "Política de privacidad",
            "return_label"                : "Regreso",
            "round_trip"                  : "Ida y vuelta",
            "search_button"               : "Buscar",
            "search_error"                : "Error en la búsqueda",
            "search_form_title"           : "Buscar Vuelos",
            "searching_message"           : "Buscando...",
            "select_button"               : "Comprar",
            "sort_label"                  : "Ordenar por",
            "stopovers"                   : "Paradas",
            "stopovers_asc"               : "Paradas - Menos",
            "stopovers_desc"              : "Paradas - Más",
            "taxes"                       : "Impuestos",
            "to_label"                    : "Hasta",
            "total"                       : "Total",
            "total_asc"                   : "Total - Menor a mayor",
            "total_desc"                  : "Total - Mayor a menor",
            "total_duration"              : "Duración total"
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
