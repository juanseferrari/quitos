# 🏆 TrucoApp - UX Flow Completo con Sistema de Estadísticas

## 📱 ARQUITECTURA DE NAVEGACIÓN COMPLETA

```
APP
├── Auth Stack (No autenticado)
│   ├── Splash Screen
│   ├── Onboarding Flow (solo primera vez)
│   │   ├── Welcome
│   │   ├── Value Prop 1: "Nunca más olvides quién ganó"
│   │   ├── Value Prop 2: "Estadísticas que impresionan"
│   │   └── Value Prop 3: "Competí con amigos"
│   ├── Auth Selection
│   ├── Google/Apple/Phone Auth
│   ├── Username Creation
│   └── Permissions Request
│
└── Main Stack (Autenticado)
    ├── Tab Navigator
    │   ├── Home Tab
    │   │   ├── Dashboard
    │   │   ├── Quick Actions
    │   │   └── Recent Activity
    │   │
    │   ├── Play Tab
    │   │   ├── Game Mode Selection
    │   │   ├── Player Selection
    │   │   ├── Game Screen (Anotador)
    │   │   └── Game Result
    │   │
    │   ├── Stats Tab
    │   │   ├── Personal Stats Overview
    │   │   ├── Rivalries Detail
    │   │   ├── Teams Performance
    │   │   └── Achievements Gallery
    │   │
    │   ├── Social Tab
    │   │   ├── Friends List
    │   │   ├── Rankings (Local/Regional/Nacional)
    │   │   ├── Challenges & Desafíos
    │   │   └── Activity Feed
    │   │
    │   └── Profile Tab
    │       ├── User Profile
    │       ├── Settings
    │       ├── Premium Features
    │       └── Help & Support
    │
    └── Modal Stack (Overlay)
        ├── Game Result Celebration
        ├── Achievement Unlock Animation
        ├── Challenge Modal
        ├── Share Modal
        └── Stats Deep Dive
```

---

## 🚀 FLUJO DE PRIMER USO (ONBOARDING COMPLETO)

