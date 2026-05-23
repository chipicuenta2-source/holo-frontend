import { useState, useEffect } from 'react';
import { BookOpen, Mic, Headphones, Key, Trophy, Star } from 'lucide-react';

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

const moduloConfig = {
    grammar:    { icono: <BookOpen size={18} />,  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   label: 'Grammar'    },
    vocabulary: { icono: <Key size={18} />,        color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'Vocabulary' },
    listening:  { icono: <Headphones size={18} />, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'Listening'  },
    speaking:   { icono: <Mic size={18} />,        color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Speaking'   },
};

export default function ProgresoEstudiante({ userId }) {
    const [data, setData]         = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!userId) return;
        apiFetch(`/admin/progreso/${userId}`)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setCargando(false));
    }, [userId]);

    if (cargando) return (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <p className="text-cyan-400 animate-pulse font-bold text-center">Loading progress...</p>
        </div>
    );

    if (!data) return null;

    const { progreso, speaking } = data;

    const totalStardust  = progreso.reduce((sum, p) => sum + p.stardust_ganado, 0);
    const totalCorrectas = progreso.reduce((sum, p) => sum + p.respuestas_correctas, 0);
    const totalPreguntas = progreso.reduce((sum, p) => sum + p.preguntas_respondidas, 0);
    const precision      = totalPreguntas > 0 ? Math.round((totalCorrectas / totalPreguntas) * 100) : 0;

    return (
        <div className="space-y-4 mt-4">

            {/* Resumen general */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Trophy size={18} /> My Progress
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <p className="text-2xl font-black text-cyan-400">{totalPreguntas}</p>
                        <p className="text-gray-500 text-xs mt-1">Questions answered</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <p className={`text-2xl font-black ${precision >= 70 ? 'text-green-400' : precision >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {precision}%
                        </p>
                        <p className="text-gray-500 text-xs mt-1">Accuracy</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                        <p className="text-2xl font-black text-yellow-400">✨ {totalStardust}</p>
                        <p className="text-gray-500 text-xs mt-1">Total Stardust</p>
                    </div>
                </div>
            </div>

            {/* Progreso por módulo */}
            {progreso.length > 0 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-cyan-400 mb-4 uppercase tracking-widest">
                        Progress by Module
                    </h3>
                    <div className="space-y-4">
                        {progreso.map((p, i) => {
                            const config = moduloConfig[p.modulo] ?? moduloConfig.grammar;
                            const pct    = p.preguntas_respondidas > 0
                                ? Math.round((p.respuestas_correctas / p.preguntas_respondidas) * 100)
                                : 0;
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`flex items-center gap-2 font-bold ${config.color}`}>
                                            {config.icono}
                                            {config.label}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-gray-400">
                                                {p.respuestas_correctas}/{p.preguntas_respondidas}
                                            </span>
                                            <span className="text-yellow-400 font-bold">✨ {p.stardust_ganado}</span>
                                            <span className={`font-black ${pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                pct >= 70 ? 'bg-green-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Historial Speaking */}
            {speaking.length > 0 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-orange-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Mic size={18} /> Speaking History
                    </h3>
                    <div className="space-y-3">
                        {speaking.map((s, i) => (
                            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Star size={16} className={s.puntaje >= 80 ? 'text-green-400' : s.puntaje >= 50 ? 'text-yellow-400' : 'text-red-400'} />
                                        <span className={`font-black ${s.puntaje >= 80 ? 'text-green-400' : s.puntaje >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {s.puntaje}/100
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        {new Date(s.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    <span className="text-gray-500">Should say:</span> "{s.texto_original}"
                                </p>
                                <p className="text-white text-sm mt-1">
                                    <span className="text-gray-500">Said:</span> "{s.texto_reconocido}"
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {progreso.length === 0 && speaking.length === 0 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
                    <p className="text-4xl mb-3">🚀</p>
                    <p className="text-gray-400">No activity yet. Start exploring the modules!</p>
                </div>
            )}
        </div>
    );
}
