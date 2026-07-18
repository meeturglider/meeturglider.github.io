document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // Reveal animation
  // ==========================

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, {
    threshold: 0.15
  });

  document.querySelectorAll(".section, .stat-card").forEach(el => {
    el.classList.add("reveal");
    observer.observe(el);
  });

  // ==========================
  // Active navigation
  // ==========================

  const sections = document.querySelectorAll("section");
  const links = document.querySelectorAll(".nav-links a");

  window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

      const top = section.offsetTop - 120;

      if (window.scrollY >= top) {
        current = section.getAttribute("id");
      }

    });

    links.forEach(link => {

      link.classList.remove("active");

      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }

    });

  });

});
