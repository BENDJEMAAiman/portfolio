/* links.js: carousel for the links page.
   State is ONE number (index). show() is the only function that changes
   what is visible, so buttons, keyboard and swipe all go through it. */
(() => {
  const carousel = document.querySelector(".carousel");
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll(".slide")];
  const art    = carousel.querySelector(".art");
  const prev   = carousel.querySelector(".arrow--prev");
  const next   = carousel.querySelector(".arrow--next");
  const status = carousel.querySelector("[role='status']");
  const total  = slides.length;
  if (total === 0) return;

  let index = 0;

  function show(i) {
    // Modulo wraps both ends: after the last slide comes the first, and
    // (i + total) keeps the result positive when stepping back from 0.
    index = (i + total) % total;

    slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));

    const name = slides[index].querySelector(".slide-label").textContent.trim();
    status.textContent = `${name}, ${index + 1} of ${total}`;
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));

  // Arrow keys work whenever focus is inside the carousel (e.g. on a button).
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  // Swipe: compare where the pointer went down and where it came up.
  let startX = null;
  let swiped = false;

  art.addEventListener("pointerdown", (e) => { startX = e.clientX; swiped = false; });
  art.addEventListener("pointercancel", () => { startX = null; });
  art.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) {            // ignore taps and tiny jitters
      swiped = true;
      show(index + (dx < 0 ? 1 : -1));  // swipe left = next
    }
  });

  // A swipe that ends on the link must not also open it.
  art.addEventListener("click", (e) => {
    if (swiped) { e.preventDefault(); swiped = false; }
  }, true);

  // With one slide or none, there is nothing to scroll.
  if (total < 2) {
    prev.hidden = true;
    next.hidden = true;
    carousel.querySelector(".hint")?.setAttribute("hidden", "");
  }

  carousel.dataset.ready = "true";      // CSS switches from "stacked list" to "carousel"
  show(0);
})();