/* Client Intake — intake.js
   Plain JS, no dependencies. Everything happens in the browser:
   nothing here ever sends data anywhere. */
(function () {
  "use strict";

  document.body.classList.remove("no-js");

  var form = document.getElementById("intakeForm");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var totalSteps = steps.length;
  var currentStep = 1;
  var progressFill = document.getElementById("progressFill");
  var progressText = document.getElementById("progressText");
  var progressBar = document.querySelector(".intake-progress");
  var topbar = document.querySelector(".topbar");
  var STORAGE_KEY = "ptIntakeFormV1";

  /* ---------------- Step navigation ---------------- */
  // Scrolls to the progress indicator rather than the very top of the
  // page, so Next/Previous doesn't re-show the intro hero card every
  // time — just enough movement to bring the new step into view under
  // the sticky topbar.
  function scrollToProgress() {
    if (!progressBar) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    var target = window.scrollY + progressBar.getBoundingClientRect().top - topbarHeight;
    window.scrollTo({ top: Math.max(target, 0), behavior: "smooth" });
  }

  function showStep(n) {
    currentStep = Math.min(Math.max(n, 1), totalSteps);
    steps.forEach(function (step) {
      var isTarget = Number(step.dataset.step) === currentStep;
      step.classList.toggle("is-active", isTarget);
    });
    progressFill.style.width = (currentStep / totalSteps) * 100 + "%";
    progressText.textContent = "Step " + currentStep + " of " + totalSteps;
    scrollToProgress();
  }

  document.querySelectorAll(".step-next").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showStep(currentStep + 1);
    });
  });

  document.querySelectorAll(".step-prev").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showStep(currentStep - 1);
    });
  });

  /* ---------------- Choice card visual state (radio + checkbox) ---------------- */
  function syncChoiceCard(input) {
    var card = input.closest(".choice-card");
    if (!card) return;
    card.classList.toggle("is-selected", input.checked);
  }

  document.querySelectorAll(".choice-card input").forEach(function (input) {
    syncChoiceCard(input);
    input.addEventListener("change", function () {
      if (input.type === "radio") {
        document
          .querySelectorAll('input[name="' + input.name + '"]')
          .forEach(syncChoiceCard);
      } else {
        syncChoiceCard(input);
      }
    });
  });

  /* ---------------- Checkbox groups with a max pick count ---------------- */
  document.querySelectorAll("[data-checkbox-group]").forEach(function (group) {
    var max = Number(group.dataset.max || 0);
    if (!max) return;
    var name = group.dataset.checkboxGroup;
    var note = document.querySelector('[data-max-note="' + name + '"]');
    var boxes = Array.prototype.slice.call(
      group.querySelectorAll('input[type="checkbox"]')
    );

    function refresh() {
      var checkedCount = boxes.filter(function (b) {
        return b.checked;
      }).length;
      boxes.forEach(function (b) {
        var disable = !b.checked && checkedCount >= max;
        b.disabled = disable;
        var card = b.closest(".choice-card");
        if (card) card.classList.toggle("is-disabled", disable);
      });
      if (note) {
        note.textContent =
          checkedCount >= max
            ? "Max " + max + " selected."
            : "You can pick up to " + max + ".";
      }
    }

    boxes.forEach(function (b) {
      b.addEventListener("change", refresh);
    });
    refresh();
  });

  /* ---------------- Priority dropdown duplicate warning ---------------- */
  document.querySelectorAll("[data-priority-group]").forEach(function (group) {
    var name = group.dataset.priorityGroup;
    var selects = Array.prototype.slice.call(
      group.querySelectorAll("select[data-priority='" + name + "']")
    );
    var warning = document.querySelector('[data-priority-warning="' + name + '"]');

    function refresh() {
      var values = selects.map(function (s) {
        return s.value;
      }).filter(Boolean);
      var hasDuplicate = new Set(values).size !== values.length;
      if (warning) warning.hidden = !hasDuplicate;
    }

    selects.forEach(function (s) {
      s.addEventListener("change", refresh);
    });
    refresh();
  });

  /* ---------------- "Other" detail reveals ----------------
     Any input (radio or checkbox) with data-reveals="someId" shows/hides
     the element with that id based on whether the input is checked.
     Unchecking just hides the field — it does NOT clear whatever was
     typed in it, so re-checking "Other" brings the detail straight back.
     Only Clear Form wipes the value (via the native form.reset() below). */
  document.querySelectorAll("[data-reveals]").forEach(function (input) {
    var target = document.getElementById(input.dataset.reveals);
    if (!target) return;
    function sync() {
      target.hidden = !input.checked;
    }
    input.addEventListener("change", sync);
    sync();
  });

  /* ---------------- Sliders: live value display + fill position ----------------
     Sets a --fill custom property (0-100%) alongside the text output.
     Step 1's slider track is a custom CSS gradient keyed off --fill so
     the coloured portion always matches the thumb exactly; other steps
     don't reference --fill yet, so this is a harmless no-op there. */
  function updateSlider(slider) {
    var output = document.getElementById(slider.id + "Value");
    if (output) output.textContent = slider.value + " / 10";
    var min = Number(slider.min || 0);
    var max = Number(slider.max || 100);
    var pct = ((Number(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty("--fill", pct + "%");
  }

  document.querySelectorAll('input[type="range"]').forEach(function (slider) {
    slider.addEventListener("input", function () {
      updateSlider(slider);
    });
    updateSlider(slider);
  });

  /* ---------------- Autosave to localStorage ---------------- */
  function getAllFields() {
    return Array.prototype.slice.call(
      form.querySelectorAll("input, select, textarea")
    );
  }

  function saveToStorage() {
    var data = {};
    getAllFields().forEach(function (field) {
      if (!field.name) return;
      if (field.type === "checkbox") {
        data[field.name] = data[field.name] || [];
        if (field.checked) data[field.name].push(field.value);
      } else if (field.type === "radio") {
        if (field.checked) data[field.name] = field.value;
      } else {
        data[field.id || field.name] = field.value;
      }
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* localStorage unavailable — form still works, just without autosave */
    }
  }

  function restoreFromStorage() {
    var raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return;
    }
    if (!raw) return;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }

    getAllFields().forEach(function (field) {
      if (!field.name) return;
      if (field.type === "checkbox") {
        var list = data[field.name];
        if (Array.isArray(list) && list.indexOf(field.value) !== -1) {
          field.checked = true;
          syncChoiceCard(field);
        }
      } else if (field.type === "radio") {
        if (data[field.name] === field.value) {
          field.checked = true;
          // Sync the whole group, not just this input: some radios now
          // ship with a default "checked" option in the HTML (first in
          // the list). Setting a different one here natively unchecks
          // that default, but its .is-selected CSS class would stay
          // stuck on unless every sibling in the group is re-synced too.
          document
            .querySelectorAll('input[name="' + field.name + '"]')
            .forEach(syncChoiceCard);
        }
      } else {
        var key = field.id || field.name;
        if (data[key] !== undefined) field.value = data[key];
      }
    });

    document.querySelectorAll('input[type="range"]').forEach(updateSlider);
    document.querySelectorAll("[data-checkbox-group]").forEach(function (group) {
      group.querySelectorAll('input[type="checkbox"]').forEach(function (b) {
        b.dispatchEvent(new Event("change"));
      });
    });
  }

  form.addEventListener("input", saveToStorage);
  form.addEventListener("change", saveToStorage);
  restoreFromStorage();

  /* ---------------- Field helpers ---------------- */
  function val(id) {
    var el = document.getElementById(id);
    return el && el.value.trim() ? el.value.trim() : "";
  }

  function sliderVal(id) {
    var el = document.getElementById(id);
    return el ? el.value + "/10" : "";
  }

  function radioVal(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function checkboxVals(name) {
    var els = form.querySelectorAll('input[name="' + name + '"]:checked');
    return Array.prototype.map.call(els, function (e) {
      // "Other" options wired up with data-reveals fold their typed-in
      // detail into the summary, e.g. "Other (climbing)" instead of
      // just "Other" — works automatically for any group that uses the
      // same data-reveals pattern, not just exerciseTypes.
      if (e.value === "Other" && e.dataset.reveals) {
        var detailWrap = document.getElementById(e.dataset.reveals);
        var detailInput = detailWrap ? detailWrap.querySelector("input, textarea") : null;
        var detail = detailInput ? detailInput.value.trim() : "";
        return detail ? "Other (" + detail + ")" : "Other";
      }
      return e.value;
    }).join(", ");
  }

  function orNotAnswered(v) {
    return v ? v : "Not answered";
  }

  /* ---------------- Required-field soft check ---------------- */
  var REQUIRED_IDS = [
    { get: function () { return val("name"); }, label: "Name" },
    { get: function () { return val("age"); }, label: "Age" },
    { get: function () { return val("height"); }, label: "Height" },
    { get: function () { return val("weight"); }, label: "Current weight" },
    { get: function () { return radioVal("units"); }, label: "Preferred units" },
    { get: function () { return val("goalP1"); }, label: "Priority 1 goal" },
    { get: function () { return radioVal("trainingLocation"); }, label: "Training location" },
    { get: function () { return radioVal("trainingDays"); }, label: "Realistic training days" },
    { get: function () { return radioVal("foodApproach"); }, label: "Food approach" },
    { get: function () { return val("foodP1"); }, label: "Priority 1 food challenge" },
    { get: function () { return val("barrierP1"); }, label: "Priority 1 consistency barrier" }
  ];

  function missingRequiredCount() {
    return REQUIRED_IDS.filter(function (r) {
      return !r.get();
    }).length;
  }

  /* ---------------- Summary generation ---------------- */
  function buildSummary() {
    var lines = [];
    lines.push("PERSONAL TRAINING INTAKE SUMMARY");
    lines.push("");
    lines.push("ABOUT");
    lines.push("Name: " + orNotAnswered(val("name")));
    lines.push("Age: " + orNotAnswered(val("age")));
    lines.push("Height: " + orNotAnswered(val("height")));
    lines.push("Current weight: " + orNotAnswered(val("weight")));
    lines.push("Preferred units: " + orNotAnswered(radioVal("units")));
    lines.push("Normal day: " + orNotAnswered(radioVal("normalDay")));
    lines.push("Current steps: " + orNotAnswered(val("steps")));
    lines.push("Current exercise frequency: " + orNotAnswered(radioVal("exerciseFreq")));
    lines.push("Current exercise types: " + orNotAnswered(checkboxVals("exerciseTypes")));
    lines.push("Fitness confidence: " + sliderVal("confidence"));
    lines.push("");
    lines.push("GOALS");
    lines.push("Priority 1: " + orNotAnswered(val("goalP1")));
    lines.push("Priority 2: " + orNotAnswered(val("goalP2")));
    lines.push("Priority 3: " + orNotAnswered(val("goalP3")));
    lines.push("What would make this feel like progress in 8–12 weeks: " + orNotAnswered(val("progressAnswer")));
    lines.push("Motivation level: " + sliderVal("motivation"));
    lines.push("Simplicity preference: " + sliderVal("simplicity"));
    lines.push("");
    lines.push("TRAINING");
    lines.push("Training location: " + orNotAnswered(radioVal("trainingLocation")));
    lines.push("Realistic training days: " + orNotAnswered(radioVal("trainingDays")));
    lines.push("Preferred session length: " + orNotAnswered(radioVal("sessionLength")));
    lines.push("Preferred training style: " + orNotAnswered(val("trainingStyle")));
    lines.push("Focus areas: " + orNotAnswered(checkboxVals("focusAreas")));
    lines.push("Upper/lower body training bias (1 = all lower, 10 = all upper): " + sliderVal("upperLowerBias"));
    lines.push("Exercises to avoid: " + orNotAnswered(val("exercisesAvoid")));
    lines.push("Exercises enjoyed: " + orNotAnswered(val("exercisesEnjoyed")));
    lines.push("Pain/injury/movement issues: " + orNotAnswered(val("painNote")));
    lines.push("");
    lines.push("FOOD");
    lines.push("Preferred food approach: " + orNotAnswered(radioVal("foodApproach")));
    lines.push("Food challenge priority 1: " + orNotAnswered(val("foodP1")));
    lines.push("Food challenge priority 2: " + orNotAnswered(val("foodP2")));
    lines.push("Food challenge priority 3: " + orNotAnswered(val("foodP3")));
    lines.push("Meals per day: " + orNotAnswered(radioVal("mealsPerDay")));
    lines.push("Breakfast pattern: " + orNotAnswered(radioVal("breakfastPattern")));
    lines.push("Foods disliked: " + orNotAnswered(val("foodsDisliked")));
    lines.push("Foods to keep: " + orNotAnswered(val("foodsKeep")));
    lines.push("Dietary requirements: " + orNotAnswered(checkboxVals("dietary")));
    lines.push("");
    lines.push("LIFESTYLE");
    lines.push("Consistency barrier priority 1: " + orNotAnswered(val("barrierP1")));
    lines.push("Consistency barrier priority 2: " + orNotAnswered(val("barrierP2")));
    lines.push("Consistency barrier priority 3: " + orNotAnswered(val("barrierP3")));
    lines.push("Average sleep: " + orNotAnswered(radioVal("sleep")));
    lines.push("Energy level: " + sliderVal("energy"));
    lines.push("Stress level: " + sliderVal("stress"));
    lines.push("");
    lines.push("PLAN PREFERENCES");
    lines.push("Preferred plan style: " + orNotAnswered(radioVal("planStyle")));
    lines.push("What would make it easiest to stick to: " + orNotAnswered(checkboxVals("stickTo")));
    lines.push("Anything else to know: " + orNotAnswered(val("worries")));
    return lines.join("\n");
  }

  /* ---------------- Toast ---------------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 2600);
  }

  /* ---------------- Generate / Copy / Download / Clear ---------------- */
  var summaryWrap = document.getElementById("summaryWrap");
  var summaryOutput = document.getElementById("summaryOutput");
  var missingWarning = document.getElementById("missingWarning");

  document.getElementById("generateBtn").addEventListener("click", function () {
    summaryOutput.value = buildSummary();
    missingWarning.hidden = missingRequiredCount() === 0;
    summaryWrap.hidden = false;
    summaryWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("copyBtn").addEventListener("click", function () {
    if (!summaryOutput.value) {
      summaryOutput.value = buildSummary();
      summaryWrap.hidden = false;
    }
    var finish = function () {
      showToast("Copied — you can paste this into a message now.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summaryOutput.value).then(finish, function () {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      summaryOutput.focus();
      summaryOutput.select();
      try {
        document.execCommand("copy");
        finish();
      } catch (e) {
        showToast("Couldn't copy automatically — select the text above and copy it manually.");
      }
    }
  });

  document.getElementById("downloadBtn").addEventListener("click", function () {
    if (!summaryOutput.value) {
      summaryOutput.value = buildSummary();
      summaryWrap.hidden = false;
    }
    var blob = new Blob([summaryOutput.value], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "intake-summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    if (!window.confirm("Clear all your answers? This can't be undone.")) return;
    form.reset();
    // form.reset() reverts radios/checkboxes to their HTML-default
    // checked state (several now default to "checked" on the first
    // option) — re-sync every choice-card against that real state
    // rather than blindly stripping is-selected, or defaulted options
    // would incorrectly show as unselected right after clearing.
    document.querySelectorAll(".choice-card input").forEach(function (input) {
      syncChoiceCard(input);
    });
    document.querySelectorAll(".choice-card").forEach(function (card) {
      card.classList.remove("is-disabled");
    });
    document.querySelectorAll('input[type="checkbox"]').forEach(function (b) {
      b.disabled = false;
    });
    document.querySelectorAll('input[type="range"]').forEach(updateSlider);
    document.querySelectorAll("[data-reveals]").forEach(function (input) {
      var target = document.getElementById(input.dataset.reveals);
      if (target) target.hidden = true;
    });
    document.querySelectorAll("[data-priority-warning]").forEach(function (w) {
      w.hidden = true;
    });
    document.querySelectorAll("[data-max-note]").forEach(function (note) {
      var max = note
        .closest(".field")
        .querySelector("[data-max]").dataset.max;
      note.textContent = "You can pick up to " + max + ".";
    });
    summaryOutput.value = "";
    summaryWrap.hidden = true;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    showStep(1);
    showToast("Form cleared.");
  });
})();
