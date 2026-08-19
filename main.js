/* =========================================================================
   main.js — interactions for the personal site
   Kept dependency-free and defensive. Everything degrades gracefully.
   ========================================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------- Theme toggle ---------------------------- */
  (function theme() {
    var toggle = document.getElementById("theme-toggle");
    var meta = document.querySelector('meta[name="theme-color"]');
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (e) {}

    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var initial = stored || (prefersDark ? "dark" : "light");
    apply(initial);

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem("theme", next); } catch (e) {}
      });
    }

    function apply(mode) {
      root.setAttribute("data-theme", mode);
      if (meta) meta.setAttribute("content", mode === "dark" ? "#0b0e0b" : "#1b4332");
      // let the rain pick up the new colour on the next frame
      window.__rainRefresh && window.__rainRefresh();
    }
  })();

  /* ------------------------------ Current year --------------------------- */
  (function year() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  /* ------------------------------ Sticky nav ----------------------------- */
  (function stickyNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ------------------------------ Mobile menu ---------------------------- */
  (function mobileMenu() {
    var btn = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-nav");
    if (!btn || !menu) return;

    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-label", "Open menu");
      }
    });
  })();

  /* ------------------------- Reveal on scroll (IO) ----------------------- */
  (function reveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    // gentle stagger for groups of siblings
    items.forEach(function (el, i) {
      var delay = Math.min((i % 6) * 60, 300);
      el.style.transitionDelay = delay + "ms";
      io.observe(el);
    });
  })();

  /* ---------------------------- Matrix rain fx --------------------------- */
  (function matrixRain() {
    var canvas = document.getElementById("matrix");
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = "none"; return; }

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var glyphs = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789<>[]{}/=+*".split("");
    var fontSize = 15;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var columns = 0, drops = [], rainColor = "27,67,50", rainAlpha = 0.1, rainHead = "27,67,50", rainHeadAlpha = 0.6;
    var w = 0, h = 0;

    function readColors() {
      var cs = getComputedStyle(root);
      rainColor = (cs.getPropertyValue("--rain") || "27,67,50").trim();
      rainAlpha = parseFloat(cs.getPropertyValue("--rain-alpha")) || 0.1;
      rainHead = (cs.getPropertyValue("--rain-head") || rainColor).trim();
      rainHeadAlpha = parseFloat(cs.getPropertyValue("--rain-head-alpha")) || Math.min(rainAlpha * 1.6, 0.95);
    }
    window.__rainRefresh = readColors;

    function resize() {
      // canvas is anchored to the top of the page and scrolls away with the hero
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(w / fontSize);
      drops = new Array(columns);
      for (var i = 0; i < columns; i++) drops[i] = Math.random() * -40;
      ctx.font = fontSize + "px 'JetBrains Mono', monospace";
    }

    var last = 0, interval = 60; // ms between frames — slow, meditative
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < interval) return;
      last = now;

      // fade previous frame for the trailing effect (matches the ground colour)
      var fade = root.getAttribute("data-theme") === "dark" ? "rgba(11,14,11,0.15)" : "rgba(244,241,233,0.15)";
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);

      for (var i = 0; i < columns; i++) {
        var ch = glyphs[(Math.random() * glyphs.length) | 0];
        var x = i * fontSize;
        var y = drops[i] * fontSize;
        // trailing tone
        ctx.fillStyle = "rgba(" + rainColor + "," + rainAlpha + ")";
        ctx.fillText(ch, x, y);
        // bright leading glyph for the classic matrix pop
        ctx.fillStyle = "rgba(" + rainHead + "," + rainHeadAlpha + ")";
        ctx.fillText(ch, x, y);

        if (y > h && Math.random() > 0.975) drops[i] = Math.random() * -20;
        drops[i]++;
      }
    }

    var raf = null;
    function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    // stop drawing once the hero has scrolled out of view — pure ambiance, no waste
    window.addEventListener("scroll", function () {
      if (window.scrollY > window.innerHeight) stop();
      else if (!document.hidden) start();
    }, { passive: true });

    readColors();
    resize();
    start();
  })();
})();
