/* Odonata コーポレートサイト 共通スクリプト */
(function () {
  // 年号
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // モバイルナビ（ハンバーガー → 全画面メニュー）
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // サービスDropdown：hover（CSS）／click／キーボードフォーカス（CSS :focus-within）の3経路
  const navItems = [...document.querySelectorAll('.nav-item')];
  navItems.forEach(item => {
    const btn = item.querySelector('.nav-item-btn');
    if (!btn) return;
    const setOpen = (open) => {
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !item.classList.contains('open');
      navItems.forEach(o => { if (o !== item) o.classList.remove('open'); });
      setOpen(willOpen);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); setOpen(true);
        item.querySelector('.sub-menu a')?.focus();
      } else if (e.key === 'Escape') { setOpen(false); }
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { setOpen(false); btn.focus(); }
    });
    item.addEventListener('focusout', () => {
      // フォーカスがドロップダウン外へ出たら閉じる（SPのアコーディオンは維持）
      setTimeout(() => {
        if (!item.contains(document.activeElement) && !navLinks?.classList.contains('open')) setOpen(false);
      }, 0);
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) navItems.forEach(o => {
      o.classList.remove('open');
      o.querySelector('.nav-item-btn')?.setAttribute('aria-expanded', 'false');
    });
  });

  // 現在ページのナビをハイライト（Active状態）
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(a => {
    const href = a.getAttribute('href').split('#')[0];
    const isCta = a.classList.contains('nav-cta') || a.classList.contains('nav-cta2') || a.classList.contains('nav-login');
    if (href && href === path && !isCta) {
      a.classList.add('active');
      const item = a.closest('.nav-item');
      if (item) item.classList.add('active');
    }
  });

  // スクロールで各要素をフェードアップ表示
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('in'));
  } else if (targets.length) {
    const counts = new Map();
    targets.forEach(el => {
      const p = el.parentElement;
      const i = counts.get(p) || 0;
      counts.set(p, i + 1);
      el.style.transitionDelay = Math.min(i * 0.07, 0.35) + 's';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(el => io.observe(el));
  }

  // 下層ヒーローの控えめなネットワーク背景
  const canvas = document.getElementById('pheroNet');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
      const count = Math.min(60, Math.max(28, Math.round(canvas.offsetWidth / 22)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .22 * devicePixelRatio,
        vy: (Math.random() - .5) * .22 * devicePixelRatio,
        r: (Math.random() * 1.8 + 1) * devicePixelRatio
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const maxD = 140 * devicePixelRatio;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]; a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(160,220,255,${(1 - d / maxD) * .4})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(200,235,255,.9)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', () => { resize(); });
  }
})();
