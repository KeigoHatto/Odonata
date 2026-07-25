(async () => {
  const hero = document.querySelector('.hero#top');
  if (!hero) return;

  // WebGL 非対応なら 2D のまま
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return;
  } catch { return; }

  let THREE;
  try { THREE = await import('three'); }   // CDN 障害時はここで例外 → 2D にフォールバック
  catch { return; }

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── レンダラ ──
  const canvas = document.createElement('canvas');
  canvas.id = 'hero3d';
  hero.insertBefore(canvas, hero.firstChild);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x071A3A, 0.010);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  camera.position.set(0, 0, 64);

  // ロゴを一つの球体に：左＝複眼（知覚）／内部＝ネットワーク（分析）／右＝中心から縁へ伸びるフラクタル（意思決定）
  const group = new THREE.Group();
  scene.add(group);

  const V3   = (x,y,z) => new THREE.Vector3(x,y,z);
  const rand = (a,b) => a + Math.random()*(b-a);
  const deg  = THREE.MathUtils.degToRad;
  const WHITE = new THREE.Color(0xffffff);
  const fibDir = (i,n) => {              // フィボナッチ球：均等な方向ベクトル
    const t = (i+.5)/n, phi = Math.acos(1-2*t), th = Math.PI*(1+Math.sqrt(5))*i;
    return V3(Math.sin(phi)*Math.cos(th), Math.sin(phi)*Math.sin(th), Math.cos(phi));
  };

  // ── グローテクスチャ ──
  const glow = (() => {
    const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
    const g = cv.getContext('2d');
    const rg = g.createRadialGradient(s/2,s/2,0, s/2,s/2,s/2);
    rg.addColorStop(0,  'rgba(255,255,255,1)');
    rg.addColorStop(.25,'rgba(255,255,255,.9)');
    rg.addColorStop(.55,'rgba(160,220,255,.35)');
    rg.addColorStop(1,  'rgba(160,220,255,0)');
    g.fillStyle = rg; g.fillRect(0,0,s,s);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  })();

  // グロー点群（距離でサイズ減衰）を作る共通ヘルパ
  const clouds = [];
  function makeCloud(max){
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(max*3), col = new Float32Array(max*3), size = new Float32Array(max);
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col,3));
    geo.setAttribute('psize',    new THREE.BufferAttribute(size,1));
    const mat = new THREE.ShaderMaterial({
      uniforms:{ uTex:{value:glow}, uScale:{value:0} },
      vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      vertexShader:`
        attribute float psize; varying vec3 vColor; uniform float uScale;
        void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
          gl_PointSize=psize*uScale/-mv.z; gl_Position=projectionMatrix*mv; }`,
      fragmentShader:`
        uniform sampler2D uTex; varying vec3 vColor;
        void main(){ vec4 t=texture2D(uTex,gl_PointCoord); gl_FragColor=vec4(vColor,t.a)*t.a; }`
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const cloud = { pts, pos, col, size, geo, mat };
    clouds.push(cloud);
    return cloud;
  }

  const R = 25;   // 球の基準半径

  // ═════ ① 複眼（左）：球面を覆う同心リングのハニカム ═════
  const lerpStops = (stops, t) => {
    t = Math.min(Math.max(t, 0), 1);
    for (let i = 1; i < stops.length; i++){
      if (t <= stops[i].t){
        const a = stops[i-1], b = stops[i];
        return a.c.clone().lerp(b.c, (t - a.t) / (b.t - a.t));
      }
    }
    return stops[stops.length-1].c.clone();
  };
  // ロゴ準拠：上＝淡シアン → 深紺 → 下＝中間ブルー（暗背景向けに少し明るめ）
  const eyeStops = [
    { t:0,   c:new THREE.Color(0xcfeeff) },
    { t:.38, c:new THREE.Color(0x4db8ff) },
    { t:.68, c:new THREE.Color(0x123f7e) },
    { t:1,   c:new THREE.Color(0x2e86e0) },
  ];
  const eyeCenter = V3(-.85, .08, .45).normalize();   // 複眼ドームの中心方向（左・手前寄り）
  const eyeA = V3(0,1,0).cross(eyeCenter).normalize();
  const eyeB = eyeCenter.clone().cross(eyeA).normalize();

  const HEX_S   = 2.5;                     // 六角形の外接半径
  const ROW_ANG = (1.5*HEX_S)/R;           // リング間の角度（ハニカムの行間 1.5s）
  const ARC_SP  = Math.sqrt(3)*HEX_S;      // リング内の弧間隔（隣接中心距離 √3s）
  const EYE_MAX = deg(64);                 // 複眼の角半径
  const hexGeo = new THREE.CircleGeometry(1, 6);
  const hexes = [];
  const _m4 = new THREE.Matrix4();
  {
    const K = Math.floor(EYE_MAX/ROW_ANG);
    for (let k = 0; k <= K; k++){
      const th = k*ROW_ANG;                                    // 中心からの角距離
      const cnt = k === 0 ? 1 : Math.max(1, Math.round(2*Math.PI*R*Math.sin(th)/ARC_SP));
      for (let j = 0; j < cnt; j++){
        const ph = 2*Math.PI*j/cnt + (k%2 ? Math.PI/cnt : 0);  // 千鳥配置
        const ring = eyeA.clone().multiplyScalar(Math.cos(ph)).addScaledVector(eyeB, Math.sin(ph));
        const nrm  = eyeCenter.clone().multiplyScalar(Math.cos(th)).addScaledVector(ring, Math.sin(th));
        const eTh  = eyeCenter.clone().multiplyScalar(-Math.sin(th)).addScaledVector(ring, Math.cos(th));
        const ePh  = nrm.clone().cross(eTh);
        const p = nrm.clone().multiplyScalar(R + .4);
        const base = lerpStops(eyeStops, 1 - (nrm.y + 1)/2);   // 上→淡、下→濃
        const mat = new THREE.MeshBasicMaterial({ color:base.clone(), transparent:true,
          opacity:.92, side:THREE.DoubleSide });
        const m = new THREE.Mesh(hexGeo, mat);
        m.position.copy(p);
        m.quaternion.setFromRotationMatrix(_m4.makeBasis(eTh, ePh, nrm));
        m.scale.setScalar(HEX_S * .88);
        group.add(m);
        hexes.push({ mesh:m, base, flash:0, size:HEX_S*.88 });
      }
    }
  }

  // ═════ ② ネットワーク（球の内部）：3層シェル ═════
  const nnodes = [];
  const addNode = (p) => (nnodes.push({ pos:p, adj:[] }) - 1);
  const edges = [];
  const link = (a,b) => { edges.push([a,b]); nnodes[a].adj.push(b); nnodes[b].adj.push(a); };

  const HUB = addNode(V3(0,0,0));
  const ring1 = [], ring2 = [], ring3 = [];
  for (let k = 0; k < 9; k++){
    ring1.push(addNode(fibDir(k,9).multiplyScalar(rand(8,10))));
    link(HUB, ring1[k]);
  }
  for (let k = 0; k < 22; k++)
    ring2.push(addNode(fibDir(k,22).multiplyScalar(rand(14,17))));
  for (let k = 0; k < 40; k++){
    const d = fibDir(k,40);
    if (d.dot(eyeCenter) > .6) continue;     // 複眼ドームの真下は空けておく
    ring3.push(addNode(d.multiplyScalar(rand(20.5,23.5))));
  }
  const nearest = (idx, arr, k) => [...arr].sort((a,b) =>
    nnodes[a].pos.distanceTo(nnodes[idx].pos) - nnodes[b].pos.distanceTo(nnodes[idx].pos)).slice(0,k);
  ring1.forEach(i => nearest(i, ring2, 3).forEach(j => link(i,j)));
  ring2.forEach(i => nearest(i, ring3, 2).forEach(j => link(i,j)));
  const lace = (arr, maxD, prob) => {        // 同じ殻の近接ノードを横に繋ぐ
    for (let i = 0; i < arr.length; i++)
      for (let j = i+1; j < arr.length; j++)
        if (nnodes[arr[i]].pos.distanceTo(nnodes[arr[j]].pos) < maxD && Math.random() < prob)
          link(arr[i], arr[j]);
  };
  lace(ring2, 10.5, .55); lace(ring3, 10, .4);

  // ハブへ向かう親（パルス経路用 BFS）＋孤立ノードの救済
  const parentOf = new Array(nnodes.length).fill(-1);
  { const q = [HUB], seen = new Set([HUB]);
    while (q.length){ const n = q.shift();
      for (const m of nnodes[n].adj) if (!seen.has(m)){ seen.add(m); parentOf[m] = n; q.push(m); } } }
  for (let i = 1; i < nnodes.length; i++){
    if (parentOf[i] === -1){
      let best = ring1[0], bd = 1e9;
      for (const j of ring1){ const d = nnodes[j].pos.distanceTo(nnodes[i].pos); if (d < bd){ bd = d; best = j; } }
      link(i, best); parentOf[i] = best;
    }
  }

  // 各六角形 → 最寄りの外殻ノード（パルスの入口）
  hexes.forEach(h => {
    let best = ring3[0], bd = 1e9;
    for (const i of ring3.concat(ring2)){
      const d = nnodes[i].pos.distanceTo(h.mesh.position);
      if (d < bd){ bd = d; best = i; }
    }
    h.entry = best;
  });

  // ═════ ③ フラクタル樹（右）：中心から球の縁へ、先端はちょうど球面 ═════
  const trees = [];
  const TREE_R0 = 5.5;   // 根の半径（ハブのすぐ外）
  function buildTree(baseDir, c0, c1){
    const segs = [], tips = [];
    const root = { pos: baseDir.clone().multiplyScalar(TREE_R0), children:[] };
    // 円錐分岐：子は親方向のまわりに方位角で確実に振り分ける（重なって1本に見えない）
    // 半径は毎段「残り距離」の一部だけ進み、最終段でちょうど球面（半径 R）に着く長さを解く
    (function grow(node, dirU, depth){
      if (depth === 0){ tips.push(node.pos); return; }
      const nb = depth === 5 ? 3 : (Math.random() < .35 ? 3 : 2);
      let u = V3(0,1,0).cross(dirU);
      if (u.lengthSq() < 1e-4) u = V3(1,0,0).cross(dirU);
      u.normalize();
      const v = dirU.clone().cross(u);
      const phi0 = rand(0, Math.PI*2);
      for (let i = 0; i < nb; i++){
        const beta = deg(rand(16,30) + (5-depth)*4.5);           // 分岐角：縁ほど大きく開く
        const phi  = phi0 + Math.PI*2*i/nb + rand(-.3,.3);       // 方位角：兄弟で等分
        const d = dirU.clone().multiplyScalar(Math.cos(beta))
          .addScaledVector(u, Math.sin(beta)*Math.cos(phi))
          .addScaledVector(v, Math.sin(beta)*Math.sin(phi))
          .normalize();
        const r = node.pos.length();
        const rT = depth === 1 ? R : Math.min(R - .5, r + (R - r)*rand(.34,.5));
        // |node.pos + d*t| = rT を満たす枝の長さ t
        const pd = node.pos.dot(d);
        const t = -pd + Math.sqrt(Math.max(pd*pd + rT*rT - r*r, .01));
        const child = { pos: node.pos.clone().addScaledVector(d, t), children:[] };
        node.children.push(child);
        segs.push([node.pos, child.pos, depth]);
        grow(child, d, depth-1);
      }
    })(root, baseDir.clone().normalize(), 5);
    const pos = new Float32Array(segs.length*6), col = new Float32Array(segs.length*6);
    segs.forEach(([a,b,depth],k) => {
      pos.set([a.x,a.y,a.z, b.x,b.y,b.z], k*6);
      const ca = c0.clone().lerp(c1, (5-depth)/5), cb = c0.clone().lerp(c1, (6-depth)/5);
      col.set([ca.r,ca.g,ca.b, cb.r,cb.g,cb.b], k*6);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col,3));
    group.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      vertexColors:true, transparent:true, opacity:.95, blending:THREE.AdditiveBlending, depthWrite:false })));
    return { root, tips };
  }
  const treeDefs = [
    { dir:V3(.55, .62, .40),  c0:0x2ea7de, c1:0xbff6ff },  // 右上：明るいシアン
    { dir:V3(.93, -.02, .30), c0:0x1b6fb8, c1:0x9fe0ff },  // 右
    { dir:V3(.55, -.60, .42), c0:0x16437f, c1:0x7fb0f0 },  // 右下：ネイビー
  ];
  treeDefs.forEach(defn => trees.push(
    buildTree(defn.dir.clone().normalize(), new THREE.Color(defn.c0), new THREE.Color(defn.c1))));

  // ── 静的な線：網＋複眼への入口＋ハブから各樹の根へ ──
  {
    const all = edges.map(([a,b]) => [nnodes[a].pos, nnodes[b].pos]);
    hexes.filter((_,i) => i%8 === 0).forEach(h => all.push([h.mesh.position, nnodes[h.entry].pos]));
    trees.forEach(tr => all.push([nnodes[HUB].pos, tr.root.pos]));
    const pos = new Float32Array(all.length*6);
    all.forEach(([a,b],k) => pos.set([a.x,a.y,a.z, b.x,b.y,b.z], k*6));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    group.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({
      color:0x8fd2f5, transparent:true, opacity:.42, blending:THREE.AdditiveBlending, depthWrite:false })));
  }

  // ── ノードの点・樹の先端の点・球面のうっすらした点（球のシルエット）──
  const nodeCloud = makeCloud(nnodes.length);
  nnodes.forEach((n,i) => {
    nodeCloud.pos.set([n.pos.x, n.pos.y, n.pos.z], i*3);
    const c = new THREE.Color(i === HUB ? 0xbfefff : ring1.includes(i) ? 0x7fd2ff : ring2.includes(i) ? 0x5bbcf0 : 0x47a8e2);
    nodeCloud.col.set([c.r,c.g,c.b], i*3);
    nodeCloud.size[i] = i === HUB ? 4.2 : ring1.includes(i) ? 2.6 : ring2.includes(i) ? 2.1 : 1.7;
  });
  group.add(nodeCloud.pts);

  const allTips = trees.flatMap(t => t.tips);
  const tipCloud = makeCloud(allTips.length);
  allTips.forEach((p,i) => {
    tipCloud.pos.set([p.x,p.y,p.z], i*3);
    tipCloud.col.set([.55,.85,1], i*3);
    tipCloud.size[i] = 1.1;
  });
  group.add(tipCloud.pts);

  {
    const dots = [];
    for (let k = 0; k < 240; k++){
      const d = fibDir(k, 240);
      if (d.dot(eyeCenter) > Math.cos(EYE_MAX)) continue;   // 複眼ドームの上には置かない
      dots.push(d.multiplyScalar(R));
    }
    const surfCloud = makeCloud(dots.length);
    dots.forEach((p,i) => {
      surfCloud.pos.set([p.x,p.y,p.z], i*3);
      surfCloud.col.set([.10,.22,.34], i*3);   // ごく淡く
      surfCloud.size[i] = .8;
    });
    group.add(surfCloud.pts);
  }

  // ═════ 光のパルス：複眼で知覚 → 核で分析 → 縁へ伸びる枝の先端で意思決定 ═════
  const MAXP = 8, MAXF = 14;
  const pulseCloud = makeCloud(MAXP);  group.add(pulseCloud.pts);
  const flareCloud = makeCloud(MAXF);  group.add(flareCloud.pts);
  const pulses = [];   // { pts[], cum[], dist, total }
  const flares = [];   // { pos, age }

  function makePulse(){
    const hex = hexes[Math.floor(Math.random()*hexes.length)];
    const pts = [hex.mesh.position.clone()];
    let n = hex.entry;
    while (n !== HUB){ pts.push(nnodes[n].pos.clone()); n = parentOf[n]; }
    pts.push(nnodes[HUB].pos.clone());
    let tn = trees[Math.floor(Math.random()*trees.length)].root;
    pts.push(tn.pos.clone());
    while (tn.children.length){
      tn = tn.children[Math.floor(Math.random()*tn.children.length)];
      pts.push(tn.pos.clone());
    }
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i-1] + pts[i-1].distanceTo(pts[i]));
    hex.flash = 1;
    pulses.push({ pts, cum, dist:0, total:cum[cum.length-1] });
  }
  function pulsePos(p, out){
    const d = p.dist;
    let i = 1; while (i < p.cum.length && p.cum[i] < d) i++;
    if (i >= p.cum.length) return out.copy(p.pts[p.pts.length-1]);
    const t = (d - p.cum[i-1]) / ((p.cum[i] - p.cum[i-1]) || 1);
    return out.copy(p.pts[i-1]).lerp(p.pts[i], t);
  }

  // ── 遠景のダスト ──
  const dGeo = new THREE.BufferGeometry();
  const DN = 140, dPos = new Float32Array(DN*3);
  for (let i = 0; i < DN; i++)
    dPos.set([ (Math.random()-.5)*180, (Math.random()-.5)*120, -20 - Math.random()*140 ], i*3);
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos,3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color:0x6fb8e6, size:.6,
    transparent:true, opacity:.5, sizeAttenuation:true, map:glow, depthWrite:false,
    blending:THREE.AdditiveBlending }));
  scene.add(dust);

  // ── リサイズ ──
  let baseScale = 1;
  function resize(){
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h; camera.updateProjectionMatrix();
    baseScale = Math.min(Math.max(camera.aspect*.95, .55), 1);   // 縦画面では全体を縮小
    const us = h * renderer.getPixelRatio() * .55;
    clouds.forEach(c => c.mat.uniforms.uScale.value = us);
  }
  resize();
  window.addEventListener('resize', resize);

  // ── インタラクション（視差＋ドラッグ回転、離すと自転に復帰）──
  const rot = { x:0, y:0 }, cur = { x:0, y:0 };
  let drag = false, lastX = 0, lastY = 0;
  const pointer = { x:0, y:0 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left)/r.width  - .5)*2;
    pointer.y = ((e.clientY - r.top )/r.height - .5)*2;
    if (drag){
      rot.y += (e.clientX - lastX)*.006;
      rot.x += (e.clientY - lastY)*.006;
      rot.x = Math.max(-.7, Math.min(.7, rot.x));
      lastX = e.clientX; lastY = e.clientY;
    }
  }, { passive:true });
  const startDrag = (e) => {
    if (e.target.closest('a,button')) return;
    drag = true; lastX = e.clientX; lastY = e.clientY; canvas.classList.add('dragging');
  };
  const endDrag = () => { drag = false; canvas.classList.remove('dragging'); };
  hero.addEventListener('pointerdown', startDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // ── 起動：2D を止めて 3D に切替、フェードイン ──
  window.__hero3dActive = true;
  hero.classList.add('has3d');
  canvas.style.transition = 'opacity 1.1s ease';
  canvas.style.opacity = '0';
  requestAnimationFrame(() => { canvas.style.opacity = ''; });

  const clock = new THREE.Clock();
  const _v = new THREE.Vector3();
  let intro = 0, spawnTimer = 1.2, spin = 0;

  function frame(){
    const dt = Math.min(clock.getDelta(), .05);
    const t  = clock.elapsedTime;
    intro = Math.min(1, intro + dt*.45);
    const ei = intro < .5 ? 2*intro*intro : 1 - Math.pow(-2*intro+2, 2)/2;
    group.scale.setScalar((.7 + .3*ei) * baseScale);

    // 複眼のきらめき＋パルス発火のフラッシュ
    for (let i = 0; i < hexes.length; i++){
      const h = hexes[i];
      h.flash = Math.max(0, h.flash - dt*1.8);
      const shimmer = .5 + .5*Math.sin(t*1.3 + i*.9);
      const f = Math.min(1, h.flash + shimmer*.12);
      h.mesh.material.color.copy(h.base).lerp(WHITE, f*.85);
      h.mesh.material.opacity = .72 + .2*ei;
      h.mesh.scale.setScalar(h.size*(1 + .18*h.flash));
    }

    // パルスの生成と移動
    if (intro > .85){
      spawnTimer -= dt;
      if (spawnTimer <= 0 && pulses.length < MAXP){ makePulse(); spawnTimer = rand(.5, 1.3); }
    }
    for (let i = pulses.length-1; i >= 0; i--){
      const p = pulses[i];
      p.dist += dt*24;
      if (p.dist >= p.total){
        if (flares.length < MAXF) flares.push({ pos:p.pts[p.pts.length-1].clone(), age:0 });
        pulses.splice(i, 1);
      }
    }
    for (let i = 0; i < MAXP; i++){
      if (i < pulses.length){
        pulsePos(pulses[i], _v);
        pulseCloud.pos.set([_v.x,_v.y,_v.z], i*3);
        pulseCloud.col.set([.9,.98,1], i*3);
        pulseCloud.size[i] = 3.1;
      } else pulseCloud.size[i] = 0;
    }
    pulseCloud.geo.attributes.position.needsUpdate = true;
    pulseCloud.geo.attributes.color.needsUpdate = true;
    pulseCloud.geo.attributes.psize.needsUpdate = true;

    // 着弾フレア（球の縁で意思決定の光が咲く）
    for (let i = flares.length-1; i >= 0; i--){ flares[i].age += dt; if (flares[i].age > .8) flares.splice(i,1); }
    for (let i = 0; i < MAXF; i++){
      if (i < flares.length){
        const f = flares[i], k = Math.sin(Math.PI*Math.min(f.age/.8, 1));
        flareCloud.pos.set([f.pos.x,f.pos.y,f.pos.z], i*3);
        flareCloud.col.set([.75,.95,1], i*3);
        flareCloud.size[i] = 5.5*k;
      } else flareCloud.size[i] = 0;
    }
    flareCloud.geo.attributes.position.needsUpdate = true;
    flareCloud.geo.attributes.color.needsUpdate = true;
    flareCloud.geo.attributes.psize.needsUpdate = true;

    // 回転：ゆっくり自転＋わずかな首振り＋マウス視差＋ドラッグ
    spin += dt*.05;                                  // 約2分で1周
    if (!drag){ rot.x += -rot.x*dt*.5; rot.y += -rot.y*dt*.5; }
    const swayX = Math.sin(t*.09 + 1.7)*.07;
    cur.x += (rot.x + swayX + pointer.y*.14 - cur.x)*.06;
    cur.y += (rot.y + pointer.x*.22 - cur.y)*.06;
    group.rotation.x = cur.x + .06;
    group.rotation.y = cur.y + spin;
    dust.rotation.y  = cur.y*.3;

    renderer.render(scene, camera);
    if (!reduce) requestAnimationFrame(frame);
  }

  if (reduce){
    // 動きを抑える設定：静止画で1回だけ描画（パルスなし）
    intro = 1;
    group.scale.setScalar(baseScale);
    renderer.render(scene, camera);
  } else {
    // rAF はタブ非表示中は自動停止・復帰するため追加制御は不要
    requestAnimationFrame(frame);
  }
})();
