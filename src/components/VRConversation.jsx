import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mic, Send, Volume2, ArrowLeft, Star, RotateCcw } from 'lucide-react';

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

const ESCENARIOS_VR = [
    {
        id: 'vr_airport',
        titulo: 'Airport Check-in',
        agente: 'NOVA', cargo: 'Check-in Agent', avatar: '👩‍✈️',
        skyColor: 0x87CEEB, fogColor: 0xCCDDEE,
        ambientColor: 0xffffff, lightColor: 0xfff5e0,
        ambiente: 'airport',
        systemPrompt: `You are NOVA, a check-in agent at an intergalactic airport in VR. Guide: greeting → ID → luggage → seat → boarding pass. Max 2 sentences. B1 English. Correct mistakes gently in parentheses. End with [SCORE:XX] after 8 exchanges.`,
        primerMensaje: "Welcome! You're now standing at the Galaxy Airways check-in counter. May I see your passport, please? 🛫",
        mision: 'VR Mission: Check in for your flight to Mars',
    },
    {
        id: 'vr_hotel',
        titulo: 'Hotel Lobby',
        agente: 'ARIA', cargo: 'Hotel Receptionist', avatar: '💁‍♀️',
        skyColor: 0xF5E6D0, fogColor: 0xF0E0C8,
        ambientColor: 0xFFE8C8, lightColor: 0xFFD700,
        ambiente: 'hotel',
        systemPrompt: `You are ARIA, hotel receptionist in a VR hotel lobby. Guide: greeting → reservation → ID → room → amenities → key. Max 2 sentences. B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
        primerMensaje: "Good evening! Welcome to Galaxy Grand Hotel. Do you have a reservation with us? 🏨",
        mision: 'VR Mission: Check into your hotel room',
    },
    {
        id: 'vr_restaurant',
        titulo: 'Restaurant Table',
        agente: 'CARLOS', cargo: 'Waiter', avatar: '🧑‍🍳',
        skyColor: 0x1a0a00, fogColor: 0x2D1B0E,
        ambientColor: 0xFF8C00, lightColor: 0xFF6B35,
        ambiente: 'restaurant',
        systemPrompt: `You are CARLOS, a waiter in a VR restaurant. Guide: greeting → menu → order → drinks → confirm. Max 2 sentences. Friendly B1 English. Correct mistakes gently. End with [SCORE:XX] after 8 exchanges.`,
        primerMensaje: "Good evening! Welcome to Cosmos Bistro. My name is Carlos — can I get you started with some drinks? 🍽️",
        mision: 'VR Mission: Order your dinner at the restaurant',
    },
];

class VRAmbiente {
    constructor(canvas, escenario) {
        this.escenario   = escenario;
        this.isDestroyed = false;
        this.prevTime    = performance.now();

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.xr.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(escenario.skyColor);
        // sin fog para no blanquear la imagen 360

        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
        this.camera.position.set(0, 1.6, 1);
        

        const ambient = new THREE.AmbientLight(0x606060, 1.5);
        this.scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0x808080, 0.3);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        this.mouseControl = { active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0 };
        this.setupMouseControl(canvas);

        if (escenario.ambiente === 'airport')    this.construirAeropuerto();
        else if (escenario.ambiente === 'hotel') this.construirHotel();
        else                                      this.construirRestaurante();

        this.cargarRobot();
        this.animate();
    }

    cargarRobot() {
        const loader = new GLTFLoader();
        loader.load(
            'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
            (gltf) => {
                if (this.isDestroyed) return;
                const robot = gltf.scene;
                robot.position.set(0, 0, -3.5);
                robot.scale.set(0.6, 0.6, 0.6);
                this.scene.add(robot);
                this.robot = robot;

                this.mixer = new THREE.AnimationMixer(robot);
                this.animClips = {};
                gltf.animations.forEach(clip => {
                    this.animClips[clip.name] = this.mixer.clipAction(clip);
                });
                if (this.animClips['Idle']) this.animClips['Idle'].play();
            },
            undefined,
            (err) => console.error('Robot load error:', err)
        );
    }

    activarHabla(habla) {
        if (!this.animClips) return;
        if (habla) {
            if (this.animClips['Idle']) this.animClips['Idle'].stop();
            if (this.animClips['Wave']) this.animClips['Wave'].play();
        } else {
            if (this.animClips['Wave']) this.animClips['Wave'].stop();
            if (this.animClips['Idle']) this.animClips['Idle'].play();
        }
    }

    construirAeropuerto() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '/escena360.jpg',
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(40, 64, 64),
                new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    side: THREE.BackSide,
                    color: 0xEEEEEE
                })
            );
            this.scene.add(sphere);
        }
    );

    // Solo piso invisible para que el robot tenga donde pararse
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    
    // Luz suave solo para el robot
    const pointLight = new THREE.PointLight(0xFFFFFF, 3, 6);
    pointLight.position.set(0, 2, -1);
    this.scene.add(pointLight);

    // Luz de relleno desde abajo
    const fillLight = new THREE.PointLight(0xFFE0B2, 2, 4);
    fillLight.position.set(0, 0.5, -1.5);
    this.scene.add(fillLight);
}

    construirHotel() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '/hotel360.jpg',
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(40, 64, 64),
                new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    side: THREE.BackSide,
                    color: 0xEEEEEE
                })
            );
            this.scene.add(sphere);
        }
    );

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const pointLight = new THREE.PointLight(0xFFFFFF, 3, 6);
    pointLight.position.set(0, 2, -1);
    this.scene.add(pointLight);

    const fillLight = new THREE.PointLight(0xFFE0B2, 2, 4);
    fillLight.position.set(0, 0.5, -1.5);
    this.scene.add(fillLight);
}

   construirRestaurante() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        '/restaurante360.jpg',
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(40, 64, 64),
                new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    side: THREE.BackSide,
                    color: 0xEEEEEE
                })
            );
            this.scene.add(sphere);
        }
    );

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const pointLight = new THREE.PointLight(0xFFFFFF, 3, 6);
    pointLight.position.set(0, 2, -1);
    this.scene.add(pointLight);

    const fillLight = new THREE.PointLight(0xFFE0B2, 2, 4);
    fillLight.position.set(0, 0.5, -1.5);
    this.scene.add(fillLight);
}

    crearPared(color, x, y, z, w, h, rotY = 0) {
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
        wall.position.set(x,y,z); wall.rotation.y = rotY; this.scene.add(wall);
    }

    setupMouseControl(canvas) {
        canvas.addEventListener('mousedown', (e) => { this.mouseControl.active = true; this.mouseControl.lastX = e.clientX; this.mouseControl.lastY = e.clientY; });
        canvas.addEventListener('mouseup', () => { this.mouseControl.active = false; });
        canvas.addEventListener('mousemove', (e) => {
            if (!this.mouseControl.active) return;
            this.mouseControl.rotY -= (e.clientX - this.mouseControl.lastX) * 0.005;
            this.mouseControl.rotX -= (e.clientY - this.mouseControl.lastY) * 0.003;
            this.mouseControl.rotX = Math.max(-0.5, Math.min(0.5, this.mouseControl.rotX));
            this.mouseControl.lastX = e.clientX; this.mouseControl.lastY = e.clientY;
        });
        canvas.addEventListener('touchstart', (e) => { this.mouseControl.active = true; this.mouseControl.lastX = e.touches[0].clientX; this.mouseControl.lastY = e.touches[0].clientY; });
        canvas.addEventListener('touchend', () => { this.mouseControl.active = false; });
        canvas.addEventListener('touchmove', (e) => {
            if (!this.mouseControl.active) return;
            this.mouseControl.rotY -= (e.touches[0].clientX - this.mouseControl.lastX) * 0.005;
            this.mouseControl.rotX -= (e.touches[0].clientY - this.mouseControl.lastY) * 0.003;
            this.mouseControl.lastX = e.touches[0].clientX; this.mouseControl.lastY = e.touches[0].clientY;
        });
    }

    animate() {
        if (this.isDestroyed) return;
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const delta = (now - this.prevTime) / 1000;
        this.prevTime = now;

        if (this.mixer) this.mixer.update(delta);

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.mouseControl.rotY;
        this.camera.rotation.x = this.mouseControl.rotX;

        this.renderer.render(this.scene, this.camera);
    }

    resize(w, h) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    dispose() {
        this.isDestroyed = true;
        this.renderer.dispose();
    }
}

function VRScene({ escenario, onVolver, nivel = 'B1' }) {
    const canvasRef = useRef(null);
    const ambRef    = useRef(null);

    const [mensajes, setMensajes]       = useState([{ rol: 'agente', texto: escenario.primerMensaje }]);
    const [ultimoTexto, setUltimoTexto] = useState(escenario.primerMensaje);
    const [esAgente, setEsAgente]       = useState(true);
    const [textoInput, setTextoInput]   = useState('');
    const [cargando, setCargando]       = useState(false);
    const [grabando, setGrabando]       = useState(false);
    const [finalizado, setFinalizado]   = useState(false);
    const [puntaje, setPuntaje]         = useState(null);
    const [stardust, setStardust]       = useState(0);
    const [vrDisponible, setVrDisp]     = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const amb = new VRAmbiente(canvasRef.current, escenario);
        ambRef.current = amb;
        // Forzar tamaño correcto
        amb.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(s => setVrDisp(s));
        }

        const handleResize = () => {
            if (canvasRef.current && ambRef.current) {
                ambRef.current.resize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(() => reproducirVoz(escenario.primerMensaje), 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (ambRef.current) ambRef.current.dispose();
        };
    }, []);

    function reproducirVoz(texto) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'en-US'; u.rate = 0.9;
        u.onstart = () => { if (ambRef.current) ambRef.current.activarHabla(true); };
        u.onend   = () => { if (ambRef.current) ambRef.current.activarHabla(false); };
        window.speechSynthesis.speak(u);
    }

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
            setTextoInput(texto);
            enviar(texto);
        };
        recognitionRef.current = r;
        r.start();
    }

    function detenerGrabacion() { recognitionRef.current?.stop(); setGrabando(false); }

    async function enviar(textoEnviar) {
        const txt = textoEnviar || textoInput;
        if (!txt.trim() || cargando) return;
        setTextoInput('');
        setUltimoTexto(txt); setEsAgente(false);
        const nuevosMensajes = [...mensajes, { rol: 'usuario', texto: txt }];
        setMensajes(nuevosMensajes);
        setCargando(true);
        try {
            const data = await apiFetch('/conversacion', {
                method: 'POST',
                body: JSON.stringify({ escenario_id: escenario.id, system_prompt: escenario.systemPrompt, mensajes: nuevosMensajes, nivel, agente_nombre: escenario.agente }),
            });
            setMensajes(prev => [...prev, { rol: 'agente', texto: data.respuesta }]);
            setUltimoTexto(data.respuesta); setEsAgente(true);
            reproducirVoz(data.respuesta);
            if (data.puntaje) { setPuntaje(data.puntaje); setStardust(data.stardust_ganado ?? 30); setTimeout(() => setFinalizado(true), 2000); }
        } catch {
            const f = "I'm sorry, could you repeat that please?";
            setMensajes(prev => [...prev, { rol: 'agente', texto: f }]);
            setUltimoTexto(f); setEsAgente(true);
        } finally { setCargando(false); }
    }

    async function activarVR() {
        if (!navigator.xr) return;
        try {
            const session = await navigator.xr.requestSession('immersive-vr');
            ambRef.current.renderer.xr.setSession(session);
        } catch { alert('VR not available. Connect a VR headset first.'); }
    }

    if (finalizado) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050510]">
            <div className="text-center max-w-md px-8">
                <div className="text-8xl mb-6">🌟</div>
                <h2 className="text-4xl font-black text-white mb-2">VR Mission Complete!</h2>
                <p className="text-gray-400 mb-6">{escenario.titulo}</p>
                <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-3xl mb-6 ${puntaje >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : puntaje >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    <Star size={28} /> {puntaje}/100
                </div>
                <p className="text-cyan-400 font-bold text-xl mb-8">✨ +{stardust} Stardust earned!</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={onVolver} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white font-bold transition-all">← Exit VR</button>
                    <button onClick={() => { setMensajes([{ rol: 'agente', texto: escenario.primerMensaje }]); setUltimoTexto(escenario.primerMensaje); setEsAgente(true); setFinalizado(false); setPuntaje(null); }} className="px-6 py-3 rounded-xl bg-cyan-400 text-[#050510] font-bold flex items-center gap-2">
                        <RotateCcw size={16} /> Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-40 bg-black" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing" style={{ display: 'block', width: '100%', height: '100%' }} />

            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 to-transparent z-10">
                <button onClick={onVolver} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold">
                    <ArrowLeft size={16} /> Exit VR
                </button>
                <div className="text-center">
                    <p className="text-white font-black text-sm tracking-widest uppercase">{escenario.titulo}</p>
                    <p className="text-cyan-400 text-xs">🖱️ Drag to look around • {escenario.agente} is in front of you</p>
                </div>
                {vrDisponible ? (
                    <button onClick={activarVR} className="px-4 py-2 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 text-sm font-bold">🥽 Enter VR</button>
                ) : <div className="w-24" />}
            </div>

            <div className="absolute left-0 right-0 z-10 px-12" style={{ bottom: '220px' }}>
                <div className="text-center">
                    {cargando ? (
                        <div className="flex gap-2 justify-center">
                            {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                        </div>
                    ) : (
                        <div>
                            <span className={`text-xs font-black uppercase tracking-[0.3em] mb-2 block ${esAgente ? 'text-cyan-400' : 'text-yellow-400'}`}>
                                {esAgente ? escenario.agente : 'YOU'}
                            </span>
                            <p className={`text-2xl font-medium leading-relaxed ${esAgente ? 'text-white' : 'text-yellow-100 italic'}`}
                               style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
                                {esAgente ? ultimoTexto : `"${ultimoTexto}"`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-8 py-6 z-10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center mb-4">{escenario.mision}</p>
                <div className="flex gap-4 w-full max-w-2xl mx-auto">
                    <button onClick={grabando ? detenerGrabacion : iniciarGrabacion} disabled={cargando}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 text-white ${grabando ? 'bg-red-500 border-red-400 animate-pulse' : cargando ? 'bg-white/5 border-white/10 cursor-not-allowed' : 'bg-white/10 border-white/20 hover:bg-cyan-400 hover:border-cyan-400'}`}>
                        <Mic size={22} />
                    </button>
                    <div className="flex-1 flex bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden focus-within:border-cyan-400/50 transition-all">
                        <input type="text" value={textoInput} onChange={e => setTextoInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') enviar(); }}
                            placeholder={grabando ? '🎤 Listening...' : 'Speak or type your response...'}
                            disabled={cargando} className="flex-1 bg-transparent px-5 py-4 text-white outline-none placeholder-white/30 text-sm" />
                        <button onClick={() => enviar()} disabled={!textoInput.trim() || cargando} className="px-5 text-white/50 hover:text-cyan-400 transition-all disabled:opacity-30">
                            <Send size={18} />
                        </button>
                    </div>
                    <button onClick={() => reproducirVoz(ultimoTexto)} className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/50 hover:text-cyan-400 transition-all flex-shrink-0">
                        <Volume2 size={20} />
                    </button>
                </div>
                <p className="text-white/20 text-xs text-center mt-3">Drag canvas to look around • Speak in English • Claude evaluates your conversation</p>
            </div>
        </div>
    );
}

