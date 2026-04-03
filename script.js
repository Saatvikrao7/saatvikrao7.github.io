/* ── Page Loader ── */
const loader = document.getElementById('loader');
const crosses = document.querySelector('.crosses');
const bgCanvas = document.getElementById('bg-canvas');

setTimeout(() => {
    loader.classList.add('open');
    setTimeout(() => {
        crosses.classList.add('visible');
        loader.style.display = 'none';
    }, 1200);
}, 400);


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

document.querySelectorAll('a, button, .stack-item, .cta-btn, .nav-logo, .proj-card, .chapter-dot').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
});


/* ══════════════════════════════════════════
   THREE.JS — HERO PARTICLE SYSTEM
   ══════════════════════════════════════════ */
(function initHeroParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    // Particle geometry
    const COUNT = 420;
    const positions = new Float32Array(COUNT * 3);
    const velocities = [];
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        sizes[i] = Math.random() * 1.5 + 0.3;
        velocities.push({
            x: (Math.random() - 0.5) * 0.04,
            y: (Math.random() - 0.5) * 0.04,
            z: (Math.random() - 0.5) * 0.01,
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader material for glowing particles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime:     { value: 0 },
            uMouse:    { value: new THREE.Vector2(0, 0) },
            uAccent:   { value: new THREE.Color(0xc0562e) },
        },
        vertexShader: `
            attribute float size;
            uniform float uTime;
            uniform vec2 uMouse;
            varying float vAlpha;

            void main() {
                vec3 pos = position;

                // Gentle float
                pos.y += sin(uTime * 0.4 + position.x * 0.05) * 0.8;
                pos.x += cos(uTime * 0.3 + position.y * 0.05) * 0.5;

                // Mouse repulsion (subtle)
                vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
                vec2 screenPos = mvPos.xy / mvPos.z;
                float dist = distance(screenPos, uMouse * 40.0);
                if (dist < 12.0) {
                    vec2 dir = normalize(screenPos - uMouse * 40.0);
                    pos.xy += dir * (12.0 - dist) * 0.3;
                }

                vAlpha = 0.15 + 0.45 * (1.0 - abs(pos.z) / 30.0);

                gl_PointSize = size * (80.0 / -mvPos.z);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uAccent;
            varying float vAlpha;

            void main() {
                float d = length(gl_PointCoord - 0.5) * 2.0;
                if (d > 1.0) discard;
                float alpha = (1.0 - d * d) * vAlpha * 0.55;
                // Dark charcoal dots on cream background
                vec3 col = vec3(0.05, 0.05, 0.05);
                gl_FragColor = vec4(col, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse tracking for parallax
    let targetMouseX = 0, targetMouseY = 0;
    let currentMouseX = 0, currentMouseY = 0;

    document.addEventListener('mousemove', e => {
        targetMouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Resize
    window.addEventListener('resize', () => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsed = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsed;

        // Smooth mouse follow
        currentMouseX += (targetMouseX - currentMouseX) * 0.05;
        currentMouseY += (targetMouseY - currentMouseY) * 0.05;
        material.uniforms.uMouse.value.set(currentMouseX, -currentMouseY);

        // Rotate scene gently with mouse
        particles.rotation.y = currentMouseX * 0.08;
        particles.rotation.x = currentMouseY * 0.05;

        // Update particle positions
        const pos = geometry.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3]     += velocities[i].x;
            pos[i * 3 + 1] += velocities[i].y;
            pos[i * 3 + 2] += velocities[i].z;

            // Wrap boundaries
            if (pos[i * 3]     >  100) pos[i * 3]     = -100;
            if (pos[i * 3]     < -100) pos[i * 3]     =  100;
            if (pos[i * 3 + 1] >   60) pos[i * 3 + 1] = -60;
            if (pos[i * 3 + 1] <  -60) pos[i * 3 + 1] =  60;
        }
        geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();
})();


/* ══════════════════════════════════════════
   THREE.JS — CONTACT SECTION SHADER BG
   ══════════════════════════════════════════ */
(function initContactShader() {
    if (typeof THREE === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.id = 'contact-canvas';
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;
    contactSection.insertBefore(canvas, contactSection.firstChild);

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.offsetWidth || window.innerWidth, canvas.offsetHeight || 600);
    renderer.setClearColor(0x000000, 0);

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) } },
        vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
        fragmentShader: `
            uniform float uTime;
            uniform vec2 uRes;

            float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

            void main() {
                vec2 uv = gl_FragCoord.xy / uRes;
                uv.y = 1.0 - uv.y;

                float t = uTime * 0.3;
                vec2 p = uv * 4.0;

                float n = 0.0;
                n += sin(p.x * 1.5 + t) * 0.5;
                n += sin(p.y * 2.0 - t * 1.3) * 0.5;
                n += sin((p.x + p.y) * 1.2 + t * 0.7) * 0.5;
                n = n * 0.5 + 0.5;

                vec3 accent = vec3(0.753, 0.337, 0.18); // #c0562e
                float alpha = n * 0.06 * (1.0 - distance(uv, vec2(0.5)) * 1.2);
                alpha = max(0.0, alpha);

                gl_FragColor = vec4(accent, alpha);
            }
        `,
        transparent: true,
    });

    scene.add(new THREE.Mesh(geo, mat));

    let clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        mat.uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        mat.uniforms.uRes.value.set(canvas.offsetWidth, canvas.offsetHeight);
    });
})();


/* ══ SCRAMBLE SYSTEM ══
   One timer per element guaranteed — new call always cancels the previous.
   ══════════════════════════════════════════════════════════════════════ */
const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
const _timers = new Map(); // element → interval id

/* Settle: scrambles random → target, then stops */
function scrambleTo(el, target, speed, onDone) {
    if (_timers.has(el)) clearInterval(_timers.get(el));
    let frame = 0;
    const t = setInterval(() => {
        el.textContent = target.split('').map((ch, i) => {
            if (ch === ' ' || ch === '@') return ch;
            return i < frame ? ch : pool[Math.floor(Math.random() * pool.length)];
        }).join('');
        frame += (speed || 0.5);
        if (frame > target.length) {
            clearInterval(t);
            _timers.delete(el);
            el.textContent = target;
            if (onDone) onDone();
        }
    }, 35);
    _timers.set(el, t);
}

/* Glitch: scrambles all chars continuously until stopped */
function scrambleLoop(el, text) {
    if (_timers.has(el)) clearInterval(_timers.get(el));
    const t = setInterval(() => {
        el.textContent = text.split('').map(ch =>
            (ch === ' ' || ch === '@') ? ch : pool[Math.floor(Math.random() * pool.length)]
        ).join('');
    }, 60);
    _timers.set(el, t);
}

function scrambleStop(el) {
    if (_timers.has(el)) { clearInterval(_timers.get(el)); _timers.delete(el); }
}


/* ── On-load: name scrambles in once after slide animation ── */
window.addEventListener('load', () => {
    setTimeout(() => {
        scrambleTo(document.getElementById('ht1'), 'Saatvik', 0.45, () => {
            setTimeout(() => scrambleTo(document.getElementById('ht2'), 'Rao', 0.6), 80);
        });
    }, 2400);
});


/* ── Hover name → continuous glitch; leave → settle back ── */
(function() {
    const nameEl = document.getElementById('hero-title');
    const ht1 = document.getElementById('ht1');
    const ht2 = document.getElementById('ht2');
    if (!nameEl || !ht1) return;
    nameEl.addEventListener('mouseenter', () => {
        scrambleLoop(ht1, 'Saatvik');
        scrambleLoop(ht2, 'Rao');
    });
    nameEl.addEventListener('mouseleave', () => {
        scrambleStop(ht1); scrambleTo(ht1, 'Saatvik', 0.5);
        scrambleStop(ht2); scrambleTo(ht2, 'Rao', 0.6);
    });
})();


/* ── Hover right flanker → swap CONSULTANT ↔ @ DELOITTE ── */
(function() {
    const span = document.querySelector('#flanker-right span');
    if (!span) return;
    let alt = false;
    span.addEventListener('mouseenter', () => {
        if (alt) return;
        alt = true;
        scrambleTo(span, span.dataset.alt, 0.45);
    });
    span.addEventListener('mouseleave', () => {
        alt = false;
        scrambleTo(span, span.dataset.text, 0.45);
    });
})();


/* ── Bottom-right: cycle phrases every 3s ── */
(function() {
    const el = document.getElementById('hero-scramble');
    if (!el) return;
    const phrases = ['consultant @ deloitte', 'software developer', 'cs grad    @ asu'];
    let idx = 0;
    setTimeout(() => {
        scrambleTo(el, phrases[0], 0.5);
        setInterval(() => { idx = (idx + 1) % phrases.length; scrambleTo(el, phrases[idx], 0.5); }, 3000);
    }, 2000);
})();


/* ── Hero Load Animation + Color Flash ── */
window.addEventListener('load', () => {
    gsap.fromTo('#ht1', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.8 });
    gsap.fromTo('#ht2', { yPercent: 110, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 1.0,
        onComplete: () => {
            // Fire color flash ONCE after name animates in
            document.getElementById('ht2').classList.add('ht-flash');
        }
    });
    gsap.fromTo('#hero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 1.3 });
    gsap.fromTo('#hero-foot', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 1.5 });
});


/* ── Hero Title — Zoom on Scroll ── */
const heroTitle = document.getElementById('hero-title');
const heroBg    = document.querySelector('.hero-grid');
const heroMeta  = document.getElementById('hero-meta');
const heroFoot  = document.getElementById('hero-foot');
const heroCanvas = document.getElementById('hero-canvas');

gsap.timeline({
    scrollTrigger: {
        trigger: '.zoom-bridge',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
    }
})
.to(heroTitle,  { scale: 1, opacity: 0, transformOrigin: 'center center', ease: 'none' }, 0)
.to([heroMeta, heroFoot], { opacity: 0, ease: 'none' }, 0)
.to(heroBg,     { opacity: 0, ease: 'none' }, 0)
.to(heroCanvas, { opacity: 0, ease: 'none' }, 0);


/* ── Radial Cursor Glow on Cards ── */
document.querySelectorAll('.card-glow').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width)  * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
    });
});


/* ── Button Tilt Effect ── */
document.querySelectorAll('.tilt-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        btn.style.transform = `perspective(400px) rotateX(${dy * -5}deg) rotateY(${dx * 7}deg) scale(1.04)`;
        btn.style.boxShadow = `${-dx * 6}px ${-dy * 6}px 20px rgba(192,86,46,0.2)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
    });
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
    prev.classList.remove('active');
    prev.classList.add('exit-up');
    next.classList.remove('exit-up');
    setTimeout(() => next.classList.add('active'), 50);
    activePanelIdx = idx;

    // Stagger reveal bullets/stack items in the new panel
    const bullets = next.querySelectorAll('.wp-bullet, .stack-item');
    bullets.forEach((el, i) => {
        el.classList.remove('revealed');
        setTimeout(() => el.classList.add('revealed'), 100 + i * 140);
    });
}

