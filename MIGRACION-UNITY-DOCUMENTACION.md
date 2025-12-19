# 📋 DOCUMENTACIÓN COMPLETA - REY DEL TRUCO
## Migración a Unity - Especificación Detallada

---

## 🎮 1. ESTRUCTURA DE PANTALLAS

### 1.1 PANTALLA DE INICIO (`pantallaActual: 'inicio'`)
**Componente**: `PantallaInicio.jsx`

#### Estados de la Pantalla de Inicio:
- **MENÚ PRINCIPAL** (`modoSeleccionado: null`)
- **MODO RÁPIDO** (`modoSeleccionado: 'rapido'`) - ⚠️ NO IMPLEMENTADO
- **MODO PERSONALIZADO** (`modoSeleccionado: 'personalizado'`)

### 1.2 PANTALLA DE JUEGO (`pantallaActual: 'juego'`)
**Componente**: `AnotadorTruco.jsx` (renderPantallaJuego)
- Pantalla principal donde se desarrolla el juego
- Muestra puntos, nombres de jugadores y controles

### 1.3 PANTALLA DE HISTORIAL (`pantallaActual: 'historial'`)
**Componente**: `AnotadorTruco.jsx` (renderPantallaHistorial)
- Lista cronológica de todos los movimientos del partido

---

## 🔘 2. BOTONES Y FUNCIONALIDADES DETALLADAS

### 2.1 PANTALLA INICIO - MENÚ PRINCIPAL

#### **Botón CONTINUAR** *(Condicional)*
- **Texto**: "CONTINUAR"
- **Condición de visibilidad**: `haySavedGame === true`
- **Función**: `onContinuarPartida()`
- **Acción**: Carga partida guardada y navega a pantalla juego
- **Clases CSS**: `rey-premium-button continue-game`
- **Posición**: Primer botón cuando existe partida guardada

#### **Botón ANOTADOR**
- **Texto**: "ANOTADOR"
- **Función**: `setModoSeleccionado('personalizado')`
- **Acción**: Navega a configuración personalizada
- **Clases CSS**: `rey-premium-button`
- **Posición**: Segundo botón (o único si no hay partida guardada)

### 2.2 PANTALLA INICIO - MODO PERSONALIZADO

#### **Selectores de Puntos Totales**
Tres botones horizontales para elegir duración:
1. **16 PUNTOS**
   - **Ícono**: ⚡
   - **Texto**: "RÁPIDA"
   - **Valor**: 16
2. **24 PUNTOS**
   - **Ícono**: ⚔️
   - **Texto**: "CLÁSICA"
   - **Valor**: 24
3. **30 PUNTOS**
   - **Ícono**: 🏆
   - **Texto**: "ÉPICA"
   - **Valor**: 30

**Función**: `setConfiguracion({...configuracion, puntosTotales: value})`
**Clase activa**: `point-option selected`

#### **Inputs de Nombres**
- **Input Jugador 1**
  - Placeholder: "Jugador 1"
  - Default: "Nosotros"
  - MaxLength: 15
- **Input Jugador 2**
  - Placeholder: "Jugador 2"
  - Default: "Ellos"
  - MaxLength: 15

#### **Botones de Navegación**
1. **Botón VOLVER**
   - **Texto**: "← VOLVER"
   - **Función**: `volverAInicio()`
   - **Clases**: `rey-premium-button rey-premium-button-secondary`
   - **Ancho**: 48%

2. **Botón LARGUEMOS**
   - **Texto**: "¡LARGUEMOS!"
   - **Función**: `iniciarPersonalizado()`
   - **Validación**: Requiere nombres no vacíos
   - **Clases**: `rey-premium-button rey-premium-button-primary`
   - **Ancho**: 48%

### 2.3 PANTALLA DE JUEGO

#### **Layout de 3 Columnas**
```
[JUGADOR 1] | [TRONO DIVISOR] | [JUGADOR 2]
```

