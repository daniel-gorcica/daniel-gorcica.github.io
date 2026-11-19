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

/* Interaktivní 3D částicové jádro v úvodní sekci. */
const heroCanvas = document.querySelector('.hero-canvas');

if (heroCanvas) {
    const hero = heroCanvas.closest('.hero');
    const ctx = heroCanvas.getContext('2d', { alpha: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;

    function resizeHeroCanvas() {
        const rect = hero.getBoundingClientRect();
        pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = rect.width;
        height = rect.height;
        heroCanvas.width = Math.round(width * pixelRatio);
        heroCanvas.height = Math.round(height * pixelRatio);
        heroCanvas.style.width = `${width}px`;
        heroCanvas.style.height = `${height}px`;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function drawHeroCore(now = 0) {
        if (!ctx || !width || !height) return;
        if (!reduceMotion && now - lastFrame < 30) {
            requestAnimationFrame(drawHeroCore);
            return;
        }
        lastFrame = now;

        const t = reduceMotion ? 0 : now * .00022;
        pointer.x += (pointer.targetX - pointer.x) * .035;
        pointer.y += (pointer.targetY - pointer.y) * .035;
        ctx.clearRect(0, 0, width, height);

        const mobile = width < 760;
        const cx = width * (mobile ? .62 : .74) + pointer.x * 20;
        const cy = height * (mobile ? .58 : .52) + pointer.y * 15;
        const radius = Math.min(width * (mobile ? .43 : .34), height * .42, 350);
        const halo = ctx.createRadialGradient(cx, cy, radius * .05, cx, cy, radius * 1.75);
        halo.addColorStop(0, 'rgba(255, 143, 90, .19)');
        halo.addColorStop(.35, 'rgba(255, 111, 181, .12)');
        halo.addColorStop(.68, 'rgba(122, 215, 255, .055)');
        halo.addColorStop(1, 'rgba(122, 215, 255, 0)');
        ctx.fillStyle = halo;
        ctx.fillRect(cx - radius * 1.8, cy - radius * 1.8, radius * 3.6, radius * 3.6);

        const yaw = t + pointer.x * .38;
        const pitch = Math.sin(t * .72) * .12 + pointer.y * .2;
        const rings = mobile ? 17 : 23;
        const segments = mobile ? 38 : 58;
        const focal = radius * 2.7;
        const camera = radius * 3.2;
        const points = [];
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);

        for (let ri = 0; ri <= rings; ri++) {
            const lat = -Math.PI / 2 + Math.PI * ri / rings;
            const row = [];
            for (let si = 0; si < segments; si++) {
                const lon = Math.PI * 2 * si / segments;
                const ripple = 1 + .025 * Math.sin(lon * 3 + t * 1.8) * Math.cos(lat * 5 - t);
                const x = Math.cos(lat) * Math.cos(lon) * ripple;
                const y = Math.sin(lat) * ripple;
                const z = Math.cos(lat) * Math.sin(lon) * ripple;
                const rx = x * cosYaw - z * sinYaw;
                const rz = x * sinYaw + z * cosYaw;
                const ry = y * cosPitch - rz * sinPitch;
                const depth = y * sinPitch + rz * cosPitch;
                const scale = focal / (camera - depth * radius);
                row.push({ x: cx + rx * radius * scale, y: cy + ry * radius * scale, depth, ry });
            }
            points.push(row);
        }

        // Lattice of fine connections, fading softly toward the back of the orb.
        ctx.lineWidth = .65;
        for (let ri = 0; ri <= rings; ri++) {
            for (let si = 0; si < segments; si++) {
                const a = points[ri][si];
                const b = points[ri][(si + 1) % segments];
                const down = ri < rings ? points[ri + 1][si] : null;
                const depth = (a.depth + b.depth) * .5;
                const alpha = .1 + Math.max(0, depth) * .3;
                const color = a.ry > .15 ? `255, 143, 90` : a.ry < -.25 ? `122, 215, 255` : `255, 111, 181`;
                ctx.strokeStyle = `rgba(${color}, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                if (down) ctx.lineTo(down.x, down.y);
                ctx.stroke();
            }
        }

        // Bright particles on the front surface add a glassy, dimensional sparkle.
        const sparkleStep = mobile ? 3 : 2;
        for (let ri = 1; ri < rings; ri += 2) {
            for (let si = (ri % 2) * sparkleStep; si < segments; si += sparkleStep) {
                const p = points[ri][si];
                if (p.depth < -.28) continue;
                const pulse = .55 + .45 * Math.sin(t * 3 + ri * .8 + si * .24);
                const size = (p.depth + .35) * 1.05 + .4;
                ctx.fillStyle = p.ry > .2
                    ? `rgba(255, 226, 122, ${.32 + pulse * .55})`
                    : `rgba(122, 215, 255, ${.28 + pulse * .56})`;
                ctx.shadowColor = p.ry > .2 ? '#ff8f5a' : '#7ad7ff';
                ctx.shadowBlur = 8 + pulse * 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;

        // Two thin orbital rings and a small satellite make the motion readable.
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-.28 + pointer.x * .08);
        ctx.scale(1, .31);
        ctx.strokeStyle = 'rgba(255, 226, 122, .36)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.28, radius * 1.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(.72);
        ctx.strokeStyle = 'rgba(122, 215, 255, .25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.42, radius * 1.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const satelliteAngle = t * 1.25 + .5;
        const sx = cx + Math.cos(satelliteAngle) * radius * 1.28;
        const sy = cy + Math.sin(satelliteAngle) * radius * .4;
        ctx.fillStyle = '#ffe27a';
        ctx.shadowColor = '#ff8f5a';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!reduceMotion) requestAnimationFrame(drawHeroCore);
    }

    hero.addEventListener('pointermove', event => {
        const rect = hero.getBoundingClientRect();
        pointer.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
        pointer.targetY = (event.clientY - rect.top) / rect.height * 2 - 1;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
        pointer.targetX = 0;
        pointer.targetY = 0;
    }, { passive: true });

    resizeHeroCanvas();
    drawHeroCore();
    window.addEventListener('resize', resizeHeroCanvas, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(resizeHeroCanvas).observe(hero);
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
