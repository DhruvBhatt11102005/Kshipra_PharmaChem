(function () {
  var grid = document.getElementById("product-grid");
  var chipsWrap = document.getElementById("filter-chips");
  var searchInput = document.getElementById("product-search");
  var countEl = document.getElementById("products-count");
  var emptyEl = document.getElementById("product-empty");
  var resetBtn = document.getElementById("product-reset");
  var tabBtns = document.querySelectorAll(".division-switch__btn");

  var FILTERS = {
    pharma: [
      { id: "all", label: "All" },
      { id: "api", label: "API" },
      { id: "intermediate", label: "Intermediates" },
      { id: "excipient", label: "Excipients" },
      { id: "reference", label: "Reference standards" },
    ],
    chem: [
      { id: "all", label: "All" },
      { id: "solvent", label: "Solvents" },
      { id: "acid", label: "Acids" },
      { id: "base", label: "Bases" },
      { id: "specialty", label: "Specialty" },
      { id: "reagent", label: "Reagents" },
    ],
  };

  var state = {
    division: "pharma",
    category: "all",
    query: "",
  };

  function getCards() {
    return grid ? Array.prototype.slice.call(grid.querySelectorAll(".product-card")) : [];
  }

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }

  function buildChips() {
    if (!chipsWrap) return;
    var defs = FILTERS[state.division] || FILTERS.pharma;
    chipsWrap.innerHTML = "";
    defs.forEach(function (def, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter-chip";
      b.setAttribute("data-category", def.id);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", def.id === state.category ? "true" : "false");
      if (def.id === state.category) b.classList.add("is-active");
      b.textContent = def.label;
      b.id = "chip-" + state.division + "-" + def.id;
      chipsWrap.appendChild(b);
      if (idx === 0) chipsWrap.setAttribute("aria-labelledby", "filter-chips-label");
    });
    chipsWrap.setAttribute("role", "radiogroup");
    chipsWrap.setAttribute("aria-label", "Filter by category");
  }

  function syncTabs() {
    tabBtns.forEach(function (btn) {
      var div = btn.getAttribute("data-division");
      var on = div === state.division;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    var shell = document.querySelector(".products-shell");
    if (shell) {
      shell.classList.toggle("products-shell--chem", state.division === "chem");
      shell.classList.toggle("products-shell--pharma", state.division === "pharma");
    }
  }

  function cardMatches(card) {
    if (card.getAttribute("data-division") !== state.division) return false;
    var cat = card.getAttribute("data-category");
    if (state.category !== "all" && cat !== state.category) return false;
    var q = normalize(state.query);
    if (!q) return true;
    var hay = normalize(card.getAttribute("data-search")) + " " + normalize(card.textContent);
    return q.split(/\s+/).every(function (word) {
      return word.length === 0 || hay.indexOf(word) !== -1;
    });
  }

  function applyFilter() {
    var cards = getCards();
    var visible = 0;
    cards.forEach(function (card) {
      var show = cardMatches(card);

      if (!show) {
        // Immediately remove from grid flow
        card.style.display = "none";
        card.setAttribute("aria-hidden", "true");
        card.removeAttribute("hidden");
      } else {
        // Reset display first so reflow works
        card.style.display = "";
        card.removeAttribute("hidden");
        card.setAttribute("aria-hidden", "false");

        // Reset animation so it re-triggers
        card.style.animation = "none";
        card.offsetHeight; /* force reflow */
        card.style.animation = "";
        card.style.animationDelay = (visible * 0.06) + "s";
        visible += 1;
      }
    });
    if (countEl) {
      countEl.textContent =
        visible === 0
          ? "No products match your filters."
          : "Showing " + visible + " product" + (visible === 1 ? "" : "s") + " · " + (state.division === "pharma" ? "Pharmaceutical" : "Chemical");
    }
    if (emptyEl) {
      emptyEl.hidden = visible !== 0;
    }
    if (grid) {
      grid.setAttribute("aria-busy", "false");
    }
  }

  function setDivision(div) {
    state.division = div;
    state.category = "all";
    if (searchInput) state.query = searchInput.value;
    buildChips();
    syncTabs();
    applyFilter();
  }

  function setCategory(cat) {
    state.category = cat;
    if (!chipsWrap) return;
    var chips = chipsWrap.querySelectorAll(".filter-chip");
    chips.forEach(function (c) {
      var id = c.getAttribute("data-category");
      var on = id === state.category;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-checked", on ? "true" : "false");
    });
    applyFilter();
  }

  function resetAll() {
    state.category = "all";
    state.query = "";
    if (searchInput) searchInput.value = "";
    buildChips();
    applyFilter();
  }

  if (!grid || !chipsWrap) return;

  buildChips();
  syncTabs();
  applyFilter();

  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var div = btn.getAttribute("data-division");
      if (div) setDivision(div);
    });
  });

  chipsWrap.addEventListener("click", function (e) {
    var t = e.target.closest(".filter-chip");
    if (!t || !chipsWrap.contains(t)) return;
    var cat = t.getAttribute("data-category");
    if (cat) setCategory(cat);
  });

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value;
      applyFilter();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetAll();
    });
  }

  // Product Modal Logic
  var modal = document.getElementById("product-modal");
  var closeBtn = document.querySelector(".modal-close");
  var modalTitle = document.getElementById("modal-title");
  var modalCategory = document.getElementById("modal-category");
  var modalDesc = document.getElementById("modal-desc");
  var modalForm = document.getElementById("modal-enquiry-form");

  if (modal) {
    document.body.addEventListener("click", function (e) {
      if (e.target.closest(".product-card__cta") || e.target.closest(".product-card")) {
        e.preventDefault();
        var card = e.target.closest(".product-card");
        if (!card) return;

        // Populate Modal Data
        var title = card.querySelector(".product-card__title").textContent;
        var desc = card.querySelector(".product-card__desc").textContent;
        var pill = card.querySelector(".product-card__pill").textContent;
        var div = card.getAttribute("data-division");

        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalCategory.textContent = pill;

        modalCategory.style.color = div === "pharma" ? "var(--accent-pharma)" : "var(--accent-chem)";
        modalCategory.style.background = div === "pharma" ? "rgba(0, 210, 255, 0.1)" : "rgba(0, 255, 135, 0.1)";

        // Generate fake stats based on hash of title for demo purposes
        var hash = 0;
        for (var i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
        document.getElementById("modal-cas").textContent = Math.abs(hash).toString().substring(0, 3) + "-" + Math.abs(hash).toString().substring(3, 5) + "-" + (Math.abs(hash) % 9);
        
        modal.classList.add("is-active");
      }
    });

    closeBtn.addEventListener("click", function () {
      modal.classList.remove("is-active");
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("is-active");
      }
    });

    modalForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var btn = modalForm.querySelector("button");
      var originalText = btn.textContent;
      btn.textContent = "Enquiry Sent!";
      btn.style.background = "var(--accent-chem)";
      setTimeout(function() {
        modal.classList.remove("is-active");
        btn.textContent = originalText;
        btn.style.background = "";
        modalForm.reset();
      }, 1500);
    });
  }
})();
