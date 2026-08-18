document.addEventListener('DOMContentLoaded', () => {
    // Language Toggle Logic
    const langToggleBtn = document.getElementById('lang-toggle');
    const langEnSpan = document.querySelector('.lang-en');
    const langPtSpan = document.querySelector('.lang-pt');
    
    let currentLang = 'en';

    function switchLanguage(lang) {
        currentLang = lang;
        
        // Update toggle button visuals
        if (lang === 'en') {
            langEnSpan.classList.add('active');
            langPtSpan.classList.remove('active');
        } else {
            langEnSpan.classList.remove('active');
            langPtSpan.classList.add('active');
        }

        // Update all elements with data-[lang] attributes
        const translatableElements = document.querySelectorAll('[data-en][data-pt]');
        
        translatableElements.forEach(el => {
            // For inputs/textareas, update placeholder if it exists instead of textContent
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // If it's a label, update text content, otherwise we'd need placeholder translations
                el.textContent = el.getAttribute(`data-${lang}`);
            } else {
                el.textContent = el.getAttribute(`data-${lang}`);
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    langToggleBtn.addEventListener('click', () => {
        const newLang = currentLang === 'en' ? 'pt' : 'en';
        switchLanguage(newLang);
    });

    // Mobile Menu Toggle (Basic implementation)
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

    // Reset inline styles on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks) {
            navLinks.style.display = '';
            navLinks.style.flexDirection = '';
            navLinks.style.position = '';
            navLinks.style.top = '';
            navLinks.style.left = '';
            navLinks.style.right = '';
            navLinks.style.background = '';
            navLinks.style.padding = '';
            navLinks.style.borderBottom = '';
        }
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
});
