const WHATSAPP_MESSAGE =
  "Olá, vim pelo site do Restaurante Bom Sabor e gostaria de consultar o cardápio e fazer um pedido.";

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navigationLinks = document.querySelectorAll('.main-nav a[href^="#"]');
const whatsappDialog = document.querySelector("#whatsapp-dialog");
const dialogCloseButton = document.querySelector(".dialog-close");

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 32);
}

function setMenu(open) {
  document.body.classList.toggle("menu-open", open);
  header.classList.toggle("menu-active", open);
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

  const bars = menuButton.querySelectorAll("span");
  bars[0].style.transform = open ? "translateY(7px) rotate(45deg)" : "";
  bars[1].style.opacity = open ? "0" : "1";
  bars[2].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

navigationLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 1024 && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

function openWhatsAppDialog() {
  if (whatsappDialog.open) return;

  whatsappDialog.showModal();

  if (window.gsap) {
    gsap.fromTo(
      whatsappDialog,
      { autoAlpha: 0, y: 24, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
    );
  }
}

function closeWhatsAppDialog() {
  if (!whatsappDialog.open) return;

  if (!window.gsap) {
    whatsappDialog.close();
    return;
  }

  gsap.to(whatsappDialog, {
    autoAlpha: 0,
    y: 16,
    scale: 0.97,
    duration: 0.22,
    ease: "power2.in",
    onComplete: () => {
      whatsappDialog.close();
      gsap.set(whatsappDialog, { clearProps: "opacity,visibility,transform" });
    },
  });
}

document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openWhatsAppDialog();
  });
});