### 🎯 **PANTALLA 0: SPLASH SCREEN**

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│        👑                       │
│                                 │
│       REY DEL                   │
│       TRUCO                     │
│                                 │
│    ▓▓▓▓▓▓▓░░░░░░░░             │
│     Cargando...                 │
│                                 │
└─────────────────────────────────┘
```

**Duración:** 2 segundos con animación de corona dorada

---

### 📱 **PANTALLAS 1-3: ONBOARDING (Solo primera vez)**

**Slide 1/3: Valor Principal**
```
┌─────────────────────────────────┐
│                                 │
│         📊                      │
│                                 │
│    Nunca más olvides            │
│    quién ganó                   │
│                                 │
│  Llevá la cuenta de todos       │
│  tus partidos y mirá quién      │
│  domina la mesa                 │
│                                 │
│  ● ○ ○              [SIGUIENTE] │
└─────────────────────────────────┘
```

**Slide 2/3: Estadísticas Adictivas**
```
┌─────────────────────────────────┐
│                                 │
│      [PREVIEW ANIMADO]          │
│   ┌─────────────────────┐       │
│   │ PEDRO vs JUAN       │       │
│   │   17  ████▓  8      │       │
│   │ 🔥 Racha: Pedro x3  │       │
│   └─────────────────────┘       │
│                                 │
│  Mirá quién te debe             │
│  revancha y con quién           │
│  sos invencible                 │
│                                 │
│  ○ ● ○              [SIGUIENTE] │
└─────────────────────────────────┘
```

**Slide 3/3: Social y Competencia**
```
┌─────────────────────────────────┐
│                                 │
│         🏆                      │
│                                 │
│    Competí por ser              │
│    el Rey del Truco             │
│                                 │
│  Rankings locales, logros       │
│  épicos y la gloria de          │
│  ser el #1                      │
│                                 │
│  ○ ○ ●              [EMPEZAR]   │
└─────────────────────────────────┘
```

---

### 🔐 **PANTALLA 4: AUTENTICACIÓN**

```
┌─────────────────────────────────┐
│         REY DEL TRUCO           │
│                                 │
│   El anotador inteligente       │
│   para jugadores reales         │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🔷 Continuar con Google │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🍎 Continuar con Apple  │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📱 Continuar con SMS    │    │
│  └─────────────────────────┘    │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  💨 [Entrar sin cuenta]         │
│  Solo anotador, sin estadísticas│
│                                 │
│  Al continuar aceptás los       │
│  términos y condiciones         │
└─────────────────────────────────┘
```

---

### 👤 **PANTALLA 5: CREAR PERFIL**

```
┌─────────────────────────────────┐
│      Creá tu perfil único       │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Elegí tu @username      │    │
│  │ @_______________        │    │
│  └─────────────────────────┘    │
│  ✅ Disponible                  │
│                                 │
│  ┌─────────────────────────┐    │
│  │ Tu nombre               │    │
│  │ [________________]      │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📍 Tu ciudad            │    │
│  │ [▼ Seleccionar]         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 📸 Foto (opcional)      │    │
│  │ [+]                     │    │
│  └─────────────────────────┘    │
│                                 │
│       [CREAR PERFIL]            │
└─────────────────────────────────┘
```

---

### 🔔 **PANTALLA 6: PERMISOS (Solo primera vez)**

```
┌─────────────────────────────────┐
│     Configuremos tu app         │
│                                 │
│  🔔 NOTIFICACIONES              │
│  ┌─────────────────────────┐    │
│  │ Te avisamos cuando:      │    │
│  │ • Alguien te desafía     │    │
│  │ • Subís en el ranking    │    │
│  │ • Desbloqueás logros     │    │
│  │                          │    │
│  │ [ACTIVAR] [Más tarde]    │    │
│  └─────────────────────────┘    │
│                                 │
│  👥 CONTACTOS                   │
│  ┌─────────────────────────┐    │
│  │ Encontrá amigos que      │    │
│  │ ya usan TrucoApp         │    │
│  │                          │    │
│  │ [PERMITIR] [Omitir]      │    │
│  └─────────────────────────┘    │
│                                 │
│       [CONTINUAR]               │
└─────────────────────────────────┘
```

---

## 🏠 PANTALLAS PRINCIPALES (TAB NAVIGATION)

### 🏠 **TAB 1: HOME - DASHBOARD PRINCIPAL**

```
┌─────────────────────────────────┐
│ Hola Juan 👋        [🔔2] [⚙️] │
├─────────────────────────────────┤
│                                 │
│  TUS NÚMEROS HOY                │
│  ┌──────────┬──────────┐        │
│  │ RACHA 🔥 │ WIN RATE │        │
│  │    3     │   68%    │        │
│  ├──────────┼──────────┤        │
│  │ GANADOS  │ JUGADOS  │        │
│  │    5     │    7     │        │
│  └──────────┴──────────┘        │
│                                 │
│  ACCIONES RÁPIDAS               │
│  ┌─────────────────────────┐    │
│  │ ⚡ JUGAR AHORA          │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 💀 REVANCHA vs CARLOS   │    │
│  │    Te ganó 30-24 ayer    │    │
│  └─────────────────────────┘    │
│                                 │
│  ACTIVIDAD RECIENTE             │
│  ┌─────────────────────────┐    │
│  │ 🏆 Victoria vs Pedro     │    │
│  │    30-18 • hace 2h       │    │
│  │    Lo dormiste afuera 😴 │    │
│  ├─────────────────────────┤    │
│  │ 📈 Subiste al #3         │    │
│  │    Ranking Córdoba       │    │
│  ├─────────────────────────┤    │
│  │ 🤝 María te desafió      │    │
│  │    H2H: 5-5 empatados    │    │
│  │    [ACEPTAR] [VER STATS] │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 🎮 **TAB 2: PLAY - CONFIGURAR PARTIDA**

