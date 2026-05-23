import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, Star, RotateCcw, ArrowLeft, X, Globe } from 'lucide-react';

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

// ── Todos los escenarios de inmersión ─────────────────────────
const MUNDOS = [
    {
        categoria: '✈️ Airport',
        color: 'from-blue-900/80',
        escenarios: [
            {
                id: 'checkin',
                titulo: 'Check-in Counter',
                subtitulo: 'Galaxy Airways International Terminal',
                agente: 'NOVA', cargo: 'Check-in Agent', avatar: '👩‍✈️',
                colorAvatar: 'from-blue-600 to-cyan-500',
                imagen: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90',
                mision: 'Check in for Flight GX-309 to Mars 🚀',
                systemPrompt: `You are NOVA, a warm check-in agent at Galaxy Airways. Help the passenger check in for Flight GX-309 to Mars. Guide: greeting → ID → luggage → seat → boarding pass → farewell. Max 2 sentences per response. B1 English. Correct mistakes gently in parentheses. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Welcome to Galaxy Airways! ✨ May I see your passport or booking reference, please?",
            },
            {
                id: 'security',
                titulo: 'Security Checkpoint',
                subtitulo: 'Intergalactic Security Zone',
                agente: 'REX', cargo: 'Security Officer', avatar: '👮',
                colorAvatar: 'from-red-600 to-orange-500',
                imagen: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=90',
                mision: 'Pass security to reach your gate 🔒',
                systemPrompt: `You are REX, a professional security officer. Guide through: documents → remove items → scanner → liquids → clearance. Max 2 sentences. B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good morning! Please have your boarding pass ready. Do you have any liquids or electronics in your bag?",
            },
            {
                id: 'gate',
                titulo: 'Boarding Gate 42',
                subtitulo: 'Final Boarding — Flight to Mars',
                agente: 'LUNA', cargo: 'Gate Agent', avatar: '🧑‍🚀',
                colorAvatar: 'from-purple-600 to-pink-500',
                imagen: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90',
                mision: 'Board your spaceship for liftoff! 🚀',
                systemPrompt: `You are LUNA, enthusiastic gate agent for Flight to Mars. Guide: scan boarding pass → group → flight info → safety → welcome aboard. Max 2 sentences. Exciting tone! Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Welcome to Gate 42! 🚀 So excited for your Mars journey! May I scan your boarding pass?",
            },
        ],
    },
    {
        categoria: '🏨 Hotel',
        color: 'from-amber-900/80',
        escenarios: [
            {
                id: 'hotel_checkin',
                titulo: 'Hotel Check-in',
                subtitulo: 'Galaxy Grand Hotel — Reception',
                agente: 'ARIA', cargo: 'Hotel Receptionist', avatar: '💁‍♀️',
                colorAvatar: 'from-amber-500 to-yellow-400',
                imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90',
                mision: 'Check into your hotel room for the night 🏨',
                systemPrompt: `You are ARIA, a friendly hotel receptionist at Galaxy Grand Hotel. Help check in: greeting → reservation → ID → room type → amenities → key card → directions. Max 2 sentences. Warm professional B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good evening and welcome to Galaxy Grand Hotel! 🌟 Do you have a reservation with us tonight?",
            },
            {
                id: 'hotel_service',
                titulo: 'Room Service',
                subtitulo: 'Galaxy Grand Hotel — Room 404',
                agente: 'MARCO', cargo: 'Room Service', avatar: '🛎️',
                colorAvatar: 'from-orange-500 to-red-400',
                imagen: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=90',
                mision: 'Order food and drinks to your room 🍽️',
                systemPrompt: `You are MARCO, room service at Galaxy Grand Hotel. Help order food: greeting → menu options → take order → special requests → delivery time → farewell. Max 2 sentences. Friendly B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Room service, good evening! 🛎️ How can I help you tonight? Are you ready to order?",
            },
            {
                id: 'hotel_complaint',
                titulo: 'Hotel Complaint',
                subtitulo: 'Galaxy Grand Hotel — Front Desk',
                agente: 'SOFIA', cargo: 'Guest Relations', avatar: '🤝',
                colorAvatar: 'from-rose-500 to-pink-400',
                imagen: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=90',
                mision: 'Report a problem and find a solution 💬',
                systemPrompt: `You are SOFIA, guest relations manager. Handle complaint professionally: listen → apologize → understand problem → offer solution → confirm resolution. Max 2 sentences. Empathetic B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good morning! I'm Sofia from Guest Relations. I understand you had some concerns — I'm here to help. What seems to be the problem?",
            },
        ],
    },
    {
        categoria: '🍽️ Restaurant',
        color: 'from-red-900/80',
        escenarios: [
            {
                id: 'restaurant_order',
                titulo: 'Ordering Food',
                subtitulo: 'Cosmos Bistro — Intergalactic Cuisine',
                agente: 'CARLOS', cargo: 'Waiter', avatar: '🧑‍🍳',
                colorAvatar: 'from-red-500 to-orange-400',
                imagen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=90',
                mision: 'Order your meal at the restaurant 🍽️',
                systemPrompt: `You are CARLOS, a friendly waiter at Cosmos Bistro. Guide: greeting → menu → take order → drinks → special requests → confirm order. Max 2 sentences. Warm B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good evening and welcome to Cosmos Bistro! 🌟 My name is Carlos and I'll be your server tonight. Can I start you off with some drinks?",
            },
            {
                id: 'restaurant_bill',
                titulo: 'Asking for the Bill',
                subtitulo: 'Cosmos Bistro — End of Meal',
                agente: 'ELENA', cargo: 'Waitress', avatar: '👩‍🍳',
                colorAvatar: 'from-pink-500 to-rose-400',
                imagen: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=90',
                mision: 'Ask for the bill and pay for your meal 💳',
                systemPrompt: `You are ELENA, a waitress at Cosmos Bistro. Handle end of meal: check on food → offer dessert → bring bill → payment → change/receipt → farewell. Max 2 sentences. Friendly B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "How was everything tonight? 😊 Did you enjoy your meal? Can I get you anything else — perhaps a dessert or coffee?",
            },
            {
                id: 'restaurant_reservation',
                titulo: 'Making a Reservation',
                subtitulo: 'Cosmos Bistro — Reservations',
                agente: 'MIGUEL', cargo: 'Host', avatar: '📋',
                colorAvatar: 'from-emerald-500 to-teal-400',
                imagen: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1920&q=90',
                mision: 'Make a dinner reservation by phone 📞',
                systemPrompt: `You are MIGUEL, the host at Cosmos Bistro taking a reservation. Ask: date → time → party size → name → special requests → confirm. Max 2 sentences. Professional B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Thank you for calling Cosmos Bistro! 🌟 I'm Miguel. Would you like to make a reservation? What date were you thinking?",
            },
        ],
    },
    {
        categoria: '🏥 Medical',
        color: 'from-green-900/80',
        escenarios: [
            {
                id: 'doctor',
                titulo: 'Doctor Appointment',
                subtitulo: 'Galaxy Medical Center — Consultation Room',
                agente: 'DR. CHEN', cargo: 'General Practitioner', avatar: '👨‍⚕️',
                colorAvatar: 'from-green-500 to-emerald-400',
                imagen: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&q=90',
                mision: 'Describe your symptoms to the doctor 🏥',
                systemPrompt: `You are Dr. Chen, a kind doctor at Galaxy Medical Center. Conduct consultation: greeting → symptoms → duration → pain level → history → diagnosis → prescription. Max 2 sentences. Clear B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good morning! I'm Dr. Chen. Please have a seat. What brings you in today — what symptoms are you experiencing?",
            },
            {
                id: 'pharmacy',
                titulo: 'At the Pharmacy',
                subtitulo: 'Galaxy Pharmacy — Medication Counter',
                agente: 'ANNA', cargo: 'Pharmacist', avatar: '💊',
                colorAvatar: 'from-teal-500 to-cyan-400',
                imagen: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1920&q=90',
                mision: 'Get your prescription filled at the pharmacy 💊',
                systemPrompt: `You are Anna, a helpful pharmacist. Help with prescription: greeting → check prescription → explain medication → dosage → side effects → payment → farewell. Max 2 sentences. Clear B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Hello! Welcome to Galaxy Pharmacy. Do you have a prescription to fill today, or are you looking for something over the counter?",
            },
        ],
    },
    {
        categoria: '🚕 Transport',
        color: 'from-yellow-900/80',
        escenarios: [
            {
                id: 'taxi',
                titulo: 'Taking a Taxi',
                subtitulo: 'Galaxy City — Street Corner',
                agente: 'JAKE', cargo: 'Taxi Driver', avatar: '🚕',
                colorAvatar: 'from-yellow-500 to-amber-400',
                imagen: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=90',
                mision: 'Get to your destination by taxi 🚕',
                systemPrompt: `You are Jake, a friendly taxi driver in Galaxy City. Guide: greeting → destination → route → price estimate → small talk → arrival → payment. Max 2 sentences. Casual B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Hey there! Where are you headed today? I know this city like the back of my hand! 🗺️",
            },
            {
                id: 'train',
                titulo: 'Train Station',
                subtitulo: 'Galaxy Central Station — Ticket Office',
                agente: 'HELEN', cargo: 'Ticket Officer', avatar: '🚆',
                colorAvatar: 'from-slate-500 to-gray-400',
                imagen: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=90',
                mision: 'Buy a train ticket to your destination 🚆',
                systemPrompt: `You are Helen, a ticket officer at Galaxy Central Station. Help buy ticket: destination → date → class → price → payment → platform info → farewell. Max 2 sentences. Professional B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Good morning! Welcome to Galaxy Central Station. Where would you like to travel today?",
            },
            {
                id: 'directions',
                titulo: 'Asking for Directions',
                subtitulo: 'Galaxy City — Street Corner',
                agente: 'PEDRO', cargo: 'Local Resident', avatar: '🗺️',
                colorAvatar: 'from-lime-500 to-green-400',
                imagen: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=90',
                mision: 'Ask a local for directions to your destination 🗺️',
                systemPrompt: `You are Pedro, a helpful local resident in Galaxy City. Give directions: understand destination → give directions (landmarks) → distance → transport options → confirm understanding. Max 2 sentences. Friendly B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
                primerMensaje: "Hi there! You look a little lost — can I help you find somewhere? Where are you trying to get to?",
            },
        ],
    },
];

