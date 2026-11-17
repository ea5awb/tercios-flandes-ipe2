# Los Tercios del Emprendimiento — IPE2

Guía de estudio interactiva del módulo IPE2 (Emprendimiento e iniciativa emprendedora) con **dos pieles intercambiables**:

- 🏰 **app.html** — estética de los *Tercios viejos de Flandes* (pergamino, cruz de Borgoña, carmesí y oro).
- 🖥️ **vscode.html** — ed. *Visual Studio Code*: tema oscuro, barra lateral de archivos, pestañas y barra inferior azul.

Ambas comparten los mismos datos y motores: 84 preguntas, 34 parejas y 29 frases de las UD 3, 4 y 5.

## Cómo usarla

1. Pulsa el botón verde **Code → Download ZIP** y descomprime la carpeta.
2. Abre **`app.html`** (Tercios) o **`vscode.html`** (VS Code) con doble clic en cualquier navegador (funciona sin internet).
3. Elige bandera/tema: **UD 3 · El emprendimiento**, **UD 4 · El cliente y la idea**, **UD 5 · El entorno y la competencia**, o **toda la campaña**.
4. Elige modalidad:

| Modalidad | Qué hace |
|---|---|
| **Cuestionario** | Adelante/atrás, respuesta bloqueada, verde/rojo con refuerzo didáctico, temporizador, nota sobre 10 con % de acertadas y falladas. >91 % de aciertos → confeti y fanfarria; <65 % → calavera riéndose. |
| **Enlazar conceptos** | 34 parejas concepto-definición unidas con flechas (verde/rojo). |
| **Completar frase** | 29 frases con hueco de palabra clave, con corrección y refuerzo. |
| **Tema de repaso** | Los tres temarios con chuletas, tablas, resumen del resumen y glosario de siglas. |

En cada partida **se barajan** preguntas y respuestas. Sonidos integrados: aplauso al acertar y trompeta de fracaso al fallar (síntesis de audio, sin archivos externos).

## Archivos

- Interfaces: `app.html`, `vscode.html` + sus temas `estilos.css` y `estilos-vscode.css`.
- Datos: `datos-ud3.js`, `datos-ud4.js`, `datos-ud5.js`, `repaso.js` (temarios).
- Motor: `motor.js` (temporizador, sonidos, confeti, calavera y los tres modos).

⚠️ Todos los archivos deben ir juntos en la misma carpeta.

## Sonidos propios (opcional)

Crea una carpeta `sonidos/` con `acierto.mp3`, `fallo.mp3` o `fanfarria.mp3`: se usan al abrir cualquiera de las dos interfaces.

## Configuración

Abre `motor.js` y busca el bloque `PARAMETROS`: tiempo por pregunta/pareja/frase, umbral del confeti (91 %) y de la calavera (65 %), y rutas de sonidos.