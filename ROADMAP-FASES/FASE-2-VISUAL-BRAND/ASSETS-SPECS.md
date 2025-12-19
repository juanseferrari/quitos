# 🎨 ASSET SPECIFICATIONS & REQUIREMENTS

## 📱 APP ICON SPECIFICATIONS

### iOS Requirements
```
AppIcon.appiconset/
├── Icon-App-20x20@1x.png        (20x20)
├── Icon-App-20x20@2x.png        (40x40)
├── Icon-App-20x20@3x.png        (60x60)
├── Icon-App-29x29@1x.png        (29x29)
├── Icon-App-29x29@2x.png        (58x58)
├── Icon-App-29x29@3x.png        (87x87)
├── Icon-App-40x40@1x.png        (40x40)
├── Icon-App-40x40@2x.png        (80x80)
├── Icon-App-40x40@3x.png        (120x120)
├── Icon-App-60x60@2x.png        (120x120)
├── Icon-App-60x60@3x.png        (180x180)
├── Icon-App-76x76@1x.png        (76x76)
├── Icon-App-76x76@2x.png        (152x152)
├── Icon-App-83.5x83.5@2x.png    (167x167)
└── Icon-App-1024x1024@1x.png    (1024x1024)
```

### Android Requirements
```
mipmap-ldpi/     (36x36)   - 120dpi
mipmap-mdpi/     (48x48)   - 160dpi
mipmap-hdpi/     (72x72)   - 240dpi
mipmap-xhdpi/    (96x96)   - 320dpi
mipmap-xxhdpi/   (144x144) - 480dpi
mipmap-xxxhdpi/  (192x192) - 640dpi

Google Play Store: 512x512 (required)
```

### Design Guidelines
```
Style: Cinematográfico, premium, dorado
Elements: Corona/trono, cartas de truco, elementos dorados
Colors: Gradiente dorado (#D4A574 → #C59660)
Background: Negro profundo o transparente
Typography: Evitar texto pequeño (legibilidad)
Contrast: Alto contraste para visibilidad
```

---

## 🎭 LOGO SPECIFICATIONS

### Master Logo
```
Formato principal: SVG (escalable)
Formato fallback: PNG (alta resolución)
Orientaciones: Horizontal, Vertical, Square
Contextos: Light background, Dark background, Transparent
```

### Logo Variants
```
logo-horizontal.svg     - Texto al lado del símbolo
logo-vertical.svg       - Texto debajo del símbolo
logo-square.svg         - Formato cuadrado compacto
logo-icon.svg           - Solo símbolo (sin texto)
logo-wordmark.svg       - Solo texto tipográfico
```

### Usage Specifications
```
Minimum Size: 24px (digital), 0.5" (print)
Clear Space: 1x height del logo en todos los lados
Color Variants: Full color, Single color, White, Black
File Formats: SVG, PNG, PDF (print)
```

---

## 🎬 SPLASH SCREEN ASSETS

### iOS Splash Screens
```
LaunchImage-iPhone-Portrait.png     (1334x750)   - iPhone 8
LaunchImage-iPhone-Landscape.png    (2208x1242)  - iPhone 8 Plus
LaunchImage-iPhoneX-Portrait.png    (2436x1125)  - iPhone X/XS
LaunchImage-iPhoneXR-Portrait.png   (1792x828)   - iPhone XR
LaunchImage-iPhoneXSMax-Portrait.png (2688x1242) - iPhone XS Max
LaunchImage-iPhone12-Portrait.png   (2532x1170)  - iPhone 12/12 Pro
LaunchImage-iPhone12Max-Portrait.png (2778x1284) - iPhone 12 Pro Max
LaunchImage-iPad-Portrait.png       (2048x1536)  - iPad
LaunchImage-iPad-Landscape.png      (2732x2048)  - iPad Pro
```

### Android Splash Screens
```
splash-ldpi.png     (320x240)
splash-mdpi.png     (480x320)
splash-hdpi.png     (720x480)
splash-xhdpi.png    (960x640)
splash-xxhdpi.png   (1440x960)
splash-xxxhdpi.png  (1920x1280)
```

### Design Requirements
```
Content: Logo centrado + tagline opcional
Background: Gradiente cinematográfico oscuro
Animation: Fade-in suave del logo
Duration: 2-3 segundos máximo
Branding: Consistente con app icon
```

---

## ✨ ANIMATION ASSETS

### Lottie Animations
```
victory-celebration.json    - Animación de victoria
loading-spinner.json        - Loading elegante
point-scored.json           - Efecto al anotar punto
achievement-unlock.json     - Desbloqueo de logro
screen-transition.json      - Transiciones entre pantallas
```

### Particle Effects
```
golden-sparkles.json        - Chispas doradas
confetti-burst.json         - Explosión de confetti
floating-particles.json     - Partículas flotantes
crown-glow.json            - Brillo de corona
```

### Animation Specifications
```
Format: Lottie JSON (After Effects export)
Duration: 0.5-3 segundos
Frame Rate: 60fps
Size: <50KB por animación
Quality: Smooth, premium feel
```

---

## 🎨 ICON LIBRARY

### Tab Bar Icons
```
tab-home.svg          - 🏠 Inicio
tab-play.svg          - 🎮 Anotador  
tab-achievements.svg  - 🏆 Logros
tab-stats.svg         - 📊 Estadísticas
tab-social.svg        - 👥 Social
tab-profile.svg       - 👤 Perfil
```

