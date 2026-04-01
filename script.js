/* ── Lenis Smooth Scroll ── */
const lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);


/* ── Custom Cursor ── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let rx = mx, ry = my;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
});

(function animRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .stack-item, .cta-btn, .nav-logo, .proj-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
});


/* ── Hero Load Animation ── */
window.addEventListener('load', () => {
    // Animate lines in
    gsap.fromTo('#ht1', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.2 });
    gsap.fromTo('#ht2', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.42 });
    gsap.fromTo('#hero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.7 });
    gsap.fromTo('#hero-foot', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.9 });
});


/* ── Hero Title — Zoom on Scroll (main effect) ── */
const heroTitle = document.getElementById('hero-title');
const heroBg    = document.querySelector('.hero-grid');
const heroMeta  = document.getElementById('hero-meta');
const heroFoot  = document.getElementById('hero-foot');

gsap.timeline({
    scrollTrigger: {
        trigger: '.zoom-bridge',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
    }
})
.to(heroTitle, { scale: 14, opacity: 0, transformOrigin: 'center center', ease: 'none' }, 0)
.to([heroMeta, heroFoot], { opacity: 0, ease: 'none' }, 0)
.to(heroBg, { opacity: 0, ease: 'none' }, 0);


/* ── Stat Counters ── */
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

ScrollTrigger.create({
    trigger: '.stats-strip',
    start: 'top 80%',
    once: true,
    onEnter: () => {
        document.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
        gsap.fromTo('.stat-item', { opacity: 0, y: 40 }, {
            opacity: 1, y: 0,
            duration: 0.9, ease: 'expo.out',
            stagger: 0.1
        });
    }
});


/* ── Work Section — Sticky Panel Switcher ── */
const workPanels = [
    document.getElementById('wp-1'),
    document.getElementById('wp-2'),
    document.getElementById('wp-3'),
];

let activePanelIdx = 0;

function switchPanel(idx) {
    if (idx === activePanelIdx) return;
    const prev = workPanels[activePanelIdx];
    const next = workPanels[idx];

    // Exit current
    prev.classList.remove('active');
    prev.classList.add('exit-up');

    // Enter next
    next.classList.remove('exit-up');
    setTimeout(() => {
        next.classList.add('active');
    }, 50);

    activePanelIdx = idx;
}

ScrollTrigger.create({
    trigger: '.work-sticky-wrap',
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.33) switchPanel(0);
        else if (p < 0.66) switchPanel(1);
        else switchPanel(2);
    }
});


/* ── About — Split Title Lines ── */
const aboutTitleSpans = document.querySelectorAll('.split-lines span');
aboutTitleSpans.forEach((span, i) => {
    gsap.fromTo(span,
        { yPercent: 105, opacity: 0 },
        {
            yPercent: 0, opacity: 1,
            duration: 1.1, ease: 'expo.out',
            delay: i * 0.12,
            scrollTrigger: {
                trigger: '.about-title',
                start: 'top 80%',
            }
        }
    );
});


/* ── Skill Bars ── */
const skillFills = document.querySelectorAll('.skill-fill');

ScrollTrigger.create({
    trigger: '.skill-block',
    start: 'top 75%',
    onEnter: () => {
        skillFills.forEach((fill, i) => {
            setTimeout(() => fill.classList.add('animated'), i * 120);
        });
    },
    once: true
});


/* ── Project Cards ── */
document.querySelectorAll('.proj-card').forEach((card, i) => {
    gsap.fromTo(card,
        { opacity: 0, y: 60 },
        {
            opacity: 1, y: 0,
            duration: 1, ease: 'expo.out',
            delay: i * 0.15,
            scrollTrigger: {
                trigger: '.proj-grid',
                start: 'top 80%',
            }
        }
    );
});


/* ── Contact Title Lines ── */
const contactSpans = document.querySelectorAll('.contact-title span');
contactSpans.forEach((span, i) => {
    gsap.fromTo(span,
        { yPercent: 110 },
        {
            yPercent: 0,
            duration: 1.1, ease: 'expo.out',
            delay: i * 0.13,
            scrollTrigger: {
                trigger: '.contact-title',
                start: 'top 80%',
            }
        }
    );
});

gsap.fromTo('.cta-btn',
    { opacity: 0, y: 30 },
    {
        opacity: 1, y: 0,
        duration: 0.9, ease: 'expo.out', delay: 0.45,
        scrollTrigger: { trigger: '.cta-btn', start: 'top 90%' }
    }
);


/* ── About cols ── */
gsap.fromTo('.about-col--left',
    { opacity: 0, x: -50 },
    {
        opacity: 1, x: 0,
        duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.about-cols', start: 'top 75%' }
    }
);

gsap.fromTo('.about-col--right',
    { opacity: 0, x: 50 },
    {
        opacity: 1, x: 0, delay: 0.15,
        duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: '.about-cols', start: 'top 75%' }
    }
);


/* ── Nav solid on scroll ── */
const nav = document.getElementById('nav');
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
        nav.classList.toggle('solid', self.scroll() > 80);
    }
});


/* ── General kicker/label reveals ── */
document.querySelectorAll('.about-kicker, .proj-header .kicker, .contact-inner .kicker').forEach(el => {
    gsap.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' }
        }
    );
});
