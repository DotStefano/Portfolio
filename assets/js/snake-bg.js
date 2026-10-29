/* Minimal glowing snake background for the hero section */
(function () {
  const canvas = document.getElementById("snake-bg");
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  const SEGMENTS = 46;        // length of the snake
  const SPEED = 1.6;          // px per frame
  const TURN = 0.06;          // max turn per frame (radians)
  const COLORS = ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

  let width = 0, height = 0, dpr = 1;
  let snake = [];
  let angle = 0;
  let targetAngle = 0;
  let frame = 0;

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
    reset();
  }

  function reset() {
    const x = width * 0.8;
    const y = height * 0.5;
    angle = Math.PI;
    targetAngle = angle;
    snake = [];
    for (let i = 0; i < SEGMENTS; i++) {
      snake.push({ x: x + i * 4, y: y });
    }
  }

  function step() {
    frame++;
    // Pick a new gentle target heading every so often
    if (frame % 90 === 0) {
      targetAngle = angle + (Math.random() - 0.5) * Math.PI * 0.9;
    }
    // Steer toward the target, limited by TURN
    let diff = targetAngle - angle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    angle += Math.max(-TURN, Math.min(TURN, diff));

    const head = snake[0];
    let nx = head.x + Math.cos(angle) * SPEED;
    let ny = head.y + Math.sin(angle) * SPEED;

    // Bounce softly off the edges by redirecting the target
    const margin = 20;
    if (nx < margin || nx > width - margin || ny < margin || ny > height - margin) {
      targetAngle = Math.atan2(height / 2 - ny, width / 2 - nx) + (Math.random() - 0.5) * 0.6;
      nx = Math.max(margin, Math.min(width - margin, nx));
      ny = Math.max(margin, Math.min(height - margin, ny));
    }

    snake.unshift({ x: nx, y: ny });
    snake.pop();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 18;

    // Draw from tail to head so the head sits on top
    for (let i = snake.length - 1; i > 0; i--) {
      const a = snake[i];
      const b = snake[i - 1];
      const t = i / (snake.length - 1);          // 0 at head, 1 at tail
      const alpha = 0.85 * (1 - t * 0.85);
      const width_ = 6 * (1 - t * 0.7) + 1.5;
      const color = COLORS[Math.min(COLORS.length - 1, Math.floor((1 - t) * COLORS.length))];

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width_;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Head dot with a stronger glow
    const h = snake[0];
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 26;
    ctx.fillStyle = "#bfdbfe";
    ctx.beginPath();
    ctx.arc(h.x, h.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // Static snapshot: advance a little so it doesn't look like a straight line
    for (let i = 0; i < 120; i++) step();
    draw();
  } else {
    requestAnimationFrame(loop);
  }
})();
