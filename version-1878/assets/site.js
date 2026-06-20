(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("form[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function textOf(element) {
    return (element || "").toString().toLowerCase();
  }

  function setupFilters() {
    var grids = document.querySelectorAll("[data-filter-grid]");
    grids.forEach(function (grid) {
      var scope = grid.closest("[data-filter-scope]") || document;
      var keywordInput = scope.querySelector("[data-filter-keyword]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var emptyState = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

      function apply() {
        var keyword = textOf(keywordInput && keywordInput.value.trim());
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var search = textOf(card.getAttribute("data-search"));
          var matchKeyword = !keyword || search.indexOf(keyword) !== -1;
          var matchYear = !year || card.getAttribute("data-year") === year;
          var matchType = !type || card.getAttribute("data-type") === type;
          var matchRegion = !region || card.getAttribute("data-region") === region;
          var shouldShow = matchKeyword && matchYear && matchType && matchRegion;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && keywordInput) {
        keywordInput.value = query;
      }
      apply();
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll(".video-shell[data-video]");
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var cover = shell.querySelector(".video-cover");
      var button = shell.querySelector(".play-button");
      var playlist = shell.getAttribute("data-video");
      var hls = null;
      var started = false;

      function begin() {
        if (!video || !playlist) {
          return;
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(playlist);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = playlist;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", begin);
      }
      if (cover) {
        cover.addEventListener("click", begin);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            begin();
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
