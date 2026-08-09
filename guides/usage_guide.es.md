---
title: "Guía de uso"
description: "Aprende a usar MineSkin PRO: el potente editor y visor de skins de Minecraft"
---

## Descripción general

MineSkin PRO es un editor y visor de skins de Minecraft con vista 3D en tiempo real. Funciona por completo en tu dispositivo: en el navegador o como app de iOS y Android. Pinta píxel a píxel directamente sobre el modelo 3D, guarda una biblioteca de skins, toma colores de imágenes de referencia y exporta un PNG listo para Minecraft.

---

## Primeros pasos

### Usuarios nuevos

En la app de iOS y Android, un breve proceso de bienvenida te recibe la primera vez que la abres para que elijas tu idioma y tus preferencias de cookies. En la web no hay proceso de bienvenida: solo un aviso de cookies.

En cualquier caso, la primera vez que entres en el modo **Editor**, un tutorial interactivo te enseñará lo básico. Puedes volver a verlo cuando quieras desde **Configuración → Ayuda → Reiniciar tutorial**.

### Inicio rápido

1. Abre la **Biblioteca** desde la barra inferior y crea una skin: parte de una plantilla, sube un PNG o impórtala desde un nombre de usuario de Minecraft.
2. Elige un color y luego elige un pincel en el botón **Pinceles** de la barra de herramientas izquierda.
3. Pinta directamente sobre el modelo 3D.
4. Tu trabajo se guarda solo en la biblioteca. Para obtener el PNG, abre la **Biblioteca** y pulsa **Descargar** en la skin.

---

## Modos

Cambia de modo con el selector de la barra inferior.

### Modo Editor

- Todas las herramientas de dibujo, los pinceles y las imágenes de referencia
- Vista previa 3D en tiempo real mientras pintas
- Deshacer/rehacer, cuadrícula y simetría

### Modo Vista previa

- Mira tu skin en 3D sin herramientas de edición
- Reproduce animaciones y haz que la cabeza siga al cursor
- Haz capturas de pantalla y graba clips para compartir

---

## Tu biblioteca de skins

Abre la **Biblioteca** desde la barra inferior. Ahí están todas las skins que has creado, con la activa marcada.

### Crear una skin

**Biblioteca → Nueva skin** te ofrece:

- **Plantillas:** Vacía, Steve (brazos clásicos), Alex (brazos delgados)
- **Importar de Minecraft:** escribe un nombre de usuario de Minecraft para traer la skin actual de ese jugador
- **Subir archivo:** arrastra y suelta un PNG, o búscalo en tu dispositivo

Se aceptan PNG de **64×64**, **64×32** (formato antiguo) o **128×128**.

### Gestionar tus skins

Cada skin de la biblioteca se puede:

- **Renombrar**: el nombre también se usa para los archivos exportados
- **Descargar**: guarda un PNG listo para subir a Minecraft
- **Eliminar**: si borras la última skin, te quedará una nueva vacía

### Dónde se guardan las skins

Las skins se guardan **localmente en tu dispositivo**, y cada cambio se guarda automáticamente mientras pintas, así que tu trabajo sobrevive a una recarga. Como el almacenamiento es local, si borras los datos del navegador o de la app, desaparecerán. Descarga todo lo que no quieras perder.

---

## Pinceles

El botón **Pinceles** de la barra de herramientas izquierda muestra el pincel que estás usando. Púlsalo para abrir el panel de pinceles: un panel lateral en escritorio y una hoja inferior en dispositivos táctiles.

- **Herramienta lápiz** (`P`): pinta un solo píxel por clic o trazo
- **Pintura masiva** (`U`): rellena una cara entera o un disco de píxeles
- **Sombreado** (`V`): oscurece o aclara lo que ya hay para dar profundidad
- **Tramado** (`D`): pinta un damero al 50 % con tu color sobre lo que hay debajo
- **Borrador** (`E`): deja los píxeles transparentes de nuevo

### Opciones de pincel

Cada pincel muestra sus propias opciones en el panel:

- **Pintura masiva → Radio:** con `0` rellena la cara entera sobre la que hiciste clic; de `1` a `8` rellena un disco de esos píxeles alrededor del punto. Con un radio mayor que 0 también puedes elegir la forma **Cuadrado** o **Círculo**.
- **Sombreado → Intensidad:** de `1` a `6`, la fuerza de cada paso de sombreado.
- **Borrador → Tamaño:** de `0` a `8`, indicado como el diámetro resultante en píxeles.

El lápiz, el sombreado y el tramado siempre afectan a un solo píxel, así que no tienen control de tamaño.

### Simetría

La **Simetría** (`M`) refleja cada trazo en el otro lado del modelo: pinta el brazo izquierdo y el derecho lo sigue. Actívala desde el panel de pinceles. Mientras está activa, aparece un botón de acceso directo en la barra de herramientas para desactivarla sin abrir el panel.

---

## Color

