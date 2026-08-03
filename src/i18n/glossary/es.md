# MineSkin Translation Glossary — Spanish (Spain) (es)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `es` strings. Every concept maps to one canonical Spanish (Spain) term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG`. Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin.

**Interpolation placeholders — never translate, reorder, or respell** (replaced at runtime in `src/i18n/DictionaryContext.tsx`):

| Placeholder | Meaning |
|---|---|
| `{{link}}` | An inline link element (GitHub repo, Discord, usage guide, policy, author, etc.) |
| `{{shortcuts}}` | Keyboard shortcut hint (e.g. Ctrl+Z / Ctrl+Y) |
| `{{language}}` | A language name, injected into the language-detection prompt |
| `{{date}}` | The promo end date |
| `{{count}}` | A number (e.g. the maximum reference images allowed) |

Never change `languageSwitcher.*` endonyms. Keep files at key parity with `en.json` and valid 2-space JSON.

## Voice & register

Second person: informal singular "tú" throughout (never "usted", never "vosotros" — the app addresses one user). This matches the current file ("tu skin", "puedes", "arrastra y suelta"). Tone: friendly, concise, encouraging — short imperative verbs on buttons ("Guardar", "Subir", "Descartar"), warm confirmations ("¡Todo listo!", "¡Feliz edición de skins!"). Capitalization: Spanish uses sentence case, NOT English title case — capitalize only the first word and proper nouns. The current file is inconsistent here: many labels are over-capitalized ("Vista Previa", "Brazo Izquierdo", "Luz Principal", "Campo de Visión"). Recommended canonical forms below use sentence case; when auditing, treat the lowercase-second-word form as correct and flag the Title-Cased variants. Punctuation: always use opening marks ¿ ¡ ("¿Estás seguro?"). Use « » or " " for quotes (current saveImage mixes « » and " "); standardize on « ». Ellipsis as single glyph … (current "Grabando…" is correct). Brand/product names stay verbatim and are never gendered or translated: MineSkin, MineSkin PRO, PRO, Minecraft, Java Edition, iOS, Android, App Store, Google Play, GitHub, Discord, PNG. "skin" is a loanword treated as feminine (la skin, las skins, "Nueva Skin"). Never translate interpolation placeholders {{link}}, {{shortcuts}}, {{language}}, {{date}}, and keep a space between the surrounding text and the placeholder.

## Canonical terms

`*(italic)*` = acceptable alternative.

### Modes

| English | es | Notes |
|---|---|---|
| **Editor** <br><sub>Pixel-drawing mode</sub> | Editor | Current common.editor = "Editor". Matches. Keep verbatim (same word in ES). |
| **Preview** <br><sub>View-only 3D mode; also "Previewer"</sub> | Vista previa <br>*(Previsualización)* | Current common.preview = "Vista Previa" (over-capitalized). For the 'Previewer' variant the file is inconsistent: metadata uses "Visor", home heroTitle2 uses "Previsualizador". Standardize Previewer → "Visor"; mode label → "Vista previa". |
| **Editing** <br><sub>State label while editing</sub> | Editando | Current common.editing = "Editando". Matches. |
| **Draw Mode** <br><sub>Touch mode where gestures paint</sub> | Modo Dibujar <br>*(Modo dibujo)* | Current toolbar.touchDrawMode = "Modo Dibujar". Matches; keep consistent with tutorial text which also uses "Modo Dibujar". |
| **View Mode** <br><sub>Touch mode where gestures rotate/zoom</sub> | Modo Ver <br>*(Modo vista)* | Current toolbar.touchViewMode = "Modo Ver". Matches. |

### Domain