ScrollTrigger.create({
    trigger: '.work-sticky-wrap',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.33) switchPanel(0);
        else if (p < 0.66) switchPanel(1);
        else switchPanel(2);
    }
});


/* ── Chapter Navigation Dots ── */
const chapterDots = document.querySelectorAll('.chapter-dot');
const chapterSections = ['hero', 'work', 'about', 'projects', 'contact'];

function setActiveChapter(id) {
    chapterDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.section === id);
    });
}

chapterDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.section);
        if (target) lenis.scrollTo(target, { offset: 0, duration: 1.8, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
});

chapterSections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onEnter:     () => setActiveChapter(id),
        onEnterBack: () => setActiveChapter(id),
    });
});


/* ── About — Split Title Lines ── */
document.querySelectorAll('.split-lines span').forEach((span, i) => {
    gsap.fromTo(span,
        { yPercent: 105, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: i * 0.12,
          scrollTrigger: { trigger: '.about-title', start: 'top 80%' } }
    );
});


/* ── Skill Bars ── */
ScrollTrigger.create({
    trigger: '.skill-block',
    start: 'top 75%',
    onEnter: () => {
        document.querySelectorAll('.skill-fill').forEach((fill, i) => {
            setTimeout(() => fill.classList.add('animated'), i * 120);
        });
    },
    once: true
});


