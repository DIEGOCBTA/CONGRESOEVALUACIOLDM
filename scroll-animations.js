/**
 * Scroll Animations using Intersection Observer
 * Creates smooth reveal animations as elements enter the viewport
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animated elements
    initScrollAnimations();
    initNavbarScroll();
    initScheduleTabs();
    initFaqAccordion();
    initLanguageSelector();
    initBadgeGenerator();
});

/**
 * Initialize scroll-triggered animations
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;

                setTimeout(() => {
                    element.classList.add('animate-in');
                }, delay * 1000);

                // Unobserve after animation
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Navbar scroll effect - add background on scroll
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.nav-bar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Schedule tabs functionality
 */
function initScheduleTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const days = document.querySelectorAll('.schedule-day');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const day = tab.dataset.day;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding day
            days.forEach(d => {
                d.classList.remove('active');
                if (d.dataset.day === day) {
                    d.classList.add('active');
                    // Re-animate items
                    d.querySelectorAll('[data-animate]').forEach(item => {
                        item.classList.remove('animate-in');
                        setTimeout(() => {
                            item.classList.add('animate-in');
                        }, 100);
                    });
                }
            });
        });
    });
}

/**
 * FAQ accordion functionality
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Language selector functionality with Automatic Translation
 */
function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;

            // Update active UI
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Trigger Automatic Translation
            applyTranslations(lang);

            // Save preference
            localStorage.setItem('congress-lang', lang);
        });
    });

    // Initial check for saved language
    const savedLang = localStorage.getItem('congress-lang') || 'es';

    // Apply local dictionary immediately (faster than waiting for Google)
    applyLocalTranslations(savedLang);

    // Sync UI button
    langButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.lang === savedLang);
    });

    // Wait for Google Translate to be ready
    const checkInterval = setInterval(() => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            clearInterval(checkInterval);
            console.log("Translation Engine Loaded.");
            // Force engine to match saved language
            applyTranslations(savedLang);
        }
    }, 1000);
}

/**
 * Apply translations manually from the local dictionary (translations.js)
 */
function applyLocalTranslations(lang) {
    if (!window.I18N_DATA || !window.I18N_DATA[lang]) return;

    const data = window.I18N_DATA[lang];
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (data[key]) {
            // Check if it's an input with placeholder or a normal element
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder) el.placeholder = data[key];
            } else {
                el.innerHTML = data[key];
            }
        }
    });

    // Handle special cases like speakertopics or dynamically generated content if needed
    console.log(`Applied dictionary translations for: ${lang}`);
}

/**
 * Bridge to Translation System
 * Full Google Translate integration for 100% coverage
 */
function applyTranslations(lang) {
    console.log(`Switching language to: ${lang}`);

    // 1. Local Dictionary First (Instant)
    applyLocalTranslations(lang);

    // 2. Trigger Google Translate Engine (Backup for full coverage)
    const triggerEngine = () => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            // Only trigger if different or to force refresh
            if (combo.value !== lang) {
                combo.value = lang;
                const event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, true);
                combo.dispatchEvent(event);
            }
        } else {
            // Re-check frequently if not ready
            setTimeout(triggerEngine, 100);
        }
    };
    triggerEngine();

    // 3. Local State & Events
    document.documentElement.lang = lang;
    window.currentLanguage = lang;
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    localStorage.setItem('congress-lang', lang);
}

// Export for compatibility
window.currentLanguage = 'es';

/**
 * Badge Generator Logic
 * Handles the virtual ID card creation and download
 */
function initBadgeGenerator() {
    const modal = document.getElementById("badge-modal");
    const openBtn = document.getElementById("open-badge-modal");
    const closeBtn = document.getElementById("close-badge-modal");
    const downloadBtn = document.getElementById("download-badge-btn");

    console.log("Badge Generator Init attempt...");
    console.log("Modal:", modal);
    console.log("OpenBtn:", openBtn);

    if (!modal || !openBtn) {
        console.error("Badge elements not found!");
        return;
    }

    // Open Modal
    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
        generateRandomID();
    });

    // Close Modal
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Close on click outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Live Preview Updates
    const nameInput = document.getElementById("badge-name-input");
    const roleInput = document.getElementById("badge-role-input");
    const nameDisplay = document.getElementById("badge-name-display");
    const roleDisplay = document.getElementById("badge-role-display");
    const initialsDisplay = document.getElementById("badge-initials");

    nameInput.addEventListener("input", (e) => {
        const val = e.target.value;
        nameDisplay.textContent = val || "Tu Nombre";

        // Update initials
        if (val) {
            const parts = val.trim().split(" ");
            let initials = parts[0][0];
            if (parts.length > 1 && parts[parts.length - 1][0]) {
                initials += parts[parts.length - 1][0];
            }
            initialsDisplay.textContent = initials.toUpperCase();
        } else {
            initialsDisplay.textContent = "JP";
        }
    });

    roleInput.addEventListener("change", (e) => {
        roleDisplay.textContent = e.target.value;
    });

    // Random ID Generator
    function generateRandomID() {
        const idDisplay = document.getElementById("badge-random-id");
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        idDisplay.textContent = `MX-2026-${randomNum}`;
    }

    // Download Logic (using html2canvas)
    downloadBtn.addEventListener("click", () => {
        const badgeElement = document.getElementById("virtual-badge");

        // Show loading state
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = "Generando...";
        downloadBtn.style.opacity = "0.7";

        html2canvas(badgeElement, {
            scale: 2, // High resolution
            backgroundColor: null,
            useCORS: true
        }).then(canvas => {
            // Create download link
            const link = document.createElement("a");
            link.download = `Pase_Virtual_CBTa197.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();

            // Reset button
            downloadBtn.textContent = originalText;
            downloadBtn.style.opacity = "1";
        }).catch(err => {
            console.error("Error generating badge:", err);
            downloadBtn.textContent = "Error";
        });
    });
}

