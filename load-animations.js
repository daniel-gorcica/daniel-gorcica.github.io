// Scroll animace používají moderní CSS (animation-timeline), které W3C validátor nezná.
// Načítáme je hned v <head>, takže se styl použije ještě před vykreslením stránky (bez probliknutí).
document.documentElement.classList.add('js');
const scrollAnim = document.createElement('link');
scrollAnim.rel = 'stylesheet';
scrollAnim.href = 'scroll-animations.css';
document.head.appendChild(scrollAnim);
