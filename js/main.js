/*
 ╔═══════════════════════════════════════════════════════════╗
 ║   P R O F E S S O R E N T E   ·   M A I N                 ║
 ╚═══════════════════════════════════════════════════════════╝
*/
(function () {
  'use strict';

  var TAG = '[ProfessorEnte]';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = window.PE_DATA || {};
  var C = window.PE_CONFIG || {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Gemeinsamer Zustand zwischen Mini-Demo und EKG */
  var stress = 0;
  var rippleAdd = function () {};

  /* ───────────── Hero-Titel ───────────── */
  function initTitle() {
    var h = $('#heroTitle');
    if (!h) return;
    var text = 'ProfessorEnte';
    h.innerHTML = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch;
      h.appendChild(s);
    });
  }

  /* ───────────── Wasser-Wellen im Hero ───────────── */
  function initRipples() {
    var hero = $('#hero');
    var cv = $('#rippleCanvas');
    if (!hero || !cv || reduce) return;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, rings = [], raf = 0, visible = true, last = 0, lastX = -999, lastY = -999, dripT = 0;

    function size() {
      var r = cv.getBoundingClientRect();
      var d = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function add(x, y, s) {
      rings.push({ x: x, y: y, r: 4, a: .38 * (s || 1), v: 80 + Math.random() * 40 });
      if (rings.length > 46) rings.shift();
      start();
    }
    rippleAdd = function (clientX, clientY, s) {
      var b = cv.getBoundingClientRect();
      add(clientX - b.left, clientY - b.top, s);
    };
    function frame(t) {
      var dt = Math.min((t - last) / 1000 || 0, .05);
      last = t;
      ctx.clearRect(0, 0, W, H);
      dripT -= dt;
      if (dripT <= 0) { add(Math.random() * W, Math.random() * H, .6); dripT = 1.6 + Math.random() * 1.8; }
      for (var i = rings.length - 1; i >= 0; i--) {
        var g = rings[i];
        g.r += g.v * dt;
        g.a -= dt * .16;
        if (g.a <= 0) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.ellipse(g.x, g.y, g.r, g.r * .42, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(47,122,133,' + g.a.toFixed(3) + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      raf = visible ? requestAnimationFrame(frame) : 0;
    }
    function start() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    size();
    window.addEventListener('resize', size);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(hero);
    hero.addEventListener('pointermove', function (e) {
      var b = cv.getBoundingClientRect();
      var x = e.clientX - b.left, y = e.clientY - b.top;
      if (Math.hypot(x - lastX, y - lastY) > 46) { add(x, y, 1); lastX = x; lastY = y; }
    });
    hero.addEventListener('pointerdown', function (e) {
      var b = cv.getBoundingClientRect();
      var x = e.clientX - b.left, y = e.clientY - b.top;
      add(x, y, 1.4);
      setTimeout(function () { add(x, y, 1); }, 140);
      setTimeout(function () { add(x, y, .7); }, 300);
    });
    start();

    /* Landung der Ente erzeugt die ersten Wellen */
    setTimeout(function () {
      var d = $('#duck');
      if (!d) return;
      var b = d.getBoundingClientRect();
      var cx = b.left + b.width / 2, cy = b.top + b.height * .8;
      rippleAdd(cx, cy, 1.6);
      setTimeout(function () { rippleAdd(cx, cy, 1.2); }, 180);
      setTimeout(function () { rippleAdd(cx, cy, .9); }, 380);
    }, 2350);
  }

  /* ───────────── Augen der Ente ───────────── */
  function initEyes() {
    var svg = $('#duck'), L = $('#pupilL'), R = $('#pupilR');
    if (!svg || !L || !R || reduce) return;
    var eyes = [{ el: L, x: 254, y: 130 }, { el: R, x: 306, y: 130 }];
    function look(cx, cy) {
      var m = svg.getScreenCTM();
      if (!m) return;
      eyes.forEach(function (e) {
        var pt = svg.createSVGPoint();
        pt.x = e.x; pt.y = e.y;
        var s = pt.matrixTransform(m);
        var dx = cx - s.x, dy = cy - s.y;
        var d = Math.hypot(dx, dy) || 1;
        var k = Math.min(1, d / 160);
        e.el.style.transform = 'translate(' + (dx / d * 10 * k).toFixed(2) + 'px,' + (dy / d * 10 * k).toFixed(2) + 'px)';
      });
    }
    window.addEventListener('pointermove', function (e) { look(e.clientX, e.clientY); }, { passive: true });
    document.addEventListener('pointerleave', function () {
      eyes.forEach(function (e) { e.el.style.transform = ''; });
    });
    var hint = $('#duckHint');
    window.addEventListener('pointermove', function once() {
      if (hint) hint.style.opacity = '0';
      window.removeEventListener('pointermove', once);
    }, { passive: true });
  }

  /* ───────────── Verstecktes Elena-Easter-Egg ───────────── */
  function initEasterEgg() {
    var duck = $('#duck'), egg = $('#elenaEgg');
    if (!duck || !egg) return;
    var closeButton = $('.egg-close', egg), count = 0, lastTap = 0, resetTimer = 0, closeTimer = 0;

    function open() {
      clearTimeout(closeTimer);
      egg.hidden = false;
      egg.setAttribute('aria-hidden', 'false');
      document.body.classList.add('egg-open');
      requestAnimationFrame(function () { egg.classList.add('is-open'); });
      if (closeButton) closeButton.focus();
      count = 0;
    }
    function close() {
      egg.classList.remove('is-open');
      egg.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('egg-open');
      duck.focus();
      closeTimer = setTimeout(function () { egg.hidden = true; }, 500);
    }
    function tap() {
      var now = Date.now();
      count = now - lastTap < 2200 ? count + 1 : 1;
      lastTap = now;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () { count = 0; }, 2200);
      duck.classList.remove('egg-tap');
      void duck.getBoundingClientRect();
      duck.classList.add('egg-tap');
      setTimeout(function () { duck.classList.remove('egg-tap'); }, 420);
      if (count >= 5) open();
    }

    duck.addEventListener('click', tap);
    duck.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); tap(); }
    });
    $$('[data-egg-close]', egg).forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !egg.hidden) close();
    });
  }

  /* ───────────── MP3-Playlist ───────────── */
  function initMusic() {
    var audio = $('#musicAudio'), button = $('#musicToggle'), slider = $('#musicVolume');
    var select = $('#musicTrack'), title = $('#musicTitle'), state = $('#musicState'), player = $('#musicPlayer');
    var previous = $('#musicPrevious'), next = $('#musicNext');
    var hero = $('#hero'), sceneVideo = $('#musicVideoBackdrop');
    if (!audio || !button || !slider || !select || !title || !state || !player) return;
    var musicScenes = ['music-galaxy', 'music-golden', 'music-disco', 'music-ducklings', 'music-disco', 'music-devil', 'music-video'];

    function selectedUrl() { return new URL(select.value, document.baseURI).href; }
    function updateUI() {
      var playing = !audio.paused && !audio.ended;
      title.textContent = select.options[select.selectedIndex].text;
      button.textContent = playing ? 'Ⅱ' : '▶';
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      button.setAttribute('aria-label', playing ? 'Musik pausieren' : 'Musik starten');
      player.classList.toggle('is-playing', playing);
      state.textContent = playing ? 'Spielt gerade' : 'Bereit zum Abspielen';
      if (hero) {
        hero.classList.remove('music-galaxy', 'music-golden', 'music-disco', 'music-ducklings', 'music-devil', 'music-video');
        var scene = musicScenes[select.selectedIndex];
        if (scene && (scene !== 'music-video' || playing)) hero.classList.add(scene);
        hero.classList.toggle('music-playing', playing);
        if (sceneVideo) {
          if (playing && select.selectedIndex === 6) {
            var videoPromise = sceneVideo.play();
            if (videoPromise && videoPromise.catch) videoPromise.catch(function () { state.textContent = 'Video-Hintergrund konnte nicht gestartet werden'; });
          } else {
            sceneVideo.pause();
            try { sceneVideo.currentTime = 0; } catch (error) {}
          }
        }
      }
    }
    function loadSelected() {
      var url = selectedUrl();
      if (audio.src !== url) { audio.src = url; audio.load(); }
    }
    function playSelected() {
      loadSelected();
      audio.volume = Number(slider.value) / 100;
      audio.play().catch(function () { state.textContent = 'Dieser Titel konnte nicht gestartet werden'; });
    }
    function moveTrack(direction, autoplay) {
      select.selectedIndex = (select.selectedIndex + direction + select.options.length) % select.options.length;
      audio.pause();
      loadSelected();
      if (autoplay) playSelected();
      else updateUI();
    }

    button.addEventListener('click', function () {
      if (!audio.paused && !audio.ended) audio.pause();
      else playSelected();
    });
    select.addEventListener('change', function () {
      var autoplay = !audio.paused && !audio.ended;
      audio.pause(); loadSelected();
      if (autoplay) playSelected();
      else updateUI();
    });
    if (previous) previous.addEventListener('click', function () {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      moveTrack(-1, !audio.paused && !audio.ended);
    });
    if (next) next.addEventListener('click', function () { moveTrack(1, !audio.paused && !audio.ended); });
    slider.addEventListener('input', function () { audio.volume = Number(slider.value) / 100; });
    audio.addEventListener('play', updateUI);
    audio.addEventListener('pause', updateUI);
    audio.addEventListener('ended', function () {
      if (sceneVideo) { sceneVideo.pause(); try { sceneVideo.currentTime = 0; } catch (error) {} }
      moveTrack(1, true);
    });
    audio.addEventListener('error', function () { state.textContent = 'Datei konnte nicht geladen werden'; });
    select.addEventListener('change', updateUI);
    document.addEventListener('visibilitychange', function () { if (document.hidden) audio.pause(); });
    updateUI();
  }

  /* ───────────── Fortschritt und Navigation ───────────── */
  function initProgress() {
    var bar = $('#progressBar'), duck = $('#progressDuck');
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
      duck.style.left = (p * 100) + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ───────────── Designwahl und Entenregen ───────────── */
  function initThemeStudio() {
    var toggle = $('#themeToggle'), panel = $('#themePanel'), rain = $('#duckRain');
    if (!toggle || !panel || !rain) return;
    var choices = $$('.theme-option', panel), timer = 0;
    var emojis = ['🐤', '🐣', '🦆', '🐥'];
    var theme = 'light';
    try { theme = localStorage.getItem('professorente-theme') || 'light'; } catch (_) {}
    if (!['light', 'duck', 'dark'].includes(theme)) theme = 'light';

    function makeDuck() {
      if (document.body.dataset.theme !== 'duck' || reduce) return;
      while (rain.childElementCount > 25) rain.firstElementChild.remove();
      var duck = document.createElement('span');
      duck.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      duck.style.setProperty('--x', (Math.random() * 96) + 'vw');
      duck.style.setProperty('--size', (1 + Math.random() * 1.15) + 'rem');
      duck.style.setProperty('--duration', (6 + Math.random() * 6) + 's');
      duck.style.setProperty('--drift', ((Math.random() - .5) * 24) + 'vw');
      rain.appendChild(duck);
      duck.addEventListener('animationend', function () { duck.remove(); }, { once: true });
    }

    function setTheme(value) {
      theme = value;
      document.body.dataset.theme = value;
      choices.forEach(function (button) {
        button.setAttribute('aria-pressed', button.dataset.themeChoice === value ? 'true' : 'false');
      });
      clearInterval(timer);
      rain.replaceChildren();
      if (value === 'duck' && !reduce) {
        for (var i = 0; i < 7; i++) setTimeout(makeDuck, i * 180);
        timer = setInterval(makeDuck, 680);
      }
      try { localStorage.setItem('professorente-theme', value); } catch (_) {}
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      if (open) choices[0].focus();
    });
    choices.forEach(function (button) {
      button.addEventListener('click', function () { setTheme(button.dataset.themeChoice); });
    });
    document.addEventListener('click', function (event) {
      if (!panel.hidden && !event.target.closest('.theme-tools')) {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
    setTheme(theme);
  }

  /* ───────────── Kleine Extras ───────────── */
  function initSoundEffects() {
    var toggle = $('#soundToggle'), label = $('.sound-toggle-label', toggle), state = $('.sound-toggle-state', toggle);
    var enabled = false, context = null;
    try { enabled = localStorage.getItem('professorente-sounds') === 'on'; } catch (_) {}
    if (toggle) {
      toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      label.textContent = 'Soundeffekte: ' + (enabled ? 'an' : 'aus');
      state.textContent = enabled ? 'ON' : 'OFF';
      toggle.addEventListener('click', function () {
        enabled = !enabled;
        toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        label.textContent = 'Soundeffekte: ' + (enabled ? 'an' : 'aus');
        state.textContent = enabled ? 'ON' : 'OFF';
        try { localStorage.setItem('professorente-sounds', enabled ? 'on' : 'off'); } catch (_) {}
        if (enabled) play('ui');
      });
    }
    function play(kind) {
      if (!enabled) return;
      var Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      try {
        context = context || new Audio();
        if (context.state === 'suspended') context.resume();
        var now = context.currentTime, osc = context.createOscillator(), gain = context.createGain();
        osc.type = kind === 'duck' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(kind === 'duck' ? 430 : 620, now);
        osc.frequency.exponentialRampToValueAtTime(kind === 'duck' ? 245 : 880, now + (kind === 'duck' ? .13 : .075));
        gain.gain.setValueAtTime(.0001, now);
        gain.gain.exponentialRampToValueAtTime(kind === 'duck' ? .11 : .045, now + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'duck' ? .16 : .11));
        osc.connect(gain); gain.connect(context.destination);
        osc.start(now); osc.stop(now + .18);
      } catch (_) {}
    }
    document.addEventListener('click', function (event) {
      var target = event.target.closest && event.target.closest('#themeToggle,[data-theme-choice],#duck,.card-toggle,.project-details summary,#scrollTop,.duck-collectible,.leaderboard-vote,.map-place-button');
      if (!target) return;
      play(target.id === 'duck' ? 'duck' : 'ui');
    });
  }

  function initDuckInteraction() {
    var duck = $('#duck'), bubble = $('#duckReaction');
    if (!duck || !bubble) return;
    var lines = ['Quak! 🐤', 'Na, was gibt’s?', 'Ente im Anflug! ✨', 'Quak quak! 🦆'];
    var index = 0, reset = 0;
    duck.addEventListener('click', function () {
      if (document.body.dataset.theme === 'duck') bubble.textContent = ['Quak! 🐤', 'Gelbe Grüße! ✨', 'Watschel watschel! 🐥'][index % 3];
      else if (document.body.dataset.theme === 'dark') bubble.textContent = ['Quak im Dunkeln! 🌙', 'Pssst … 🦆', 'Nacht-Quak! ✨'][index % 3];
      else bubble.textContent = lines[index % lines.length];
      index++;
      bubble.classList.remove('is-active');
      duck.classList.remove('duck-cheer');
      void duck.getBoundingClientRect();
      bubble.classList.add('is-active');
      duck.classList.add('duck-cheer');
      clearTimeout(reset);
      reset = setTimeout(function () { bubble.classList.remove('is-active'); duck.classList.remove('duck-cheer'); }, 1500);
    });
  }

  function initPageLoader() {
    var loader = $('#siteLoader');
    if (!loader) return;
    setTimeout(function () {
      loader.classList.add('is-leaving');
      document.documentElement.classList.remove('has-site-loader');
      setTimeout(function () { loader.hidden = true; }, 650);
    }, reduce ? 100 : 720);
  }

  function initVisitorCounter() {
    var count = $('#visitorCount');
    if (!count || !window.fetch) return;
    var key = 'professorente-einfachentenfutter-homepage', endpoint = 'https://countapi.mileshilliard.com/api/v1/';
    var seenThisSession = false;
    try { seenThisSession = sessionStorage.getItem('professorente-visit-counted') === 'yes'; } catch (_) {}
    fetch(endpoint + (seenThisSession ? 'get/' : 'hit/') + key, { cache: 'no-store', mode: 'cors' })
      .then(function (response) { if (!response.ok) throw new Error('Counter unavailable'); return response.json(); })
      .then(function (data) {
        count.textContent = Number(data.value).toLocaleString('de-DE');
        if (!seenThisSession) try { sessionStorage.setItem('professorente-visit-counted', 'yes'); } catch (_) {}
      })
      .catch(function () { count.textContent = '—'; count.title = 'Besucherzähler gerade nicht erreichbar'; });
  }

  function initScrollTop() {
    var button = $('#scrollTop');
    if (!button) return;
    function update() {
      var visible = window.scrollY > Math.max(420, window.innerHeight * .65);
      button.classList.toggle('is-visible', visible);
      button.setAttribute('aria-hidden', visible ? 'false' : 'true');
      button.tabIndex = visible ? 0 : -1;
    }
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    update();
  }

  function initNav() {
    var t = $('#navToggle'), l = $('#navLinks');
    t.addEventListener('click', function () {
      var open = l.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    $$('a', l).forEach(function (a) {
      a.addEventListener('click', function () {
        l.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ───────────── Einblenden beim Scrollen ───────────── */
  function initReveal() {
    var els = $$('.reveal, .reveal-clip');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e, i) {
      e.style.transitionDelay = (e.classList.contains('reveal') ? (i % 3) * 70 : 0) + 'ms';
      io.observe(e);
    });
  }

  /* ───────────── Rollen ───────────── */
  function initRoles() {
    var tabs = $('#roleTabs'), panel = $('#rolePanel');
    if (!tabs || !panel || !D.roles) return;
    var current = 0;
    D.roles.forEach(function (r, i) {
      var b = document.createElement('button');
      b.className = 'role-tab';
      b.type = 'button';
      b.id = 'tab-' + r.id;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'rolePanel');
      b.textContent = r.label;
      b.addEventListener('click', function () { select(i, true); });
      tabs.appendChild(b);
    });
    function select(i, animate) {
      current = i;
      var r = D.roles[i];
      $$('.role-tab', tabs).forEach(function (b, j) {
        b.setAttribute('aria-selected', j === i ? 'true' : 'false');
        b.tabIndex = j === i ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', 'tab-' + r.id);
      panel.innerHTML = '<h3>' + esc(r.headline) + '</h3><p>' + esc(r.text) + '</p><ul>' +
        r.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>';
      panel.classList.remove('swap');
      if (animate && !reduce) { void panel.offsetWidth; panel.classList.add('swap'); }
    }
    tabs.addEventListener('keydown', function (e) {
      var k = e.key, n = D.roles.length, i = current;
      if (k === 'ArrowRight' || k === 'ArrowDown') i = (i + 1) % n;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') i = (i - 1 + n) % n;
      else return;
      e.preventDefault();
      select(i, true);
      $$('.role-tab', tabs)[i].focus();
    });
    select(0, false);
  }

  /* ───────────── Scripts ───────────── */
  function initScripts() {
    var grid = $('#scriptGrid'), filters = $('#scriptFilters');
    if (!grid || !D.scripts) return;
    $('#scriptCount').textContent = D.scripts.length;

    D.scripts.forEach(function (s, i) {
      var a = document.createElement('article');
      a.className = 'script-card' + (s.featured ? ' featured' : '');
      a.dataset.cat = s.cat;
      a.style.setProperty('--i', i);
      var id = 'more-' + i;
      a.innerHTML =
        '<span class="card-cat">' + esc(s.cat) + '</span>' +
        '<h3>' + esc(s.name) + '</h3>' +
        '<p>' + esc(s.desc) + '</p>' +
        '<ul class="stack">' + s.stack.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<button class="card-toggle" type="button" aria-expanded="false" aria-controls="' + id + '"><i></i><span>Details anzeigen</span></button>' +
        '<div class="card-more" id="' + id + '"><div><ul>' +
        s.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul></div></div>';
      var btn = $('.card-toggle', a);
      btn.addEventListener('click', function () {
        var open = a.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        $('span', btn).textContent = open ? 'Details ausblenden' : 'Details anzeigen';
      });
      grid.appendChild(a);
    });

    (D.categories || []).forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = c;
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        $$('.chip', filters).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var n = 0;
        $$('.script-card', grid).forEach(function (card) {
          var show = c === 'Alle' || card.dataset.cat === c;
          card.classList.toggle('hidden', !show);
          if (show) card.style.setProperty('--i', n++);
        });
      });
      filters.appendChild(b);
    });
  }

  /* ───────────── Marquee ───────────── */
  function initMarquee() {
    var t = $('#marqueeTrack');
    if (!t || !D.stack) return;
    var html = D.stack.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
    t.innerHTML = html + html;
  }

  /* ───────────── Projekte und Lernfelder ───────────── */
  function initProjects() {
    var ul = $('#projectList'), filters = $('#projectFilters'), search = $('#projectSearch'), result = $('#projectResultCount');
    if (!ul || !D.projects) return;
    var activeCategory = 'Alle';
    function normalized(value) {
      return String(value || '').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    ul.innerHTML = D.projects.map(function (p) {
      var tags = p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
      var detailList = (p.details || []).map(function (line) { return '<li>' + esc(line) + '</li>'; }).join('');
      var category = p.category || 'Weitere';
      var searchable = normalized([p.title, p.desc, p.category, (p.tags || []).join(' '), (p.details || []).join(' ')].join(' '));
      var details = detailList ? '<details class="project-details"><summary>Projekt-Details ansehen</summary><div class="project-detail-content"><ul>' + detailList + '</ul>' +
        (p.url ? '<a class="project-detail-link" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.linkLabel || 'Projekt öffnen') + ' ↗</a>' : '') +
        '</div></details>' : '';
      if (p.title === 'Audi-Autohaus-Website') {
        return '<li class="reveal project-audi" data-category="' + esc(category) + '" data-search="' + esc(searchable) + '"><div class="audi-montage" id="audiMontage">' +
          '<canvas id="audiMontageCanvas" aria-label="3D-Montage: Das originale Audi-RS-6-Modell setzt sich aus bewegten Bauteilen zusammen."></canvas>' +
          '<div class="audi-loading" id="audiLoading" role="status" aria-live="polite"><span class="audi-spinner" aria-hidden="true"></span><span id="audiLoadingCopy">Der Audi RS 6 wird in den Showroom geladen …</span></div>' +
          '<div class="audi-montage-glow" aria-hidden="true"></div>' +
          '<div class="audi-montage-top"><span class="audi-kicker"><i></i> THREE.JS · RS 6 AVANT</span><div class="audi-top-actions"><span class="audi-build-state" id="audiBuildState">MONTAGE LÄUFT</span>' +
          '<button class="audi-replay" id="audiReplay" type="button"><span aria-hidden="true">↻</span> Montage neu starten</button></div></div>' +
          '<div class="audi-montage-bottom"><div><span class="audi-index">01 / QUATTRO</span><h3>Audi, Stück für Stück.</h3><p>Der RS 6. Neu zusammengesetzt im Raum.</p></div></div>' +
          '<span class="audi-hint" aria-hidden="true">Ziehen zum Drehen <span>↔</span></span></div>' +
          '<div class="project-audi-copy"><div><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' + details + '</div><div class="tags">' + tags + '</div></div></li>';
      }
      return '<li class="reveal project-has-details" data-category="' + esc(category) + '" data-search="' + esc(searchable) + '"><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p><div class="tags">' + tags + '</div>' + details + '</li>';
    }).join('');
    var categories = ['Alle'].concat(Array.from(new Set(D.projects.map(function (p) { return p.category || 'Weitere'; }))));
    function applyProjectFilters() {
      var query = normalized(search ? search.value.trim() : ''), visible = 0;
      $$('.project-list > li', ul).forEach(function (item) {
        var categoryMatch = activeCategory === 'Alle' || item.dataset.category === activeCategory;
        var queryMatch = !query || (item.dataset.search || '').indexOf(query) !== -1;
        var show = categoryMatch && queryMatch;
        item.classList.toggle('project-filtered-out', !show);
        if (show) visible++;
      });
      if (result) result.textContent = visible === 0 ? 'Keine passenden Projekte gefunden.' : visible + (visible === 1 ? ' Projekt' : ' Projekte');
    }
    if (filters) {
      filters.innerHTML = categories.map(function (category, index) {
        return '<button type="button" class="chip project-filter" data-project-category="' + esc(category) + '" aria-pressed="' + (index === 0 ? 'true' : 'false') + '">' + esc(category) + '</button>';
      }).join('');
      $$('.project-filter', filters).forEach(function (button) {
        button.addEventListener('click', function () {
          activeCategory = button.dataset.projectCategory;
          $$('.project-filter', filters).forEach(function (item) { item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
          applyProjectFilters();
        });
      });
    }
    if (search) search.addEventListener('input', applyProjectFilters);
    applyProjectFilters();
    if (window.PE_AUDI_MONTAGE) window.PE_AUDI_MONTAGE.init();
  }

  function initProjectLeaderboard() {
    var list = $('#projectLeaderboard'), status = $('#leaderboardStatus');
    if (!list || !D.projects || !window.fetch) return;
    var endpoint = 'https://countapi.mileshilliard.com/api/v1/';
    var voteKey = 'professorente-project-vote';
    var votedProject = '';
    try { votedProject = localStorage.getItem(voteKey) || ''; } catch (_) {}
    var entries = D.projects.map(function (project, index) {
      var slug = normalizedProjectName(project.slug || project.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return { project: project, index: index, key: 'professorente-vote-' + slug, votes: 0 };
    });

    function normalizedProjectName(name) {
      return String(name || '').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    function getCount(entry) {
      return fetch(endpoint + 'get/' + entry.key, { cache: 'no-store', mode: 'cors' }).then(function (response) {
        if (response.status === 404) return { value: 0 };
        if (!response.ok) throw new Error('Stimmen konnten nicht geladen werden');
        return response.json();
      }).then(function (data) { entry.votes = Number(data.value) || 0; });
    }
    function render() {
      entries.sort(function (a, b) { return b.votes - a.votes || a.index - b.index; });
      list.replaceChildren();
      entries.forEach(function (entry, index) {
        var row = document.createElement('li');
        row.className = 'leaderboard-row';
        var rank = document.createElement('span'); rank.className = 'leaderboard-rank'; rank.textContent = String(index + 1).padStart(2, '0');
        var copy = document.createElement('span'); copy.className = 'leaderboard-project';
        var title = document.createElement('strong'); title.textContent = entry.project.title;
        var category = document.createElement('small'); category.textContent = entry.project.category || 'Projekt';
        copy.append(title, category);
        var votes = document.createElement('strong'); votes.className = 'leaderboard-votes'; votes.textContent = entry.votes.toLocaleString('de-DE'); votes.setAttribute('aria-label', entry.votes + ' Stimmen');
        var button = document.createElement('button'); button.type = 'button'; button.className = 'leaderboard-vote';
        button.textContent = votedProject === entry.key ? 'Deine Stimme ✓' : 'Abstimmen';
        button.disabled = Boolean(votedProject);
        button.setAttribute('aria-label', 'Für ' + entry.project.title + ' abstimmen');
        button.addEventListener('click', function () {
          if (votedProject) return;
          button.disabled = true;
          if (status) status.textContent = 'Deine Stimme wird gespeichert …';
          fetch(endpoint + 'hit/' + entry.key, { cache: 'no-store', mode: 'cors' }).then(function (response) {
            if (!response.ok) throw new Error('Stimme konnte nicht gespeichert werden');
            return response.json();
          }).then(function (data) {
            entry.votes = Number(data.value) || entry.votes + 1;
            votedProject = entry.key;
            try { localStorage.setItem(voteKey, votedProject); } catch (_) {}
            if (status) status.textContent = 'Danke für deine Stimme! Du kannst pro Browser einmal abstimmen.';
            render();
          }).catch(function () {
            button.disabled = false;
            if (status) status.textContent = 'Abstimmen klappt gerade nicht. Versuch es später noch einmal.';
          });
        });
        row.append(rank, copy, votes, button);
        list.appendChild(row);
      });
    }

    Promise.all(entries.map(getCount)).then(function () {
      render();
      if (status) status.textContent = votedProject ? 'Danke fürs Mitmachen! Pro Browser ist eine Stimme möglich.' : 'Stimme für dein Lieblingsprojekt ab.';
    }).catch(function () {
      render();
      if (status) status.textContent = 'Die Rangliste ist gerade nicht erreichbar. Du kannst es später erneut versuchen.';
      $$('.leaderboard-vote', list).forEach(function (button) { button.disabled = true; });
    });
  }

  function initStrausbergMap() {
    var section = $('#karte'), mapElement = $('#strausbergMap'), status = $('#mapStatus'), placeList = $('#mapPlaces');
    if (!section || !mapElement || !D.mapPoints || !D.mapPoints.length) return;
    var mapStarted = false;
    var map = null, markers = Object.create(null);

    function osmLink(place) {
      return 'https://www.openstreetmap.org/?mlat=' + encodeURIComponent(place.lat) + '&mlon=' + encodeURIComponent(place.lon) + '#map=17/' + encodeURIComponent(place.lat) + '/' + encodeURIComponent(place.lon);
    }
    D.mapPoints.forEach(function (place) {
      var item = document.createElement('li');
      var button = document.createElement('button'); button.type = 'button'; button.className = 'map-place-button';
      var symbol = document.createElement('span'); symbol.className = 'map-place-icon'; symbol.setAttribute('aria-hidden', 'true'); symbol.textContent = place.icon || '📍';
      var copy = document.createElement('span'); copy.className = 'map-place-copy';
      var name = document.createElement('strong'); name.textContent = place.name;
      var type = document.createElement('small'); type.textContent = place.type;
      copy.append(name, type); button.append(symbol, copy);
      button.addEventListener('click', function () {
        if (map && markers[place.name]) { map.setView([place.lat, place.lon], 15, { animate: !reduce }); markers[place.name].openPopup(); }
        else window.open(osmLink(place), '_blank', 'noopener');
      });
      item.appendChild(button); placeList.appendChild(item);
    });

    function showMap() {
      if (mapStarted) return;
      mapStarted = true;
      if (window.L) { buildMap(); return; }
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      var script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.crossOrigin = 'anonymous';
      script.onload = buildMap;
      script.onerror = function () { mapStarted = false; if (status) status.textContent = 'Die Karte konnte nicht geladen werden. Die Ortsliste bleibt verfügbar.'; };
      document.head.appendChild(script);
    }

    function buildMap() {
      if (!window.L || mapElement.dataset.ready === 'true') return;
      mapElement.dataset.ready = 'true';
      map = L.map(mapElement, { scrollWheelZoom: false, preferCanvas: true }).setView([52.567, 13.878], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap-Mitwirkende</a>'
      }).addTo(map);
      D.mapPoints.forEach(function (place) {
        var icon = L.divIcon({ className: 'map-emoji-icon', html: '<span><i>' + esc(place.icon || '📍') + '</i></span>', iconSize: [40, 40], iconAnchor: [20, 36], popupAnchor: [0, -34] });
        var marker = L.marker([place.lat, place.lon], { icon: icon, title: place.name, alt: place.name }).addTo(map);
        markers[place.name] = marker;
        marker.bindPopup('<div class="map-popup"><span>' + esc(place.type) + '</span><strong>' + esc(place.name) + '</strong><p>' + esc(place.text) + '</p><a href="' + esc(place.url || osmLink(place)) + '" target="_blank" rel="noopener">Mehr dazu ↗</a></div>');
      });
      if (status) status.hidden = true;
      setTimeout(function () { map.invalidateSize(); }, 160);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (items) {
        if (items[0].isIntersecting) { showMap(); observer.disconnect(); }
      }, { rootMargin: '240px' });
      observer.observe(section);
    } else showMap();
  }

  function initAtmosphere() {
    var layer = $('#seasonEffects');
    var activeEffect = '';
    var rainTimer = 0;
    var effects = {
      autumn: ['🍂', '🍁', '🍃'], winter: ['❄️', '❄️', '✨'], spring: ['🌸', '🌼', '🌷'], summer: ['✨', '☀️', '🫧'],
      halloween: ['🎃', '🦇', '👻'], nikolaus: ['⭐', '🍫', '🎁'], christmas: ['❄️', '⭐', '🎄'], easter: ['🥚', '🐰', '🐣'], newyear: ['🎆', '✨', '⭐'], valentines: ['💖', '🌹', '✨']
    };

    function easterSunday(year) {
      var a = year % 19, b = Math.floor(year / 100), c = year % 100;
      var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
      var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
      var l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
      var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
      return new Date(year, month - 1, day);
    }
    function update() {
      var berlin = {};
      new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).forEach(function (part) { berlin[part.type] = Number(part.value); });
      var year = berlin.year, month = berlin.month, day = berlin.day, hour = berlin.hour;
      var date = new Date(year, month - 1, day);
      var easter = easterSunday(year), easterStart = new Date(easter); easterStart.setDate(easter.getDate() - 2);
      var easterEnd = new Date(easter); easterEnd.setDate(easter.getDate() + 1);
      var season = (month === 12 || month <= 2 || (month === 3 && day < 20)) ? 'winter' :
        ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) ? 'spring' :
        ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 22)) ? 'summer' : 'autumn';
      var celebration = 'none';
      if (month === 10 && day === 31) celebration = 'halloween';
      else if (month === 12 && day === 6) celebration = 'nikolaus';
      else if (month === 12 && day >= 24 && day <= 26) celebration = 'christmas';
      else if (month === 12 && day === 31 || month === 1 && day === 1) celebration = 'newyear';
      else if (month === 2 && day === 14) celebration = 'valentines';
      else if (date >= easterStart && date <= easterEnd) celebration = 'easter';
      var daypart = hour >= 5 && hour < 10 ? 'morning' : hour >= 10 && hour < 17 ? 'day' : hour >= 17 && hour < 21 ? 'evening' : 'night';
      document.body.dataset.season = season;
      document.body.dataset.celebration = celebration;
      document.body.dataset.daypart = daypart;
      var badge = $('#atmosphereBadge');
      if (badge) {
        var names = { autumn: 'Herbst', winter: 'Winter', spring: 'Frühling', summer: 'Sommer', halloween: 'Halloween', nikolaus: 'Nikolaus', christmas: 'Weihnachten', easter: 'Ostern', newyear: 'Silvester', valentines: 'Valentinstag', morning: 'Morgenstimmung', day: 'Tageslicht', evening: 'Abendstimmung', night: 'Nachtstimmung' };
        badge.textContent = (names[celebration] || names[season]) + ' · ' + names[daypart] + ' in Strausberg';
      }
      var effect = celebration !== 'none' ? celebration : season;
      if (!layer || effect === activeEffect) return;
      activeEffect = effect;
      clearInterval(rainTimer);
      layer.replaceChildren();
      if (reduce) return;
      function drop() {
        var options = effects[activeEffect] || effects.autumn;
        var particle = document.createElement('span');
        particle.textContent = options[Math.floor(Math.random() * options.length)];
        particle.style.setProperty('--x', (Math.random() * 100) + 'vw');
        particle.style.setProperty('--size', (.8 + Math.random() * 1.25) + 'rem');
        particle.style.setProperty('--duration', (8 + Math.random() * 7) + 's');
        particle.style.setProperty('--drift', ((Math.random() - .5) * 20) + 'vw');
        layer.appendChild(particle);
        particle.addEventListener('animationend', function () { particle.remove(); }, { once: true });
      }
      for (var n = 0; n < 7; n++) setTimeout(drop, n * 250);
      rainTimer = setInterval(drop, celebration === 'none' ? 1150 : 850);
    }
    update();
    setInterval(update, 5 * 60 * 1000);
  }

  function initDuckHunt() {
    var ducks = $$('.duck-collectible'), progress = $('#duckHuntProgress'), reward = $('#duckHuntWin');
    if (!ducks.length || !progress) return;
    var found = new Set();
    try {
      var saved = JSON.parse(localStorage.getItem('professorente-duck-hunt') || '[]');
      if (Array.isArray(saved)) saved.forEach(function (id) { found.add(String(id)); });
    } catch (_) {}
    function update() {
      ducks.forEach(function (duck) {
        var collected = found.has(duck.dataset.duckId);
        duck.classList.toggle('is-collected', collected);
        duck.disabled = collected;
        if (collected) duck.setAttribute('aria-label', 'Ente bereits eingesammelt');
      });
      progress.textContent = Math.min(found.size, ducks.length) + ' / ' + ducks.length;
      if (reward) reward.hidden = found.size < ducks.length;
    }
    ducks.forEach(function (duck) {
      duck.addEventListener('click', function () {
        found.add(duck.dataset.duckId);
        try { localStorage.setItem('professorente-duck-hunt', JSON.stringify(Array.from(found))); } catch (_) {}
        update();
      });
    });
    update();
  }

  var ICONS = {
    car: '<svg viewBox="0 0 84 62" aria-hidden="true"><path d="M6 42 L10 31 Q12 25 18 25 L30 25 L38 14 Q40 12 44 12 L60 12 Q64 12 66 16 L72 27 Q78 29 78 35 L78 43 L6 43 Z" fill="#10333A"/><path d="M37 25 L43 16 H58 L64 25 Z" fill="#D5E3DE"/><g class="spin"><circle cx="22" cy="45" r="9" fill="#0B2227"/><circle cx="22" cy="45" r="3.5" fill="#F4B63A"/><path d="M22 37 V53 M14 45 H30" stroke="#F4B63A" stroke-width="1.6"/></g><g class="spin"><circle cx="62" cy="45" r="9" fill="#0B2227"/><circle cx="62" cy="45" r="3.5" fill="#F4B63A"/><path d="M62 37 V53 M54 45 H70" stroke="#F4B63A" stroke-width="1.6"/></g></svg>',
    building: '<svg viewBox="0 0 84 62" aria-hidden="true"><rect x="8" y="8" width="42" height="50" rx="3" fill="#10333A"/><rect x="46" y="28" width="30" height="30" rx="3" fill="#2F7A85"/><g class="lit" fill="#F4B63A"><rect x="15" y="16" width="8" height="8" rx="1.5"/><rect x="30" y="16" width="8" height="8" rx="1.5"/><rect x="15" y="31" width="8" height="8" rx="1.5"/><rect x="30" y="31" width="8" height="8" rx="1.5"/><rect x="54" y="36" width="7" height="7" rx="1.5"/><rect x="65" y="36" width="7" height="7" rx="1.5"/></g><rect x="22" y="46" width="12" height="12" rx="2" fill="#0B2227"/></svg>',
    brush: '<svg viewBox="0 0 84 62" aria-hidden="true"><g class="brush"><rect x="42" y="2" width="9" height="34" rx="4.5" transform="rotate(32 46 19)" fill="#10333A"/><path d="M24 42 q6 -11 15 -4 q5 9 -4 15 q-11 4 -11 -11z" fill="#E4572E"/></g><circle cx="58" cy="52" r="5.5" fill="#F4B63A"/><circle cx="72" cy="46" r="4.5" fill="#2F7A85"/><circle cx="14" cy="54" r="4" fill="#F4B63A"/></svg>'
  };

  function initLearning() {
    var g = $('#learnGrid');
    if (!g || !D.learning) return;
    g.innerHTML = D.learning.map(function (l) {
      return '<article class="learn-card reveal">' + (ICONS[l.icon] || '') + '<h3>' + esc(l.title) + '</h3><p>' + esc(l.text) + '</p></article>';
    }).join('');
  }

  function initRoadmap() {
    var g = $('#roadmapList');
    if (!g || !D.roadmap) return;
    g.innerHTML = D.roadmap.map(function (item, index) {
      return '<li class="roadmap-card reveal"><span class="roadmap-index" aria-hidden="true">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<div class="roadmap-copy"><h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p><span class="roadmap-label">' + esc(item.label) + '</span></div></li>';
    }).join('');
  }

  /* ───────────── Kontakt ───────────── */
  function initContact() {
    var box = $('#contactLinks');
    if (!box) return;
    var items = [];
    function isUrl(v) { return /^https?:\/\//i.test(v); }
    if (C.email) items.push({ label: 'E-Mail schreiben', href: 'mailto:' + C.email, main: true });
    if (C.discordProfile) items.push({ label: 'Discord-Profil: ' + (C.discordName || 'ProfessorEnte'), href: C.discordProfile, main: !C.email });
    else if (C.discord) {
      if (isUrl(C.discord)) items.push({ label: 'Auf Discord melden', href: C.discord, main: !C.email });
      else items.push({ label: 'Discord: ' + C.discord, copy: C.discord, main: !C.email });
    }
    if (C.discordInvite) items.push({ label: 'Discord-Server beitreten', href: C.discordInvite });
    if (C.itchProfile) items.push({ label: 'Mein itch.io-Profil', href: C.itchProfile, main: !C.email && !C.discordProfile && !C.discord });
    if (C.deadYard) items.push({ label: 'Dead Yard spielen', href: C.deadYard });
    if (C.github) items.push({ label: 'GitHub', href: C.github });
    if (C.youtube) items.push({ label: 'YouTube', href: C.youtube });
    items.forEach(function (it) {
      var el;
      if (it.copy) {
        el = document.createElement('a');
        el.href = '#kontakt';
        el.addEventListener('click', function (e) {
          e.preventDefault();
          if (navigator.clipboard) navigator.clipboard.writeText(it.copy).catch(function () {});
          el.textContent = 'Kopiert: ' + it.copy;
        });
      } else {
        el = document.createElement('a');
        el.href = it.href;
        if (!/^mailto:/.test(it.href)) { el.target = '_blank'; el.rel = 'noopener'; }
      }
      if (!el.textContent) el.textContent = it.label;
      el.className = 'contact-link reveal';
      if (it.main) el.classList.add('main');
      box.appendChild(el);
    });
  }

  /* ───────────── Dead-Yard-Mini-Demo ───────────── */
  function initYard() {
    var cv = $('#yardCanvas');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var killsEl = $('#yardKills'), lifeEl = $('#yardLife'), hint = $('#yardHint');
    var W = 0, H = 0;
    var bullets = [], zs = [], fx = [];
    var kills = 0, life = 5, spawnT = .6, cool = 0, shooting = false, vis = false, raf = 0, last = 0, flash = 0;
    var aim = -.7, mx = 0, my = 0, hasMouse = false;

    function size() {
      var r = cv.getBoundingClientRect();
      var d = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      cv.width = Math.round(W * d); cv.height = Math.round(H * d);
      ctx.setTransform(d, 0, 0, d, 0, 0);
      if (!hasMouse) { mx = W * .8; my = H * .25; }
    }
    function setM(e) {
      var r = cv.getBoundingClientRect();
      mx = (e.clientX - r.left) * (W / r.width);
      my = (e.clientY - r.top) * (H / r.height);
      hasMouse = true;
    }
    function fire() {
      var a = Math.atan2(my - H / 2, mx - W / 2);
      aim = a;
      bullets.push({ x: W / 2 + Math.cos(a) * 24, y: H / 2 + Math.sin(a) * 24, vx: Math.cos(a) * 640, vy: Math.sin(a) * 640, life: 1.1 });
      fx.push({ x: W / 2 + Math.cos(a) * 30, y: H / 2 + Math.sin(a) * 30, r: 9, t: .07, kind: 'muzzle' });
      cool = .17;
    }
    function spawn() {
      var side = Math.floor(Math.random() * 4), x, y;
      if (side === 0) { x = Math.random() * W; y = -20; }
      else if (side === 1) { x = W + 20; y = Math.random() * H; }
      else if (side === 2) { x = Math.random() * W; y = H + 20; }
      else { x = -20; y = Math.random() * H; }
      var fast = Math.random() < .3;
      zs.push({ x: x, y: y, r: fast ? 10 : 14, sp: fast ? 88 : 50, fast: fast, wob: Math.random() * 6 });
    }
    function reset() { kills = 0; life = 5; zs.length = 0; bullets.length = 0; killsEl.textContent = 0; lifeEl.textContent = 5; }
    function burst(x, y) {
      for (var i = 0; i < 9; i++) {
        var a = Math.random() * 6.28, v = 60 + Math.random() * 120;
        fx.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: .5, kind: 'bit' });
      }
    }

    function update(dt) {
      if (hasMouse) aim = Math.atan2(my - H / 2, mx - W / 2);
      cool -= dt;
      if (shooting && cool <= 0) fire();
      spawnT -= dt;
      if (spawnT <= 0 && zs.length < 14) { spawn(); spawnT = .9 + Math.random() * .9; }
      var i, j;
      for (i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
        var dead = b.life <= 0 || b.x < -10 || b.x > W + 10 || b.y < -10 || b.y > H + 10;
        for (j = zs.length - 1; j >= 0 && !dead; j--) {
          var z = zs[j];
          if (Math.hypot(b.x - z.x, b.y - z.y) < z.r + 3) {
            burst(z.x, z.y); zs.splice(j, 1); dead = true;
            kills++; killsEl.textContent = kills;
          }
        }
        if (dead) bullets.splice(i, 1);
      }
      for (i = zs.length - 1; i >= 0; i--) {
        var q = zs[i];
        var a = Math.atan2(H / 2 - q.y, W / 2 - q.x);
        q.wob += dt * 6;
        q.x += Math.cos(a) * q.sp * dt; q.y += Math.sin(a) * q.sp * dt;
        q.ang = a;
        if (Math.hypot(W / 2 - q.x, H / 2 - q.y) < 24) {
          zs.splice(i, 1); burst(W / 2, H / 2);
          life--; flash = 1; stress = 1; lifeEl.textContent = Math.max(life, 0);
          if (life <= 0) reset();
        }
      }
      for (i = fx.length - 1; i >= 0; i--) {
        var f = fx[i];
        f.t -= dt;
        if (f.kind === 'bit') { f.x += f.vx * dt; f.y += f.vy * dt; }
        if (f.t <= 0) fx.splice(i, 1);
      }
      flash = Math.max(0, flash - dt * 2.2);
    }

    function draw() {
      var g = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, Math.max(W, H) * .7);
      g.addColorStop(0, '#2A4036'); g.addColorStop(1, '#16251F');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,.04)'; ctx.lineWidth = 1;
      for (var x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(180,150,100,.35)'; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
      ctx.strokeRect(8, 8, W - 16, H - 16); ctx.setLineDash([]);

      zs.forEach(function (z) {
        ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.ang || 0);
        ctx.fillStyle = z.fast ? '#9CB86A' : '#6F9A63';
        ctx.beginPath(); ctx.arc(z.r * .55, -z.r * .8, z.r * .38, 0, 6.3); ctx.arc(z.r * .55, z.r * .8, z.r * .38, 0, 6.3); ctx.fill();
        ctx.beginPath(); ctx.arc(0, Math.sin(z.wob) * 1.5, z.r, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#B53A2A';
        ctx.beginPath(); ctx.arc(z.r * .4, -z.r * .3, 2, 0, 6.3); ctx.arc(z.r * .4, z.r * .3, 2, 0, 6.3); ctx.fill();
        ctx.restore();
      });

      ctx.fillStyle = '#F7E27A';
      bullets.forEach(function (b) { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, 6.3); ctx.fill(); });
      fx.forEach(function (f) {
        if (f.kind === 'muzzle') { ctx.fillStyle = 'rgba(255,230,140,.9)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.3); ctx.fill(); }
        else { ctx.fillStyle = 'rgba(120,170,90,' + Math.max(f.t * 2, 0) + ')'; ctx.fillRect(f.x, f.y, 4, 4); }
      });

      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(aim);
      ctx.fillStyle = '#0B2227'; ctx.fillRect(8, -4, 24, 8);
      ctx.fillStyle = '#F7C14B'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#E4572E'; ctx.beginPath(); ctx.ellipse(13, 0, 7, 4.5, 0, 0, 6.3); ctx.fill();
      ctx.restore();

      if (flash > 0) {
        var v = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, Math.max(W, H) * .7);
        v.addColorStop(0, 'rgba(200,30,30,0)'); v.addColorStop(1, 'rgba(200,30,30,' + (flash * .55).toFixed(2) + ')');
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }
    }

    function frame(t) {
      var dt = Math.min((t - last) / 1000 || 0, .05);
      last = t;
      update(dt); draw();
      raf = vis ? requestAnimationFrame(frame) : 0;
    }

    size();
    window.addEventListener('resize', size);
    cv.addEventListener('pointermove', setM);
    cv.addEventListener('pointerdown', function (e) {
      setM(e); shooting = true; hint.classList.add('gone');
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    });
    window.addEventListener('pointerup', function () { shooting = false; });
    new IntersectionObserver(function (e) {
      vis = e[0].isIntersecting;
      if (vis && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }, { threshold: .1 }).observe(cv);
    if (reduce) { size(); for (var k = 0; k < 4; k++) spawn(); draw(); }
  }

  /* ───────────── EKG-Puls ───────────── */
  function initRhythmWidget() {
    var widget = $('#rhythmWidget'), canvas = $('#rhythmCanvas');
    if (!widget || !canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d'), name = $('#rhythmName'), rate = $('#rhythmRate');
    var pause = $('#rhythmPause');
    var modes = [
      { name: 'Sinusrhythmus', rate: '76 bpm', kind: 'sinus', bpm: 76, color: '#55D6B0' },
      { name: 'Sinustachykardie', rate: '146 bpm', kind: 'sinus', bpm: 146, color: '#F4B63A' },
      { name: 'Sinusbradykardie', rate: '46 bpm', kind: 'sinus', bpm: 46, color: '#79C9E8' },
      { name: 'Vorhofflimmern', rate: 'unregelmäßig', kind: 'af', color: '#FFAA70' },
      { name: 'Vorhofflattern', rate: 'regelmäßig', kind: 'flutter', color: '#F4B63A' },
      { name: 'Kammerflimmern', rate: 'chaotisch', kind: 'vf', color: '#FF6B6B' },
      { name: 'Extrasystolen', rate: 'Musterbeispiel', kind: 'extra', color: '#D99CFF' }
    ];
    var width = 0, height = 0, ratio = 1, elapsed = 0, last = 0, modeIndex = 0;
    var modeTime = 0, frameId = 0, playing = !reduce;
    var afIntervals = [.38, .76, .47, .59, .32, .83], afTotal = 0;
    afIntervals.forEach(function (v) { afTotal += v; });

    function mod(v, m) { return ((v % m) + m) % m; }
    function gauss(x, center, spread) { var d = (x - center) / spread; return Math.exp(-d * d); }
    function sinus(t, bpm) {
      var period = 60 / bpm, p = mod(t, period) / period;
      return 2.1 * gauss(p, .18, .055) - 4.5 * gauss(p, .385, .018) +
        25 * gauss(p, .414, .013) - 7 * gauss(p, .447, .02) + 5.3 * gauss(p, .68, .075);
    }
    function signal(t, mode) {
      if (mode.kind === 'sinus') return sinus(t, mode.bpm);
      if (mode.kind === 'af') {
        var local = mod(t, afTotal), start = 0, interval = afIntervals[0];
        for (var i = 0; i < afIntervals.length; i++) {
          interval = afIntervals[i];
          if (local < start + interval) break;
          start += interval;
        }
        var p = (local - start) / interval;
        return 1.15 * Math.sin(t * 47) + .75 * Math.sin(t * 71 + .8) -
          4 * gauss(p, .045, .025) + 22 * gauss(p, .08, .022) - 6 * gauss(p, .115, .03) + 4.4 * gauss(p, .36, .09);
      }
      if (mode.kind === 'flutter') {
        var saw = 4.2 * (1 - 2 * mod(t * 5, 1)), q = mod(t, .8);
        return saw - 3.5 * gauss(q, .105, .025) + 24 * gauss(q, .13, .018) - 6 * gauss(q, .16, .03) + 4 * gauss(q, .34, .08);
      }
      if (mode.kind === 'vf') {
        var envelope = .62 + .38 * Math.sin(t * 2.7 + 1.2);
        return envelope * (8 * Math.sin(t * 31 + 2.1 * Math.sin(t * 6.4)) + 4.8 * Math.sin(t * 53 + 1.4) + 3.2 * Math.sin(t * 17 + .3));
      }
      var cycle = mod(t, 1.55);
      return sinus(cycle, 78) - 10 * gauss(cycle, .59, .045) + 27 * gauss(cycle, .635, .035) - 11 * gauss(cycle, .69, .05);
    }
    function resize() {
      var box = canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      width = box.width; height = box.height; ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }
    function draw() {
      if (!width || !height) return;
      var mode = modes[modeIndex];
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(85,214,176,.12)'; ctx.lineWidth = 1;
      for (var gx = 0; gx <= width; gx += 18) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke(); }
      for (var gy = 0; gy <= height; gy += 18) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke(); }
      ctx.beginPath();
      for (var x = 0; x <= width; x += 2) {
        var t = elapsed - (width - x) / 105;
        var y = height / 2 - signal(t, mode) * Math.min(1.12, height * .027);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = mode.color; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.shadowColor = mode.color; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;
    }
    function setMode(i) {
      modeIndex = i; modeTime = 0;
      var mode = modes[modeIndex];
      name.textContent = mode.name; rate.textContent = mode.rate;
      canvas.setAttribute('aria-label', 'Stilisierte EKG-Simulation: ' + mode.name + ', ' + mode.rate);
      widget.style.setProperty('--rhythm-accent', mode.color);
      draw();
    }
    function frame(now) {
      if (!playing || document.hidden) { frameId = 0; return; }
      var dt = Math.min((now - last) / 1000, .05); last = now;
      elapsed += dt; modeTime += dt;
      if (modeTime >= 6.2) setMode((modeIndex + 1) % modes.length);
      draw(); frameId = requestAnimationFrame(frame);
    }
    function start() { if (playing && !document.hidden && !frameId) { last = performance.now(); frameId = requestAnimationFrame(frame); } }
    function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; }

    setMode(0); resize();
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(widget);
    if (reduce) {
      playing = false; pause.disabled = true; pause.setAttribute('aria-label', 'Animation durch Bewegungseinstellung reduziert');
    } else start();
    pause.addEventListener('click', function () {
      playing = !playing;
      pause.textContent = playing ? 'Ⅱ' : '▶';
      pause.setAttribute('aria-pressed', playing ? 'false' : 'true');
      pause.setAttribute('aria-label', playing ? 'EKG-Simulation pausieren' : 'EKG-Simulation fortsetzen');
      if (playing) start(); else stop();
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  }

  /* ───────────── EKG-Puls ───────────── */
  function initBpm() {
    var el = $('#bpm');
    if (!el) return;
    setInterval(function () {
      stress = Math.max(0, stress - .22);
      var base = 72 + Math.round(Math.random() * 5);
      el.textContent = Math.round(base + stress * 46);
    }, 700);
  }

  /* ───────────── Start ───────────── */
  function boot() {
    initPageLoader();
    initTitle();
    initThemeStudio();
    initSoundEffects();
    initDuckInteraction();
    initAtmosphere();
    initDuckHunt();
    initVisitorCounter();
    initScrollTop();
    initStrausbergMap();
    initRipples();
    initEyes();
    initEasterEgg();
    initMusic();
    initProgress();
    initNav();
    initRoles();
    initScripts();
    initProjectLeaderboard();
    initMarquee();
    initProjects();
    initLearning();
    initRoadmap();
    initContact();
    initYard();
    initRhythmWidget();
    initBpm();
    initReveal();
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    console.log(TAG + ' Portfolio geladen. Quack.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
