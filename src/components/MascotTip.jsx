import { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';

const mascotas = [
    { img: '/mascot-orange.png', nombre: 'Momo', color: '#f97316' },
    { img: '/mascot-purple.png', nombre: 'Nia',  color: '#a855f7' },
    { img: '/mascot-blue.png',   nombre: 'Lumo', color: '#22d3ee' },
];

const contextoPorPantalla = {
    'Star Map':          'Give a short motivational tip in English for a language learner starting their session. Max 2 sentences.',
    'Speaking Practice': 'Give a quick English speaking tip or common phrase to practice. Max 2 sentences.',
    'Cosmic Listening':  'Give a tip for improving English listening skills. Max 2 sentences.',
    'Game Planet':       'Give a fun English vocabulary tip or word game suggestion. Max 2 sentences.',
    'Grammar':           'Give a simple English grammar tip or common mistake to avoid. Max 2 sentences.',
    'My Profile':        'Give an encouraging message about language learning progress. Max 2 sentences.',
};

export default function MascotTip({ pantalla }) {
    const [visible, setVisible]     = useState(false);
    const [tip, setTip]             = useState('');
    const [cargando, setCargando]   = useState(false);
    const [mascota]                 = useState(() => mascotas[Math.floor(Math.random() * mascotas.length)]);
    const [bounce, setBounce]       = useState(false);
    const timerRef                  = useRef(null);

    useEffect(() => {
        // Mostrar mascota después de 3 segundos de entrar a la pantalla
        timerRef.current = setTimeout(() => {
            setVisible(true);
            generarTip();
        }, 3000);

        return () => clearTimeout(timerRef.current);
    }, [pantalla]);

   async function generarTip() {
    setCargando(true);
    setTip('');
    try {
        const contexto = contextoPorPantalla[pantalla] ?? 'Give a short English learning tip. Max 2 sentences.';
        const token = localStorage.getItem('holo_token');
        const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/holo';
        const response = await fetch(`${API_BASE}/tip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ contexto }),
        });
        const data = await response.json();
        setTip(data.tip ?? "Keep practicing! Every day you get better! 🌟");
    } catch {
        setTip("Keep practicing! Every day you get better! 🌟");
    } finally {
        setCargando(false);
        setBounce(true);
        setTimeout(() => setBounce(false), 600);
    }
}

    if (!visible) {
        return (
            <div
                onClick={() => { setVisible(true); generarTip(); }}
                style={{
                    position: 'fixed', bottom: '80px', right: '20px', zIndex: 999,
                    cursor: 'pointer', transition: 'transform 0.2s',
                    animation: 'float 3s ease-in-out infinite',
                }}
            >
                <img
                    src={mascota.img}
                    alt={mascota.nombre}
                    style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
                />
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: '80px', right: '20px', zIndex: 999,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
            maxWidth: '300px',
        }}>
            {/* Burbuja de tip */}
            <div style={{
                background: 'rgba(10,10,30,0.95)', border: `1px solid ${mascota.color}40`,
                borderRadius: '20px 20px 4px 20px', padding: '16px',
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${mascota.color}20`,
                position: 'relative',
            }}>
                {/* Botones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: mascota.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {mascota.nombre} says:
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={generarTip}
                            disabled={cargando}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px', display: 'flex' }}
                        >
                            <RefreshCw size={14} style={{ animation: cargando ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                        <button
                            onClick={() => setVisible(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px', display: 'flex' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Texto */}
                {cargando ? (
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mascota.color, animation: 'pulse 0.8s ease-in-out infinite' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mascota.color, animation: 'pulse 0.8s ease-in-out 0.2s infinite' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mascota.color, animation: 'pulse 0.8s ease-in-out 0.4s infinite' }} />
                    </div>
                ) : (
                    <p style={{ color: 'white', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>{tip}</p>
                )}

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
                `}</style>
            </div>

            {/* Mascota */}
            <img
                src={mascota.img}
                alt={mascota.nombre}
                onClick={() => { setVisible(false); }}
                style={{
                    width: '80px', height: '80px', objectFit: 'contain',
                    cursor: 'pointer', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
                    animation: bounce ? 'bounce 0.6s ease' : 'float 3s ease-in-out infinite',
                    transition: 'transform 0.2s',
                }}
            />
        </div>
    );
}
