(function () {
  var header = document.getElementById("siteHeader");
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var backTop = document.querySelector("[data-back-top]");

  function onScroll() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    if (backTop) {
      backTop.classList.toggle("is-visible", window.scrollY > 420);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startHero();
      });
    });

    hero.addEventListener("mouseenter", stopHero);
    hero.addEventListener("mouseleave", startHero);
    showSlide(0);
    startHero();
  }

  function renderSearchResults(input, resultsBox) {
    var query = input.value.trim().toLowerCase();
    if (!query || !window.MOVIE_SEARCH_INDEX) {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("is-open");
      return;
    }

    var matches = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      return item.text.indexOf(query) !== -1;
    }).slice(0, 10);

    if (!matches.length) {
      resultsBox.innerHTML = "";
      resultsBox.classList.remove("is-open");
      return;
    }

    resultsBox.innerHTML = matches.map(function (item) {
      return "<a class=\"search-result-item\" href=\"" + item.url + "\"><strong>" + item.title + "</strong><span>" + item.year + " · " + item.type + " · " + item.region + "</span></a>";
    }).join("");
    resultsBox.classList.add("is-open");
  }

  document.querySelectorAll("[data-search-shell]").forEach(function (shell) {
    var input = shell.querySelector("[data-site-search]");
    var resultsBox = shell.querySelector("[data-search-results]");
    if (!input || !resultsBox) {
      return;
    }
    input.addEventListener("input", function () {
      renderSearchResults(input, resultsBox);
    });
    document.addEventListener("click", function (event) {
      if (!shell.contains(event.target)) {
        resultsBox.classList.remove("is-open");
      }
    });
  });

  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var pageSearch = filterBar.querySelector("[data-page-search]");
    var typeSelect = filterBar.querySelector("[data-filter-type]");
    var yearSelect = filterBar.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));

    function applyFilters() {
      var query = pageSearch ? pageSearch.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !typeValue || card.dataset.type === typeValue;
        var matchesYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle("is-hidden-by-filter", !(matchesQuery && matchesType && matchesYear));
      });
    }

    [pageSearch, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }
})();