### Selector de color

La muestra de color de la parte superior de la barra de herramientas izquierda abre el selector completo:

- Elige en el área de saturación/luminosidad y en el control deslizante de tono
- Escribe un **código hex** exacto
- Ajusta la **Opacidad**
- Cambia a la pestaña **Paleta** para reutilizar colores que ya están en tu skin

> La opacidad solo se aplica a la **capa de armadura (superpuesta)**. La capa del cuerpo se renderiza opaca en el juego, así que lo que pintes ahí siempre será totalmente opaco.

### Cuentagotas (`I`)

Pulsa el botón del cuentagotas y luego haz clic en cualquier píxel del modelo 3D para usar su color como color de pintura.

---

## Imágenes de referencia

Pulsa `R` o el botón **Imágenes de referencia** para abrir el panel de referencia, acoplado junto al lienzo en el modo Editor.

- Añade hasta **12** imágenes
- Arrastra sobre una imagen para apuntar y suelta para tomar ese color como color de pintura
- **Acercar**, **Alejar** y **Restablecer zoom** para trabajar con detalles finos
- La fila **Colores de esta imagen** muestra los colores dominantes de la imagen como muestras
- Elimina las imágenes que ya no necesites

---

## Partes del cuerpo y capas

Cada skin tiene dos capas:

- **Cuerpo**: la textura base de la skin
- **Armadura**: la capa superpuesta (sombreros, chaquetas, mangas, pantalones)

Oculta las partes con las que no estés trabajando para llegar a superficies que de otro modo quedan tapadas; por ejemplo, oculta la capa de armadura para pintar la cabeza que hay debajo.

- **Escritorio:** el panel de partes está en la esquina superior derecha del lienzo
- **Táctil:** toca el botón **Filtro de partes** de la barra de herramientas para abrirlo como diálogo

Puedes alternar cada parte por separado (cabeza, torso, brazos, piernas) o una capa entera de una vez.

---

## Cámara y vista

### Control de rotación

El control de la esquina superior derecha indica hacia dónde mira la cámara. Arrástralo para orbitar alrededor del modelo.

### Ratón y táctil

- **Arrastrar:** orbita la cámara
- **Desplazar / pellizcar:** acerca y aleja

La cámara sigue moviéndose un poco al soltar, y cuánto lo hace depende del ajuste de amortiguación.

### Mirar al cursor

En el modo Vista previa en escritorio, **Mirar al cursor** hace que la cabeza del modelo siga tu puntero por la pantalla.

### Configuración de cámara

En **Configuración → Preferencias → Cámara**:

- **Campo de visión**: la amplitud de la perspectiva
- **Velocidad de movimiento**: de `0` a `0.5`, la rapidez con la que responde la cámara
- **Amortiguación**: de `0` a `1`, lo rápido que se detiene el movimiento

> Dato curioso: pon la amortiguación a 0 y la cámara girará sin parar para siempre.

---

## Cuadrícula

El botón **Cuadrícula** de la barra de herramientas (modo Editor) superpone guías de píxeles sobre el modelo, lo que ayuda con la alineación y la simetría.

---

## Animaciones

En el modo Vista previa, el botón **Animaciones** reproduce el modelo en bucle:

- Inactiva
- Caminando
- Corriendo
- Volando
- Saludo
- Agachado
- Golpe

Elige **Sin animación** para devolver el modelo a su pose de reposo.

---

## Capturas y clips

Ambas opciones están en la barra de herramientas del modo Vista previa.

### Captura de pantalla

Captura un PNG cuadrado de 1080×1080 del modelo, con una pequeña marca de MineSkin. Primero ves una vista previa y luego eliges si guardarla o compartirla.

### Grabar clip

Graba un vídeo vertical corto (9:16) de tu skin girando, marca incluida. Mientras se procesa aparece una barra de progreso y puedes cancelar en cualquier momento. Al terminar, previsualiza el clip y compártelo o descárgalo.

---

## Configuración

Abre el panel de **Configuración** con el icono de engranaje de la barra de herramientas. Tiene tres pestañas.

### Acciones

- **Modo delgado**: cambia entre el modelo clásico (brazos de 4 px) y el delgado o «Alex» (brazos de 3 px). Esto modifica la textura de la skin, así que se te pedirá confirmación.
- **Doble resolución (128×128)**: duplica la resolución de la textura. También modifica la textura. Ten en cuenta que **Minecraft (Java Edition) no soporta skins de 128×128**.
- **Invertir frente y espalda**: intercambia la parte delantera y trasera de cada parte del cuerpo, para que la skin mire hacia el otro lado.

### Preferencias

**Pintura** (modo Editor)

- **Intensidad del sombreado**: de `1` a `6`

**Skin**

