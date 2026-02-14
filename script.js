/**
 * tranzyNote - Production-Grade JavaScript
 * Advanced interactions and animations
 */

'use strict';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    scrollThreshold: 100,
    animationDelay: 100,
    counterDuration: 2000,
    cursorFollowSpeed: 0.15
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ============================================
// LOADING SCREEN
// ============================================
class LoadingScreen {
    constructor() {
        this.element = document.getElementById('loadingScreen');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 500);
        });
    }

    hide() {
        if (this.element) {
            this.element.classList.add('hidden');
            setTimeout(() => {
                this.element.style.display = 'none';
            }, 400);
        }
    }
}

// ============================================
// CUSTOM CURSOR
// ============================================
class CustomCursor {
    constructor() {
        this.dot = document.querySelector('[data-cursor-dot]');
        this.outline = document.querySelector('[data-cursor-outline]');

        if (!this.dot || !this.outline) return;

        this.position = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Animate cursor
        this.animate();

        // Add hover effects
        this.addHoverEffects();
    }

    animate() {
        // Smooth follow for outline
        this.position.x += (this.mouse.x - this.position.x) * CONFIG.cursorFollowSpeed;
        this.position.y += (this.mouse.y - this.position.y) * CONFIG.cursorFollowSpeed;

        // Update dot (instant)
        if (this.dot) {
            this.dot.style.left = `${this.mouse.x}px`;
            this.dot.style.top = `${this.mouse.y}px`;
        }

        // Update outline (smooth)
        if (this.outline) {
            this.outline.style.left = `${this.position.x}px`;
            this.outline.style.top = `${this.position.y}px`;
        }

        requestAnimationFrame(() => this.animate());
    }

    addHoverEffects() {
        const interactiveElements = document.querySelectorAll('a, button, .btn, .feature-card, .faq-question-modern');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.outline) {
                    this.outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    this.outline.style.opacity = '0.3';
                }
            });

            el.addEventListener('mouseleave', () => {
                if (this.outline) {
                    this.outline.style.transform = 'translate(-50%, -50%) scale(1)';
                    this.outline.style.opacity = '0.5';
                }
            });
        });
    }
}

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileToggle = document.getElementById('mobileMenuToggle');
        this.navMenu = document.getElementById('navMenu');
        this.lastScroll = 0;

        this.init();
    }

    init() {
        // Scroll effects
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));

        // Smooth scroll for anchor links
        this.setupSmoothScroll();

        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu?.contains(e.target) && !this.mobileToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    handleScroll() {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > CONFIG.scrollThreshold) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }

        this.lastScroll = currentScroll;
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const navHeight = this.navbar?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - navHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    this.closeMobileMenu();
                }
            });
        });
    }

    toggleMobileMenu() {
        this.navMenu?.classList.toggle('active');
        this.mobileToggle?.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    closeMobileMenu() {
        this.navMenu?.classList.remove('active');
        this.mobileToggle?.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

// ============================================
// ANIMATION ON SCROLL (AOS)
// ============================================
class AnimateOnScroll {
    constructor() {
        this.elements = document.querySelectorAll('[data-aos]');
        this.options = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        this.init();
    }

    init() {
        if (!this.elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.aosDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('aos-animate');
                    }, delay);

                    // Optional: Unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, this.options);

        this.elements.forEach(el => observer.observe(el));
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('[data-target]');
        this.animated = new Set();
        this.init();
    }

    init() {
        if (!this.counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animateCounter(entry.target);
                    this.animated.add(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = CONFIG.counterDuration;
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;

            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    }
}

// ============================================
// ANIMATED TEXT ANNOUNCEMENT
// ============================================
class AnimatedTextAnnouncement {
    constructor() {
        this.element = document.getElementById('animatedText');
        this.text = '📢 Now Available on Windows, macOS & Linux | Mobile App Coming Next';
        this.init();
    }

    init() {
        if (!this.element) return;

        // Split text into words
        const words = this.text.split(' ');

        // Clear the element
        this.element.innerHTML = '';

        // Add each word with animation delay
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            span.style.animationDelay = `${index * 0.15}s`;
            this.element.appendChild(span);
        });
    }
}

// ============================================
// TRUST BAR ANIMATION
// ============================================
class TrustBarAnimation {
    constructor() {
        this.container = document.getElementById('trustLogos');
        this.init();
    }

    init() {
        if (!this.container) return;

        // Clone the logos to create seamless loop
        const logos = Array.from(this.container.children);
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            this.container.appendChild(clone);
        });

        // Start the animation
        this.animate();
    }

    animate() {
        let scrollPosition = 0;
        const speed = 0.5; // pixels per frame

        const scroll = () => {
            scrollPosition += speed;

            // Reset when scrolled halfway (since we duplicated the content)
            const maxScroll = this.container.scrollWidth / 2;
            if (scrollPosition >= maxScroll) {
                scrollPosition = 0;
            }

            this.container.style.transform = `translateX(-${scrollPosition}px)`;
            requestAnimationFrame(scroll);
        };

        scroll();
    }
}

