import { useState } from 'react';
import { BookOpen, ChevronRight, RotateCcw, Trophy, ArrowLeft } from 'lucide-react';
import { usePreguntas, useResponder } from '../hooks/useHoloApi.jsx';

const leccionesPorNivel = {
    A1: [
        {
            titulo: 'Verb To Be',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'The verb "to be" is the most important verb in English. Learn how to use am, is, and are.',
            reglas: [
                { titulo: 'I am / You are / He is', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'Use AM with I. Use IS with he, she, it. Use ARE with you, we, they.', ejemplo: '"I am a student. She is a teacher. They are astronauts."' },
                { titulo: 'Negative & Questions', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'Add NOT to make negative. Move the verb before the subject for questions.', ejemplo: '"I am not tired. Are you ready? Is she here?"' },
            ],
        },
        {
            titulo: 'Articles: A, An, The',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'Learn when to use A, AN, and THE in English sentences.',
            reglas: [
                { titulo: 'A / AN', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'Use A before consonant sounds. Use AN before vowel sounds (a,e,i,o,u).', ejemplo: '"A book, a spaceship. An apple, an astronaut."' },
                { titulo: 'THE', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Use THE when you talk about something specific or already mentioned.', ejemplo: '"I saw a rocket. The rocket was amazing!"' },
            ],
        },
        {
            titulo: 'Present Simple',
            color: 'border-cyan-500', colorTexto: 'text-cyan-400',
            descripcion: 'Use Present Simple for habits, routines, and facts.',
            reglas: [
                { titulo: 'Affirmative', color: 'border-cyan-500', colorTexto: 'text-cyan-400', uso: 'Add -S or -ES for he/she/it. No change for I/you/we/they.', ejemplo: '"I work. She works. He goes to the airport every day."' },
                { titulo: 'Negative & Questions', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'Use DO/DOES for questions and negatives.', ejemplo: '"Do you work here? She does not speak English."' },
            ],
        },
    ],
    A2: [
        {
            titulo: 'Present Continuous',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'Use Present Continuous for actions happening right now.',
            reglas: [
                { titulo: 'Structure', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'Use am/is/are + verb-ING for things happening now.', ejemplo: '"I am studying English. She is flying to Mars right now."' },
                { titulo: 'Future Plans', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'Also use Present Continuous for future arrangements.', ejemplo: '"We are flying to the moon next week."' },
            ],
        },
        {
            titulo: 'There is / There are',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'Use There is and There are to talk about existence of things.',
            reglas: [
                { titulo: 'There is (singular)', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'Use THERE IS for one thing.', ejemplo: '"There is a spaceship at the airport."' },
                { titulo: 'There are (plural)', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Use THERE ARE for more than one thing.', ejemplo: '"There are twenty passengers on the shuttle."' },
            ],
        },
        {
            titulo: 'Past Simple',
            color: 'border-red-500', colorTexto: 'text-red-400',
            descripcion: 'Use Past Simple for completed actions in the past.',
            reglas: [
                { titulo: 'Regular Verbs', color: 'border-red-500', colorTexto: 'text-red-400', uso: 'Add -ED to regular verbs for past tense.', ejemplo: '"I visited the space station. She worked yesterday."' },
                { titulo: 'Irregular Verbs', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'Some verbs change completely in past tense.', ejemplo: '"I went, she saw, they flew to Mars last year."' },
            ],
        },
    ],
    B1: [
        {
            titulo: 'Present Perfect vs Past Simple',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'Understanding when to use Present Perfect and Past Simple is key to mastering B1 English.',
            reglas: [
                { titulo: 'Past Simple', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'Used for finished actions in a specific time in the past.', ejemplo: '"I went to Mars last year."' },
                { titulo: 'Present Perfect', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'Used for actions in an unspecified time, or experiences up to now.', ejemplo: '"I have been to Mars twice."' },
            ],
        },
        {
            titulo: 'Second Conditional',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'The second conditional is used to talk about hypothetical or imaginary situations.',
            reglas: [
                { titulo: 'Structure', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'If + Past Simple, would + infinitive.', ejemplo: '"If I had a spaceship, I would travel to Mars."' },
                { titulo: 'Key Points', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Use "were" instead of "was" for all subjects in formal English.', ejemplo: '"If she were an astronaut, she would visit Jupiter."' },
            ],
        },
        {
            titulo: 'Since vs For',
            color: 'border-cyan-500', colorTexto: 'text-cyan-400',
            descripcion: 'Learn when to use "since" and "for" with the Present Perfect tense.',
            reglas: [
                { titulo: 'SINCE', color: 'border-cyan-500', colorTexto: 'text-cyan-400', uso: 'Use SINCE with a specific point in time.', ejemplo: '"She has been an astronaut since 2020."' },
                { titulo: 'FOR', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'Use FOR with a period of time.', ejemplo: '"She has been an astronaut for 3 years."' },
            ],
        },
    ],
    B2: [
        {
            titulo: 'Passive Voice',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'The passive voice is used when the action is more important than who does it.',
            reglas: [
                { titulo: 'Structure', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'Subject + am/is/are + past participle.', ejemplo: '"The spaceship was launched by NASA in 2024."' },
                { titulo: 'When to use it', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'Use passive when the doer is unknown, unimportant, or obvious.', ejemplo: '"The luggage was lost. Tickets are sold online."' },
            ],
        },
        {
            titulo: 'Third Conditional',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'Use the third conditional to talk about imaginary past situations.',
            reglas: [
                { titulo: 'Structure', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'If + Past Perfect, would have + past participle.', ejemplo: '"If I had studied harder, I would have passed the exam."' },
                { titulo: 'Usage', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Used for regrets or speculating about past events that did not happen.', ejemplo: '"If she had taken the earlier flight, she would have arrived on time."' },
            ],
        },
        {
            titulo: 'Reported Speech',
            color: 'border-red-500', colorTexto: 'text-red-400',
            descripcion: 'Reported speech is used to tell someone what another person said.',
            reglas: [
                { titulo: 'Statements', color: 'border-red-500', colorTexto: 'text-red-400', uso: 'Change present tenses to past tenses when reporting.', ejemplo: '"She said she was going to the airport."' },
                { titulo: 'Questions', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'Use asked + if/whether for yes/no questions.', ejemplo: '"He asked if I had my boarding pass."' },
            ],
        },
    ],
    C1: [
        {
            titulo: 'Mixed Conditionals',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'Mixed conditionals combine different time frames in one sentence.',
            reglas: [
                { titulo: 'Past → Present', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'If + Past Perfect (past condition), would + infinitive (present result).', ejemplo: '"If I had trained as a pilot, I would be flying spaceships now."' },
                { titulo: 'Present → Past', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'If + Past Simple (present condition), would have + past participle (past result).', ejemplo: '"If I were braver, I would have applied to be an astronaut."' },
            ],
        },
        {
            titulo: 'Inversion for Emphasis',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'Inversion is used in formal English for emphasis or after negative adverbials.',
            reglas: [
                { titulo: 'Negative Adverbials', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'Place negative adverbials at the start, then invert subject/verb.', ejemplo: '"Never have I seen such a breathtaking view of Earth from space."' },
                { titulo: 'Conditional Inversion', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Omit "if" and invert the subject and auxiliary verb.', ejemplo: '"Had I known about the delay, I would have left earlier."' },
            ],
        },
        {
            titulo: 'Cleft Sentences',
            color: 'border-cyan-500', colorTexto: 'text-cyan-400',
            descripcion: 'Cleft sentences emphasize a particular part of a sentence.',
            reglas: [
                { titulo: 'It-cleft', color: 'border-cyan-500', colorTexto: 'text-cyan-400', uso: 'It + be + emphasized element + relative clause.', ejemplo: '"It was Neil Armstrong who first walked on the moon."' },
                { titulo: 'What-cleft', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'What + subject + verb + be + emphasized element.', ejemplo: '"What surprised me most was the silence in space."' },
            ],
        },
    ],
    C2: [
        {
            titulo: 'Advanced Idioms & Expressions',
            color: 'border-blue-500', colorTexto: 'text-blue-400',
            descripcion: 'Master idiomatic expressions used by native speakers.',
            reglas: [
                { titulo: 'Formal Idioms', color: 'border-blue-500', colorTexto: 'text-blue-400', uso: 'Formal idioms are used in professional and academic contexts.', ejemplo: '"The project is still in its infancy. We need to take the bull by the horns."' },
                { titulo: 'Idiomatic Verb Phrases', color: 'border-purple-500', colorTexto: 'text-purple-400', uso: 'Complex verb phrases that carry meaning beyond their literal interpretation.', ejemplo: '"The deal fell through. She let the cat out of the bag."' },
            ],
        },
        {
            titulo: 'Ellipsis & Substitution',
            color: 'border-green-500', colorTexto: 'text-green-400',
            descripcion: 'Ellipsis omits words; substitution replaces them to avoid repetition.',
            reglas: [
                { titulo: 'Ellipsis', color: 'border-green-500', colorTexto: 'text-green-400', uso: 'Omit words that are understood from context.', ejemplo: '"She can speak French and so can he."' },
                { titulo: 'Substitution', color: 'border-yellow-500', colorTexto: 'text-yellow-400', uso: 'Replace words with "do so", "one", "ones" to avoid repetition.', ejemplo: '"I wanted a window seat but they gave me an aisle one."' },
            ],
        },
        {
            titulo: 'Nuanced Modal Verbs',
            color: 'border-red-500', colorTexto: 'text-red-400',
            descripcion: 'Advanced use of modal verbs to express nuance, probability, and deduction.',
            reglas: [
                { titulo: 'Deduction & Probability', color: 'border-red-500', colorTexto: 'text-red-400', uso: "Must/can't (certainty), should (expectation), may/might (possibility).", ejemplo: "\"The flight must have been delayed. She can't have landed yet.\"" },
                { titulo: 'Perfect Modals', color: 'border-orange-500', colorTexto: 'text-orange-400', uso: 'Modal + have + past participle for past speculation or regret.', ejemplo: '"You should have booked earlier. They might have missed the connection."' },
            ],
        },
    ],
};

function QuizGrammar({ onVolver, nivel }) {
    const { preguntas, cargando } = usePreguntas('grammar', nivel);
    const { responder } = useResponder();
    const [indice, setIndice]         = useState(0);
    const [intentos, setIntentos]     = useState(0);
    const [resultado, setResultado]   = useState(null);
    const [completado, setCompletado] = useState(false);
    const [puntaje, setPuntaje]       = useState(0);
    const [stardustTotal, setStardustTotal] = useState(0);

    if (cargando) return <div className="flex items-center justify-center h-64"><p className="text-cyan-400 animate-pulse font-bold">Loading quiz...</p></div>;

    if (completado) return (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
            <Trophy size={64} className="text-yellow-400" />
            <h3 className="text-3xl font-black text-white">Quiz Complete!</h3>
            <p className="text-gray-400 text-xl">{puntaje} / {preguntas.length} correct</p>
            <p className="text-cyan-400 font-bold">✨ +{stardustTotal} Stardust earned!</p>
            <div className="flex gap-4">
                <button onClick={onVolver} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all">← Back</button>
                <button onClick={() => { setIndice(0); setIntentos(0); setResultado(null); setCompletado(false); setPuntaje(0); setStardustTotal(0); }} className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold flex items-center gap-2"><RotateCcw size={16} /> Try Again</button>
            </div>
        </div>
    );

    if (preguntas.length === 0) return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-gray-400">No questions available for level {nivel}.</p>
            <button onClick={onVolver} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold">← Back</button>
        </div>
    );

    const pregunta = preguntas[indice];

    async function handleRespuesta(opcion) {
        if (resultado) return;
        const correcta = opcion === pregunta.respuesta_correcta;
        if (correcta) {
            setResultado('correct'); setPuntaje(p => p + 1);
            const data = await responder({ modulo: 'grammar', nivel, preguntaId: pregunta.id, correcta: true });
            setStardustTotal(p => p + (data?.stardust_ganado ?? 10));
            setTimeout(() => { setResultado(null); setIntentos(0); if (indice < preguntas.length - 1) setIndice(i => i + 1); else setCompletado(true); }, 1200);
        } else {
            if (intentos === 0) { setIntentos(1); setResultado('wrong-1'); setTimeout(() => setResultado(null), 1500); }
            else {
                setResultado('wrong-final');
                await responder({ modulo: 'grammar', nivel, preguntaId: pregunta.id, correcta: false });
                setTimeout(() => { setResultado(null); setIntentos(0); if (indice < preguntas.length - 1) setIndice(i => i + 1); else setCompletado(true); }, 2000);
            }
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <button onClick={onVolver} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors"><ArrowLeft size={18} /> Back</button>
                <span className="text-gray-400 font-bold">Question {indice + 1} of {preguntas.length} • Level {nivel}</span>
            </div>
            <div className="flex gap-2">{preguntas.map((_, i) => <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < indice ? 'bg-cyan-400' : i === indice ? 'bg-cyan-400/50' : 'bg-white/10'}`} />)}</div>
            <div className={`bg-white/5 rounded-2xl border p-8 transition-all ${resultado === 'correct' ? 'border-green-500/50 bg-green-500/5' : resultado?.startsWith('wrong') ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}>
                <p className="text-2xl text-white font-bold text-center mb-8">"{pregunta.pregunta}"</p>
                {resultado === 'wrong-1' && <p className="text-red-400 font-bold text-center mb-4 animate-pulse">❌ Incorrect! 1 more chance.</p>}
                {resultado === 'wrong-final' && <div className="text-center mb-4"><p className="text-red-400 font-bold">❌ Correct: <span className="text-white">"{pregunta.respuesta_correcta}"</span></p>{pregunta.explicacion && <p className="text-gray-400 text-sm mt-1">{pregunta.explicacion}</p>}</div>}
                {resultado === 'correct' && <p className="text-green-400 font-bold text-center mb-4">✅ Correct!</p>}
                <div className="grid grid-cols-2 gap-4">
                    {pregunta.opciones.map((opcion, i) => (
                        <button key={i} onClick={() => handleRespuesta(opcion)} disabled={!!resultado}
                            className={`py-4 px-6 rounded-xl font-bold text-lg transition-all border ${(resultado === 'correct' || resultado === 'wrong-final') && opcion === pregunta.respuesta_correcta ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-transparent text-white border-white/20 hover:border-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50'}`}>
                            {opcion}
                        </button>
                    ))}
                </div>
                {intentos === 1 && !resultado && <p className="text-yellow-400 font-bold text-center mt-4 animate-pulse">⚠️ Last chance!</p>}
            </div>
        </div>
    );
}

export default function Grammar({ nivel = 'B1' }) {
    const [vista, setVista]           = useState('lecciones');
    const [leccionActiva, setLeccion] = useState(null);
    const lecciones = leccionesPorNivel[nivel] ?? leccionesPorNivel['B1'];

    if (vista === 'quiz') return (
        <div className="h-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 overflow-y-auto">
            <QuizGrammar onVolver={() => setVista('lecciones')} nivel={nivel} />
        </div>
    );

    if (vista === 'leccion' && leccionActiva !== null) {
        const leccion = lecciones[leccionActiva];
        return (
            <div className="h-full flex flex-col gap-6 overflow-y-auto">
                <button onClick={() => setVista('lecciones')} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors self-start"><ArrowLeft size={18} /> Back to Lessons</button>
                <div className={`bg-white/5 border-t-4 ${leccion.color} rounded-2xl p-8`}>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-2xl font-black ${leccion.colorTexto}`}>{leccion.titulo}</h3>
                        <span className="text-xs bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-1 rounded-full font-bold">Level {nivel}</span>
                    </div>
                    <p className="text-gray-300 mb-8">{leccion.descripcion}</p>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {leccion.reglas.map((regla, i) => (
                            <div key={i} className={`bg-white/5 p-6 rounded-xl border-t-4 ${regla.color}`}>
                                <h4 className={`text-xl font-bold ${regla.colorTexto} mb-2`}>{regla.titulo}</h4>
                                <p className="text-gray-400 text-sm mb-4">{regla.uso}</p>
                                <p className={`font-mono text-sm border-l-2 ${regla.color} pl-3 text-gray-200`}>{regla.ejemplo}</p>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setVista('quiz')} className="w-full py-4 bg-cyan-400/10 hover:bg-cyan-400 border border-cyan-400 text-cyan-400 hover:text-[#050510] font-bold text-xl rounded-xl transition-all">Take the Practice Quiz →</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="text-center mb-2">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Grammar Lessons</h2>
                <p className="text-gray-400 mt-1">Level <span className="text-cyan-400 font-bold">{nivel}</span> — Learn the rules, then practice!</p>
            </div>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {lecciones.map((leccion, i) => (
                    <div key={i} onClick={() => { setLeccion(i); setVista('leccion'); }} className={`bg-white/5 border-l-4 ${leccion.color} rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between group`}>
                        <div className="flex items-center gap-4">
                            <BookOpen size={24} className={leccion.colorTexto} />
                            <div>
                                <h3 className="text-white font-bold text-lg">{leccion.titulo}</h3>
                                <p className="text-gray-500 text-sm">Level {nivel} • Click to study</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                ))}
                <div onClick={() => setVista('quiz')} className="bg-cyan-400/5 border border-cyan-400/30 rounded-2xl p-6 cursor-pointer hover:bg-cyan-400/10 transition-all flex items-center justify-between group mt-2">
                    <div className="flex items-center gap-4">
                        <Trophy size={24} className="text-cyan-400" />
                        <div>
                            <h3 className="text-cyan-400 font-bold text-lg">Practice Quiz</h3>
                            <p className="text-gray-500 text-sm">Test your Level {nivel} knowledge • Earn Stardust</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
            </div>
        </div>
    );
}
