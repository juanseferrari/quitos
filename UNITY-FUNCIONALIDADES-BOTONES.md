# FUNCIONALIDADES Y BOTONES - REY DEL TRUCO
## Especificación para Unity

---

## 🎮 PANTALLAS DEL JUEGO

### 1. PANTALLA INICIO
- **Botón "CONTINUAR"** → Carga partida guardada (solo visible si hay partida guardada)
- **Botón "ANOTADOR"** → Va a configuración de nueva partida

### 2. PANTALLA CONFIGURACIÓN
- **Input Campo Texto "Jugador 1"** → Nombre jugador 1 (max 15 caracteres, default: "Nosotros")
- **Input Campo Texto "Jugador 2"** → Nombre jugador 2 (max 15 caracteres, default: "Ellos")
- **Botón Toggle "16 PUNTOS"** → Selecciona juego a 16 puntos
- **Botón Toggle "24 PUNTOS"** → Selecciona juego a 24 puntos
- **Botón Toggle "30 PUNTOS"** → Selecciona juego a 30 puntos
- **Botón "← VOLVER"** → Regresa a pantalla inicio
- **Botón "¡LARGUEMOS!"** → Inicia nueva partida con configuración seleccionada

### 3. PANTALLA JUEGO
- **Área Clickeable Izquierda (invisible)** → Suma 1 punto a Jugador 1
- **Área Clickeable Derecha (invisible)** → Suma 1 punto a Jugador 2
- **Botón "−" (izquierda)** → Resta 1 punto a Jugador 1
- **Botón "−" (derecha)** → Resta 1 punto a Jugador 2
- **Botón "FALTA ENVIDO"** → Abre modal de falta envido
- **Botón "MENÚ PRINCIPAL"** → Regresa a pantalla inicio
- **Botón "VER HISTORIAL"** → Va a pantalla historial (solo visible si hay movimientos)

### 4. PANTALLA HISTORIAL
- **Botón "← VOLVER"** → Regresa a pantalla juego
- **Gesture Swipe Derecha** → Regresa a pantalla juego

### 5. MODAL VICTORIA
- **Botón "✕"** → Resta 1 punto al ganador y cierra modal
- **Botón "OTRA VUELTA"** → Reinicia partida con mismos jugadores
- **Botón "MENÚ PRINCIPAL"** → Va a pantalla inicio

### 6. MODAL FALTA ENVIDO
- **Botón "{Nombre Jugador 1} (+X puntos)"** → Suma X puntos a Jugador 1
- **Botón "{Nombre Jugador 2} (+X puntos)"** → Suma X puntos a Jugador 2
- **Botón "CANCELAR"** → Cierra modal sin cambios

---

## 🔧 FUNCIONALIDADES CORE

### SISTEMA DE PUNTOS
```csharp
// Variables principales
int puntosJugador1 = 0;
int puntosJugador2 = 0;
int puntosTotales = 30; // 16, 24 o 30
string nombreJugador1 = "Nosotros";
string nombreJugador2 = "Ellos";
```

### FUNCIONES PRINCIPALES

#### 1. **SumarPunto(jugador)**
```csharp
void SumarPunto(string jugador) {
    if (jugador == "jugador1" && puntosJugador1 < puntosTotales) {
        puntosJugador1++;
        AgregarAlHistorial(nombreJugador1, "sumó", puntosJugador1, puntosJugador2);
        VerificarVictoria();
        GuardarPartida();
    }
    // Similar para jugador2
}
```

#### 2. **RestarPunto(jugador)**
```csharp
void RestarPunto(string jugador) {
    if (jugador == "jugador1" && puntosJugador1 > 0) {
        puntosJugador1--;
        AgregarAlHistorial(nombreJugador1, "restó", puntosJugador1, puntosJugador2);
        GuardarPartida();
    }
    // Similar para jugador2
}
```

#### 3. **FaltaEnvido(jugador)**
```csharp
void FaltaEnvido(string jugador) {
    int puntosGanados;
    
    if (jugador == "jugador1") {
        puntosGanados = puntosTotales - puntosJugador2;
        puntosJugador1 += puntosGanados;
        AgregarAlHistorial(nombreJugador1, "falta envido", puntosJugador1, puntosJugador2);
    }
    // Similar para jugador2
    
    VerificarVictoria();
    GuardarPartida();
}
```

