// Sprites + fireworks (no click spawning) + overlay reveal button
(() => {
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('fw');
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H, dpr;
  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = canvas.width = Math.floor(innerWidth * dpr);
    H = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  addEventListener('resize', resize);
  resize();

  // --- Sprites setup ---
  const sprites = Array.from(document.querySelectorAll('.sprite')).map(img => {
    const size = parseFloat(img.dataset.size || '0.25'); // fraction of viewport width
    const base = Math.min(innerWidth, innerHeight);
    const w = Math.max(60, Math.round(base * size));
    img.style.width = w + 'px';
    // random start
    const x = Math.random() * (innerWidth - w);
    const y = Math.random() * (innerHeight - w);
    const speed = 60 + Math.random() * 120; // px/s
    const angle = Math.random() * Math.PI * 2;
    return { el: img, w, h: w, x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed };
  });

  let last = performance.now();
  function step(t){
    const dt = (t - last) / 1000;
    last = t;

    // Move sprites
    sprites.forEach(s => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      // bounce off edges
      if (s.x <= 0){ s.x = 0; s.vx *= -1; }
      if (s.y <= 0){ s.y = 0; s.vy *= -1; }
      if (s.x + s.w >= innerWidth){ s.x = innerWidth - s.w; s.vx *= -1; }
      if (s.y + s.h >= innerHeight){ s.y = innerHeight - s.h; s.vy *= -1; }
      s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });

    // Fireworks animation
    renderFireworks(dt);

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // --- Pixel Fireworks (canvas) ---
  const fireworks = [];
  function spawnFirework(x = Math.random() * W, y = Math.random() * H * 0.7 + H*0.15){
    const count = 32 + (Math.random()*32|0);
    const speed = 60 + Math.random() * 120;
    const size = (2 + Math.random()*2)|0; // pixel size
    const hue = Math.random()*360|0;
    const parts = [];
    for (let i=0;i<count;i++){
      const a = Math.random()*Math.PI*2;
      const v = speed*(.5 + Math.random());
      parts.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, life: 1, size, hue: (hue + (i*8))%360 });
    }
    fireworks.push({ parts });
  }

  let fwTimer = 0;
  function renderFireworks(dt){
    fwTimer += dt;
    if (fwTimer > 0.8){ // auto-spawn only (no click handler)
      fwTimer = 0;
      spawnFirework();
    }
    ctx.fillStyle = 'rgba(11,11,18,0.22)';
    ctx.fillRect(0,0,W,H);

    const g = 120; // gravity
    fireworks.forEach(fw => {
      fw.parts.forEach(p => {
        p.vy += g*dt;
        p.x += p.vx*dt*dpr;
        p.y += p.vy*dt*dpr;
        p.life -= dt * (0.6 + Math.random()*0.4);
        const alpha = Math.max(0,p.life);
        ctx.fillStyle = `hsla(${p.hue} 100% 65% / ${alpha})`;
        const s = p.size * dpr;
        ctx.fillRect(p.x|0, p.y|0, s, s);
      });
    });
    for (let i=fireworks.length-1; i>=0; i--){
      if (fireworks[i].parts.every(p => p.life <= 0)){
        fireworks.splice(i,1);
      }
    }
  }

  // --- Reveal overlay button ---
  const btn = document.getElementById('revolution');
  const overlay = document.getElementById('overlay');
  btn.addEventListener('click', () => {
    overlay.classList.add('active');
  });
})();
