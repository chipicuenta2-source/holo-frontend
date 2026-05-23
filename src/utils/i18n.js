// ══════════════════════════════════════════════════════════════
//  src/utils/i18n.js
//  Sistema de traducción simple según nivel del estudiante
// ══════════════════════════════════════════════════════════════

const traducciones = {
    // Niveles que usan español
    espanol: ['A1', 'A2'],
    // Niveles que usan mezcla
    mixto:   ['B1', 'B2'],
    // Niveles que usan inglés puro
    ingles:  ['C1', 'C2'],

    textos: {
        // Star Map
        'welcome':              { es: '¡Bienvenido', en: 'Welcome' },
        'choose_module':        { es: 'Elige un módulo para comenzar.', en: 'Choose a module to start.' },
        'click_to_start':       { es: 'Haz click para comenzar', en: 'Click to start' },

        // Speaking
        'speaking_title':       { es: 'Práctica de Conversación', en: 'Speaking Practice' },
        'speaking_sub':         { es: 'Elige tu actividad de conversación', en: 'Choose your speaking activity' },
        'phrase_practice':      { es: 'Práctica de Frases', en: 'Phrase Practice' },
        'phrase_desc':          { es: 'Practica frases específicas y recibe retroalimentación.', en: 'Practice specific phrases and get AI feedback.' },
        'airport_conv':         { es: 'Conversaciones en el Aeropuerto', en: 'Airport Conversations' },
        'airport_desc':         { es: 'Conversa con agentes del aeropuerto en diferentes situaciones.', en: 'Have real conversations with AI airport agents.' },
        'start_practice':       { es: 'Comenzar Práctica →', en: 'Start Practice →' },
        'start_conv':           { es: 'Comenzar Conversación →', en: 'Start Conversation →' },
        'hold_to_speak':        { es: '🎤 Mantén para hablar', en: '🎤 Hold to Speak' },
        'listening':            { es: 'Escuchando... (click para detener)', en: 'Listening... (click to stop)' },
        'type_answer':          { es: 'O escribe tu respuesta aquí...', en: 'Or type your answer here...' },
        'say_phrase':           { es: 'Di esta frase:', en: 'Say this phrase:' },
        'try_again':            { es: 'Intentar de nuevo', en: 'Try Again' },
        'next_exercise':        { es: 'Siguiente Ejercicio', en: 'Next Exercise' },

        // Game Planet
        'game_title':           { es: 'Planeta de Juegos', en: 'Game Planet' },
        'game_sub':             { es: '¡Elige tu desafío y gana Polvo de Estrellas!', en: 'Choose your challenge and earn Stardust!' },
        'play_level':           { es: 'Jugar Nivel', en: 'Play Level' },
        'question_of':          { es: 'Pregunta', en: 'Question' },
        'of':                   { es: 'de', en: 'of' },
        'correct':              { es: '✅ ¡Correcto! ¡Bien hecho!', en: '✅ Correct! Well done!' },
        'incorrect_1':          { es: '❌ ¡Incorrecto! Tienes 1 oportunidad más.', en: '❌ Incorrect! You have 1 more chance.' },
        'last_chance':          { es: '⚠️ ¡Última oportunidad! Piensa bien.', en: '⚠️ Last chance! Think carefully.' },
        'back_games':           { es: '← Volver a Juegos', en: '← Back to Games' },
        'module_complete':      { es: '¡Módulo Completado!', en: 'Module Complete!' },
        'correct_answers':      { es: 'respuestas correctas', en: 'correct answers' },
        'play_again':           { es: 'Jugar de Nuevo', en: 'Play Again' },

        // Grammar
        'grammar_title':        { es: 'Lecciones de Gramática', en: 'Grammar Lessons' },
        'grammar_sub':          { es: '¡Aprende las reglas y practica con un quiz!', en: 'Learn the rules, then practice with a quiz!' },
        'practice_quiz':        { es: 'Quiz de Práctica', en: 'Practice Quiz' },
        'test_knowledge':       { es: 'Pon a prueba tu conocimiento • Gana Polvo de Estrellas', en: 'Test your knowledge • Earn Stardust' },
        'back_lessons':         { es: '← Volver a Lecciones', en: '← Back to Lessons' },
        'quiz_complete':        { es: '¡Quiz Completado!', en: 'Quiz Complete!' },
        'take_quiz':            { es: 'Tomar el Quiz de Práctica →', en: 'Take the Practice Quiz →' },

        // Listening
        'listening_title':      { es: 'Escucha Cósmica', en: 'Cosmic Listening' },
        'listening_sub':        { es: '¡Escucha y responde preguntas de comprensión!', en: 'Watch, listen and answer comprehension questions!' },
        'listening_tips':       { es: '💡 Consejos para Escuchar', en: '💡 Listening Tips' },
        'ready_quiz':           { es: '¡Estoy listo! Comenzar Quiz →', en: "I'm ready! Start Quiz →" },
        'watch_again':          { es: '← Ver de Nuevo', en: '← Watch Again' },
        'great_listening':      { es: '¡Excelente escucha!', en: 'Great listening!' },

        // Perfil
        'my_profile':           { es: 'Mi Perfil', en: 'My Profile' },
        'choose_avatar':        { es: 'Elegir Avatar', en: 'Choose Avatar' },
        'stardust_earned':      { es: 'Polvo de Estrellas ganado', en: 'Stardust earned' },

        // General
        'back':                 { es: '← Volver', en: '← Back' },
        'exit':                 { es: 'Salir', en: 'Exit' },
        'level':                { es: 'Nivel', en: 'Level' },
        'name':                 { es: 'Nombre', en: 'Name' },
        'loading':              { es: 'Cargando...', en: 'Loading...' },
    }
};

/**
 * Obtener texto según el nivel del estudiante
 * @param {string} clave - clave del texto
 * @param {string} nivel - nivel del estudiante (A1, A2, B1, B2, C1, C2)
 * @returns {string} texto en el idioma correcto
 */
export function t(clave, nivel = 'B1') {
    const texto = traducciones.textos[clave];
    if (!texto) return clave;

    if (traducciones.espanol.includes(nivel)) {
        return texto.es;
    }
    return texto.en;
}

/**
 * Verificar si el nivel es principiante (español)
 */
export function esNivelPrincipiante(nivel) {
    return traducciones.espanol.includes(nivel);
}

/**
 * Obtener el idioma según el nivel
 */
export function idiomaDeNivel(nivel) {
    if (traducciones.espanol.includes(nivel)) return 'es';
    if (traducciones.mixto.includes(nivel))   return 'mix';
    return 'en';
}
