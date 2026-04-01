/* =====================================================
   PORTFOLIO — Apple-style Scroll Animations
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

(function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(animateRing);
})();

document.querySelectorAll('a, button, .p-card, .contact-btn, .skill-pill, .nav-logo').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-ring--hover'));
});

function updateCursorTheme(theme) {
    if (theme === 'dark') {
        cursorDot.style.background = '#22d3ee';
        cursorRing.style.borderColor = 'rgba(34,211,238,0.4)';
    } else {
        cursorDot.style.background = '#6366f1';
        cursorRing.style.borderColor = 'rgba(99,102,241,0.4)';
    }
}


// ── 2. Page Load — Hero Entrance ──────────────────────
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Animate hero name char by char
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        const html = heroName.innerHTML;
        const chars = [];
        let inTag = false;
        let i = 0;

        // Split text nodes only (preserve <br>)
        heroName.innerHTML = html.replace(/(<br>)|([^<])/g, (match, br, ch) => {
            if (br) return '<br>';
            return `<span class="char" style="display:inline-block;opacity:0;transform:translateY(40px)">${ch}</span>`;
        });

        heroName.querySelectorAll('.char').forEach((ch, idx) => {
            setTimeout(() => {
                ch.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
                ch.style.opacity = '1';
                ch.style.transform = 'translateY(0)';
            }, 250 + idx * 38);
        });
    }

    // Stagger remaining hero elements
    const heroStagger = [
        document.querySelector('.hero-eyebrow'),
        document.querySelector('.hero-roles'),
        document.querySelector('.hero-sub'),
        document.querySelector('.hero-photo-wrap'),
    ];

    heroStagger.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.75s ease ${0.65 + i * 0.15}s, transform 0.75s ease ${0.65 + i * 0.15}s`;
        requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    });
});


// ── 3. Scroll Reveal (IntersectionObserver) ───────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

// Stagger skill pills
document.querySelectorAll('.skill-pill').forEach((pill, i) => {
    pill.style.transitionDelay = `${i * 0.07}s`;
    revealObserver.observe(pill);
});

// All other reveal elements
document.querySelectorAll('.reveal, .reveal-left, .contact-line').forEach(el => {
    revealObserver.observe(el);
});


// ── 4. SVG Draw-on-Scroll ─────────────────────────────
function initSvgLines() {
    document.querySelectorAll('.svg-draw-line').forEach(line => {
        const len = line.getTotalLength ? line.getTotalLength() : 500;
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
    });
}

const workVisual = document.querySelector('.work-visual');
if (workVisual) {
    initSvgLines();

    const svgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.svg-draw-line').forEach((line, i) => {
                    setTimeout(() => line.classList.add('drawn'), i * 220);
                });
                const fill = document.querySelector('.chart-fill');
                if (fill) setTimeout(() => fill.classList.add('shown'), 1200);
                svgObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.35 });

    svgObserver.observe(workVisual);
}


// ── 5. Hero Parallax + Fade ───────────────────────────
const heroContent  = document.querySelector('.hero-content');
const heroGlows    = document.querySelectorAll('.hero-glow');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const progress = Math.min(y / vh, 1);

    if (heroContent) {
        heroContent.style.opacity = Math.max(0, 1 - progress * 1.3).toString();
        heroContent.style.transform = `translateY(${y * 0.08}px)`;
    }

    heroGlows.forEach(g => {
        g.style.transform = `translateY(${y * 0.05}px)`;
    });
}, { passive: true });


// ── 6. Nav: theme + active + scrolled ─────────────────
const nav      = document.querySelector('#main-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

const sectionThemes = {
    hero:     'dark',
    work:     'dark',
    skills:   'light',
    personal: 'dark',
    contact:  'light',
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            // Active link
            navLinks.forEach(l => l.classList.remove('nav-active'));
            const active = [...navLinks].find(l => l.getAttribute('href') === `#${id}`);
            if (active) active.classList.add('nav-active');
            // Nav theme
            const theme = sectionThemes[id] || 'light';
            nav.dataset.theme = theme;
            updateCursorTheme(theme);
        }
    });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 60);
}, { passive: true });


// ── 7. Scroll Progress Bar ────────────────────────────
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${(scrolled / maxScroll) * 100}%`;
}, { passive: true });


// ── 8. Smooth Scroll ──────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});


// ── 9. 3D Card Tilt (Personal Projects) ───────────────
document.querySelectorAll('.p-card:not(.p-card--locked)').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = `perspective(900px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
});


// ── 10. Magnetic Contact Button ───────────────────────
const contactBtn = document.querySelector('.contact-btn');
if (contactBtn) {
    contactBtn.addEventListener('mousemove', e => {
        const rect = contactBtn.getBoundingClientRect();
        const dx   = (e.clientX - rect.left - rect.width  / 2) * 0.35;
        const dy   = (e.clientY - rect.top  - rect.height / 2) * 0.35;
        contactBtn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    contactBtn.addEventListener('mouseleave', () => {
        contactBtn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), all 0.25s ease';
        contactBtn.style.transform  = 'translate(0, 0)';
        setTimeout(() => { contactBtn.style.transition = ''; }, 500);
    });
}


// ── 11. Text Scramble on Hero Name Hover ──────────────
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function scrambleTo(el, target) {
    if (el._scramble) clearInterval(el._scramble);
    let frame = 0;
    const total = 18;
    el._scramble = setInterval(() => {
        el.innerText = target.split('').map((ch, i) => {
            if (ch === ' ' || ch === '\n') return ch;
            if (frame / total > i / target.length) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++frame > total) {
            el.innerText = target;
            clearInterval(el._scramble);
            el._scramble = null;
        }
    }, 32);
}
