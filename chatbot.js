/**
 * AI Chatbot with Google Gemini Integration & Smart Fallback
 * Tries to use AI first, falls back to advanced pattern matching if API fails
 */

// --- CONFIGURACIÓN CLAVE ---
// Esta es la ruta a TU servidor.
let API_URL = '/api/chat'; // Por defecto para Render o cualqueir Node.js
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Para probar localmente si usas LIVE SERVER en otro puerto
    API_URL = 'http://localhost:3005/api/chat';
}

// Configuración general
let currentLang = 'es';
let conversationHistory = [];
let audioHola;
let audioPregunta;
let audioAdios;

const intents = {
    schedule: {
        patterns: ['cuando', 'cuándo', 'fecha', 'horario', 'when', 'date', 'time', 'hora', 'cronograma'],
        response: (lang) => lang === 'en'
            ? `📅 The event is on **Friday, January 23, 2026**, from 8:00 AM to 3:00 PM (PT). Don't be late!`
            : `📅 El evento es el **Viernes 23 de Enero de 2026**, de 8:00 a 15:00 hrs (Pacífico). ¡No llegues tarde!`
    },
    speakers: {
        patterns: ['ponente', 'speaker', 'quien', 'who', 'expositores', 'invitados'],
        response: (lang) => lang === 'en'
            ? `👥 We have experts like **Patricia Escabias** (Spain), **William Castillo** (Colombia), **Deylin Hernández** (Panama), **Roxana de León** (Mexico), **Jesús Gabriel Félix** and **Dora González**.`
            : `👥 Tenemos expertos como **Patricia Escabias** (España), **William Castillo** (Colombia), **Deylin Hernández** (Panamá), **Roxana de León** (México), **Jesús Gabriel Félix** y **Dora González**.`
    },
    register: {
        patterns: ['registro', 'registrar', 'precio', 'costo', 'register', 'price', 'cost', 'donde', 'dónde', 'link', 'enlace', 'inscripción'],
        response: (lang) => lang === 'en'
            ? `📝 The event is **FREE**! Register here: https://forms.gle/BcBesDBsc9xddxtk6 \nFeedback link: https://forms.gle/xNYKrrjiAhbzHQBQ7`
            : `📝 El evento es **GRATUITO**. Regístrate aquí: https://forms.gle/BcBesDBsc9xddxtk6 \nLink de retroalimentación: https://forms.gle/xNYKrrjiAhbzHQBQ7`
    },
    access: {
        patterns: ['entrar', 'meet', 'entrar', 'link', 'conectar', 'acceso', 'unirme'],
        response: (lang) => lang === 'en'
            ? `🔗 Main Google Meet: https://meet.google.com/osf-ytpu-wft \nYouTube: https://www.youtube.com/@cbta197oficial`
            : `🔗 Google Meet Principal: https://meet.google.com/osf-ytpu-wft \nYouTube: https://www.youtube.com/@cbta197oficial`
    },
    default: {
        response: (lang) => lang === 'en'
            ? `🤖 My AI circuits are a bit slow. Ask about the schedule, speakers, registration, or access links!`
            : `🤖 Mis circuitos de IA están algo lentos. ¡Pregunta por el horario, ponentes, registro o links de acceso!`
    }
};

document.addEventListener('DOMContentLoaded', initChatbot);

const BENDER_LOTTIE_PATH = 'bender-avatar.json';

function loadBenderLottie(container) {
    if (!container) return;
    return lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: BENDER_LOTTIE_PATH,
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });
}

