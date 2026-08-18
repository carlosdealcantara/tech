document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. LANGUAGE LOGIC
    // =========================================================

    const langBtnEn = document.getElementById('lang-btn-en');
    const langBtnPt = document.getElementById('lang-btn-pt');

    function switchLanguage(lang) {
        // Update button active states
        if (lang === 'en') {
            langBtnEn && langBtnEn.classList.add('active');
            langBtnPt && langBtnPt.classList.remove('active');
        } else {
            langBtnEn && langBtnEn.classList.remove('active');
            langBtnPt && langBtnPt.classList.add('active');
        }

        // Update all elements with data-en / data-pt attributes
        document.querySelectorAll('[data-en][data-pt]').forEach(el => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Persist choice in sessionStorage
        sessionStorage.setItem('lang', lang);
    }

    // Detect language: URL param takes priority, then session, then default EN
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const sessionLang = sessionStorage.getItem('lang');

    let initialLang = 'en';
    if (urlLang === 'pt' || urlLang === 'en') {
        initialLang = urlLang;
    } else if (sessionLang === 'pt' || sessionLang === 'en') {
        initialLang = sessionLang;
    }

    // Apply initial language
    switchLanguage(initialLang);

    // Button click handlers — each one sets a fixed language
    langBtnEn && langBtnEn.addEventListener('click', () => switchLanguage('en'));
    langBtnPt && langBtnPt.addEventListener('click', () => switchLanguage('pt'));


    // =========================================================
    // 2. MOBILE MENU TOGGLE
    // =========================================================

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isDisplayed = window.getComputedStyle(navLinks).display !== 'none';
            if (isDisplayed && window.innerWidth <= 768) {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '72px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'rgba(5, 5, 8, 0.95)';
                navLinks.style.padding = '2rem';
                navLinks.style.borderBottom = '1px solid var(--border-color)';
            }
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.style.cssText = '';
        }
    });


    // =========================================================
    // 3. SMOOTH SCROLLING FOR ANCHOR LINKS
    // =========================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });

                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });


    // =========================================================
    // 4. GSAP HORIZONTAL SCROLL FOR PORTFOLIO
    // =========================================================

    const portfolioSticky = document.querySelector('.portfolio-sticky');
    const portfolioTrack = document.querySelector('#portfolio-track');

    if (portfolioSticky && portfolioTrack && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Only activate on desktop (>= 768px)
        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
            // Calculate how much the track needs to scroll
            const getScrollAmount = () => {
                return -(portfolioTrack.scrollWidth - window.innerWidth);
            };

            gsap.to(portfolioTrack, {
                x: getScrollAmount,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.portfolio-sticky',
                    start: 'top top',
                    end: () => `+=${Math.abs(getScrollAmount())}`,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                }
            });
        });

        // On mobile: reset any transforms and disable pin
        mm.add('(max-width: 767px)', () => {
            portfolioTrack.style.transform = '';
        });

    } else if (portfolioTrack) {
        // GSAP not loaded: just show cards normally (fallback)
        console.warn('GSAP not loaded; horizontal scroll disabled.');
    }

});
