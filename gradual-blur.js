/**
 * GradualBlur - Vanilla JS Port
 * Based on React implementation by Ansh Dhanani
 */

const GB_DEFAULT_CONFIG = {
    position: 'bottom',
    strength: 2,
    height: '6rem',
    divCount: 5,
    exponential: false,
    zIndex: 1000,
    animated: false,
    duration: '0.3s',
    easing: 'ease-out',
    opacity: 1,
    curve: 'linear',
    responsive: false,
    target: 'parent', // 'parent' or 'page'
    className: '',
    style: {}
};

const GB_PRESETS = {
    top: { position: 'top', height: '6rem' },
    bottom: { position: 'bottom', height: '6rem' },
    left: { position: 'left', height: '6rem' },
    right: { position: 'right', height: '6rem' },
    subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
    intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
    smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
    sharp: { height: '5rem', curve: 'linear', divCount: 4 },
    header: { position: 'top', height: '8rem', curve: 'ease-out' },
    footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
    sidebar: { position: 'left', height: '6rem', strength: 2.5 },
    'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
    'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
};

const GB_CURVE_FUNCTIONS = {
    linear: p => p,
    bezier: p => p * p * (3 - 2 * p),
    'ease-in': p => p * p,
    'ease-out': p => 1 - Math.pow(1 - p, 2),
    'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
};

class GradualBlur {
    constructor(target, options = {}) {
        this.targetElement = typeof target === 'string' ? document.querySelector(target) : target;

        if (!this.targetElement) {
            console.error('GradualBlur: Target element not found');
            return;
        }

        // Merge Config
        const preset = options.preset && GB_PRESETS[options.preset] ? GB_PRESETS[options.preset] : {};
        this.config = { ...GB_DEFAULT_CONFIG, ...preset, ...options };

        this.container = null;
        this.observer = null;

        this.init();

        // Handle Responsive
        if (this.config.responsive) {
            window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 100));
        }
    }

    debounce(fn, wait) {
        let t;
        return (...a) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...a), wait);
        };
    }

    handleResize() {
        // Re-render styles based on new dimensions if needed
        this.applyContainerStyles();
    }

    getGradientDirection(position) {
        const map = {
            top: 'to top',
            bottom: 'to bottom',
            left: 'to left',
            right: 'to right'
        };
        return map[position] || 'to bottom';
    }

    init() {
        // Create Container
        this.container = document.createElement('div');
        this.container.className = `gradual-blur ${this.config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${this.config.className}`;

        // Setup inner container
        this.inner = document.createElement('div');
        this.inner.className = 'gradual-blur-inner';
        this.container.appendChild(this.inner);

        // Apply Logic
        this.applyContainerStyles();
        this.createLayers();

        // Mount
        if (this.config.target === 'page') {
            document.body.appendChild(this.container);
        } else {
            // Ensure relative positioning on target if using absolute
            const computed = getComputedStyle(this.targetElement);
            if (computed.position === 'static') {
                this.targetElement.style.position = 'relative';
            }
            this.targetElement.appendChild(this.container);
        }

        // Animation / Intersection Observer
        if (this.config.animated) {
            this.container.style.opacity = '0';
            this.setupObserver();
        } else {
            this.container.style.opacity = '1';
        }
    }

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.container.style.opacity = '1';
                    if (this.config.animated === 'scroll' && this.config.onAnimationComplete) {
                        setTimeout(this.config.onAnimationComplete, parseFloat(this.config.duration) * 1000);
                    }
                } else if (this.config.animated === 'scroll') {
                    // Optionally fade out when scrolling away?
                    // React code mostly sets 'isVisible' based on intersection.
                    this.container.style.opacity = '0';
                }
            });
        }, { threshold: 0.1 });

        this.observer.observe(this.container);
    }

    applyContainerStyles() {
        const { position, zIndex, target, opacity, duration, easing, animated, style } = this.config;

        const isVertical = ['top', 'bottom'].includes(position);
        const isHorizontal = ['left', 'right'].includes(position);
        const isPageTarget = target === 'page';

        Object.assign(this.container.style, {
            position: isPageTarget ? 'fixed' : 'absolute',
            zIndex: isPageTarget ? zIndex + 100 : zIndex,
            transition: animated ? `opacity ${duration} ${easing}` : 'none',
            ...style
        });

        // Pointer events logic
        this.container.style.pointerEvents = this.config.hoverIntensity ? 'auto' : 'none';

        // Dimensions
        // Note: For vanilla, we use the config.height directly. 
        // Responsive logic could modify this.config.height dynamically.

        if (isVertical) {
            this.container.style.height = this.config.height;
            this.container.style.width = '100%';
            this.container.style[position] = '0';
            this.container.style.left = '0';
            this.container.style.right = '0';
        } else if (isHorizontal) {
            this.container.style.width = this.config.height; // Logic reuses height prop for width in vertical mode
            this.container.style.height = '100%';
            this.container.style[position] = '0';
            this.container.style.top = '0';
            this.container.style.bottom = '0';
        }

        // Remove opposing styles to be safe
        if (position === 'top') this.container.style.bottom = 'auto';
        if (position === 'bottom') this.container.style.top = 'auto';
    }

    createLayers() {
        const { divCount, strength, exponential, curve, opacity, animated, duration, easing, position } = this.config;

        this.inner.innerHTML = ''; // Clear existing

        const curveFunc = GB_CURVE_FUNCTIONS[curve] || GB_CURVE_FUNCTIONS.linear;
        const increment = 100 / divCount;

        for (let i = 1; i <= divCount; i++) {
            const layer = document.createElement('div');

            // Logic ported from React
            let progress = i / divCount;
            progress = curveFunc(progress);

            let blurValue;
            if (exponential) {
                blurValue = Math.pow(2, progress * 4) * 0.0625 * strength;
            } else {
                blurValue = 0.0625 * (progress * divCount + 1) * strength;
            }

            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round(increment * i * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

            let gradient = `transparent ${p1}%, black ${p2}%`;
            if (p3 <= 100) gradient += `, black ${p3}%`;
            if (p4 <= 100) gradient += `, transparent ${p4}%`;

            const direction = this.getGradientDirection(position);
            const maskString = `linear-gradient(${direction}, ${gradient})`;

            Object.assign(layer.style, {
                position: 'absolute',
                inset: '0',
                maskImage: maskString,
                webkitMaskImage: maskString,
                backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                webkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
                opacity: opacity,
                transition: (animated && animated !== 'scroll')
                    ? `backdrop-filter ${duration} ${easing}`
                    : 'none'
            });

            this.inner.appendChild(layer);
        }
    }
}

// Make globally available
window.GradualBlur = GradualBlur;
