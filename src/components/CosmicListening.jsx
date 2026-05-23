import { useState, useEffect } from 'react';
import { Headphones, Play, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';
import { usePreguntas, useResponder } from '../hooks/useHoloApi.jsx';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/holo';

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('holo_token');
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Error');
    return data;
}

function QuizListening({ video, onVolver, nivel }) {
    const { responder } = useResponder();
    const [preguntas, setPreguntas] = useState([]);
    const [cargando, setCargando]   = useState(true);

    const [fase, setFase]             = useState('video');
    const [indice, setIndice]         = useState(0);
    const [intentos, setIntentos]     = useState(0);
    const [resultado, setResultado]   = useState(null);
    const [puntaje, setPuntaje]       = useState(0);
    const [stardustTotal, setStardustTotal] = useState(0);

    useEffect(() => {
        apiFetch(`/preguntas-video/${video.id}`)
            .then(data => setPreguntas(data.preguntas))
            .catch(() => setPreguntas([]))
            .finally(() => setCargando(false));
    }, [video.id]);

    if (fase === 'completado') return (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
            <Trophy size={64} className="text-yellow-400" />
            <h3 className="text-3xl font-black text-white">Great listening!</h3>
            <p className="text-gray-400 text-xl">{puntaje} / {preguntas.length} correct</p>
            <p className="text-cyan-400 font-bold text-xl">✨ +{stardustTotal} Stardust earned!</p>
            <div className="flex gap-4 mt-4">
                <button onClick={onVolver} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all">← Back</button>
                <button
                    onClick={() => { setFase('video'); setIndice(0); setIntentos(0); setResultado(null); setPuntaje(0); setStardustTotal(0); }}
                    className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2"
                >
                    <RotateCcw size={16} /> Watch Again
                </button>
            </div>
        </div>
    );

    if (fase === 'video') return (
        <div className="flex flex-col gap-6">
            <button onClick={onVolver} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors self-start">
                <ArrowLeft size={18} /> Back
            </button>
            <div className="rounded-2xl overflow-hidden relative bg-black aspect-video">
                <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${video.youtube_id}?rel=0&modestbranding=1`}
                    title={video.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                />
            </div>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-3">💡 Listening Tips</h3>
                <ul className="space-y-2">
                    {(video.tips ?? []).map((tip, i) => (
                        <li key={i} className="text-gray-300 flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">→</span> {tip}
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={() => setFase('quiz')} className="w-full py-4 bg-cyan-400 text-[#050510] font-bold text-xl rounded-xl hover:bg-cyan-300 transition-all">
                I'm ready! Start Quiz →
            </button>
        </div>
    );

    if (preguntas.length === 0) return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-gray-400">No questions available yet for level {nivel}.</p>
            <button onClick={onVolver} className="px-6 py-3 rounded-xl bg-white/10 text-white font-bold">← Back</button>
        </div>
    );

    const pregunta = preguntas[indice];

    async function handleRespuesta(opcion) {
        if (resultado) return;
        const correcta = opcion === pregunta.respuesta_correcta;
        if (correcta) {
            setResultado('correct'); setPuntaje(p => p + 1);
            const data = await responder({ modulo: 'listening', nivel, preguntaId: pregunta.id, correcta: true });
            setStardustTotal(p => p + (data?.stardust_ganado ?? 10));
            setTimeout(() => {
                setResultado(null); setIntentos(0);
                if (indice < preguntas.length - 1) setIndice(i => i + 1);
                else setFase('completado');
            }, 1200);
        } else {
            if (intentos === 0) { setIntentos(1); setResultado('wrong-1'); setTimeout(() => setResultado(null), 1500); }
            else {
                setResultado('wrong-final');
                await responder({ modulo: 'listening', nivel, preguntaId: pregunta.id, correcta: false });
                setTimeout(() => {
                    setResultado(null); setIntentos(0);
                    if (indice < preguntas.length - 1) setIndice(i => i + 1);
                    else setFase('completado');
                }, 2000);
            }
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <button onClick={() => setFase('video')} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
                    <ArrowLeft size={18} /> Watch Again
                </button>
                <span className="text-gray-400 font-bold">Question {indice + 1} of {preguntas.length} • Level {nivel}</span>
            </div>
            <div className="flex gap-2">
                {preguntas.map((_, i) => <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < indice ? 'bg-cyan-400' : i === indice ? 'bg-cyan-400/50' : 'bg-white/10'}`} />)}
            </div>
            <div className={`bg-white/5 rounded-2xl border p-8 transition-all ${resultado === 'correct' ? 'border-green-500/50 bg-green-500/5' : resultado?.startsWith('wrong') ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}>
                <p className="text-2xl text-white font-bold text-center mb-8">{pregunta.pregunta}</p>
                {resultado === 'wrong-1' && <p className="text-red-400 font-bold text-center mb-4 animate-pulse">❌ Incorrect! 1 more chance.</p>}
                {resultado === 'wrong-final' && (
                    <div className="text-center mb-4">
                        <p className="text-red-400 font-bold">❌ Correct: <span className="text-white">"{pregunta.respuesta_correcta}"</span></p>
                        {pregunta.explicacion && <p className="text-gray-400 text-sm mt-1">{pregunta.explicacion}</p>}
                    </div>
                )}
                {resultado === 'correct' && <p className="text-green-400 font-bold text-center mb-4">✅ Correct!</p>}
                <div className="grid grid-cols-2 gap-4">
                    {pregunta.opciones.map((opcion, i) => (
                        <button key={i} onClick={() => handleRespuesta(opcion)} disabled={!!resultado}
                            className={`py-4 px-6 rounded-xl font-bold text-lg transition-all border ${
                                (resultado === 'correct' || resultado === 'wrong-final') && opcion === pregunta.respuesta_correcta
                                    ? 'bg-green-500/20 border-green-500 text-green-400'
                                    : 'bg-transparent text-white border-white/20 hover:border-cyan-400 hover:bg-cyan-400/10 disabled:opacity-50'
                            }`}
                        >{opcion}</button>
                    ))}
                </div>
                {intentos === 1 && !resultado && <p className="text-yellow-400 font-bold text-center mt-4 animate-pulse">⚠️ Last chance!</p>}
            </div>
        </div>
    );
}

export default function CosmicListening({ nivel = 'B1' }) {
    const [videos, setVideos]         = useState([]);
    const [cargando, setCargando]     = useState(true);
    const [videoActivo, setVideoActivo] = useState(null);

    useEffect(() => {
        cargarVideos();
    }, [nivel]);

    async function cargarVideos() {
        setCargando(true);
        try {
            const data = await apiFetch(`/videos?nivel=${nivel}`);
            setVideos(data.videos);
        } catch {
            setVideos([]);
        } finally {
            setCargando(false);
        }
    }

    if (videoActivo !== null) return (
        <div className="h-full overflow-y-auto">
            <QuizListening
                video={videos[videoActivo]}
                onVolver={() => setVideoActivo(null)}
                nivel={nivel}
            />
        </div>
    );

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="text-center mb-2">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Cosmic Listening
                </h2>
                <p className="text-gray-400 mt-2">
                    Level <span className="text-cyan-400 font-bold">{nivel}</span> — Watch, listen and answer questions!
                </p>
            </div>

            {cargando && (
                <div className="flex items-center justify-center h-40">
                    <p className="text-cyan-400 animate-pulse font-bold">Loading videos...</p>
                </div>
            )}

            {!cargando && videos.length === 0 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                    <p className="text-4xl mb-4">🎧</p>
                    <p className="text-gray-400">No videos available for level {nivel} yet.</p>
                </div>
            )}

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {videos.map((video, i) => (
                    <div
                        key={video.id}
                        onClick={() => setVideoActivo(i)}
                        className="bg-white/5 rounded-2xl border border-white/10 p-6 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all group flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-3xl flex-shrink-0">
                                🎧
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{video.titulo}</h3>
                                <p className="text-gray-500 text-sm">{video.descripcion}</p>
                                <div className="flex gap-3 mt-2">
                                    <span className="text-xs bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-full font-bold border border-cyan-400/20">Level {nivel}</span>
                                    {video.duracion && <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full">⏱ {video.duracion}</span>}
                                    <span className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded-full capitalize">{video.categoria}</span>
                                </div>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-all flex-shrink-0">
                            <Play size={16} className="text-cyan-400 group-hover:text-[#050510]" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