| English | es | Notes |
|---|---|---|
| **Skin** <br><sub>The Minecraft character texture</sub> | skin | Loanword the ES Minecraft community uses; feminine (la skin). Current file mixes "Skin"/"skin" appropriately (proper-noun-y labels capitalized, mid-sentence lowercase). Never translate to "piel". |
| **Body** <br><sub>Base texture layer (partFilter.baseLayer; screen-reader label of the base-layer grid in Visibility Settings)</sub> | Cuerpo | Canonical label for the base layer. It directly identifies the character's underlying body. |
| **Body (short)** <br><sub>Compact display-only column label (partFilter.baseLayerShort, above the ~74px body grid in Visibility Settings)</sub> | Cuerpo | Uses the same clear label as the screen-reader text. |
| **Armor** <br><sub>Overlay layer, clothing/accessories (partFilter.overlayLayer; screen-reader label of the overlay grid in Visibility Settings)</sub> | Armadura | Canonical label for the outer layer, matching Minecraft's armor terminology. |
| **Armor (short)** <br><sub>Compact display-only column label (partFilter.overlayLayerShort, above the ~74px armor grid in Visibility Settings)</sub> | Armadura | Uses the same clear label as the screen-reader text. |
| **Slim mode** <br><sub>Slim (3px) arm model, aka Alex</sub> | Modo delgado <br>*(Modo Slim)* | Current detailPanel.slimMode = "Modo delgado". Matches; "delgado" is the term the official Minecraft launcher uses for the Alex/slim arm model. Keep it. |
| **Resolution** <br><sub>Texture resolution 64x64 / 128x128</sub> | Resolución | Current uses "resolución" (changeResolution, doubleResolution). Matches. |
| **Java Edition** <br><sub>Minecraft: Java Edition (product name)</sub> | Java Edition | Product name — keep verbatim. Current doubleResWarning correctly keeps "Minecraft (Java Edition)". |
| **Template** <br><sub>Starter skin template</sub> | Plantilla | Current library.templates = "Plantillas", importDialog.templateFailed uses "plantilla". Matches. |

### Body (base)

| English | es | Notes |
|---|---|---|
| **Head** <br><sub>Base head part</sub> | Cabeza | Current partFilter.head = "Cabeza". Matches. |
| **Body** <br><sub>Torso; source uses both "Body" and "Torso"</sub> | Cuerpo | Current partFilter.body = "Cuerpo". Matches. Note the source also has a separate "Torso" key — keep the two distinct (Cuerpo vs Torso). |
| **Torso** <br><sub>Torso (partFilter.torso)</sub> | Torso | Current partFilter.torso = "Torso". Matches; keep distinct from "Cuerpo". |
| **Left Arm** | Brazo izquierdo | Current partFilter.leftArm = "Brazo Izquierdo". Content matches; sentence-case the adjective. |
| **Right Arm** | Brazo derecho | Current partFilter.rightArm = "Brazo Derecho". Content matches; sentence-case. |
| **Left Leg** | Pierna izquierda | Current partFilter.leftLeg = "Pierna Izquierda". Content matches; sentence-case. |
| **Right Leg** | Pierna derecha | Current partFilter.rightLeg = "Pierna Derecha". Content matches; sentence-case. |

### Body (overlay)

| English | es | Notes |
|---|---|---|
| **Helmet** <br><sub>Head overlay</sub> | Casco | Current partFilter.helmet = "Casco". Matches (head overlay). |
| **Jacket** <br><sub>Body overlay</sub> | Chaqueta | Current partFilter.jacket = "Chaqueta". Matches (body overlay). |
| **Left Sleeve** <br><sub>Left arm overlay</sub> | Manga izquierda | Current partFilter.leftSleeve = "Manga Izquierda". Content matches; sentence-case. |
| **Right Sleeve** <br><sub>Right arm overlay</sub> | Manga derecha | Current partFilter.rightSleeve = "Manga Derecha". Content matches; sentence-case. |
| **Left Pants** <br><sub>Left leg overlay</sub> | Pantalón izquierdo | Current partFilter.leftPants = "Pantalón Izquierdo". Content matches; sentence-case. Singular "pantalón" per leg is correct for the overlay. |
| **Right Pants** <br><sub>Right leg overlay</sub> | Pantalón derecho | Current partFilter.rightPants = "Pantalón Derecho". Content matches; sentence-case. |

