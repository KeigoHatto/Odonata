  // hero network animation (echoes the logo)
  const canvas = document.getElementById('netCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, nodes;
  const COUNT = 64;
  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  function init(){
    nodes = Array.from({length: COUNT}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-.5)*0.25*devicePixelRatio,
      vy: (Math.random()-.5)*0.25*devicePixelRatio,
      r: (Math.random()*2+1.2)*devicePixelRatio
    }));
  }
  function draw(){
    if(window.__hero3dActive){ ctx.clearRect(0,0,w,h); return; }   // 3D 起動後は 2D を停止
    ctx.clearRect(0,0,w,h);
    const maxD = 150*devicePixelRatio;
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if(a.x<0||a.x>w) a.vx*=-1;
      if(a.y<0||a.y>h) a.vy*=-1;
      for(let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if(d<maxD){
          ctx.strokeStyle = `rgba(160,220,255,${(1-d/maxD)*0.4})`;
          ctx.lineWidth = 1*devicePixelRatio;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    for(const n of nodes){
      ctx.fillStyle = 'rgba(200,235,255,.9)';
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  resize(); init(); draw();
  window.addEventListener('resize', () => { resize(); init(); });
