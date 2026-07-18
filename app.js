/* Simple Fat Loss & Training Workbook — app.js
   Minimal enhancement only. All content is readable and usable
   without this file running. */
(function () {
  "use strict";

  document.body.classList.remove("no-js");

  /* ---------------- Workout tabs (Push A/B, Pull A/B) ---------------- */
  var tabs = document.querySelectorAll(".workout-tab");
  var panels = document.querySelectorAll(".workout-panel");

  function activateTab(tab) {
    tabs.forEach(function (t) {
      var isSelected = t === tab;
      t.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    panels.forEach(function (panel) {
      var isTarget = panel.id === tab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", isTarget);
      if (isTarget) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateTab(tab);
    });
  });

  /* ---------------- Active state on nav while scrolling (bottom nav + desktop nav) ---------------- */
  var navLinks = document.querySelectorAll(".bottom-nav a, .desktop-nav a");
  var navTargetIds = ["home", "roadmap", "training", "nutrition", "learn"];
  var navSections = navTargetIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.navTarget === id);
    });
  }

  if ("IntersectionObserver" in window && navSections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    navSections.forEach(function (section) {
      observer.observe(section);
    });
  }

  setActiveNav("home");
})();