### Tools

| English | es | Notes |
|---|---|---|
| **Color picker** <br><sub>Tool to pick a color</sub> | Selector de color | Current toolbar.colorPicker = "Selector de color". Matches; colorPicker.colorPickerTab uses "Selector de Color" (capital C) — align to lowercase. |
| **Pen tool** <br><sub>Primary per-pixel draw tool</sub> | Herramienta lápiz <br>*(Lápiz)* | Current toolbar.penTool = "Herramienta lápiz". Matches. In tight button space, just "Lápiz" is fine (tutorial refers to "la herramienta Lápiz"). |
| **Bulk paint** <br><sub>Fill/flood paint tool</sub> | Pintura masiva <br>*(Relleno)* | Current toolbar.bulkPaint = "Pintura masiva". Matches. Since it is a fill/flood tool, "Relleno" is a clearer alt if space allows. |
| **Eraser** <br><sub>Erase pixels</sub> | Borrador | Current toolbar.eraser = "Borrador". Matches. |
| **Shading** <br><sub>Variation/shading tool (key: variation)</sub> | Sombreado | INCONSISTENCY: toolbar.variation = "Sombreado" (good), but detailPanel.variationToolIntensity = "Intensidad de Herramienta de Variación" uses "Variación" for the same tool. Standardize on "Sombreado" → "Intensidad del sombreado". |
| **Dither** <br><sub>Dither brush</sub> | Tramado | Current toolbar.dither = "Tramado". Matches; brushIntroBody also uses "tramado". Consistent. |
| **Symmetry** <br><sub>Mirror painting</sub> | Simetría | Current toolbar.symmetry = "Simetría", disableSymmetry = "Desactivar simetría". Matches. |
| **Brush** <br><sub>Brush / Brushes</sub> | Pincel | Current toolbar.brush = "Pincel", brushes = "Pinceles". Matches. |
| **Grid** <br><sub>Pixel grid overlay (also an environment name)</sub> | Cuadrícula | Both the pixel-grid tool (toolbar.grid) and the environment (detailPanel.environmentGrid) are "Cuadrícula" in the current file — correct for a UI grid overlay. Consistent. |
| **Look at Cursor** <br><sub>Camera-follow-cursor toggle</sub> | Mirar al cursor | Current toolbar.lookAtCursor = "Mirar al Cursor". Content matches; sentence-case "cursor". |

### Brush params

| English | es | Notes |
|---|---|---|
| **Opacity** | Opacidad | Current toolbar.opacity / colorPicker.opacity = "Opacidad". Matches. |
| **Intensity** | Intensidad | Current toolbar.intensity = "Intensidad". Matches. |
| **Radius** | Radio | Current toolbar.radius = "Radio". Matches. |
| **Size** | Tamaño | Current toolbar.size = "Tamaño". Matches. |
| **Shape** | Forma | Current toolbar.shape = "Forma". Matches. |
| **Square** | Cuadrado | Current toolbar.square = "Cuadrado". Matches (brush shape). |
| **Circle** | Círculo | Current toolbar.circle = "Círculo". Matches. |

### Color

| English | es | Notes |
|---|---|---|
| **Palette** <br><sub>Saved/used colors</sub> | Paleta | Current colorPicker.paletteTab = "Paleta". Matches. |
| **Hue** | Tono <br>*(Matiz)* | Current colorPicker.hue = "Tono". Matches; "Matiz" is a valid alt but keep "Tono" for consistency. |
| **Saturation** | Saturación | Current colorPicker.saturation = "Saturación". Matches. |
| **Lightness** | Luminosidad | Current colorPicker.lightness = "Luminosidad". Matches; keep distinct from "Valor" (HSV value). |
| **Value** <br><sub>HSV value component</sub> | Valor | HSV value component. Current saturationValueSelector = "Selector de saturación y valor" uses "Valor". Matches. Keep distinct from "Luminosidad" (HSL lightness). |
| **Hex Code** | Código hex | Current colorPicker.hexCode = "Código Hex", invalidHexCode = "Código hex inválido". Content matches; sentence-case "hex". Keep "hex" (community term). |

