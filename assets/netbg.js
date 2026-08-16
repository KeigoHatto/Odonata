/* 点と点が線で結ばれる背景モチーフ（ロゴの「関係性」の思想を反映）
   明るい背景に載せるため、線・点ともにネイビー寄りの淡色で描画する。
   対象：<canvas class="netbg"> を持つ要素。data-density で粒度を調整できる。 */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = document.querySelectorAll('canvas.netbg');
  if (!canvases.length) return;

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const density = parseFloat(canvas.dataset.density || '26');
    const accent = canvas.dataset.accent === 'dark';
    const line = accent ? '160,205,235' : '30,90,140';
    const dot = accent ? '200,232,250' : '20,74,120';
    let w, h, nodes, raf;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      const count = Math.round((canvas.offsetWidth * canvas.offsetHeight) / (density * 900));
      nodes = Array.from({ length: Math.max(14, Math.min(64, count)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - .5) * .16 * dpr,
        vy: (Math.random() - .5) * .16 * dpr,
        r: (Math.random() * 1.6 + 1.4) * dpr,
        hot: Math.random() < .16
      }));
      return dpr;
    };

    let dpr = resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const maxD = 165 * dpr;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduce) { a.x += a.vx; a.y += a.vy; }
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxD) {
            const o = (1 - d / maxD) * .34;
            ctx.strokeStyle = (a.hot && b.hot)
              ? `rgba(255,153,51,${o * 1.1})`
              : `rgba(${line},${o})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = n.hot ? 'rgba(255,153,51,.75)' : `rgba(${dot},.5)`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    draw();

    let t;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { cancelAnimationFrame(raf); dpr = resize(); draw(); }, 180);
    });
  });
})();