```
┌─────────────────────────────────┐
│        NUEVA PARTIDA            │
├─────────────────────────────────┤
│                                 │
│  MODO DE JUEGO                  │
│  ┌─────┬─────┬─────┐           │
│  │ 1v1 │ 2v2 │ 3v3 │           │
│  │  ●  │     │     │           │
│  └─────┴─────┴─────┘           │
│                                 │
│  JUGADORES                      │
│  ┌─────────────────────────┐    │
│  │ 👤 @juan (Vos)          │    │
│  │    68% WR • Racha 3     │    │
│  │ ─────── VS ─────────    │    │
│  │ 👤 [Buscar rival...]    │    │
│  └─────────────────────────┘    │
│                                 │
│  RIVALES FRECUENTES             │
│  ┌─────────────────────────┐    │
│  │ 👤 Carlos               │    │
│  │ H2H: 12-8 a tu favor   │    │
│  │ Último: Perdiste 30-28  │    │
│  │ [SELECCIONAR]          │    │
│  ├─────────────────────────┤    │
│  │ 👤 María                │    │
│  │ H2H: 5-5 empatados     │    │
│  │ Racha: María x2        │    │
│  │ [SELECCIONAR]          │    │
│  ├─────────────────────────┤    │
│  │ 👤 Pedro 🆕             │    │
│  │ H2H: 1-0 a tu favor    │    │
│  │ Lo dormiste 30-12      │    │
│  │ [SELECCIONAR]          │    │
│  └─────────────────────────┘    │
│                                 │
│  ⚡ PREDICCIÓN TRUCOAPP         │
│  ┌─────────────────────────┐    │
│  │ 📊 73% probabilidad      │    │
│  │ de victoria              │    │
│  │ Basado en últimos 10    │    │
│  └─────────────────────────┘    │
│                                 │
│       [EMPEZAR PARTIDO]         │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 🎯 **PANTALLA: ANOTADOR EN VIVO**

```
┌─────────────────────────────────┐
│  JUAN vs CARLOS     [⏸️] [❌]   │
├─────────────────────────────────┤
│                                 │
│  ╔══════════╦══════════╗        │
│  ║   JUAN   ║  CARLOS  ║        │
│  ║    18    ║    12    ║        │
│  ╚══════════╩══════════╝        │
│                                 │
│  ┌─────────┬──────────┐         │
│  │[RAYITAS]│[RAYITAS] │         │
│  │ |||│    │ ||       │         │
│  │         │          │         │
│  │ [+] [-] │ [+] [-]  │         │
│  └─────────┴──────────┘         │
│                                 │
│  [🎯 FALTA ENVIDO]              │
│                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  📊 STATS EN VIVO               │
│  ┌─────────────────────────┐    │
│  │ H2H: Juan 12-8          │    │
│  │ Racha actual: Juan x3   │    │
│  │ Si gana Juan: 13-8      │    │
│  │ Si gana Carlos: 12-9    │    │
│  └─────────────────────────┘    │
│                                 │
│  💬 CANTOS RÁPIDOS              │
│  [TRUCO] [RETRUCO] [VALE 4]    │
│  [ENVIDO] [REAL] [FALTA]       │
│                                 │
└─────────────────────────────────┘
```

---

### 🏆 **PANTALLA: RESULTADO DEL PARTIDO**

```
┌─────────────────────────────────┐
│                                 │
│         🎉 VICTORIA 🎉          │
│                                 │
│           JUAN                  │
│         30 - 18                 │
│          Carlos                 │
│                                 │
│    😴 ¡LO DORMISTE AFUERA!      │
│                                 │
│  ╔═════════════════════════════╗│
│  ║  📊 ACTUALIZACIÓN DE STATS  ║│
│  ║                             ║│
│  ║  Tu récord vs Carlos:       ║│
│  ║  13-8 → 14-8 (64% WR)      ║│
│  ║                             ║│
│  ║  Racha actual: 3 → 4 🔥     ║│
│  ║                             ║│
│  ║  Victorias totales:         ║│
│  ║  89 → 90                    ║│
│  ║                             ║│
│  ║  🏆 NUEVO LOGRO DESBLOQUEADO║│
│  ║  "Domador Serial"           ║│
│  ║  Dormí afuera 25 veces      ║│
│  ╚═════════════════════════════╝│
│                                 │
│  📸 [COMPARTIR]  💀 [REVANCHA]  │
│                                 │
│  📊 [VER ANÁLISIS COMPLETO]     │
│                                 │
│           🏠 [INICIO]           │
└─────────────────────────────────┘
```

---

### 📊 **TAB 3: STATS - ESTADÍSTICAS PRINCIPALES**

```
┌─────────────────────────────────┐
│       MIS ESTADÍSTICAS          │
├─────────────────────────────────┤
│                                 │
│  ┌─────┬─────┬─────┬─────┐     │
│  │TODO │ MES │ SEM │ HOY │     │
│  └─────┴─────┴─────┴─────┘     │
│                                 │
│  📊 RESUMEN GENERAL             │
│  ┌─────────────────────────┐    │
│  │ Partidos: 186           │    │
│  │ Victorias: 127 (68.3%)  │    │
│  │ Racha actual: 4 🔥      │    │
│  │ Mejor racha: 12         │    │
│  └─────────────────────────┘    │
│                                 │
│  🎯 ESTADÍSTICAS CLAVE          │
│  ┌─────────────────────────┐    │
│  │ Promedio en derrotas: 22│    │
│  │ (Llegás lejos)          │    │
│  │                         │    │
│  │ Promedio rival: 19      │    │
│  │ (Los dominás)           │    │
│  │                         │    │
│  │ Durmió afuera: 34x      │    │
│  │ Te durmieron: 8x        │    │
│  └─────────────────────────┘    │
│                                 │
│  📈 TU PROGRESO                 │
│  ┌─────────────────────────┐    │
│  │ Win Rate últimos 30 días│    │
│  │ 75%│      ╱╲            │    │
│  │ 65%│  ___╱  ╲___        │    │
│  │ 55%│ ╱                  │    │
│  │    └──────────────      │    │
│  └─────────────────────────┘    │
│                                 │
│  🏆 TOP RIVALIDADES             │
│  ┌─────────────────────────┐    │
│  │ vs Carlos: 14-8         │    │
│  │ vs María: 5-5           │    │
│  │ vs Pedro: 8-2           │    │
│  │ [VER TODAS]             │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### ⚔️ **PANTALLA: RIVALIDADES DETALLADAS**

