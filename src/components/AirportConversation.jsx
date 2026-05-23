import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, Star, RotateCcw, ArrowLeft, X } from 'lucide-react';

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

const ESCENARIOS = [
    {
        id: 'checkin',
        titulo: 'Check-in Counter',
        subtitulo: 'Galaxy Airways International Terminal',
        agente: 'NOVA',
        cargo: 'Senior Check-in Agent',
        avatar: '👩‍✈️',
        colorAvatar: 'from-blue-600 to-cyan-500',
        imagen: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
        colorTema: 'cyan',
        mision: 'Mission: Check in for Galaxy Flight GX-309 to Mars',
        systemPrompt: `You are NOVA, a warm and professional senior check-in agent at Galaxy Airways International Terminal.
You are helping a passenger check in for Flight GX-309 to Mars.
Guide them through: greeting → passport/ID check → luggage → seat preference → boarding pass → farewell.
Keep ALL responses SHORT: maximum 2 sentences. Be warm, professional, use simple B1 English.
Gently note grammar mistakes in parentheses like (tip: use "I would like" instead).
After 8 exchanges, wrap up and end with [SCORE:XX].`,
        primerMensaje: "Welcome to Galaxy Airways! ✨ I'll be checking you in today. May I see your passport or booking reference, please?",
    },
    {
        id: 'security',
        titulo: 'Security Checkpoint',
        subtitulo: 'Intergalactic Security Zone — Gate 42',
        agente: 'REX',
        cargo: 'Security Officer',
        avatar: '👮',
        colorAvatar: 'from-red-600 to-orange-500',
        imagen: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=90',
        colorTema: 'red',
        mision: 'Mission: Pass through security to reach your departure gate',
        systemPrompt: `You are REX, a professional but friendly security officer at the intergalactic space airport.
Guide the passenger through security: documents → remove items → scanner → liquids check → clearance.
Keep ALL responses SHORT: maximum 2 sentences. Use clear, direct B1 English instructions.
Gently note grammar mistakes in parentheses.
After 8 exchanges, clear the passenger and end with [SCORE:XX].`,
        primerMensaje: "Good morning! Please have your boarding pass and ID ready. Do you have any liquids or electronic devices in your carry-on today?",
    },
    {
        id: 'gate',
        titulo: 'Boarding Gate 42',
        subtitulo: 'Final Boarding — Flight GX-309 to Mars',
        agente: 'LUNA',
        cargo: 'Gate Agent',
        avatar: '🧑‍🚀',
        colorAvatar: 'from-purple-600 to-pink-500',
        imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90',
        colorTema: 'purple',
        mision: 'Mission: Board your spaceship and get ready for liftoff! 🚀',
        systemPrompt: `You are LUNA, an enthusiastic gate agent at the boarding gate for Flight GX-309 to Mars.
Guide the passenger through: boarding pass scan → group → flight info → safety reminder → welcome aboard.
Keep ALL responses SHORT: maximum 2 sentences. Be warm and excited about space travel!
Gently note grammar mistakes in parentheses.
After 8 exchanges, board them and end with [SCORE:XX].`,
        primerMensaje: "Welcome to Gate 42! 🚀 We're so excited for your journey to Mars today! May I scan your boarding pass, please?",
    },
];

function SubtituloAnimado({ texto, esAgente, nombre }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        setVisible(false);
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, [texto]);

    return (
        <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {esAgente ? (
                <div className="text-center px-8">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-cyan-400 mb-2 block">{nombre}</span>
                    <p className="text-white text-2xl font-medium leading-relaxed"
                       style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7)' }}>
                        {texto}
                    </p>
                </div>
            ) : (
                <div className="text-center px-8">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 mb-2 block">YOU</span>
                    <p className="text-yellow-100 text-xl font-medium leading-relaxed italic"
                       style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
                        "{texto}"
                    </p>
                </div>
            )}
        </div>
    );
}