/* ── Stat Counters ── */
function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const duration = 1800;
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
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
        gsap.fromTo('.stat-item', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 });
    }
});


/* ── Project Cards ── */
document.querySelectorAll('.proj-card').forEach((card, i) => {
    gsap.fromTo(card,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: i * 0.15,
          scrollTrigger: { trigger: '.proj-grid', start: 'top 80%' } }
    );
});


/* ── Contact Title Lines ── */
document.querySelectorAll('.contact-title span').forEach((span, i) => {
    gsap.fromTo(span,
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: i * 0.13,
          scrollTrigger: { trigger: '.contact-title', start: 'top 80%' } }
    );
});

gsap.fromTo('.cta-btn',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', delay: 0.45,
      scrollTrigger: { trigger: '.cta-btn', start: 'top 90%' } }
);


/* ── About cols ── */
gsap.fromTo('.about-col--left',
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.about-cols', start: 'top 75%' } }
);
gsap.fromTo('.about-col--right',
    { opacity: 0, x: 50 },
    { opacity: 1, x: 0, delay: 0.15, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.about-cols', start: 'top 75%' } }
);


/* ── Nav solid on scroll ── */
const nav = document.getElementById('nav');
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => nav.classList.toggle('solid', self.scroll() > 80),
});


/* ── Kicker reveals ── */
document.querySelectorAll('.about-kicker, .proj-header .kicker, .contact-inner .kicker').forEach(el => {
    gsap.fromTo(el,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' } }
    );
});


