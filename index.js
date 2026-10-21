/* ==========================================================================
   云峰智能 · 官网首页交互
   导航 / 阅读进度 / 滚动高亮 / 进入视口动画 / 回到顶部
   ========================================================================== */
(function () {
  "use strict";

  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 导航开关 ---------- */
  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && nav && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "收起导航菜单" : "展开导航菜单");
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeNav();
    });

    window.addEventListener(
      "scroll",
      function () {
        if (nav.classList.contains("is-open")) closeNav();
      },
      { passive: true }
    );
  }

  /* ---------- 阅读进度与回到顶部 ---------- */
  var progressBar = document.getElementById("progressBar");
  var toTop = document.getElementById("toTop");

  function onScrollFrame() {
    var scrollTop = window.pageYOffset || docEl.scrollTop;
    var max = docEl.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.width = (max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0) + "%";
    }
    if (toTop) {
      toTop.classList.toggle("is-visible", scrollTop > 640);
    }
    updateActiveLink(scrollTop);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        onScrollFrame();
        ticking = false;
      });
    },
    { passive: true }
  );

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 滚动高亮 ---------- */
  var navAnchors = navLinks
    ? Array.prototype.slice.call(navLinks.querySelectorAll('a[href^="#"]'))
    : [];
  var sections = navAnchors
    .map(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      return el ? { id: id, top: 0, link: a } : null;
    })
    .filter(Boolean);

  function measureSections() {
    sections.forEach(function (section) {
      section.top = document.getElementById(section.id).offsetTop;
    });
  }

  function updateActiveLink(scrollTop) {
    if (!sections.length) return;
    var probe = scrollTop + 160;
    var activeId = "";
    sections.forEach(function (section) {
      if (section.top <= probe) activeId = section.id;
    });
    sections.forEach(function (section) {
      section.link.classList.toggle("is-active", section.id === activeId);
    });
  }

  measureSections();
  window.addEventListener("load", measureSections);
  window.addEventListener("resize", measureSections);
  onScrollFrame();

  /* ---------- 进入视口动画 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* 初始化完成，取消兜底 */
  window.__siteReady = true;
})();
