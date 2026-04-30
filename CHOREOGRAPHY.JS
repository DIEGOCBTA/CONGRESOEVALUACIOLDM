// --- ESTO ES LO QUE DETIENE EL RESET AUTOMÁTICO ---
// Al principio de CHOREOGRAPHY.JS
if (localStorage.getItem('form_completado') === 'true') {
    // Si el formulario está completado, detén la animación
    document.getElementById('intro-overlay').remove();
} else {
    // Solo si no ha completado el form, ejecutamos la inicialización
    initChoreography();
}

function resetState() {
    window.scrollTo(0, 0);
    const overlay = document.getElementById('intro-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
    }
    const msgs = document.querySelectorAll('.text-msg');
    msgs.forEach(msg => {
        msg.classList.remove('reveal-text', 'hide-text-prism');
        msg.style.opacity = '0';
        msg.style.display = 'block';
    });
    const portal = document.getElementById('welcome-portal');
    if (portal) {
        portal.classList.add('hidden-initial');
        portal.classList.remove('active');
    }
    window.fuegoPregunta = false;
    window.animacionLogoNuevaIniciada = false;
}

function initChoreography() {
    const canvas = document.getElementById('choreography-canvas');
    const overlay = document.getElementById('intro-overlay');
    const portal = document.getElementById('welcome-portal');

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = 2.0;
    const frustumWidth = frustumHeight * aspect;
    const camera = new THREE.OrthographicCamera(
        frustumWidth / -2, frustumWidth / 2,
        frustumHeight / 2, frustumHeight / -2,
        0.1, 100
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const vertexShader = `
        uniform float uSlide; 
        uniform float uCoilMode; 
        varying vec2 vUv;
        void main() {
            vUv = uv; 
            vec3 pos = position; 
            float r = 0.15; 
            float linearX = pos.x + uSlide;
            if (uCoilMode > 0.5) {
                vec3 pathCenter = vec3(0.0); 
                vec3 normalDir = vec3(0.0);
                if (linearX < 0.0) { 
                    pathCenter = vec3(linearX, -r, 0.0); 
                    normalDir = vec3(0.0, 1.0, 0.0);
                } else { 
                    float angle = linearX / r; 
                    float theta = -1.5708 + angle; 
                    pathCenter = vec3(cos(theta)*r, sin(theta)*r, 0.0); 
                    normalDir = vec3(-cos(theta), -sin(theta), 0.0); 
                }
                pos = pathCenter + (normalDir * position.y);
            }
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        precision highp float; 
        uniform float uHideStraight; uniform float uGeminiMode; uniform float uTime; uniform float uBrightness; 
        varying vec2 vUv;
        void main() {
            float centeredY = vUv.y - 0.5; float distToEdge = min(vUv.y, 1.0 - vUv.y);
            float thickness = 0.045; 
            float r = thickness / abs(centeredY + 0.025); 
            float g = thickness / abs(centeredY); 
            float b = thickness / abs(centeredY - 0.025);
            float intensity = (r + g + b) / 3.0;
            float solidAlpha = smoothstep(0.1, 0.8, intensity); 
            vec3 finalColor = vec3(r, g, b);
            finalColor *= smoothstep(0.0, 0.15, distToEdge);
            float cutPos = uHideStraight * 1.1; 
            float tailEater = smoothstep(cutPos, cutPos + 0.05, vUv.x);
            float circleProt = smoothstep(0.75, 0.8, vUv.x);
            float vis = max(tailEater, circleProt);
            if (uGeminiMode > 0.5) {
                float speed = 5.0 + (uBrightness * 1.5); 
                float wave = sin(vUv.x * 12.0 - uTime * speed);
                float pulse = pow(wave * 0.5 + 0.5, 2.0) * 0.4 + 0.6;
                vec3 solidGold = vec3(1.5, 1.2, 0.6); 
                float whiteMix = smoothstep(3.0, 12.0, uBrightness);
                vec3 coreColor = mix(solidGold, vec3(2.0, 2.0, 2.0), whiteMix);
                finalColor = coreColor * (g * 2.0) * (0.5 + uBrightness * 0.5);
                if (solidAlpha > 0.5) solidAlpha = 1.0; 
                if(vis > 0.5) finalColor *= pulse; 
            } else { finalColor *= 1.5; }
            gl_FragColor = vec4(finalColor, min(solidAlpha * vis, 1.0));
        }
    `;

    const uniforms = {
        uSlide: { value: 0.0 }, uCoilMode: { value: 0.0 },
        uHideStraight: { value: 0.0 }, uGeminiMode: { value: 0.0 },
        uTime: { value: 0.0 }, uBrightness: { value: 1.0 }
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthTest: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 0.15, 600, 1), material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    function animateOut(id) {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('reveal-text');
            el.classList.add('hide-text-prism');
        }
    }

    let startTime = Date.now();
    let phase = 0;
    const limitX = (frustumWidth / 2) + 6.0;
    let msg3Triggered = false;
    let loadingStartTime = 0;
    mesh.position.set(-limitX, 0.6, 0);

    function animate() {
        requestAnimationFrame(animate);
        const now = Date.now();
        const delta = (now - startTime) / 1000;
        uniforms.uTime.value = now / 1000;

        if (phase === 0) {
            const prog = Math.min(delta / 2.5, 1);
            const ease = prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
            mesh.position.x = -limitX + (limitX * 2 + 2.0) * ease;
            if (prog > 0.3) document.getElementById('msg-1').classList.add('reveal-text');
            if (prog >= 1) {
                phase = 1; startTime = Date.now();
                mesh.position.set(limitX, -0.6, 0); mesh.rotation.z = Math.PI;
                animateOut('msg-1');
            }
        }
        else if (phase === 1) {
            const prog = Math.min(delta / 2.5, 1);
            const ease = prog < 0.5 ? 2 * prog * prog : 1 - Math.pow(-2 * prog + 2, 2) / 2;
            mesh.position.x = limitX - (limitX * 2 + 2.0) * ease;
            if (prog > 0.3) document.getElementById('msg-2').classList.add('reveal-text');
            if (prog >= 1) {
                phase = 2; startTime = Date.now();
                animateOut('msg-2');
                mesh.position.set(0, 0, 0); mesh.rotation.set(0, 0, 0);
                uniforms.uCoilMode.value = 1.0; uniforms.uSlide.value = -9.0;
            }
        }
        else if (phase === 2) {
            uniforms.uSlide.value += 0.15;
            if (uniforms.uSlide.value > -3.0) { phase = 3; startTime = Date.now(); }
        }
        else if (phase === 3) {
            if (uniforms.uHideStraight.value < 1.0) uniforms.uHideStraight.value += 0.025;
            uniforms.uSlide.value += 0.15;
            if (uniforms.uHideStraight.value > 0.5) mesh.rotation.z += 0.1;
            if (uniforms.uHideStraight.value >= 1.0) {
                phase = 4; loadingStartTime = Date.now();
                uniforms.uGeminiMode.value = 1.0; uniforms.uBrightness.value = 1.5;
            }
        }
        else if (phase === 4) {
            const loadTime = (Date.now() - loadingStartTime) / 1000;

            // --- SECUENCIA DE METAMORFOSIS ---
            if (loadTime > 10.0) {
                animateOut('msg-3');
                const oldLogo = document.getElementById('escudo-final-container');
                if (oldLogo) oldLogo.style.opacity = "0";

                // EL CÍRCULO SE CENTRA
                mesh.position.y += (0.0 - mesh.position.y) * 0.1;
                mesh.scale.x += (1.6 - mesh.scale.x) * 0.05;
                mesh.scale.y += (1.6 - mesh.scale.y) * 0.05;
                mesh.rotation.z += 0.2;

                // Subida de brillo para el flash
                if (loadTime < 12.5 && !window.animacionLogoNuevaIniciada) {
                    uniforms.uBrightness.value += 0.2;
                }

                // CLÍMAX: APARECE LOGO Y SE APAGA EL CÍRCULO
                if (loadTime > 12.0 && !window.animacionLogoNuevaIniciada) {
                    window.animacionLogoNuevaIniciada = true;

                    const logoFinal = document.getElementById('final-logo-container');
                    if (logoFinal) {
                        logoFinal.classList.add('reveal-sacred-logo');

                        // Bajada de brillo inicial para revelar el logo
                        setTimeout(() => {
                            const bajarBrillo = setInterval(() => {
                                if (uniforms.uBrightness.value > 1.0) {
                                    uniforms.uBrightness.value -= 0.5;
                                } else {
                                    clearInterval(bajarBrillo);
                                }
                            }, 50);
                        }, 400);

                        // TRANSICIÓN FINAL: LOGO Y CÍRCULO SE VAN JUNTOS
                        setTimeout(() => {
                            // 1. Desaparece el círculo INSTANTÁNEAMENTE
                            uniforms.uBrightness.value = 0.0;
                            mesh.visible = false;

                            // 2. El logo inicia su animación de salida
                            logoFinal.classList.add('implode-to-portal');

                            // 3. Salto a la siguiente pantalla (reducido a 0.8s para que sea más dinámico)
                            setTimeout(() => transitionToPortal(), 800);
                        }, 3000); // Ajustado para que no se sienta largo
                    }
                }
            } else {
                // LÓGICA ORIGINAL (ESCUDO)
                mesh.rotation.z += 0.05;
                mesh.position.y += (-0.28 - mesh.position.y) * 0.08;
                mesh.scale.x += (0.5 - mesh.scale.x) * 0.05;
                mesh.scale.y += (0.5 - mesh.scale.y) * 0.05;

                if (!msg3Triggered) {
                    const logoCont = document.getElementById('escudo-final-container');
                    if (logoCont) logoCont.style.opacity = "1";
                    document.getElementById('msg-3').classList.add('reveal-text');
                    document.querySelectorAll('.path-anim').forEach(p => p.classList.add('activar-laser'));
                    const aHola = document.getElementById('audioHola');
                    if (aHola) aHola.play().catch(e => console.error("Audio bloqueado"));
                    msg3Triggered = true;
                }

                if (loadTime > 4.5 && !window.fuegoPregunta) {
                    document.querySelectorAll('.path-anim').forEach(p => p.classList.add('relleno-final'));
                    const aPreg = document.getElementById('audioPregunta');
                    if (aPreg) aPreg.play();
                    window.fuegoPregunta = true;
                }

                if (uniforms.uBrightness.value < 12.0) uniforms.uBrightness.value += 0.05;
            }
        }
        renderer.render(scene, camera);
    }

    function transitionToPortal() {
        overlay.style.transition = 'opacity 1s ease';
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            portal.classList.remove('hidden-initial');
            portal.classList.add('active');
        }, 1000);
    }

    window.addEventListener('resize', () => {
        const newAspect = window.innerWidth / window.innerHeight;
        const fw = 2.0 * newAspect;
        camera.left = -fw / 2; camera.right = fw / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animate();
}