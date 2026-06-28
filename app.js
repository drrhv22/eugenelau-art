/* =====================================================================
   Eugene Lau — "LAMPLIGHT"
   Vanilla JS. No modules, no fetch. Runs from file://.
   ===================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------------------
     1. Reveal + amber picture-light bloom as each work enters view.
        Reduced motion: everything is simply marked revealed at once.
     ------------------------------------------------------------------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealables.forEach(function (el) { el.classList.add("is-revealed"); });
  }

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      // trigger a touch before fully in view, so the glow is "blooming up"
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.18
    });
    revealables.forEach(function (el) { io.observe(el); });

    // Safety net: if anything is still hidden after load (e.g. tall viewport
    // where an element is already past), reveal it.
    window.addEventListener("load", function () {
      revealables.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("is-revealed");
        }
      });
    });
  }

  /* -------------------------------------------------------------------
     2. "Inquire on this work" buttons prefill the form's work select
        and move focus to the message field for a quick start.
     ------------------------------------------------------------------- */
  var workSelect = document.getElementById("f-work");
  var messageField = document.getElementById("f-message");

  document.querySelectorAll("[data-work]").forEach(function (link) {
    link.addEventListener("click", function () {
      var title = link.getAttribute("data-work");
      if (workSelect && title) {
        var matched = false;
        Array.prototype.forEach.call(workSelect.options, function (opt) {
          if (opt.value === title) { opt.selected = true; matched = true; }
        });
        if (matched && messageField) {
          // defer focus until after the in-page jump settles
          window.setTimeout(function () {
            try { messageField.focus({ preventScroll: true }); } catch (e) { messageField.focus(); }
          }, 450);
        }
      }
    });
  });

  /* -------------------------------------------------------------------
     3. Inquiry form — preventDefault, validate lightly, show success.
     ------------------------------------------------------------------- */
  var form = document.getElementById("inquire-form");
  var success = document.getElementById("form-success");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Light native validation so required fields are honoured.
      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      if (success) {
        success.hidden = false;
        // ensure assistive tech announces it, then bring it into view
        success.setAttribute("tabindex", "-1");
        try { success.focus({ preventScroll: true }); } catch (e2) { success.focus(); }
        success.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "center"
        });
      }

      // Clear the inputs but keep the success message visible.
      form.querySelectorAll("input, textarea").forEach(function (f) { f.value = ""; });
      if (workSelect) { workSelect.selectedIndex = 0; }
    });
  }

  /* -------------------------------------------------------------------
     4. Header: subtle solidify on scroll (purely visual, no layout work).
     ------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 12) {
            header.classList.add("is-scrolled");
          } else {
            header.classList.remove("is-scrolled");
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
