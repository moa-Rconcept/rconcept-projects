// Année automatique dans le footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobile
const toggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.style.display = open ? 'none' : 'flex';
  menu.style.flexDirection = 'column';
  menu.style.gap = '12px';
  menu.style.padding = '12px 0';
});