#### **Controles de Puntos**

##### **Áreas Clickeables de Rayitas** (Invisibles)
- **Ubicación**: Todo el componente ScoreDisplay
- **Función Jugador 1**: `sumarPunto('nos')`
- **Función Jugador 2**: `sumarPunto('ellos')`
- **Eventos**: `onClick` y `onTouchEnd`
- **Feedback visual**: Ninguno (área transparente)

##### **Botones Menos**
1. **Botón Menos Jugador 1**
   - **Símbolo**: "−"
   - **Función**: `restarPunto('nos')`
   - **Clases**: `rey-premium-score-button rey-premium-score-button-minus`
   - **Estado deshabilitado**: Cuando `ganador !== null`

2. **Botón Menos Jugador 2**
   - **Símbolo**: "−"
   - **Función**: `restarPunto('ellos')`
   - **Clases**: `rey-premium-score-button rey-premium-score-button-minus`
   - **Estado deshabilitado**: Cuando `ganador !== null`

#### **Botones de Acción (Zona Central Inferior)**

1. **Botón FALTA ENVIDO**
   - **Texto**: "FALTA ENVIDO"
   - **Función**: `setMostrarModalFalta(true)`
   - **Clases**: `rey-premium-action-button rey-premium-action-button-danger`
   - **Estado deshabilitado**: Cuando `ganador !== null`

2. **Botón MENÚ PRINCIPAL**
   - **Texto**: "MENÚ PRINCIPAL"
   - **Función**: `setPantallaActual('inicio')`
   - **Clases**: `rey-premium-action-button rey-premium-action-button-primary`

3. **Botón VER HISTORIAL** *(Condicional)*
   - **Texto**: "VER HISTORIAL"
   - **Condición**: `historial.length > 0`
   - **Función**: `setPantallaActual('historial')`
   - **Clases**: `rey-premium-action-button`

### 2.4 MODAL DE VICTORIA

#### **Estructura del Modal**
- **Backdrop**: Oscuro con blur
- **Animación entrada**: Scale y fade-in
- **Contenido**: Mensaje de victoria + botones

#### **Botón Cerrar (X)**
- **Símbolo**: "✕"
- **Posición**: Esquina superior derecha
- **Función**: 
  ```javascript
  if (ganador === 'nos') restarPunto('nos')
  else restarPunto('ellos')
  setGanador(null)
  ```

#### **Botones de Acción**
1. **OTRA VUELTA**
   - **Función**: `nuevoPartido()` → reinicia todo
   - **Clases**: `rey-premium-modal-button rey-premium-modal-button-primary`

2. **MENÚ PRINCIPAL**
   - **Función**: `setPantallaActual('inicio')`
   - **Clases**: `rey-premium-modal-button rey-premium-modal-button-secondary`

### 2.5 MODAL FALTA ENVIDO

#### **Cálculo de Puntos**
```javascript
puntosFalta = puntosTotales - puntosContrario
```

#### **Botones de Selección**
1. **Botón Jugador 1**
   - **Texto**: `{nombreJugador1} (+{puntos} puntos)` o "¡PARTIDO!"
   - **Función**: `faltaEnvido('nos')`
   - **Clases**: `rey-premium-modal-button rey-premium-modal-button-primary`

2. **Botón Jugador 2**
   - **Texto**: `{nombreJugador2} (+{puntos} puntos)` o "¡PARTIDO!"
   - **Función**: `faltaEnvido('ellos')`
   - **Clases**: `rey-premium-modal-button rey-premium-modal-button-primary`

3. **Botón CANCELAR**
   - **Función**: `setMostrarModalFalta(false)`
   - **Clases**: `rey-premium-modal-button rey-premium-modal-button-secondary`

### 2.6 PANTALLA HISTORIAL

#### **Header con Navegación**
- **Componente**: `MobileNavHeader`
- **Botón VOLVER**
  - **Texto**: "← VOLVER"
  - **Función**: `setPantallaActual('juego')`
  - **Clases**: `rey-premium-back-button`