```
┌─────────────────────────────────┐
│        MIS RIVALIDADES          │
├─────────────────────────────────┤
│                                 │
│  🔥 RIVALIDAD MÁS INTENSA       │
│  ┌─────────────────────────┐    │
│  │     JUAN vs CARLOS       │    │
│  │                         │    │
│  │  [👤]     14-8     [👤] │    │
│  │  JUAN            CARLOS │    │
│  │                         │    │
│  │  ████████████▓▓▓▓       │    │
│  │       64% dominio       │    │
│  │                         │    │
│  │ 📊 Estadísticas:        │    │
│  │ • Racha actual: Juan x4 │    │
│  │ • Mayor racha: Juan x8  │    │
│  │ • Durmió afuera: 5x     │    │
│  │ • Promedio Carlos: 18   │    │
│  │                         │    │
│  │ 📅 Historial:           │    │
│  │ Ayer: Juan 30-18 ✅     │    │
│  │ Lun: Juan 30-24 ✅      │    │
│  │ Dom: Carlos 30-28 ❌    │    │
│  │                         │    │
│  │ [💀 PEDIR REVANCHA]     │    │
│  └─────────────────────────┘    │
│                                 │
│  TODAS TUS RIVALIDADES          │
│  ┌─────────────────────────┐    │
│  │ vs María: 5-5 (50%)     │    │
│  │ Empatados - Racha: María│    │
│  ├─────────────────────────┤    │
│  │ vs Pedro: 8-2 (80%)     │    │
│  │ Lo tenés de hijo        │    │
│  ├─────────────────────────┤    │
│  │ vs Luis: 3-7 (30%)      │    │
│  │ Tu papá del truco       │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 🤝 **PANTALLA: ESTADÍSTICAS DE EQUIPOS**

```
┌─────────────────────────────────┐
│         MIS EQUIPOS             │
├─────────────────────────────────┤
│                                 │
│  👑 DUPLA INVENCIBLE            │
│  ┌─────────────────────────┐    │
│  │    JUAN & CARLOS         │    │
│  │                         │    │
│  │    🏆 23-2 (92%)        │    │
│  │    Racha: 15 🔥🔥🔥      │    │
│  │                         │    │
│  │ Dominancia total:       │    │
│  │ • Durmieron: 18x        │    │
│  │ • Promedio rival: 16    │    │
│  │ • Invictos: 15 partidos │    │
│  │                         │    │
│  │ Mejores víctimas:       │    │
│  │ • Pedro & Luis: 8-0     │    │
│  │ • María & Ana: 6-1      │    │
│  │ • Hnos García: 5-0      │    │
│  └─────────────────────────┘    │
│                                 │
│  TODAS TUS DUPLAS               │
│  ┌─────────────────────────┐    │
│  │ Juan & María             │    │
│  │ 12-5 (71%) • Racha: 3   │    │
│  ├─────────────────────────┤    │
│  │ Juan & Pedro             │    │
│  │ 8-8 (50%) • Parejos     │    │
│  ├─────────────────────────┤    │
│  │ Juan & Luis              │    │
│  │ 3-9 (25%) • Desastre    │    │
│  └─────────────────────────┘    │
│                                 │
│  [CREAR NUEVA DUPLA]            │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 🏆 **PANTALLA: LOGROS Y ACHIEVEMENTS**

