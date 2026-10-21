/* ==========================================================================
   便前宝 · 产品介绍页交互
   - 顶部导航与滚动高亮
   - 阅读进度条
   - 滚动进入动画与数字滚动
   - 产品结构热点
   - 预约表单（生成 mailto，不收集数据）
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
        if (nav && nav.classList.contains("is-open")) closeNav();
      },
      { passive: true }
    );
  }

  /* ---------- 阅读进度 ---------- */
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
      section.top = section.link ? document.getElementById(section.id).offsetTop : 0;
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

  /* ---------- 数字滚动 ---------- */
  function formatNumber(value, decimals) {
    return value.toFixed(decimals);
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = formatNumber(target, decimals);
      return;
    }

    var duration = 1100;
    var start = null;

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(target * eased, decimals);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, decimals);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  if ("IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  /* ---------- 产品热点 ---------- */
  var hotspots = Array.prototype.slice.call(document.querySelectorAll(".hotspot"));
  var hsTitle = document.getElementById("hsTitle");
  var hsText = document.getElementById("hsText");

  var hotspotData = [
    {
      title: "① 柔性干电极阵列",
      text: "16 触点，居中均匀分布。后枕与颈侧自然贴合中部阵列，采集皮层电活动。"
    },
    {
      title: "② 压力阵列",
      text: "35 点，覆盖整张垫子。用于“在垫 / 体动 / 呼吸”门控，区分持续躺卧与短暂接触。"
    },
    {
      title: "③ 温湿度 4 点",
      text: "负责微环境与漂移补偿；只做信号校正，不感知排泄物。"
    },
    {
      title: "④ LED + 连接口",
      text: "3 颗 1.5 mm LED 与接口位于 8 mm 右端侧面，正面无光；夜间只在预警时轻闪。"
    },
    {
      title: "⑤ 外置电池 + SOM 模组",
      text: "柔性连线接入右端面（LED 旁）。采集、处理与推理都在模组内完成，断网仍可预警。"
    }
  ];

  function showHotspot(index, focus) {
    var item = hotspotData[index];
    if (!item) return;

    if (hsTitle) hsTitle.textContent = item.title;
    if (hsText) hsText.textContent = item.text;

    hotspots.forEach(function (btn, i) {
      btn.setAttribute("aria-pressed", i === index ? "true" : "false");
    });

    if (focus) hotspots[index].focus();
  }

  hotspots.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      showHotspot(index, false);
    });

    btn.addEventListener("mouseenter", function () {
      if (btn.getAttribute("aria-pressed") !== "true") showHotspot(index, false);
    });

    btn.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      var next = event.key === "ArrowRight" ? (index + 1) % hotspots.length : (index - 1 + hotspots.length) % hotspots.length;
      showHotspot(next, true);
    });
  });

  /* ---------- 预约表单：生成 mailto ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = (document.getElementById("fName") || {}).value || "";
      var phone = (document.getElementById("fPhone") || {}).value || "";
      var type = (document.getElementById("fType") || {}).value || "";
      var message = (document.getElementById("fMsg") || {}).value || "";

      var subject = "【便前宝】" + type + " · " + name;
      var body =
        "称呼：" + name +
        "\n联系方式：" + phone +
        "\n合作类型：" + type +
        "\n\n" + message +
        "\n\n—— 来自便前宝产品介绍页";

      window.location.href =
        "mailto:69147957@qq.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });
  }

  /* 首屏脚本若全部初始化完成，标记就绪，避免兜底逻辑误撤动画 */
  window.__aboutReady = true;
})();
