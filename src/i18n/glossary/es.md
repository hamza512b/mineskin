# MineSkin Translation Glossary — Spanish (Spain) (es)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `es` strings. Every concept maps to one canonical Spanish (Spain) term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG`. Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin.

**Keyboard key names stay verbatim in Latin** (`Ctrl`, `Z`, `Y`, …) — as rendered inside the `{{shortcuts}}` hints. Never localize them (no "Mayús", no "Control"), even though Spanish keyboards print translated legends.

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

### Posing

| English | es | Notes |
|---|---|---|
| **Pose** <br><sub>The noun: the character's arm/leg/head orientation (toolbar.resetPose)</sub> | pose | Direct cognate, feminine (la pose). Standard in ES 3D/animation UI; do not use "postura" (reads as body posture/health) or "posición" (that is a coordinate, not an articulated arrangement). Full label: "Restablecer pose", using the canonical Reset verb "Restablecer". |
| **Pose (verb)** <br><sub>Changing a limb's orientation, whichever gizmo does it (toolbar.poseMode)</sub> | posar <br>*(cambiar la pose)* | The mode label is imperative-ish "Posar extremidades". Since the rework the hints describe the concrete gesture instead (see **Select a limb**), so the verb survives mainly in that label; in any running prose prefer the periphrasis "cambiar su pose", which avoids the gender-agreement clash of "posarlo/posarla" over a mixed list (brazo / pierna / cabeza) and dodges the everyday reading of transitive "posar" = "to set down". Never "posicionar". |
| **Pose mode** <br><sub>Toolbar toggle enabling limb dragging (key: poseMode)</sub> | Posar extremidades <br>*(Modo pose)* | Deliberately verb-first, not "Modo …": unlike touchDrawMode / touchViewMode (mutually exclusive touch modes, hence "Modo Dibujar" / "Modo Ver"), this is a single toggle whose value is the action itself. "Modo pose" is the fallback if the toolbar rail ever needs a shorter string. |
| **Limb** <br><sub>An arm, a leg or the head as a draggable articulated part</sub> | extremidad | Standard anatomical/animation term, feminine (una extremidad). Keep it as the umbrella word; the individual parts keep their existing canonical names (Brazo izquierdo, Pierna derecha, Cabeza). Do not use "miembro" (ambiguous: member/user) or "articulación" (that is the joint, not the limb). |
| **Double-click** <br><sub>Mouse gesture in poseModeHint</sub> | doble clic | RAE-sanctioned spelling: two words, no hyphen, no "k". Imperative form "haz doble clic", matching the existing "haz clic" in tutorial.partFilterMobileContent and importDialog.dropzoneText. |
| **Handle** <br><sub>The small widget you click (mouse) or tap (touch) on a limb to SELECT it; selecting is what makes that limb's gizmo appear. Not itself a drag target for posing (all four pose hints)</sub> | controlador | Since the rework there is no single shape to name — the handle only selects, and the shape you then drag depends on the tool (**Axis arrow** under Move, **Twist ring** under Twist) — so here, and only here, the widget-class word is right. "Controlador" is the plainest ES option and it never collides with **anillo** or **flecha**, which stay reserved for the two gizmos. Avoid "asa"/"tirador" (door/drawer handles), "manejador" (false friend from programming), "manija", and the bare anglicism "handle". Locate it as "el controlador de una extremidad"; the mouse hints do not need the word at all ("Haz clic en una extremidad…"), because a mouse click lands anywhere on the limb. |
| **Select a limb** <br><sub>The first half of every posing gesture since the rework: you click the limb / tap its handle, its gizmo appears, and only then do you drag (all four pose hints)</sub> | haz clic en una extremidad <br>*(toca el controlador de una extremidad)* | Two steps in one sentence, joined with "y" and "para", never as two clipped commands: "Haz clic en una extremidad para ver sus flechas de eje y arrastra una flecha para…". The "para ver…" purpose clause is load-bearing — it tells the user that clicking alone changes nothing visible except the gizmo, which is the whole point of the rework. Do not use "selecciona" ("Seleccionar" is the color-picker verb, see **Pick a color**) and do not compress to "Arrastra una extremidad" — dragging the limb itself no longer poses anything. |
| **Joint** <br><sub>The pivot the limb turns about — shoulder, hip, neck; marked by the dot at the stem's other end</sub> | articulación | Standard anatomical term, feminine (la articulación), and already flagged in the **Limb** row as the thing an "extremidad" is NOT. The pair must stay lexically distinct in one sentence ("…para apuntarla; la articulación no se mueve"): the limb is what moves, the joint is what stays. Do not use "pivote" (mechanical/abstract), "junta" (a seal or a gasket) or "unión". |
| **Aim (verb)** <br><sub>RETIRED from the pose hints. Was: dragging a ring so the limb's end followed the pointer. The rework removed the free-aim ring — a limb's end now only slides along one **Axis arrow** at a time — so no pose string uses this verb any more</sub> | apuntar | Still canonical, but ONLY in the reference-image picker (reference.pickFromImage), where "apuntar" means aiming the eyedropper before release. Do not reintroduce it into the posing strings: nothing there follows the pointer freely, so "apuntar" would now promise a gesture the tool does not have. See **Move the whole skin (verb)** / **Axis** for how a limb's motion is worded instead. |
| **Swing (verb)** <br><sub>RETIRED. Was: dragging a limb's own body to rotate it freely. Dragging the limb itself no longer poses anything — every gesture starts by selecting it and then drags a gizmo</sub> | — | Kept only so the phrasing is not resurrected. "Arrastra una extremidad para cambiar su pose" is now factually wrong and must not appear in any hint; see **Select a limb** for the correct two-step wording. "Balancear" is likewise no longer needed for any label. |
| **Move (tool)** <br><sub>Tile label of the first of the two mutually exclusive tools in the posing panel (toolbar.poseMove); select a limb, then drag one of its three **Axis arrows** to slide that end along one axis, or drag the **Center handle** to travel the whole skin. One-line label under an icon in a ~120px tile</sub> | Mover | The literal "Mover": the rework deleted the free-aim gesture that justified the old "Apuntar", and every gesture left in this tool is a translation — a limb end sliding on one axis, or the whole skin travelling — which is exactly what the tool's own hint says ("…para mover su punta en ese eje", "El controlador del centro del modelo mueve toda la skin"). Do not use "Posar" (that is the whole feature, toolbar.poseMode = "Posar extremidades"; a sub-tool repeating it reads as a duplicate), and never "Posicionar"/"Colocar"/"Desplazar". |
| **Twist (tool/verb)** <br><sub>The second tool and its gesture: select a limb, then drag one of the three **Twist rings** around its joint to turn the limb about that axis (toolbar.poseTwist, poseTwistHint, poseTwistHintTouch)</sub> | Girar <br>*(girar sobre ese eje)* | Everyday ES rotation verb, one word, fits the ~120px tile, and it pairs with **Mover** as a clean minimal contrast: mover slides a limb's end, girar turns the limb where it is. In the hints always spell out which axis — "girarla sobre ese eje" (rotation ABOUT an axis takes "sobre"; the **Axis** row's "en ese eje" is for sliding ALONG one) — because there are three rings and the sentence must say that each one turns the limb differently. Note the axis gloss changed with the rework: the old "sobre su propio eje" described a single roll gesture and is now wrong. Not "Torcer" (implies deforming or spraining the limb), not "Rotar" (correct but CAD/technical register, and this file's voice is plain), never "Enroscar" or the anglicism "Twist". |
| **Double-tap** <br><sub>Touch gesture that resets one limb (poseModeHintTouch); the touch counterpart of Double-click</sub> | toca dos veces | Built on the canonical Tap = "toca" (see **Tap vs. Click**), so the touch and mouse hints stay visibly parallel while never being confused: "toca dos veces" (touch) vs "haz doble clic" (mouse). Verb phrase in the imperative, not the noun "doble toque", and never "doble toca" or the calque "doble tap". |
| **Axis** <br><sub>One of the three directions a limb's end can be dragged along (poseModeHint, poseModeHintTouch)</sub> | eje | Standard 3D term, masculine (el eje, los ejes). Movement along one is expressed with "en": "mover su punta en ese eje" — the idiom ES 3D users read ("mover en el eje X"); "a lo largo de ese eje" is correct but too long for the tooltip. Do not use "dirección" (loses the fixed-axis meaning) or "coordenada". |
| **Axis arrow** <br><sub>The **Move** tool's gizmo: three straight arrows, one per axis, that appear at a limb's free end once the limb is selected; dragging one slides that end along that axis alone (poseModeHint, poseModeHintTouch)</sub> | flecha de eje <br>*(flechas de eje)* | Name the shape plus its job: the user sees arrows, so "sus flechas de eje" is findable at a glance in a ~208px tooltip. MUST stay lexically distinct from **Twist ring** = anillo — the two gizmos are what the two tools respectively show for the same selected limb, and they do different things (arrow = slide the end along one axis; ring = turn the limb about one axis), so never call an arrow an "anillo", never call a ring a "flecha", and never merge them under "manipulador" (the widget-class word "controlador" is reserved for the **Handle**, which is neither). Avoid "eje de arrastre", "manipulador de ejes" (CAD jargon), "gizmo" (untranslated anglicism) and "flecha direccional" (reads as a D-pad). |
| **Twist ring** <br><sub>The **Twist** tool's gizmo: three rings around a limb's joint, one per axis, that appear once the limb is selected; dragging one turns the limb about that axis (poseTwistHint, poseTwistHintTouch)</sub> | anillo de giro <br>*(anillos de giro)* | Same naming principle as **Axis arrow** — shape ("anillo") plus job ("de giro"), built on the canonical **Twist** verb "girar" so the gizmo and the gesture share a stem: "sus anillos de giro … arrastra un anillo para girarla sobre ese eje". Once introduced, the second mention drops to bare "un anillo"; the tooltip is ~208px and the context is unambiguous. Do not say "anillo de rotación" ("Rotar" is banned as CAD register, see **Twist**), "aro"/"círculo" ("Círculo" is a brush shape, toolbar.circle), or "órbita". |
| **Center handle** <br><sub>The gizmo sitting at the model's center of mass, attached to no body part; dragging it carries the entire figure — translating it through the scene with **Move** and turning it on the spot with **Twist** (all four pose hints)</sub> | el controlador del centro del modelo (Move) <br>el anillo del centro del modelo (Twist) | Follow the source, which names the shape the user actually drags in each tool: under **Move** it is the generic **Handle**, so "el controlador del centro del modelo"; under **Twist** it is visibly a ring, so "el anillo del centro del modelo". Both keep the same locator "del centro del modelo", so the two hints still read as one feature. "Modelo" is already the file's word for the 3D figure (tutorial.touchDrawModeContent), and anchoring the ring to the model rather than to a body part is the whole point: this handle belongs to no limb and to no torso. Deliberately NOT "el anillo del pecho" (the previous wording, now wrong: the ring no longer sits on the chest and no longer leans the figure from the waist), and never "el anillo del torso" / "el anillo del cuerpo" — "Torso" (partFilter.torso) and "Cuerpo" (partFilter.body) both name selectable body parts, so either would read as "the ring that poses the torso part". Bare "el anillo central" is also out: "central" reads as "main/primary ring" as readily as "the middle one", while "del centro" is unambiguously positional. Do not repeat "de la punta de una extremidad" here (this ring sits at no limb tip). |
| **Move the whole skin (verb)** <br><sub>What the center handle does under the **Move** tool: a translation — the whole figure travels through the scene, no rotation (poseModeHint, poseModeHintTouch)</sub> | mover | Plain "mover" is right precisely because the gesture is a pure translation: "El controlador del centro del modelo mueve toda la skin." The **Pan** row claims "mover" for dragging a reference image; that does not conflict here — the reference panel and the posing gizmo never share a sentence. The same verb also carries the limb gesture ("mover su punta en ese eje", see **Axis**), which is deliberate: both are slides, not rotations. Not "desplazar" (reads as scrolling a list), not "trasladar" (physics/CAD register), never "posicionar". |
| **Turn the whole skin (verb)** <br><sub>What the center handle does under the **Twist** tool: the whole figure spins on the spot, staying where it is (poseTwistHint, poseTwistHintTouch)</sub> | girar | The canonical **Twist** verb applied to the figure instead of a limb: "gira toda la skin". No axis gloss is needed here (unlike "girarla sobre su propio eje" for a limb) — there is only one way a whole figure turns on the spot, so the ambiguity the **Twist** row guards against cannot arise. Not "rotar" (CAD register), not "voltear" (reads as flipping it over). |
| **The whole skin** <br><sub>What the center handle carries: head, arms, legs and torso all travelling together, as opposed to one limb (all four pose hints)</sub> | toda la skin | Follows the source, which now says "the whole skin", and it is the better ES phrase too: "skin" is the canonical loanword (feminine — *toda la* skin) and it sidesteps the trap in "el cuerpo", which is the part-filter label for the torso (partFilter.body = "Cuerpo"). "Toda" stays load-bearing: it tells the user the head, the arms and the legs come along. Do not fall back to "todo el cuerpo" (the previous wording), and avoid "toda la figura" / "el muñeco" (register clash) or "el personaje" (vaguer about what physically moves). |
| **Model position** <br><sub>Where the whole figure sits in the scene and which way it faces — the move/turn the center handle drives, as opposed to the joint angles that make up a pose (toolbar.resetPosition)</sub> | posición del modelo | This is the one place "posición" is the RIGHT word: the **Pose** row bans it for the articulated arrangement precisely because it means a placement in space, which is exactly what this key resets. Full label: "Restablecer posición del modelo", keeping the canonical Reset verb "Restablecer". The qualifier "del modelo" is load-bearing and must not be trimmed — the button sits directly under "Restablecer pose" in the pose panel, and bare "Restablecer posición" would leave two near-identical labels ("pose" / "posición") that the user has to parse letter by letter; "del modelo" says at a glance that this one moves the whole figure. Reuses "modelo" from **Center handle** ("el anillo del centro del modelo"), so the button and the hint name the same thing. Never "Restablecer postura" (that is a pose), never "Reiniciar" (Reset ≠ Restart) and never "Posición inicial". |
| **Recenter** <br><sub>Double-clicking / double-tapping the center handle under **Move**: the whole skin returns to the scene origin (poseModeHint, poseModeHintTouch)</sub> | volver a centrar | Periphrasis with "volver a" — ES has no one-word equivalent, and the calque "recentrar" is not established (RAE has no such verb; "recentralizar" is political). The object is the skin, so the clitic is feminine: "haz doble clic en él para volver a centrarla" / "tócalo dos veces para volver a centrarla" — "él" is the anillo, "-la" is la skin. Not "centrar de nuevo" (heavier in a ~208px tooltip), not "restablecer su posición" inside the hints (leave that phrasing to the **Model position** button so the two read as label vs. gesture). |
| **Face forward again** <br><sub>Double-clicking / double-tapping the center handle under **Twist**: the whole skin's turn goes back to zero, facing the camera (poseTwistHint, poseTwistHintTouch)</sub> | volver a mirar al frente | Subject is the skin, so the clause is subjunctive-free and impersonal-light: "…para que vuelva a mirar al frente". "Mirar al frente" is the everyday ES phrase for a figure facing forward and it stays clear of "Mirar al cursor" (toolbar.lookAtCursor), which is a camera toggle, not a reset. "Volver a" mirrors the **Recenter** row so the two tools' hints stay parallel. Not "de frente" (reads as a viewing angle), not "orientación original"/"hacia delante" (vaguer), never "resetear su rotación". |
| **Collision** <br><sub>Limbs always stop where they meet another body part — stated as behaviour, not a toggle. Not currently spelled out in any pose hint; kept here for tutorial/help copy and in case the hints regain it</sub> | detenerse al chocar con <br>*(chocar)* | Full sentence form: "Las extremidades se detienen al chocar con otra parte del cuerpo." Pronominal "se detienen" makes it plainly automatic, so no user reads it as a setting they must switch on. "Chocar con" is the everyday ES verb for two solids meeting; avoid the calque "colisionar"/"colisión" (technical, physics-engine register), "se paran" (reads as stopping an animation), "se bloquean" (suggests a locked/disabled limb) and the literal "se detienen donde encuentran otra parte del cuerpo". Keep "parte del cuerpo" as the generic wording — do not substitute "extremidad", since the obstacle can be the torso or the head. |

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
| **Reference image** <br><sub>A single imported image (toolbar.reference, reference.add/pickFromImage)</sub> | Imagen de referencia <br>*(referencia)* | Full form for labels and the toolbar button ("Imágenes de referencia"). Short "referencia" is fine once context is established (reference.remove = "Eliminar referencia"). Never "imagen de consulta". |
| **Pick a color** <br><sub>Sampling a color off a reference image (eyedropper-style)</sub> | Tomar un color | Use the verb "tomar" for sampling a color from an image, to keep it distinct from "Seleccionar" (choosing from the picker/palette) and from "Selector de color" (the picker tool). Ex.: "suelta para tomar un color", "Añade una imagen de la que tomar colores". |
| **Add** <br><sub>Adding a reference image</sub> | Añadir | Spain-Spanish canonical for adding an item (matches saveImage.instruction "Añadir a Fotos"). Note feedback.addScreenshotButtonLabel still says "Agregar" — legacy drift; prefer "Añadir" for new strings. |
| **Remove** <br><sub>Removing a reference image</sub> | Eliminar | Same verb already used for feedback.removeScreenshotButtonLabel ("Eliminar captura de pantalla") and library.deleteSkin. Keep distinct from "Descartar" (Discard). |
| **Zoom** <br><sub>The noun, when a label needs it (reference.resetZoom)</sub> | zoom | Loanword already used in the file (tutorial.touchDrawModeContent: "hacen zoom en el modelo"). Keep "zoom", not the RAE-preferred "zum" and not "ampliación" — "zoom" is what ES users read on image controls. |
| **Zoom in / Zoom out** <br><sub>The + / − buttons over a reference image (reference.zoomIn / zoomOut)</sub> | Acercar / Alejar | Standard Spain-Spanish button verbs for image zoom controls (same pair Apple/Fotos uses). One word each — these are tiny icon buttons. Do NOT use "Ampliar/Reducir" (reads as resizing the image itself) or "Aumentar/Disminuir zoom" (too long). |
| **Reset zoom** <br><sub>Reset button over a reference image (reference.resetZoom)</sub> | Restablecer zoom | Uses the canonical Reset verb "Restablecer" (see Actions) + the "zoom" loanword. Not "Reiniciar" — Reset ≠ Restart. |
| **Zoomed in** <br><sub>State of the reference image once it is larger than fit size (reference.pickFromImageZoomed)</sub> | con zoom | Keep the "zoom" loanword rather than the participle "ampliada"/"acercada": "Imagen de referencia con zoom." The verbs "Acercar/Alejar" stay reserved for the +/− buttons, so the state label does not reuse them. |
| **Pan** <br><sub>Dragging a zoomed-in reference image to move which part of it is visible (reference.pickFromImageZoomed, reference.panHintTouch/panHintMouse)</sub> | mover <br>*(mover la imagen)* | Plain "mover" is the canonical verb for panning the image itself: "Arrastra para mover", "Arrastra para mover la imagen". Do NOT use "desplazar" (reads as scrolling a list), "encuadrar", or the anglicism "hacer panorámica". Keep distinct from "apuntar" (aiming the picker before release, reference.pickFromImage) and from "Velocidad de movimiento" (the 3D camera). |
| **Drag** <br><sub>Press-and-move gesture (reference.pickFromImage, reference.panHint*, importDialog.dropzoneText)</sub> | Arrastra | Informal-imperative "Arrastra", already used by reference.pickFromImage and importDialog.dropzoneText ("Arrastra y suelta"). Never "Arrastre" (usted) or the noun "Arrastre". |
| **Tap vs. Click** <br><sub>Touch-input hint vs. mouse-input hint — the UI ships both variants of the same pill (reference.panHintTouch / reference.panHintMouse)</sub> | toca (Tap) / clic (Click) | The two must stay distinguishable because the app picks between them by input device. Tap = "toca" (matches common.modeSwitchHintBody and colorPicker.tapToConfirm). Click = "haz clic" in full prose (importDialog.dropzoneText, tutorial.partFilterMobileContent); inside the ~10px pan-hint pill the compact nominal "clic para…" is the accepted short form — do not expand it there, and do not use "pulsa"/"pincha". |
| **Pan hint pill** <br><sub>Transient hint shown after zooming in (reference.panHintTouch / panHintMouse); ~10px text, max 70% of a 260–520px panel</sub> | Arrastra para mover · toca/clic para tomar color | Keep both halves parallel and keep the `·` middle dot (natural in ES). Keep the object "color" so "tomar" is not left dangling, but drop everything else — no articles, no "la imagen" in the pill (that fuller wording belongs to the aria-label). |
| **Take a photo** <br><sub>Shooting a new photo with the device camera to use as a reference (native.cameraUsageDescription)</sub> | Hacer una foto <br>*(Sacar una foto)* | Spain-Spanish canonical: "hacer una foto", never the LatAm "tomar una foto" — "tomar" stays reserved for sampling a color (see **Pick a color**). Noun is "foto", not "fotografía" (too formal for this register). |
| **Photo** <br><sub>An image shot with the camera, as opposed to an imported file</sub> | foto | Lowercase mid-sentence; feminine (la foto). Distinct from "imagen" (any reference image, imported or shot) — use "imagen" for the generic reference-panel wording. |

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

### Open source & GitHub

| English | es | Notes |
|---|---|---|
| **Open source** <br><sub>home.openSourceHeading</sub> | de código abierto | Standard ES term ("MineSkin es de código abierto"). Do not translate as "fuente abierta" or leave "open source" in English. |
| **Star** <br><sub>Verb/button that stars the GitHub repo (home.githubStar)</sub> | Destacar | This is GitHub's own Spanish UI wording for the Star button, so it is what ES-speaking developers actually see. Not "Estrella" (the noun) and not "Marcar como favorito". |
| **Stargazers** <br><sub>Accessible label on the star-count link (home.githubStargazers)</sub> | Usuarios que lo han destacado | Never leave "Stargazers" in English and never coin "Destacadores". Full string: "Usuarios que lo han destacado en GitHub". Keeps the canonical "destacar" verb. |
| **A star** <br><sub>The star itself, in running prose (home.openSourceDescription)</sub> | una estrella | In prose the noun stays "estrella" — the star icon is universally read that way by the ES dev community — while the button keeps GitHub's verb "Destacar". Both forms are intentional; do not merge them. |
| **Copy** <br><sub>Tiny button next to the contact email (home.copyEmail)</sub> | Copiar | Canonical clipboard verb. Keep the infinitive, sentence case. |
| **Copied** <br><sub>Confirmation state of that same button (home.copiedEmail)</sub> | Copiado | Bare participle, no exclamation marks — the button is tiny and the state is transient. |
| **Email address** <br><sub>aria-label "Copy email address" (home.copyEmailLabel)</sub> | dirección de correo | Spain-Spanish: "correo" (not "email"/"e-mail", not Latin-American "correo electrónico" in full when space is tight). Full string: "Copiar dirección de correo". |

### Animation

| English | es | Notes |
|---|---|---|
| **Idle animation** | Animación inactiva <br>*(Animación en reposo)* | Current toolbar.idleAnimation = "Animación inactiva". Matches; "en reposo" is a slightly more natural alt for an idle character pose. |
| **Walking animation** | Animación caminando <br>*(Animación al caminar)* | Current toolbar.walkingAnimation = "Animación caminando". Matches; "Animación al caminar" reads slightly better but keep current for consistency. |
| **No Animation** | Sin animación | Current toolbar.noAnimation = "Sin Animación". Content matches; sentence-case. |

### Camera

| English | es | Notes |
|---|---|---|
| **Camera (device)** <br><sub>The physical device camera, in the OS permission prompt (native.cameraUsageDescription)</sub> | cámara | Feminine (la cámara). Only the hardware camera used to shoot a reference photo — everything else in this table is the 3D viewport camera. Keep permission copy platform-neutral: never name iOS/Android, never repeat the app name (the OS supplies it in the prompt title). |
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
| **Changelog** | Registro de cambios | Current changelog.title = "Registro de cambios". Matches; viewChangelog ("Ver registro de cambios") and pageDescription consistent. |
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
