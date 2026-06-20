(function () {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('.filter-area').forEach(function (area) {
    const searchInput = area.querySelector('[data-card-search]');
    const yearButtons = Array.from(area.querySelectorAll('[data-filter-year]'));
    const categoryButtons = Array.from(area.querySelectorAll('[data-filter-category]'));
    const cards = Array.from(area.querySelectorAll('.movie-card, .rank-row'));
    let activeYear = 'all';
    let activeCategory = 'all';

    function matchCard(card, query) {
      const title = card.getAttribute('data-title') || '';
      const year = card.getAttribute('data-year') || '';
      const region = card.getAttribute('data-region') || '';
      const type = card.getAttribute('data-type') || '';
      const keywords = card.getAttribute('data-keywords') || '';
      const text = [title, year, region, type, keywords].join(' ').toLowerCase();
      const cardHref = card.querySelector('a[href]');
      const href = cardHref ? cardHref.getAttribute('href') : '';
      const categoryName = card.querySelector('.type-badge') ? card.querySelector('.type-badge').textContent : '';
      const categoryOk = activeCategory === 'all' || (categoryName && text.indexOf(activeCategory.toLowerCase()) !== -1) || href.indexOf(activeCategory) !== -1;
      const yearOk = activeYear === 'all' || year === activeYear;
      return categoryOk && yearOk && (!query || text.indexOf(query) !== -1);
    }

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', !matchCard(card, query));
      });
    }

    if (searchInput) {
      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get('q');
      if (initialQuery) {
        searchInput.value = initialQuery;
      }
      searchInput.addEventListener('input', applyFilters);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeYear = button.getAttribute('data-filter-year') || 'all';
        yearButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-filter-category') || 'all';
        categoryButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  });
})();
