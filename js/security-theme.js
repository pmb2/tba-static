(() => {
  function injectSecurityButton() {
    const nav =
      document.querySelector('header nav') ||
      document.querySelector('nav .menu') ||
      document.querySelector('nav ul') ||
      document.querySelector('.nav') ||
      document.querySelector('.topnav') ||
      document.querySelector('nav');

    if (!nav || document.getElementById('btn-security-services')) return;

    const isUL = nav.tagName.toLowerCase() === 'ul';
    const wrapper = document.createElement(isUL ? 'li' : 'div');
    const a = document.createElement('a');
    a.id = 'btn-security-services';
    a.href = '/security-services/';
    a.textContent = 'Security Services';

    // Minimal styling that won't fight your site styles
    a.style.padding = '8px 12px';
    a.style.borderRadius = '8px';
    a.style.border = '1px solid var(--border-color, #444)';
    a.style.background = 'var(--btn-bg, #111)';
    a.style.color = 'var(--btn-fg, #eee)';
    a.style.transition = 'background 120ms ease, color 120ms ease';

    // Gray hover
    a.addEventListener('mouseenter', () => {
      a.style.background = '#808080';
      a.style.color = '#fff';
    });
    a.addEventListener('mouseleave', () => {
      a.style.background = 'var(--btn-bg, #111)';
      a.style.color = 'var(--btn-fg, #eee)';
    });

    wrapper.appendChild(a);
    nav.appendChild(wrapper);
  }

  // If we are on the Security page, set the red palette on the body
  function applySecurityPaletteIfNeeded() {
    if (!/\/security-services\/?$/i.test(location.pathname)) return;
    document.body.classList.add('security-mode');
    const r = document.documentElement.style;
    r.setProperty('--accent-1', '#b1002f');
    r.setProperty('--accent-2', '#7a001f');
    r.setProperty('--accent-3', '#3a0010');
    r.setProperty('--link-color', '#ff4d61');
    r.setProperty('--btn-bg', '#141014');
    r.setProperty('--btn-fg', '#f2f2f2');
    // Background tweaks are scoped by .security-mode in the page below
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectSecurityButton();
    applySecurityPaletteIfNeeded();
  });
})();
