document.getElementById('footerYear').textContent = new Date().getFullYear();

// ============================================================
//  animate.js — Scroll-triggered fade/slide-in animations
//  Add <script src="js/animate.js"></script> before </body>
// ============================================================

(function () {

  // Elements to observe — each selector maps to an animation class
  const TARGETS = [
    // Hero
    { sel: ".heroContentLeft",      anim: "anim-fade-up",    delay: 0   },
    { sel: ".heroContentRight",     anim: "anim-fade-up",    delay: 150 },

    // About
    { sel: ".aboutHeader",          anim: "anim-fade-up",    delay: 0   },
    { sel: ".aboutTitle",           anim: "anim-fade-up",    delay: 80  },
    { sel: ".aboutLead",            anim: "anim-fade-up",    delay: 160 },
    { sel: ".aboutBody",            anim: "anim-fade-up",    delay: 220 },
    { sel: ".aboutTags",            anim: "anim-fade-up",    delay: 300 },
    { sel: ".metricsCard",          anim: "anim-fade-left",  delay: 100 },

    // Languages
    { sel: "#languages > p",        anim: "anim-fade-up",    delay: 0   },
    { sel: "#languages > h2",       anim: "anim-fade-up",    delay: 80  },
    { sel: ".language",             anim: "anim-fade-up",    delay: 160 },

    // Projects
    { sel: ".sectionLabel",         anim: "anim-fade-up",    delay: 0   },
    { sel: ".projHeader",           anim: "anim-fade-up",    delay: 80  },
    { sel: ".projSubline",          anim: "anim-fade-up",    delay: 140 },

    // Contact
    { sel: ".contactFormWrap",      anim: "anim-fade-right", delay: 0   },
    { sel: ".contactInfo",          anim: "anim-fade-left",  delay: 120 },

    // Footer
    { sel: ".footerBrand",          anim: "anim-fade-up",    delay: 0   },
    { sel: ".footerCol",            anim: "anim-fade-up",    delay: 100 },
    { sel: ".footerBottom",         anim: "anim-fade-up",    delay: 180 },
  ];

  // Project cards get staggered individually after they're injected
  const CARD_STAGGER = 80; // ms between each card

  // ── Inject base CSS ────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    .anim-fade-up,
    .anim-fade-left,
    .anim-fade-right,
    .anim-card {
      opacity: 0;
      transition: opacity 0.65s ease, transform 0.65s ease;
      will-change: opacity, transform;
    }

    .anim-fade-up    { transform: translateY(32px); }
    .anim-fade-left  { transform: translateX(40px); }
    .anim-fade-right { transform: translateX(-40px); }
    .anim-card       { transform: translateY(24px); }

    .anim-visible {
      opacity: 1 !important;
      transform: none !important;
    }
  `;
  document.head.appendChild(style);

  // ── Helper: observe a single element ───────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el    = entry.target;
          const delay = parseInt(el.dataset.animDelay || "0", 10);
          setTimeout(() => el.classList.add("anim-visible"), delay);
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.12 }
  );

  function observe(el, animClass, delay = 0) {
    el.classList.add(animClass);
    el.dataset.animDelay = delay;
    io.observe(el);
  }

  // ── Wire up static targets ──────────────────────────────────
  function initStatic() {
    TARGETS.forEach(({ sel, anim, delay }) => {
      document.querySelectorAll(sel).forEach(el => observe(el, anim, delay));
    });
  }

  // ── Wire up project cards (called after JS injects them) ───
  // We watch #projGrid with a MutationObserver so cards that
  // appear after the initial render also get animated.
  function initCards() {
    const grid = document.getElementById("projGrid");
    if (!grid) return;

    function animateCards() {
      grid.querySelectorAll(".projCard:not(.anim-card)").forEach((card, i) => {
        observe(card, "anim-card", i * CARD_STAGGER);
      });
    }

    // Animate any cards already present
    animateCards();

    // Watch for new cards (Show More / re-render)
    const mo = new MutationObserver(animateCards);
    mo.observe(grid, { childList: true });
  }

  // ── Boot ───────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initStatic();
      initCards();
    });
  } else {
    initStatic();
    initCards();
  }

})();