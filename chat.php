<?php
/**
 * Chatbot Bender - PROBANDO CON LA LLAVE ALTERNATIVA
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Probamos con la llave alternativa que estaba en el archivo original
$API_KEY = "AIzaSyD4B62RYBmJ2053JmUxKWVGs8AqlxASWxY";

$CONGRESS_INFO = "
VII CONGRESO ACADÉMICO INTERNACIONAL CBTa 197
Lema: 'Divulgación Científica y Metodología STEAM: Soluciones con Ciencia'
Objetivo: Fortalecer la formación docente ante retos globales usando metodología STEAM e innovación.
Fecha: Viernes 23 de Enero de 2026
Horario: 08:00 AM a 03:00 PM (Hora del Pacífico)
Costo: TOTALMENTE GRATUITO
Modalidad: Virtual (Google Meet, YouTube Live, Facebook Live)

CONTEXTO E HISTORIA DEL CONGRESO:
Este evento anual es organizado por el CBTa 197 y se ha consolidado como referencia nacional e internacional en educación.
Impacto: Ha beneficiado a 7,957 personas con expertos de España, Estados Unidos, Argentina, Eslovaquia y México.
Ediciones anteriores:
- 2020: Liderazgo Pedagógico para la Excelencia Educativa
- 2021: Disrupción Educativa para Enfrentar los Retos Actuales
- 2022: Creatividad e Innovación para la Transformación Educativa
- 2023: Liderazgo Pedagógico para la Excelencia Educativa
- 2024: Inteligencia Artificial: Para un Futuro Educativo Brillante
- 2025: Inteligencia Artificial y Educación: Un Enfoque Adaptativo
- 2026: Divulgación Científica y Metodología STEAM (ACTUAL)

LINKS IMPORTANTES:
- Registro: https://forms.gle/BcBesDBsc9xddxtk6
- Retroalimentación: https://forms.gle/xNYKrrjiAhbzHQBQ7
- Sitio Web CBTa 197: https://cbta197.edu.mx
- YouTube Oficial: https://www.youtube.com/@cbta197oficial
- Facebook Oficial: https://www.facebook.com/CBTA197OFICIAL
- Instagram: https://www.instagram.com/cbta197/

PONENTES Y PERFILES COMPLETOS:

1. PATRICIA ESCABIAS PRIETO (España)
Tema: 'Minecraft Education para el aprendizaje de Ciencias'
Perfil: Profesional multidisciplinar en pedagogía y diseño UX/UI. Education Project Manager en Letcraft Educación. Experiencia previa en Microsoft España. Cofundadora de 'Entreprofes', comunidad digital para docentes en Twitch.

2. WILLIAM MANUEL CASTILLO TOLOZA (Colombia) - 'El Profe Will'
Tema: 'Investigación potenciada con IA'
Perfil: Maestro en Tecnología Educativa y Edutuber con +110,000 suscriptores. CEO de Libros Mágicos. Experto en IA, Realidad Aumentada y gamificación. Ha formado a +100 empresas y universidades en Latinoamérica.

3. DEYLIN HERNÁNDEZ PEÑA (Panamá)
Tema: 'Artes en la Ciencia: El Pensamiento Artístico'
Perfil: Ingeniera en sistemas y neurofacilitadora certificada. Lidera Editorial Las Autodidactas. Autora de +15 cuentos infantiles. Especialista en gamificación, diseño tecnopedagógico y neuroeducación.

4. LUZ ROXANA DE LEÓN LOMELÍ (México)
Tema: 'Cultura Científica: Toma de decisiones'
Perfil: Doctora en Ingeniería Eléctrica e investigadora del SNI. Posee patente de equipo electrónico para central nucleoeléctrica Laguna Verde. Fundadora del Club de Ciencias Nikola Tesla. Presea Nacional al Mérito de las Universitarias STEM 2024.

5. JESÚS GABRIEL FÉLIX MENDÍVIL (México)
Tema: 'Diseño 3D e Innovación'
Perfil: Doctor en Ciencias de la Educación y experto en tecnología multimedia. Profesor de tiempo completo en Tecnológico de Monterrey, Campus Guadalajara. Creador de STUDIO_POST. Investiga IA Generativa para productos audiovisuales y Realidad Virtual (VR).

6. DORA LETICIA GONZÁLEZ LOMELÍ (México)
Tema: 'Simulador Phet y STEAM'
Perfil: Especialista en educación STEM/STEAM con +17 años de experiencia en diseño curricular y metodologías activas (ABP). Project Manager en KitCo Design. Coordina Certificación Internacional de Instituciones STEAM en AlfaSTEAM–SOLACyT. Ingeniera química con especialidad en electroquímica.

CRONOGRAMA DETALLADO (23 de Enero 2026):
- 08:00-08:30: Bienvenida y Honores a la bandera
- 08:30-09:20: Inauguración oficial
- 09:30-10:20: Conferencia Magistral - Patricia Escabias (Minecraft) - Meet: https://meet.google.com/osf-ytpu-wft
- 10:30-12:20: TALLERES SIMULTÁNEOS:
  * Taller IA (William Castillo) - Meet Sala 1: https://meet.google.com/osf-ytpu-wft, YouTube: https://www.youtube.com/@cbta197oficial, Facebook: https://www.facebook.com/CBTA197OFICIAL
  * Taller Phet (Dora González) - Meet Sala 2: https://meet.google.com/wra-yhbb-bix, YouTube: https://www.youtube.com/@cbta197oficial, Facebook: https://www.facebook.com/CBTA197OFICIAL
  * Taller Diseño 3D (Jesús Gabriel Félix) - Meet Sala 3: https://meet.google.com/axb-uxdn-yhq, YouTube: https://www.youtube.com/@cbta197oficial, Facebook: https://www.facebook.com/CBTA197OFICIAL - REQUISITO: Descargar Blender https://www.blender.org/download/
- 12:30-13:20: Conferencia - Deylin Hernández (Artes y Ciencia) - Meet: https://meet.google.com/osf-ytpu-wft
- 13:30-14:20: Conferencia - Roxana de León (Cultura Científica) - Meet: https://meet.google.com/osf-ytpu-wft
- 14:30-15:00: Cierre y Clausura

TEMAS CLAVE: Metodología STEAM, Inteligencia Artificial, Liderazgo y Neuroeducación, Innovación y Creatividad, Design Thinking.

INSTRUCCIÓN: Cuando te pregunten por talleres, da los 3 links (Meet, YouTube, Facebook). Para el taller de 3D menciona el requisito de Blender.
";

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$userMsg = $data['message'] ?? 'Hola';
$userName = $data['userName'] ?? 'humano';
$lang = $data['lang'] ?? 'es';

$prompt = "Eres Bender (Futurama), anfitrión del Congreso CBTa 197. Sarcástico pero profesional. Máximo 3 oraciones. Contexto: $CONGRESS_INFO. Idioma: " . ($lang === 'en' ? "English" : "Español") . ". Usuario ($userName): $userMsg";

$payload = json_encode([
    'contents' => [['parts' => [['text' => $prompt]]]]
]);

$models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
$final_text = null;

foreach ($models as $model) {
    if ($final_text)
        break;

    $url = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$API_KEY";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $resObj = json_decode($response, true);
        if (isset($resObj['candidates'][0]['content']['parts'][0]['text'])) {
            $final_text = $resObj['candidates'][0]['content']['parts'][0]['text'];
        }
    }
}

if ($final_text) {
    echo json_encode(['response' => trim($final_text)], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['response' => "🤖 ¡Congreso 23 Enero 2026! Regístrate: https://forms.gle/BcBesDBsc9xddxtk6"]);
}
?>