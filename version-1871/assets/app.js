
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.movie-filter'));
    if (!forms.length) {
      return;
    }

    forms.forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var grid = form.closest('section') ? form.closest('section').querySelector('.searchable-grid') : document.querySelector('.searchable-grid');
      var empty = form.closest('section') ? form.closest('section').querySelector('.filter-empty') : document.querySelector('.filter-empty');
      if (!input || !grid) {
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');
      if (initialQuery && form.classList.contains('global-filter')) {
        input.value = initialQuery;
      }

      function filter() {
        var query = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
          var keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var matched = !query || keywords.indexOf(query) !== -1 || title.indexOf(query) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        filter();
      });
      input.addEventListener('input', filter);
      filter();
    });
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var stream = shell.getAttribute('data-stream') || (button ? button.getAttribute('data-stream') : '');
      var hlsInstance = null;
      var started = false;

      if (!video || !button || !stream) {
        return;
      }

      function attachStream() {
        if (started) {
          return;
        }
        started = true;
        shell.classList.add('is-playing');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
            started = false;
          });
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        attachStream();
      });

      shell.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('button')) {
          return;
        }
        attachStream();
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