// Lista plana de todos los escenarios
const TODOS_ESCENARIOS = MUNDOS.flatMap(m => m.escenarios);

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
        u.lang = 'en-US'; u.rate = 0.9; u.pitch = 1.0;
        setAgenteHabla(true);
        u.onend = () => setAgenteHabla(false);
        window.speechSynthesis.speak(u);
    }

    useEffect(() => { setTimeout(() => reproducirVoz(escenario.primerMensaje), 800); }, []);

    function iniciarGrabacion() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { alert('Use the text field — voice not supported.'); return; }
        const r = new SR();
        r.lang = 'en-US'; r.interimResults = false;
        r.onstart  = () => setGrabando(true);
        r.onend    = () => setGrabando(false);
        r.onerror  = () => setGrabando(false);
        r.onresult = (e) => {
            const texto = e.results[0][0].transcript;
            setTexto(texto);
            enviar(texto);
        };
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
            if (data.puntaje) {
                setPuntaje(data.puntaje);
                setStardust(data.stardust_ganado ?? 30);
                setTimeout(() => setFinalizado(true), 2000);
            }
        } catch {
            const f = { rol: 'agente', texto: "I'm sorry, could you repeat that please?" };
            setMensajes(prev => [...prev, f]); setUltimo(f);
        } finally { setCargando(false); }
    }

    if (finalizado) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(5,5,16,0.97)' }}>
            <div className="text-center max-w-md px-8">
                <div className="text-8xl mb-6">🌟</div>
                <h2 className="text-4xl font-black text-white mb-2">Mission Complete!</h2>
                <p className="text-gray-400 mb-8">{escenario.titulo}</p>
                <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-3xl mb-6 ${puntaje >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : puntaje >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <Star size={28} /> {puntaje}/100
                </div>
                <p className="text-cyan-400 font-bold text-xl mb-8">✨ +{stardust} Stardust earned!</p>
                <p className="text-gray-300 mb-8">{puntaje >= 80 ? '🌟 Outstanding performance!' : puntaje >= 60 ? '👍 Good job! Keep practicing.' : '💪 Keep going! Every conversation helps.'}</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={onVolver} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all">← All Scenarios</button>
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

// ── Selector de todos los escenarios ─────────────────────────
export default function ImmersiveConversation({ nivel = 'B1', onVolver }) {
    const [escenarioActivo, setEscenario] = useState(null);
    const [categoriaActiva, setCategoria] = useState(null);

    if (escenarioActivo !== null) return (
        <EscenaInmersiva
            escenario={TODOS_ESCENARIOS[escenarioActivo]}
            onVolver={() => setEscenario(null)}
            nivel={nivel}
        />
    );

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <button onClick={onVolver} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Globe size={28} className="text-cyan-400" /> World Immersion
                    </h2>
                    <p className="text-gray-400 text-sm">Real conversations in real situations • Level {nivel}</p>
                </div>
            </div>

            {/* Categorías */}
            <div className="flex gap-2 flex-wrap flex-shrink-0">
                <button
                    onClick={() => setCategoria(null)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${!categoriaActiva ? 'bg-cyan-400 text-[#050510] border-cyan-400' : 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/30'}`}
                >
                    🌟 All
                </button>
                {MUNDOS.map((mundo, i) => (
                    <button
                        key={i}
                        onClick={() => setCategoria(i === categoriaActiva ? null : i)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${categoriaActiva === i ? 'bg-cyan-400 text-[#050510] border-cyan-400' : 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/30'}`}
                    >
                        {mundo.categoria}
                    </button>
                ))}
            </div>

            {/* Grid de escenarios */}
            <div className="grid grid-cols-3 gap-4 flex-1">
                {MUNDOS.filter((_, i) => categoriaActiva === null || categoriaActiva === i).flatMap((mundo, mundoIdx) =>
                    mundo.escenarios.map((esc, escIdx) => {
                        const globalIdx = TODOS_ESCENARIOS.findIndex(e => e.id === esc.id);
                        return (
                            <div
                                key={esc.id}
                                onClick={() => setEscenario(globalIdx)}
                                className="relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02]"
                                style={{ minHeight: '200px' }}
                            >
                                <img src={esc.imagen} alt={esc.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="relative h-full flex flex-col justify-between p-5">
                                    <div className="self-start px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 text-xs text-white/70 font-bold">
                                        {mundo.categoria}
                                    </div>
                                    <div>
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${esc.colorAvatar} flex items-center justify-center text-xl mb-3`}>
                                            {esc.avatar}
                                        </div>
                                        <h3 className="text-white font-black text-base mb-1">{esc.titulo}</h3>
                                        <p className="text-cyan-300 text-xs font-bold">{esc.mision}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${esc.colorAvatar} flex items-center justify-center text-xs`}>{esc.avatar}</div>
                                            <p className="text-white/60 text-xs">{esc.agente} — {esc.cargo}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
