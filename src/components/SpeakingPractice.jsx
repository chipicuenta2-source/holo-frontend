import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, Star, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { useSpeaking } from '../hooks/useHoloApi.jsx';

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

const categorias = [
    { id: '',           label: 'All',        emoji: '🌟' },
    { id: 'airport',    label: 'Airport',    emoji: '🛫' },
    { id: 'hotel',      label: 'Hotel',      emoji: '🏨' },
    { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
    { id: 'transport',  label: 'Transport',  emoji: '🚕' },
    { id: 'shopping',   label: 'Shopping',   emoji: '🛍️' },
];

export default function SpeakingPractice({ nivel = 'B1', onVolver }) {
    const { evaluar, evaluando } = useSpeaking();

    const [ejercicios, setEjercicios]           = useState([]);
    const [cargando, setCargando]               = useState(true);
    const [categoriaActiva, setCategoria]       = useState('');
    const [ejercicioIdx, setEjercicioIdx]       = useState(0);
    const [isRecording, setIsRecording]         = useState(false);
    const [textoReconocido, setTextoReconocido] = useState('');
    const [textoManual, setTextoManual]         = useState('');
    const [resultado, setResultado]             = useState(null);
    const [modo, setModo]                       = useState('idle');
    const [showCats, setShowCats]               = useState(false);

    const recognitionRef = useRef(null);

    useEffect(() => { cargarEjercicios(); }, [nivel, categoriaActiva]);

    async function cargarEjercicios() {
        setCargando(true);
        setResultado(null);
        setModo('idle');
        setEjercicioIdx(0);
        try {
            const url = `/ejercicios-speaking?nivel=${nivel}&cantidad=10${categoriaActiva ? `&categoria=${categoriaActiva}` : ''}`;
            const data = await apiFetch(url);
            setEjercicios(data.ejercicios);
        } catch {
            setEjercicios([]);
        } finally {
            setCargando(false);
        }
    }

    function reproducirFrase() {
        const utterance = new SpeechSynthesisUtterance(ejercicio?.frase);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }

    function iniciarGrabacion() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Tu navegador no soporta reconocimiento de voz. Usa el campo de texto.'); return; }
        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart  = () => { setIsRecording(true); setModo('recording'); };
        recognition.onend    = () => { setIsRecording(false); };
        recognition.onerror  = () => { setIsRecording(false); setModo('idle'); };
        recognition.onresult = async (event) => {
            const texto = event.results[0][0].transcript;
            setTextoReconocido(texto);
            setIsRecording(false);
            await enviarEvaluacion(texto);
        };
        recognitionRef.current = recognition;
        recognition.start();
    }

    function detenerGrabacion() { recognitionRef.current?.stop(); setIsRecording(false); }

    async function enviarManual() {
        if (!textoManual.trim()) return;
        setTextoReconocido(textoManual);
        setTextoManual('');
        await enviarEvaluacion(textoManual);
    }

    async function enviarEvaluacion(texto) {
        setModo('evaluando');
        try {
            const data = await evaluar(ejercicio.frase, texto);
            setResultado(data);
            setModo('result');
        } catch {
            alert('Error al evaluar. Intenta de nuevo.');
            setModo('idle');
        }
    }

    function siguienteEjercicio() {
        setResultado(null);
        setTextoReconocido('');
        setModo('idle');
        if (ejercicioIdx < ejercicios.length - 1) {
            setEjercicioIdx(prev => prev + 1);
        } else {
            cargarEjercicios();
        }
    }

    function reintentar() { setResultado(null); setTextoReconocido(''); setModo('idle'); }

    if (cargando) return (
        <div className="h-full flex items-center justify-center">
            <p className="text-cyan-400 animate-pulse font-bold">Loading exercises...</p>
        </div>
    );

    if (ejercicios.length === 0) return (
        <div className="h-full flex flex-col items-center justify-center gap-4">
            <p className="text-gray-400">No exercises found for this level.</p>
            <button onClick={cargarEjercicios} className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold">Try Again</button>
        </div>
    );

    const ejercicio = ejercicios[ejercicioIdx];

    return (
        <div className="flex flex-col gap-3 md:gap-4 h-full">

            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-shrink-0 gap-2">
                <button
                    onClick={onVolver}
                    className="text-gray-400 hover:text-white font-bold flex items-center gap-1 md:gap-2 transition-colors text-sm md:text-base flex-shrink-0"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Categorías — desktop: horizontal, móvil: dropdown */}
                <div className="relative">
                    {/* Botón dropdown en móvil */}
                    <button
                        onClick={() => setShowCats(!showCats)}
                        className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        {categorias.find(c => c.id === categoriaActiva)?.emoji} {categorias.find(c => c.id === categoriaActiva)?.label || 'Filter'}
                        <ChevronRight size={12} className={`transition-transform ${showCats ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Dropdown móvil */}
                    {showCats && (
                        <div className="md:hidden absolute right-0 top-full mt-1 bg-[#0a0a20] border border-white/10 rounded-2xl p-2 z-50 flex flex-col gap-1 min-w-[140px] shadow-xl">
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategoria(cat.id); setShowCats(false); }}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all ${
                                        categoriaActiva === cat.id
                                            ? 'bg-cyan-400 text-[#050510]'
                                            : 'text-gray-400 hover:bg-white/10'
                                    }`}
                                >
                                    {cat.emoji} {cat.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Pills horizontal en desktop */}
                    <div className="hidden md:flex gap-2 flex-wrap justify-end">
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoria(cat.id)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                    categoriaActiva === cat.id
                                        ? 'bg-cyan-400 text-[#050510] border-cyan-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/30'
                                }`}
                            >
                                {cat.emoji} {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Barra de progreso ── */}
            <div className="flex gap-1 md:gap-2 flex-shrink-0">
                {ejercicios.map((_, i) => (
                    <div key={i} className={`flex-1 h-1 md:h-1.5 rounded-full transition-all ${
                        i < ejercicioIdx ? 'bg-cyan-400' : i === ejercicioIdx ? 'bg-cyan-400/50' : 'bg-white/10'
                    }`} />
                ))}
            </div>

            {/* ── Tarjeta del ejercicio ── */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-8 flex-shrink-0">
                <div className="flex items-center justify-between mb-2 md:mb-4">
                    <span className="text-xs md:text-sm font-bold text-cyan-400 uppercase tracking-widest truncate max-w-[70%]">
                        {ejercicio.contexto}
                    </span>
                    <span className="text-xs text-gray-500 font-bold flex-shrink-0">{ejercicioIdx + 1} / {ejercicios.length}</span>
                </div>
                <p className="text-gray-400 mb-2 md:mb-3 text-sm md:text-base">{ejercicio.instruccion}</p>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10">
                    <p className="text-lg md:text-2xl font-bold text-white flex-1 leading-snug">"{ejercicio.frase}"</p>
                    <button
                        onClick={reproducirFrase}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-400/20 transition-all flex-shrink-0 active:scale-90"
                    >
                        <Volume2 size={18} />
                    </button>
                </div>
                {(ejercicio.tips ?? []).length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {(ejercicio.tips ?? []).map((tip, i) => (
                            <span key={i} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-400">💡 {tip}</span>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Resultado ── */}
            {modo === 'result' && resultado && (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-white">AI Evaluation</h3>
                        <div className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full font-black text-base md:text-lg ${
                            resultado.puntaje >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            resultado.puntaje >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                            <Star size={16} /> {resultado.puntaje}/100
                        </div>
                    </div>
                    <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl md:rounded-2xl p-3 md:p-4 mb-3 md:mb-4">
                        <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">You said:</p>
                        <p className="text-white text-sm md:text-base">"{textoReconocido}"</p>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <div className="bg-white/5 rounded-xl p-3 md:p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Feedback</p>
                            <p className="text-gray-200 text-sm md:text-base">{resultado.feedback}</p>
                        </div>
                        {resultado.errores && resultado.errores !== 'Ninguno' && (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 md:p-4">
                                <p className="text-xs text-red-400 font-bold uppercase mb-1">Errors found</p>
                                <p className="text-gray-300 text-sm md:text-base">{resultado.errores}</p>
                            </div>
                        )}
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3 md:p-4">
                            <p className="text-xs text-purple-400 font-bold uppercase mb-1">Suggestion</p>
                            <p className="text-gray-300 text-sm md:text-base">{resultado.sugerencia}</p>
                        </div>
                    </div>
                    <div className="mt-3 text-center">
                        <span className="text-yellow-400 font-bold text-sm md:text-base">✨ +{resultado.stardust_ganado} Stardust earned!</span>
                    </div>
                    <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                        <button
                            onClick={reintentar}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all font-bold flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
                        >
                            <RotateCcw size={16} /> Retry
                        </button>
                        <button
                            onClick={siguienteEjercicio}
                            className="flex-1 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 text-sm md:text-base active:scale-95"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Controles de entrada ── */}
            {modo !== 'result' && (
                <div className="flex flex-col gap-3 flex-shrink-0">
                    {textoReconocido && modo === 'evaluando' && (
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <p className="text-xs text-gray-500 mb-1">Recognized:</p>
                            <p className="text-white text-sm">"{textoReconocido}"</p>
                        </div>
                    )}
                    {modo === 'evaluando' && (
                        <div className="text-center py-2">
                            <p className="text-cyan-400 animate-pulse font-bold text-sm md:text-base">🤖 Claude is evaluating...</p>
                        </div>
                    )}

                    {/* Botón de micrófono — grande en móvil */}
                    <button
                        onClick={isRecording ? detenerGrabacion : iniciarGrabacion}
                        disabled={modo === 'evaluando'}
                        className={`w-full py-4 md:py-4 rounded-xl font-bold flex justify-center items-center gap-3 transition-all text-base md:text-lg active:scale-95 ${
                            isRecording
                                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(255,0,0,0.4)] animate-pulse'
                                : modo === 'evaluando'
                                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-white/10 hover:bg-cyan-400 hover:text-[#050510] text-white border border-white/10'
                        }`}
                    >
                        <Mic size={22} />
                        {isRecording ? 'Listening... (tap to stop)' : '🎤 Tap to Speak'}
                    </button>

                    {/* Campo de texto */}
                    <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden focus-within:border-cyan-400 transition-colors">
                        <input
                            type="text"
                            placeholder="Or type your answer here..."
                            value={textoManual}
                            onChange={e => setTextoManual(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') enviarManual(); }}
                            disabled={modo === 'evaluando' || isRecording}
                            className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder-gray-600 disabled:opacity-50 text-sm md:text-base"
                        />
                        <button
                            onClick={enviarManual}
                            disabled={!textoManual.trim() || modo === 'evaluando'}
                            className="bg-white/10 px-4 hover:bg-cyan-400 hover:text-[#050510] transition-colors disabled:opacity-30 active:scale-90"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
