/* faq.js: the FAQ accordion's slide-down animation (+ a tap ripple).
   The page still works without this file: the answers just open instantly.

   Why JavaScript: a closed <details> hides its content completely, and CSS
   cannot animate from "not rendered" to a height. The Web Animations API can:
   open the element, measure the panel, then animate from 0 to that height. */
(() => {
  const REDUCED  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = REDUCED ? 0 : 380;                  // ms; try 250 (snappy) to 600 (slow)
  const EASING   = "cubic-bezier(0.22, 1, 0.36, 1)";   // fast start, long gentle landing
  const RIPPLE   = !REDUCED;                           // set to false to switch the tap ripple off

  const items   = [...document.querySelectorAll(".faq-item")];
  const running = new WeakMap();                       // <details> -> its current animation

  // The four properties that make up the panel's size. They are animated
  // together, otherwise padding and border would pop in at the first frame.
  const ZERO = { height: "0px", paddingTop: "0px", paddingBottom: "0px", borderTopWidth: "0px" };

  // Rendered size right now (also correct in the middle of an animation).
  function size(el) {
    const s = getComputedStyle(el);
    return {
      height: s.height,
      paddingTop: s.paddingTop,
      paddingBottom: s.paddingBottom,
      borderTopWidth: s.borderTopWidth,
    };
  }

  function play(details, answer, from, to, done) {
    answer.style.overflow = "hidden";                  // text is clipped while the box grows or shrinks
    const anim = answer.animate([from, to], { duration: DURATION, easing: EASING, fill: "both" });
    running.set(details, anim);

    anim.onfinish = () => {
      done();                                          // commit the end state first (e.g. remove [open])...
      anim.cancel();                                   // ...then release the values the animation was holding
      running.delete(details);
      answer.style.overflow = "";
    };
  }

  function expand(details) {
    const answer = details.querySelector(".answer");
    // If the user clicked during a closing animation, continue from the
    // current height instead of jumping back to 0.
    const from = running.has(details) ? size(answer) : ZERO;
    running.get(details)?.cancel();

    details.classList.remove("is-closing");
    details.open = true;                               // renders the panel so it can be measured
    const to = size(answer);                           // natural size: no animation is active at this point
    play(details, answer, from, to, () => {});
  }

  function collapse(details) {
    const answer = details.querySelector(".answer");
    const from = size(answer);
    running.get(details)?.cancel();

    details.classList.add("is-closing");               // CSS flips the chevron immediately
    play(details, answer, from, ZERO, () => {
      details.open = false;                            // only now does the browser hide the content
      details.classList.remove("is-closing");
    });
  }

  const isOpen = (d) => d.open && !d.classList.contains("is-closing");

  items.forEach((details) => {
    details.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();                              // replace the browser's instant toggle
      if (isOpen(details)) {
        collapse(details);
        return;
      }
      // One open item at a time: the previous one slides shut while this one drops.
      items.forEach((other) => { if (other !== details && isOpen(other)) collapse(other); });
      expand(details);
    });
  });

  /* ---------- Tap ripple ---------- */
  if (!RIPPLE) return;

  items.forEach((details) => {
    const summary = details.querySelector("summary");

    // pointerdown (not click): instant feedback on touch, one event for mouse/finger/pen.
    summary.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;

      const rect = summary.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Radius = distance to the farthest corner, so the wave always covers the whole header.
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.cssText = `left:${x}px; top:${y}px; width:${radius * 2}px; height:${radius * 2}px;`;

      summary.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });
})();