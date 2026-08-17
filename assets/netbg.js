/* 点と点が線で結ばれる背景モチーフ（ロゴの「関係性」の思想を反映）
   ・ノードは3段階のサイズを持つ（多くの指標とつながる中心的なノードが存在する、という含意）
   ・エッジは太さと不透明度にばらつきを持たせる（関係の強弱）
   ・2〜3層に分け、奥のレイヤーほど小さく・薄く・ゆっくり動かす（視差）
   ・配色はブランドカラー（ネイビー／ブルー）とアクセントのオレンジのみ
   対象：<canvas class="netbg">。data-density で粒度、data-accent="dark" で暗い面用の配色。 */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = document.querySelectorAll('canvas.netbg');
  if (!canvases.length) return;

  // 奥・中・手前の3層。奥ほど小さく薄く遅い
  const LAYERS = [
    { scale: 0.55, alpha: 0.42, speed: 0.30 },
    { scale: 0.80, alpha: 0.70, speed: 0.62 },
    { scale: 1.00, alpha: 1.00, speed: 1.00 },
  ];
  // ノードの大きさは3段階（比率と出現頻度）
  const SIZES = [
    { r: 1.3, w: 0.58 },
    { r: 2.3, w: 0.30 },
    { r: 3.6, w: 0.12 },
  ];
  const pickSize = () => {
    let t = Math.random();
    for (const s of SIZES) { if ((t -= s.w) <= 0) return s.r; }
    return SIZES[0].r;
  };

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext('2d');
    const density = parseFloat(canvas.dataset.density || '26');
    const dark = canvas.dataset.accent === 'dark';
    const line = dark ? '160,205,235' : '30,90,140';
    const dot = dark ? '200,232,250' : '20,74,120';
    let w, h, dpr, layers, raf = null, running = false;

    const build = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = canvas.offsetWidth * dpr;
      h = canvas.height = canvas.offsetHeight * dpr;
      // 画面が狭いときはノード数を減らす（描画負荷とバッテリー対策）
      const narrow = canvas.offsetWidth < 720;
      const base = Math.round((canvas.offsetWidth * canvas.offsetHeight) / (density * 900));
      const total = Math.max(10, Math.min(narrow ? 26 : 60, narrow ? Math.round(base * 0.5) : base));
      layers = LAYERS.map((L, li) => {
        const n = Math.max(4, Math.round(total * (li === 2 ? 0.42 : li === 1 ? 0.34 : 0.24)));
        return {
          ...L,
          nodes: Array.from({ length: n }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - .5) * .16 * L.speed * dpr,
            vy: (Math.random() - .5) * .16 * L.speed * dpr,
            r: pickSize() * L.scale * dpr,
            hot: Math.random() < .14,
          })),
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const L of layers) {
        const maxD = 165 * L.scale * dpr;
        const ns = L.nodes;
        for (let i = 0; i < ns.length; i++) {
          const a = ns[i];
          if (!reduce) { a.x += a.vx; a.y += a.vy; }
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
          for (let j = i + 1; j < ns.length; j++) {
            const b = ns[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < maxD) {
              // 近いほど濃く太く＝関係が強い
              const t = 1 - d / maxD;
              const o = t * .32 * L.alpha;
              ctx.strokeStyle = (a.hot && b.hot) ? `rgba(255,153,51,${o * 1.15})` : `rgba(${line},${o})`;
              ctx.lineWidth = (0.6 + t * 1.1) * L.scale * dpr;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
        }
        for (const n of ns) {
          ctx.fillStyle = n.hot ? `rgba(255,153,51,${.7 * L.alpha})` : `rgba(${dot},${.48 * L.alpha})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (!reduce && running) raf = requestAnimationFrame(draw);
    };

    const start = () => { if (running) return; running = true; draw(); };
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };

    build();
    if (reduce) { draw(); } else { start(); }

    // タブが非表示のあいだは描画を止める
    document.addEventListener('visibilitychange', () => {
      if (reduce) return;
      document.visibilityState === 'hidden' ? stop() : start();
    });

    let t;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { stop(); build(); reduce ? draw() : start(); }, 180);
    });
  });
})();
