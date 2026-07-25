  // ==================== スクロール・ストーリー ====================
  (function(){
    const track = document.getElementById('storyTrack');
    if (!track) return;
    const nodes   = [...document.querySelectorAll('#stageInner .snode')];
    const core    = document.getElementById('storyCore');
    const glow    = document.getElementById('stageGlow');
    const rL      = document.getElementById('rchipL');
    const rR      = document.getElementById('rchipR');
    const beamL   = document.getElementById('beamL');
    const beamR   = document.getElementById('beamR');
    const caps    = [...document.querySelectorAll('#storyCaption .scap')];
    const fill    = document.getElementById('strengthFill');
    const hint    = document.getElementById('storyHint');

    const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
    const ease  = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;   // easeInOutQuad
    const scatterScale = () => clamp(Math.min(window.innerWidth/1100, window.innerHeight/860), .42, 1);

    // 背景パーティクル（ロゴのネットワークを反映）
    const cv = document.getElementById('storyCanvas');
    if (cv){
      const cx = cv.getContext('2d');
      let cw, ch, ps; const PN = 52;
      const prs = () => { cw = cv.width = cv.offsetWidth*devicePixelRatio; ch = cv.height = cv.offsetHeight*devicePixelRatio; };
      const pin = () => { ps = Array.from({length:PN}, () => ({ x:Math.random()*cw, y:Math.random()*ch,
        vx:(Math.random()-.5)*.22*devicePixelRatio, vy:(Math.random()-.5)*.22*devicePixelRatio, r:(Math.random()*1.7+1)*devicePixelRatio })); };
      const pdr = () => {
        cx.clearRect(0,0,cw,ch); const md = 150*devicePixelRatio;
        for (let i=0;i<ps.length;i++){ const a=ps[i]; a.x+=a.vx; a.y+=a.vy;
          if(a.x<0||a.x>cw)a.vx*=-1; if(a.y<0||a.y>ch)a.vy*=-1;
          for (let j=i+1;j<ps.length;j++){ const b=ps[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
            if(d<md){ cx.strokeStyle=`rgba(160,220,255,${(1-d/md)*.32})`; cx.lineWidth=devicePixelRatio;
              cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.stroke(); } } }
        for (const n of ps){ cx.fillStyle='rgba(200,235,255,.85)'; cx.beginPath(); cx.arc(n.x,n.y,n.r,0,Math.PI*2); cx.fill(); }
        requestAnimationFrame(pdr);
      };
      prs(); pin(); pdr();
      window.addEventListener('resize', () => { prs(); pin(); });
    }

    let ticking = false;
    function update(){
      ticking = false;
      const rect  = track.getBoundingClientRect();
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / total, 0, 1);
      const s = scatterScale();

      // ① バラバラ → 集約（0.08〜0.40 で中央へ、0.40〜0.47 で吸収フェード）
      const conv = ease(clamp((p-0.08)/0.32, 0, 1));
      const fade = clamp(1-(p-0.40)/0.07, 0, 1);
      nodes.forEach(n => {
        const dx = parseFloat(n.dataset.x)*s*(1-conv);
        const dy = parseFloat(n.dataset.y)*s*(1-conv);
        n.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(${1-0.45*conv})`;
        n.style.opacity = p < 0.40 ? 1 : fade;
      });

      // ② ロゴ出現（0.30〜0.50）
      const coreT = ease(clamp((p-0.30)/0.20, 0, 1));
      core.style.opacity = coreT;
      core.style.transform = `translate(-50%,-50%) scale(${0.6+0.4*coreT})`;
      glow.style.opacity = coreT*0.9;

      // ③ 分析結果が広がる（0.50〜0.74）
      const rel = ease(clamp((p-0.50)/0.24, 0, 1));
      [rL, rR].forEach(el => {
        const bx = parseFloat(el.dataset.x)*s, by = parseFloat(el.dataset.y)*s;
        el.style.opacity = rel;
        el.style.transform = `translate(-50%,-50%) translate(${bx*rel}px,${by*rel}px) scale(${0.8+0.2*rel})`;
      });
      const beam = (el, target) => {
        const bx = parseFloat(target.dataset.x)*s, by = parseFloat(target.dataset.y)*s;
        el.style.opacity = rel*0.8;
        el.style.width = (Math.hypot(bx,by)*rel) + 'px';
        el.style.transform = `translate(0,-50%) rotate(${Math.atan2(by,bx)*180/Math.PI}deg)`;
      };
      beam(beamL, rL); beam(beamR, rR);

      // ④ チームが強くなる（0.80〜0.98）
      if (fill) fill.style.width = (clamp((p-0.80)/0.18, 0, 1)*100) + '%';

      // キャプション切替
      const idx = p<0.28 ? 0 : p<0.50 ? 1 : p<0.78 ? 2 : 3;
      caps.forEach((c,i) => c.classList.toggle('on', i===idx));
      if (hint) hint.style.opacity = p>0.04 ? 0 : 0.85;
    }
    function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', update);
    update();
  })();