document.querySelectorAll("[data-whatsapp-number]").forEach((link) => {
  const number = link.dataset.whatsappNumber;
  link.href = `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

dialogCloseButton.addEventListener("click", closeWhatsAppDialog);

whatsappDialog.addEventListener("click", (event) => {
  if (event.target === whatsappDialog) closeWhatsAppDialog();
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navigationLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55%", threshold: 0 }
);

document
  .querySelectorAll("main section[id], main #cardapio")
  .forEach((section) => sectionObserver.observe(section));

function getFallbackStartTransform(element) {
  if (element.matches(".menu-category")) {
    return "translateY(32px)";
  }

  if (element.matches(".story-image, .map-frame")) {
    return "translateX(-28px)";
  }

  if (element.matches(".delivery-areas, .location-card")) {
    return "translateX(28px)";
  }

  return "translateY(24px)";
}

function initializeFallbackAnimations() {
  const targets = document.querySelectorAll(
    ".hero-eyebrow, .hero h1, .hero-description, .hero-actions, .quick-info-grid > div, " +
      ".benefit-item, .section-heading, .menu-category, .story-image, .story-copy, " +
      ".order-steps, .delivery-areas, .map-frame, .location-card"
  );

  if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

  const fallbackObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const siblingIndex = Array.from(element.parentElement.children).indexOf(element);

        const animation = element.animate(
          [
            { transform: getFallbackStartTransform(element) },
            { transform: "none" },
          ],
          {
            duration: 560,
            delay: Math.min(Math.max(siblingIndex, 0) * 55, 275),
            easing: "cubic-bezier(0.2, 0, 0, 1)",
            fill: "forwards",
          }
        );

        animation.addEventListener("finish", () => {
          animation.cancel();
          element.style.transform = "";
        });

        fallbackObserver.unobserve(element);
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((element) => fallbackObserver.observe(element));
}

function initializeAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    initializeFallbackAnimations();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.body.classList.add("motion-ready");

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".site-header", { y: -30, duration: 0.55 })
    .from(".hero-eyebrow", { y: 18, duration: 0.45 }, "-=0.2")
    .from(".hero h1", { y: 34, duration: 0.8 }, "-=0.25")
    .from(".hero-description", { y: 22, duration: 0.55 }, "-=0.48")
    .from(".hero-actions .button", { y: 18, stagger: 0.1, duration: 0.45 }, "-=0.35")
    .from(".quick-info-grid > div", { y: 20, stagger: 0.08, duration: 0.45 }, "-=0.2");

  intro.eventCallback("onComplete", () => {
    gsap.set(
      ".site-header, .hero-eyebrow, .hero h1, .hero-description, .hero-actions .button, .quick-info-grid > div",
      { clearProps: "transform" }
    );
  });

  gsap.to(".hero-media", {
    yPercent: 10,
    scale: 1.1,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 0.8,
    },
  });

  ScrollTrigger.batch(".benefit-item", {
    start: "top 88%",
    once: true,
    onEnter: (elements) =>
      gsap.from(elements, {
        y: 28,
        stagger: 0.08,
        duration: 0.65,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => gsap.set(elements, { clearProps: "transform" }),
      }),
  });

  ScrollTrigger.batch(".menu-category", {
    start: "top 88%",
    once: true,
    onEnter: (elements) =>
      gsap.from(elements, {
        y: 36,
        stagger: 0.07,
        duration: 0.78,
        ease: "power3.out",
        overwrite: true,
        onComplete: () => gsap.set(elements, { clearProps: "transform" }),
      }),
  });

  function revealOnEnter(trigger, target, animation, start = "top 84%") {
    ScrollTrigger.create({
      trigger,
      start,
      once: true,
      onEnter: () =>
        gsap.from(target, {
          ...animation,
          onComplete: () => gsap.set(target, { clearProps: "transform" }),
        }),
    });
  }

  document.querySelectorAll(".section-heading, .story-copy, .delivery-intro").forEach((element) => {
    revealOnEnter(element, element, {
      y: 30,
      duration: 0.8,
      ease: "power3.out",
    });
  });

  revealOnEnter(".story", ".story-image", {
    x: -36,
    duration: 1,
    ease: "power3.out",
  }, "top 72%");

  gsap.to(".story-image img", {
    yPercent: -5,
    scale: 1.04,
    ease: "none",
    scrollTrigger: {
      trigger: ".story",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  revealOnEnter(".order-steps", ".order-steps li", {
    x: -20,
    stagger: 0.1,
    duration: 0.55,
    ease: "power2.out",
  }, "top 80%");

  revealOnEnter(".delivery-grid", ".order-steps", {
    x: -28,
    duration: 0.85,
    ease: "power3.out",
  }, "top 78%");

  revealOnEnter(".delivery-grid", ".delivery-areas", {
    x: 28,
    duration: 0.9,
    ease: "power3.out",
  }, "top 78%");

  revealOnEnter(".location-grid", ".map-frame", {
    x: -28,
    duration: 0.9,
    ease: "power3.out",
  }, "top 80%");

  revealOnEnter(".location-grid", ".location-card", {
    x: 28,
    duration: 0.9,
    ease: "power3.out",
  }, "top 80%");

  const dishTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#self-service",
      endTrigger: "#delivery",
      start: "top 72%",
      end: "bottom 45%",
      scrub: 0.8,
      invalidateOnRefresh: true,
    },
  });

  dishTimeline
    .fromTo(
      ".scrolling-dish",
      { autoAlpha: 0, y: -30, rotation: -10, scale: 0.82 },
      { autoAlpha: 0.94, y: 0, rotation: 0, scale: 1, duration: 0.15, ease: "power2.out" }
    )
    .to(".scrolling-dish", {
      y: () => window.innerHeight * 0.4,
      rotation: 16,
      duration: 0.7,
      ease: "none",
    })
    .to(".scrolling-dish", {
      autoAlpha: 0,
      y: () => window.innerHeight * 0.48,
      scale: 0.86,
      duration: 0.15,
      ease: "power2.in",
    });

  gsap.to(".dish-steam path", {
    y: -7,
    opacity: 0.25,
    stagger: 0.16,
    duration: 1.1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

initializeAnimations();
