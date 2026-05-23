import SpeakingPractice from './components/SpeakingPractice.jsx';
import GamePlanet from './components/GamePlanet.jsx';
import Grammar from './components/Grammar.jsx';
import AirportConversation from './components/AirportConversation.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ImmersiveConversation from './components/ImmersiveConversation.jsx';
import ProfesorPanel from './components/ProfesorPanel.jsx';
import VRConversation from './components/VRConversation.jsx';
import { t, esNivelPrincipiante } from './utils/i18n.js';
import ProgresoEstudiante from './components/ProgresoEstudiante.jsx';
import CosmicListening from './components/CosmicListening.jsx';
import { useState } from 'react';
import { useAuth } from './hooks/useHoloApi.jsx';
import HoloLogin from './components/HoloLogin.jsx';
import { Rocket, Mic, Headphones, Key, BookOpen, ChevronRight, Edit2, CheckCircle2, Menu, X } from 'lucide-react';

export default function App() {
    const [vistasSpeaking, setVistasSpeaking] = useState('menu');
    const { isLogged, loading, user, perfil, logout, actualizarPerfil } = useAuth();
    const [activeTab, setActiveTab] = useState('Star Map');
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const tabs = [
        { name: 'Star Map',          icon: <Rocket size={20} /> },
        { name: 'Speaking Practice', icon: <Mic size={20} /> },
        { name: 'Cosmic Listening',  icon: <Headphones size={20} /> },
        { name: 'Game Planet',       icon: <Key size={20} /> },
        { name: 'Grammar',           icon: <BookOpen size={20} /> },
    ];

    // Bottom nav tabs (5 max for mobile)
    const bottomTabs = [
        { name: 'Star Map',          icon: <Rocket size={18} />,    label: 'Home' },
        { name: 'Speaking Practice', icon: <Mic size={18} />,       label: 'Speaking' },
        { name: 'Cosmic Listening',  icon: <Headphones size={18} />, label: 'Listening' },
        { name: 'Game Planet',       icon: <Key size={18} />,        label: 'Games' },
        { name: 'Grammar',           icon: <BookOpen size={18} />,   label: 'Grammar' },
    ];

    const avatars = [
        { id: 'HOLO',  color: 'bg-blue-500',   emoji: '🧑‍🚀' },
        { id: 'ZIG',   color: 'bg-orange-500',  emoji: '👽' },
        { id: 'LUMO',  color: 'bg-green-400',   emoji: '👾' },
        { id: 'NIA',   color: 'bg-purple-500',  emoji: '🎧' },
        { id: 'MOMO',  color: 'bg-yellow-400',  emoji: '⚡' },
        { id: 'TIKA',  color: 'bg-pink-400',    emoji: '🧚' },
    ];

    const currentAvatar = avatars.find(a => a.id === (perfil?.avatar ?? 'HOLO'));

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[#050510] flex items-center justify-center">
                <p className="text-cyan-400 text-xl font-bold animate-pulse">Cargando HOLO...</p>
            </div>
        );
    }

    if (!isLogged) return <HoloLogin />;
    if (user?.rol === 'superadmin') return <AdminPanel user={user} />;
    if (user?.rol === 'profesor')   return <ProfesorPanel user={user} />;

    function handleTabChange(name) {
        setActiveTab(name);
        setSidebarOpen(false);
        if (name !== 'Speaking Practice') setVistasSpeaking('menu');
    }

    return (
        <div className="h-screen w-screen relative font-sans flex text-gray-200 overflow-hidden"
             style={{ background: 'radial-gradient(ellipse at top, rgba(77,0,153,0.3) 0%, #050510 60%), radial-gradient(ellipse at bottom, rgba(0,100,200,0.15) 0%, transparent 60%), #050510' }}>

            {/* ── SIDEBAR DESKTOP (oculto en móvil) ── */}
            <div className="hidden md:flex w-72 m-4 flex-col z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex-shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-4 mb-10">
                    <h2 className="text-3xl font-black text-white tracking-wide border-b-2 border-cyan-400 pb-2">HOLO</h2>
                </div>

                {/* Navegación */}
                <nav className="flex-1 space-y-2">
                    {tabs.map(item => (
                        <div
                            key={item.name}
                            onClick={() => handleTabChange(item.name)}
                            className={`p-4 flex items-center gap-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                                activeTab === item.name
                                    ? 'bg-gradient-to-r from-cyan-400/10 to-transparent border-l-4 border-cyan-400 text-cyan-400'
                                    : 'hover:bg-white/5 text-gray-400 hover:text-white border-l-4 border-transparent'
                            }`}
                        >
                            {item.icon}
                            <span className="font-semibold">{item.name}</span>
                        </div>
                    ))}
                </nav>

                {/* Perfil */}
                <div
                    onClick={() => handleTabChange('My Profile')}
                    className={`pt-6 mt-4 border-t border-white/10 flex items-center justify-between cursor-pointer transition-all p-3 rounded-2xl ${
                        activeTab === 'My Profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${currentAvatar?.color} border-2 border-white/30 flex items-center justify-center font-bold text-xl`}>
                            {currentAvatar?.emoji}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white max-w-[120px] truncate">{user?.name}</p>
                            <p className="text-xs text-cyan-400">{perfil?.nivel_actual} Level - Orbit</p>
                        </div>
                    </div>
                    <ChevronRight size={18} />
                </div>
            </div>

            {/* ── SIDEBAR MÓVIL (drawer) ── */}
            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    {/* Drawer */}
                    <div className="relative w-72 h-full bg-[#050510] border-r border-white/10 p-6 flex flex-col z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-white tracking-wide border-b-2 border-cyan-400 pb-1">HOLO</h2>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-2">
                            {tabs.map(item => (
                                <div
                                    key={item.name}
                                    onClick={() => handleTabChange(item.name)}
                                    className={`p-4 flex items-center gap-3 rounded-2xl cursor-pointer transition-all ${
                                        activeTab === item.name
                                            ? 'bg-cyan-400/10 border-l-4 border-cyan-400 text-cyan-400'
                                            : 'text-gray-400 border-l-4 border-transparent'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="font-semibold">{item.name}</span>
                                </div>
                            ))}
                        </nav>
                        {/* Perfil en drawer */}
                        <div onClick={() => handleTabChange('My Profile')} className="pt-4 border-t border-white/10 flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-white/5">
                            <div className={`w-10 h-10 rounded-full ${currentAvatar?.color} flex items-center justify-center text-xl`}>
                                {currentAvatar?.emoji}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-cyan-400">{perfil?.nivel_actual} Level</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CONTENIDO PRINCIPAL ── */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden md:m-4 md:ml-0 gap-0 md:gap-4">

                {/* Header */}
                <div className="bg-white/5 backdrop-blur-xl py-3 px-4 md:py-5 md:px-8 md:rounded-3xl border-b md:border border-white/10 flex justify-between items-center shadow-lg flex-shrink-0 md:mt-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger solo en móvil */}
                        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
                            <Menu size={22} />
                        </button>
                        <h2 className="text-xl md:text-3xl font-bold text-white truncate max-w-[160px] md:max-w-none">
                            {activeTab === 'Star Map' ? '🚀 Star Map' : activeTab}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1 md:gap-3 bg-white/5 px-3 md:px-6 py-2 rounded-full border border-white/10">
                            <span className="text-base md:text-xl">✨</span>
                            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-sm md:text-xl">
                                {perfil?.stardust ?? 0}
                                <span className="hidden md:inline"> Stardust</span>
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-3 md:px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-xs md:text-sm font-bold"
                        >
                            Salir
                        </button>
                    </div>
                </div>

                {/* Área de contenido con scroll */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-0 pb-20 md:pb-0">
                    <div className="h-full md:bg-white/5 md:backdrop-blur-md md:rounded-3xl md:border md:border-white/10 md:p-6 lg:p-8">

                        {/* Star Map */}
                        {activeTab === 'Star Map' && (
                            <div className="py-4 md:py-0 h-full overflow-y-auto">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-black text-white">
                                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                                        </h3>
                                        <p className="text-gray-400 mt-1 text-sm md:text-base">Continue your English journey</p>
                                    </div>
                                    <div className="flex gap-3 flex-wrap">
                                        <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-2xl px-4 py-3 text-center">
                                            <p className="text-2xl font-black text-cyan-400">{perfil?.nivel_actual ?? 'B1'}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Level</p>
                                        </div>
                                        <div className="bg-purple-400/10 border border-purple-400/20 rounded-2xl px-4 py-3 text-center">
                                            <p className="text-2xl font-black text-purple-400">✨ {perfil?.stardust ?? 0}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stardust</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick access cards */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                    {tabs.map(item => (
                                        <div
                                            key={item.name}
                                            onClick={() => handleTabChange(item.name)}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all group active:scale-95"
                                        >
                                            <div className="text-cyan-400 mb-2 md:mb-3 group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </div>
                                            <p className="text-white font-bold text-sm md:text-base leading-tight">{item.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Speaking Practice */}
                        {activeTab === 'Speaking Practice' && (
                            <div className="h-full flex flex-col py-4 md:py-0">
                                {vistasSpeaking === 'menu' && (
                                    <div className="flex-1 overflow-y-auto">
                                        <h3 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6">Choose a Mode</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div onClick={() => setVistasSpeaking('practice')}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all flex flex-col gap-3 active:scale-95 group">
                                                <span className="text-4xl md:text-5xl">🎤</span>
                                                <div>
                                                    <h3 className="text-white font-black text-lg md:text-2xl mb-1">Speaking Practice</h3>
                                                    <p className="text-gray-400 text-sm md:text-base">AI-powered pronunciation & fluency coaching with instant feedback.</p>
                                                </div>
                                                <div className="px-4 py-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 rounded-full text-sm font-bold self-start group-hover:bg-cyan-400 group-hover:text-[#050510] transition-all">
                                                    Start Practice →
                                                </div>
                                            </div>
                                            <div onClick={() => setVistasSpeaking('conversation')}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 cursor-pointer hover:bg-white/10 hover:border-purple-400/30 transition-all flex flex-col gap-3 active:scale-95 group">
                                                <span className="text-4xl md:text-5xl">✈️</span>
                                                <div>
                                                    <h3 className="text-white font-black text-lg md:text-2xl mb-1">Airport Conversations</h3>
                                                    <p className="text-gray-400 text-sm md:text-base">Have real conversations with AI airport agents in different scenarios.</p>
                                                </div>
                                                <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-bold self-start group-hover:bg-purple-400 group-hover:text-[#050510] group-hover:border-purple-400 transition-all">
                                                    Start Conversation →
                                                </div>
                                            </div>
                                            <div onClick={() => setVistasSpeaking('world')}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all flex flex-col gap-3 active:scale-95 group">
                                                <span className="text-4xl md:text-5xl">🌍</span>
                                                <div>
                                                    <h3 className="text-white font-black text-lg md:text-2xl mb-1">World Immersion</h3>
                                                    <p className="text-gray-400 text-sm md:text-base">Immersive conversations in real-world scenarios: airport, hotel, restaurant and more.</p>
                                                </div>
                                                <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-bold self-start group-hover:bg-green-400 group-hover:text-[#050510] group-hover:border-green-400 transition-all">
                                                    Enter World →
                                                </div>
                                            </div>
                                            <div onClick={() => setVistasSpeaking('vr')}
                                                className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-8 cursor-pointer hover:bg-white/10 hover:border-purple-400/30 transition-all flex flex-col gap-3 active:scale-95 group">
                                                <span className="text-4xl md:text-5xl">🥽</span>
                                                <div>
                                                    <h3 className="text-white font-black text-lg md:text-2xl mb-1">VR Immersion</h3>
                                                    <p className="text-gray-400 text-sm md:text-base">3D environments with real-time conversations. VR headset ready!</p>
                                                </div>
                                                <div className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-bold self-start group-hover:bg-purple-400 group-hover:text-[#050510] group-hover:border-purple-400 transition-all">
                                                    Enter VR →
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {vistasSpeaking === 'practice' && (
                                    <SpeakingPractice nivel={perfil?.nivel_actual ?? 'B1'} onVolver={() => setVistasSpeaking('menu')} />
                                )}
                                {vistasSpeaking === 'conversation' && (
                                    <AirportConversation onVolver={() => setVistasSpeaking('menu')} />
                                )}
                                {vistasSpeaking === 'world' && (
                                    <ImmersiveConversation onVolver={() => setVistasSpeaking('menu')} />
                                )}
                                {vistasSpeaking === 'vr' && (
                                    <VRConversation onVolver={() => setVistasSpeaking('menu')} />
                                )}
                            </div>
                        )}

                        {/* Game Planet */}
                        {activeTab === 'Game Planet' && (
                            <div className="h-full py-4 md:py-0">
                                <GamePlanet nivel={perfil?.nivel_actual ?? 'B1'} />
                            </div>
                        )}

                        {/* Grammar */}
                        {activeTab === 'Grammar' && (
                            <div className="h-full overflow-y-auto py-4 md:py-0">
                                <Grammar nivel={perfil?.nivel_actual ?? 'B1'} />
                            </div>
                        )}

                        {/* Cosmic Listening */}
                        {activeTab === 'Cosmic Listening' && (
                            <div className="h-full overflow-y-auto py-4 md:py-0">
                                <CosmicListening nivel={perfil?.nivel_actual ?? 'B1'} />
                            </div>
                        )}

                        {/* My Profile */}
                        {activeTab === 'My Profile' && (
                            <div className="overflow-y-auto py-4 md:py-0">
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">My Profile</h2>

                                {/* Avatar selector */}
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 md:p-6 mb-4">
                                    <h3 className="text-sm md:text-lg font-bold text-cyan-400 mb-4 uppercase tracking-widest">Choose Avatar</h3>
                                    <div className="flex gap-3 md:gap-4 flex-wrap">
                                        {avatars.map(av => (
                                            <div
                                                key={av.id}
                                                onClick={() => actualizarPerfil({ avatar: av.id })}
                                                className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${av.color} flex items-center justify-center text-2xl cursor-pointer transition-all border-4 active:scale-95 ${
                                                    perfil?.avatar === av.id ? 'border-cyan-400 scale-110' : 'border-transparent hover:border-white/30'
                                                }`}
                                            >
                                                {av.emoji}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="bg-white/5 rounded-2xl border border-white/10 p-5 md:p-6 mb-4">
                                    <h3 className="text-sm md:text-lg font-bold text-cyan-400 mb-4 uppercase tracking-widest">Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm md:text-base">Name</span>
                                            <span className="text-white font-bold text-sm md:text-base truncate max-w-[60%]">{user?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm md:text-base">Email</span>
                                            <span className="text-white font-bold text-xs md:text-base truncate max-w-[60%]">{user?.email}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm md:text-base">Level</span>
                                            <span className="text-cyan-400 font-bold px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-sm">
                                                {perfil?.nivel_actual ?? 'B1'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm md:text-base">Stardust</span>
                                            <span className="text-white font-bold text-sm md:text-base">✨ {perfil?.stardust}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Logout en móvil */}
                                <button
                                    onClick={logout}
                                    className="w-full md:hidden py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-bold mb-4"
                                >
                                    Cerrar Sesión
                                </button>

                                <ProgresoEstudiante userId={user?.id} />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── BOTTOM NAV MÓVIL ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050510]/95 backdrop-blur-xl border-t border-white/10 flex">
                {bottomTabs.map(item => (
                    <button
                        key={item.name}
                        onClick={() => handleTabChange(item.name)}
                        className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                            activeTab === item.name
                                ? 'text-cyan-400'
                                : 'text-gray-500'
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                    </button>
                ))}
                {/* Perfil */}
                <button
                    onClick={() => handleTabChange('My Profile')}
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                        activeTab === 'My Profile' ? 'text-cyan-400' : 'text-gray-500'
                    }`}
                >
                    <div className={`w-5 h-5 rounded-full ${currentAvatar?.color} flex items-center justify-center text-xs`}>
                        {currentAvatar?.emoji}
                    </div>
                    <span className="text-[10px] font-bold tracking-tight">Profile</span>
                </button>
            </div>

        </div>
    );
}
