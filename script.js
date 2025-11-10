(() => {
  const stage = document.getElementById('stage');
  const canvas = document.getElementById('fw');
  const ctx = canvas.getContext('2d', { alpha: true });
  const audio = document.getElementById('bgm');
  const sfx = document.getElementById('sfxFail');
  const banner = document.querySelector('.banner');

  // Sizing
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

  // Start music (gesture fallback if blocked)
  function startMusic(){
    if (!audio) return;
    audio.loop = true;
    audio.play().catch(() => {
      const once = () => { audio.play().catch(()=>{}); removeEventListener('pointerdown', once); };
      addEventListener('pointerdown', once, { once: true });
    });
  }
  startMusic();

  // Compute safe top margin under the banner so sprites don't hide under it
  function bannerBottomPx(){
    const rect = banner.getBoundingClientRect();
    return rect.bottom;
  }

  // Sprites setup (DVD-style)
  const sprites = Array.from(document.querySelectorAll('.sprite')).map(img => {
    const size = parseFloat(img.dataset.size || '0.25');
    const base = Math.min(innerWidth, innerHeight);
    const w = Math.max(60, Math.round(base * size));
    img.style.width = w + 'px';
    const minY = bannerBottomPx() + 10; // keep below banner
    const maxY = innerHeight - w;
    const x = Math.random() * (innerWidth - w);
    const y = Math.max(minY, Math.random() * (maxY - minY) + minY);
    const speed = 80 + Math.random() * 120;
    const angle = Math.random() * Math.PI * 2;
    return { el: img, w, h: w, x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed };
  });

  // Animation loop with proper edge bounces and vertical limits honoring banner
  let last = performance.now();
  function step(t){
    const dt = (t - last) / 1000;
    last = t;
    const minY = bannerBottomPx() + 10;
    const maxY = innerHeight;

    sprites.forEach(s => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (s.x <= 0){ s.x = 0; s.vx *= -1; }
      if (s.x + s.w >= innerWidth){ s.x = innerWidth - s.w; s.vx *= -1; }

      if (s.y <= minY){ s.y = minY; s.vy *= -1; }
      if (s.y + s.h >= maxY){ s.y = maxY - s.h; s.vy *= -1; }

      s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });

    renderFireworks(dt);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Pixel fireworks (auto only)
  const fireworks = [];
  function spawnFirework(x = Math.random() * W, y = Math.random() * H * 0.7 + H*0.15){
    const count = 32 + (Math.random()*32|0);
    const speed = 60 + Math.random() * 120;
    const size = (2 + Math.random()*2)|0;
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
    if (fwTimer > 0.8){ fwTimer = 0; spawnFirework(); }
    ctx.fillStyle = 'rgba(11,11,18,0.22)';
    ctx.fillRect(0,0,W,H);
    const g = 120;
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
      if (fireworks[i].parts.every(p => p.life <= 0)) fireworks.splice(i,1);
    }
  }

  // Overlay button + SFX
  document.getElementById('revolution').addEventListener('click', () => {
    document.getElementById('overlay').classList.add('active');
    if (sfx) { try { sfx.currentTime = 0; sfx.play(); } catch(e){} }
  });

  // Messages (fish cycles; person random Schopenhauer; frog fixed)
  const schopenhauer = [
    "Life swings like a pendulum backward and forward between pain and boredom.",
    "Hope is the confusion of the desire for a thing with its probability.",
    "A man can be himself only so long as he is alone.",
    "We forfeit three-fourths of ourselves in order to be like other people.",
    "We can regard our life as a uselessly disturbing episode in the blissful repose of nothingness."
  ];
  let fishStep = -1;
  function fishMsg(){
    fishStep = (fishStep + 1) % 3;
    return ["ბლეყ","ბლეყყყყყყყყყყ","ბლეყყყყყყყყყყყყყყყყყყყყყყყყყყყყყყ"][fishStep];
  }
  function rand(arr){ return arr[(Math.random()*arr.length)|0]; }

  sprites.forEach(s => {
    s.el.addEventListener('click', () => {
      let text = "";
      if (s.el.alt === "Fish") text = fishMsg();
      else if (s.el.alt === "Person") text = rand(schopenhauer);
      else if (s.el.alt === "Frog") text = "გომბეშიკო ვარ რა";

      const bubble = document.createElement('div');
      bubble.className = 'speech';
      bubble.textContent = text;
      // Position bubble relative to #stage coordinates
      bubble.style.left = (s.x + s.w/2) + 'px';
      bubble.style.top  = (s.y - 10) + 'px';
      stage.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1400);
    });
  });
})();
