import { useState, useEffect } from 'react';
import { Users, BookOpen, Trophy, Plus, Trash2, Edit2, X, Check, ChevronDown } from 'lucide-react';

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

// ── Modal reutilizable ────────────────────────────────
function Modal({ titulo, onCerrar, children }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-white">{titulo}</h3>
                    <button onClick={onCerrar} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ── Formulario de usuario ─────────────────────────────
function FormUsuario({ onGuardar, onCerrar, inicial = {} }) {
    const [form, setForm] = useState({
        name:     inicial.name     ?? '',
        email:    inicial.email    ?? '',
        password: '',
        rol:      inicial.rol      ?? 'estudiante',
        nivel:    inicial.nivel    ?? 'B1',
    });
    const [cargando, setCargando] = useState(false);
    const [error, setError]       = useState('');

    const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    async function handleSubmit() {
        if (!form.name || !form.email) { setError('Nombre y email son requeridos.'); return; }
        if (!inicial.id && !form.password) { setError('La contraseña es requerida.'); return; }
        setCargando(true);
        try {
            await onGuardar(form);
            onCerrar();
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Nombre</label>
                <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Nombre completo"
                />
            </div>

            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Email</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    placeholder="email@ejemplo.com"
                />
            </div>

            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">
                    Contraseña {inicial.id && '(dejar vacío para no cambiar)'}
                </label>
                <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    placeholder="••••••••"
                />
            </div>

            <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Rol</label>
                    <div className="flex gap-2">
                        {['estudiante', 'profesor', 'superadmin'].map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setForm({...form, rol: r})}
                                className={`flex-1 py-2 px-3 rounded-xl border font-bold text-sm transition-all ${
                                    form.rol === r
                                        ? 'bg-cyan-400 text-[#050510] border-cyan-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/30'
                                }`}
                            >
                                {r === 'estudiante' ? '🎓 Estudiante' : r === 'profesor' ? '👨‍🏫 Profesor' : '👑 Admin'}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Nivel</label>
                    <div className="grid grid-cols-3 gap-2">
                        {niveles.map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setForm({...form, nivel: n})}
                                className={`py-2 px-3 rounded-xl border font-bold text-sm transition-all ${
                                    form.nivel === n
                                        ? 'bg-cyan-400 text-[#050510] border-cyan-400'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-cyan-400/30'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={cargando}
                className="w-full py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all disabled:opacity-50 mt-2"
            >
                {cargando ? 'Guardando...' : inicial.id ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
        </div>
    );
}

// ── Formulario de grupo ───────────────────────────────
function FormGrupo({ profesores, onGuardar, onCerrar }) {
    const [form, setForm]         = useState({ nombre: '', profesor_id: '', nivel: 'B1', descripcion: '' });
    const [cargando, setCargando] = useState(false);
    const [error, setError]       = useState('');
    const niveles = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    async function handleSubmit() {
        if (!form.nombre || !form.profesor_id) { setError('Nombre y profesor son requeridos.'); return; }
        setCargando(true);
        try {
            await onGuardar(form);
            onCerrar();
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Nombre del Grupo</label>
                <input
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm({...form, nombre: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Ej: Grupo A - Mañana"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Profesor</label>
                    <select
                        value={form.profesor_id}
                        onChange={e => setForm({...form, profesor_id: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    >
                        <option value="">Seleccionar...</option>
                        {profesores.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Nivel</label>
                    <select
                        value={form.nivel}
                        onChange={e => setForm({...form, nivel: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    >
                        {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1 block">Descripción (opcional)</label>
                <input
                    type="text"
                    value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Descripción del grupo"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={cargando}
                className="w-full py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all disabled:opacity-50"
            >
                {cargando ? 'Creando...' : 'Crear Grupo'}
            </button>
        </div>
    );
}

// ── Panel principal ───────────────────────────────────
export default function AdminPanel({ user }) {
    const [tab, setTab]               = useState('dashboard');
    const [dashboard, setDashboard]   = useState(null);
    const [usuarios, setUsuarios]     = useState([]);
    const [grupos, setGrupos]         = useState([]);
    const [cargando, setCargando]     = useState(false);

    const [modalUsuario, setModalUsuario] = useState(false);
    const [modalGrupo, setModalGrupo]     = useState(false);
    const [editandoUsuario, setEditando]  = useState(null);
    const [grupoExpandido, setGrupoExp]   = useState(null);
    const [asignandoGrupo, setAsignando]  = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [estudianteAsignar, setEstAsig] = useState('');

    useEffect(() => { 
        cargarDashboard(); 
        cargarUsuarios(); // ← agregar esta línea
    }, []);
    useEffect(() => {
        if (tab === 'usuarios') cargarUsuarios();
        if (tab === 'grupos')   cargarGrupos();
    }, [tab]);

    async function cargarDashboard() {
        setCargando(true);
        try {
            const data = await apiFetch('/admin/dashboard');
            setDashboard(data);
        } finally {
            setCargando(false);
        }
    }

    async function cargarUsuarios() {
        setCargando(true);
        try {
            const data = await apiFetch('/admin/usuarios');
            setUsuarios(data.usuarios);
        } finally {
            setCargando(false);
        }
    }

    async function cargarGrupos() {
        setCargando(true);
        try {
            const data = await apiFetch('/admin/grupos');
            setGrupos(data.grupos);
        } finally {
            setCargando(false);
        }
    }

    async function crearUsuario(form) {
        await apiFetch('/admin/usuarios', {
            method: 'POST',
            body: JSON.stringify(form),
        });
        cargarUsuarios();
        cargarDashboard();
    }

    async function editarUsuario(form) {
        const body = {...form};
        if (!body.password) delete body.password;
        await apiFetch(`/admin/usuarios/${editandoUsuario.id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
        cargarUsuarios();
    }

    async function eliminarUsuario(id) {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        await apiFetch(`/admin/usuarios/${id}`, { method: 'DELETE' });
        cargarUsuarios();
        cargarDashboard();
    }

    async function crearGrupo(form) {
        await apiFetch('/admin/grupos', {
            method: 'POST',
            body: JSON.stringify(form),
        });
        cargarGrupos();
        cargarDashboard();
    }

    async function asignarEstudiante(grupoId) {
        if (!estudianteAsignar) return;
        await apiFetch(`/admin/grupos/${grupoId}/asignar`, {
            method: 'POST',
            body: JSON.stringify({ estudiante_id: parseInt(estudianteAsignar) }),
        });
        setEstAsig('');
        setAsignando(null);
        cargarGrupos();
    }

    async function quitarEstudiante(grupoId, estudianteId) {
        if (!confirm('¿Quitar estudiante del grupo?')) return;
        await apiFetch(`/admin/grupos/${grupoId}/estudiante/${estudianteId}`, { method: 'DELETE' });
        cargarGrupos();
    }

    const profesores  = usuarios.filter(u => u.rol === 'profesor');
    const estudiantes = usuarios.filter(u => u.rol === 'estudiante');

    const rolColor = (rol) => ({
        superadmin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        profesor:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
        estudiante: 'bg-green-500/20 text-green-400 border-green-500/30',
    }[rol] ?? 'bg-white/10 text-gray-400 border-white/10');

    const rolEmoji = (rol) => ({ superadmin: '👑', profesor: '👨‍🏫', estudiante: '🎓' }[rol] ?? '👤');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'usuarios',  label: 'Usuarios',  icon: '👥' },
        { id: 'grupos',    label: 'Grupos',    icon: '🏫' },
    ];

    return (
        <div className="h-screen w-screen flex text-gray-200 overflow-hidden"
             style={{ background: 'radial-gradient(ellipse at top, rgba(77,0,153,0.3) 0%, #050510 60%), #050510' }}>

            {/* Sidebar */}
            <div className="w-64 m-4 flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex-shrink-0">
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-white border-b-2 border-cyan-400 pb-2">HOLO</h2>
                    <p className="text-xs text-cyan-400 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {tabs.map(t => (
                        <div
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`p-4 flex items-center gap-3 rounded-2xl cursor-pointer transition-all ${
                                tab === t.id
                                    ? 'bg-cyan-400/10 border-l-4 border-cyan-400 text-cyan-400'
                                    : 'hover:bg-white/5 text-gray-400 border-l-4 border-transparent'
                            }`}
                        >
                            <span>{t.icon}</span>
                            <span className="font-semibold">{t.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-yellow-400 mb-3">👑 Superadmin</p>
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

            {/* Contenido */}
            <div className="flex-1 m-4 ml-0 flex flex-col gap-4 overflow-hidden">

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl py-4 px-8 rounded-3xl border border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white capitalize">{tab}</h2>
                    <div className="flex gap-3">
                        {tab === 'usuarios' && (
                            <button
                                onClick={() => { setEditando(null); setModalUsuario(true); }}
                                className="px-4 py-2 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Nuevo Usuario
                            </button>
                        )}
                        {tab === 'grupos' && (
                            <button
                                onClick={() => setModalGrupo(true)}
                                className="px-4 py-2 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all flex items-center gap-2 text-sm"
                            >
                                <Plus size={16} /> Nuevo Grupo
                            </button>
                        )}
                    </div>
                </div>

                {/* Contenido del tab */}
                <div className="flex-1 overflow-y-auto">

                    {/* Dashboard */}
                    {tab === 'dashboard' && dashboard && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Usuarios',    value: dashboard.stats.total_usuarios,    emoji: '👥', color: 'border-cyan-500' },
                                    { label: 'Profesores',        value: dashboard.stats.total_profesores,  emoji: '👨‍🏫', color: 'border-blue-500' },
                                    { label: 'Estudiantes',       value: dashboard.stats.total_estudiantes, emoji: '🎓', color: 'border-green-500' },
                                    { label: 'Grupos Activos',    value: dashboard.stats.total_grupos,      emoji: '🏫', color: 'border-purple-500' },
                                ].map((stat, i) => (
                                    <div key={i} className={`bg-white/5 rounded-2xl border-t-4 ${stat.color} p-6`}>
                                        <p className="text-3xl mb-2">{stat.emoji}</p>
                                        <p className="text-3xl font-black text-white">{stat.value}</p>
                                        <p className="text-gray-400 text-sm">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Top estudiantes */}
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                        <Trophy size={20} /> Top Estudiantes
                                    </h3>
                                    <div className="space-y-3">
                                        {dashboard.top_estudiantes.map((est, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-gray-500">#{i + 1}</span>
                                                    <div>
                                                        <p className="text-white font-bold text-sm">{est.name}</p>
                                                        <p className="text-gray-500 text-xs">Level {est.nivel}</p>
                                                    </div>
                                                </div>
                                                <span className="text-cyan-400 font-bold text-sm">✨ {est.stardust}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actividad módulos */}
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                        <BookOpen size={20} /> Actividad por Módulo
                                    </h3>
                                    <div className="space-y-4">
                                        {dashboard.actividad_modulos.map((mod, i) => {
                                            const maxVal = Math.max(...dashboard.actividad_modulos.map(m => parseInt(m.total)));
                                            const pct    = Math.round((parseInt(mod.total) / maxVal) * 100);
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-gray-400 text-sm capitalize">{mod.modulo}</span>
                                                        <span className="text-white font-bold text-sm">{mod.total}</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Usuarios */}
                    {tab === 'usuarios' && (
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Usuario</th>
                                        <th className="text-left p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Email</th>
                                        <th className="text-left p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Rol</th>
                                        <th className="text-left p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Nivel</th>
                                        <th className="text-left p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Stardust</th>
                                        <th className="text-right p-4 text-gray-400 font-bold text-sm uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <p className="text-white font-bold">{u.name}</p>
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${rolColor(u.rol)}`}>
                                                    {rolEmoji(u.rol)} {u.rol}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-cyan-400 font-bold text-sm">{u.nivel}</span>
                                            </td>
                                            <td className="p-4 text-white font-bold">✨ {u.stardust}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => { setEditando(u); setModalUsuario(true); }}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-cyan-400/20 text-gray-400 hover:text-cyan-400 transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarUsuario(u.id)}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-400/20 text-gray-400 hover:text-red-400 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {cargando && <p className="text-center text-gray-400 py-8 animate-pulse">Cargando usuarios...</p>}
                            {!cargando && usuarios.length === 0 && <p className="text-center text-gray-400 py-8">No hay usuarios registrados.</p>}
                        </div>
                    )}

                    {/* Grupos */}
                    {tab === 'grupos' && (
                        <div className="space-y-4">
                            {cargando && <p className="text-center text-gray-400 py-8 animate-pulse">Cargando grupos...</p>}
                            {!cargando && grupos.length === 0 && (
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center">
                                    <p className="text-gray-400 text-lg mb-4">No hay grupos creados aún.</p>
                                    <button
                                        onClick={() => setModalGrupo(true)}
                                        className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all"
                                    >
                                        + Crear primer grupo
                                    </button>
                                </div>
                            )}
                            {grupos.map(grupo => (
                                <div key={grupo.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-visible">
                                    <div
                                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => setGrupoExp(grupoExpandido === grupo.id ? null : grupo.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-xl">
                                                🏫
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{grupo.nombre}</h3>
                                                <p className="text-gray-400 text-sm">
                                                    👨‍🏫 {grupo.profesor?.name ?? 'Sin profesor'} •
                                                    Level {grupo.nivel} •
                                                    {grupo.total_estudiantes} estudiantes
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            size={20}
                                            className={`text-gray-400 transition-transform ${grupoExpandido === grupo.id ? 'rotate-180' : ''}`}
                                        />
                                    </div>

                                    {grupoExpandido === grupo.id && (
                                        <div className="border-t border-white/10 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm">Estudiantes</h4>
                                                <button
                                                    onClick={() => setAsignando(asignandoGrupo === grupo.id ? null : grupo.id)}
                                                    className="text-xs px-3 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-all font-bold"
                                                >
                                                    + Asignar Estudiante
                                                </button>
                                            </div>

                                            {asignandoGrupo === grupo.id && (
                                                    <div className="flex gap-3 mb-4">
                                                        <div style={{ flex: 1, position: 'relative' }}>
                                                            <div
                                                                onClick={() => setDropdownOpen(dropdownOpen === grupo.id ? null : grupo.id)}
                                                                style={{
                                                                    background: '#0d0d20', border: '1px solid rgba(34,211,238,0.3)',
                                                                    borderRadius: '12px', padding: '10px 36px 10px 16px',
                                                                    color: estudianteAsignar ? 'white' : '#6b7280',
                                                                    cursor: 'pointer', fontSize: '0.875rem', userSelect: 'none',
                                                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2322d3ee' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                                                                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
                                                                }}
                                                            >
                                                                {estudianteAsignar
                                                                    ? estudiantes.find(e => String(e.id) === String(estudianteAsignar))?.name ?? 'Seleccionar...'
                                                                    : 'Seleccionar estudiante...'}
                                                            </div>
                                                            {dropdownOpen === grupo.id && (
                                                                <div style={{
                                                                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                                                                    background: '#0d0d20', border: '1px solid rgba(34,211,238,0.3)',
                                                                    borderRadius: '12px', marginTop: '4px', maxHeight: '200px',
                                                                    overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                                                }}>
                                                                    {estudiantes
                                                                        .filter(e => !grupo.estudiantes.find(ge => ge.id === e.id))
                                                                        .map(e => (
                                                                            <div
                                                                                key={e.id}
                                                                                onClick={() => { setEstAsig(String(e.id)); setDropdownOpen(null); }}
                                                                                style={{
                                                                                    padding: '10px 16px', color: 'white', cursor: 'pointer',
                                                                                    fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                                                    background: String(estudianteAsignar) === String(e.id) ? 'rgba(34,211,238,0.1)' : 'transparent',
                                                                                }}
                                                                                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(34,211,238,0.1)'}
                                                                                onMouseLeave={ev => ev.currentTarget.style.background = String(estudianteAsignar) === String(e.id) ? 'rgba(34,211,238,0.1)' : 'transparent'}
                                                                            >
                                                                                {e.name}
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => asignarEstudiante(grupo.id)}
                                                            className="px-4 py-2 rounded-xl bg-cyan-400 text-[#050510] font-bold hover:bg-cyan-300 transition-all"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    </div>
                                                )}

                                            {grupo.estudiantes.length === 0 ? (
                                                <p className="text-gray-500 text-sm">No hay estudiantes asignados.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {grupo.estudiantes.map(est => (
                                                        <div key={est.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                                                            <div>
                                                                <p className="text-white font-bold text-sm">{est.name}</p>
                                                                <p className="text-gray-500 text-xs">{est.email} • Level {est.nivel} • ✨ {est.stardust}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => quitarEstudiante(grupo.id, est.id)}
                                                                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-400/20 text-gray-400 hover:text-red-400 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal crear/editar usuario */}
            {modalUsuario && (
                <Modal
                    titulo={editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                    onCerrar={() => { setModalUsuario(false); setEditando(null); }}
                >
                    <FormUsuario
                        inicial={editandoUsuario ?? {}}
                        onGuardar={editandoUsuario ? editarUsuario : crearUsuario}
                        onCerrar={() => { setModalUsuario(false); setEditando(null); }}
                    />
                </Modal>
            )}

            {/* Modal crear grupo */}
            {modalGrupo && (
                <Modal titulo="Nuevo Grupo" onCerrar={() => setModalGrupo(false)}>
                    <FormGrupo
                        profesores={profesores}
                        onGuardar={crearGrupo}
                        onCerrar={() => setModalGrupo(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