#### **Gesture de Swipe**
- **Hook**: `useSwipeBack`
- **Acción**: Swipe desde borde izquierdo vuelve a pantalla juego

#### **Lista de Movimientos**
Cada item muestra:
- Jugador que sumó/restó
- Puntos actuales tras el movimiento
- Timestamp relativo

---

## 🎯 3. SISTEMA DE PUNTUACIÓN

### 3.1 Reglas de Puntuación

#### **Puntos Normales**
- **Rango**: 0 a `puntosTotales`
- **Sumar**: Tap/click en área de rayitas
- **Restar**: Botón menos (mínimo 0)
- **Victoria**: Al alcanzar `puntosTotales`

#### **Falta Envido**
- **Fórmula**: `puntosTotales - puntosContrario`
- **Victoria instantánea**: Si resultado ≥ `puntosTotales`
- **Ejemplo**: 
  - Juegan a 30
  - Ellos tienen 22
  - Nosotros gana 8 puntos (30-22)

### 3.2 Sistema Visual de Rayitas (ScoreDisplay)

#### **Estructura Visual**
```
BUENAS (primera mitad)
─────────────────────── (línea divisoria)
MALAS (segunda mitad)
```

#### **Representación**
- **Rayita simple**: | (1 punto)
- **Cuadradito**: ▢ (5 puntos - agrupa 4 rayitas + cierre)
- **Color normal**: #D4A574 (dorado)
- **Color "Al Verde"**: #F5DEB3 (hueso) cuando `puntos = puntosTotales - 1`

#### **Distribución**
- **Buenas**: Puntos 1 a `Math.floor(puntosTotales/2)`
- **Malas**: Puntos desde `Math.floor(puntosTotales/2) + 1` hasta `puntosTotales`

---

## 💾 4. SISTEMA DE PERSISTENCIA

### 4.1 LocalStorage

#### **Configuración**
- **Key**: `'anotador-truco-partida'`
- **Duración**: 24 horas
- **Auto-guardado**: En cada cambio de estado

#### **Estructura de Datos Guardados**
```javascript
{
  puntosNos: number,        // 0-30
  puntosEllos: number,      // 0-30
  jugador1: string,         // Nombre jugador 1
  jugador2: string,         // Nombre jugador 2
  puntosTotales: number,    // 16, 24 o 30
  historial: [              // Array de movimientos
    {
      jugador: string,
      accion: string,
      puntosNos: number,
      puntosEllos: number,
      timestamp: Date
    }
  ],
  timestamp: number,        // Momento de guardado
  ganador: null            // Siempre null al guardar
}
```

#### **Condiciones de Guardado**
- No hay ganador actual
- Al menos 1 punto sumado O 1 movimiento en historial

### 4.2 Hooks de Persistencia

#### **useGamePersistence**
```javascript
// Funciones disponibles
getSavedGame()      // Recupera partida si < 24h
clearSavedGame()    // Elimina partida guardada
hasSavedGame()      // Boolean si existe partida
```

---

## 🎨 5. SISTEMA VISUAL Y ANIMACIONES

### 5.1 Paleta de Colores Principal

#### **Colores Dorados (Tema Rey)**
```css
--rey-gold-bright: #FFD700
--rey-gold-main: #D4AF37
--rey-gold-dark: #B8860B
--rey-bronze: #D4A574
--rey-bronze-dark: #C59660
--rey-bronze-light: #E6C589
```

#### **Color Hueso (Visibilidad)**
```css
--bone-color: #F5DEB3     /* Para textos sobre fondo oscuro */
--bone-shadow: rgba(245, 222, 179, 0.5)
```

#### **Fondos y Sombras**
```css
--rey-bg-dark: #1a0f0a
--rey-bg-darker: #0d0705
--rey-shadow-gold: rgba(248, 231, 28, 0.5)
--rey-glow-gold: rgba(255, 215, 0, 0.8)
```