```
┌─────────────────────────────────┐
│         MIS LOGROS              │
├─────────────────────────────────┤
│                                 │
│  🆕 RECIÉN DESBLOQUEADO         │
│  ┌─────────────────────────┐    │
│  │    👑 REY DEL BARRIO    │    │
│  │                         │    │
│  │    100 VICTORIAS        │    │
│  │                         │    │
│  │  "Ya sos leyenda local" │    │
│  └─────────────────────────┘    │
│                                 │
│  PROGRESO DE LOGROS             │
│                                 │
│  🎯 VICTORIAS                   │
│  ✅ Primer sangre (1)           │
│  ✅ Calentando (10)             │
│  ✅ En racha (25)               │
│  ✅ Imparable (50)              │
│  ✅ Rey del barrio (100)        │
│  🔒 Leyenda viviente (250)      │
│     ████████░░ 127/250          │
│                                 │
│  😴 DOMINANCIA                  │
│  ✅ Primera siesta (1)          │
│  ✅ Sandman (10)                │
│  ✅ Morfeo (25)                 │
│  🔒 Freddy Krueger (50)         │
│     ██████░░░░ 34/50            │
│                                 │
│  🔥 RACHAS                      │
│  ✅ Está que arde (5)           │
│  🔒 Fuego sagrado (10)          │
│     ████░░░░░░ 4/10             │
│  🔒 Phoenix (20)                │
│     ██░░░░░░░░ 4/20             │
│                                 │
│  🤝 EQUIPOS                     │
│  ✅ Buen compañero (1 victoria) │
│  ✅ Dupla dinámica (10)         │
│  🔒 Los invencibles (25)        │
│     █████████░ 23/25            │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 👥 **TAB 4: SOCIAL - AMIGOS Y RANKINGS**

```
┌─────────────────────────────────┐
│          SOCIAL                 │
├─────────────────────────────────┤
│                                 │
│  [AMIGOS] [RANKINGS] [DESAFÍOS] │
│                                 │
│  🏆 RANKING CÓRDOBA             │
│  ┌─────────────────────────┐    │
│  │ 1. 👑 Carlos "El Mago"  │    │
│  │    489 victorias • 82%  │    │
│  ├─────────────────────────┤    │
│  │ 2. 🥈 María "Silenciosa"│    │
│  │    356 victorias • 78%  │    │
│  ├─────────────────────────┤    │
│  │ 3. 🥉 JUAN (VOS) ⬆️     │    │
│  │    127 victorias • 68%  │    │
│  │    Subiste 2 puestos    │    │
│  ├─────────────────────────┤    │
│  │ 4. Pedro "El Terrible"  │    │
│  │    124 victorias • 65%  │    │
│  ├─────────────────────────┤    │
│  │ 5. Luis "Manos Frías"   │    │
│  │    98 victorias • 61%   │    │
│  └─────────────────────────┘    │
│                                 │
│  📍 Tu progreso al TOP 2        │
│  ┌─────────────────────────┐    │
│  │ Necesitás:               │    │
│  │ • 229 victorias más      │    │
│  │ • Subir WR a 78%         │    │
│  │                         │    │
│  │ Al ritmo actual:         │    │
│  │ 3-4 meses                │    │
│  └─────────────────────────┘    │
│                                 │
│  [VER RANKING NACIONAL]         │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

