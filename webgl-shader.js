/**
 * WebGL Shader Background Effect
 * Original wave animation with warm color scheme from reference
 * Uses Three.js for WebGL rendering
 */

class WebGLShaderBackground {
    constructor(canvasId = 'webgl-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('WebGL canvas not found');
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.uniforms = null;
        this.animationId = null;

        this.init();
    }

    init() {
        // Vertex Shader
        this.vertexShader = `
            attribute vec3 position;
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        // Fragment Shader - Original wave animation with warm colors
        this.fragmentShader = `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            uniform float xScale;
            uniform float yScale;
            uniform float distortion;

            void main() {
                vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
                
                float d = length(p) * distortion;
                
                float rx = p.x * (1.0 + d);
                float gx = p.x;
                float bx = p.x * (1.0 - d);

                // Original wave animation - warm white/golden tones
                float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
                float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
                float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
                
                // Warm color adjustment (more white/golden, less blue)
                r *= 1.0;
                g *= 0.95;
                b *= 0.85;
                
                gl_FragColor = vec4(r, g, b, 1.0);
            }
        `;

        this.initScene();
        this.animate();
        window.addEventListener('resize', () => this.handleResize());
    }

    initScene() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(new THREE.Color(0x000000));

        // Create orthographic camera
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

        // Create uniforms - original values for wave animation
        this.uniforms = {
            resolution: { value: [window.innerWidth, window.innerHeight] },
            time: { value: 0.0 },
            xScale: { value: 1.0 },
            yScale: { value: 0.5 },
            distortion: { value: 0.05 }
        };

        // Create geometry (full-screen quad)
        const position = [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, -1.0, 0.0,
            -1.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ];

        const positions = new THREE.BufferAttribute(new Float32Array(position), 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', positions);

        // Create shader material
        const material = new THREE.RawShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms: this.uniforms,
            side: THREE.DoubleSide
        });

        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Initial resize
        this.handleResize();
    }

    animate() {
        if (this.uniforms) {
            this.uniforms.time.value += 0.01;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleResize() {
        if (!this.renderer || !this.uniforms) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height, false);
        this.uniforms.resolution.value = [width, height];
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        window.removeEventListener('resize', this.handleResize);

        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        window.webglShader = new WebGLShaderBackground('webgl-canvas');
    } else {
        console.warn('Three.js not loaded. WebGL shader disabled.');
    }
});
