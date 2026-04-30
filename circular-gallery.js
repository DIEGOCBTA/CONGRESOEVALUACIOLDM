/**
 * Circular Gallery 3D
 */

class CircularGallery {
    constructor(containerId, items, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.items = items;
        this.radius = options.radius || 450;
        this.autoRotateSpeed = options.autoRotateSpeed || 0.05;
        this.background = options.background || null;
        this.rotation = 0;
        this.targetRotation = 0;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.isInitialized = false;

        this.init();
    }

    init() {
        this.createDOM();
        this.setupEvents();
        requestAnimationFrame(() => {
            this.isInitialized = true;
            this.animate();
        });
    }

    createDOM() {
        this.container.classList.add('circular-gallery-stage');
        this.stage = document.createElement('div');
        this.stage.className = 'circular-gallery-inner';

        const anglePerItem = 360 / this.items.length;

        this.items.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'circular-gallery-card';

            const mediaContent = item.image
                ? `<img src="${item.image}" alt="${item.name}" class="gallery-card-photo" style="${item.pos ? `object-position: ${item.pos}` : ''}">`
                : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                   </svg>
                   <span>${item.name.split(' ')[0]}</span>`;

            card.innerHTML = `
                <div class="gallery-card-content">
                    <div class="gallery-card-image-placeholder">
                        ${mediaContent}
                    </div>
                    <div class="gallery-card-info">
                        <h3>${item.name}</h3>
                        <span class="gallery-card-role" ${item.roleKey ? `data-i18n="${item.roleKey}"` : ''}>${item.role}</span>
                        <p class="gallery-card-topic" ${item.topicKey ? `data-i18n="${item.topicKey}"` : ''}>"${item.topic}"</p>
                    </div>
                </div>
            `;
            this.stage.appendChild(card);
        });

        this.container.appendChild(this.stage);
    }

    setupEvents() {
        const wrapper = this.container.closest('.gallery-pin-wrapper');
        if (!wrapper) return;

        const handleScroll = () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const rect = wrapper.getBoundingClientRect();
            const wrapperTop = scrollY + rect.top;
            const wrapperHeight = wrapper.offsetHeight;
            const viewportHeight = window.innerHeight;

            // Simple robust progress calculation
            let progress = (scrollY - wrapperTop) / (wrapperHeight - viewportHeight);
            progress = Math.max(0, Math.min(1, progress));

            this.targetRotation = progress * 720;
            this.isScrolling = true;

            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

            if (this.background && typeof this.background.updateScroll === 'function') {
                this.background.updateScroll(progress);
            }

            // Audio logic
            if (progress > 0 && progress < 1) {
                if (window.audioSys && window.audioSys.startWindLoop) window.audioSys.startWindLoop();
            } else {
                if (window.audioSys && window.audioSys.stopWindLoop) window.audioSys.stopWindLoop();
            }

            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
                if (window.audioSys && window.audioSys.stopWindLoop) window.audioSys.stopWindLoop();
            }, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Sync immediately and after all scripts/layouts settle
        handleScroll();
        window.addEventListener('load', handleScroll);
        setTimeout(handleScroll, 100);
        setTimeout(handleScroll, 500);
    }

    animate() {
        if (!this.isInitialized) return;

        // 3D Animation restored for ALL devices
        if (!this.isScrolling) {
            this.targetRotation += this.autoRotateSpeed;
        }

        // Smooth physics interpolation
        this.rotation += (this.targetRotation - this.rotation) * 0.08;
        this.stage.style.transform = `rotateY(${this.rotation}deg)`;

        const cards = this.stage.querySelectorAll('.circular-gallery-card');
        const anglePerItem = 360 / this.items.length;

        cards.forEach((card, i) => {
            const itemAngle = i * anglePerItem;
            const relativeAngle = (itemAngle + (this.rotation % 360) + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);

            const opacity = Math.max(0.1, 1 - (normalizedAngle / 120));
            const scale = Math.max(0.7, 1 - (normalizedAngle / 400));

            card.style.opacity = opacity;
            card.style.transform = `rotateY(${itemAngle}deg) translateZ(${this.radius}px) scale(${scale})`; // Usar radius dinámico
            card.style.zIndex = Math.round(opacity * 100);
        });

        requestAnimationFrame(() => this.animate());
    }
}