### 👤 **TAB 5: PERFIL - CONFIGURACIÓN**

```
┌─────────────────────────────────┐
│         MI PERFIL               │
├─────────────────────────────────┤
│                                 │
│       [FOTO]                    │
│     @juantruco                  │
│     Juan Pérez                  │
│    📍 Córdoba                   │
│                                 │
│  ┌─────────────────────────┐    │
│  │ 🏆 #3 Ranking local     │    │
│  │ 📊 68% Win Rate         │    │
│  │ 🔥 Racha: 4             │    │
│  │ 🎯 127 victorias        │    │
│  └─────────────────────────┘    │
│                                 │
│  MIS INSIGNIAS                  │
│  [👑] [🔥] [😴] [🏆]           │
│                                 │
│  CONFIGURACIÓN                  │
│  ┌─────────────────────────┐    │
│  │ > Editar perfil         │    │
│  │ > Notificaciones        │    │
│  │ > Privacidad            │    │
│  │ > Cuenta Premium 💎     │    │
│  └─────────────────────────┘    │
│                                 │
│  OTROS                          │
│  ┌─────────────────────────┐    │
│  │ > Invitar amigos        │    │
│  │ > Calificar app         │    │
│  │ > Ayuda y soporte       │    │
│  │ > Cerrar sesión         │    │
│  └─────────────────────────┘    │
│                                 │
├─────────────────────────────────┤
│ 🏠      🎮      📊      👥   👤 │
└─────────────────────────────────┘
```

---

## 📱 PANTALLAS MODALES Y OVERLAYS

### 🎉 **MODAL: ACHIEVEMENT DESBLOQUEADO**

```
┌─────────────────────────────────┐
│                                 │
│      ✨ LOGRO DESBLOQUEADO ✨   │
│                                 │
│            👑                   │
│                                 │
│       REY DEL BARRIO            │
│      100 VICTORIAS              │
│                                 │
│   "Ya sos leyenda local,        │
│    todos te conocen"            │
│                                 │
│    [COMPARTIR]  [GENIAL]        │
│                                 │
└─────────────────────────────────┘
```

---

### 💀 **MODAL: DESAFÍO RECIBIDO**

```
┌─────────────────────────────────┐
│        💀 DESAFÍO 💀            │
│                                 │
│  CARLOS te desafió              │
│  a una revancha                 │
│                                 │
│  Head to Head: 14-8             │
│  (Ganás vos)                    │
│                                 │
│  Último partido:                │
│  Victoria 30-18                 │
│  Lo dormiste afuera             │
│                                 │
│  "Esta vez te gano"             │
│  - Carlos                       │
│                                 │
│  [ACEPTAR]  [VER STATS]         │
│  [RECHAZAR]                     │
└─────────────────────────────────┘
```

---

## 🔄 FLUJOS DE USUARIO DETALLADOS

### 🆕 **Flujo Completo de Usuario Nuevo:**

```
1. SPLASH SCREEN (2s)
   ↓
2. ONBOARDING (3 slides)
   • Valor del producto
   • Preview de estadísticas
   • Competencia social
   ↓
3. SELECCIÓN DE AUTENTICACIÓN
   • Google (recomendado)
   • Apple (iOS)
   • SMS
   • Sin cuenta (limitado)
   ↓
4. CREACIÓN DE PERFIL
   • @username único
   • Nombre completo
   • Ciudad
   • Foto (opcional)
   ↓
5. PERMISOS
   • Notificaciones (opcional)
   • Contactos (opcional)
   ↓
6. TUTORIAL RÁPIDO
   • "Tocá acá para anotar"
   • "Acá ves tus stats"
   • "Desafiá a amigos"
   ↓
7. DASHBOARD HOME
   • Primera partida sugerida
   • Amigos para agregar
```

### 🔄 **Flujo de Partido Completo:**

