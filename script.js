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


    // Capture any hash requested (e.g. opened in a new tab via middle-click/scroll button)
    const initialHash = window.location.hash ? window.location.hash.toLowerCase() : null;
    if (initialHash) {
        // Clear the hashtag from URL immediately so it never stays in the address bar
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    function scrollToSection(targetSelector, smooth = true) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        const st = window.horizontalScrollTrigger;
        const isDesktop = window.innerWidth > 768;
        const duration = smooth ? 1 : 0;

        if (target.classList.contains('horizontal-section') && isDesktop && st) {
            ScrollTrigger.refresh();
            const targetY = st.start + target.offsetLeft;
            gsap.to(window, { scrollTo: targetY, duration: duration, ease: 'power2.inOut' });
        } else if (isDesktop && st) {
            const targetY = target.getBoundingClientRect().top + window.scrollY;
            gsap.to(window, { scrollTo: targetY, duration: duration, ease: 'power2.inOut' });
        } else {
            gsap.to(window, { scrollTo: { y: target, offsetY: 72 }, duration: duration, ease: 'power2.inOut' });
        }
    }

    // =========================================================
    // 3. SMOOTH SCROLL (NO HASH IN URL)
    // =========================================================
    document.querySelectorAll('[data-target], a[href^="#"], .logo').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetAttr = this.getAttribute('data-target') || this.getAttribute('href');

            // Logo / back-to-top link
            if (!targetAttr || targetAttr === '#' || targetAttr === 'javascript:void(0)' || this.classList.contains('logo')) {
                gsap.to(window, { scrollTo: 0, duration: 1, ease: 'power2.inOut' });
                if (window.innerWidth <= 768 && navLinks) navLinks.style.display = 'none';
                return;
            }

            const selector = targetAttr.startsWith('#') ? targetAttr : '#' + targetAttr;
            scrollToSection(selector, true);

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

        // Hint to the browser that this element will be transformed,
        // which keeps pointer-event hit-testing in sync during animation.
        mainTrack.style.willChange = 'transform';

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

        // Re-calculate all measurements after fonts & images fully load.
        // Without this, sizes computed before load can drift and cause
        // the scrub to desync, making buttons temporarily unresponsive.
        window.addEventListener('load', () => {
            ScrollTrigger.refresh();
            if (initialHash) {
                setTimeout(() => {
                    scrollToSection(initialHash, false);
                }, 100);
            }
        });

        // Cleanup: when viewport goes below 769px (mobile), zero out GSAP transforms
        return () => {
            gsap.set(mainTrack, { x: 0, clearProps: 'transform,willChange' });
            if (window.horizontalScrollTrigger) {
                window.horizontalScrollTrigger.kill();
                window.horizontalScrollTrigger = null;
            }
        };
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

    // =========================================================
    // 7. ACTIVE MENU STATE
    // =========================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a:not(.btn-primary)');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    // =========================================================
    // 8. IMPACT PANELS INTERACTION (MOBILE TAP & RADAR PILL)
    // =========================================================
    function setRadarState(panel, solved) {
        const radarTxt = panel.querySelector('.radar-txt');
        const radarPill = panel.querySelector('.radar-pill');
        if (!radarTxt || !radarPill) return;
        const lang = document.documentElement.lang === 'pt-BR' ? 'pt' : 'en';
        if (solved) {
            radarPill.classList.add('is-solved');
            radarTxt.textContent = radarTxt.getAttribute(`data-${lang}-active`) || 'Solved';
        } else {
            radarPill.classList.remove('is-solved');
            radarTxt.textContent = radarTxt.getAttribute(`data-${lang}`) || 'Problem';
        }
    }

    function updateRadarText(panel) {
        setRadarState(panel, panel.classList.contains('is-active'));
    }

    const impactPanels = document.querySelectorAll('.impact-panel');

    impactPanels.forEach(panel => {
        panel.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) return;

            const wasActive = panel.classList.contains('is-active');

            // Fecha outros cards
            impactPanels.forEach(other => {
                if (other !== panel && other.classList.contains('is-active')) {
                    other.classList.remove('is-active');
                    setRadarState(other, false);
                }
            });

            if (wasActive) {
                panel.classList.remove('is-active');
                setRadarState(panel, false);
            } else {
                panel.classList.add('is-active');
                setRadarState(panel, true);
            }
        });

        // Desktop hover: só mostra "Solved" se o card não está fixado como ativo
        panel.addEventListener('mouseenter', () => {
            if (!panel.classList.contains('is-active')) {
                setRadarState(panel, true);
            }
        });

        // Desktop: ao sair, recalcula o estado correto
        panel.addEventListener('mouseleave', () => {
            if (!panel.classList.contains('is-active')) {
                setRadarState(panel, false);
            }
        });
    });

});