### Reference images

| English | es | Notes |
|---|---|---|
| **Reference** <br><sub>Panel title (reference.title) for the imported-images panel</sub> | Referencia | Short noun, sentence case. The panel/tool where users import photos or artwork to sample colors from. |
| **Reference image** <br><sub>A single imported image (toolbar.reference, reference.add/pickFromImage)</sub> | Imagen de referencia <br>*(referencia)* | Full form for labels and the toolbar button ("Imágenes de referencia"). Short "referencia" is fine once context is established (reference.remove = "Eliminar referencia", reference.allReferences = "Todas las referencias"). Never "imagen de consulta". |
| **Pick a color** <br><sub>Sampling a color off a reference image (eyedropper-style)</sub> | Tomar un color | Use the verb "tomar" for sampling a color from an image, to keep it distinct from "Seleccionar" (choosing from the picker/palette) and from "Selector de color" (the picker tool). Ex.: "suelta para tomar un color", "Añade una imagen de la que tomar colores". |
| **Add** <br><sub>Adding a reference image</sub> | Añadir | Spain-Spanish canonical for adding an item (matches saveImage.instruction "Añadir a Fotos"). Note feedback.addScreenshotButtonLabel still says "Agregar" — legacy drift; prefer "Añadir" for new strings. |
| **Remove** <br><sub>Removing a reference image</sub> | Eliminar | Same verb already used for feedback.removeScreenshotButtonLabel ("Eliminar captura de pantalla") and library.deleteSkin. Keep distinct from "Descartar" (Discard). |
| **Zoom** <br><sub>The noun, when a label needs it (reference.resetZoom)</sub> | zoom | Loanword already used in the file (tutorial.touchDrawModeContent: "hacen zoom en el modelo"). Keep "zoom", not the RAE-preferred "zum" and not "ampliación" — "zoom" is what ES users read on image controls. |
| **Zoom in / Zoom out** <br><sub>The + / − buttons over a reference image (reference.zoomIn / zoomOut)</sub> | Acercar / Alejar | Standard Spain-Spanish button verbs for image zoom controls (same pair Apple/Fotos uses). One word each — these are tiny icon buttons. Do NOT use "Ampliar/Reducir" (reads as resizing the image itself) or "Aumentar/Disminuir zoom" (too long). |
| **Reset zoom** <br><sub>Reset button over a reference image (reference.resetZoom)</sub> | Restablecer zoom | Uses the canonical Reset verb "Restablecer" (see Actions) + the "zoom" loanword. Not "Reiniciar" — Reset ≠ Restart. |

### Actions

