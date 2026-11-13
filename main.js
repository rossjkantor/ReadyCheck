(function () {
  'use strict';

  var root = document.querySelector('[data-rc-root]');
  if (!root) return;
  root.classList.add('rc-js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  /* Statement: split into words that fade in with scroll */
  var statement = root.querySelector('[data-statement]');
  var statementP = statement && statement.querySelector('p');
  var wordCount = 0;
  if (statementP) {
    var highlight = (statementP.getAttribute('data-words') || '').split(' ');
    var words = statementP.textContent.trim().split(/\s+/);
    wordCount = words.length;
    statementP.textContent = '';
    words.forEach(function (t, i) {
      var span = document.createElement('span');
      span.className = 'w' + (highlight.indexOf(t.replace(/[^A-Za-z]/g, '')) !== -1 ? ' w--hl' : '');
      span.style.setProperty('--i', i);
      span.textContent = t + ' ';
      statementP.appendChild(span);
    });
  }

  /* Count-up for stats */
  var counters = root.querySelectorAll('[data-count]');
  counters.forEach(function (el) { el.textContent = '0.0'; });
  function countUp() {
    if (reduceMotion) {
      counters.forEach(function (el) { el.textContent = Number(el.getAttribute('data-count')).toFixed(1); });
      return;
    }
    var t0 = 0;
    function frame(now) {
      if (!t0) t0 = now;
      var k = Math.min(1, (now - t0) / 1800);
      var e = 1 - Math.pow(1 - k, 3);
      counters.forEach(function (el) { el.textContent = (Number(el.getAttribute('data-count')) * e).toFixed(1); });
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Scroll reveals */
  var revealEls = root.querySelectorAll('[data-rv]');
  function reveal(el) {
    el.classList.add('rc-in');
    if (el.hasAttribute('data-countup')) countUp();
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(reveal);
  }

  /* Scroll-driven effects */
  var nav = root.querySelector('[data-nav]');
  var hero = root.querySelector('[data-hero]');
  var gallery = root.querySelector('[data-gallery]');
  var track = root.querySelector('[data-track]');
  var steps = root.querySelectorAll('[data-step]');
  var slides = root.querySelectorAll('[data-slide]');
  var progress = root.querySelectorAll('.how__progress span');
  var activeStep = -1;
  var raf = 0;

  function setStep(n) {
    if (n === activeStep) return;
    activeStep = n;
    steps.forEach(function (s, i) { s.classList.toggle('is-active', i === n); });
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === n);
      s.classList.toggle('is-before', i < n);
    });
    progress.forEach(function (p, i) { p.classList.toggle('is-on', i <= n); });
  }

  function tick() {
    raf = 0;
    var vh = window.innerHeight || 800;
    if (nav) nav.classList.toggle('is-scrolled', root.getBoundingClientRect().top < -40);

    if (hero) {
      var hr = hero.getBoundingClientRect();
      root.style.setProperty('--hero', clamp(-hr.top / Math.max(1, hr.height)).toFixed(4));
    }
    if (statement) {
      var sr = statement.getBoundingClientRect();
      var p2 = clamp((vh * 0.8 - sr.top) / (sr.height * 0.9 + vh * 0.2));
      root.style.setProperty('--st', (p2 * (wordCount + 2)).toFixed(2));
    }
    if (gallery && track) {
      var gr = gallery.getBoundingClientRect();
      var stickyH = gallery.firstElementChild.offsetHeight;
      var p3 = clamp((72 - gr.top) / Math.max(1, gr.height - stickyH));
      var max = Math.max(0, track.scrollWidth - track.parentNode.clientWidth);
      root.style.setProperty('--galx', (-p3 * max).toFixed(1) + 'px');
      root.style.setProperty('--galp', p3.toFixed(4));
    }
    var active = 0;
    steps.forEach(function (s, i) { if (s.getBoundingClientRect().top < vh * 0.55) active = i; });
    setStep(active);
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();

  /* Demo: day picker and items */
  var ROUTINE = {
    Mon: ['Backpack', 'Laptop', 'Charger'],
    Tue: ['Backpack', 'Laptop', 'Charger', 'Basketball bag'],
    Wed: ['Backpack', 'Laptop'],
    Thu: ['Backpack', 'Laptop', 'Charger', 'Basketball bag'],
    Fri: ['Backpack', 'Laptop']
  };
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  var DAY_NAMES = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };
  var ICON_CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_X = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>';
  var ICON_CHECK_LG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var ICON_ALERT = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v10"/><path d="M12 19v.01"/></svg>';

  var demo = { day: 'Tue', left: { 'Tue|Basketball bag': true } };
  var daysEl = root.querySelector('[data-days]');
  var itemsEl = root.querySelector('[data-items]');
  var dayNameEl = root.querySelector('[data-dayname]');
  var statusEl = root.querySelector('[data-status]');

  function restartAnim(el) { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }

  function renderDemo(animateList) {
    if (!itemsEl) return;
    var day = demo.day;
    daysEl.style.setProperty('--day', DAYS.indexOf(day));
    daysEl.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-day') === day ? 'true' : 'false');
    });

    if (animateList) itemsEl.textContent = '';
    var missing = [];
    ROUTINE[day].forEach(function (name, i) {
      var gone = !!demo.left[day + '|' + name];
      if (gone) missing.push(name.toLowerCase());
      var btn = itemsEl.children[i];
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'item';
        btn.style.animationDelay = (i * 70) + 'ms';
        btn.addEventListener('click', function () {
          var k = demo.day + '|' + name;
          demo.left[k] = !demo.left[k];
          renderDemo(false);
        });
        itemsEl.appendChild(btn);
      }
      btn.classList.toggle('is-gone', gone);
      btn.setAttribute('aria-label', (gone ? 'Bring back ' : 'Leave behind ') + name);
      btn.innerHTML = '<span class="icon-dot' + (gone ? ' icon-dot--warn' : '') + '">' + (gone ? ICON_X : ICON_CHECK) + '</span>' +
        '<span class="item__name"></span><span class="item__status">' + (gone ? 'Left behind' : 'Detected') + '</span>';
      btn.querySelector('.item__name').textContent = name;
    });

    var wasWarn = statusEl.classList.contains('is-warn');
    var isWarn = missing.length > 0;
    dayNameEl.textContent = DAY_NAMES[day];
    statusEl.classList.toggle('is-warn', isWarn);
    if (isWarn) {
      var text = missing.length === 1
        ? 'Your ' + missing[0] + ' is not detected. You usually bring it on ' + DAY_NAMES[day] + 's.'
        : missing.length + ' items are not detected: ' + missing.join(', ') + '.';
      statusEl.innerHTML = '<span class="icon-dot icon-dot--warn">' + ICON_ALERT + '</span><strong>Hold on.</strong><span></span>';
      statusEl.lastChild.textContent = text;
    } else {
      statusEl.innerHTML = '<span class="icon-dot">' + ICON_CHECK_LG + '</span><strong>You\'re all set.</strong><span></span>';
      statusEl.lastChild.textContent = 'Everything you usually bring on ' + DAY_NAMES[day] + ' is with you.';
    }
    if (animateList) restartAnim(dayNameEl);
    if (animateList || wasWarn !== isWarn) restartAnim(statusEl);
  }

  if (daysEl) {
    daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-day]');
      if (!b || b.getAttribute('data-day') === demo.day) return;
      demo.day = b.getAttribute('data-day');
      renderDemo(true);
    });
    renderDemo(true);
  }

  /* Starter Kit tabs */
  var TABS = [
    ['1 ReadyCheck door sensor', 'A set of wireless tags', 'Access to the ReadyCheck app'],
    ['Place the sensor near your main exit', 'Attach tags to the things you carry', 'Connect to the app and add your items'],
    ['Add or remove belongings', 'Customize routines and reminders', 'Override a reminder when plans change']
  ];
  var tabsEl = root.querySelector('[data-tabs]');
  var panelEl = root.querySelector('[data-tabpanel]');
  if (tabsEl && panelEl) {
    var tabBtns = Array.prototype.slice.call(tabsEl.querySelectorAll('[role="tab"]'));
    var selectTab = function (idx, focus) {
      tabsEl.style.setProperty('--tab', idx);
      tabBtns.forEach(function (b, i) {
        b.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        b.tabIndex = i === idx ? 0 : -1;
      });
      if (focus) tabBtns[idx].focus();
      panelEl.setAttribute('aria-labelledby', tabBtns[idx].id);
      panelEl.textContent = '';
      TABS[idx].forEach(function (t, i) {
        var li = document.createElement('li');
        li.style.animationDelay = (i * 80) + 'ms';
        var n = document.createElement('span');
        n.textContent = String(i + 1);
        li.appendChild(n);
        li.appendChild(document.createTextNode(t));
        panelEl.appendChild(li);
      });
    };
    tabBtns.forEach(function (b, i) {
      b.addEventListener('click', function () { if (b.getAttribute('aria-selected') !== 'true') selectTab(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') selectTab((i + 1) % tabBtns.length, true);
        else if (e.key === 'ArrowLeft') selectTab((i - 1 + tabBtns.length) % tabBtns.length, true);
      });
    });
  }

  /* FAQ accordion: one open at a time */
  var faq = root.querySelector('[data-faq]');
  if (faq) {
    var faqItems = faq.querySelectorAll('.faq__item');
    faqItems.forEach(function (item) {
      var btn = item.querySelector('button');
      btn.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        faqItems.forEach(function (other) {
          other.classList.remove('is-open');
          other.querySelector('button').setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* Waitlist: no backend yet, so keep the page from reloading */
  var waitlist = root.querySelector('[data-waitlist]');
  if (waitlist && !waitlist.getAttribute('action')) {
    waitlist.addEventListener('submit', function (e) { e.preventDefault(); });
  }
})();
