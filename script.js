document.addEventListener('DOMContentLoaded', () => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const WA = '201270361341';

  /* ---------- Header + progress + back to top ---------- */
  const header = $('#siteHeader');
  const toTop  = $('#toTop');
  const bar    = $('#readProgress');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
    toTop.classList.toggle('show', window.scrollY > 600);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open');
    menu.classList.remove('open');
  }));

  /* ---------- Active link on scroll (home) ---------- */
  const navLinks = $$('a[data-sec]', menu);
  if (navLinks.length) {
    const secs = $$('section[id]');
    window.addEventListener('scroll', () => {
      let activeId = 'home';
      secs.forEach(s => {
        if (window.scrollY >= s.offsetTop - 220 && navLinks.some(l => l.dataset.sec === s.id)) activeId = s.id;
      });
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.sec === activeId));
    }, { passive: true });
  }

  /* ============================================================
     DETAILS PAGE: show the article chosen by ?id=
     ============================================================ */
  const wrap = $('#artWrap');
  if (wrap) {
    const arts = $$('.art', wrap);
    let id = parseInt(new URLSearchParams(location.search).get('id'), 10);
    if (!id || id < 1 || id > arts.length) id = 1;
    const cur = arts[id - 1];
    cur.hidden = false;

    $('#dTitle').textContent = cur.dataset.title;
    $('#dTag').textContent   = cur.dataset.tag;
    $('#dTime').textContent  = cur.dataset.time;
    $('#dIcon').textContent  = cur.dataset.icon;
    document.title = cur.dataset.title + ' | أكاديمية تحفيظ قرآن أونلاين';

    // مقالات أخرى
    const related = $('#related');
    arts.forEach((a, i) => {
      if (i === id - 1) return;
      const li = document.createElement('li');
      li.innerHTML = `<a href="details.html?id=${i + 1}"><span>${a.dataset.icon}</span>${a.dataset.title}</a>`;
      related.appendChild(li);
    });

    // السابق / التالي
    const prev = (id - 2 + arts.length) % arts.length;
    const next = id % arts.length;
    $('#prevNext').innerHTML =
      `<a href="details.html?id=${prev + 1}"><small>→ المقال السابق</small><b>${arts[prev].dataset.title}</b></a>` +
      `<a class="nx" href="details.html?id=${next + 1}"><small>المقال التالي ←</small><b>${arts[next].dataset.title}</b></a>`;

    // مشاركة
    $('#shareWa').href = 'https://wa.me/?text=' + encodeURIComponent(cur.dataset.title + '\n' + location.href);
    $('#copyBtn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href); }
      catch (_) {
        const t = document.createElement('textarea');
        t.value = location.href; document.body.appendChild(t); t.select();
        document.execCommand('copy'); t.remove();
      }
      const old = btn.textContent;
      btn.textContent = '✔ تم النسخ';
      setTimeout(() => btn.textContent = old, 1800);
    });

    // أنيميشن ظهور عناصر المقال
    [...cur.children].forEach(el => el.classList.add('reveal'));
    $$('.pn a, .tl-card, .names-grid > div, .fatiha-grid > div', wrap).forEach(el => el.classList.add('reveal'));
  }

  /* ---------- Reveal on scroll + rings + counters ---------- */
  const countTo = (el) => {
    const target = +el.dataset.target;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / 2200, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + '%';
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('show');
      $$('.pnum', el).forEach(countTo);
      $$('.rf', el).forEach(c => c.style.strokeDashoffset = 327 * (1 - c.dataset.p / 100));
      io.unobserve(el);
    });
  }, { threshold: 0.12 });
  $$('.reveal, .reveal-l, .reveal-r, .reveal-z').forEach((el, i) => {
    el.style.transitionDelay = (i % 3) * 0.1 + 's';
    io.observe(el);
  });

  /* ---------- Hero spotlight (follows mouse) ---------- */
  const hero = $('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- 3D tilt on cards ---------- */
  if (window.matchMedia('(min-width:1025px) and (hover:hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform .1s';
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s';
        card.style.transform = '';
      });
    });
  }

  /* ---------- VMG tabs (الرؤية / الرسالة / الأهداف) ---------- */
  const vtabs = $$('.vtab');
  if (vtabs.length) {
    let vi = 0, vTimer;
    const showV = (n) => {
      vtabs.forEach((t, i) => t.classList.toggle('active', i === n));
      $$('.vpanel').forEach((p, i) => p.classList.toggle('active', i === n));
      vi = n;
    };
    const auto = () => { clearInterval(vTimer); vTimer = setInterval(() => showV((vi + 1) % vtabs.length), 7000); };
    vtabs.forEach((t, i) => t.addEventListener('click', () => { showV(i); auto(); }));
    auto();
  }

  /* ---------- Modal ---------- */
  const modal = $('#modal');
  const mPhone = $('#mPhone');
  const mName = $('#mName');
  const mErr = $('#mErr');
  const openModal = (track) => {
    $('#modalTrack').textContent = track || 'حجز عام';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(() => mPhone.focus(), 400);
  };
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
  };
  $$('[data-open-modal]').forEach(b => b.addEventListener('click', () => openModal(b.dataset.track)));
  $('#modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  $('#modalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = mPhone.value.replace(/[\s-]/g, '');
    const ok = /^\+?\d{9,15}$/.test(phone);
    mPhone.classList.toggle('bad', !ok);
    mErr.classList.toggle('show', !ok);
    if (!ok) return;
    const name = mName.value.trim();
    const track = $('#modalTrack').textContent;
    const text =
`السلام عليكم ورحمة الله،
أرغب في التسجيل في أكاديمية تحفيظ قرآن أونلاين.
${name ? 'الاسم: ' + name + '\n' : ''}رقم موبايلي: ${mPhone.value.trim()}
المسار: ${track}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank');
    e.target.reset();
    closeModal();
  });
  mPhone.addEventListener('input', () => {
    mPhone.classList.remove('bad');
    mErr.classList.remove('show');
  });

  /* ---------- Footer year ---------- */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
});