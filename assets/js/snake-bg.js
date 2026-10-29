/* Pixel-art snake that roams the whole page and hunts squares.
   Its colour follows the section it is currently passing through.
   Each <section> declares its palette with data-snake="blue|teal|ember". */
(function () {
  const canvas = document.getElementById("snake-bg");
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const CELL = 14;            // size of one pixel-block in CSS px
  const GAP = 2;              // gap between blocks (pixel look)
  const STEP_MS = 110;        // time between moves
  const MAX_TARGETS = 5;      // squares on the page at once

  // Palettes ordered dark -> light. Index 0 is the head (strongest contrast).
  const PALETTES = {
    blue:  ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"],
    teal:  ["#1d4f52", "#2f6f73", "#3f8f94", "#5fb0b4", "#8fd0d2", "#b9e3e4"],
    ember: ["#6b2f14", "#8f4a2b", "#b5653a", "#d08a5e", "#e8b48f", "#f5d3bb"]
  };
  const DEFAULT_PALETTE = "blue";

  let cols = 0, rows = 0, dpr = 1, width = 0, height = 0;
  let bands = [];             // [{top, bottom, palette}]
  let snake = [];             // [{x, y}], head first
  let dir = { x: 1, y: 0 };
  let foods = [];
  let lastStep = 0;
  let blink = 0;

  const DIRS = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  function computeBands() {
    bands = Array.from(document.querySelectorAll("[data-snake]")).map(el => ({
      top: el.offsetTop,
      bottom: el.offsetTop + el.offsetHeight,
      palette: PALETTES[el.dataset.snake] ? el.dataset.snake : DEFAULT_PALETTE
    }));
  }

  function paletteAt(yPx) {
    for (const b of bands) {
      if (yPx >= b.top && yPx < b.bottom) return PALETTES[b.palette];
    }
    return PALETTES[DEFAULT_PALETTE];
  }

  function resize() {
    const layer = canvas.parentElement;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = layer.offsetWidth;
    height = layer.offsetHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(width / CELL);
    rows = Math.floor(height / CELL);
    computeBands();
    reset();
  }

  function occupied(x, y) {
    if (snake.some(s => s.x === x && s.y === y)) return true;
    return foods.some(f => f.x === x && f.y === y);
  }

  function randomFreeCell() {
    for (let tries = 0; tries < 200; tries++) {
      const x = Math.floor(Math.random() * cols);
      const y = Math.floor(Math.random() * rows);
      if (!occupied(x, y)) return { x, y };
    }
    return null;
  }

  function reset() {
    const startX = Math.max(3, Math.floor(cols * 0.8));
    const startY = Math.floor(rows * 0.1);
    snake = [];
    for (let i = 0; i < 6; i++) snake.push({ x: startX + i, y: startY });
    dir = { x: -1, y: 0 };
    foods = [];
    while (foods.length < MAX_TARGETS) {
      const c = randomFreeCell();
      if (!c) break;
      foods.push(c);
    }
  }

  function nearestFood(from) {
    let best = null, bestD = Infinity;
    for (const f of foods) {
      const d = Math.abs(f.x - from.x) + Math.abs(f.y - from.y);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }

  function isSafe(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === x && snake[i].y === y) return false;
    }
    return true;
  }

  function chooseDirection() {
    const head = snake[0];
    const target = nearestFood(head);
    const options = DIRS.filter(d => !(d.x === -dir.x && d.y === -dir.y));

    const scored = options.map(d => {
      const nx = head.x + d.x, ny = head.y + d.y;
      const safe = isSafe(nx, ny);
      const dist = target ? Math.abs(target.x - nx) + Math.abs(target.y - ny) : 0;
      const score = (safe ? 0 : 1000) + dist + Math.random() * 1.5;
      return { d, score, safe };
    });
    scored.sort((a, b) => a.score - b.score);
    return scored[0].safe ? scored[0].d : dir;
  }

  function step() {
    dir = chooseDirection();
    const head = snake[0];
    const nx = head.x + dir.x;
    const ny = head.y + dir.y;

    // Wrap sideways only; the page is finite vertically so the snake turns at top/bottom
    const wx = (nx + cols) % cols;
    const wy = ny;

    snake.unshift({ x: wx, y: wy });

    const eatenIndex = foods.findIndex(f => f.x === wx && f.y === wy);
    if (eatenIndex >= 0) {
      foods.splice(eatenIndex, 1);
      const c = randomFreeCell();
      if (c) foods.push(c);
    } else {
      snake.pop();
    }

    if (snake.length > cols * rows * 0.5) reset();
  }

  function drawBlock(x, y, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + GAP / 2, y * CELL + GAP / 2, CELL - GAP, CELL - GAP);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Food: blinking squares, coloured by the section they sit in
    blink = (blink + 1) % 40;
    const foodAlpha = blink < 28 ? 1 : 0.55;
    for (const f of foods) {
      const pal = paletteAt(f.y * CELL + CELL / 2);
      ctx.shadowColor = pal[2];
      ctx.shadowBlur = 12;
      drawBlock(f.x, f.y, pal[3], foodAlpha);
    }

    // Snake: tail to head. Each segment takes the palette of its section.
    for (let i = snake.length - 1; i >= 0; i--) {
      const s = snake[i];
      const pal = paletteAt(s.y * CELL + CELL / 2);
      const t = i / Math.max(1, snake.length - 1);     // 0 head, 1 tail
      const colorIdx = Math.min(pal.length - 1, Math.floor(t * (pal.length - 1)));
      const alpha = 0.95 - t * 0.5;
      ctx.shadowColor = pal[2];
      ctx.shadowBlur = i === 0 ? 14 : 8;
      drawBlock(s.x, s.y, pal[colorIdx], alpha);
    }

    // Eyes on the head
    const h = snake[0];
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fbf8f2";
    const ex = h.x * CELL, ey = h.y * CELL;
    const eyeSize = Math.max(2, Math.floor(CELL / 5));
    if (dir.x !== 0) {
      ctx.fillRect(ex + CELL * 0.55, ey + CELL * 0.25, eyeSize, eyeSize);
      ctx.fillRect(ex + CELL * 0.55, ey + CELL * 0.6, eyeSize, eyeSize);
    } else {
      ctx.fillRect(ex + CELL * 0.25, ey + CELL * 0.55, eyeSize, eyeSize);
      ctx.fillRect(ex + CELL * 0.6, ey + CELL * 0.55, eyeSize, eyeSize);
    }
    ctx.globalAlpha = 1;
  }

  function loop(ts) {
    if (!lastStep) lastStep = ts;
    if (ts - lastStep >= STEP_MS) {
      step();
      lastStep = ts;
    }
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("load", () => { computeBands(); });

  if (reduceMotion) {
    for (let i = 0; i < 60; i++) step();
    draw();
  } else {
    requestAnimationFrame(loop);
  }
})();
