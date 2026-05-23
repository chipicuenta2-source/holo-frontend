// ══════════════════════════════════════════════════════════════
//  src/components/HoloLogin.jsx
//  Pantalla de login conectada a Laravel API
// ══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useAuth } from '../hooks/useHoloApi';

export default function HoloLogin({ onSuccess }) {
    const { login } = useAuth();
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            onSuccess?.();
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen flex items-center justify-center relative">
            {/* Fondo espacial igual al resto de la app */}
            <div className="absolute inset-0 bg-[#050510]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,0,153,0.3)_0%,transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,100,200,0.15)_0%,transparent_60%)]" />
            </div>

            <div className="z-10 w-full max-w-sm p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(77,0,153,0.3)]">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(69,243,255,0.6)]">
                        <span className="text-lg font-black text-cyan-400 tracking-widest">HOLO</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 tracking-widest">
                        HOLO
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Space English Learning Hub</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="tu@correo.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-[#050510] bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(69,243,255,0.4)] text-lg mt-2"
                    >
                        {loading ? 'Conectando...' : 'Start Exploration 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}