#### 4. **VerificarVictoria()**
```csharp
void VerificarVictoria() {
    if (puntosJugador1 >= puntosTotales) {
        MostrarModalVictoria("jugador1");
        BorrarPartidaGuardada();
    } else if (puntosJugador2 >= puntosTotales) {
        MostrarModalVictoria("jugador2");
        BorrarPartidaGuardada();
    }
}
```

#### 5. **NuevaPartida()**
```csharp
void NuevaPartida() {
    puntosJugador1 = 0;
    puntosJugador2 = 0;
    historial.Clear();
    BorrarPartidaGuardada();
}
```

---

## 💾 SISTEMA DE GUARDADO

### ESTRUCTURA DE DATOS A GUARDAR
```csharp
[Serializable]
public class PartidaGuardada {
    public int puntosJugador1;
    public int puntosJugador2;
    public string nombreJugador1;
    public string nombreJugador2;
    public int puntosTotales;
    public List<Movimiento> historial;
    public long timestamp; // Unix timestamp
}

[Serializable]
public class Movimiento {
    public string jugador;
    public string accion; // "sumó", "restó", "falta envido"
    public int puntosJugador1;
    public int puntosJugador2;
    public DateTime timestamp;
}
```

### FUNCIONES DE GUARDADO

#### **GuardarPartida()**
```csharp
void GuardarPartida() {
    if (hayGanador) return; // No guardar si terminó
    
    PartidaGuardada partida = new PartidaGuardada {
        puntosJugador1 = puntosJugador1,
        puntosJugador2 = puntosJugador2,
        nombreJugador1 = nombreJugador1,
        nombreJugador2 = nombreJugador2,
        puntosTotales = puntosTotales,
        historial = historial,
        timestamp = DateTimeOffset.Now.ToUnixTimeSeconds()
    };
    
    string json = JsonUtility.ToJson(partida);
    PlayerPrefs.SetString("partidaGuardada", json);
    PlayerPrefs.Save();
}
```

#### **CargarPartida()**
```csharp
PartidaGuardada CargarPartida() {
    if (!PlayerPrefs.HasKey("partidaGuardada")) return null;
    
    string json = PlayerPrefs.GetString("partidaGuardada");
    PartidaGuardada partida = JsonUtility.FromJson<PartidaGuardada>(json);
    
    // Verificar si tiene menos de 24 horas
    long ahora = DateTimeOffset.Now.ToUnixTimeSeconds();
    if (ahora - partida.timestamp > 86400) { // 24 horas en segundos
        BorrarPartidaGuardada();
        return null;
    }
    
    return partida;
}
```

#### **HayPartidaGuardada()**
```csharp
bool HayPartidaGuardada() {
    if (!PlayerPrefs.HasKey("partidaGuardada")) return false;
    PartidaGuardada partida = CargarPartida();
    return partida != null;
}
```

---

## 🎯 SISTEMA DE RAYITAS (VISUAL)

### CÁLCULO DE RAYITAS
```csharp
public class Rayitas {
    public int cantidadBuenas; // Primera mitad
    public int cantidadMalas;  // Segunda mitad
    public bool alVerde;       // Si está a 1 punto de ganar
}

Rayitas CalcularRayitas(int puntos, int puntosTotales) {
    Rayitas r = new Rayitas();
    int mitad = puntosTotales / 2;
    
    r.cantidadBuenas = Mathf.Min(puntos, mitad);
    r.cantidadMalas = Mathf.Max(0, puntos - mitad);
    r.alVerde = (puntos == puntosTotales - 1);
    
    return r;
}
```

### REPRESENTACIÓN VISUAL
```csharp
string GenerarVisualRayitas(int cantidad) {
    string visual = "";
    int cuadraditos = cantidad / 5;
    int rayitasSueltas = cantidad % 5;
    
    // Agregar cuadraditos (5 rayitas cada uno)
    for (int i = 0; i < cuadraditos; i++) {
        visual += "▢ ";
    }
    
    // Agregar rayitas sueltas
    for (int i = 0; i < rayitasSueltas; i++) {
        visual += "| ";
    }
    
    return visual;
}
```

---

## 📊 HISTORIAL DE MOVIMIENTOS

### AGREGAR AL HISTORIAL
```csharp
void AgregarAlHistorial(string jugador, string accion, int puntosJ1, int puntosJ2) {
    Movimiento mov = new Movimiento {
        jugador = jugador,
        accion = accion,
        puntosJugador1 = puntosJ1,
        puntosJugador2 = puntosJ2,
        timestamp = DateTime.Now
    };
    
    historial.Add(mov);
}
```

