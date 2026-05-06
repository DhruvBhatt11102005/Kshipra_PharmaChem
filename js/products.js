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

  var SUBCATEGORIES = {
    pharma: [
      { id: "all", label: "All Sub-Categories" },
      { id: "nsaids", label: "NSAIDs" },
      { id: "analgesic", label: "Analgesic" },
      { id: "gastrointestinal", label: "Gastrointestinal" },
      { id: "antibiotic-intermediate", label: "Antibiotic Intermediates" },
      { id: "binder-coating", label: "Binders & Coatings" },
      { id: "diluent", label: "Diluents" },
      { id: "herbal-extract", label: "Herbal Extracts" },
      { id: "nutraceutical", label: "Nutraceuticals" },
    ],
    chem: [
      { id: "all", label: "All Sub-Categories" },
      { id: "analytical-solvent", label: "Analytical Solvents" },
      { id: "industrial-solvent", label: "Industrial Solvents" },
      { id: "mineral-acid", label: "Mineral Acids" },
      { id: "alkali-base", label: "Alkali Bases" },
      { id: "sulphur-product", label: "Sulphur Products" },
      { id: "pigment", label: "Pigments" },
      { id: "industrial-chemical", label: "Industrial Chemicals" },
    ],
  };

  var state = {
    division: "pharma",
    category: "all",
    subcategory: "all",
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
    var subcat = card.getAttribute("data-subcategory");
    if (state.subcategory !== "all" && subcat !== state.subcategory) return false;
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
    state.subcategory = "all";
    if (searchInput) state.query = searchInput.value;
    buildChips();
    syncTabs();
    applyFilter();
  }

  function setCategory(cat) {
    state.category = cat;
    state.subcategory = "all";
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
    state.subcategory = "all";
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

  // Drawer Logic
  var subcatOpenBtn = document.getElementById("subcat-open");
  var subcatDrawer = document.getElementById("subcat-drawer");
  var subcatOverlay = document.getElementById("subcat-overlay");
  var subcatCloseBtn = document.getElementById("subcat-close");
  var subcatList = document.getElementById("subcat-list");
  var subcatClearBtn = document.getElementById("subcat-clear");

  function buildSubcategories() {
    if (!subcatList) return;
    subcatList.innerHTML = "";
    var defs = SUBCATEGORIES[state.division] || SUBCATEGORIES.pharma;
    defs.forEach(function(def) {
      var item = document.createElement("label");
      item.className = "subcat-item";
      
      var input = document.createElement("input");
      input.type = "radio";
      input.name = "subcat-filter";
      input.value = def.id;
      if (def.id === state.subcategory) {
        input.checked = true;
      }
      
      input.addEventListener("change", function() {
        if (input.checked) {
          state.subcategory = input.value;
          // If a specific sub-category is picked, reset the main category to 'all'
          // to avoid "no results" conflicts.
          if (state.subcategory !== "all") {
            state.category = "all";
            buildChips(); 
          }
          applyFilter();
          
          // Auto-close drawer after a short delay for better UX
          setTimeout(closeDrawer, 400);
        }
      });

      var span = document.createElement("span");
      span.textContent = def.label;

      item.appendChild(input);
      item.appendChild(span);
      subcatList.appendChild(item);
    });
  }

  function openDrawer() {
    if (!subcatDrawer) return;
    buildSubcategories();
    subcatDrawer.classList.add("is-active");
    subcatOverlay.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!subcatDrawer) return;
    subcatDrawer.classList.remove("is-active");
    subcatOverlay.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  if (subcatOpenBtn) subcatOpenBtn.addEventListener("click", openDrawer);
  if (subcatCloseBtn) subcatCloseBtn.addEventListener("click", closeDrawer);
  if (subcatOverlay) subcatOverlay.addEventListener("click", closeDrawer);
  if (subcatClearBtn) {
    subcatClearBtn.addEventListener("click", function() {
      state.subcategory = "all";
      buildSubcategories();
      applyFilter();
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

        var cas = card.getAttribute("data-cas") || "N/A";
        var formula = card.getAttribute("data-formula") || "N/A";
        var compliance = card.getAttribute("data-compliance") || "N/A";
        var purity = card.getAttribute("data-purity") || "N/A";
        var appearance = card.getAttribute("data-appearance") || "N/A";
        var storage = card.getAttribute("data-storage") || "N/A";

        document.getElementById("modal-cas").textContent = cas;
        document.getElementById("modal-formula").textContent = formula;
        document.getElementById("modal-compliance").textContent = compliance;
        document.getElementById("modal-purity").textContent = purity;
        document.getElementById("modal-appearance").textContent = appearance;
        document.getElementById("modal-storage").textContent = storage;
        
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