| English | es | Notes |
|---|---|---|
| **Undo** | Deshacer | Current toolbar.undo = "Deshacer". Matches. |
| **Redo** | Rehacer | Current toolbar.redo = "Rehacer". Matches. |
| **Save** | Guardar | Current common.save = "Guardar". Matches. |
| **Cancel** | Cancelar | Current common.cancel = "Cancelar". Matches. |
| **Reset** | Restablecer | Current common.reset = "Restablecer". Matches. Keep distinct from "Reiniciar" (used for Restart tutorial) — Reset ≠ Restart. |
| **Upload** | Subir | Current common.upload = "Subir". Matches. |
| **Download** | Descargar | Current common/library use "Descargar". Matches. Note library.exportSkin is labeled "Descargar" because the EN source key is "Download" — that is correct; do not confuse with Export below. |
| **Import** | Importar | Current importDialog.import = "Importar". Matches. |
| **Export** <br><sub>Used for "export skin"</sub> | Exportar | Current saveImage.cannotExport* correctly uses "exportar". Note the library.exportSkin KEY renders as "Descargar" (its EN value is "Download", not "Export") — that is intentional, not an error. For any true export action use "Exportar". |
| **Screenshot** | Captura de pantalla <br>*(Captura)* | Current toolbar.screenshot / feedback = "Captura de pantalla". Matches. Use short "Captura" only where space is tight. |
| **Record clip** <br><sub>Record a shareable video</sub> | Grabar clip | Current toolbar.recordClip = "Grabar clip". Matches. |
| **Share** | Compartir | Current recorder.share = "Compartir vídeo", shareImage = "Compartir imagen". Base verb "Compartir" matches. |
| **Discard** | Descartar | Current recorder.discard = "Descartar". Matches. Keep distinct from "Eliminar" (Delete) and "Cancelar" (Cancel). |
| **Toggle** <br><sub>Show/hide toggles: partFilter.toggle*, toggleWholeLayer</sub> | Alternar | Established pattern: "Alternar cabeza", "Alternar casco", etc. New partFilter.toggleWholeLayer ("Toggle whole layer") follows it: "Alternar toda la capa". |
| **Toggle all (short)** <br><sub>Compact visible button label under each layer's part grid (partFilter.toggleWholeLayerShort); the full "Alternar toda la capa" stays as the screen-reader text</sub> | Alternar todo | Neuter "todo" (= everything in this layer's grid), not "toda": the button sits under a specific layer, so "capa" stays implicit and eliding it is natural. Keeps the canonical "Alternar" verb. |

### Animation

| English | es | Notes |
|---|---|---|
| **Idle animation** | Animación inactiva <br>*(Animación en reposo)* | Current toolbar.idleAnimation = "Animación inactiva". Matches; "en reposo" is a slightly more natural alt for an idle character pose. |
| **Walking animation** | Animación caminando <br>*(Animación al caminar)* | Current toolbar.walkingAnimation = "Animación caminando". Matches; "Animación al caminar" reads slightly better but keep current for consistency. |
| **No Animation** | Sin animación | Current toolbar.noAnimation = "Sin Animación". Content matches; sentence-case. |

### Camera

| English | es | Notes |
|---|---|---|
| **Field Of View** <br><sub>FOV</sub> | Campo de visión <br>*(Campo de visión (FOV))* | Current detailPanel.fieldOfView = "Campo de Visión". Content matches; sentence-case. Add (FOV) only if the community abbreviation is helpful in context. |
| **Movement Speed** | Velocidad de movimiento | Current detailPanel.movementSpeed = "Velocidad de Movimiento". Content matches; sentence-case. |
| **Damping** <br><sub>Camera inertia damping</sub> | Amortiguación <br>*(Inercia)* | Current detailPanel.damping = "Amortiguación". Matches. "Inercia" is a friendlier alt for camera damping but keep "Amortiguación". |

### Light

| English | es | Notes |
|---|---|---|
| **Main Light** <br><sub>Key/directional light</sub> | Luz principal | Current detailPanel.mainLight = "Luz Principal". Content matches; sentence-case. |
| **Ambient Light** <br><sub>Overall Brightness (Ambient Light)</sub> | Luz ambiental | Current appears only inside overallBrightness = "Brillo General (Luz Ambiental)". Term "Luz ambiental" is correct; sentence-case. |
| **Surface Brightness** | Brillo de superficie | Current detailPanel.surfaceBrightness = "Brillo de Superficie". Content matches; sentence-case. |
| **Shine/Glossiness** <br><sub>Specular</sub> | Brillo/Lustre <br>*(Brillo especular)* | FIX: current detailPanel.shineGlossiness = "Brillo/Glossiness" leaves "Glossiness" untranslated (English). Replace with "Brillo/Lustre"; since this drives the specular highlight, "Brillo especular" is the technically precise alt. |
| **Overall Brightness** | Brillo general | Current detailPanel.overallBrightness = "Brillo General (Luz Ambiental)". Content matches; sentence-case the label. |

