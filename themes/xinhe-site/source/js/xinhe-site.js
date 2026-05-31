(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var filterButtons = bySelector("[data-filter]");
    var searchableItems = bySelector("[data-topic]");
    var searchInput = document.querySelector("[data-search]");

    if (filterButtons.length === 0 || searchableItems.length === 0) return;

    var activeFilter = "all";
    var searchTerm = "";

    function render() {
      filterButtons.forEach(function (button) {
        button.classList.toggle("is-active", button.getAttribute("data-filter") === activeFilter);
      });

      searchableItems.forEach(function (item) {
        var topic = item.getAttribute("data-topic") || "";
        var text = normalizeText(item.textContent);
        var matchesFilter = activeFilter === "all" || topic.indexOf(activeFilter) !== -1;
        var matchesSearch = searchTerm === "" || text.indexOf(searchTerm) !== -1;
        item.classList.toggle("is-hidden", !matchesFilter || !matchesSearch);
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter") || "all";
        render();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchTerm = normalizeText(searchInput.value);
        render();
      });
    }

    render();
  }

  function setupThemeToggle() {
    var toggles = bySelector("[data-theme-toggle]");
    var storageKey = "xinhe-site-theme";
    var defaultTheme = "light";
    var html = document.documentElement;
    var isChinese = (html.getAttribute("lang") || "").indexOf("zh") === 0;

    function readTheme() {
      try {
        return localStorage.getItem(storageKey) || defaultTheme;
      } catch (error) {
        return defaultTheme;
      }
    }

    function writeTheme(theme) {
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {}
    }

    function applyTheme(theme) {
      var nextTheme = theme === "dark" ? "dark" : "light";
      html.setAttribute("data-theme", nextTheme);
      toggles.forEach(function (toggle) {
        var showDarkToggle = nextTheme !== "dark";
        toggle.textContent = showDarkToggle ? "●" : "○";
        toggle.setAttribute("title", showDarkToggle
          ? (isChinese ? "黑色风格" : "Dark style")
          : (isChinese ? "白色风格" : "White style"));
        toggle.setAttribute("aria-label", showDarkToggle
          ? (isChinese ? "切换到黑色风格" : "Switch to dark style")
          : (isChinese ? "切换到白色风格" : "Switch to light style"));
        toggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
      });
    }

    var currentTheme = readTheme();
    applyTheme(currentTheme);

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        currentTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
        writeTheme(currentTheme);
        applyTheme(currentTheme);
      });
    });
  }

  function setupContactDraft() {
    var form = document.querySelector("[data-contact-form]");
    var preview = document.querySelector("[data-contact-preview]");
    if (!form || !preview) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var isChinese = (document.documentElement.getAttribute("lang") || "").indexOf("zh") === 0;
      var name = form.querySelector("[name='name']").value.trim() || (isChinese ? "你的名字" : "Your name");
      var topic = form.querySelector("[name='topic']").value.trim() || (isChinese ? "技术交流" : "Technical conversation");
      var message = form.querySelector("[name='message']").value.trim() || (isChinese
        ? "我想交流一个技术主题，可能与实验、推荐、因果测量或应用人工智能有关。"
        : "I would like to discuss a technical topic around experimentation, recommendation, causal measurement, or applied AI.");

      preview.textContent = isChinese
        ? "主题：" + topic + "\n\n昕和你好，\n\n" + message + "\n\n祝好，\n" + name
        : "Subject: " + topic + "\n\nHi Charles,\n\n" + message + "\n\nBest,\n" + name;
    });
  }

  setupFilters();
  setupThemeToggle();
  setupContactDraft();
})();
