/* Hero cinematográfico — feed vivo + contador + tilt 3D + intro GSAP (com fallback CSS).
   Config por página em window.__HERO__ = { convos:[{nome,msg,resp}], startCount, countLabel } */
(function () {
  var CFG = window.__HERO__ || {};
  var CONVOS = CFG.convos && CFG.convos.length ? CFG.convos : [
    { nome: 'Carla', msg: 'Oi, ainda dá pra falar com vocês?', resp: 'Dá sim, Carla! 😊 Como posso te ajudar agora?' }
  ];

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var feed = document.querySelector('.chx-feed');
    var countEl = document.querySelector('.chx-count');
    var phone = document.querySelector('.chx-iphone');

    /* ---- feed de chat vivo ---- */
    if (feed) {
      var i = 0, count = CFG.startCount != null ? CFG.startCount : 127;
      if (countEl) countEl.textContent = String(count);
      var timers = [];
      function add(html) {
        var d = document.createElement('div'); d.innerHTML = html.trim();
        var el = d.firstElementChild; feed.appendChild(el);
        while (feed.children.length > 6) feed.removeChild(feed.firstElementChild);
        return el;
      }
      function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
      function step() {
        var c = CONVOS[i % CONVOS.length]; i++;
        add('<div class="chx-in"><div class="chx-cname">' + esc(c.nome) + '</div><div>' + esc(c.msg) + '</div></div>');
        count += Math.floor(Math.random() * 3) + 1; if (countEl) countEl.textContent = String(count);
        timers.push(setTimeout(function () {
          var t = add('<div class="chx-typing"><i></i><i></i><i></i></div>');
          timers.push(setTimeout(function () { if (t) t.remove(); add('<div class="chx-out"><div>' + esc(c.resp) + '</div></div>'); }, 1000));
        }, 700));
      }
      step();
      setInterval(step, 2800);
    }

    /* ---- tilt 3D seguindo o mouse ---- */
    if (phone && window.matchMedia('(pointer:fine)').matches) {
      var raf = 0;
      window.addEventListener('mousemove', function (e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var x = (e.clientX / window.innerWidth - 0.5) * 2, y = (e.clientY / window.innerHeight - 0.5) * 2;
          phone.style.transform = 'translateZ(34px) rotateY(' + (x * 20) + 'deg) rotateX(' + (-y * 15) + 'deg)';
        });
      });
    }

    /* ---- intro cinematográfica (GSAP) com fallback ---- */
    var els = '.chx-eyebrow,.chx-logo,.chx-title,.chx-lead,.chx-cta,.chx-phonewrap,.chx-badge,.chx-vermais';
    if (window.gsap) {
      try {
        var g = window.gsap;
        g.set('.chx-eyebrow', { autoAlpha: 0, y: 20 });
        g.set('.chx-logo', { autoAlpha: 0, y: 30, filter: 'blur(10px)' });
        g.set(['.chx-title', '.chx-lead', '.chx-cta'], { autoAlpha: 0, y: 24 });
        g.set('.chx-phonewrap', { autoAlpha: 0, y: 60, scale: 0.88 });
        g.set('.chx-badge', { autoAlpha: 0, scale: 0.7, y: 30 });
        g.set('.chx-vermais', { autoAlpha: 0, y: 16 });
        g.timeline({ delay: 0.15 })
          .to('.chx-eyebrow', { duration: 0.7, autoAlpha: 1, y: 0, ease: 'power3.out' })
          .to('.chx-logo', { duration: 1.0, autoAlpha: 1, y: 0, filter: 'blur(0px)', ease: 'expo.out' }, '-=0.35')
          .to('.chx-phonewrap', { duration: 1.2, autoAlpha: 1, y: 0, scale: 1, ease: 'expo.out' }, '-=0.7')
          .to('.chx-title', { duration: 0.7, autoAlpha: 1, y: 0, ease: 'power3.out' }, '-=0.85')
          .to('.chx-lead', { duration: 0.6, autoAlpha: 1, y: 0, ease: 'power3.out' }, '-=0.55')
          .to('.chx-cta', { duration: 0.6, autoAlpha: 1, y: 0, ease: 'power3.out' }, '-=0.45')
          .to('.chx-badge', { duration: 0.9, autoAlpha: 1, scale: 1, y: 0, stagger: 0.18, ease: 'back.out(1.5)' }, '-=0.6')
          .to('.chx-vermais', { duration: 0.6, autoAlpha: 1, y: 0, ease: 'power3.out' }, '-=0.3');
      } catch (e) { revealNow(); }
    } else { revealNow(); }
    function revealNow() {
      document.querySelectorAll(els).forEach(function (el) {
        el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'none'; el.style.filter = 'none';
      });
    }

    /* ---- reveal on scroll para o resto da página ---- */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.style.animationPlayState = 'running'; io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  });
})();