// ============================================
// FAQ ACCORDION
// ============================================
class FAQ {
    constructor() {
        this.items = document.querySelectorAll('.faq-item-modern');
        this.init();
    }

    init() {
        this.items.forEach(item => {
            const question = item.querySelector('.faq-question-modern');

            question?.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all items
                this.items.forEach(i => i.classList.remove('active'));

                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
}

// ============================================
// PARALLAX EFFECT
// ============================================
class Parallax {
    constructor() {
        this.orbs = document.querySelectorAll('.gradient-orb');
        this.init();
    }

    init() {
        if (!this.orbs.length) return;

        window.addEventListener('scroll', throttle(() => {
            const scrolled = window.pageYOffset;

            this.orbs.forEach((orb, index) => {
                const speed = 0.3 + (index * 0.1);
                const yPos = -(scrolled * speed);
                orb.style.transform = `translateY(${yPos}px)`;
            });
        }, 10));
    }
}

// ============================================
// MOUSE MOVE PARALLAX
// ============================================
class MouseParallax {
    constructor() {
        this.hero = document.getElementById('hero');
        this.mockup = document.querySelector('.mockup-window');
        this.init();
    }

    init() {
        if (!this.hero || !this.mockup) return;

        this.hero.addEventListener('mousemove', throttle((e) => {
            const { clientX, clientY } = e;
            const { offsetWidth, offsetHeight } = this.hero;

            const xPos = (clientX / offsetWidth - 0.5) * 20;
            const yPos = (clientY / offsetHeight - 0.5) * 20;

            this.mockup.style.transform = `
                perspective(1500px)
                rotateY(${xPos * 0.1}deg)
                rotateX(${-yPos * 0.1}deg)
            `;
        }, 10));

        this.hero.addEventListener('mouseleave', () => {
            this.mockup.style.transform = 'perspective(1500px) rotateY(0deg) rotateX(0deg)';
        });
    }
}

// ============================================
// FORM HANDLING (if needed)
// ============================================
class FormHandler {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate
        if (!this.validate(data)) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Submit (implement your API call here)
        console.log('Form submitted:', data);
        this.showSuccess('Form submitted successfully!');
        form.reset();
    }

    validate(data) {
        // Add your validation logic here
        return Object.values(data).every(value => value.trim() !== '');
    }

    showError(message) {
        // Implement error notification
        console.error(message);
    }

    showSuccess(message) {
        // Implement success notification
        console.log(message);
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Preload critical resources
        this.preloadResources();

        // Lazy load images
        this.lazyLoadImages();

        // Reduce motion for users who prefer it
        this.respectReducedMotion();
    }

    preloadResources() {
        // Preload critical fonts (already done in HTML)
        // Add more preload logic here if needed
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }

    respectReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Disable animations
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-base', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');

            // Remove animation classes
            document.querySelectorAll('[data-aos]').forEach(el => {
                el.removeAttribute('data-aos');
                el.classList.add('aos-animate');
            });
        }
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================
class KeyboardNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Skip to main content
        this.setupSkipLink();

