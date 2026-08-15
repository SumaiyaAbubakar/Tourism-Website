/* =========================================================
   TRAVEL EXPLORER — MAKE YOUR OWN TRIP
   ADVANCED INTERACTION + VALIDATION + EMAILJS
========================================================= */

/* =========================================================
   EMAILJS CONFIGURATION
========================================================= */

const EMAILJS_PUBLIC_KEY = "FmUew6x-re2vPPXJW";
const EMAILJS_SERVICE_ID = "service_m3u8l4u";
const EMAILJS_TEMPLATE_ID = "template_nda7uk8";

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    const state = {
        selectedAreas: [],
        submitting: false
    };


    const STORAGE_KEY =
        "travelExplorerCustomTrip";


    const $ = id =>
        document.getElementById(id);


    const form =
        $("tripForm");


    /* =====================================================
       FORM FIELDS
    ===================================================== */

    const fields = {

        firstName:
            $("firstName"),

        lastName:
            $("lastName"),

        phone:
            $("phone"),

        email:
            $("email"),

        duration:
            $("duration"),

        pickup:
            $("pickup"),

        vehicle:
            $("vehicle"),

        adults:
            $("adults"),

        kids:
            $("kids"),

        room:
            $("room"),

        tourType:
            $("tourType"),

        date:
            $("date"),

        special:
            $("special")
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    init();


    function init() {

        setMinimumDate();

        setupDestinations();

        setupInputs();

        setupPackages();

        setupSubmit();

        restoreTrip();

        updateAll();
    }


    /* =====================================================
       MINIMUM DATE
    ===================================================== */

    function setMinimumDate() {

        if (!fields.date)
            return;


        const today =
            new Date();


        today.setMinutes(
            today.getMinutes() -
            today.getTimezoneOffset()
        );


        fields.date.min =
            today.toISOString()
                .split("T")[0];
    }


    /* =====================================================
       DESTINATION SELECTOR
    ===================================================== */

    function setupDestinations() {

        document
            .querySelectorAll(".tag-btn")
            .forEach(btn => {

                btn.setAttribute(
                    "aria-pressed",
                    "false"
                );


                btn.addEventListener(
                    "click",
                    () => {

                        const area =
                            btn.textContent
                                .replace(/^\d+\s*/, "")
                                .trim();


                        if (
                            state.selectedAreas
                                .includes(area)
                        ) {

                            state.selectedAreas =
                                state.selectedAreas
                                    .filter(
                                        item =>
                                            item !== area
                                    );


                            btn.classList.remove(
                                "tag-selected"
                            );


                            btn.setAttribute(
                                "aria-pressed",
                                "false"
                            );
                        }


                        else {

                            state.selectedAreas
                                .push(area);


                            btn.classList.add(
                                "tag-selected"
                            );


                            btn.setAttribute(
                                "aria-pressed",
                                "true"
                            );


                            btn.animate(
                                [
                                    {
                                        transform:
                                            "scale(.96)"
                                    },
                                    {
                                        transform:
                                            "scale(1.03)"
                                    },
                                    {
                                        transform:
                                            "scale(1)"
                                    }
                                ],
                                {
                                    duration: 320,
                                    easing:
                                        "cubic-bezier(.22,.8,.2,1)"
                                }
                            );
                        }


                        $("selectedAreas").value =
                            state.selectedAreas.join(
                                ", "
                            );


                        clearDestinationError();

                        updateAll();

                        saveTrip();
                    }
                );
            });
    }


    /* =====================================================
       INPUT LISTENERS
    ===================================================== */

    function setupInputs() {

        Object.values(fields)
            .forEach(field => {

                if (!field)
                    return;


                field.addEventListener(
                    "input",
                    () => {

                        validateField(
                            field,
                            false
                        );

                        updateAll();

                        saveTrip();
                    }
                );


                field.addEventListener(
                    "change",
                    () => {

                        validateField(
                            field,
                            false
                        );

                        updateAll();

                        saveTrip();
                    }
                );


                field.addEventListener(
                    "blur",
                    () => {

                        validateField(
                            field,
                            true
                        );
                    }
                );
            });


        [
            "duration",
            "adults",
            "kids",
            "room"
        ]
        .forEach(id => {

            const input = $(id);

            if (!input)
                return;


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        [
                            "e",
                            "E",
                            "+",
                            "-"
                        ].includes(event.key)
                    ) {

                        event.preventDefault();
                    }
                }
            );
        });
    }


    /* =====================================================
       PACKAGE SELECTION
    ===================================================== */

    function setupPackages() {

        document
            .querySelectorAll(
                "input[name='package']"
            )
            .forEach(input => {

                input.addEventListener(
                    "change",
                    () => {

                        document
                            .querySelectorAll(
                                ".package-card"
                            )
                            .forEach(card => {

                                const radio =
                                    card.querySelector(
                                        "input[name='package']"
                                    );

                                card.classList.toggle(
                                    "package-selected",
                                    !!radio?.checked
                                );
                            });


                        clearPackageError();

                        updateAll();

                        saveTrip();
                    }
                );
            });
    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    function setupSubmit() {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                submitForm();
            }
        );
    }


    /* =====================================================
       FIELD VALIDATION
    ===================================================== */

    function validateField(
        field,
        showError = true
    ) {

        if (!field)
            return true;


        removeFieldError(field);


        const value =
            field.value.trim();


        /* REQUIRED */

        if (
            field.required &&
            !value
        ) {

            if (showError) {

                showFieldError(
                    field,
                    "This field is required."
                );
            }

            return false;
        }


        /* EMAIL */

        if (
            field.id === "email" &&
            value
        ) {

            const valid =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                    .test(value);


            if (!valid) {

                if (showError) {

                    showFieldError(
                        field,
                        "Please enter a valid email address."
                    );
                }

                return false;
            }
        }


        /* PHONE */

        if (
            field.id === "phone" &&
            value
        ) {

            const digits =
                value.replace(
                    /\D/g,
                    ""
                );


            if (
                digits.length < 10 ||
                digits.length > 15
            ) {

                if (showError) {

                    showFieldError(
                        field,
                        "Please enter a valid phone number."
                    );
                }

                return false;
            }
        }


        /* NUMERIC RANGES */

        const ranges = {

            duration:
                [1, 60],

            adults:
                [1, 30],

            kids:
                [0, 30],

            room:
                [1, 10]
        };


        if (
            ranges[field.id] &&
            value
        ) {

            const number =
                Number(value);


            const [
                min,
                max
            ] =
                ranges[field.id];


            if (
                number < min ||
                number > max
            ) {

                if (showError) {

                    showFieldError(
                        field,
                        `Please enter a value between ${min} and ${max}.`
                    );
                }

                return false;
            }
        }


        /* DATE */

        if (
            field.id === "date" &&
            value
        ) {

            const selected =
                new Date(
                    value + "T00:00:00"
                );


            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            if (
                selected < today
            ) {

                if (showError) {

                    showFieldError(
                        field,
                        "Please choose a future travel date."
                    );
                }

                return false;
            }
        }


        return true;
    }


    /* =====================================================
       COMPLETE FORM VALIDATION
    ===================================================== */

    function validateForm() {

        let valid = true;

        let firstInvalid = null;


        Object.values(fields)
            .forEach(field => {

                if (
                    !field ||
                    field.id === "special"
                )
                    return;


                const ok =
                    validateField(
                        field,
                        true
                    );


                if (!ok) {

                    valid = false;

                    if (!firstInvalid)
                        firstInvalid = field;
                }
            });


        /* PACKAGE */

        if (
            !document.querySelector(
                "input[name='package']:checked"
            )
        ) {

            valid = false;

            showPackageError();
        }


        /* DESTINATION */

        if (
            !state.selectedAreas.length
        ) {

            valid = false;

            showDestinationError();
        }


        /* TRAVELER VALIDATION */

        const adults =
            Number(
                fields.adults.value
            ) || 0;


        const kids =
            Number(
                fields.kids.value
            ) || 0;


        const rooms =
            Number(
                fields.room.value
            ) || 0;


        if (
            adults + kids > 30
        ) {

            valid = false;

            showFieldError(
                fields.adults,
                "Total travelers cannot exceed 30."
            );


            if (!firstInvalid)
                firstInvalid =
                    fields.adults;
        }


        /* ROOM VALIDATION */

        if (
            rooms >
                adults + kids &&
            adults + kids > 0
        ) {

            valid = false;

            showFieldError(
                fields.room,
                "Rooms cannot exceed the number of travelers."
            );


            if (!firstInvalid)
                firstInvalid =
                    fields.room;
        }


        return {
            valid,
            firstInvalid
        };
    }


    /* =====================================================
       SUBMIT + EMAILJS
    ===================================================== */

    async function submitForm() {

        if (state.submitting)
            return;


        const result =
            validateForm();


        if (!result.valid) {

            showFormMessage(
                "Please complete the highlighted details before continuing."
            );


            result.firstInvalid
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


            setTimeout(
                () =>
                    result.firstInvalid?.focus(),
                400
            );

            return;
        }


        state.submitting = true;


        const btn =
            document.querySelector(
                ".submit-btn"
            );


        const original =
            btn.innerHTML;


        btn.disabled = true;


        btn.innerHTML = `
            <span class="submit-spinner"></span>
            <span>
                Sending your journey...
            </span>
        `;


        try {

            await emailjs.sendForm(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                form
            );


            /* REMOVE SAVED DRAFT */

            localStorage.removeItem(
                STORAGE_KEY
            );


            /* SHOW SUCCESS */

            showSuccessModal();


            /* RESET FORM */

            form.reset();


            state.selectedAreas = [];


            document
                .querySelectorAll(".tag-btn")
                .forEach(btn => {

                    btn.classList.remove(
                        "tag-selected"
                    );

                    btn.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });


            document
                .querySelectorAll(".package-card")
                .forEach(card =>
                    card.classList.remove(
                        "package-selected"
                    )
                );


            $("selectedAreas").value = "";


            updateAll();
        }


        catch (error) {

            console.error(
                "EmailJS error:",
                error
            );


            showFormMessage(
                "We couldn't send your trip request right now. Please try again."
            );
        }


        finally {

            btn.innerHTML =
                original;


            btn.disabled = false;


            state.submitting =
                false;
        }
    }


    /* KEEP COMPATIBILITY WITH OLD HTML */

    window.submitForm =
        submitForm;


    /* =====================================================
       LIVE SUMMARY
    ===================================================== */

    function updateAll() {

        const progress =
            calculateProgress();


        $("summaryProgress")
            .textContent =
            `${progress}%`;


        $("summaryProgressFill")
            .style.width =
            `${progress}%`;


        const duration =
            Number(
                fields.duration.value
            ) || 0;


        const adults =
            Number(
                fields.adults.value
            ) || 0;


        const kids =
            Number(
                fields.kids.value
            ) || 0;


        const rooms =
            Number(
                fields.room.value
            ) || 0;


        const packageInput =
            document.querySelector(
                "input[name='package']:checked"
            );


        $("summaryContent")
            .innerHTML = `

            <div class="summary-item">
                <span>DESTINATIONS</span>
                <strong>${state.selectedAreas.length || "—"}</strong>
            </div>

            <div class="summary-item">
                <span>DURATION</span>
                <strong>
                    ${
                        duration
                            ? duration + " days"
                            : "—"
                    }
                </strong>
            </div>

            <div class="summary-item">
                <span>TRAVELERS</span>
                <strong>
                    ${adults + kids || "—"}
                </strong>
            </div>

            <div class="summary-item">
                <span>ROOMS</span>
                <strong>${rooms || "—"}</strong>
            </div>

            <div class="summary-item">
                <span>PACKAGE</span>
                <strong>
                    ${
                        escapeHTML(
                            packageInput?.value ||
                            "—"
                        )
                    }
                </strong>
            </div>

            <div class="summary-item">
                <span>VEHICLE</span>
                <strong>
                    ${
                        escapeHTML(
                            fields.vehicle.value ||
                            "—"
                        )
                    }
                </strong>
            </div>
        `;


        $("summaryDestinationList")
            .textContent =
                state.selectedAreas.length
                    ? state.selectedAreas.join(
                        "  •  "
                    )
                    : "None yet";


        const status =
            $("summaryStatus");


        if (progress === 100) {

            status.textContent =
                "Your journey is ready to be created.";

            status.classList.add(
                "summary-complete"
            );
        }

        else if (progress >= 70) {

            status.textContent =
                "Almost there — just a few details left.";

            status.classList.remove(
                "summary-complete"
            );
        }

        else if (progress >= 35) {

            status.textContent =
                "Great start. Keep shaping your adventure.";

            status.classList.remove(
                "summary-complete"
            );
        }

        else {

            status.textContent =
                "Start building your adventure.";

            status.classList.remove(
                "summary-complete"
            );
        }
    }


    /* =====================================================
       PROGRESS CALCULATION
    ===================================================== */

    function calculateProgress() {

        const required =
            Object.values(fields)
                .filter(
                    field =>
                        field &&
                        field.required
                );


        let completed =
            required.filter(
                field =>
                    field.value.trim()
            ).length;


        if (
            state.selectedAreas.length
        ) {

            completed++;
        }


        if (
            document.querySelector(
                "input[name='package']:checked"
            )
        ) {

            completed++;
        }


        return Math.round(
            (
                completed /
                (required.length + 2)
            ) * 100
        );
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function saveTrip() {

        const data = {

            selectedAreas:
                state.selectedAreas,

            fields:
                Object.fromEntries(
                    Object.entries(fields)
                        .map(
                            ([key, field]) =>
                                [
                                    key,
                                    field?.value || ""
                                ]
                        )
                ),

            package:
                document.querySelector(
                    "input[name='package']:checked"
                )?.value || ""
        };


        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );
        }

        catch (_) {

            console.warn(
                "Could not save trip."
            );
        }
    }


    /* =====================================================
       RESTORE SAVED TRIP
    ===================================================== */

    function restoreTrip() {

        let saved;


        try {

            saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );
        }

        catch (_) {

            return;
        }


        if (!saved)
            return;


        state.selectedAreas =
            Array.isArray(
                saved.selectedAreas
            )
                ? saved.selectedAreas
                : [];


        Object.entries(
            saved.fields || {}
        )
        .forEach(
            ([key, value]) => {

                if (fields[key]) {

                    fields[key].value =
                        value;
                }
            }
        );


        document
            .querySelectorAll(".tag-btn")
            .forEach(btn => {

                const area =
                    btn.textContent
                        .replace(/^\d+\s*/, "")
                        .trim();


                if (
                    state.selectedAreas
                        .includes(area)
                ) {

                    btn.classList.add(
                        "tag-selected"
                    );

                    btn.setAttribute(
                        "aria-pressed",
                        "true"
                    );
                }
            });


        if (saved.package) {

            const input =
                document.querySelector(
                    `input[name="package"][value="${CSS.escape(saved.package)}"]`
                );


            if (input) {

                input.checked = true;

                input
                    .closest(".package-card")
                    ?.classList.add(
                        "package-selected"
                    );
            }
        }


        $("selectedAreas").value =
            state.selectedAreas.join(
                ", "
            );
    }


    /* =====================================================
       ERROR UI
    ===================================================== */

    function showFieldError(
        field,
        message
    ) {

        removeFieldError(field);


        field.classList.add(
            "field-error"
        );


        field.setAttribute(
            "aria-invalid",
            "true"
        );


        const error =
            document.createElement(
                "small"
            );


        error.className =
            "js-field-error";


        error.textContent =
            message;


        field.parentElement
            .appendChild(error);
    }


    function removeFieldError(
        field
    ) {

        field.classList.remove(
            "field-error"
        );


        field.removeAttribute(
            "aria-invalid"
        );


        field.parentElement
            .querySelector(
                ".js-field-error"
            )
            ?.remove();
    }


    function showDestinationError() {

        clearDestinationError();


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "js-area-error";


        error.textContent =
            "Please select at least one destination.";


        $("areaTags")
            .after(error);
    }


    function clearDestinationError() {

        document
            .querySelector(
                ".js-area-error"
            )
            ?.remove();
    }


    function showPackageError() {

        clearPackageError();


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "js-package-error";


        error.textContent =
            "Please choose a package type.";


        document
            .querySelector(
                ".package-grid"
            )
            .after(error);
    }


    function clearPackageError() {

        document
            .querySelector(
                ".js-package-error"
            )
            ?.remove();
    }


    function showFormMessage(
        message
    ) {

        document
            .querySelector(
                ".trip-form-message"
            )
            ?.remove();


        const box =
            document.createElement(
                "div"
            );


        box.className =
            "trip-form-message";


        box.textContent =
            message;


        form.prepend(box);


        box.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /* =====================================================
       SUCCESS MODAL
    ===================================================== */

    function showSuccessModal() {

        const duration =
            Number(
                fields.duration.value
            ) || 0;


        const travelers =
            (
                Number(
                    fields.adults.value
                ) || 0
            ) +
            (
                Number(
                    fields.kids.value
                ) || 0
            );


        const packageName =
            document.querySelector(
                "input[name='package']:checked"
            )?.value ||
            "—";


        const modal =
            document.createElement(
                "div"
            );


        modal.className =
            "trip-success-modal";


        modal.innerHTML = `

            <div class="success-backdrop"></div>

            <div class="success-card">

                <button
                    class="success-close"
                    type="button"
                    aria-label="Close"
                >
                    ×
                </button>

                <div class="success-orbit">
                    <div class="success-icon">
                        <i>✓</i>
                    </div>
                </div>

                <span class="success-eyebrow">
                    JOURNEY CREATED
                </span>

                <h2>
                    Your adventure
                    <br>
                    <em>starts here.</em>
                </h2>

                <p>
                    Your personalized travel preferences
                    have been received successfully.
                    Check your email for your journey confirmation.
                </p>

                <div class="success-summary">

                    <div>
                        <span>DESTINATIONS</span>
                        <strong>
                            ${state.selectedAreas.length}
                        </strong>
                    </div>

                    <div>
                        <span>DURATION</span>
                        <strong>
                            ${
                                duration
                                    ? duration + " days"
                                    : "—"
                            }
                        </strong>
                    </div>

                    <div>
                        <span>TRAVELERS</span>
                        <strong>
                            ${travelers || "—"}
                        </strong>
                    </div>

                    <div>
                        <span>PACKAGE</span>
                        <strong>
                            ${escapeHTML(packageName)}
                        </strong>
                    </div>

                </div>

                <button
                    class="success-done"
                    type="button"
                >
                    Continue exploring
                    <span>→</span>
                </button>

            </div>
        `;


        document.body
            .appendChild(modal);


        requestAnimationFrame(
            () =>
                modal.classList.add(
                    "visible"
                )
        );


        const close = () => {

            modal.classList.remove(
                "visible"
            );


            setTimeout(
                () =>
                    modal.remove(),
                350
            );
        };


        modal
            .querySelector(
                ".success-backdrop"
            )
            .addEventListener(
                "click",
                close
            );


        modal
            .querySelector(
                ".success-close"
            )
            .addEventListener(
                "click",
                close
            );


        modal
            .querySelector(
                ".success-done"
            )
            .addEventListener(
                "click",
                close
            );


        const escapeHandler =
            event => {

                if (
                    event.key === "Escape"
                ) {

                    close();

                    document.removeEventListener(
                        "keydown",
                        escapeHandler
                    );
                }
            };


        document.addEventListener(
            "keydown",
            escapeHandler
        );
    }


    /* =====================================================
       SECURITY / HTML ESCAPING
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.TravelExplorerTrip = {

        getState: () => ({

            selectedAreas:
                [...state.selectedAreas],

            progress:
                calculateProgress()
        }),


        clear: () => {

            localStorage.removeItem(
                STORAGE_KEY
            );


            form.reset();


            state.selectedAreas =
                [];


            document
                .querySelectorAll(
                    ".tag-btn"
                )
                .forEach(btn => {

                    btn.classList.remove(
                        "tag-selected"
                    );

                    btn.setAttribute(
                        "aria-pressed",
                        "false"
                    );
                });


            document
                .querySelectorAll(
                    ".package-card"
                )
                .forEach(card =>
                    card.classList.remove(
                        "package-selected"
                    )
                );


            $("selectedAreas")
                .value = "";


            updateAll();
        }
    };

});