function SelectorEscenarios({ onSeleccionar, onVolver }) {
    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button onClick={onVolver} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>
                <div>
                    <h2 className="text-3xl font-black text-white">Airport Immersion</h2>
                    <p className="text-gray-400 text-sm">Choose your scenario and practice real English</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-5 flex-1">
                {ESCENARIOS.map((esc, i) => (
                    <div
                        key={esc.id}
                        onClick={() => onSeleccionar(i)}
                        className="relative rounded-3xl overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02]"
                        style={{ minHeight: '280px' }}
                    >
                        <img src={esc.imagen} alt={esc.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                        <div className="relative h-full flex flex-col justify-between p-6">
                            <div className="self-start px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white font-bold">
                                Scenario {i + 1} of {ESCENARIOS.length}
                            </div>
                            <div>
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${esc.colorAvatar} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                                    {esc.avatar}
                                </div>
                                <h3 className="text-white font-black text-xl mb-1">{esc.titulo}</h3>
                                <p className="text-gray-300 text-xs mb-3">{esc.subtitulo}</p>
                                <p className="text-cyan-300 text-xs font-bold">{esc.mision}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${esc.colorAvatar} flex items-center justify-center text-sm`}>{esc.avatar}</div>
                                    <div>
                                        <p className="text-white text-xs font-bold">{esc.agente}</p>
                                        <p className="text-gray-400 text-xs">{esc.cargo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EscenaInmersiva({ escenario, onVolver, nivel = 'B1' }) {
    const [mensajes, setMensajes]         = useState([{ rol: 'agente', texto: escenario.primerMensaje }]);
    const [ultimoMensaje, setUltimo]      = useState({ rol: 'agente', texto: escenario.primerMensaje });
    const [textoUsuario, setTexto]        = useState('');
    const [cargando, setCargando]         = useState(false);
    const [grabando, setGrabando]         = useState(false);
    const [agenteHabla, setAgenteHabla]   = useState(false);
    const [finalizado, setFinalizado]     = useState(false);
    const [puntaje, setPuntaje]           = useState(null);
    const [stardust, setStardust]         = useState(0);
    const [mostrarHistorial, setHistorial] = useState(false);
    const recognitionRef = useRef(null);

    function reproducirVoz(texto) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'en-US'; u.rate = 0.9;
        u.pitch = escenario.id === 'security' ? 0.8 : 1.1;
        setAgenteHabla(true);
        u.onend = () => setAgenteHabla(false);
        window.speechSynthesis.speak(u);
    }

    useEffect(() => { setTimeout(() => reproducirVoz(escenario.primerMensaje), 800); }, []);

    function iniciarGrabacion() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Use the text field — voice not supported in this browser.'); return; }
        const r = new SR();
        r.lang = 'en-US'; r.interimResults = false;
        r.onstart  = () => setGrabando(true);
        r.onend    = () => setGrabando(false);
        r.onerror  = () => setGrabando(false);
        r.onresult = (e) => setTexto(e.results[0][0].transcript);
        recognitionRef.current = r;
        r.start();
    }

    function detenerGrabacion() { recognitionRef.current?.stop(); setGrabando(false); }

    async function enviar(textoEnviar) {
        const txt = textoEnviar || textoUsuario;
        if (!txt.trim() || cargando) return;
        setTexto('');
        const msgUsuario = { rol: 'usuario', texto: txt };
        const nuevosMensajes = [...mensajes, msgUsuario];
        setMensajes(nuevosMensajes);
        setUltimo(msgUsuario);
        setCargando(true);
        try {
            const data = await apiFetch('/conversacion', {
                method: 'POST',
                body: JSON.stringify({
                    escenario_id:  escenario.id,
                    system_prompt: escenario.systemPrompt,
                    mensajes:      nuevosMensajes,
                    nivel,
                    agente_nombre: escenario.agente,
                }),
            });
            const msgAgente = { rol: 'agente', texto: data.respuesta };
            setMensajes(prev => [...prev, msgAgente]);
            setUltimo(msgAgente);
            reproducirVoz(data.respuesta);
            if (data.puntaje) { setPuntaje(data.puntaje); setStardust(data.stardust_ganado ?? 30); setTimeout(() => setFinalizado(true), 2000); }
        } catch {
            const f = { rol: 'agente', texto: "I'm sorry, could you repeat that please?" };
            setMensajes(prev => [...prev, f]); setUltimo(f);
        } finally { setCargando(false); }
    }

    if (finalizado) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,5,16,0.97)' }}>
            <div className="text-center max-w-md px-8">
                <div className="text-8xl mb-6">🚀</div>
                <h2 className="text-4xl font-black text-white mb-2">Mission Complete!</h2>
                <p className="text-gray-400 mb-8">{escenario.titulo}</p>
                <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-3xl mb-6 ${puntaje >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : puntaje >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <Star size={28} /> {puntaje}/100
                </div>
                <p className="text-cyan-400 font-bold text-xl mb-8">✨ +{stardust} Stardust earned!</p>
                <p className="text-gray-300 mb-8">{puntaje >= 80 ? '🌟 Outstanding! Your English is perfect for real airport situations.' : puntaje >= 60 ? '👍 Good job! Keep practicing to improve your fluency.' : '💪 Keep practicing! Every conversation makes you better.'}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={onVolver} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all">← Choose Scenario</button>
                    <button onClick={() => { setMensajes([{ rol: 'agente', texto: escenario.primerMensaje }]); setUltimo({ rol: 'agente', texto: escenario.primerMensaje }); setFinalizado(false); setPuntaje(null); }} className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2">
                        <RotateCcw size={16} /> Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-40 overflow-hidden">
            <img src={escenario.imagen} alt={escenario.titulo} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            <div className="absolute top-0 left-0 right-0 h-16 bg-black" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-black" />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-10">
                <button onClick={onVolver} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold">
                    <ArrowLeft size={16} /> Exit
                </button>
                <div className="text-center">
                    <p className="text-white font-black text-sm tracking-widest uppercase">{escenario.titulo}</p>
                    <p className="text-white/50 text-xs">{escenario.subtitulo}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setHistorial(!mostrarHistorial)} className="text-white/50 hover:text-white transition-colors text-xs font-bold">
                        {mostrarHistorial ? 'Hide' : 'History'}
                    </button>
                    <button onClick={() => reproducirVoz(ultimoMensaje.texto)} className="text-white/50 hover:text-cyan-400 transition-colors">
                        <Volume2 size={18} />
                    </button>
                </div>
            </div>

            {/* Historial */}
            {mostrarHistorial && (
                <div className="absolute top-16 right-4 bottom-48 w-72 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-y-auto p-4 z-20">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversation</p>
                        <button onClick={() => setHistorial(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                    </div>
                    <div className="space-y-3">
                        {mensajes.map((msg, i) => (
                            <div key={i} className={`text-xs ${msg.rol === 'agente' ? 'text-cyan-300' : 'text-yellow-200 text-right'}`}>
                                <span className="font-bold block mb-0.5">{msg.rol === 'agente' ? escenario.agente : 'You'}</span>
                                {msg.texto}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Avatar */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ bottom: '200px' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${escenario.colorAvatar} flex items-center justify-center text-4xl shadow-2xl border-4 ${agenteHabla ? 'border-cyan-400' : 'border-white/20'} transition-all duration-300`}
                             style={{ boxShadow: agenteHabla ? '0 0 30px rgba(69,243,255,0.6)' : 'none' }}>
                            {escenario.avatar}
                        </div>
                        {agenteHabla && (
                            <>
                                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
                                <div className="absolute inset-[-8px] rounded-full border border-cyan-400/20 animate-ping" style={{ animationDelay: '0.2s' }} />
                            </>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black text-sm">{escenario.agente}</p>
                        <p className="text-white/50 text-xs">{escenario.cargo}</p>
                    </div>
                </div>
            </div>

            {/* Subtítulos */}
            <div className="absolute left-0 right-0 z-10 px-12" style={{ bottom: '190px' }}>
                {cargando ? (
                    <div className="text-center">
                        <div className="flex gap-2 justify-center">
                            {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                        </div>
                    </div>
                ) : ultimoMensaje && (
                    <SubtituloAnimado texto={ultimoMensaje.texto} esAgente={ultimoMensaje.rol === 'agente'} nombre={escenario.agente} />
                )}
            </div>

            {/* Controles */}
            <div className="absolute bottom-0 left-0 right-0 h-48 flex flex-col items-center justify-center gap-4 px-8 z-10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{escenario.mision}</p>
                <div className="flex gap-4 w-full max-w-2xl">
                    <button
                        onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                        disabled={cargando}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 border-2 ${grabando ? 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse' : cargando ? 'bg-white/5 border-white/10 cursor-not-allowed' : 'bg-white/10 border-white/20 hover:bg-cyan-400 hover:border-cyan-400'} text-white`}
                    >
                        <Mic size={22} />
                    </button>
                    <div className="flex-1 flex bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden focus-within:border-cyan-400/50 transition-all">
                        <input
                            type="text"
                            value={textoUsuario}
                            onChange={e => setTexto(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') enviar(); }}
                            placeholder={grabando ? '🎤 Listening...' : 'Type your response or use the microphone...'}
                            disabled={cargando}
                            className="flex-1 bg-transparent px-5 py-4 text-white outline-none placeholder-white/30 text-sm disabled:opacity-50"
                        />
                        <button onClick={() => enviar()} disabled={!textoUsuario.trim() || cargando} className="px-5 bg-white/5 hover:bg-cyan-400/20 text-white/50 hover:text-cyan-400 transition-all disabled:opacity-30">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <p className="text-white/25 text-xs">Speak naturally in English • Claude AI evaluates your conversation</p>
            </div>
        </div>
    );
}

export default function AirportConversation({ nivel = 'B1', onVolver }) {
    const [escenarioIdx, setEscenario] = useState(null);

    if (escenarioIdx !== null) return (
        <EscenaInmersiva escenario={ESCENARIOS[escenarioIdx]} onVolver={() => setEscenario(null)} nivel={nivel} />
    );

    return <SelectorEscenarios onSeleccionar={setEscenario} onVolver={onVolver} />;
}