### 5.2 Tipografía

#### **Jerarquía de Fuentes**
1. **Tilt Warp**: Títulos principales, "AL VERDE"
2. **Cinzel Decorative**: Subtítulos ornamentales
3. **Fredericka the Great**: Textos decorativos
4. **Rye**: Elementos western/vintage
5. **Oswald**: UI/Botones
6. **Playfair Display**: Texto largo
7. **Roboto**: Fallback

### 5.3 Animaciones Principales

#### **Pantalla de Inicio**
```css
/* Partículas Doradas Flotantes */
.gold-particle-large   { animation: float-particle-vertical 25s }
.gold-particle-medium  { animation: float-particle-diagonal 20s }
.gold-particle-small   { animation: float-particle-circular 15s }
.gold-particle-micro   { animation: sparkle 3s }

/* Efectos 3D con Capas */
.depth-layer-1 { filter: blur(0.5px) }
.depth-layer-2 { filter: blur(1px) }
.depth-layer-3 { filter: blur(2px) }

/* Logo Animado */
.logo-emergence {
  animation: logo-emergence 2s ease-out
  /* Scale 0.8→1, opacity 0→1, rotateY */
}

/* Trono 3D */
.trono-emergence {
  animation: trono-emergence 2.5s
  /* Perspective animation */
}
```

#### **Durante el Juego**
```css
/* Al Verde (29 puntos) */
.animate-pulse {
  animation: pulse 2s infinite
  /* Scale 1→1.05→1 */
}

/* Text Shadow Dorado */
text-shadow: 
  0 0 20px rgba(245, 222, 179, 0.8),
  0 0 40px rgba(245, 222, 179, 0.5)

/* Hover Botones */
.premium-click:hover {
  transform: translateY(-2px) scale(1.02)
  box-shadow: 0 12px 28px rgba(212, 165, 116, 0.5)
}
```

#### **Transiciones de Pantalla**
```css
/* Entrada Épica */
.epic-entrance {
  animation: epicEntrance 0.8s
  /* RotateX 30deg→0, blur 10px→0 */
}

/* Screen Transition */
.screen-transition {
  animation: gentleSlideIn 0.5s
  will-change: transform
}
```

### 5.4 Efectos Especiales

#### **Sistema de Partículas**
- 4 tamaños: large (80px), medium (60px), small (40px), micro (20px)
- Movimientos: vertical, diagonal, circular, sparkle
- Opacidad variable: 0.3 - 0.7
- GPU accelerated con `transform3d`

#### **Efectos Premium**
1. **Sparkle Effect**: Destellos en esquinas de botones
2. **Gold Ripple**: Ondas doradas al hacer click
3. **Victory Glow**: Resplandor épico en victoria
4. **Magic Gold BG**: Fondo animado con gradientes

---

## 🗺️ 6. FLUJO DE NAVEGACIÓN

### 6.1 Diagrama de Flujo Completo

```
INICIO
│
├─> CONTINUAR ──────────────────┐
│   (si hay partida guardada)   │
│                                ↓
└─> ANOTADOR ─> PERSONALIZADO ─> JUEGO
    │               │            │
    │               │            ├─> TAP RAYITAS (suma punto)
    │               │            ├─> BOTÓN − (resta punto)
    │               │            ├─> FALTA ENVIDO ─> MODAL
    │               │            │                    │
    │               │            │                    ├─> J1 gana falta
    │               │            │                    ├─> J2 gana falta
    │               │            │                    └─> CANCELAR
    │               │            │
    │               │            ├─> VICTORIA (30pts) ─> MODAL
    │               │            │                        │
    │               │            │                        ├─> X (resta 1)
    │               │            │                        ├─> OTRA VUELTA
    │               │            │                        └─> MENÚ
    │               │            │
    │               │            ├─> VER HISTORIAL ─> HISTORIAL
    │               │            │                     │
    │               │            │                     └─> VOLVER/SWIPE
    │               │            │
    │               │            └─> MENÚ PRINCIPAL
    │               │
    │               └─> VOLVER
    │
    └─> MODO RÁPIDO (NO IMPLEMENTADO)
```

