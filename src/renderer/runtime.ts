/**
 * The portfolio runtime.
 *
 * Plain ES5-compatible JavaScript as a string, because it has to run in three
 * places with no build step: injected into the builder's preview iframe, inlined
 * into the standalone HTML export, and on the published page. Keeping it here as
 * one source means the preview behaves exactly like the exported file.
 *
 * Every feature degrades to "nothing happens" if its markup is absent.
 */
export const RUNTIME_JS = String.raw`
(function () {
  var root = document.querySelector('.pf-root');
  if (!root) return;

  /* ── Tabs (tabbed template) ────────────────────────────────────── */
  function showPanel(anchor) {
    var panels = root.querySelectorAll('[data-pf-panel]');
    for (var i = 0; i < panels.length; i++) {
      var match = panels[i].getAttribute('data-pf-panel') === anchor;
      panels[i].hidden = !match;
    }
    var tabs = root.querySelectorAll('[data-pf-tab]');
    for (var j = 0; j < tabs.length; j++) {
      var on = tabs[j].getAttribute('data-pf-tab') === anchor;
      tabs[j].setAttribute('data-active', on ? 'true' : 'false');
      tabs[j].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    reveal();
  }

  root.addEventListener('click', function (event) {
    var tab = event.target.closest ? event.target.closest('[data-pf-tab]') : null;
    if (tab) {
      event.preventDefault();
      showPanel(tab.getAttribute('data-pf-tab'));
      return;
    }

    /* ── FAQ accordion ───────────────────────────────────────────── */
    var question = event.target.closest ? event.target.closest('.pf-faq-q') : null;
    if (question) {
      var item = question.closest('[data-pf-faq]');
      if (item) {
        var open = item.getAttribute('data-open') === 'true';
        item.setAttribute('data-open', open ? 'false' : 'true');
        question.setAttribute('aria-expanded', open ? 'false' : 'true');
      }
      return;
    }

    /* ── Mobile navigation ───────────────────────────────────────── */
    var toggle = event.target.closest ? event.target.closest('[data-pf-navtoggle]') : null;
    if (toggle) {
      var links = root.querySelector('[data-pf-navlinks]');
      if (links) {
        var isOpen = links.getAttribute('data-open') === 'true';
        links.setAttribute('data-open', isOpen ? 'false' : 'true');
      }
      return;
    }

    /* ── Colour scheme toggle ────────────────────────────────────── */
    var themeBtn = event.target.closest ? event.target.closest('[data-pf-themetoggle]') : null;
    if (themeBtn) {
      var alt = root.getAttribute('data-pf-scheme') === 'alt';
      root.setAttribute('data-pf-scheme', alt ? '' : 'alt');
      try { localStorage.setItem('pf-scheme', alt ? '' : 'alt'); } catch (e) {}
      return;
    }

    /* ── In-page links: switch tab, or smooth scroll ─────────────── */
    var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (link) {
      var id = link.getAttribute('href').slice(1);
      if (!id) return;
      if (root.querySelector('[data-pf-panel="' + id + '"]')) {
        event.preventDefault();
        showPanel(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      var target = document.getElementById(id);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var openLinks = root.querySelector('[data-pf-navlinks][data-open="true"]');
        if (openLinks) openLinks.setAttribute('data-open', 'false');
      }
    }
  });

  try {
    if (localStorage.getItem('pf-scheme') === 'alt') root.setAttribute('data-pf-scheme', 'alt');
  } catch (e) {}

  /* ── Reveal on scroll ──────────────────────────────────────────── */
  var revealed = typeof IntersectionObserver === 'undefined';
  var observer = revealed
    ? null
    : new IntersectionObserver(
        function (entries) {
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
              entries[i].target.classList.add('pf-in');
              observer.unobserve(entries[i].target);
            }
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      );

  function reveal() {
    var nodes = root.querySelectorAll('.pf-reveal:not(.pf-in)');
    for (var i = 0; i < nodes.length; i++) {
      // Elements inside a hidden tab panel have no box; show them on tab switch.
      if (!observer || nodes[i].offsetParent === null) {
        nodes[i].classList.add('pf-in');
      } else {
        observer.observe(nodes[i]);
      }
    }
  }

  /* ── Animated statistics ───────────────────────────────────────── */
  function countUp() {
    var nodes = root.querySelectorAll('[data-countup="true"]');
    for (var i = 0; i < nodes.length; i++) {
      (function (node) {
        if (node.getAttribute('data-counted') === 'true') return;
        var raw = (node.textContent || '').trim();
        var match = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
        if (!match) return;
        node.setAttribute('data-counted', 'true');
        var prefix = match[1];
        var target = parseFloat(match[2]);
        var suffix = match[3];
        var decimals = (match[2].split('.')[1] || '').length;
        var started = false;

        function run() {
          if (started) return;
          started = true;
          var start = 0;
          var t0 = performance.now();
          function step(now) {
            var p = Math.min(1, (now - t0) / 1100);
            var eased = 1 - Math.pow(1 - p, 3);
            var value = start + (target - start) * eased;
            node.textContent = prefix + value.toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }

        if (typeof IntersectionObserver === 'undefined') {
          run();
        } else {
          var io = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
              run();
              io.disconnect();
            }
          }, { threshold: 0.4 });
          io.observe(node);
        }
      })(nodes[i]);
    }
  }

  /* ── Scroll spy for the active nav item ────────────────────────── */
  function spy() {
    var sections = root.querySelectorAll('[data-pf-section]');
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return;
    var spyObserver = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          var anchor = entries[i].target.getAttribute('data-pf-section');
          var links = root.querySelectorAll('[data-pf-navlink]');
          for (var j = 0; j < links.length; j++) {
            links[j].setAttribute(
              'data-active',
              links[j].getAttribute('data-pf-navlink') === anchor ? 'true' : 'false'
            );
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    for (var k = 0; k < sections.length; k++) spyObserver.observe(sections[k]);
  }

  /* ── Contact form fallback ─────────────────────────────────────── */
  var form = root.querySelector('[data-pf-form]');
  if (form && form.getAttribute('action').indexOf('mailto:') === 0) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var to = form.getAttribute('action').slice(7);
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var email = (form.querySelector('[name="email"]') || {}).value || '';
      var message = (form.querySelector('[name="message"]') || {}).value || '';
      var subject = encodeURIComponent('Portfolio enquiry from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
    });
  }

  reveal();
  countUp();
  spy();
})();
`;
