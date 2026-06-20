(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var searchToggle = qs('[data-search-toggle]');
    var searchPanel = qs('[data-search-panel]');
    var menuToggle = qs('[data-menu-toggle]');
    var mobileNav = qs('[data-mobile-nav]');

    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', function () {
            searchPanel.classList.toggle('is-open');
            if (searchPanel.classList.contains('is-open')) {
                var input = qs('input', searchPanel);
                if (input) {
                    setTimeout(function () {
                        input.focus();
                    }, 80);
                }
            }
        });
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var thumbs = qsa('[data-hero-thumb]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                show(Number(thumb.getAttribute('data-hero-thumb') || 0));
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    qsa('[data-filter-scope]').forEach(function (scope) {
        var textInput = qs('[data-filter-text]', scope);
        var selects = qsa('[data-filter-field]', scope);
        var cards = qsa('.movie-card', scope);

        function matchCard(card) {
            var query = textInput ? textInput.value.trim().toLowerCase() : '';
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var genre = (card.getAttribute('data-genre') || '').toLowerCase();
            var region = card.getAttribute('data-region') || '';
            var type = card.getAttribute('data-type') || '';
            var year = card.getAttribute('data-year') || '';

            if (query && title.indexOf(query) === -1 && genre.indexOf(query) === -1 && region.toLowerCase().indexOf(query) === -1 && type.toLowerCase().indexOf(query) === -1) {
                return false;
            }

            return selects.every(function (select) {
                var field = select.getAttribute('data-filter-field');
                var value = select.value;
                if (!value) {
                    return true;
                }
                if (field === 'region') {
                    return region === value;
                }
                if (field === 'type') {
                    return type === value;
                }
                if (field === 'year') {
                    return year === value;
                }
                return true;
            });
        }

        function applyFilter() {
            cards.forEach(function (card) {
                card.style.display = matchCard(card) ? '' : 'none';
            });
        }

        if (textInput) {
            textInput.addEventListener('input', applyFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
    });

    var searchPage = qs('[data-search-page]');
    if (searchPage && typeof SEARCH_ITEMS !== 'undefined') {
        var params = new URLSearchParams(window.location.search);
        var input = qs('[data-large-search-input]', searchPage);
        var results = qs('[data-search-results]', searchPage);
        var initialQuery = params.get('q') || '';

        if (input) {
            input.value = initialQuery;
        }

        function render(items) {
            if (!results) {
                return;
            }
            if (!items.length) {
                results.innerHTML = '<div class="search-empty">请输入更具体的片名、类型、地区或年份。</div>';
                return;
            }
            results.innerHTML = items.slice(0, 120).map(function (item) {
                return [
                    '<article class="movie-card movie-card-grid">',
                    '<a class="poster-link" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="poster-shade"></span>',
                    '<span class="rating-badge">' + escapeHtml(item.rating) + '</span>',
                    '<span class="type-badge">' + escapeHtml(item.type) + '</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
                    '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + item.year + ' · ' + escapeHtml(item.genre) + '</p>',
                    '<p class="card-line">' + escapeHtml(item.line) + '</p>',
                    '</div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        function search(query) {
            var normalized = query.trim().toLowerCase();
            if (!normalized) {
                render(SEARCH_ITEMS.slice(0, 60));
                return;
            }
            var items = SEARCH_ITEMS.filter(function (item) {
                var hay = [item.title, item.region, item.type, item.year, item.genre, item.line].join(' ').toLowerCase();
                return hay.indexOf(normalized) !== -1;
            });
            render(items);
        }

        if (input) {
            input.addEventListener('input', function () {
                search(input.value);
            });
        }
        search(initialQuery);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[char];
        });
    }
})();