### 6.2 Transiciones de Estado

#### **Estados Globales**
```javascript
// En AnotadorTruco
pantallaActual: 'inicio' | 'juego' | 'historial'
mostrarModalFalta: boolean
ganador: null | 'nos' | 'ellos'

// En PantallaInicio
modoSeleccionado: null | 'rapido' | 'personalizado'
```

#### **Flujo de Estados en Nueva Partida**
1. `inicio` → Usuario toca ANOTADOR
2. `modoSeleccionado = 'personalizado'`
3. Usuario configura y toca LARGUEMOS
4. `pantallaActual = 'juego'`
5. `useGameState` inicializa con configuración

#### **Flujo de Estados en Continuar**
1. `inicio` → Usuario toca CONTINUAR
2. `getSavedGame()` recupera estado
3. `restaurarPartida(savedGame)`
4. `pantallaActual = 'juego'`

---

## 🎮 7. MECÁNICAS DE JUEGO

### 7.1 Inicio de Partida

#### **Nueva Partida Personalizada**
1. Seleccionar puntos totales (16/24/30)
2. Ingresar nombres (máx 15 caracteres)
3. Validación: nombres no vacíos
4. Inicializar estado con configuración

#### **Continuar Partida**
1. Verificar si existe en localStorage
2. Verificar si tiene < 24 horas
3. Cargar estado completo
4. Navegar a pantalla juego

### 7.2 Durante el Juego

#### **Sumar Puntos**
- **Método**: Tap/click en área de ScoreDisplay
- **Límite**: No puede exceder puntosTotales
- **Feedback**: Visual en rayitas + historial
- **Victoria**: Automática al alcanzar puntosTotales

#### **Restar Puntos**
- **Método**: Botón menos (−)
- **Límite**: Mínimo 0
- **Uso común**: Corregir errores

#### **Falta Envido**
- **Activación**: Botón FALTA ENVIDO
- **Cálculo**: Muestra puntos que ganaría cada uno
- **Resultado**: Suma puntos o victoria instantánea

### 7.3 Final de Partida

#### **Victoria Normal**
- Alcanzar puntosTotales exactos
- Modal de victoria con opciones
- Auto-guardado se desactiva

#### **Victoria por Falta**
- Si falta envido resulta ≥ puntosTotales
- Mismo modal de victoria
- Registro en historial

### 7.4 Historial de Movimientos

#### **Información Registrada**
```javascript
{
  jugador: string,      // Nombre del jugador
  accion: string,       // "sumó"/"restó"/"falta envido"
  puntosNos: number,    // Estado después
  puntosEllos: number,  // Estado después
  timestamp: Date       // Momento exacto
}
```

#### **Visualización**
- Lista cronológica inversa (más reciente arriba)
- Formato: "{Jugador} {acción} - Nos: {X} | Ellos: {Y}"
- Timestamp relativo: "hace X minutos"

---

## 📱 8. CONSIDERACIONES TÉCNICAS

### 8.1 Responsividad

#### **Breakpoints**
```css
xs: 0px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
tablet-landscape: (orientation: landscape) and (max-height: 768px)
phone-landscape: (orientation: landscape) and (max-height: 480px)
```

#### **Tipografía Fluida**
```css
/* Ejemplo de escalado */
.player-name-fluid {
  font-size: clamp(2rem, 5vw, 4rem);
}
```

### 8.2 Performance

#### **Optimizaciones CSS**
- Hardware acceleration: `transform3d(0,0,0)`
- Will-change en animaciones críticas
- GPU compositing para partículas

