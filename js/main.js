(function () {
  /* ── Header scroll ── */
  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-toggle");
  var drawer = document.querySelector(".mobile-drawer");
  var drawerLinks = drawer ? drawer.querySelectorAll("a") : [];

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    updateScrollProgress();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      var open = drawer.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    drawerLinks.forEach(function (a) {
      a.addEventListener("click", function () {
        drawer.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Scroll Progress Bar ── */
  var progressBar = document.getElementById("scroll-progress");
  function updateScrollProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }

  /* ── IntersectionObserver for .reveal ── */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ── IntersectionObserver for .reveal-stagger ── */
  var staggerEls = document.querySelectorAll(".reveal-stagger");
  if (staggerEls.length && "IntersectionObserver" in window) {
    var ioStagger = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            ioStagger.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    staggerEls.forEach(function (el) { ioStagger.observe(el); });
  }

  /* ── Progress Bars (Why Choose) ── */
  var whySection = document.querySelector(".why-choose");
  if (whySection) {
    var fills = whySection.querySelectorAll(".progress-fill");
    fills.forEach(function (fill) {
      var target = fill.style.width || "100%";
      fill.dataset.target = target;
      fill.style.setProperty("--target-width", target);
    });
  }

  /* ── Accordion Logic ── */
  var accordions = document.querySelectorAll(".accordion-trigger");
  accordions.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      accordions.forEach(function (other) {
        if (other !== trigger) {
          other.setAttribute("aria-expanded", "false");
          other.nextElementSibling.hidden = true;
        }
      });
      trigger.setAttribute("aria-expanded", !expanded);
      trigger.nextElementSibling.hidden = expanded;
    });
  });

  /* ── Preloader ── */
  window.addEventListener("load", function () {
    var preloader = document.querySelector(".preloader");
    if (preloader) {
      setTimeout(function () { preloader.classList.add("is-hidden"); }, 500);
    }
    // Trigger hero stat pop after load
    setTimeout(function () {
      document.querySelectorAll(".hero-stat").forEach(function (stat, i) {
        setTimeout(function () { stat.classList.add("is-popped"); }, i * 150);
      });
    }, 1200);
  });

  /* ── Custom Cursor ── */
  var cursor = document.querySelector(".custom-cursor");
  var follower = document.querySelector(".custom-cursor-follower");
  if (cursor && follower && window.matchMedia("(pointer: fine)").matches) {
    var cursorX = 0, cursorY = 0, followerX = 0, followerY = 0;
    document.addEventListener("mousemove", function (e) {
      cursorX = e.clientX; cursorY = e.clientY;
      cursor.style.transform = "translate(" + cursorX + "px," + cursorY + "px)";
    });
    (function loop() {
      followerX += (cursorX - followerX) * 0.2;
      followerY += (cursorY - followerY) * 0.2;
      follower.style.transform = "translate(" + followerX + "px," + followerY + "px)";
      requestAnimationFrame(loop);
    })();
    var interactives = document.querySelectorAll("a, button, input, textarea, .product-card, .pillar, .vm-card, .service-card, .ab-vm-card, .ab-services-card, .ab-value-item, .ab-leader__photo-wrap, .ab-cert-img-wrap");
    interactives.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-hovering");
        follower.classList.add("is-hovering");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hovering");
        follower.classList.remove("is-hovering");
      });
    });
  }

  /* ── Parallax Background ── */
  var bgMesh = document.querySelector(".bg-mesh");
  if (bgMesh && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", function (e) {
      var moveX = (e.clientX - window.innerWidth / 2) * 0.02;
      var moveY = (e.clientY - window.innerHeight / 2) * 0.02;
      bgMesh.style.transform = "translate(" + moveX + "px," + moveY + "px)";
    });
  }

  /* ── Button Click Ripple ── */
  document.querySelectorAll(".btn-primary").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var ripple = document.createElement("span");
      ripple.classList.add("ripple");
      var rect = btn.getBoundingClientRect();
      var size = 40;
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  });

  /* ── 3D Tilt Effect on Cards ── */
  function addTilt(selector) {
    document.querySelectorAll(selector).forEach(function (card) {
      card.classList.add("tilt-card");
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        var rotX = ((y - cy) / cy) * -8;
        var rotY = ((x - cx) / cx) * 8;
        card.style.transform = "perspective(800px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(-6px)";
        card.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), " +
          (rotY > 0 ? rotY * 2 : 0) + "px 0 20px rgba(0,210,255,0.1), " +
          (rotY < 0 ? Math.abs(rotY) * 2 : 0) + "px 0 20px rgba(0,255,135,0.1)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });
  }
  addTilt(".pillar");
  addTilt(".vm-card");
  addTilt(".service-card");
  addTilt(".hero-stat");
  addTilt(".ab-vm-card");
  addTilt(".ab-services-card");
  addTilt(".ab-leader__photo-wrap");
  addTilt(".ab-cert-img-wrap");

  /* ── Particle Canvas ── */
  var canvas = document.getElementById("particle-canvas");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function Particle() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? "0,210,255" : "0,255,135";
    }

    for (var i = 0; i < 80; i++) { particles.push(new Particle()); }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.color + "," + p.alpha + ")";
        ctx.fill();
      });
      // Draw connecting lines between nearby particles
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(0,210,255," + (0.06 * (1 - dist / 100)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
})();