export default function VRConversation({ nivel = 'B1', onVolver }) {
    const [escenarioActivo, setEscenario] = useState(null);

    if (escenarioActivo !== null) return (
        <VRScene escenario={ESCENARIOS_VR[escenarioActivo]} onVolver={() => setEscenario(null)} nivel={nivel} />
    );

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button onClick={onVolver} className="text-gray-400 hover:text-white font-bold flex items-center gap-2 transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>
                <div>
                    <h2 className="text-3xl font-black text-white">🥽 VR Immersion</h2>
                    <p className="text-gray-400 text-sm">3D environments • Robot agents • Ready for VR headsets</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-5 flex-1">
                {ESCENARIOS_VR.map((esc, i) => (
                    <div key={esc.id} onClick={() => setEscenario(i)}
                        className="relative rounded-3xl overflow-hidden cursor-pointer group border border-white/10 hover:border-cyan-400/30 transition-all hover:scale-[1.02] bg-white/5"
                        style={{ minHeight: '250px' }}>
                        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, #${esc.skyColor.toString(16).padStart(6,'0')}33, #050510)` }} />
                        <div className="relative h-full flex flex-col justify-between p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-bold">🥽 WebXR Ready</span>
                                <span className="text-xs text-gray-500">Level {nivel}</span>
                            </div>
                            <div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center text-3xl mb-4 shadow-lg">{esc.avatar}</div>
                                <h3 className="text-white font-black text-xl mb-2">{esc.titulo}</h3>
                                <p className="text-cyan-300 text-xs font-bold mb-4">{esc.mision}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-500 flex items-center justify-center text-sm">{esc.avatar}</div>
                                    <div>
                                        <p className="text-white text-xs font-bold">{esc.agente}</p>
                                        <p className="text-gray-400 text-xs">{esc.cargo}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-full text-xs font-bold text-center group-hover:bg-cyan-400/10 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all">
                                Enter 3D Environment →
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-4 text-center">
                <p className="text-cyan-400 text-sm font-bold">🥽 VR Headset? Click "Enter VR" inside any scenario for full immersion!</p>
                <p className="text-gray-500 text-xs mt-1">Compatible with Meta Quest, HTC Vive, and any WebXR-enabled headset</p>
            </div>
        </div>
    );
}