### FORMATO DE DISPLAY
```csharp
string FormatearMovimiento(Movimiento mov) {
    string tiempo = CalcularTiempoRelativo(mov.timestamp);
    return $"{mov.jugador} {mov.accion} - {nombreJugador1}: {mov.puntosJugador1} | {nombreJugador2}: {mov.puntosJugador2} - {tiempo}";
}

string CalcularTiempoRelativo(DateTime timestamp) {
    TimeSpan diferencia = DateTime.Now - timestamp;
    
    if (diferencia.TotalSeconds < 60) return "hace momentos";
    if (diferencia.TotalMinutes < 60) return $"hace {(int)diferencia.TotalMinutes} min";
    if (diferencia.TotalHours < 24) return $"hace {(int)diferencia.TotalHours} h";
    return timestamp.ToString("dd/MM HH:mm");
}
```

---

## 🎮 FLUJO DE JUEGO COMPLETO

### INICIO DE PARTIDA NUEVA
1. Usuario ingresa nombres (o deja defaults)
2. Selecciona puntos totales (16/24/30)
3. Click en "¡LARGUEMOS!"
4. Inicializar variables a 0
5. Mostrar pantalla de juego

### CONTINUAR PARTIDA
1. Verificar si existe partida guardada
2. Cargar todos los datos
3. Ir directo a pantalla de juego

### DURANTE EL JUEGO
1. **Sumar punto**: Click en área de rayitas
2. **Restar punto**: Click en botón "−"
3. **Falta envido**: 
   - Calcular puntos = puntosTotales - puntosContrario
   - Mostrar modal con opciones
   - Sumar puntos al elegido
4. **Victoria**:
   - Se activa al llegar a puntosTotales
   - Mostrar modal con opciones
   - Borrar partida guardada

### CÁLCULO FALTA ENVIDO
```csharp
// Ejemplo: Juegan a 30
// Jugador1 tiene 20, Jugador2 tiene 22

// Si Jugador1 canta falta:
int puntosParaJugador1 = puntosTotales - puntosJugador2; // 30 - 22 = 8

// Si Jugador2 canta falta:
int puntosParaJugador2 = puntosTotales - puntosJugador1; // 30 - 20 = 10
```

---

## 🔄 ESTADOS Y VALIDACIONES

### VALIDACIONES IMPORTANTES
1. **Nombres**: No pueden estar vacíos, máximo 15 caracteres
2. **Puntos**: No pueden ser negativos ni exceder puntosTotales
3. **Botones deshabilitados**: Cuando hay ganador
4. **Historial visible**: Solo si hay al menos 1 movimiento
5. **Continuar visible**: Solo si hay partida < 24 horas

### ESTADOS GLOBALES
```csharp
public enum Pantalla {
    Inicio,
    Configuracion,
    Juego,
    Historial
}

public class GameManager {
    public Pantalla pantallaActual;
    public bool mostrarModalVictoria;
    public bool mostrarModalFalta;
    public string ganador; // null, "jugador1", "jugador2"
}
```

---

## 📱 CONSIDERACIONES PARA UNITY

### UI ELEMENTS NECESARIOS
1. **Canvas principal** con múltiples paneles (uno por pantalla)
2. **InputField** para nombres de jugadores
3. **Toggle Group** para selección de puntos
4. **Buttons** con eventos OnClick configurados
5. **Text/TextMeshPro** para mostrar puntos y rayitas
6. **ScrollView** para historial
7. **Paneles Modal** con background oscuro semi-transparente

### SCRIPTS PRINCIPALES
1. **GameManager.cs** - Control general del juego
2. **ScoreManager.cs** - Manejo de puntos y rayitas
3. **SaveManager.cs** - Guardado/carga de partidas
4. **UIManager.cs** - Control de pantallas y modales
5. **HistoryManager.cs** - Manejo del historial

### EVENTOS Y DELEGATES
```csharp
public delegate void OnScoreChanged(int j1, int j2);
public delegate void OnGameWon(string winner);
public delegate void OnScreenChanged(Pantalla screen);
```

---

Esta documentación se enfoca específicamente en las funcionalidades y botones necesarios para implementar el juego en Unity, con ejemplos de código y estructura clara de datos.