/* ── BG Canvas Section Color Transitions ── */
const bgSections = [
    { el: document.getElementById('hero'),              cls: 'bg--contact' },
    { el: document.querySelector('.zoom-bridge'),       cls: 'bg--contact' },
    { el: document.querySelector('.marquee-section'),   cls: 'bg--contact' },
    { el: document.querySelector('.stats-strip'),       cls: 'bg--contact' },
    { el: document.getElementById('work'),              cls: 'bg--work' },
    { el: document.getElementById('about'),             cls: 'bg--light' },
    { el: document.getElementById('projects'),          cls: 'bg--contact' },
    { el: document.getElementById('contact'),           cls: 'bg--contact' },
];

bgSections.forEach(({ el, cls }) => {
    if (!el) return;
    ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter:     () => setBg(cls),
        onEnterBack: () => setBg(cls),
    });
});

function setBg(cls) {
    bgCanvas.className = 'bg-canvas ' + cls;
}



/* ── Footer Reveal ── */
const footer = document.getElementById('footer');
ScrollTrigger.create({
    trigger: '.footer-holder',
    start: 'top bottom',
    end: 'bottom bottom',
    onEnter:     () => footer.classList.add('visible'),
    onLeaveBack: () => footer.classList.remove('visible'),
});


/* ── Expo easing reveal for bullets / misc ── */
gsap.utils.toArray('.wp-meta, .stat-item, .proj-card-info, .about-kicker').forEach((el, i) => {
    gsap.fromTo(el,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%' } }
    );
});


/* ── Scroll Progress Bar ── */
const scrollProgress = document.getElementById('scroll-progress');
lenis.on('scroll', ({ scroll }) => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(scroll / total * 100, 100);
    scrollProgress.style.width = pct + '%';
});


/* ── Chapter Dots — Dark Section Awareness ── */
const darkSectionIds = ['hero'];
const allChapterDots = document.querySelectorAll('.chapter-dot');

function updateDotTheme(sectionId) {
    const isDark = darkSectionIds.includes(sectionId);
    allChapterDots.forEach(dot => {
        dot.classList.toggle('on-dark', isDark);
    });
}

// Wire into existing chapter section triggers
['hero', 'work', 'about', 'projects', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
        trigger: el,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter:     () => updateDotTheme(id),
        onEnterBack: () => updateDotTheme(id),
    });
});
updateDotTheme('hero'); // initial state


/* ── Magnetic CTA Button ── */
const magneticWrap = document.getElementById('magnetic-wrap');
const ctaBtn = document.getElementById('cta-btn');

if (magneticWrap && ctaBtn) {
    magneticWrap.addEventListener('mousemove', e => {
        const rect = magneticWrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.35;
        const dy = (e.clientY - cy) * 0.45;
        gsap.to(ctaBtn, { x: dx, y: dy, duration: 0.5, ease: 'power2.out' });
    });

    magneticWrap.addEventListener('mouseleave', () => {
        gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.7, ease: 'expo.out' });
    });
}


/* ── Hero Mouse Parallax ── */
const heroSection = document.getElementById('hero');
const heroMeta2 = document.getElementById('hero-meta');
const heroFoot2 = document.getElementById('hero-foot');
const scrollHintEl = document.querySelector('.scroll-hint');
const heroGrid = document.querySelector('.hero-grid');

if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        gsap.to(heroMeta2,     { x: dx * 18,  y: dy * 10,  duration: 1.2, ease: 'power2.out' });
        gsap.to(heroFoot2,     { x: dx * -12, y: dy * -8,  duration: 1.2, ease: 'power2.out' });
        gsap.to(scrollHintEl,  { x: dx * 14,  y: dy * 12,  duration: 1.2, ease: 'power2.out' });
        gsap.to(heroGrid,      { x: dx * -6,  y: dy * -4,  duration: 1.6, ease: 'power2.out' });
    });

    heroSection.addEventListener('mouseleave', () => {
        gsap.to([heroMeta2, heroFoot2, scrollHintEl, heroGrid],
            { x: 0, y: 0, duration: 1, ease: 'expo.out' });
    });
}


/* ── Section heading clip-path reveal ── */
document.querySelectorAll('.section-heading').forEach(el => {
    gsap.fromTo(el,
        { 'clip-path': 'inset(0 0 100% 0)', opacity: 1 },
        { 'clip-path': 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' } }
    );
});


/* ── Skills ticker hover pause ── */
const tickerEl = document.querySelector('.skills-ticker-inner');
if (tickerEl) {
    tickerEl.addEventListener('mouseenter', () => tickerEl.style.animationPlayState = 'paused');
    tickerEl.addEventListener('mouseleave', () => tickerEl.style.animationPlayState = 'running');
}


/* ── Stat numbers use dark text color ── */
/* (handled via CSS, no JS needed) */