```
1. TAB JUGAR o ACCIÓN RÁPIDA
   ↓
2. SELECCIÓN DE MODO
   • 1v1, 2v2, 3v3
   ↓
3. SELECCIÓN DE JUGADORES
   • Búsqueda por @username
   • Selección de frecuentes
   • Ver stats vs rival
   ↓
4. CONFIRMACIÓN PRE-JUEGO
   • Predicción de resultado
   • Stats head-to-head
   ↓
5. ANOTADOR EN VIVO
   • Puntos con rayitas
   • Falta envido
   • Stats en tiempo real
   ↓
6. LLEGADA A 30 PUNTOS
   ↓
7. PANTALLA DE RESULTADO
   • Celebración/Animación
   • Update de estadísticas
   • Logros desbloqueados
   ↓
8. OPCIONES POST-JUEGO
   • Compartir resultado
   • Pedir revancha
   • Ver análisis detallado
   • Volver al home
```

### 🔄 **Flujo de Consulta de Estadísticas:**

```
1. TAB ESTADÍSTICAS
   ↓
2. VISTA GENERAL
   • Filtros temporales
   • Métricas principales
   • Gráficos de progreso
   ↓
3. SELECCIÓN DE CATEGORÍA
   ├── RIVALIDADES
   │   • Lista de rivales
   │   • Head-to-head detallado
   │   • Historial de partidos
   │
   ├── EQUIPOS
   │   • Duplas y tríos
   │   • Performance por equipo
   │   • Mejores combinaciones
   │
   └── LOGROS
       • Progreso de achievements
       • Próximos a desbloquear
       • Compartir logros
```

---

## 📊 SISTEMA DE ESTADÍSTICAS ADICTIVAS

### 🎯 **Estadísticas Individuales Trackeadas:**

1. **Básicas:**
   - Partidos totales
   - Victorias/Derrotas
   - Win rate porcentual
   - Racha actual
   - Mejor racha histórica

2. **Avanzadas:**
   - Promedio de puntos en derrotas (qué tan cerca llegás)
   - Promedio de puntos del rival (a cuánto los dejás)
   - Veces que dormiste afuera (<15 puntos)
   - Veces que te durmieron
   - Partidos cerrados (25-30 puntos)
   - Goleadas propinadas (30-10 o menos)

3. **Temporales:**
   - Stats por día de la semana
   - Stats por horario
   - Progresión mensual
   - Comparación año a año

### 🤝 **Estadísticas de Equipos:**

1. **Por Dupla/Trío:**
   - Win rate como equipo
   - Racha de equipo
   - Rivals más derrotados
   - Kryptonita del equipo

2. **Sinergia:**
   - Con quién jugás mejor
   - Peor compañero estadístico
   - Equipo más dominante

### 🏆 **Sistema de Logros (50+ achievements):**

**Categorías:**
- Victorias (1, 10, 25, 50, 100, 250, 500)
- Rachas (3, 5, 10, 15, 20, 30)
- Dominancia (dormir afuera)
- Equipos (victorias en dupla)
- Especiales (jugar de madrugada, etc.)

---

## 💰 MODELO FREEMIUM

### 🆓 **Gratis:**
- Anotador completo
- Stats últimos 30 días
- 5 logros básicos
- 3 rivalidades trackeadas

### 💎 **Premium ($3/mes):**
- Historial ilimitado
- Todos los logros (50+)
- Stats avanzadas y gráficos
- Rivalidades ilimitadas
- Backup en la nube
- Sin publicidad
- Badge exclusivo

---

## 🚀 MÉTRICAS DE ÉXITO

### 📈 **KPIs Principales:**
- **Retención D1:** >80%
- **Retención D7:** >60%
- **Retención D30:** >40%
- **Partidos por usuario/mes:** >20
- **Conversión a premium:** >5%
- **Viral coefficient:** >1.2

### 🎯 **North Star Metric:**
**Usuarios activos mensuales con 10+ partidos registrados**

---

## 🛠️ STACK TÉCNICO

### 📱 **Mobile:**
- React Native + Expo
- React Navigation 6
- AsyncStorage + MMKV
- React Query
- Socket.io client

### 🔧 **Backend:**
- Node.js + Express
- PostgreSQL + Redis
- Socket.io
- JWT auth
- Firebase services

### ☁️ **Infraestructura:**
- Vercel (frontend)
- Railway (backend)
- Supabase (database)
- Cloudflare (CDN)
- Sentry (monitoring)