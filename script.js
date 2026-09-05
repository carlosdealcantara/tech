if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);

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

        document.querySelectorAll('[data-placeholder-en][data-placeholder-pt]').forEach(el => {
            el.placeholder = el.getAttribute('data-placeholder-' + lang);
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


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Logo / back-to-top link
            if (!targetId || targetId === '#') {
                gsap.to(window, { scrollTo: 0, duration: 1, ease: 'power2.inOut' });
                if (window.innerWidth <= 768 && navLinks) navLinks.style.display = 'none';
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) return;

            const st = window.horizontalScrollTrigger;
            const isDesktop = window.innerWidth > 768;

            // --- CASE 1: Horizontal sections on desktop ---
            if (
                target.classList.contains('horizontal-section') &&
                isDesktop &&
                st
            ) {
                // ScrollTrigger maps its scroll range 1:1 to the track's translateX distance.
                // The trigger starts at `st.start` pixels of page scroll.
                // Each section's offsetLeft inside the track equals the required X translation,
                // which in turn equals the required scroll offset from `st.start`.
                // We force a refresh first to ensure st.start is accurate after any layout shift.
                ScrollTrigger.refresh();
                const targetY = st.start + target.offsetLeft;
                gsap.to(window, { scrollTo: targetY, duration: 1, ease: 'power2.inOut' });
            }
            // --- CASE 2: Vertical sections (e.g. #contact) on desktop ---
            else if (isDesktop && st) {
                // To get to the contact section, we need its actual Y coordinate in the document.
                // Since horizontal sections are now properly syncing scroll, the GSAP pin-spacer
                // will push this section down by the exact right amount.
                const targetY = target.getBoundingClientRect().top + window.scrollY;
                gsap.to(window, { scrollTo: targetY, duration: 1, ease: 'power2.inOut' });
            }
            // --- CASE 3: Mobile (no horizontal scroll, normal vertical layout) ---
            else {
                gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: 1, ease: 'power2.inOut' });
            }

            if (window.innerWidth <= 768 && navLinks) navLinks.style.display = 'none';
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

        window.horizontalScrollTrigger = ScrollTrigger.create({
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

    // =========================================================
    // 5. AJAX FORM SUBMISSION
    // =========================================================
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            const lang = document.documentElement.lang;
            submitBtn.innerHTML = lang === 'pt-BR' ? 'Enviando...' : 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    contactForm.reset();
                    formStatus.style.display = 'block';
                    formStatus.style.color = '#4CAF50'; // Green
                    formStatus.innerHTML = lang === 'pt-BR' ? 'Mensagem enviada com sucesso! Retornarei em breve.' : 'Message sent successfully! I will get back to you soon.';
                } else {
                    formStatus.style.display = 'block';
                    formStatus.style.color = '#F44336'; // Red
                    formStatus.innerHTML = lang === 'pt-BR' ? 'Ocorreu um erro ao enviar. Tente novamente.' : 'Oops! There was a problem submitting your form.';
                }
            } catch (error) {
                formStatus.style.display = 'block';
                formStatus.style.color = '#F44336';
                formStatus.innerHTML = lang === 'pt-BR' ? 'Erro de conexão. Verifique sua internet.' : 'Connection error. Please check your internet.';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // =========================================================
    // 6. PORTFOLIO SWIPER
    // =========================================================
    if (typeof Swiper !== 'undefined') {
        new Swiper('.portfolio-swiper', {
            loop: true,
            slidesPerView: 1.2,
            centeredSlides: false,
            spaceBetween: 20,
            speed: 800,
            autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true },
            pagination: { el: '.portfolio-swiper .swiper-pagination', clickable: true },
            navigation: { nextEl: '.portfolio-swiper .swiper-button-next', prevEl: '.portfolio-swiper .swiper-button-prev' },
            breakpoints: {
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 30 }
            }
        });
    }

});
