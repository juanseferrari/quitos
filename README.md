# 🃏 Anotador de Truco

Una aplicación web moderna para llevar el puntaje del juego argentino más popular: **El Truco**. Diseñada con una estética de cuaderno manuscrito y optimizada para dispositivos móviles.

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)
![Mobile First](https://img.shields.io/badge/Mobile-First-green.svg)

## ✨ Características Principales

### 🎮 Funcionalidades del Juego
- **Contador de puntos intuitivo**: Toca en cualquier parte del puntaje para sumar
- **Múltiples modalidades**: Partidas de 16, 24 o 30 puntos
- **Falta Envido**: Implementación correcta con cálculo automático de puntos
- **Historial detallado**: Registro completo de todos los movimientos
- **Guardado automático**: Nunca pierdas una partida por error

### 🎨 Experiencia Visual
- **Dos temas únicos**:
  - **Modo Clásico**: Estética de papel con acentos azules
  - **Modo Campo**: Tema oscuro con paleta beige y naranja
- **Tipografía manuscrita**: Fuentes orgánicas que simulan escritura a mano
- **Rayitas tradicionales**: Visualización auténtica del puntaje con palitos
- **Animaciones suaves**: Feedback visual para cada interacción

### 📱 Optimización Móvil
- **Diseño móvil nativo**: Patrones de navegación iOS/Android
- **Gestos naturales**: Deslizar para volver atrás
- **Zonas de toque amplias**: Botones de mínimo 48px para fácil uso
- **Responsive**: Funciona perfectamente en celular, tablet y desktop

## 🚀 Inicio Rápido

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tuusuario/anotador-truco.git

# Navegar al directorio
cd anotador-truco

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:3000`

### Construcción para Producción
```bash
npm run build
```

## 📸 Capturas de Pantalla

### Pantalla de Inicio - Modo Clásico
*Interfaz limpia con opciones de inicio rápido y personalizado. El botón amarillo "Continuar Partida" aparece cuando hay una partida guardada.*

**Características destacadas:**
- Toggle de tema en la parte superior
- Botón "Inicio Rápido" para partidas a 30 puntos
- "Modo Personalizado" para configurar nombres y puntos
- Tipografía manuscrita con rotaciones orgánicas

### Pantalla de Inicio - Modo Campo
*Tema oscuro con paleta cálida optimizada para ambientes con poca luz.*

**Diferencias del Modo Campo:**
- Fondo oscuro con gradientes sutiles
- Botones en tonos beige y naranja
- Mejor contraste para uso nocturno
- Misma funcionalidad con estética diferente

### Juego en Progreso - Modo Clásico
*Contador principal con rayitas tradicionales y controles intuitivos.*

**Funcionalidades visibles:**
- Nombres de equipos editables
- Puntajes grandes con animaciones
- Rayitas dibujadas tradicionalmente
- Indicador "¡AL VERDE!" cuando falta 1 punto
- Botones +/- para cada equipo
- Botón "Falta Envido" prominente

### Juego en Progreso - Modo Campo
*Tema nocturno con excelente legibilidad.*

**Optimizaciones del tema oscuro:**
- Rayitas en color beige dorado
- Texto blanco para máximo contraste
- Botones adaptados a la paleta oscura
- Fondos translúcidos con blur

### Continuar Partida
*Botón prominente que aparece automáticamente cuando hay una partida guardada.*

**Sistema de guardado:**
- Aparece solo cuando hay partida en progreso
- Animación pulse para llamar la atención
- Se adapta al tema actual
- Restaura todos los datos: puntajes, nombres, historial

### Configuración Personalizada
*Pantalla para personalizar la experiencia de juego.*

**Opciones disponibles:**
- Nombres de equipos personalizados (máximo 15 caracteres)
- Selección de puntos totales: 16, 24 o 30
- Cálculo automático de "malas" y "buenas"
- Botones con feedback visual
- Navegación fluida con animaciones

### Historial de Movimientos
*Registro detallado de todos los movimientos con timestamps.*

**Información mostrada:**
- Tipo de acción: +, -, o Falta Envido
- Equipo que realizó la acción
- Puntaje anterior y nuevo
- Hora exacta del movimiento
- Número de movimiento
- Navegación nativa con botón volver

## 🎯 Cómo Usar

### Inicio de Partida
1. **Inicio Rápido**: Partida tradicional a 30 puntos con equipos "Nosotros vs Ellos"
2. **Modo Personalizado**: Configura nombres de equipos y puntos totales (16, 24 o 30)
3. **Continuar Partida**: Aparece automáticamente si hay una partida guardada

### Durante el Juego
- **Sumar puntos**: Toca cualquier parte del área de puntaje o usa los botones +/-
- **Falta Envido**: Botón especial que calcula automáticamente los puntos ganados
- **Cambiar tema**: Alterna entre Modo Clásico y Modo Campo
- **Ver historial**: Accede al registro completo de movimientos

### Funciones Especiales
- **Guardado automático**: La partida se guarda en cada movimiento
- **Protección contra errores**: Confirmación al salir durante una partida
- **Navegación nativa**: Desliza desde el borde izquierdo para volver atrás

## 🛠️ Tecnologías Utilizadas

- **React 19**: Framework principal con hooks modernos
- **Tailwind CSS**: Diseño utility-first con sistema de temas personalizado
- **Create React App**: Configuración y build tools
- **localStorage**: Persistencia local sin necesidad de servidor
- **Custom Hooks**: Arquitectura modular y reutilizable

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── AnotadorTruco.jsx     # Componente principal del juego
│   ├── PantallaInicio.jsx    # Pantalla de inicio con modos
│   ├── ScoreDisplay.jsx      # Visualización de rayitas
│   └── MobileNavHeader.jsx   # Navegación móvil nativa
├── hooks/
│   ├── useGameState.js       # Lógica principal del juego
│   ├── useGamePersistence.js # Sistema de guardado automático
│   └── useSwipeBack.js       # Gestos de navegación
├── styles/
│   └── globals.css          # Sistema de temas y animaciones
└── App.js                   # Componente raíz
```

## 🎲 Reglas de Juego Implementadas

### Puntaje Tradicional
- **Malas**: Primera mitad de puntos (ej: 0-15 en partida a 30)
- **Buenas**: Segunda mitad de puntos (ej: 16-30 en partida a 30)
- **Al Verde**: Cuando faltan solo 1 punto para ganar

### Falta Envido
- Calcula automáticamente los puntos que faltan al oponente
- Gana inmediatamente si los puntos sumados alcanzan el total
- Se registra en el historial con timestamp

## 🔧 Configuración de Desarrollo

### Scripts Disponibles
```bash
npm start          # Servidor de desarrollo
npm test           # Tests en modo watch
npm run build      # Build de producción
npm run eject      # Exponer configuración (irreversible)
```

### Funcionalidades Técnicas
- **Guardado automático**: Cada acción se persiste en localStorage
- **Recuperación de sesión**: Las partidas se mantienen por 24 horas
- **Responsive design**: Optimizado para todos los tamaños de pantalla
- **Performance**: Animaciones GPU-aceleradas y componentes optimizados
- **Offline-first**: Funciona completamente sin conexión a internet

## 🚀 Roadmap Futuro

### v0.1.0 - Mejoras Planificadas
- [ ] Modo multijugador online
- [ ] Estadísticas de partidas
- [ ] Sonidos y haptic feedback
- [ ] PWA (Progressive Web App)
- [ ] Exportar historial

### v0.2.0 - Características Avanzadas
- [ ] Torneos
- [ ] Perfiles de jugadores
- [ ] Temas adicionales
- [ ] Integración con redes sociales

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 💖 Agradecimientos

- Inspirado en los cuadernos tradicionales argentinos para anotar el truco
- Tipografías optimizadas para la experiencia manuscrita
- Diseño mobile-first pensado para la cancha y el asado

---

**¡Desarrollado con ❤️ para la comunidad argentina del Truco!**

*¿Encontraste un bug o tenés una idea? [Abrí un issue](https://github.com/tuusuario/anotador-truco/issues)*