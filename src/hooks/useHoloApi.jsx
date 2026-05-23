import { useState, useEffect, createContext, useContext } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/holo';

async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('holo_token');
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? 'Error en la solicitud');
    return data;
}

const HoloAuthContext = createContext(null);

export function HoloAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('holo_token');
        if (!token) { setLoading(false); return; }
        apiFetch('/perfil')
            .then(data => { setUser(data.user); setPerfil(data.perfil); })
            .catch(() => localStorage.removeItem('holo_token'))
            .finally(() => setLoading(false));
    }, []);

    async function login(email, password) {
        const data = await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem('holo_token', data.token);
        localStorage.setItem('holo_rol', data.user.rol);
        setUser(data.user);
        setPerfil(data.perfil);
        return data;
    }

    async function logout() {
        try { await apiFetch('/logout', { method: 'POST' }); } catch {}
        localStorage.removeItem('holo_token');
        localStorage.removeItem('holo_rol');
        setUser(null);
        setPerfil(null);
    }

    async function actualizarPerfil(cambios) {
        const data = await apiFetch('/perfil', {
            method: 'PATCH',
            body: JSON.stringify(cambios),
        });
        setPerfil(data.perfil);
        return data.perfil;
    }

    function sumarStardust(cantidad) {
        setPerfil(prev => prev ? { ...prev, stardust: prev.stardust + cantidad } : prev);
    }

    return (
        <HoloAuthContext.Provider value={{
            user, perfil, loading,
            login, logout, actualizarPerfil, sumarStardust,
            isLogged: !!user,
        }}>
            {children}
        </HoloAuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(HoloAuthContext);
}

export function usePreguntas(modulo, nivel = 'B1') {
    const [preguntas, setPreguntas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!modulo) return;
        setCargando(true);
        apiFetch(`/preguntas/${modulo}?nivel=${nivel}`)
            .then(data => setPreguntas(data.preguntas))
            .catch(e => setError(e.message))
            .finally(() => setCargando(false));
    }, [modulo, nivel]);

    return { preguntas, cargando, error };
}

export function useResponder() {
    const { sumarStardust } = useAuth();

    async function responder({ modulo, nivel = 'B1', preguntaId, correcta }) {
        const data = await apiFetch('/respuesta', {
            method: 'POST',
            body: JSON.stringify({ modulo, nivel, pregunta_id: preguntaId, correcta }),
        });
        sumarStardust(data.stardust_ganado);
        return data;
    }

    return { responder };
}

export function useSpeaking() {
    const { sumarStardust } = useAuth();
    const [feedback, setFeedback] = useState(null);
    const [evaluando, setEvaluando] = useState(false);

    async function evaluar(textoOriginal, textoReconocido) {
        setEvaluando(true);
        try {
            const data = await apiFetch('/speaking', {
                method: 'POST',
                body: JSON.stringify({
                    texto_original: textoOriginal,
                    texto_reconocido: textoReconocido,
                }),
            });
            setFeedback(data);
            sumarStardust(data.stardust_ganado);
            return data;
        } finally {
            setEvaluando(false);
        }
    }

    return { evaluar, feedback, evaluando };
}
