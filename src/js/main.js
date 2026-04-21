/* main.js — menu mobile, botão WhatsApp flutuante, nav ativa */

const WA_NUMBER = '559288166201';
const WA_DEFAULT_MSG = encodeURIComponent('Olá! Gostaria de mais informações sobre os produtos da DL Descartáveis.');

/* ── WhatsApp flutuante ───────────────────────────────────── */
function createWAFloat() {
  const btn = document.createElement('a');
  btn.className = 'btn-wa-float';
  btn.href = `https://wa.me/${WA_NUMBER}?text=${WA_DEFAULT_MSG}`;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', 'Falar pelo WhatsApp');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
               -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
               -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
               -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
               .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
               -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
               -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
               -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
               .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
               .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
               .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.518 5.834L.057 23.5
               l5.826-1.527A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z
               m0 21.818a9.818 9.818 0 01-5.007-1.37l-.36-.213-3.716.975.99-3.618
               -.234-.37A9.818 9.818 0 1112 21.818z"/>
    </svg>`;
  document.body.appendChild(btn);
}

/* ── Menu mobile ─────────────────────────────────────────── */
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav    = document.querySelector('.nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Fechar ao clicar em link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── Marcar link ativo na nav ────────────────────────────── */
function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createWAFloat();
  initMenu();
  markActiveNav();
});
