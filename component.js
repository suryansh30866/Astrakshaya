/* ============================================================
   ASTRAKSHAYA — component.js
   Place this file at root: ASTRAKSHAYA_V2/component.js
   ============================================================ */

(function () {
  'use strict';

  const NAVBAR_PATH = 'components/navbar/navbar.html';
  const FOOTER_PATH = 'components/footer/footer.html';

  async function loadComponent(placeholderId, htmlPath, onLoaded) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) return;

    try {
      const res = await fetch(htmlPath);
      if (!res.ok) throw new Error(`Failed to load ${htmlPath} (${res.status})`);
      const html = await res.text();
      placeholder.outerHTML = html;
      if (typeof onLoaded === 'function') onLoaded();
    } catch (err) {
      console.warn(`[component.js] ${err.message}`);
    }
  }

  function initNavbar() {
    const navbar       = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenu   = document.getElementById('mobileMenu');
    const overlay      = document.getElementById('dropOverlay');
    const dropTriggers = document.querySelectorAll('.navbar__item--drop');
    const mobileGroups = document.querySelectorAll('.mobile-group__btn');

    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });

    let activeKey  = null;
    let closeTimer = null;

    function getPanel(key) { return document.getElementById('drop-' + key); }

    function openDrop(key) {
      clearTimeout(closeTimer);
      if (activeKey && activeKey !== key) closeDrop(activeKey, true);
      const trigger = document.querySelector(`[data-drop="${key}"] .navbar__trigger`);
      const panel   = getPanel(key);
      const item    = document.querySelector(`[data-drop="${key}"]`);
      if (!panel) return;
      item.classList.add('is-open');
      panel.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      if (overlay) overlay.classList.add('is-visible');
      activeKey = key;
    }

    function closeDrop(key, immediate) {
      const run = () => {
        const trigger = document.querySelector(`[data-drop="${key}"] .navbar__trigger`);
        const panel   = getPanel(key);
        const item    = document.querySelector(`[data-drop="${key}"]`);
        if (!panel) return;
        item.classList.remove('is-open');
        panel.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        if (overlay) overlay.classList.remove('is-visible');
        if (activeKey === key) activeKey = null;
      };
      immediate ? run() : (closeTimer = setTimeout(run, 80));
    }

    dropTriggers.forEach((item) => {
      const key     = item.dataset.drop;
      const trigger = item.querySelector('.navbar__trigger');
      const panel   = getPanel(key);
      item.addEventListener('mouseenter', () => openDrop(key));
      item.addEventListener('mouseleave', () => closeDrop(key));
      if (panel) {
        panel.addEventListener('mouseenter', () => { clearTimeout(closeTimer); openDrop(key); });
        panel.addEventListener('mouseleave', () => closeDrop(key));
      }
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          activeKey === key ? closeDrop(key, true) : openDrop(key);
        });
      }
      item.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrop(key, true); });
    });

    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && activeKey) closeDrop(activeKey, true);
    });

    let mobileOpen = false;
    function setMobile(open) {
      mobileOpen = open;
      hamburgerBtn.classList.toggle('is-open', open);
      hamburgerBtn.setAttribute('aria-expanded', String(open));
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => setMobile(!mobileOpen));
    document.addEventListener('click', (e) => {
      if (mobileOpen && !navbar.contains(e.target)) setMobile(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && mobileOpen) setMobile(false);
    });

    mobileGroups.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub      = btn.nextElementSibling;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        mobileGroups.forEach((b) => {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const s = b.nextElementSibling;
            if (s) s.classList.remove('is-open');
          }
        });
        btn.setAttribute('aria-expanded', String(!expanded));
        if (sub) sub.classList.toggle('is-open', !expanded);
      });
    });
  }

  function initFooter() {
    const yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  async function boot() {
    await loadComponent('navbar-placeholder', NAVBAR_PATH, initNavbar);
    await loadComponent('footer-placeholder', FOOTER_PATH, initFooter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();