#### **Optimizaciones React**
- Estados locales cuando es posible
- useCallback para event handlers
- Lazy loading de modales

### 8.3 Accesibilidad

#### **Contraste de Colores**
- Texto hueso (#F5DEB3) sobre fondos oscuros
- Ratio WCAG AA compliant
- Estados hover/focus visibles

#### **Touch Targets**
- Mínimo 48x48px en móvil
- Áreas clickeables expandidas
- Prevención de zoom: `touch-action: manipulation`

### 8.4 Compatibilidad

#### **Navegadores**
- Chrome/Edge: Full support
- Safari: Full support + iOS optimizations
- Firefox: Full support

#### **Dispositivos**
- iOS: Safe area insets, swipe gestures
- Android: Touch optimizations
- Desktop: Hover states, layouts amplios

---

## 🚀 9. ELEMENTOS ÚNICOS PARA UNITY

### 9.1 Assets Necesarios

#### **Imágenes**
1. **Logo Rey del Truco**: Efecto 3D emergence
2. **Trono Argentino**: Divisor central (100-140px ancho)
3. **Partículas Doradas**: 4 tamaños de sprites
4. **Backgrounds Victorianos**: Patterns SVG

#### **Fuentes**
- Tilt Warp (Google Fonts)
- Cinzel Decorative
- Fredericka the Great
- Rye
- Oswald
- Playfair Display
- Roboto (fallback)

### 9.2 Sistemas a Implementar

#### **Sistema de Partículas**
- Pool de partículas reusables
- 4 tipos de movimiento
- Opacidad y tamaño variable
- Respawn continuo

#### **Sistema de Animaciones**
- Tweening library para transiciones
- Secuencias de entrada/salida
- Efectos de hover/tap
- Shake/pulse effects

#### **Sistema de Persistencia**
- PlayerPrefs o archivo JSON
- Timestamp validation (24h)
- Auto-save en cambios

### 9.3 Consideraciones de UI

#### **Canvas Setup**
- UI Scale con reference resolution
- Anchor presets para responsividad
- Safe area para notches

#### **Layout Groups**
- Horizontal para botones de puntos
- Vertical para lista historial
- Grid para rayitas (5 columnas)

### 9.4 Shader Effects

#### **Golden Glow Shader**
- Rim lighting dorado
- Pulse animation parameter
- HDR color support

#### **Blur Shader**
- Para backgrounds de modales
- Depth of field effect
- Performance optimized

---

## 📋 10. CHECKLIST DE IMPLEMENTACIÓN

### ✅ Pantallas
- [ ] Pantalla Inicio con 3 estados
- [ ] Pantalla Juego con layout 3 columnas
- [ ] Pantalla Historial con scroll
- [ ] Modal Victoria
- [ ] Modal Falta Envido

### ✅ Funcionalidades Core
- [ ] Sistema de puntos (sumar/restar)
- [ ] Sistema de rayitas visual
- [ ] Falta envido con cálculo
- [ ] Detección de victoria
- [ ] Historial de movimientos

### ✅ Persistencia
- [ ] Guardar partida automático
- [ ] Cargar partida < 24h
- [ ] Limpiar partidas viejas

### ✅ Visual/UX
- [ ] Tema dorado completo
- [ ] Partículas flotantes
- [ ] Animaciones de entrada
- [ ] Efectos hover/tap
- [ ] Transiciones suaves

### ✅ Responsividad
- [ ] Layout móvil vertical
- [ ] Layout móvil horizontal
- [ ] Layout tablet
- [ ] Layout desktop
- [ ] Safe areas

### ✅ Audio (Opcional para Unity)
- [ ] Sonido tap/click
- [ ] Sonido victoria
- [ ] Música ambiente
- [ ] Sonido falta envido

---

Esta documentación proporciona todos los detalles necesarios para recrear fielmente la aplicación Rey del Truco en Unity, manteniendo la funcionalidad, estética y experiencia de usuario originales.