'use strict';

/* ── Custom cursor ── */
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', e => {
  cursor.style.left    = e.clientX + 'px';
  cursor.style.top     = e.clientY + 'px';
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, .project-card, .contact-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '50px';
    cursor.style.height = '50px';
    cursor.style.borderColor = '#00d4ff';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '32px';
    cursor.style.height = '32px';
    cursor.style.borderColor = '#00ff88';
  });
});

/* ── Nav scroll behaviour ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

/* ── Mobile nav toggle ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ── Hero canvas: starfield + grid ── */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, stars, gridZ;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function initStars() {
    stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + .3,
      speed: Math.random() * .4 + .08,
      opacity: Math.random() * .7 + .2,
    }));
    gridZ = 0;
  }

  function drawGrid() {
    const cols = 12;
    const rows = 10;
    const vp   = { x: W / 2, y: H * .72 };   // vanishing point
    const bottom = H + 20;
    const spread = W * 1.2;

    ctx.strokeStyle = 'rgba(0,255,136,.1)';
    ctx.lineWidth   = 1;

    /* vertical lines */
    for (let i = 0; i <= cols; i++) {
      const bx = -spread / 2 + (spread / cols) * i + W / 2 - W / 2;
      ctx.beginPath();
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(W * -.1 + (W * 1.2 / cols) * i, bottom);
      ctx.stroke();
    }

    /* horizontal lines (perspective) */
    const gridOffset = (gridZ % 80) / 80;
    for (let j = 0; j <= rows; j++) {
      const t  = (j + gridOffset) / rows;
      const et = Math.pow(t, 2.2);
      const y  = vp.y + (bottom - vp.y) * et;
      const hw = (W * 1.2 / 2) * et;
      ctx.beginPath();
      ctx.moveTo(vp.x - hw, y);
      ctx.lineTo(vp.x + hw, y);
      ctx.stroke();
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    /* background gradient */
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .7);
    grad.addColorStop(0,   'rgba(13,18,38,.6)');
    grad.addColorStop(1,   'rgba(8,9,26,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    gridZ += .4;

    stars.forEach(s => {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }

  resize();
  initStars();
  tick();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

/* ── Typewriter ── */
(function initTypewriter() {
  const el      = document.getElementById('typewriter');
  const phrases = [
    'ASPIRING GAME DEVELOPER',
    'JAVA DEVELOPER',
    'FUTURE INDIE DEV',
    'BUILDING DIGITAL WORLDS',
  ];
  let pi = 0, ci = 0, deleting = false, wait = 0;

  function tick() {
    const phrase = phrases[pi];
    if (wait > 0) { wait--; setTimeout(tick, 80); return; }

    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; wait = 22; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 6; }
    }
    setTimeout(tick, deleting ? 45 : 90);
  }
  setTimeout(tick, 800);
})();

/* ── Scroll-triggered animations (IntersectionObserver) ── */
(function initScrollAnimations() {
  /* XP bars */
  const xpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const xp  = bar.dataset.xp;
      bar.style.width = xp + '%';
      xpObserver.unobserve(bar);
    });
  }, { threshold: .3 });

  document.querySelectorAll('.xp-fill.animate').forEach(b => xpObserver.observe(b));

  /* Fade-in cards */
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });

  document.querySelectorAll('.project-card, .skill-group, .char-card, .terminal-box').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    fadeObserver.observe(el);
  });
})();

/* ── Smooth active nav link ── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.style.color = '');
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.style.color = '#00ff88';
      }
    });
  }, { threshold: .5 });

  sections.forEach(s => obs.observe(s));
})();