- **Brillo de superficie**: de `0` a `1`, la iluminación difusa del modelo
- **Brillo/Lustre**: de `0` a `1`, los reflejos especulares
- **Mover izquierda/derecha**, **Mover adelante/atrás**, **Mover arriba/abajo**: de `-100` a `100`
- **Inclinar arriba/abajo**, **Girar izquierda/derecha**, **Ladear**: rotación completa en cada eje

> Los tres controles de posición se bloquean mientras hay un entorno 3D activo, porque es el entorno el que coloca el modelo por ti.

**Cámara**: Campo de visión, Velocidad de movimiento y Amortiguación (ver la sección Cámara y vista)

**Luz**

- **Luz principal**: de `0` a `1`, la fuerza de la luz direccional
- **Luz izquierda/derecha**, **Luz arriba/abajo**, **Luz adelante/atrás**: de `-10` a `10`
- **Brillo general (Luz ambiental)**: de `0` a `1`, la iluminación base uniforme

**Entorno**: cambia de fondo:

- **Cuadrícula**: la cuadrícula de referencia por defecto
- **Vacío**: un degradado liso
- **Pradera de día**: una escena 3D al aire libre
- **Arena**: una escena de interior estilizada

**Idioma**: inglés, árabe, chino, español y portugués (Brasil)

**Apariencia**: tema Sistema, Claro u Oscuro

### Ayuda

- Reiniciar el tutorial interactivo
- Informar de un problema (puedes adjuntar una captura de pantalla; no hace falta cuenta)
- Enlaces a esta guía, al registro de cambios, al servidor de Discord y al repositorio de GitHub
- Enlaces a las apps de iOS y Android

---

## Historial

- **Deshacer:** `Ctrl+Z` (Windows/Linux) o `⌘+Z` (Mac)
- **Rehacer:** `Ctrl+Shift+Z` / `Ctrl+Y`, o `⌘+Shift+Z` (Mac)
- Tienes botones para ambas acciones en la barra de herramientas izquierda

> El historial de deshacer **no** se conserva al recargar la página. Tu skin sí se guarda, pero los pasos que te llevaron hasta ahí se borran.

---

## Atajos de teclado

### Herramientas

- `P`: Herramienta lápiz
- `U`: Pintura masiva
- `V`: Sombreado
- `D`: Tramado
- `E`: Borrador
- `I`: Cuentagotas
- `M`: Activar o desactivar la simetría
- `R`: Abrir o cerrar el panel de referencia

### Historial

- `Ctrl/⌘ + Z`: Deshacer
- `Ctrl/⌘ + Shift + Z` o `Ctrl + Y`: Rehacer

> Los atajos de una sola letra se ignoran mientras escribes en un campo de texto, así que escribir un código hex o renombrar una skin no te cambiará de herramienta.

---

## Táctil y móvil

El editor funciona por completo con pantallas táctiles:

- Arrastra para orbitar y pellizca para hacer zoom
- El panel de pinceles se abre como hoja inferior: la fila de herramientas siempre queda visible y la flecha despliega la paleta de colores, la simetría y los ajustes del pincel activo
- El filtro de partes se abre como diálogo completo

### Modo Dibujar vs. Modo Ver

En dispositivos táctiles y en el modo Editor, un solo dedo puede pintar o mover la cámara, pero no las dos cosas. El botón **Modo Dibujar / Modo Ver** de la barra de herramientas alterna entre ambos:

- **Modo Dibujar**: un dedo pinta; con dos dedos sigues pudiendo pellizcar para hacer zoom
- **Modo Ver**: un dedo orbita la cámara

---

## Apps

MineSkin PRO también está disponible como app nativa en la **App Store** y en **Google Play**, y como aplicación web instalable (PWA) con soporte sin conexión. El editor es el mismo en todas ellas.

---

## Consejos y buenas prácticas

1. **Oculta capas para llegar a lo que hay debajo**: la capa de armadura tapa la del cuerpo allí donde es visible.
2. **Usa la cuadrícula** cuando alinees detalles o quieras que ambos lados del modelo coincidan.
3. **La simetría te ahorra la mitad del trabajo** en todo lo que se refleja: mangas, piernas, caras.
4. **Trama sobre los rellenos planos** para dar una textura que no parezca pintada encima.
5. **Una referencia vale más que adivinar**: mete una imagen y toma los colores directamente de ella.
6. **Descarga tu skin cuando alcances un buen punto.** Las skins se guardan localmente y el historial de deshacer no sobrevive a una recarga.
7. **Revisa tu skin con distintas iluminaciones** antes de exportarla: los ajustes de luz te mostrarán costuras que una luz plana esconde.

---

## Soporte y comunidad

### Informar de problemas

¿Has encontrado un error? Usa **Configuración → Ayuda → Informar de un problema**, o abre una incidencia en el [repositorio de GitHub](https://github.com/hamza512b/mineskin/issues).

### Únete a la comunidad

Conecta con otros creadores de skins en el [servidor de Discord](https://discord.gg/2egvhmqdza).

---

Hecho con ❤️ por [Hamza](https://hamza.se)
