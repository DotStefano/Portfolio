/* Pixel-art snake hunting squares, for the hero background.
   Palette kept from the site: navy -> light blue, with a soft blue glow. */
(function () {
  const canvas = document.getElementById("snake-bg");
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const CELL = 14;            // size of one pixel-block in CSS px
  const GAP = 2;              // gap between blocks (gives the pixel look)
  const STEP_MS = 110;        // time between moves
  const MAX_TARGETS = 3;      // squares on screen at once
  const SNAKE_COLORS = ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];
  const FOOD_COLOR = "#bfdbfe";

  let cols = 0, rows = 0, dpr = 1, width = 0, height = 0;
  let snake = [];             // [{x, y}], head first
  let dir = { x: 1, y: 0 };
  let foods = [];
  let lastStep = 0;
  let blink = 0;

  const DIRS = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(width / CELL);
    rows = Math.floor(height / CELL);
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
    const startX = Math.max(3, Math.floor(cols * 0.75));
    const startY = Math.floor(rows / 2);
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
    // The tail moves away this step, so its cell is safe to enter
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
      // Lower is better; small random factor keeps the path organic
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

    // Wrap around the edges so the snake keeps roaming
    const wx = (nx + cols) % cols;
    const wy = (ny + rows) % rows;

    snake.unshift({ x: wx, y: wy });

    const eatenIndex = foods.findIndex(f => f.x === wx && f.y === wy);
    if (eatenIndex >= 0) {
      foods.splice(eatenIndex, 1);
      const c = randomFreeCell();
      if (c) foods.push(c);
    } else {
      snake.pop();
    }

    // If the snake has nowhere useful to go, start over
    if (snake.length > cols * rows * 0.5) reset();
  }

  function drawBlock(x, y, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + GAP / 2, y * CELL + GAP / 2, CELL - GAP, CELL - GAP);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.shadowColor = "#3b82f6";

    // Food: blinking squares with glow
    blink = (blink + 1) % 40;
    const foodAlpha = blink < 28 ? 1 : 0.55;
    ctx.shadowBlur = 14;
    for (const f of foods) {
      drawBlock(f.x, f.y, FOOD_COLOR, foodAlpha);
    }

    // Snake: tail to head, colour shifts from dark navy (tail) to light blue (head)
    ctx.shadowBlur = 10;
    for (let i = snake.length - 1; i >= 0; i--) {
      const t = i / Math.max(1, snake.length - 1);   // 0 head, 1 tail
      const colorIdx = Math.min(SNAKE_COLORS.length - 1, Math.floor((1 - t) * SNAKE_COLORS.length));
      const alpha = 0.95 - t * 0.5;
      drawBlock(snake[i].x, snake[i].y, SNAKE_COLORS[colorIdx], alpha);
    }

    // Eyes on the head
    const h = snake[0];
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#0b1d3a";
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

  if (reduceMotion) {
    for (let i = 0; i < 60; i++) step();
    draw();
  } else {
    requestAnimationFrame(loop);
  }
})();
