import { useState } from 'react';
import { Key, Trophy, RotateCcw, ChevronRight, Star } from 'lucide-react';
import { usePreguntas, useResponder } from '../hooks/useHoloApi.jsx';

function JuegoModulo({ modulo, titulo, descripcion, color, onVolver, nivel }) {
    const { preguntas, cargando, error } = usePreguntas(modulo, nivel);
    const { responder } = useResponder();

    const [indice, setIndice]       = useState(0);
    const [intentos, setIntentos]   = useState(0);
    const [resultado, setResultado] = useState(null); // null | 'correct' | 'wrong'
    const [completado, setCompletado] = useState(false);
    const [puntaje, setPuntaje]     = useState(0);
    const [stardustTotal, setStardustTotal] = useState(0);

    if (cargando) return (
        <div className="h-full flex items-center justify-center">
            <p className="text-cyan-400 animate-pulse font-bold">Loading questions...</p>
        </div>
    );

    if (error || preguntas.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-red-400">Could not load questions.</p>
            <button onClick={onVolver} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold">← Back</button>
        </div>
    );

    if (completado) return (
        <div className="h-full flex flex-col items-center justify-center gap-6">
            <Trophy size={80} className="text-yellow-400" />
            <h2 className="text-4xl font-black text-white">Module Complete!</h2>
            <p className="text-gray-400 text-xl">{puntaje} / {preguntas.length} correct answers</p>
            <p className="text-cyan-400 font-bold text-xl">✨ +{stardustTotal} Stardust earned!</p>
            <div className="flex gap-4 mt-4">
                <button
                    onClick={onVolver}
                    className="px-8 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all"
                >
                    ← Back to Games
                </button>
                <button
                    onClick={() => { setIndice(0); setIntentos(0); setResultado(null); setCompletado(false); setPuntaje(0); setStardustTotal(0); }}
                    className="px-8 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2"
                >
                    <RotateCcw size={18} /> Play Again
                </button>
            </div>
        </div>
    );

    const pregunta = preguntas[indice];

    async function handleRespuesta(opcion) {
        if (resultado) return; // ya respondió

        const correcta = opcion === pregunta.respuesta_correcta;

        if (correcta) {
            setResultado('correct');
            setPuntaje(p => p + 1);
            const data = await responder({
                modulo,
                preguntaId: pregunta.id,
                correcta: true,
            });
            setStardustTotal(p => p + (data?.stardust_ganado ?? 10));

            setTimeout(() => {
                setResultado(null);
                setIntentos(0);
                if (indice < preguntas.length - 1) {
                    setIndice(i => i + 1);
                } else {
                    setCompletado(true);
                }
            }, 1200);

        } else {
            if (intentos === 0) {
                setIntentos(1);
                setResultado('wrong-1');
                setTimeout(() => setResultado(null), 1500);
            } else {
                setResultado('wrong-final');
                await responder({
                    modulo,
                    preguntaId: pregunta.id,
                    correcta: false,
                });
                setTimeout(() => {
                    setResultado(null);
                    setIntentos(0);
                    if (indice < preguntas.length - 1) {
                        setIndice(i => i + 1);
                    } else {
                        setCompletado(true);
                    }
                }, 2000);
            }
        }
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onVolver} className="text-gray-400 hover:text-white transition-colors font-bold flex items-center gap-2">
                    ← Back
                </button>
                <span className="text-gray-400 font-bold">
                    Question {indice + 1} of {preguntas.length}
                </span>
            </div>

            {/* Barra de progreso */}
            <div className="flex gap-2">
                {preguntas.map((_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
                        i < indice ? 'bg-cyan-400' :
                        i === indice ? 'bg-cyan-400/50' : 'bg-white/10'
                    }`} />
                ))}
            </div>

            {/* Pregunta */}
            <div className={`bg-white/5 backdrop-blur-md rounded-3xl border p-10 flex-1 flex flex-col items-center justify-center gap-8 transition-all ${
                resultado === 'correct' ? 'border-green-500/50 bg-green-500/5' :
                resultado?.startsWith('wrong') ? 'border-red-500/50 bg-red-500/5' :
                'border-white/10'
            }`}>
                <p className="text-3xl text-white font-bold text-center tracking-wide">
                    "{pregunta.pregunta}"
                </p>

                {/* Feedback de intento */}
                {resultado === 'wrong-1' && (
                    <p className="text-red-400 font-bold animate-pulse">
                        ❌ Incorrect! You have 1 more chance.
                    </p>
                )}
                {resultado === 'wrong-final' && (
                    <div className="text-center">
                        <p className="text-red-400 font-bold">❌ The correct answer was:</p>
                        <p className="text-white font-black text-xl mt-1">"{pregunta.respuesta_correcta}"</p>
                        {pregunta.explicacion && (
                            <p className="text-gray-400 mt-2 text-sm">{pregunta.explicacion}</p>
                        )}
                    </div>
                )}
                {resultado === 'correct' && (
                    <p className="text-green-400 font-bold text-xl">✅ Correct! Well done!</p>
                )}

                {/* Opciones */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                    {pregunta.opciones.map((opcion, i) => (
                        <button
                            key={i}
                            onClick={() => handleRespuesta(opcion)}
                            disabled={!!resultado}
                            className={`px-6 py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all border ${
                                resultado === 'correct' && opcion === pregunta.respuesta_correcta
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : resultado === 'wrong-final' && opcion === pregunta.respuesta_correcta
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'bg-transparent text-white border-white/20 hover:border-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            {opcion}
                        </button>
                    ))}
                </div>

                {intentos === 1 && !resultado && (
                    <p className="text-yellow-400 font-bold animate-pulse">
                        ⚠️ Last chance! Think carefully.
                    </p>
                )}
            </div>
        </div>
    );
}

