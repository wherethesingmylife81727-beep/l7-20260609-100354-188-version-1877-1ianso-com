(function() {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    ready(function() {
        var header = document.querySelector('.site-header');
        var toggle = document.querySelector('.nav-toggle');
        if (header && toggle) {
            toggle.addEventListener('click', function() {
                var open = header.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;
        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                showSlide(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function(panel) {
            var input = panel.querySelector('.movie-filter-input');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('.movie-filter-select'));
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));
            var empty = scope.querySelector('.not-found');
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (input && q) {
                input.value = q;
            }
            function normalized(value) {
                return (value || '').toString().trim().toLowerCase();
            }
            function apply() {
                var keyword = normalized(input ? input.value : '');
                var active = {};
                selects.forEach(function(select) {
                    if (select.value) {
                        active[select.getAttribute('data-filter')] = normalized(select.value);
                    }
                });
                var shown = 0;
                cards.forEach(function(card) {
                    var text = normalized(card.textContent + ' ' + Array.prototype.map.call(card.attributes, function(attr) { return attr.value; }).join(' '));
                    var ok = !keyword || text.indexOf(keyword) !== -1;
                    Object.keys(active).forEach(function(key) {
                        if (normalized(card.getAttribute('data-' + key)) !== active[key]) {
                            ok = false;
                        }
                    });
                    card.style.display = ok ? '' : 'none';
                    if (ok) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.style.display = shown ? 'none' : 'block';
                }
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            selects.forEach(function(select) {
                select.addEventListener('change', apply);
            });
            apply();
        });
    });
})();
