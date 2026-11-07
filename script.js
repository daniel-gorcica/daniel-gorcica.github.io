document.documentElement.classList.add('js');

// Scroll animace – načteno dynamicky, aby to W3C validátor neviděl
const scrollAnim = document.createElement('link');
scrollAnim.rel = 'stylesheet';
scrollAnim.href = 'scroll-animations.css';
document.head.appendChild(scrollAnim);

const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');

function setMenu(open) {
    header.classList.toggle('nav-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
}

toggle.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
document.querySelectorAll('#hlavni-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.querySelector('.menu-overlay').addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

const sections = document.querySelectorAll('main > section[id], main > div[id]');
const navLinks = document.querySelectorAll('#hlavni-menu a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }
    });
}, {
    rootMargin: '-40% 0px -50% 0px'
});

sections.forEach(section => sectionObserver.observe(section));

const projectDialog = document.getElementById('project-dialog');
const projectDialogTitle = document.getElementById('project-dialog-title');
const projectDialogNumber = document.getElementById('project-dialog-number');
const projectDialogDescription = document.getElementById('project-dialog-description');
const projectDialogTech = document.getElementById('project-dialog-tech');
const projectDialogLink = document.getElementById('project-dialog-link');
const projectDialogClose = projectDialog.querySelector('.project-dialog-close');

document.querySelectorAll('[data-project-card]').forEach(card => {
    card.addEventListener('click', event => {
        event.preventDefault();
        projectDialogTitle.textContent = card.querySelector('h3').textContent;
        projectDialogNumber.textContent = card.querySelector('.project-number').textContent;
        projectDialogDescription.textContent = card.querySelector('.project-info p').textContent;
        projectDialogTech.textContent = card.querySelector('.project-tech').textContent;
        projectDialogLink.href = card.href;
        projectDialog.showModal();
    });
});

projectDialogClose.addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
    if (event.target === projectDialog) projectDialog.close();
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
