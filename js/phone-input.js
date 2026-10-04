$(document).ready(function () {

    let countries = [];
    let selectedCountry = null;

    $.getJSON("data/countries.json")
        .done(function (data) {

            countries = Array.isArray(data) ? data : [];

            if (!countries.length) {
                console.error("Country data is empty.");
                return;
            }

            geoIpLookup(function (countryCode) {

                countryCode = (countryCode || "").toUpperCase();

                selectedCountry = countries.find(function (country) {

                    return (
                        country.iso2 &&
                        country.iso2.toUpperCase() === countryCode
                    );

                });

                if (!selectedCountry) {

                    selectedCountry = countries.find(function (country) {

                        return (
                            country.iso2 &&
                            country.iso2.toUpperCase() === "IN"
                        );

                    }) || countries[0];

                }

                updateSelectedCountry();
                renderCountries();

            });

        })
        .fail(function (xhr, status, error) {

            console.error(
                "Unable to load countries.json:",
                error
            );

        });


    function geoIpLookup(success) {

        $.get(
            "https://ipinfo.io",
            function () {},
            "jsonp"
        )
        .always(function (resp) {

            let countryCode = "";

            if (
                resp &&
                resp.country
            ) {

                countryCode =
                    String(resp.country).toUpperCase();

            }

            success(countryCode);

        });

    }


    function updateSelectedCountry() {

        if (!selectedCountry) {
            return;
        }

        $("#selectedFlag").attr({
            src: selectedCountry.flag,
            alt: selectedCountry.name
        });

        $("#selectedCode")
            .text(selectedCountry.code);

        $("#countryName")
            .val(selectedCountry.name);

        $("#countryCode")
            .val(selectedCountry.code);

        $("#countryIso")
            .val(selectedCountry.iso2 || "");

        $("#phoneNumber")
            .attr(
                "placeholder",
                "Enter mobile number"
            );

    }


    function renderCountries(search) {

        const list =
            $("#countryList");

        list.empty();

        const keyword =
            String(search || "")
                .trim()
                .toLowerCase();

        const filteredCountries =
            countries.filter(function (country) {

                const countryName =
                    String(country.name || "")
                        .toLowerCase();

                const countryCode =
                    String(country.code || "")
                        .toLowerCase();

                const isoCode =
                    String(country.iso2 || "")
                        .toLowerCase();

                return (
                    countryName.includes(keyword) ||
                    countryCode.includes(keyword) ||
                    isoCode.includes(keyword)
                );

            });


        if (!filteredCountries.length) {

            list.html(`
                <div class="no-country">
                    <i class="bi bi-search"></i>
                    <div>No country found</div>
                </div>
            `);

            return;
        }


        filteredCountries.forEach(function (country) {

            const selectedClass =
                selectedCountry &&
                selectedCountry.iso2 &&
                country.iso2 &&
                selectedCountry.iso2.toUpperCase() ===
                country.iso2.toUpperCase()
                    ? "selected"
                    : "";


            list.append(`

                <button
                    type="button"
                    class="country-item ${selectedClass}"
                    data-country="${country.iso2}"
                >

                    <span class="item-flag">

                    <img
    src="${country.flag}"
    alt="${country.name}"
    loading="lazy"
    onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f310.svg';"
>

                    </span>

                    <span class="item-name">
                        ${country.name}
                    </span>

                    <span class="item-code">
                        ${country.code}
                    </span>

                </button>

            `);

        });

    }


    $("#countryButton").on(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            $("#countryDropdown")
                .toggleClass("show");

            $("#countryButton")
                .toggleClass(
                    "active",
                    $("#countryDropdown").hasClass("show")
                );


            if (
                $("#countryDropdown").hasClass("show")
            ) {

                $("#countrySearch")
                    .val("")
                    .focus();

                renderCountries();

            }

        }
    );


    $(document).on(
        "click",
        ".country-item",
        function (event) {

            event.preventDefault();

            const isoCode =
                String(
                    $(this).data("country") || ""
                ).toUpperCase();


            const country =
                countries.find(function (item) {

                    return (
                        item.iso2 &&
                        item.iso2.toUpperCase() ===
                        isoCode
                    );

                });


            if (!country) {
                return;
            }


            selectedCountry = country;

            updateSelectedCountry();

            $("#countryDropdown")
                .removeClass("show");

            $("#countryButton")
                .removeClass("active");

            $("#phoneNumber")
                .val("");

            $("#phoneError")
                .removeClass("show")
                .text("");

            $("#phoneSuccess")
                .removeClass("show")
                .text("");

            $("#resultBox")
                .hide();

            renderCountries();

        }
    );


    $("#countrySearch").on(
        "input",
        function () {

            renderCountries(
                $(this).val()
            );

        }
    );


    $(document).on(
        "click",
        function (event) {

            if (
                !$(event.target)
                    .closest(".custom-phone")
                    .length
            ) {

                $("#countryDropdown")
                    .removeClass("show");

                $("#countryButton")
                    .removeClass("active");

            }

        }
    );


    $("#phoneNumber").on(
        "input",
        function () {

            let value =
                $(this)
                    .val()
                    .replace(/\D/g, "");


            if (
                selectedCountry &&
                selectedCountry.max
            ) {

                const maxLength =
                    parseInt(
                        selectedCountry.max,
                        10
                    );


                if (
                    !isNaN(maxLength) &&
                    value.length > maxLength
                ) {

                    value =
                        value.substring(
                            0,
                            maxLength
                        );

                }

            }


            $(this).val(value);

            $("#phoneError")
                .removeClass("show")
                .text("");

            $("#phoneSuccess")
                .removeClass("show")
                .text("");

            $("#resultBox")
                .hide();

        }
    );


    $("#phoneForm").on(
        "submit",
        function (event) {

            event.preventDefault();


            if (!selectedCountry) {

                $("#phoneError")
                    .text(
                        "Please select a country."
                    )
                    .addClass("show");

                return;

            }


            const phone =
                $("#phoneNumber")
                    .val()
                    .trim();


            if (!phone) {

                $("#phoneError")
                    .text(
                        "Please enter your phone number."
                    )
                    .addClass("show");

                $("#phoneSuccess")
                    .removeClass("show");

                $("#phoneNumber")
                    .focus();

                return;

            }


            const phoneLength =
                phone.length;

            const minLength =
                parseInt(
                    selectedCountry.min,
                    10
                );

            const maxLength =
                parseInt(
                    selectedCountry.max,
                    10
                );


            if (
                !isNaN(minLength) &&
                phoneLength < minLength
            ) {

                $("#phoneError")
                    .text(
                        "Please enter a valid " +
                        selectedCountry.name +
                        " phone number."
                    )
                    .addClass("show");

                $("#phoneSuccess")
                    .removeClass("show");

                return;

            }


            if (
                !isNaN(maxLength) &&
                phoneLength > maxLength
            ) {

                $("#phoneError")
                    .text(
                        "Please enter a valid " +
                        selectedCountry.name +
                        " phone number."
                    )
                    .addClass("show");

                $("#phoneSuccess")
                    .removeClass("show");

                return;

            }


            const fullPhone =
                selectedCountry.code +
                phone;


            $("#hiddenPhone")
                .val(phone);

            $("#fullPhone")
                .val(fullPhone);

            $("#phoneError")
                .removeClass("show")
                .text("");

            $("#phoneSuccess")
                .text(
                    "Phone number is valid."
                )
                .addClass("show");


            $("#resultCountry")
                .text(
                    selectedCountry.name
                );

            $("#resultCode")
                .text(
                    selectedCountry.code
                );

            $("#resultPhone")
                .text(phone);

            $("#resultFull")
                .text(fullPhone);


            $("#resultBox")
                .stop(true, true)
                .slideDown();


            console.log({
                country: selectedCountry.name,
                iso2: selectedCountry.iso2,
                country_code: selectedCountry.code,
                phone: phone,
                full_phone: fullPhone
            });

        }
    );

});