/* ══════════════════════════════════════════════════════
   LERP SMOOTH SCROLL (desktop only)
   Intercepts wheel events and applies linear
   interpolation for a buttery, sliding scroll feel.
   Disabled on touch/mobile for native scroll behavior.
   ══════════════════════════════════════════════════════ */
(function () {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let current = window.scrollY, target = current, ease = 0.08;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function update() {
        current = lerp(current, target, ease);
        if (Math.abs(current - target) < 0.5) current = target;
        window.scrollTo(0, current);
        requestAnimationFrame(update);
    }

    window.addEventListener('wheel', function (e) {
        e.preventDefault();
        target = Math.max(0, Math.min(target + e.deltaY, document.body.scrollHeight - window.innerHeight));
    }, { passive: false });

    window.addEventListener('scroll', function () {
        if (Math.abs(window.scrollY - current) > 2) {
            target = window.scrollY;
            current = window.scrollY;
        }
    }, { passive: true });

    requestAnimationFrame(update);
})();


document.addEventListener('DOMContentLoaded', () => {

    /* ══════════════════════════════════════════════════
       NAVBAR & SCROLL
       Toggles .scrolled class on navbar when scrolling
       past 40px for background opacity transition.
       ══════════════════════════════════════════════════ */
    const navbar = document.getElementById('navbar');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 40);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });


    /* ══════════════════════════════════════════════════
       BURGER MENU
       Mobile hamburger toggle for nav-menu.
       ══════════════════════════════════════════════════ */
    const burger = document.getElementById('burger');
    const navMenu = document.getElementById('nav-menu');

    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (!burger.contains(e.target) && !navMenu.contains(e.target)) {
            burger.classList.remove('open');
            navMenu.classList.remove('open');
        }
    });


    /* ══════════════════════════════════════════════════
       SHUTTER TRANSITION
       Accent-colored slat animation that sweeps in/out
       when navigating between sections via nav or keys.
       ══════════════════════════════════════════════════ */
    const SLATS = 7, STAGGER = 0.03, DURATION = 0.3;
    const SWEEP_TIME = SLATS * (STAGGER * 1000) + (DURATION * 1000);

    const shutter = document.createElement('div');
    shutter.style.cssText = 'position:fixed; top:0; left:0; right:0; height:100vh; z-index:99999; pointer-events:none; display:flex; flex-direction:column; overflow:hidden;';

    const slats = [];
    for (let i = 0; i < SLATS; i++) {
        const s = document.createElement('div');
        s.style.cssText = `flex:1; background:#64ffda; transform:scaleX(0); transform-origin:left; transition:transform ${DURATION}s cubic-bezier(0.76,0,0.24,1); transition-delay:${i * STAGGER}s;`;
        shutter.appendChild(s);
        slats.push(s);
    }
    document.body.appendChild(shutter);

    const SECTIONS = ['home', 'moi', 'career', 'achievements', 'kin', 'circle', 'interests', 'playlist'];

    function getCurrentSection() {
        const scrollMid = window.scrollY + window.innerHeight / 2;
        let current = 'home';
        for (const id of SECTIONS) {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= scrollMid) current = id;
        }
        return '#' + current;
    }

    function shutterNav(target) {
        if (getCurrentSection() === target) return;
        shutter.style.pointerEvents = 'all';
        slats.forEach(s => { s.style.transformOrigin = 'left'; s.style.transform = 'scaleX(1)'; });

        setTimeout(() => {
            const el = document.querySelector(target);
            if (el) el.scrollIntoView({ behavior: 'instant' });
            slats.forEach(s => { s.style.transformOrigin = 'right'; s.style.transform = 'scaleX(0)'; });
            setTimeout(() => { shutter.style.pointerEvents = 'none'; }, SWEEP_TIME);
        }, SWEEP_TIME);
    }

    document.querySelectorAll('.nav-menu a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            burger.classList.remove('open');
            navMenu.classList.remove('open');
            shutterNav(a.getAttribute('href'));
        });
    });

    document.querySelector('.nav-logo').addEventListener('click', e => {
        e.preventDefault();
        shutterNav('#home');
    });


    /* ══════════════════════════════════════════════════
       KEYBOARD NAVIGATION
       Number keys 1–7 navigate to sections via shutter.
       ══════════════════════════════════════════════════ */
    const NAV_KEYS = {
        '1': '#moi', '2': '#career', '3': '#achievements',
        '4': '#kin', '5': '#circle', '6': '#interests', '7': '#playlist'
    };

    document.addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
        const target = NAV_KEYS[e.key];
        if (target) shutterNav(target);
    });


    /* ══════════════════════════════════════════════════
       SCROLL REVEAL
       IntersectionObserver adds .active to .reveal
       elements for fade-in-up entrance animations.
       ══════════════════════════════════════════════════ */
    const revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


    /* ══════════════════════════════════════════════════
       DOT CANVAS
       Interactive dot grid with mouse warp/suck effect
       and click ripple on the hero section background.
       ══════════════════════════════════════════════════ */
    const canvas = document.getElementById('dot-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const SPACING = 30, DOT_R = 1.4, WARP_DIST = 180, WARP_STR = 38, SUCK_STR = 18;
    const RIPPLES = [];
    let mouse = { x: -9999, y: -9999 }, smoothMx = -9999, smoothMy = -9999;
    let lastScrollY = window.scrollY;

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('click', e => { RIPPLES.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 }); });
    }
    window.addEventListener('scroll', () => {
        const dy = window.scrollY - lastScrollY;
        lastScrollY = window.scrollY;
        smoothMy -= dy * 0.6;
    }, { passive: true });

    function drawDots() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        smoothMx += (mouse.x - smoothMx) * 0.12;
        smoothMy += (mouse.y - smoothMy) * 0.12;

        for (let i = RIPPLES.length - 1; i >= 0; i--) {
            RIPPLES[i].r += 10;
            RIPPLES[i].life -= 0.010;
            if (RIPPLES[i].life <= 0) RIPPLES.splice(i, 1);
        }

        const scrollY = window.scrollY, offsetY = scrollY % SPACING;
        const cols = Math.ceil(canvas.width / SPACING) + 2;
        const rows = Math.ceil(canvas.height / SPACING) + 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let gx = c * SPACING;
                let gy = r * SPACING - offsetY;
                let dx = gx - smoothMx;
                let dy = gy - smoothMy;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < WARP_DIST && dist > 0.5) {
                    const norm = dist / WARP_DIST;
                    const force = (1 - norm) * (1 - norm);
                    const warpPush = norm < 0.3 ? -force * SUCK_STR : force * WARP_STR;
                    gx += (dx / dist) * warpPush;
                    gy += (dy / dist) * warpPush;
                    dist = Math.max(1, dist - Math.abs(warpPush));
                }

                for (const rip of RIPPLES) {
                    const rdx = (c * SPACING) - rip.x;
                    const rdy = (r * SPACING - offsetY) - rip.y;
                    const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
                    const nearRing = Math.abs(rdist - rip.r);
                    if (nearRing < 60 && rdist > 0.5) {
                        const ripForce = Math.sin((1 - nearRing / 60) * Math.PI) * 22 * rip.life;
                        gx += (rdx / rdist) * ripForce;
                        gy += (rdy / rdist) * ripForce;
                    }
                }

                const proximity = Math.max(0, 1 - Math.hypot(gx - smoothMx, gy - smoothMy) / (WARP_DIST * 0.9));
                ctx.beginPath();
                ctx.arc(gx, gy, DOT_R + proximity * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100,255,218,${0.12 + proximity * 0.7})`;
                ctx.fill();
            }
        }

        requestAnimationFrame(drawDots);
    }
    requestAnimationFrame(drawDots);


    /* ══════════════════════════════════════════════════
       STORY VIEWER
       Instagram-style story overlay for viewing photos,
       videos, and HTML cards with auto-advance progress.
       ══════════════════════════════════════════════════ */
    const storyGroups = {
        'moi': [
            { label: 'Me, Myself, and I', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/profile1.jpg', fallback: 'me/profile1.jpg' },
            { label: 'Candid moments', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/profile2.jpg', fallback: 'me/profile2.jpg' },
            { label: 'At peace', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/profile3.jpg', fallback: 'me/profile3.jpg' },
            { label: 'Just Lyze', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/profile4.jpg', fallback: 'me/profile4.jpg' }
        ],
        'career': [
            { label: 'Aeronautical Engineering', type: 'html', content: '<div class="career-card" style="transform:none;margin:auto;"><div class="career-card-top"><div class="career-icon-wrap"><i class="fa-solid fa-plane-up"></i></div></div><h3 style="color:#fff;">Aeronautical Engineering</h3><p class="career-school">Philippine State College of Aeronautics (PhilSCA)</p><p class="career-campus">Pasay Campus</p><div class="career-tags"><span>Engineering</span><span>Aviation</span><span>STEM</span></div></div>' },
            { label: 'Chemical Engineering', type: 'html', content: '<div class="career-card" style="transform:none;margin:auto;"><div class="career-card-top"><div class="career-icon-wrap"><i class="fa-solid fa-flask"></i></div></div><h3 style="color:#fff;">Chemical Engineering</h3><p class="career-school">Batangas State University (BSU)</p><p class="career-campus">Alangilan Campus</p><div class="career-tags"><span>Engineering</span><span>Chemistry</span><span>STEM</span></div></div>' }
        ],
        'achievements': [
            { label: 'Achievement 1', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/ed9fef1dd5436d27b7ad3b1784189b47a47a90e8/ach1.jpg' },
            { label: 'Achievement 2', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/ed9fef1dd5436d27b7ad3b1784189b47a47a90e8/ach2.jpg' },
            { label: 'Achievement 3', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/ed9fef1dd5436d27b7ad3b1784189b47a47a90e8/ach3.jpg' },
            { label: 'Achievement 4', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/ed9fef1dd5436d27b7ad3b1784189b47a47a90e8/ac4.jpg' }
        ],
        'kin': [
            { label: 'A moment ♡', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Fam.mp4' },
            { label: 'Family time', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/family1.jpg' },
            { label: 'Cherished memories', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/family2.jpg' },
            { label: 'Together', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/family3.jpg' },
            { label: 'Always', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/family4.jpg' },
            { label: 'Us, always', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Fam(1).mp4' }
        ],
        'circle': [
            { label: 'Friends for Life ♡', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9e5611bb8aeb3833f085ff6f606626564fe76ef4/circle.jpg', fallback: 'circle.jpg' },
            { label: 'Good times ♡', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Friends.mp4' },
            { label: 'Always us', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Friends(1).mp4' }
        ],
        'interests': [
            { label: 'Biking', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Biking.jpg' },
            { label: 'Digital Editing', type: 'img', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Digital%20Editing.jpg' },
            { label: 'Singing', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/Singing.mp4' },
            { label: 'Driving', type: 'vid', src: 'https://raw.githubusercontent.com/charlyzx/e-profile/9490b508793def6d6b3b65b1b17dd4f9d2cd537b/driving.mp4' }
        ]
    };

    const hvOverlay = document.getElementById('highlight-viewer');
    const hvBackdrop = document.getElementById('hv-backdrop');
    const hvCloseBtn = document.getElementById('hv-close');
    const hvTitle = document.getElementById('hv-title');
    const hvCounter = document.getElementById('hv-counter');
    const hvMediaWrap = document.getElementById('hv-media-wrap');
    const hvProgBar = document.getElementById('hv-progress-bar');
    const hvTapLeft = document.getElementById('hv-tap-left');
    const hvTapRight = document.getElementById('hv-tap-right');

    let hvIndex = 0, hvTimer = null, hvActiveEl = null, hvSegs = [], hvDuration = 5000;
    let currentGroup = [];

    function hvBuildSegments() {
        hvProgBar.innerHTML = '';
        hvSegs = currentGroup.map(() => {
            const wrap = document.createElement('div');
            wrap.style.cssText = 'flex:1; height:100%; background:rgba(255,255,255,0.25); border-radius:99px; overflow:hidden;';
            const fill = document.createElement('div');
            fill.style.cssText = 'height:100%; width:0%; background:#64ffda; border-radius:99px;';
            wrap.appendChild(fill);
            hvProgBar.appendChild(wrap);
            return fill;
        });
        hvProgBar.style.display = 'flex';
        hvProgBar.style.gap = '3px';
    }

    function hvOpen(groupKey, startIndex) {
        currentGroup = storyGroups[groupKey];
        hvIndex = startIndex;
        hvOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        hvBuildSegments();
        hvShow();
    }

    function hvShow() {
        clearTimeout(hvTimer);
        hvSegs.forEach((fill, i) => {
            fill.style.transition = 'none';
            fill.style.width = i < hvIndex ? '100%' : '0%';
        });

        const slide = currentGroup[hvIndex];
        hvTitle.textContent = slide.label;
        hvCounter.textContent = `${hvIndex + 1} / ${currentGroup.length}`;

        if (hvActiveEl) {
            if (hvActiveEl.tagName === 'VIDEO') hvActiveEl.pause();
            hvActiveEl.remove();
            hvActiveEl = null;
        }

        if (slide.type === 'img') {
            const el = document.createElement('img');
            el.src = slide.src;
            el.alt = slide.label;
            if (slide.fallback) el.onerror = () => { el.onerror = null; el.src = slide.fallback; };
            hvMediaWrap.insertBefore(el, hvTapLeft);
            hvActiveEl = el;
            hvDuration = 5000;
            el.onload = hvStartProgress;
            if (el.complete) hvStartProgress();

        } else if (slide.type === 'vid') {
            const el = document.createElement('video');
            el.src = slide.src;
            el.muted = false;
            el.playsInline = true;
            el.controls = false;
            hvMediaWrap.insertBefore(el, hvTapLeft);
            hvActiveEl = el;
            el.addEventListener('loadedmetadata', () => {
                hvDuration = (el.duration || 10) * 1000;
                hvStartProgress();
                el.play().catch(() => { });
            }, { once: true });
            el.addEventListener('ended', hvNext, { once: true });

        } else if (slide.type === 'html') {
            const el = document.createElement('div');
            el.className = 'hv-html-wrap';
            el.innerHTML = slide.content;
            hvMediaWrap.insertBefore(el, hvTapLeft);
            hvActiveEl = el;
            hvDuration = 5000;
            hvStartProgress();
        }
    }

    function hvStartProgress() {
        clearTimeout(hvTimer);
        const fill = hvSegs[hvIndex];
        requestAnimationFrame(() => {
            fill.style.transition = `width ${hvDuration}ms linear`;
            fill.style.width = '100%';
        });
        hvTimer = setTimeout(hvNext, hvDuration);
    }

    function hvNext() {
        clearTimeout(hvTimer);
        if (hvIndex < currentGroup.length - 1) { hvIndex++; hvShow(); }
        else hvCloseStory();
    }

    function hvPrev() {
        clearTimeout(hvTimer);
        hvIndex = Math.max(0, hvIndex - 1);
        hvShow();
    }

    function hvCloseStory() {
        clearTimeout(hvTimer);
        if (hvActiveEl) {
            if (hvActiveEl.tagName === 'VIDEO') hvActiveEl.pause();
            hvActiveEl.remove();
            hvActiveEl = null;
        }
        hvOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /* Story viewer — click handlers */
    document.querySelectorAll('#moi .photo-card').forEach((card, i) => card.addEventListener('click', () => hvOpen('moi', i)));
    document.querySelectorAll('.career-card').forEach((card, i) => card.addEventListener('click', () => hvOpen('career', i)));
    document.querySelectorAll('#achievements .photo-card').forEach((card, i) => card.addEventListener('click', () => hvOpen('achievements', i)));
    document.querySelectorAll('#kin .fan-card').forEach((card, i) => card.addEventListener('click', () => hvOpen('kin', i)));
    document.querySelectorAll('#circle .fan-card').forEach((card, i) => card.addEventListener('click', () => hvOpen('circle', i + 1)));

    const circleImg = document.querySelector('.circle-img-wrap');
    if (circleImg) circleImg.addEventListener('click', () => hvOpen('circle', 0));

    const INTEREST_MAP = { biking: 0, editing: 1, singing: 2, driving: 3 };
    document.querySelectorAll('.interest-card').forEach(card => {
        card.addEventListener('click', () => hvOpen('interests', INTEREST_MAP[card.dataset.highlight] ?? 0));
    });

    /* Story viewer — navigation controls */
    hvTapLeft.addEventListener('click', hvPrev);
    hvTapRight.addEventListener('click', hvNext);
    hvCloseBtn.addEventListener('click', hvCloseStory);

    hvBackdrop.addEventListener('click', e => {
        if (e.clientX < window.innerWidth / 2) hvPrev(); else hvNext();
    });

    hvBackdrop.addEventListener('mousemove', e => {
        hvBackdrop.style.cursor = e.clientX < window.innerWidth / 2 ? 'w-resize' : 'e-resize';
    });

    document.addEventListener('keydown', e => {
        if (!hvOverlay.classList.contains('active')) return;
        if (e.key === 'ArrowRight') hvNext();
        if (e.key === 'ArrowLeft') hvPrev();
        if (e.key === 'Escape') hvCloseStory();
    });

    /* Auto-play/pause videos on card hover */
    document.querySelectorAll('.interest-card, .fan-card').forEach(card => {
        const vid = card.querySelector('video');
        if (!vid) return;
        card.addEventListener('mouseenter', () => vid.play().catch(() => { }));
        card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
    });


    /* ══════════════════════════════════════════════════
       PLAYLIST ENGINE
       Full music player with tracks, queue, lyrics,
       drag-to-seek, shuffle, and repeat modes.
       ══════════════════════════════════════════════════ */
    const songs = [
        {
            title: "Adore You", artist: "Harry Styles",
            src: "https://raw.githubusercontent.com/charlyzx/e-profile/f4e8d0504702efedadbdd8f04f6f2b50018e923e/adore%20you.mp3",
            cover: "https://raw.githubusercontent.com/charlyzx/e-profile/71864c5dc184c695e2e57dda0bc7bc44790acd27/adore%20you.jpg",
            lyricsUrl: "https://raw.githubusercontent.com/charlyzx/e-profile/1e4c8ed1d60cba5cf7ec699a23a2f78cea2d8408/Harry%20Styles%20-%20Adore%20You.lrc"
        },
        {
            title: "Nothing", artist: "Bruno Major",
            src: "https://raw.githubusercontent.com/charlyzx/e-profile/52659c8d3a5ce0b01fa05c2a37f17d91fe468b0a/nothing.mp3",
            cover: "https://raw.githubusercontent.com/charlyzx/e-profile/71864c5dc184c695e2e57dda0bc7bc44790acd27/nothing.jpg",
            lyricsUrl: "https://raw.githubusercontent.com/charlyzx/e-profile/6ff4ceb575b209c71e48313575a6663d19136750/Bruno%20Major%20-%20Nothing.lrc"
        },
        {
            title: "Cherry Wine", artist: "Grentperez",
            src: "https://raw.githubusercontent.com/charlyzx/e-profile/f4e8d0504702efedadbdd8f04f6f2b50018e923e/cherry%20wine.mp3",
            cover: "https://raw.githubusercontent.com/charlyzx/e-profile/71864c5dc184c695e2e57dda0bc7bc44790acd27/cherry%20wine.jpg",
            lyricsUrl: "https://raw.githubusercontent.com/charlyzx/e-profile/1e4c8ed1d60cba5cf7ec699a23a2f78cea2d8408/grentperez%20-%20Cherry%20Wine.lrc"
        },
        {
            title: "Sky Walker", artist: "Miguel",
            src: "https://raw.githubusercontent.com/charlyzx/e-profile/f4e8d0504702efedadbdd8f04f6f2b50018e923e/Sky%20Walker.mp3",
            cover: "https://raw.githubusercontent.com/charlyzx/e-profile/71864c5dc184c695e2e57dda0bc7bc44790acd27/skywalker.jpg",
            lyricsUrl: "https://raw.githubusercontent.com/charlyzx/e-profile/1e4c8ed1d60cba5cf7ec699a23a2f78cea2d8408/Miguel%20-%20Sky%20Walker%20(feat.%20Travis%20Scott).lrc"
        }
    ];

    /* Player DOM references */
    const spBgImg = document.getElementById('sp-bg-img');
    const spCover = document.getElementById('sp-cover');
    const spTitle = document.getElementById('sp-track-title');
    const spArtist = document.getElementById('sp-track-artist');
    const spTimeCur = document.getElementById('sp-time-cur');
    const spTimeDur = document.getElementById('sp-time-dur');
    const spProgBar = document.getElementById('sp-progress-bar');
    const spProgFill = document.getElementById('sp-progress-fill');
    const spProgThumb = document.getElementById('sp-progress-thumb');

    const btnShuffle = document.getElementById('sp-shuffle');
    const btnPrev = document.getElementById('sp-prev');
    const btnPlay = document.getElementById('sp-play');
    const btnNext = document.getElementById('sp-next');
    const btnRepeat = document.getElementById('sp-repeat');

    const panelTracks = document.getElementById('panel-tracks');
    const lyricsContent = document.getElementById('lyrics-content');
    const panelQueue = document.getElementById('panel-queue');
    const relatedGrid = document.getElementById('related-grid');
    const tabs = document.querySelectorAll('.sp-tab');

    let audio = new Audio();
    let currentIndex = 0, isPlaying = false, isShuffle = false, repeatMode = 1;
    let shuffleOrder = [], currentLyrics = [];

    function fmtTime(s) {
        if (!s || isNaN(s)) return '0:00';
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    }

    /* Lyrics parsing and rendering */
    function parseLyrics(text) {
        const lines = text.split('\n');
        const parsed = [];
        const timeRegex = /\[(\d{2}):(\d{2}\.?\d*)\]/;
        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match) {
                const time = (parseFloat(match[1]) * 60) + parseFloat(match[2]);
                const textContent = line.replace(timeRegex, '').trim();
                if (textContent) parsed.push({ time, text: textContent });
            }
        });
        return parsed;
    }

    async function loadLyricsFromUrl(url) {
        lyricsContent.innerHTML = '<div class="lyric-line">Loading lyrics...</div>';
        try {
            const res = await fetch(url);
            const text = await res.text();
            currentLyrics = parseLyrics(text);
            renderLyrics(currentLyrics);
        } catch (e) {
            lyricsContent.innerHTML = '<div class="lyric-line">Lyrics not available.</div>';
        }
    }

    function renderLyrics(lyricsData) {
        lyricsContent.innerHTML = '';
        lyricsData.forEach(line => {
            const el = document.createElement('div');
            el.className = 'lyric-line';
            el.textContent = line.text;
            el.dataset.time = line.time;
            el.addEventListener('click', () => {
                audio.currentTime = line.time;
                if (!isPlaying) playTrack();
            });
            lyricsContent.appendChild(el);
        });
    }

    function updateLyricsHighlight() {
        const time = audio.currentTime;
        const lines = document.querySelectorAll('.lyric-line');
        let activeLine = null;
        lines.forEach(line => {
            line.classList.remove('active');
            if (parseFloat(line.dataset.time) <= time) activeLine = line;
        });
        if (activeLine) {
            activeLine.classList.add('active');
            const container = document.getElementById('panel-lyrics');
            const scrollPos = activeLine.offsetTop - (container.clientHeight / 2) + (activeLine.offsetHeight / 2);
            try {
                container.scrollTo({ top: scrollPos, behavior: 'smooth' });
            } catch (e) {
                container.scrollTop = scrollPos;
            }
        }
    }

    /* Track lifecycle */
    function loadTrack(index) {
        currentIndex = index;
        const song = songs[currentIndex];
        audio.src = song.src;
        audio.load();
        audio.currentTime = 0;
        spTitle.textContent = song.title;
        spArtist.textContent = song.artist;
        spCover.src = song.cover;
        spBgImg.src = song.cover;
        renderTracksList();
        renderQueue();
        renderRelated();
        updateHighlight();
        if (song.lyricsUrl) loadLyricsFromUrl(song.lyricsUrl);
    }

    function playTrack() {
        audio.play().then(() => {
            isPlaying = true;
            btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
            updateHighlight();
        });
    }

    function pauseTrack() {
        audio.pause();
        isPlaying = false;
        btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
    }

    function nextTrack(manual = true) {
        if (repeatMode === 2 && !manual) { audio.currentTime = 0; playTrack(); return; }
        let next = isShuffle
            ? shuffleOrder[(shuffleOrder.indexOf(currentIndex) + 1) % shuffleOrder.length]
            : (currentIndex + 1) % songs.length;
        if (repeatMode === 0 && !manual && next === 0) return;
        loadTrack(next);
        playTrack();
    }

    function prevTrack() {
        if (audio.currentTime > 3) { audio.currentTime = 0; return; }
        let prev = isShuffle
            ? shuffleOrder[(shuffleOrder.indexOf(currentIndex) - 1 + shuffleOrder.length) % shuffleOrder.length]
            : (currentIndex - 1 + songs.length) % songs.length;
        loadTrack(prev);
        playTrack();
    }

    /* Panel renderers */
    function renderTracksList() {
        panelTracks.innerHTML = '';
        songs.forEach((song, i) => {
            const div = document.createElement('div');
            div.className = `sp-track-item ${i === currentIndex ? 'playing' : ''}`;
            div.innerHTML = `
                <span class="sp-track-num">${i + 1}</span>
                <img class="sp-track-thumb" src="${song.cover}">
                <div class="sp-track-meta">
                    <span class="sp-track-name">${song.title}</span>
                    <span class="sp-track-artist">${song.artist}</span>
                </div>
                <span class="sp-track-dur">--:--</span>`;
            div.addEventListener('click', () => { loadTrack(i); playTrack(); });
            panelTracks.appendChild(div);
        });
    }

    function renderQueue() {
        panelQueue.innerHTML = '<div class="queue-label">Now Playing</div>';
        const currDiv = document.createElement('div');
        currDiv.className = 'sp-track-item playing';
        currDiv.innerHTML = `
            <img class="sp-track-thumb" src="${songs[currentIndex].cover}">
            <div class="sp-track-meta">
                <span class="sp-track-name">${songs[currentIndex].title}</span>
                <span class="sp-track-artist">${songs[currentIndex].artist}</span>
            </div>`;
        panelQueue.appendChild(currDiv);
        panelQueue.innerHTML += '<div class="queue-label" style="margin-top:1rem">Next Up</div>';

        let nextIdx = currentIndex;
        for (let j = 0; j < songs.length - 1; j++) {
            nextIdx = isShuffle
                ? shuffleOrder[(shuffleOrder.indexOf(nextIdx) + 1) % shuffleOrder.length]
                : (nextIdx + 1) % songs.length;
            const s = songs[nextIdx];
            const div = document.createElement('div');
            div.className = 'sp-track-item';
            div.innerHTML = `
                <span class="sp-track-num">${j + 1}</span>
                <img class="sp-track-thumb" src="${s.cover}">
                <div class="sp-track-meta">
                    <span class="sp-track-name">${s.title}</span>
                    <span class="sp-track-artist">${s.artist}</span>
                </div>`;
            div.addEventListener('click', () => { loadTrack(nextIdx); playTrack(); });
            panelQueue.appendChild(div);
        }
    }

    function renderRelated() {
        relatedGrid.innerHTML = '';
        songs.forEach((s, i) => {
            const card = document.createElement('div');
            card.className = 'related-card';
            card.innerHTML = `
                <div class="related-card-art">
                    <img src="${s.cover}">
                    <div class="related-play-btn"><i class="fa-solid fa-play"></i></div>
                </div>
                <div class="related-card-info">
                    <div class="related-card-name">${s.title}</div>
                    <div class="related-card-artist">${s.artist}</div>
                </div>`;
            card.addEventListener('click', () => { loadTrack(i); playTrack(); });
            relatedGrid.appendChild(card);
        });
    }

    function updateHighlight() {
        panelTracks.querySelectorAll('.sp-track-item').forEach((item, i) => {
            item.classList.toggle('playing', i === currentIndex);
        });
        renderQueue();
    }

    /* Player controls */
    btnPlay.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
    btnNext.addEventListener('click', () => nextTrack(true));
    btnPrev.addEventListener('click', prevTrack);
    audio.addEventListener('ended', () => nextTrack(false));

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration * 100) + '%';
        spProgFill.style.width = pct;
        spProgThumb.style.left = pct;
        spTimeCur.textContent = fmtTime(audio.currentTime);
        spTimeDur.textContent = fmtTime(audio.duration);
        updateLyricsHighlight();
    });

    /* Drag-to-seek (Spotify-style) */
    let isDragging = false;

    function seekFromEvent(e) {
        if (!audio.duration) return;
        const rect = spProgBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const pct = (percent * 100) + '%';
        spProgFill.style.width = pct;
        spProgThumb.style.left = pct;
        spTimeCur.textContent = fmtTime(percent * audio.duration);
        return percent;
    }

    spProgBar.addEventListener('mousedown', e => {
        isDragging = true;
        spProgBar.classList.add('dragging');
        seekFromEvent(e);
    });

    document.addEventListener('mousemove', e => {
        if (isDragging) seekFromEvent(e);
    });

    document.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        spProgBar.classList.remove('dragging');
        const percent = seekFromEvent(e);
        if (percent !== undefined) audio.currentTime = percent * audio.duration;
    });

    /* Shuffle and repeat toggles */
    btnShuffle.addEventListener('click', () => {
        isShuffle = !isShuffle;
        btnShuffle.classList.toggle('active', isShuffle);
        if (isShuffle) shuffleOrder = songs.map((_, i) => i).sort(() => Math.random() - 0.5);
        renderQueue();
    });

    btnRepeat.addEventListener('click', () => {
        repeatMode = (repeatMode + 1) % 3;
        btnRepeat.classList.remove('active', 'active-one');
        if (repeatMode === 1) btnRepeat.classList.add('active');
        else if (repeatMode === 2) btnRepeat.classList.add('active', 'active-one');
    });

    /* Tab panel switching */
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.sp-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${tab.dataset.panel}`).classList.add('active');
        });
    });

    loadTrack(0);
});