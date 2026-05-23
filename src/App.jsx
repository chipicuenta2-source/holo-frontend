import MascotTip from './components/MascotTip.jsx';
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
import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useHoloApi.jsx';
import HoloLogin from './components/HoloLogin.jsx';
import { Rocket, Mic, Headphones, Key, BookOpen, ChevronRight, Menu, X, User } from 'lucide-react';

export default function App() {
    const [vistasSpeaking, setVistasSpeaking] = useState('menu');
    const { isLogged, loading, user, perfil, logout, actualizarPerfil } = useAuth();
    const [activeTab, setActiveTab] = useState('Star Map');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        function handleResize() {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(false);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { name: 'Star Map',          icon: <Rocket size={20} />,     label: 'Home' },
        { name: 'Speaking Practice', icon: <Mic size={20} />,        label: 'Speaking' },
        { name: 'Cosmic Listening',  icon: <Headphones size={20} />, label: 'Listening' },
        { name: 'Game Planet',       icon: <Key size={20} />,         label: 'Games' },
        { name: 'Grammar',           icon: <BookOpen size={20} />,    label: 'Grammar' },
    ];

    const avatars = [
        { id: 'HOLO',  emoji: '🧑‍🚀' },
        { id: 'ZIG',   emoji: '👽' },
        { id: 'LUMO',  emoji: '👾' },
        { id: 'NIA',   emoji: '🎧' },
        { id: 'MOMO',  emoji: '⚡' },
        { id: 'TIKA',  emoji: '🧚' },
    ];

    const currentAvatar = avatars.find(a => a.id === (perfil?.avatar ?? 'HOLO'));

    if (loading) {
        return (
            <div style={{ height: '100vh', width: '100vw', background: '#050510', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#22d3ee', fontSize: '1.25rem', fontWeight: 'bold' }}>Cargando HOLO...</p>
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

    const BG = { background: 'radial-gradient(ellipse at top, rgba(77,0,153,0.3) 0%, #050510 60%), radial-gradient(ellipse at bottom, rgba(0,100,200,0.15) 0%, transparent 60%), #050510' };
    
    return (
        <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'sans-serif', display: 'flex', color: '#e2e8f0', overflow: 'hidden', ...BG }}>

            {/* ══════════════ SIDEBAR DESKTOP ══════════════ */}
            {!isMobile && (
                <div style={{ width: '272px', margin: '16px', display: 'flex', flexDirection: 'column', zIndex: 10, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', flexShrink: 0 }}>
                    <div style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'white', borderBottom: '2px solid #22d3ee', paddingBottom: '8px', display: 'inline-block', margin: 0 }}>HOLO</h2>
                    </div>
                    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {tabs.map(item => (
                            <div key={item.name} onClick={() => handleTabChange(item.name)} style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', borderLeft: activeTab === item.name ? '4px solid #22d3ee' : '4px solid transparent', background: activeTab === item.name ? 'linear-gradient(to right, rgba(34,211,238,0.1), transparent)' : 'transparent', color: activeTab === item.name ? '#22d3ee' : '#9ca3af' }}>
                                {item.icon}
                                <span style={{ fontWeight: 600 }}>{item.name}</span>
                            </div>
                        ))}
                    </nav>
                    <div onClick={() => handleTabChange('My Profile')} style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '12px', borderRadius: '16px', background: activeTab === 'My Profile' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{currentAvatar?.emoji}</div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', margin: 0, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#22d3ee', margin: 0 }}>{perfil?.nivel_actual} Level - Orbit</p>
                            </div>
                        </div>
                        <ChevronRight size={18} color="#9ca3af" />
                    </div>
                </div>
            )}

            {/* ══════════════ DRAWER MÓVIL ══════════════ */}
            {isMobile && sidebarOpen && (
                <>
                    <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50 }} />
                    <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: '#080820', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 60, boxShadow: '8px 0 40px rgba(0,0,0,0.6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', borderBottom: '2px solid #22d3ee', paddingBottom: '4px', margin: 0 }}>HOLO</h2>
                            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {tabs.map(item => (
                                <div key={item.name} onClick={() => handleTabChange(item.name)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '14px', cursor: 'pointer', borderLeft: activeTab === item.name ? '4px solid #22d3ee' : '4px solid transparent', background: activeTab === item.name ? 'rgba(34,211,238,0.1)' : 'transparent', color: activeTab === item.name ? '#22d3ee' : '#9ca3af', transition: 'all 0.2s' }}>
                                    {item.icon}
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                </div>
                            ))}
                        </nav>
                        <div onClick={() => handleTabChange('My Profile')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{currentAvatar?.emoji}</div>
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white', margin: 0 }}>{user?.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#22d3ee', margin: 0 }}>{perfil?.nivel_actual} Level</p>
                            </div>
                        </div>
                        <button onClick={logout} style={{ marginTop: '12px', padding: '12px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                            Cerrar Sesión
                        </button>
                    </div>
                </>
            )}

            {/* ══════════════ CONTENIDO PRINCIPAL ══════════════ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', zIndex: 10, overflow: 'hidden', margin: isMobile ? 0 : '16px 16px 16px 0', gap: isMobile ? 0 : '16px' }}>

                {/* Header */}
                <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: isMobile ? '12px 16px' : '20px 32px', borderRadius: isMobile ? 0 : '24px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isMobile && (
                            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 style={{ fontSize: isMobile ? '1.125rem' : '1.875rem', fontWeight: 700, color: 'white', margin: 0 }}>{activeTab}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: isMobile ? '6px 12px' : '8px 24px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span>✨</span>
                            <span style={{ fontWeight: 900, fontSize: isMobile ? '0.875rem' : '1.25rem', background: 'linear-gradient(to right, #22d3ee, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {perfil?.stardust ?? 0}{!isMobile && ' Stardust'}
                            </span>
                        </div>
                        {!isMobile && (
                            <button onClick={logout} style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', background: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}>Salir</button>
                        )}
                    </div>
                </div>

                {/* Área scrollable */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? '16px 16px 72px 16px' : '24px', background: isMobile ? 'transparent' : 'rgba(255,255,255,0.03)', borderRadius: isMobile ? 0 : '24px', border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>

                    {/* STAR MAP */}
                    {activeTab === 'Star Map' && (
                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h3>
                                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Continue your English journey</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#22d3ee', margin: 0 }}>{perfil?.nivel_actual ?? 'B1'}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Level</p>
                                </div>
                                <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#a78bfa', margin: 0 }}>✨ {perfil?.stardust ?? 0}</p>
                                    <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Stardust</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
                                {tabs.map(item => (
                                    <div key={item.name} onClick={() => handleTabChange(item.name)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: isMobile ? '16px' : '24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ color: '#22d3ee', marginBottom: '8px' }}>{item.icon}</div>
                                        <p style={{ color: 'white', fontWeight: 700, fontSize: isMobile ? '0.8rem' : '1rem', margin: 0, lineHeight: 1.3 }}>{item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SPEAKING PRACTICE */}
                    {activeTab === 'Speaking Practice' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {vistasSpeaking === 'menu' && (
                                <div>
                                    <h3 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900, color: 'white', marginBottom: '16px' }}>Choose a Mode</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                                        {[
                                            { vista: 'practice',     emoji: '🎤', title: 'Speaking Practice',     desc: 'AI-powered pronunciation & fluency coaching.', color: '#22d3ee' },
                                            { vista: 'conversation', emoji: '✈️', title: 'Airport Conversations', desc: 'Real conversations with AI airport agents.',    color: '#a78bfa' },
                                            { vista: 'world',        emoji: '🌍', title: 'World Immersion',       desc: 'Immersive scenarios: airport, hotel, restaurant.', color: '#34d399' },
                                            { vista: 'vr',           emoji: '🥽', title: 'VR Immersion',          desc: '3D environments with real-time conversations.', color: '#a78bfa' },
                                        ].map(card => (
                                            <div key={card.vista} onClick={() => setVistasSpeaking(card.vista)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: isMobile ? '20px' : '32px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' }}>
                                                <span style={{ fontSize: isMobile ? '2.5rem' : '3rem' }}>{card.emoji}</span>
                                                <div>
                                                    <h3 style={{ color: 'white', fontWeight: 900, fontSize: isMobile ? '1rem' : '1.25rem', margin: '0 0 4px 0' }}>{card.title}</h3>
                                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>{card.desc}</p>
                                                </div>
                                                <div style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', color: card.color, fontWeight: 700, fontSize: '0.8rem', alignSelf: 'flex-start' }}>Start →</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {vistasSpeaking === 'practice'     && <SpeakingPractice nivel={perfil?.nivel_actual ?? 'B1'} onVolver={() => setVistasSpeaking('menu')} />}
                            {vistasSpeaking === 'conversation' && <AirportConversation onVolver={() => setVistasSpeaking('menu')} />}
                            {vistasSpeaking === 'world'        && <ImmersiveConversation onVolver={() => setVistasSpeaking('menu')} />}
                            {vistasSpeaking === 'vr'           && <VRConversation onVolver={() => setVistasSpeaking('menu')} />}
                        </div>
                    )}

                    {activeTab === 'Game Planet'      && <GamePlanet nivel={perfil?.nivel_actual ?? 'B1'} />}
                    {activeTab === 'Grammar'          && <Grammar nivel={perfil?.nivel_actual ?? 'B1'} />}
                    {activeTab === 'Cosmic Listening' && <CosmicListening nivel={perfil?.nivel_actual ?? 'B1'} />}

                    {/* MY PROFILE */}
                    {activeTab === 'My Profile' && (
                        <div>
                            <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: 'white', marginBottom: '24px' }}>My Profile</h2>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Choose Avatar</h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'HOLO', emoji: '🧑‍🚀', bg: '#1d4ed8' },
                                        { id: 'ZIG',  emoji: '👽',   bg: '#15803d' },
                                        { id: 'LUMO', emoji: '👾',   bg: '#7e22ce' },
                                        { id: 'NIA',  emoji: '🎧',   bg: '#92400e' },
                                        { id: 'MOMO', emoji: '⚡',   bg: '#b45309' },
                                        { id: 'TIKA', emoji: '🧚',   bg: '#be185d' },
                                    ].map(av => (
                                        <div
                                            key={av.id}
                                            onClick={async () => {
                                                try { await actualizarPerfil({ avatar: av.id }); }
                                                catch(e) { console.error('Avatar error:', e); }
                                            }}
                                            style={{
                                                width: '60px', height: '60px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.75rem', cursor: 'pointer',
                                                background: av.bg,
                                                border: perfil?.avatar === av.id ? '3px solid #22d3ee' : '3px solid rgba(255,255,255,0.1)',
                                                transform: perfil?.avatar === av.id ? 'scale(1.15)' : 'scale(1)',
                                                transition: 'all 0.2s',
                                                boxShadow: perfil?.avatar === av.id ? '0 0 15px rgba(34,211,238,0.5)' : 'none',
                                            }}
                                        >
                                            {av.emoji}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '12px' }}>
                                    Selected: {perfil?.avatar ?? 'None'}
                                </p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Info</h3>
                                {[{ label: 'Name', value: user?.name }, { label: 'Email', value: user?.email }, { label: 'Level', value: perfil?.nivel_actual ?? 'B1' }, { label: 'Stardust', value: `✨ ${perfil?.stardust}` }].map(row => (
                                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{row.label}</span>
                                        <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={logout} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', marginBottom: '24px' }}>
                                Cerrar Sesión
                            </button>
                            <ProgresoEstudiante userId={user?.id} />
                        </div>
                    )}

                </div>
            </div>
                        {/* Mascota guía */}
            {!(activeTab === 'Speaking Practice' && ['practice', 'conversation', 'world', 'vr'].includes(vistasSpeaking)) && (
                <MascotTip pantalla={activeTab} />
            )}
            {/* ══════════════ BOTTOM NAV MÓVIL ══════════════ */}
            {isMobile && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex' }}>
                    {tabs.map(item => (
                        <button key={item.name} onClick={() => handleTabChange(item.name)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === item.name ? '#22d3ee' : '#6b7280', transition: 'color 0.2s' }}>
                            {item.icon}
                            <span style={{ fontSize: '9px', fontWeight: 700 }}>{item.label}</span>
                        </button>
                    ))}
                    <button onClick={() => handleTabChange('My Profile')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 2px', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: activeTab === 'My Profile' ? '#22d3ee' : '#6b7280' }}>
                        <User size={18} />
                        <span style={{ fontSize: '9px', fontWeight: 700 }}>Profile</span>
                    </button>
                </div>
            )}

        </div>
    );
}
