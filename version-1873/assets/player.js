(function() {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader="1"]');
        if (existing) {
            existing.addEventListener('load', callback);
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', '1');
        script.addEventListener('load', callback);
        document.head.appendChild(script);
    }

    function setupPlayer(video) {
        var box = video.closest('.player-box');
        var startButton = box ? box.querySelector('.player-start') : null;
        var source = video.querySelector('source');
        var url = source ? source.getAttribute('src') : video.getAttribute('src');
        var attached = false;

        function markPlaying() {
            if (box) {
                box.classList.add('is-playing');
            }
        }

        function attach(done) {
            if (!url) {
                if (done) {
                    done();
                }
                return;
            }
            if (attached) {
                if (done) {
                    done();
                }
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                attached = true;
                if (done) {
                    done();
                }
                return;
            }
            loadHls(function() {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ maxBufferLength: 30 });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    video.hlsPlayer = hls;
                    attached = true;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        if (done) {
                            done();
                        }
                    });
                } else {
                    video.src = url;
                    attached = true;
                    if (done) {
                        done();
                    }
                }
            });
        }

        function start() {
            attach(function() {
                var playResult = video.play();
                if (playResult && playResult.catch) {
                    playResult.catch(function() {});
                }
                markPlaying();
            });
        }

        attach();
        if (startButton) {
            startButton.addEventListener('click', start);
        }
        video.addEventListener('click', function() {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', markPlaying);
    }

    ready(function() {
        Array.prototype.slice.call(document.querySelectorAll('video.movie-player')).forEach(setupPlayer);
    });
})();
