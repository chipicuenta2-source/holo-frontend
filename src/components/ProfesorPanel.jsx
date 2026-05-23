import { useState, useEffect } from 'react';
import { Trophy, BookOpen, Mic, Headphones, Key, ChevronDown, ArrowLeft } from 'lucide-react';

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

const moduloIcono = {
    grammar:    <BookOpen size={16} />,
    vocabulary: <Key size={16} />,
    listening:  <Headphones size={16} />,
    speaking:   <Mic size={16} />,
};

const moduloColor = {
    grammar:    'text-blue-400',
    vocabulary: 'text-green-400',
    listening:  'text-purple-400',
    speaking:   'text-orange-400',
};

function DetalleEstudiante({ estudianteId, onVolver }) {
    const [data, setData]       = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        apiFetch(`/admin/progreso/${estudianteId}`)
            .then(setData)
            .finally(() => setCargando(false));
    }, [estudianteId]);

    if (cargando) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-cyan-400 animate-pulse font-bold">Cargando progreso...</p>
        </div>
    );

    if (!data) return null;

    const { usuario, progreso, speaking } = data;

    return (
        <div className="space-y-6">
            <button
                onClick={onVolver}
                className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors"
            >
                <ArrowLeft size={18} /> Volver al grupo
            </button>

            {/* Header estudiante */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-cyan-400/10 border-2 border-cyan-400/30 flex items-center justify-center text-2xl">
                    🎓
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-white">{usuario.name}</h3>
                    <p className="text-gray-400">{usuario.email}</p>
                    <div className="flex gap-4 mt-2">
                        <span className="text-xs bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full font-bold border border-cyan-400/20">
                            Level {usuario.nivel}
                        </span>
                        <span className="text-xs bg-white/5 text-gray-300 px-3 py-1 rounded-full font-bold border border-white/10">
                            ✨ {usuario.stardust} Stardust
                        </span>
                    </div>
                </div>
            </div>

            {/* Progreso por módulo */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h4 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-widest">Progreso por Módulo</h4>
                {progreso.length === 0 ? (
                    <p className="text-gray-500">Sin actividad registrada aún.</p>
                ) : (
                    <div className="space-y-4">
                        {progreso.map((p, i) => {
                            const pct = p.preguntas_respondidas > 0
                                ? Math.round((p.respuestas_correctas / p.preguntas_respondidas) * 100)
                                : 0;
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`flex items-center gap-2 font-bold capitalize ${moduloColor[p.modulo] ?? 'text-white'}`}>
                                            {moduloIcono[p.modulo]}
                                            {p.modulo}
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-gray-400">{p.respuestas_correctas}/{p.preguntas_respondidas} correctas</span>
                                            <span className="text-cyan-400 font-bold">✨ {p.stardust_ganado}</span>
                                            <span className={`font-black ${pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Historial Speaking */}
            {speaking.length > 0 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h4 className="text-lg font-bold text-orange-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Mic size={18} /> Historial Speaking
                    </h4>
                    <div className="space-y-3">
                        {speaking.map((s, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-black text-lg ${
                                        s.puntaje >= 80 ? 'text-green-400' :
                                        s.puntaje >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {s.puntaje}/100
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    <span className="text-gray-500">Debía decir:</span> "{s.texto_original}"
                                </p>
                                <p className="text-white text-sm mt-1">
                                    <span className="text-gray-500">Dijo:</span> "{s.texto_reconocido}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfesorPanel({ user }) {
    const [grupos, setGrupos]           = useState([]);
    const [cargando, setCargando]       = useState(true);
    const [grupoExpandido, setGrupoExp] = useState(null);
    const [estudianteDetalle, setDetalle] = useState(null);

    useEffect(() => {
        cargarMisGrupos();
    }, []);

    async function cargarMisGrupos() {
        setCargando(true);
        try {
            const data = await apiFetch('/admin/grupos');
            // Filtrar solo los grupos de este profesor
            const misGrupos = data.grupos.filter(g => g.profesor?.id === user?.id);
            setGrupos(misGrupos);
        } finally {
            setCargando(false);
        }
    }

    if (estudianteDetalle) return (
        <div className="h-screen w-screen flex text-gray-200 overflow-hidden"
             style={{ background: 'radial-gradient(ellipse at top, rgba(77,0,153,0.3) 0%, #050510 60%), #050510' }}>
            <SidebarProfesor user={user} />
            <div className="flex-1 m-4 ml-0 flex flex-col gap-4 overflow-hidden">
                <div className="bg-white/5 backdrop-blur-xl py-4 px-8 rounded-3xl border border-white/10 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Progreso del Estudiante</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <DetalleEstudiante
                        estudianteId={estudianteDetalle}
                        onVolver={() => setDetalle(null)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-screen flex text-gray-200 overflow-hidden"
             style={{ background: 'radial-gradient(ellipse at top, rgba(77,0,153,0.3) 0%, #050510 60%), #050510' }}>

            <SidebarProfesor user={user} />

            {/* Contenido */}
            <div className="flex-1 m-4 ml-0 flex flex-col gap-4 overflow-hidden">

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl py-4 px-8 rounded-3xl border border-white/10 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Mis Grupos</h2>
                        <p className="text-gray-400 text-sm">{grupos.length} grupo{grupos.length !== 1 ? 's' : ''} asignado{grupos.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Grupos */}
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cargando && (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-cyan-400 animate-pulse font-bold">Cargando grupos...</p>
                        </div>
                    )}

                    {!cargando && grupos.length === 0 && (
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                            <p className="text-4xl mb-4">🏫</p>
                            <p className="text-gray-400 text-lg">No tienes grupos asignados aún.</p>
                            <p className="text-gray-500 text-sm mt-2">El administrador te asignará grupos próximamente.</p>
                        </div>
                    )}

                    {grupos.map(grupo => (
                        <div key={grupo.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            {/* Header grupo */}
                            <div
                                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setGrupoExp(grupoExpandido === grupo.id ? null : grupo.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl">
                                        🏫
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{grupo.nombre}</h3>
                                        <p className="text-gray-400 text-sm">
                                            Level {grupo.nivel} • {grupo.total_estudiantes} estudiante{grupo.total_estudiantes !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`text-gray-400 transition-transform ${grupoExpandido === grupo.id ? 'rotate-180' : ''}`}
                                />
                            </div>

                            {/* Estudiantes del grupo */}
                            {grupoExpandido === grupo.id && (
                                <div className="border-t border-white/10 p-6">
                                    <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4">
                                        Estudiantes
                                    </h4>

                                    {grupo.estudiantes.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No hay estudiantes en este grupo.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {grupo.estudiantes.map(est => (
                                                <div
                                                    key={est.id}
                                                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer group"
                                                    onClick={() => setDetalle(est.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-lg">
                                                            🎓
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold">{est.name}</p>
                                                            <p className="text-gray-500 text-xs">{est.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-cyan-400 font-bold text-sm">Level {est.nivel}</p>
                                                            <p className="text-gray-400 text-xs">✨ {est.stardust} Stardust</p>
                                                        </div>
                                                        <span className="text-xs text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Ver progreso →
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SidebarProfesor({ user }) {
    return (
        <div className="w-64 m-4 flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex-shrink-0">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white border-b-2 border-cyan-400 pb-2">HOLO</h2>
                <p className="text-xs text-cyan-400 mt-1 font-bold uppercase tracking-widest">Profesor Panel</p>
            </div>

            <div className="flex-1">
                <div className="p-4 flex items-center gap-3 rounded-2xl bg-cyan-400/10 border-l-4 border-cyan-400 text-cyan-400">
                    <span>🏫</span>
                    <span className="font-semibold">Mis Grupos</span>
                </div>
            </div>

            <div className="border-t border-white/10 pt-4">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-blue-400 mb-3">👨‍🏫 Profesor</p>
                <button
                    onClick={() => {
                        localStorage.removeItem('holo_token');
                        localStorage.removeItem('holo_rol');
                        window.location.reload();
                    }}
                    className="w-full py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-bold"
                >
                    Salir
                </button>
            </div>
        </div>
    );
}