        // Trap focus in modals (if any)
        this.setupFocusTrap();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupSkipLink() {
        // Add skip to content link for accessibility
        const skipLink = document.createElement('a');
        skipLink.href = '#features';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-600);
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10001;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    setupFocusTrap() {
        // Implement focus trap for modals if needed
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close mobile menu
            if (e.key === 'Escape') {
                const nav = new Navigation();
                nav.closeMobileMenu();
            }
        });
    }
}

// ============================================
// ANALYTICS (Google Analytics, etc.)
// ============================================
class Analytics {
    constructor() {
        this.init();
    }

    init() {
        // Track CTA clicks
        this.trackCTAClicks();

        // Track scroll depth
        this.trackScrollDepth();

        // Track time on page
        this.trackTimeOnPage();
    }

    trackCTAClicks() {
        const ctaButtons = document.querySelectorAll('.btn-primary, .btn-outline');

        ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const label = btn.textContent.trim();
                this.sendEvent('CTA Click', { label });
            });
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', throttle(() => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset;
            const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;

                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !tracked.has(milestone)) {
                        this.sendEvent('Scroll Depth', { value: milestone });
                        tracked.add(milestone);
                    }
                });
            }
        }, 500));
    }

    trackTimeOnPage() {
        const startTime = Date.now();

        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.sendEvent('Time on Page', { value: timeSpent });
        });
    }

    sendEvent(action, params = {}) {
        // Implement your analytics tracking here
        // Example: Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', action, params);
        }

        // Debug log
        console.log('Analytics Event:', action, params);
    }
}

// ============================================
// ERROR HANDLING
// ============================================
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e);
            // Send to error tracking service (e.g., Sentry)
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e);
            // Send to error tracking service
        });
    }
}

// ============================================
// GIF CONTINUOUS LOOP
// ============================================
class GifLooper {
    constructor() {
        this.gifElements = document.querySelectorAll('.timeline-gif');
        if (this.gifElements.length === 0) return;

        this.init();
    }

    init() {
        this.gifElements.forEach(gif => {
            // Store original src
            const originalSrc = gif.src;

            // Force reload every few seconds to ensure continuous loop
            setInterval(() => {
                // Add timestamp to force reload
                const timestamp = new Date().getTime();
                gif.src = originalSrc + '?t=' + timestamp;
            }, 5000); // Reload every 5 seconds to ensure it keeps playing

            // Also reload on error
            gif.addEventListener('error', () => {
                setTimeout(() => {
                    gif.src = originalSrc;
                }, 100);
            });
        });
    }
}

// ============================================
// MODE TOGGLE (DETECTABLE/INCOGNITO)
// ============================================
class ModeToggle {
    constructor() {
        this.toggleBtn = document.getElementById('modeToggle');
        this.body = document.body;
        this.isIncognito = false;

        if (!this.toggleBtn) return;

        this.init();
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.toggle());

        // Optional: Add keyboard shortcut (Ctrl/Cmd + I)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isIncognito = !this.isIncognito;

        if (this.isIncognito) {
            this.body.classList.add('incognito-mode');
            console.log('🔒 Incognito mode activated');
        } else {
            this.body.classList.remove('incognito-mode');
            console.log('👁️ Detectable mode activated');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        try {
            // Core modules
            new LoadingScreen();
            new CustomCursor();
            new Navigation();
            new ModeToggle();
            new GifLooper();

            // Animation modules
            new AnimateOnScroll();
            new CounterAnimation();
            new Parallax();
            new MouseParallax();

            // Interaction modules
            new AnimatedTextAnnouncement();
            new TrustBarAnimation();
            new FAQ();
            new FormHandler();

            // Optimization modules
            new PerformanceOptimizer();
            new KeyboardNavigation();

            // Analytics & tracking
            new Analytics();
            new ErrorHandler();

            console.log('✅ tranzyNote initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }
}

// Start the application
new App();

// ============================================
// EXPORT FOR MODULE USAGE (if needed)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Navigation,
        AnimateOnScroll,
        CounterAnimation,
        FAQ,
        Parallax,
        CustomCursor
    };
}
