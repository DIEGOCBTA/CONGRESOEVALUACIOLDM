/**
 * Custom Refraction Shader for Gallery Background
 */
class GalleryShaderBackground {
    constructor(canvasId = 'gallery-bg-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.init();
    }

    init() {
        this.vertexShader = `
            attribute vec3 position;
            void main() {
                gl_Position = vec4(position, 1.0);
            }
        `;

        this.fragmentShader = `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            uniform float uScrollProgress;

            void main() {
                vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
                
                // Base dark background
                vec3 color = vec3(0.002, 0.002, 0.005);
                
                // Original Wave Logic driven by Scroll
                float distortion = 0.01; // Dramatically reduced split for sobriety
                float xScale = 2.0;
                float yScale = 0.4;
                
                // MEANDERING PATHS WITH SUBTLE REFRACTION
                // Intensity tied to scroll progress
                float scrollFactor = smoothstep(0.0, 0.15, uScrollProgress) * smoothstep(1.0, 0.85, uScrollProgress);
                float intensity = 0.2 + 0.8 * scrollFactor;
                
                // Base movement driven by scroll and time
                float speed = 0.5 + uScrollProgress * 1.2;
                float totalTime = (time * 0.2) + (uScrollProgress * 2.5);
                
                // Reduced count for cleaner look (3 snakes)
                for(float i = 0.0; i < 3.0; i++) {
                    float id = i + 1.0;
                    float offset = id * 3.14; 
                    
                    // Meandering logic
                    float wiggleFreq = 1.0 + uScrollProgress * 1.5;
                    float wiggleAmp = 0.25 + uScrollProgress * 0.3;
                    
                    // Discrete segment movement
                    float pulseLength = 0.7; 
                    float pulsePos = fract(p.x * 0.15 - totalTime * speed + offset * 0.2) * 2.0 - 1.0;
                    float snakeBody = smoothstep(pulseLength, pulseLength - 0.15, abs(pulsePos));

                    // VERY SUBTLE REFRACTION (RGB Split)
                    // We calculate 3 slightly different Y positions for R, G, B
                    float refrac = 0.003; // Extremely light split
                    
                    float yR = p.y + cos((p.x + refrac) * wiggleFreq + totalTime * 0.8 + offset) * wiggleAmp + sin((p.x + refrac) * 2.5 + totalTime) * 0.1;
                    float yG = p.y + cos(p.x * wiggleFreq + totalTime * 0.8 + offset) * wiggleAmp + sin(p.x * 2.5 + totalTime) * 0.1;
                    float yB = p.y + cos((p.x - refrac) * wiggleFreq + totalTime * 0.8 + offset) * wiggleAmp + sin((p.x - refrac) * 2.5 + totalTime) * 0.1;
                    
                    // Thicker lines (smaller divisor means thicker line)
                    float thickness = 0.015; 
                    float r = thickness / (abs(yR) + 0.001);
                    float g = thickness / (abs(yG) + 0.001);
                    float b = thickness / (abs(yB) + 0.001);
                    
                    // Strictly Sacred Golden / White Base
                    vec3 baseCol = mix(vec3(1.0, 0.98, 0.95), vec3(0.95, 0.8, 0.4), sin(totalTime + offset) * 0.5 + 0.5);
                    
                    vec3 finalSnake = vec3(r * baseCol.r, g * baseCol.g, b * baseCol.b);
                    color += finalSnake * snakeBody * intensity;
                }

                // Subtle static aura to anchor the center
                float aura = 0.15 / (length(p) + 2.5);
                color += vec3(0.6, 0.5, 0.3) * aura * intensity;

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.initScene();
        this.animate();
    }

    initScene() {
        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setClearColor(0x000000, 1);

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.uniforms = {
            resolution: { value: [this.canvas.clientWidth, this.canvas.clientHeight] },
            time: { value: 0.0 },
            uScrollProgress: { value: 0.0 }
        };

        // Use standard PlaneGeometry for a cleaner full-screen quad
        const geometry = new THREE.PlaneGeometry(2, 2);

        const material = new THREE.RawShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            uniforms: this.uniforms,
            depthTest: false,
            depthWrite: false
        });

        this.scene.add(new THREE.Mesh(geometry, material));

        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
    }

    animate() {
        this.uniforms.time.value += 0.01;
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }

    updateScroll(progress) {
        if (this.uniforms) {
            this.uniforms.uScrollProgress.value = progress;
        }
    }

    handleResize() {
        const parent = this.canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        this.renderer.setSize(width, height, false);
        this.uniforms.resolution.value = [width, height];
    }
}
