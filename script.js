const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const pageLoader = document.getElementById('page-loader');

window.addEventListener('load', () => {
    window.setTimeout(() => pageLoader.classList.add('is-hidden'), 450);
});

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

let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        scrollTicking = false;
    });
}, { passive: true });

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
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) return;
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

/* Počítání čísel ve statistikách */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = Number(el.dataset.count);
        el.textContent = '0';
        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            obs.disconnect();
            const start = performance.now();
            const tick = now => {
                const p = Math.min((now - start) / 1400, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, { threshold: 0.6 });
        obs.observe(el);
    });
}

/* Světelný proud – záložní výpočet pro prohlížeče bez CSS scroll-timeline (Safari/Firefox) */
const supportsScrollTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');
const streamLines = document.querySelectorAll('.stream-glow-line, .stream-core-line');

function updateLightStream() {
    if (supportsScrollTimeline || !streamLines.length) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
    const offset = Math.round((1 - progress) * 3800);
    streamLines.forEach(line => line.style.setProperty('--stream-offset', offset));
}

if (!supportsScrollTimeline) {
    window.addEventListener('scroll', () => requestAnimationFrame(updateLightStream), { passive: true });
    updateLightStream();
}

/* 3D skleněný náklon karet projektů (Tilting glass effect) */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}