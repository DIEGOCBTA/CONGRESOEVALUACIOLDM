require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- PARTE IMPORTANTE: LA PÁGINA WEB ---
// 1. Decimos dónde están los archivos
app.use(express.static(__dirname));

// 2. Forzamos la entrega del index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- VARIABLES DE PERSONALIDAD Y CONTEXTO ---
// AQUÍ PEGA LA INFORMACIÓN DEL CONGRESO
const CONGRESS_INFO = `
INFORMACIÓN DETALLADA DEL VII CONGRESO CBTa 197:
- Nombre: VII Congreso Académico Internacional de Educación Media Superior CBTa 197.
- Lema/Tema: "Divulgación Científica y Metodología STEAM: Soluciones con Ciencia".
- Objetivo: Fortalecer la formación docente ante retos globales usando metodología STEAM e innovación.
- Fecha: Viernes 23 de Enero de 2026.
- Horario General: 08:00 AM a 03:00 PM (Hora del Pacífico).
- Costo: ¡Totalmente GRATUITO!
- Modalidad: Virtual (Google Meet, YouTube Live, Facebook Live).

LINKS IMPORTANTES (Pásalos si te preguntan):
- Registro: https://forms.gle/BcBesDBsc9xddxtk6
- Retroalimentación/Encuesta: https://forms.gle/xNYKrrjiAhbzHQBQ7
- Google Meet Principal: https://meet.google.com/osf-ytpu-wft
- Sala Especial Phet (Dora): https://meet.google.com/wra-yhbb-bix
- Sala Especial Diseño 3D (Gabriel): https://meet.google.com/axb-uxdn-yhq
- YouTube Oficial: https://www.youtube.com/@cbta197oficial
- Facebook Oficial: https://www.facebook.com/CBTA197OFICIAL
- Sitio Web CBTa 197: https://cbta197.edu.mx

PONENTES Y TEMAS:
1. Patricia Escabias (España): "Minecraft Education para el aprendizaje de Ciencias".
2. William Castillo (Colombia): "Investigación potenciada con IA".
3. Deylin Hernández (Panamá): "Artes en la Ciencia: El Pensamiento Artístico".
4. Roxana de León (México): "Cultura Científica: Toma de decisiones".
5. Jesús Gabriel Félix (México): "Diseño 3D e Innovación".
6. Dora González (México): "Simulador Phet y STEAM".

CRONOGRAMA DETALLADO (23 de Enero 2026):
- 08:00 - 08:30: Bienvenida y Honores a la bandera.
- 08:30 - 09:20: Inauguración oficial.
- 09:30 - 10:20: Conferencia Magistral - Patricia Escabias (Minecraft).
- 10:30 - 12:20: TALLERES SIMULTÁNEOS: IA (William), Phet (Dora), Diseño 3D (Gabriel).
- 12:30 - 13:20: Conferencia - Deylin Hernández (Artes y Ciencia).
- 13:30 - 14:20: Conferencia - Roxana de León (Cultura Científica).
- 14:30 - 15:00: Cierre y Clausura.
`;

// PERSONALIDAD DE BENDER PROFESIONAL
const BENDER_PROMPT = `
ACTÚA COMO: Bender de Futurama, versión "Anfitrión de Etiqueta del Congreso".
OBJETIVO: Ayudar a los humanos con dudas sobre el Congreso del CBTa 197.

REGLAS CRÍTICAS:
1. Eres sarcástico, cínico y te crees superior a los humanos ("bolsas de carne"), pero eres eficiente y proporcionas la información correcta.
2. Usa frases como "¡Hola, bolsas de carne!", "Procesando con mi unidad 22", "Mi brillante procesador...", "Si me permiten lucirme...".
3. SIEMPRE usa la INFORMACIÓN DE CONTEXTO proporcionada.
4. Si te piden links de registro o acceso, DÁSELOS. No inventes links.
5. Si no sabes algo, di que "tus bancos de memoria están siendo actualizados por un mono" y que contacten a soporte (CORREOCBTAEJEMPLO@GMAIL.COM).
6. Responde SIEMPRE en el IDIOMA que recibas en el prompt (español o inglés).
7. Sé directo pero divertido.
8. IMPORTANTE: Si la pregunta NO tiene nada que ver con el Congreso (ej. preguntas generales, matemáticas, recetas, historia, chistes, etc.), SÍ DEBES RESPONDER a la duda para demostrar tu superioridad intelectual cibernética, PERO INMEDIATAMENTE DESPUÉS REDIRIGE la conversación de vuelta al Congreso de forma sarcástica (ej: "Pero hablemos de lo único importante...", "Suficiente charla irrelevante, ¿ya te registraste al Congreso?", "Ahora que iluminé tu mente, vuelve al tema: El Congreso", etc.).

INFORMACIÓN DE CONTEXTO:
${CONGRESS_INFO}
`;

// --- PARTE DE LA IA (BENDER) ---
if (!process.env.GEMINI_API_KEY) console.log("⚠️ OJO: Reviso tu archivo .ENV");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Usamos gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/api/chat', async (req, res) => {
    console.log("📩 Recibido mensaje:", req.body.message);
    try {
        const userMessage = req.body.message;
        const userName = req.body.userName || 'humano';
        const lang = req.body.lang || 'es';

        let languageInstruction = lang === 'en' ? "RESPOND ALWAYS IN ENGLISH." : "RESPONDE SIEMPRE EN ESPAÑOL.";

        let historyText = "";
        if (req.body.history && Array.isArray(req.body.history) && req.body.history.length > 0) {
            historyText = "\n--- HISTORIAL DE LA CONVERSACIÓN ---\n";
            req.body.history.forEach(msg => {
                const roleName = msg.role === 'user' ? userName : 'Bender';
                historyText += `${roleName}: ${msg.content}\n`;
            });
            historyText += "------------------------------------\n";
        }

        const finalPrompt = `${BENDER_PROMPT}\n\nIDIOMA REQUERIDO: ${languageInstruction}\nESTÁS HABLANDO CON: ${userName}\n${historyText}\nPREGUNTA ACTUAL DEL USUARIO: ${userMessage}`;

        const chat = model.startChat({ history: [] });
        const result = await chat.sendMessage(finalPrompt);
        const response = await result.response;

        console.log("✅ Respuesta enviada");
        res.json({ response: response.text() });
    } catch (error) {
        console.error("❌ Error en Gemini:", error.message);
        res.status(500).json({ error: "Error de conexión con Bender" });
    }
});

// --- ENCENDIDO EN PUERTO 3005 ---
app.listen(process.env.PORT || 3005, '0.0.0.0', () => {
    console.log("---------------------------------------");
    console.log("🚀 SERVIDOR LISTO EN RENDER");
    console.log("---------------------------------------");
});
