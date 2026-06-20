(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var activate = function (next) {
      index = next;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    };
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        activate(position);
      });
    });
    window.setInterval(function () {
      activate((index + 1) % slides.length);
    }, 5200);
  }

  function setupSearchAndFilters() {
    var input = document.querySelector('[data-site-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var empty = document.querySelector('[data-no-results]');
    var currentFilter = 'all';
    var currentKey = 'all';
    var update = function () {
      var query = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;
      cards.forEach(function (card) {
        var searchable = (card.getAttribute('data-search') || '').toLowerCase();
        var filterValue = currentFilter === 'all' ? 'all' : (card.getAttribute('data-' + currentKey) || '');
        var matchesText = !query || searchable.indexOf(query) !== -1;
        var matchesFilter = currentFilter === 'all' || filterValue === currentFilter;
        var visible = matchesText && matchesFilter;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    };
    if (input) {
      input.addEventListener('input', update);
    }
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (other) {
          other.classList.remove('active');
        });
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter-value') || 'all';
        currentKey = button.getAttribute('data-filter-key') || 'all';
        update();
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-layer');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-stream');
      var hlsInstance = null;
      var prepare = function () {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute('data-ready', 'true');
      };
      var start = function () {
        prepare();
        video.controls = true;
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      };
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearchAndFilters();
    setupPlayers();
  });
})();
