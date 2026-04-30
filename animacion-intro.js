document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('intro-overlay');
    const shine = document.getElementById('shine');
    const animLogo = document.getElementById('anim-logo');
    const finalLogo = document.getElementById('final-logo-target'); // Tu logo en el navbar
    const animContainer = document.querySelector('.anim-container');

    if (!overlay || !animLogo || !finalLogo) return;

    // SECUENCIA DE TIEMPO

    // 1. Brillo (0.5s)
    setTimeout(() => {
        shine.classList.add('shine-active');
    }, 500);

    // 2. Convertir a Dorado (1.3s)
    setTimeout(() => {
        animLogo.classList.add('logo-gold');
    }, 1300);

    // 3. Mover al Navbar (2.0s)
    setTimeout(() => {
        overlay.classList.add('bg-transparent');
        moveLogoToNavbar();
    }, 2000);

    // FUNCIÓN PRINCIPAL DE MOVIMIENTO
    function moveLogoToNavbar() {
        // Coordenadas iniciales (Centro pantalla)
        const startRect = animLogo.getBoundingClientRect();
        // Coordenadas finales (Tu navbar)
        const finalRect = finalLogo.getBoundingClientRect();

        // Fijar posición inicial para la transición
        animLogo.style.position = 'fixed';
        animLogo.style.left = `${startRect.left}px`;
        animLogo.style.top = `${startRect.top}px`;
        animLogo.style.width = `${startRect.width}px`;
        animLogo.style.height = `${startRect.height}px`;
        animLogo.style.margin = '0';
        animLogo.style.transform = 'none';

        // Mover al body/overlay directo para que no dependa del contenedor
        overlay.appendChild(animLogo);
        if (animContainer) animContainer.style.display = 'none';

        // Forzar repintado (Reflow) necesario para CSS transitions
        void animLogo.offsetWidth;

        // Transición suave
        animLogo.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

        // Aplicar coordenadas finales
        animLogo.style.left = `${finalRect.left}px`;
        animLogo.style.top = `${finalRect.top}px`;
        animLogo.style.width = `${finalRect.width}px`;
        animLogo.style.height = `${finalRect.height}px`;

        // OPCIONAL: Si quieres que al llegar al navbar pierda el dorado y sea el original:
        animLogo.style.filter = 'sepia(0%) saturate(100%) hue-rotate(0deg) brightness(1)';
    }

    // 4. Limpieza final (3.2s)
    setTimeout(() => {
        // Desvanecer logo animado
        animLogo.style.opacity = '0';
        // Aparecer logo real del navbar
        finalLogo.style.opacity = '1';
        finalLogo.classList.remove('inicial-oculto');

        // Quitar overlay
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }, 3200);
});