function initChatbot() {
    audioHola = document.getElementById("audioHola");
    audioPregunta = document.getElementById("audioPregunta");
    audioAdios = document.getElementById("audioAdios");

    const toggle = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    const welcomeAvatar = document.getElementById('welcome-lottie');
    if (welcomeAvatar) loadBenderLottie(welcomeAvatar);

    toggle?.addEventListener('click', () => {
        const windowChat = document.getElementById('chatbot-window');
        const estabaAbierto = windowChat.classList.contains('active');
        windowChat.classList.toggle('active');
        const ahoraAbierto = windowChat.classList.contains('active');

        if (ahoraAbierto) {
            input?.focus();
            audioHola.pause(); audioPregunta.pause();
            audioHola.currentTime = 0; audioPregunta.currentTime = 0;

            if (window.audioSys && !window.audioSys.isMuted) {
                audioHola.play();
            }

            // Bajar música de fondo (ducking)
            if (window.audioSys) window.audioSys.fadeBackgroundMusic(0.15, 1000);
        } else if (estabaAbierto && !ahoraAbierto) {
            if (window.audioSys && !window.audioSys.isMuted) {
                audioAdios.pause(); audioAdios.currentTime = 0; audioAdios.play();
            }

            // Subir música de fondo
            if (window.audioSys) window.audioSys.fadeBackgroundMusic(0.75, 1000);
        }
    });

    closeBtn?.addEventListener('click', () => {
        const windowChat = document.getElementById('chatbot-window');
        if (windowChat.classList.contains('active')) {
            windowChat.classList.remove('active');

            if (window.audioSys && !window.audioSys.isMuted) {
                audioAdios.pause(); audioAdios.currentTime = 0; audioAdios.play();
            }

            // Subir música de fondo al cerrar
            if (window.audioSys) window.audioSys.fadeBackgroundMusic(0.75, 1000);
        }
    });

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            let val;
            if (currentLang === 'en') {
                val = chip.dataset.question === 'schedule' ? 'When is the congress?' :
                    chip.dataset.question === 'speakers' ? 'Who are the speakers?' : 'How do I register?';
            } else {
                val = chip.dataset.question === 'schedule' ? '¿Cuándo es el congreso?' :
                    chip.dataset.question === 'speakers' ? '¿Quiénes son los ponentes?' : '¿Cómo me registro?';
            }
            document.getElementById('chatbot-input').value = val;
            sendMessage();
        });
    });

    // Personalizar saludo y audios si hay nombre o idioma
    const updateChatbotAssets = () => {
        const userName = localStorage.getItem('user_name') || 'humano';
        const welcomeText = document.querySelector('#chatbot-messages .message-content p');

        if (welcomeText) {
            if (currentLang === 'en') {
                welcomeText.innerHTML = `Hey, ${userName}! I'm Bender, the glorious metallic host of the 2026 Congress. I'm here because I'm awesome… and maybe to help you. What's up?`;
                audioHola.src = "my-name-s-bender.mp3";
                audioAdios.src = "goodnight-losers.mp3";
                // En inglés no tenemos audio de pregunta, así que deshabilitamos la secuencia
                audioHola.onended = null;
            } else {
                welcomeText.innerHTML = `¡Ey, ${userName}! Soy Bender, el glorioso y metálico anfitrión del Congreso 2026. Estoy aquí porque soy increíble… y quizá para ayudarte. ¿Qué se te ofrece?`;
                audioHola.src = "HOLABENDER.mp3";
                audioAdios.src = "ADIOSBENDER.mp3";
                // En español activamos la secuencia de 2 audios
                audioHola.onended = () => { setTimeout(() => { audioPregunta.play(); }, 250); };
            }
        }
    };

    updateChatbotAssets();
    window.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        updateChatbotAssets();
    });
}

// Generate a session ID for this visit
const SESSION_ID = 'user-' + Math.random().toString(36).substring(7);

async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    input.value = '';
    showTyping();

    try {
        // 1. Intentar llamar a la IA (con timeout de seguridad)
        const response = await callAI(msg);
        removeTyping();
        addMessage(response, 'bot');
    } catch (error) {
        console.warn('AI Fallback activado:', error);
        // 2. Si falla o tarda, usar Regex (Modo Offline)
        removeTyping();
        const fallback = getFallbackResponse(msg);
        // Opcional: Mostrar un pequeño aviso de que está en modo offline
        addMessage(`${fallback}`, 'bot');
    }
}

async function callAI(userMsg) {
    conversationHistory.push({ role: 'user', content: userMsg });

    // Timeout de 20 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMsg,
                lang: currentLang,
                userName: localStorage.getItem('user_name') || 'humano'
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const data = await response.json();
        const text = data.response;

        conversationHistory.push({ role: 'assistant', content: text });
        return text;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function getFallbackResponse(msg) {
    const lower = msg.toLowerCase();
    for (let key in intents) {
        if (key === 'default') continue;
        if (intents[key].patterns.some(p => lower.includes(p))) {
            return intents[key].response(currentLang);
        }
    }
    return intents.default.response(currentLang);
}

function addMessage(text, type) {
    const div = document.createElement('div');
    const id = 'msg-' + Date.now();
    div.className = `chat-message ${type}`;

    // 1. Detectar URLs y convertirlas en links clickeables (Visualmente truncados)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text.replace(urlRegex, function (url) {
        // Limpiar signos de puntuación al final
        let cleanUrl = url.replace(/[.,!?;:)]+$/, '');

        // Truncar visualmente si es muy largo (más de 30 caracteres) para que no rompa el diseño
        let displayUrl = cleanUrl;
        if (cleanUrl.length > 30) {
            displayUrl = cleanUrl.substring(0, 27) + '...';
        }

        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" title="${cleanUrl}" style="color: var(--accent-primary); text-decoration: underline; font-weight: 500; word-break: break-all;">${displayUrl}</a>`;
    });

    // 2. Procesar Markdown (Negritas y Cursivas)
    formattedText = formattedText
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    if (type === 'bot') {
        div.innerHTML = `
            <div class="message-avatar bot-avatar"><div class="lottie-avatar" id="${id}"></div></div>
            <div class="message-content"><p>${formattedText}</p></div>
        `;
        document.getElementById('chatbot-messages').appendChild(div);
        loadBenderLottie(document.getElementById(id));
    } else {
        div.innerHTML = `
            <div class="message-avatar user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="message-content"><p>${formattedText}</p></div>
        `;
        document.getElementById('chatbot-messages').appendChild(div);
    }
    const msgs = document.getElementById('chatbot-messages');
    msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
    const div = document.createElement('div');
    div.id = 'typing';
    div.className = 'chat-message bot typing';
    const id = 'typing-lottie';
    div.innerHTML = `
        <div class="message-avatar bot-avatar"><div class="lottie-avatar" id="${id}"></div></div>
        <div class="typing-indicator"><span></span><span></span><span></span></div>
    `;
    document.getElementById('chatbot-messages').appendChild(div);
    loadBenderLottie(document.getElementById(id));
    const msgs = document.getElementById('chatbot-messages');
    msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
    document.getElementById('typing')?.remove();
}
