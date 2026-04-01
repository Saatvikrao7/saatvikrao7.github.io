/* ── Lenis Smooth Scroll ── */
const lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


/* ── Custom Cursor ── */
const dot  = document.createElement('div');
const ring = document.createElement('div');
dot.className  = 'cursor-dot';
ring.className = 'cursor-ring';
document.body.append(dot, ring);

let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
});

(function trackRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(trackRing);
})();

document.querySelectorAll('a, button, .stack-pill, .contact-cta, .nav-logo').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});


/* ── Hero Title Animate In ── */
window.addEventListener('load', () => {
    document.querySelectorAll('.hero-title .line').forEach((line, li) => {
        const text = line.textContent;
        line.innerHTML = '';
        line.style.opacity = '1';
        [...text].forEach((ch, i) => {
            const s = document.createElement('span');
            s.style.cssText = `display:inline-block;opacity:0;transform:translateY(60px);transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${(li * 8 + i) * 45 + 200}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${(li * 8 + i) * 45 + 200}ms`;
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            line.appendChild(s);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    s.style.opacity = '1';
                    s.style.transform = 'translateY(0)';
                }, 50);
            });
        });
    });
});


/* ── Sticky Work Section ── */
const stickyWrap  = document.getElementById('work');
const panels = [
    document.getElementById('panel-intro'),
    document.getElementById('panel-what'),
    document.getElementById('panel-stack'),
];

let currentPanel = 0;

function showPanel(index) {
    panels.forEach((p, i) => {
        p.classList.remove('hidden', 'exit');
        if (i < index) p.classList.add('exit');
        else if (i > index) p.classList.add('hidden');
    });
    currentPanel = index;
}

lenis.on('scroll', ({ scroll }) => {
    if (!stickyWrap) return;
    const rect = stickyWrap.getBoundingClientRect();
    const wrapTop    = stickyWrap.offsetTop;
    const wrapHeight = stickyWrap.offsetHeight;
    const vh         = window.innerHeight;

    // scroll progress through the sticky section (0 to 1)
    const progress = (scroll - wrapTop) / (wrapHeight - vh);

    if (progress < 0 || progress > 1) return;

    if (progress < 0.33) showPanel(0);
    else if (progress < 0.66) showPanel(1);
    else showPanel(2);
});


/* ── Nav: scrolled state ── */
const nav = document.getElementById('nav');
lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 80);
});


/* ── General Reveal on Scroll ── */
const revealEls = document.querySelectorAll(
    '.about-inner, .about-heading, .about-right p, .skill-groups, .projects-header, .proj-card, .contact-inner, .section-label'
);

revealEls.forEach(el => el.classList.add('reveal-on-scroll'));

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

// Stagger proj cards
document.querySelectorAll('.proj-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
});