### Action Icons
```
action-add.svg        - Sumar punto
action-subtract.svg   - Restar punto
action-falta.svg      - Falta envido
action-history.svg    - Ver historial
action-settings.svg   - Configuración
action-share.svg      - Compartir
```

### Decorative Icons
```
crown.svg             - Corona real
throne.svg            - Trono
cards.svg             - Cartas de truco
trophy.svg            - Trofeo
star.svg              - Estrella
```

### Icon Design Guidelines
```
Style: Outline + fill variants
Stroke: 2px weight
Size: 24x24px base (scalable)
Colors: Dorado principal, blanco secundario
Format: SVG optimizado
Grid: 24px grid system
```

---

## 🎨 COLOR PALETTE EXPANSION

### Primary Palette
```css
--rey-gold-bright:    #FFD700;  /* Highlights, accents */
--rey-gold-main:      #D4A574;  /* Primary actions */
--rey-gold-medium:    #C59660;  /* Secondary elements */
--rey-gold-dark:      #B8864A;  /* Borders, dividers */
--rey-gold-darker:    #A67C3E;  /* Pressed states */
```

### Neutral Palette
```css
--rey-bone-light:     #F5DEB3;  /* Text on dark */
--rey-bone-main:      #E6D5AA;  /* Secondary text */
--rey-bone-medium:    #D7C6A1;  /* Disabled text */
--rey-bone-dark:      #C8B798;  /* Borders */
```

### Dark Palette
```css
--rey-black-soft:     #1a1a1a;  /* Cards, modals */
--rey-black-main:     #0a0a0a;  /* Main background */
--rey-black-pure:     #000000;  /* Deep shadows */
```

### Semantic Colors
```css
--rey-success:        #22c55e;  /* Success states */
--rey-warning:        #f59e0b;  /* Warning states */
--rey-error:          #ef4444;  /* Error states */
--rey-info:           #3b82f6;  /* Info states */
```

---

## 📐 TYPOGRAPHY ASSETS

### Font Files Required
```
fonts/
├── TiltWarp-Regular.woff2       - Títulos principales
├── CinzelDecorative-Bold.woff2  - Headers decorativos
├── FrederickaTheGreat.woff2     - Elementos especiales
├── Rye-Regular.woff2            - Logotipo, branding
├── Oswald-Medium.woff2          - UI text, buttons
├── PlayfairDisplay-Bold.woff2   - Elegant headers
└── Inter-Regular.woff2          - Body text, readable
```

### Typography Scale
```css
/* Design tokens for typography */
--font-display: 'Tilt Warp', cursive;
--font-decorative: 'Cinzel Decorative', serif;
--font-special: 'Fredericka the Great', cursive;
--font-brand: 'Rye', cursive;
--font-ui: 'Oswald', sans-serif;
--font-elegant: 'Playfair Display', serif;
--font-body: 'Inter', sans-serif;
```

---

## 🖼️ BACKGROUND ASSETS

### Textures & Patterns
```
texture-wood.jpg          - Fondo de madera (sutil)
pattern-victorian.svg     - Patrón victoriano (overlay)
texture-leather.jpg       - Textura de cuero (premium)
pattern-ornamental.svg    - Elementos ornamentales
```

### Gradients
```css
/* Predefined gradient patterns */
--gradient-primary: linear-gradient(135deg, #D4A574, #C59660);
--gradient-dark: linear-gradient(180deg, #1a1a1a, #0a0a0a);
--gradient-gold: radial-gradient(circle, #FFD700, #D4A574);
--gradient-victory: linear-gradient(45deg, #FFD700, #D4A574, #FFD700);
```

---

## 📊 ASSET OPTIMIZATION

### Image Optimization
```bash
# PNG optimization
pngquant --quality=80-90 *.png

# JPEG optimization  
jpegoptim --max=85 *.jpg

# SVG optimization
svgo --multipass *.svg

# WebP conversion
cwebp -q 85 *.png *.jpg
```

### Performance Targets
```
App Icon: <50KB total bundle
Logo: <10KB per variant
Animations: <50KB per Lottie file
Images: <100KB per background
Total Assets: <500KB additional bundle size
```

---

## 🎯 DELIVERY CHECKLIST

### Asset Delivery
- [ ] **All icon sizes generated** (iOS + Android + Web)
- [ ] **Logo variants complete** (horizontal, vertical, icon-only)
- [ ] **Splash screens created** (all device sizes)
- [ ] **Animation files optimized** (Lottie JSON)
- [ ] **Color palette documented** (CSS variables)
- [ ] **Typography files included** (WOFF2 format)
- [ ] **Background assets optimized** (textures, patterns)

### Quality Assurance
- [ ] **High-DPI testing** (retina displays)
- [ ] **Performance testing** (bundle size impact)
- [ ] **Cross-platform testing** (iOS, Android, Web)
- [ ] **Accessibility testing** (contrast ratios)
- [ ] **Animation performance** (60fps verification)

### Documentation
- [ ] **Asset usage guide** (when to use what)
- [ ] **Color guide** (accessibility compliant)
- [ ] **Typography guide** (hierarchy and usage)
- [ ] **Animation guide** (implementation examples)
- [ ] **Brand guidelines** (do's and don'ts)