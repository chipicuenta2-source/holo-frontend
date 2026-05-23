# HOLO — Plataforma de Aprendizaje de Inglés

HOLO es una plataforma gamificada e inmersiva para el aprendizaje del inglés, con soporte para múltiples modalidades de práctica (voz, video, juegos, entornos 3D) y roles diferenciados para estudiantes, profesores y administradores.

---

## Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Módulos de la Aplicación](#módulos-de-la-aplicación)
- [Sistema de Roles](#sistema-de-roles)
- [Integración con la API](#integración-con-la-api)
- [Características Técnicas](#características-técnicas)

---

## Características

- **Práctica de Speaking**: Reconocimiento de voz en tiempo real con evaluación por IA
- **Conversaciones Inmersivas**: Escenarios contextualizados (aeropuerto, hotel, restaurante, etc.)
- **Entornos VR**: Escenas 3D con Three.js y soporte WebXR
- **Juegos de Vocabulario y Gramática**: Sistema de preguntas por niveles (A1–C2)
- **Listening con Video**: Comprensión auditiva basada en video con cuestionarios
- **Gamificación**: Sistema de Stardust (moneda virtual), avatares y seguimiento de progreso
- **Contenido Adaptativo**: Interfaz en español o inglés según el nivel MCER del estudiante
- **Paneles de Gestión**: Interfaces dedicadas para profesores y superadministradores

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.2.0 | Framework de UI |
| Vite | 4.4.5 | Build tool y servidor de desarrollo |
| Three.js | 0.184.0 | Entornos 3D e inmersivos |
| Tailwind CSS | 3.4.19 | Estilos utilitarios |
| Lucide React | 1.8.0 | Iconografía |
| Web Speech API | Nativa | Reconocimiento y síntesis de voz |

**Backend:** Laravel (API REST en `/api/holo`)  
**Autenticación:** Token Bearer (JWT almacenado en `localStorage`)

---

## Estructura del Proyecto

```
holo-frontend/
├── public/
│   ├── escena360.jpg          # Panoramas para entornos inmersivos
│   ├── hotel360.jpg
│   ├── restaurante360.jpg
│   ├── mascot-blue.png        # Avatares de mascotas
│   ├── mascot-orange.png
│   └── mascot-purple.png
├── src/
│   ├── components/
│   │   ├── App.jsx                    # Shell principal y enrutamiento por tabs
│   │   ├── HoloLogin.jsx              # Formulario de autenticación
│   │   ├── SpeakingPractice.jsx       # Práctica de pronunciación con IA
│   │   ├── AirportConversation.jsx    # Diálogos en escenario de aeropuerto
│   │   ├── ImmersiveConversation.jsx  # Conversaciones en múltiples entornos
│   │   ├── VRConversation.jsx         # Entornos 3D con Three.js
│   │   ├── GamePlanet.jsx             # Juegos de vocabulario y gramática
│   │   ├── Grammar.jsx                # Lecciones y práctica de gramática
│   │   ├── CosmicListening.jsx        # Comprensión auditiva con video
│   │   ├── ProgresoEstudiante.jsx     # Widget de progreso del estudiante
│   │   ├── AdminPanel.jsx             # Panel de superadministrador
│   │   ├── ProfesorPanel.jsx          # Panel del profesor
│   │   └── MascotTip.jsx              # Mascota con tips contextuales
│   ├── hooks/
│   │   └── useHoloApi.jsx             # Hooks personalizados para API y auth
│   ├── utils/
│   │   └── i18n.js                    # Traducciones adaptativas por nivel
│   ├── main.jsx                       # Punto de entrada de la app
│   └── index.css                      # Estilos globales + Tailwind
├── index.html
├── vite.config.js
└── package.json
```

---

## Instalación y Configuración

**Requisitos previos:** Node.js 18+ y npm.

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd holo-frontend

# Instalar dependencias
npm install

# Crear archivo de entorno
cp .env.example .env

# Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://127.0.0.1:8000/api/holo
```

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API de Laravel | `http://127.0.0.1:8000/api/holo` |

---

## Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Build de producción en /dist
npm run preview   # Vista previa del build de producción
npm run lint      # Análisis estático con ESLint
```

---

## Módulos de la Aplicación

### Mapa Estelar (Dashboard)
Pantalla principal del estudiante. Muestra el nivel MCER, el Stardust acumulado y acceso rápido a todos los módulos de aprendizaje.

### Práctica de Speaking
Cuatro modos de práctica de voz:
- **Frases**: Pronunciación guiada con evaluación de precisión, fluidez y entonación
- **Conversación en Aeropuerto**: Diálogos situacionales con agentes IA
- **Inmersión Mundial**: Escenarios en múltiples entornos (aeropuerto, hotel, restaurante, transporte, compras)
- **Inmersión VR**: Entornos 3D completamente renderizados con Three.js

### Game Planet
Sistema de juegos por módulos con dificultad ajustada al nivel del estudiante (A1–C2). Incluye preguntas de opción múltiple, 2 intentos por pregunta y recompensas en Stardust.

### Gramática
Lecciones estructuradas por nivel con ejercicios de práctica y sistema de puntaje.

### Cosmic Listening
Videos educativos seguidos de cuestionarios de comprensión auditiva con múltiples intentos.

---

## Sistema de Roles

| Rol | Acceso |
|---|---|
| **Estudiante** | Todos los módulos de aprendizaje, perfil, progreso |
| **Profesor** | Gestión de estudiantes y grupos, monitoreo de progreso |
| **Superadmin** | CRUD completo de usuarios y grupos, moderación general |

El rol se determina en el login desde la API y controla la vista que se muestra en `src/components/App.jsx`.

---

## Integración con la API

Todos los llamados a la API están centralizados en `src/hooks/useHoloApi.jsx`. Los endpoints principales son:

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/login` | Autenticación |
| `GET` | `/perfil` | Obtener perfil del estudiante |
| `PATCH` | `/perfil` | Actualizar perfil y avatar |
| `POST` | `/logout` | Cerrar sesión |
| `GET` | `/preguntas/{modulo}?nivel=` | Preguntas de juego por módulo |
| `POST` | `/respuesta` | Enviar respuesta |
| `GET` | `/ejercicios-speaking?nivel=&categoria=` | Ejercicios de speaking |
| `POST` | `/speaking` | Evaluar respuesta de speaking |
| `GET` | `/preguntas-video/{videoId}` | Preguntas de comprensión de video |

Todas las peticiones autenticadas envían el header `Authorization: Bearer <token>`.

---

## Características Técnicas

### Sistema de i18n Adaptativo
El contenido de la interfaz se adapta automáticamente según el nivel MCER del estudiante: español para principiantes (A1–A2), bilingüe para intermedios (B1–B2) e inglés completo para avanzados (C1–C2). Configurado en `src/utils/i18n.js`.

### Reconocimiento de Voz
Implementado con la Web Speech API nativa del navegador. Requiere Chrome o Edge para compatibilidad completa.

### Entornos 3D (VR)
Los escenarios inmersivos en `src/components/VRConversation.jsx` usan Three.js con soporte para WebXR, permitiendo uso con visores de realidad virtual.

### Gamificación
- **Stardust**: Moneda virtual ganada por respuestas correctas y completar módulos
- **Avatares**: 6 personajes seleccionables (HOLO, ZIG, LUMO, NIA, MOMO, TIKA)
- **Niveles**: Sistema de progresión alineado con el Marco Común Europeo de Referencia (A1–C2)
