/* =====================================================
   PORTFOLIO — Interactive JS
   ===================================================== */

// ── 1. Custom Cursor ──────────────────────────────────
const cursorDot  = document.createElement('div');
const cursorRing = document.createElement('div');
cursorDot.className  = 'cursor-dot';
cursorRing.className = 'cursor-ring';
document.body.append(cursorDot, cursorRing);

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
});

// Ring lags behind dot
(function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
})();

// Cursor grows on hover over interactive elements
document.querySelectorAll('a, button, .project-card, .contact-btn').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-ring--hover'));
});


// ── 2. Page Load Reveal ───────────────────────────────
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Stagger hero elements
    const heroEls = [
        document.querySelector('.hero-left'),
        document.querySelector('.hero-center'),
        document.querySelector('.hero-right'),
    ];
    heroEls.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(32px)';
        el.style.transition = `opacity 0.8s ease ${i * 0.15 + 0.2}s, transform 0.8s ease ${i * 0.15 + 0.2}s`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    });
});


// ── 3. Scroll Reveal (staggered) ─────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.project-card, .about-inner, .contact-section, .section-label').forEach((el, i) => {
    el.classList.add('will-reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    revealObserver.observe(el);
});


// ── 4. 3D Card Tilt ───────────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dx    = (e.clientX - cx) / (rect.width  / 2);
        const dy    = (e.clientY - cy) / (rect.height / 2);
        const tiltX = dy * -6;
        const tiltY = dx *  6;
        card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
});


// ── 5. Magnetic Button ────────────────────────────────
document.querySelectorAll('.contact-btn, .nav-logo').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * 0.35;
        const dy   = (e.clientY - cy) * 0.35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        setTimeout(() => { btn.style.transition = ''; }, 500);
    });
});


// ── 6. Text Scramble on Hero Hover ───────────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789<>/';

function scrambleTo(el, target, onDone) {
    // cancel any running scramble
    if (el._scrambleInterval) clearInterval(el._scrambleInterval);
    let frame = 0;
    const totalFrames = 20;
    el._scrambleInterval = setInterval(() => {
        el.innerText = target.split('').map((ch, i) => {
            if (ch === ' ') return ' ';
            if (frame / totalFrames > i / target.length) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++frame > totalFrames) {
            el.innerText = target;
            clearInterval(el._scrambleInterval);
            el._scrambleInterval = null;
            if (onDone) onDone();
        }
    }, 32);
}

document.querySelectorAll('.hero-word').forEach(el => {
    const original = el.innerText;
    const hoverText = el.dataset.hover || null;

    if (hoverText) {
        el.addEventListener('mouseenter', () => scrambleTo(el, hoverText));
        el.addEventListener('mouseleave', () => scrambleTo(el, original));
    } else {
        el.addEventListener('mouseenter', () => scrambleTo(el, original));
    }
});


// ── 7. Hero Parallax on Scroll ────────────────────────
const heroPhoto = document.querySelector('.hero-center');
const heroLeft  = document.querySelector('.hero-left');
const heroRight = document.querySelector('.hero-right');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroPhoto) heroPhoto.style.transform = `translateY(${y * 0.12}px)`;
    if (heroLeft)  heroLeft.style.transform  = `translateY(${y * 0.06}px)`;
    if (heroRight) heroRight.style.transform = `translateY(${y * 0.06}px)`;
}, { passive: true });


// ── 8. Nav active link on scroll ─────────────────────
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('nav-active'));
            const active = [...navLinks].find(l => l.getAttribute('href') === `#${entry.target.id}`);
            if (active) active.classList.add('nav-active');
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));


// ── 9. Smooth scroll ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ── 10. Nav shrink on scroll ──────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
}, { passive: true });