export default function GamePlanet({ nivel = 'B1' }) {
    const [juegoActivo, setJuegoActivo] = useState(null);

    const juegos = [
        {
            id: 'grammar',
            titulo: 'Gate of Grammar',
            descripcion: 'Solve sentences using verb tenses and prepositions to escape the dark room.',
            nivel: 'B1',
            color: 'from-purple-900/40',
            emoji: '🚪',
            boton: 'Play Level 1',
        },
        {
            id: 'vocabulary',
            titulo: 'Vocabulary Asteroids',
            descripcion: 'Complete the correct word for real-world airport scenarios.',
            nivel: 'B1',
            color: 'from-blue-900/40',
            emoji: '☄️',
            boton: 'Play Level 2',
        },
    ];

   if (juegoActivo) {
    const juego = juegos.find(j => j.id === juegoActivo);
    return (
        <JuegoModulo
            modulo={juegoActivo}
            titulo={juego.titulo}
            descripcion={juego.descripcion}
            color={juego.color}
            onVolver={() => setJuegoActivo(null)}
            nivel={nivel}
        />
    );
    }   

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="text-center mb-4">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Game Planet
                </h2>
                <p className="text-gray-400 mt-2">Choose your challenge and earn Stardust!</p>
            </div>

            <div className="grid grid-cols-2 gap-6 flex-1">
                {juegos.map(juego => (
                    <div
                        key={juego.id}
                        onClick={() => setJuegoActivo(juego.id)}
                        className={`bg-gradient-to-tr ${juego.color} to-transparent rounded-3xl p-8 border border-white/10 cursor-pointer hover:border-cyan-400/30 transition-all group flex flex-col justify-between`}
                    >
                        <div>
                            <span className="text-5xl mb-4 block">{juego.emoji}</span>
                            <h3 className="text-2xl font-black text-white mb-2">{juego.titulo}</h3>
                            <p className="text-gray-400">{juego.descripcion}</p>
                        </div>
                        <div className="mt-8 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-full inline-block font-bold group-hover:bg-cyan-400 group-hover:text-[#050510] group-hover:border-cyan-400 transition-all">
                            {juego.boton} →
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
