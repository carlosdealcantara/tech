document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. LANGUAGE LOGIC
    // =========================================================
    const langBtnEn = document.getElementById('lang-btn-en');
    const langBtnPt = document.getElementById('lang-btn-pt');

    function switchLanguage(lang) {
        if (!langBtnEn || !langBtnPt) return;

        // Update button active states
        langBtnEn.classList.toggle('active', lang === 'en');
        langBtnPt.classList.toggle('active', lang === 'pt');

        // Update all translatable elements
        document.querySelectorAll('[data-en][data-pt]').forEach(el => {
            el.textContent = el.getAttribute('data-' + lang);
        });

        document.documentElement.lang = lang;
        sessionStorage.setItem('lang', lang);
    }

    // Detect language from URL, then sessionStorage, then default 'en'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const sessionLang = sessionStorage.getItem('lang');

    let initialLang = 'en';
    if (urlLang === 'pt' || urlLang === 'en') {
        initialLang = urlLang;
    } else if (sessionLang === 'pt' || sessionLang === 'en') {
        initialLang = sessionLang;
    }

    switchLanguage(initialLang);

    // Each button sets a FIXED language — no toggle
    if (langBtnEn) langBtnEn.addEventListener('click', () => switchLanguage('en'));
    if (langBtnPt) langBtnPt.addEventListener('click', () => switchLanguage('pt'));


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
    // 4. GSAP HORIZONTAL SCROLL (PORTFOLIO)
    // =========================================================
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not available. Horizontal scroll disabled.');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const portfolioSticky = document.querySelector('.portfolio-sticky');
    const portfolioTrack  = document.getElementById('portfolio-track');

    if (!portfolioSticky || !portfolioTrack) return;

    // Only on desktop
    let mm = gsap.matchMedia();
    mm.add('(min-width: 769px)', () => {
        const getScrollAmount = () =>
            -(portfolioTrack.scrollWidth - portfolioSticky.offsetWidth);

        gsap.to(portfolioTrack, {
            x: getScrollAmount,
            ease: 'none',
            scrollTrigger: {
                trigger: '.portfolio-sticky',
                pin: true,
                scrub: 1,
                start: 'top top',
                end: () => '+=' + Math.abs(getScrollAmount()),
                invalidateOnRefresh: true,
                anticipatePin: 1,
            }
        });
    });

});
