document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. PRELOADER
    // =========================================================
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.remove(), 600);
        }
    });

    // =========================================================
    // 1. LANGUAGE DETECTION (by subdomain — no user toggle)
    // =========================================================
    // 'tecnologia.viaei.com' -> Portuguese | everything else -> English
    function applyLanguage() {
        const hostname = window.location.hostname;
        const lang = hostname.startsWith('tecnologia') ? 'pt' : 'en';

        document.querySelectorAll('[data-en][data-pt]').forEach(el => {
            el.textContent = el.getAttribute('data-' + lang);
        });

        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    }

    applyLanguage();


    // =========================================================
    // 2. MOBILE MENU TOGGLE
    // =========================================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            if (isVisible) {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.cssText = 'display:flex; flex-direction:column; position:absolute; top:72px; left:0; right:0; background:rgba(5,5,8,0.97); padding:2rem; border-bottom:1px solid rgba(255,255,255,0.08);';
            }
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.style.cssText = '';
        }
    });


    // =========================================================
    // 3. SMOOTH SCROLL FOR ANCHOR LINKS
    // =========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });


    // =========================================================
    // 4. GSAP HORIZONTAL SCROLL (FULL SITE)
    // =========================================================
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not available. Horizontal scroll disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const horizontalContainer = document.querySelector('.horizontal-container');
    const mainTrack = document.getElementById('main-horizontal-track');

    if (!horizontalContainer || !mainTrack) return;

    // Only on desktop
    let mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
        // Calculate the exact width we need to slide
        function getScrollAmount() {
            let trackWidth = mainTrack.scrollWidth;
            let viewportWidth = window.innerWidth;
            return -(trackWidth - viewportWidth);
        }

        const tween = gsap.to(mainTrack, {
            x: getScrollAmount,
            ease: 'none'
        });

        ScrollTrigger.create({
            trigger: '.horizontal-container',
            start: 'top top',
            end: () => `+=${Math.abs(getScrollAmount())}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
        });
    });

});