### Environment

| English | es | Notes |
|---|---|---|
| **Environment** <br><sub>3D world/atmosphere</sub> | Entorno | Current detailPanel.environment = "Entorno". Matches. |
| **Grassland Day** <br><sub>Environment name</sub> | Pradera de día | Current detailPanel.environmentGrassland = "Pradera de Día". Content matches; sentence-case "día". |
| **Arena** <br><sub>Sci-fi arena environment (NOT "sand")</sub> | Arena <br>*(Coliseo)* | Current detailPanel.environmentScifi = "Arena". Correct and intentional: Spanish "arena" also means a combat/sports arena (the venue), which is exactly this sci-fi environment — it is NOT read as "sand" in this label context. "Coliseo" is a safe disambiguating alt if "sand" confusion is ever a concern. |
| **Empty** <br><sub>No environment</sub> | Vacío | Environment 'no world' — current detailPanel.environmentEmpty = "Vacío" (masculine, agrees with 'entorno'). Matches. Distinct from library.newEmpty = "Vacía" which agrees with 'skin' (feminine) — both are correct in their contexts. |

### Library

| English | es | Notes |
|---|---|---|
| **Library** <br><sub>Saved skins collection</sub> | Biblioteca | Current library.title = "Biblioteca". Matches. |
| **New Skin** | Nueva skin | Current library.newSkin/defaultName = "Nueva Skin". Content matches; sentence-case "skin" (feminine loanword). |
| **Templates** | Plantillas | Current library.templates = "Plantillas". Matches. |
| **Changelog** | Registro de cambios | Current changelog.title = "Registro de cambios". Matches; viewChangelog/closeChangelog consistent. |
| **Appearance** <br><sub>Label for the color-theme selector (System/Light/Dark)</sub> | Apariencia | theme.label = "Apariencia". Field label above the theme dropdown; sentence case, same register as languageSwitcher.language = "Idioma". |
| **Settings** | Configuración <br>*(Ajustes)* | Current common.settings = "Configuración". Minor inconsistency: onboarding.cookieDescription and tutorial say "en ajustes"/"en la configuración" interchangeably. Standardize the noun on "Configuración"; "ajustes" is acceptable in running prose but pick one for the panel label. |

## Consistency watch-list

Terms with known drift in the current file — keep these locked to the recommended form:

- **Preview** → `Vista previa`: Current common.preview = "Vista Previa" (over-capitalized). For the 'Previewer' variant the file is inconsistent: metadata uses "Visor", home heroTitle2 uses "Previsualizador". Standardize Previewer → "Visor"; mode label → "Vista previa".
- **Skin** → `skin`: Loanword the ES Minecraft community uses; feminine (la skin). Current file mixes "Skin"/"skin" appropriately (proper-noun-y labels capitalized, mid-sentence lowercase). Never translate to "piel".
- **Shading** → `Sombreado`: INCONSISTENCY: toolbar.variation = "Sombreado" (good), but detailPanel.variationToolIntensity = "Intensidad de Herramienta de Variación" uses "Variación" for the same tool. Standardize on "Sombreado" → "Intensidad del sombreado".
- **Shine/Glossiness** → `Brillo/Lustre`: FIX: current detailPanel.shineGlossiness = "Brillo/Glossiness" leaves "Glossiness" untranslated (English). Replace with "Brillo/Lustre"; since this drives the specular highlight, "Brillo especular" is the technically precise alt.
- **Settings** → `Configuración`: Current common.settings = "Configuración". Minor inconsistency: onboarding.cookieDescription and tutorial say "en ajustes"/"en la configuración" interchangeably. Standardize the noun on "Configuración"; "ajustes" is acceptable in running prose but pick one for the panel label.

---

_Generated from the terminology workflow (English canonical + native Spanish (Spain) localizer pass)._
