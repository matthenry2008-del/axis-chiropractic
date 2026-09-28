/* ==========================================================================
   Axis Chiropractic — shared site behavior
   - injects header (utility bar + nav), footer, and mobile sticky bar
   - mobile hamburger menu
   - dynamic "Open today" status from real per-day hours
   - contact / new-patient form handling (Formspree + JS success state)
   ========================================================================== */
(function () {
  "use strict";

  // ---- shared constants -----------------------------------------------------
  var BOOK_URL = "https://www.axischirowi.com/patient-form/";
  var PHONE = "XXX-XXX-XXXX";
  var TEL = "#";
  var EMAIL = "frontdesk@axischirowi.com";
  // Formspree form endpoint, e.g. "https://formspree.io/f/abcdwxyz".
  // Both forms post here; the "form-name" field says which one it was.
  var FORM_ENDPOINT = "";
  var ADDRESS = "W359 N5002 Brown St #220A, Oconomowoc, WI 53066";
  var MAPS_DIR =
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Axis Chiropractic, W359 N5002 Brown St #220A, Oconomowoc, WI 53066");

  // ---- office hours (0 = Sun ... 6 = Sat) -----------------------------------
  // each day: array of [startHour, endHour] blocks (24h, decimals ok), or null
  var HOURS = {
    0: null,                       // Sun
    1: [[9, 12], [14, 18]],        // Mon
    2: null,                       // Tue
    3: [[9, 12], [14, 18]],        // Wed
    4: [[9, 12], [14, 18]],        // Thu
    5: null,                       // Fri
    6: [[8, 10.5]]                 // Sat
  };
  var HOURS_LABEL = {
    weekday: "9am–12pm & 2pm–6pm",
    weekdayShort: "9–12 & 2–6",
    sat: "8am–10:30am",
    satShort: "8–10:30am"
  };

  function todayHoursLabel(dow, short) {
    if (dow === 6) return short ? HOURS_LABEL.satShort : HOURS_LABEL.sat;
    if (HOURS[dow]) return short ? HOURS_LABEL.weekdayShort : HOURS_LABEL.weekday;
    return null;
  }

  // Return { status, hours } reflecting the real per-day hours.
  function openStatus(now, short) {
    var dow = now.getDay();
    var blocks = HOURS[dow];
    var label = todayHoursLabel(dow, short);
    if (!blocks) return { status: "Closed today", hours: null };
    var t = now.getHours() + now.getMinutes() / 60;
    var openNow = blocks.some(function (b) { return t >= b[0] && t < b[1]; });
    var laterToday = blocks.some(function (b) { return t < b[0]; });
    if (openNow) return { status: "Open now", hours: label };
    if (laterToday) return { status: "Open today", hours: label };
    return { status: "Closed now", hours: label };
  }

  // ---- logo lockup markup ---------------------------------------------------
  function lockup() {
    return (
      '<span class="lockup" aria-label="Axis Chiropractic">' +
      '<span class="word">AXIS</span>' +
      '<span class="rule"></span>' +
      '<span class="sub">CHIROPRACTIC</span>' +
      "</span>"
    );
  }

  var NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "services", label: "Services", href: "services.html" },
    { key: "conditions", label: "Conditions", href: "conditions.html" },
    { key: "about", label: "About", href: "about.html" },
    { key: "contact", label: "Contact", href: "contact.html" }
  ];

  function buildHeader(active) {
    var now = new Date();
    var st = openStatus(now, false);
    var statusText = st.hours ? st.status + " · " + st.hours : st.status;

    var links = NAV.map(function (n) {
      return (
        '<a class="navlink' + (n.key === active ? " is-active" : "") + '" href="' + n.href + '">' +
        n.label + "</a>"
      );
    }).join("");

    var drawerLinks = NAV.map(function (n) {
      return (
        '<a class="' + (n.key === active ? "is-active" : "") + '" href="' + n.href + '">' +
        n.label + "</a>"
      );
    }).join("");

    return (
      '<div class="util-bar"><div class="wrap">' +
        '<div class="util-left">' +
          '<span class="util-status">' + statusText + "</span>" +
          '<span class="util-addr">' + "W359 N5002 Brown St #220A, Oconomowoc</span>" +
        "</div>" +
        '<a class="util-phone" href="' + TEL + '">' + PHONE + "</a>" +
      "</div></div>" +

      '<nav class="nav" aria-label="Primary"><div class="wrap">' +
        '<a href="index.html" aria-label="Axis Chiropractic home">' + lockup() + "</a>" +
        '<div class="nav-links">' + links +
          '<a class="btn btn--navy btn--sm" href="' + BOOK_URL + '">Book an appointment</a>' +
        "</div>" +
        '<button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false" aria-controls="drawer">' +
          "<span></span><span></span><span></span>" +
        "</button>" +
      "</div></nav>" +

      '<div class="drawer" id="drawer">' + drawerLinks +
        '<a class="btn btn--navy" href="' + BOOK_URL + '">Book an appointment</a>' +
      "</div>"
    );
  }

  function buildFooter() {
    return (
      '<div class="wrap">' +
        '<a href="index.html" aria-label="Axis Chiropractic home">' + lockup() + "</a>" +
        '<div class="footer-addr">' + ADDRESS + " · " +
          '<a href="mailto:' + EMAIL + '">' + EMAIL + "</a></div>" +
        '<a class="footer-book" href="' + BOOK_URL + '">Book an appointment</a>' +
      "</div>"
    );
  }

  function buildMobileBar() {
    return (
      '<a class="btn btn--navy book" href="' + BOOK_URL + '">Book now</a>' +
      '<a class="btn btn--outline call" href="' + TEL + '">Call</a>'
    );
  }

  // ---- wire everything up ---------------------------------------------------
  function init() {
    var active = document.body.getAttribute("data-page") || "";

    var header = document.getElementById("site-header");
    if (header) header.innerHTML = buildHeader(active);

    var footer = document.getElementById("site-footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = buildFooter();
    }

    var bar = document.getElementById("mobile-bar");
    if (bar) {
      bar.className = "mobile-bar";
      bar.innerHTML = buildMobileBar();
    }

    // hamburger toggle
    var ham = document.getElementById("hamburger");
    var drawer = document.getElementById("drawer");
    if (ham && drawer) {
      ham.addEventListener("click", function () {
        var open = drawer.classList.toggle("is-open");
        ham.setAttribute("aria-expanded", open ? "true" : "false");
      });
      // close on link tap
      drawer.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          drawer.classList.remove("is-open");
          ham.setAttribute("aria-expanded", "false");
        });
      });
    }

    // fill any elements tagged with shared data
    fillDynamicLinks();

    // forms
    document.querySelectorAll("form[data-ajax-form]").forEach(setupForm);

    // "Request a callback" -> focus mini form
    document.querySelectorAll('[data-scroll-to]').forEach(function (el) {
      el.addEventListener("click", function (e) {
        var target = document.querySelector(el.getAttribute("data-scroll-to"));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          var input = target.querySelector("input, textarea");
          if (input) setTimeout(function () { input.focus(); }, 400);
        }
      });
    });
  }

  // Convenience: any [data-href="book|tel|directions"] gets the shared URL.
  function fillDynamicLinks() {
    var map = { book: BOOK_URL, tel: TEL, directions: MAPS_DIR, email: "mailto:" + EMAIL };
    document.querySelectorAll("[data-href]").forEach(function (el) {
      var v = map[el.getAttribute("data-href")];
      if (v) el.setAttribute("href", v);
    });
  }

  // ---- form handling --------------------------------------------------------
  function setupForm(form) {
    var statusEl = form.querySelector(".form-status");
    var errorEl = form.querySelector(".form-error");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errorEl) errorEl.classList.remove("is-visible");

      // required-field validation
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var ok = String(input.value).trim() !== "";
        input.classList.toggle("is-invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        if (errorEl) {
          errorEl.textContent = "Please fill in the required fields.";
          errorEl.classList.add("is-visible");
        }
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      var prevText = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      function succeed() {
        if (statusEl) {
          statusEl.innerHTML =
            '<div class="form-success">Thanks, we\'ll get back to you within one business day.</div>';
          statusEl.classList.add("is-visible");
        }
        // hide the form fields, keep the success message
        var fields = form.querySelector("[data-form-body]");
        if (fields) fields.style.display = "none";
      }

      function fail() {
        if (btn) { btn.disabled = false; btn.textContent = prevText; }
        if (errorEl) {
          errorEl.textContent = "Something went wrong. Please call us at " + PHONE + ".";
          errorEl.classList.add("is-visible");
        }
      }

      // Formspree AJAX submission. On localhost, show the success state
      // without sending (per the handoff guide).
      var isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) ||
        location.protocol === "file:";
      if (isLocal) { succeed(); return; }
      if (!FORM_ENDPOINT) { fail(); return; }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) succeed(); else fail();
      }).catch(fail);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
