/* route.js: draws the dashed line from the delivery man to the house.

   The line is not an image. This script measures where the two pictures are,
   builds a smooth curve between them, and puts it in an <svg>. Because it
   measures, the line stays attached to both pictures when the window is
   resized or when the pictures finish loading. contact.css animates it.
*/

(() => {
  const grid = document.querySelector(".contact-grid");
  const man = grid && grid.querySelector(".delivery");
  const house = grid && grid.querySelector(".house");

  if (!grid || !man || !house) return;

  // The route's shape from the Figma design.
  const SHAPE = [
    [1, 3],
    [48, 5],
    [86, 45],
    [99, 130],
    [89, 215],
    [73, 295],
    [74, 380],
    [113, 455],
    [188, 503],
    [258, 498],
    [328, 453],
    [395, 380],
    [426, 285],
    [383, 224],
    [323, 231],
    [275, 295],
    [267, 380],
    [308, 460],
    [403, 515],
    [523, 531],
    [633, 503],
    [708, 505],
    [737, 557]
  ];

  const [X0, Y0] = SHAPE[0];
  const [X1, Y1] = SHAPE[SHAPE.length - 1];

  // Convert Catmull-Rom points to a smooth cubic Bezier path.
  function smoothPath(pts) {
    const f = (n) => n.toFixed(1);

    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const c1 = {
        x: p1.x + (p2.x - p0.x) / 6,
        y: p1.y + (p2.y - p0.y) / 6
      };

      const c2 = {
        x: p2.x - (p3.x - p1.x) / 6,
        y: p2.y - (p3.y - p1.y) / 6
      };

      d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(
        p2.x
      )} ${f(p2.y)}`;
    }

    return d;
  }

  // ----- Build the SVG once -----

  const NS = "http://www.w3.org/2000/svg";

  function make(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);

    for (const name in attrs) {
      node.setAttribute(name, attrs[name]);
    }

    parent.appendChild(node);
    return node;
  }

  const svg = make(
    "svg",
    {
      class: "route",
      "aria-hidden": "true",
      focusable: "false"
    },
    grid
  );

  const defs = make("defs", {}, svg);

  const mask = make(
    "mask",
    {
      id: "route-mask",
      maskUnits: "userSpaceOnUse",
      maskContentUnits: "userSpaceOnUse",
      x: -2000,
      y: -2000,
      width: 6000,
      height: 6000
    },
    defs
  );

  const reveal = make(
    "path",
    {
      class: "route-reveal",
      pathLength: "1"
    },
    mask
  );

  const dashes = make(
    "path",
    {
      class: "route-dashes",
      mask: "url(#route-mask)"
    },
    svg
  );

  // ----- Measure and redraw -----

  function update() {
    const g = grid.getBoundingClientRect();
    const m = man.getBoundingClientRect();
    const h = house.getBoundingClientRect();

    // Start: just to the right of the delivery man, near his feet.
    const start = {
      x: m.right - g.left + m.width * 0.35,
      y: m.top - g.top + m.height * 0.78
    };

    // End: just before the house.
    const end = {
      x: h.left - g.left - h.width * 0.5,
      y: h.bottom - g.top + 2
    };

    // Map the Figma route shape onto the actual positions.
    const pts = SHAPE.map(([x, y]) => ({
      x: start.x + ((x - X0) / (X1 - X0)) * (end.x - start.x),
      y: start.y + ((y - Y0) / (Y1 - Y0)) * (end.y - start.y)
    }));

    const d = smoothPath(pts);

    reveal.setAttribute("d", d);
    dashes.setAttribute("d", d);
  }

  // Recalculate whenever the grid or images change size.
  const observer = new ResizeObserver(update);

  [grid, man, house].forEach((element) => {
    observer.observe(element);
  });

  window.addEventListener("load", update);

  if (document.fonts) {
    document.fonts.ready.then(update);
  }

  update();
})();