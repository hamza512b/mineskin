# MineSkin Translation Glossary — Brazilian Portuguese (pt-BR)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `pt-BR` strings. Every concept maps to one canonical Brazilian Portuguese term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG`. Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin. Keyboard key names (`Shift`, `Ctrl`, `Alt`, `Cmd`) also stay verbatim in Latin with their original capitalization — never translate them ("Shift", never "Maiúsc").

**Interpolation placeholders — never translate, reorder, or respell** (replaced at runtime in `src/i18n/DictionaryContext.tsx`):

| Placeholder | Meaning |
|---|---|
| `{{link}}` | An inline link element (GitHub repo, Discord, usage guide, policy, author, etc.) |
| `{{shortcuts}}` | Keyboard shortcut hint (e.g. Ctrl+Z / Ctrl+Y) |
| `{{language}}` | A language name, injected into the language-detection prompt |
| `{{date}}` | The promo end date |
| `{{count}}` | A number (e.g. the maximum number of reference images) |

Never change `languageSwitcher.*` endonyms. Keep files at key parity with `en.json` and valid 2-space JSON.

## Voice & register

Use informal second person ("você", never "tu" or "vós"); this is the Brazilian gaming standard and matches the current file throughout (e.g. "Você pode escolher", "sua skin"). Tone is friendly, concise and encouraging — short imperative verbs on buttons ("Salvar", "Baixar", "Compartilhar"). Capitalization: use sentence case for descriptions and most controls; the current file mixes sentence case (toolbar: "Pintura em massa", "Seletor de cores") with Title Case for panel/section headings (detailPanel: "Campo de Visão", "Velocidade de Movimento", "Luz Principal"). Recommend keeping sentence case for toolbar/button labels and reserving initial-cap-per-word only for proper section titles to stay consistent. Keep brand/platform names verbatim (MineSkin, MineSkin PRO, PRO, Minecraft, iOS, Android, App Store, Google Play, GitHub, Discord, PNG, Java Edition). Never alter placeholders {{link}}, {{shortcuts}}, {{language}}, {{date}}. Use Portuguese typographic conventions: comma as decimal separator and period/space as thousands separator; curly quotes "" are already used (saveImage.instruction) and should be kept. Avoid European Portuguese forms (use "tela" not "ecrã", "tela" for screen, "captura de tela", "usuário" not "utilizador", "gerenciar" not "gerir").

## Canonical terms

`*(italic)*` = acceptable alternative.

### Modes

| English | pt-BR | Notes |
|---|---|---|
| **Editor** <br><sub>Pixel-drawing mode</sub> | Editor <br>*(Modo Editor)* | Current file uses 'Editor' (common.editor) and 'Modo Editor' (onboarding.editorModeTitle). Matches. Keep 'Editor' for the mode toggle, 'Modo Editor' where the word 'mode' is explicit. |
| **Preview** <br><sub>View-only 3D mode; also "Previewer"</sub> | Visualizar <br>*(Visualização / Visualizador)* | Current: 'Visualizar' (common.preview toggle), 'Modo Visualização' (onboarding), 'Visualizador de Skins' (metadata previewTitle). Consistent. Use 'Visualizar' for the button/mode; 'Visualizador' is the correct noun for 'Previewer'. |
| **Editing** <br><sub>State label while editing</sub> | Editando | Current file uses 'Editando' (common.editing). Matches. |
| **Draw Mode** <br><sub>Touch mode where gestures paint</sub> | Modo Desenhar <br>*(Modo de Desenho)* | Current: 'Modo Desenhar' (toolbar.touchDrawMode). Matches. Tutorial body also uses 'Modo Desenhar' consistently. |
| **View Mode** <br><sub>Touch mode where gestures rotate/zoom</sub> | Modo Visualizar | Current: 'Modo Visualizar' (toolbar.touchViewMode). Matches and pairs with 'Modo Desenhar'. |

### Domain

| English | pt-BR | Notes |
|---|---|---|
| **Skin** <br><sub>The Minecraft character texture</sub> | skin | Community keeps 'skin' untranslated. Current file uses 'skin'/'Skin' throughout (detailPanel.skin 'Skin', library items). Matches. Capitalize only at sentence start or as a standalone label. |
| **Body** <br><sub>Base/inner texture layer (formerly "Base" / "First Layer")</sub> | Corpo | Current: 'Corpo' (partFilter.baseLayer and partFilter.baseLayerShort). Use when referring to the base layer selector. Replaces the removed 'Primeira Camada' (partFilter.firstLayer). |
| **Armor** <br><sub>Outer/second layer: helmet, jacket, sleeves, pants (formerly "Overlay" / "Second Layer")</sub> | Armadura | Current: 'Armadura' (partFilter.overlayLayer and partFilter.overlayLayerShort). Use when referring to the outer layer selector. Replaces the removed 'Segunda Camada' (partFilter.secondLayer). Note tutorial.eraserNote says 'camada superior' for 'top layer' — same concept in prose, acceptable there. |
| **Toggle whole layer** <br><sub>Eye-button that shows/hides every part of a layer</sub> | Alternar camada inteira | Current: 'Alternar camada inteira' (partFilter.toggleWholeLayer) — full label, kept as screen-reader text. Follows the established 'Alternar …' sentence-case pattern of the other partFilter toggle tooltips. The compact visible variant (partFilter.toggleWholeLayerShort, English 'Toggle all') is 'Alternar tudo' — 'camada' stays implicit because the button sits under that layer's own part grid. |
| **Slim mode** <br><sub>Slim (3px) arm model, aka Alex</sub> | Modo Slim <br>*(Modo slim)* | Current: 'Modo slim' (detailPanel.slimMode). Community keeps 'Slim' (aka Alex) untranslated; recommend capitalizing to 'Modo Slim' for consistency with other mode labels — minor casing inconsistency in current file. |
| **Resolution** <br><sub>Texture resolution 64x64 / 128x128</sub> | Resolução | Current: 'Resolução' (detailPanel.changeResolution, doubleResolution). Matches. |
| **Java Edition** <br><sub>Minecraft: Java Edition (product name)</sub> | Java Edition | Product name — keep verbatim. Current: 'Java Edition' (detailPanel.doubleResWarning). Matches. |
| **Template** <br><sub>Starter skin template</sub> | Modelo <br>*(Template)* | Current: 'Modelos' (library.templates), 'modelo' (importDialog.templateFailed). Consistent. 'Modelo' is the natural pt-BR term; keep it over the anglicism 'Template'. |

### Body (base)

| English | pt-BR | Notes |
|---|---|---|
| **Head** <br><sub>Base head part</sub> | Cabeça | Current: 'Cabeça' (partFilter.head). Matches. |
| **Body** <br><sub>Torso; source uses both "Body" and "Torso"</sub> | Corpo | Current: 'Corpo' (partFilter.body, used for the base body part / toggleBody). Matches. Distinct from 'Torso' — see next. |
| **Torso** <br><sub>Torso (partFilter.torso)</sub> | Tronco | Current: 'Tronco' (partFilter.torso). Matches. Kept distinct from 'Corpo' as in source. |
| **Left Arm** | Braço Esquerdo | Current: 'Braço Esquerdo' (partFilter.leftArm). Matches. |
| **Right Arm** | Braço Direito | Current: 'Braço Direito' (partFilter.rightArm). Matches. |
| **Left Leg** | Perna Esquerda | Current: 'Perna Esquerda' (partFilter.leftLeg). Matches. |
| **Right Leg** | Perna Direita | Current: 'Perna Direita' (partFilter.rightLeg). Matches. |

### Body (overlay)

| English | pt-BR | Notes |
|---|---|---|
| **Helmet** <br><sub>Head overlay</sub> | Capacete | Current: 'Capacete' (partFilter.helmet). Matches. Standard community term for the head overlay layer. |
| **Jacket** <br><sub>Body overlay</sub> | Jaqueta | Current: 'Jaqueta' (partFilter.jacket). Matches. |
| **Left Sleeve** <br><sub>Left arm overlay</sub> | Manga Esquerda | Current: 'Manga Esquerda' (partFilter.leftSleeve). Matches. |
| **Right Sleeve** <br><sub>Right arm overlay</sub> | Manga Direita | Current: 'Manga Direita' (partFilter.rightSleeve). Matches. |
| **Left Pants** <br><sub>Left leg overlay</sub> | Calça Esquerda <br>*(Perna da Calça Esquerda)* | Current: 'Calça Esquerda' (partFilter.leftPants). Matches. Literal but consistent with source's per-leg overlay naming. |
| **Right Pants** <br><sub>Right leg overlay</sub> | Calça Direita <br>*(Perna da Calça Direita)* | Current: 'Calça Direita' (partFilter.rightPants). Matches. |

### Tools

| English | pt-BR | Notes |
|---|---|---|
| **Color picker** <br><sub>Tool to pick a color</sub> | Seletor de cores | Current: 'Seletor de cores' (toolbar.colorPicker) and 'Seletor de Cores' (colorPicker.colorPickerTab, tutorial). Minor casing inconsistency; recommend sentence case 'Seletor de cores' for the toolbar tool. |
| **Pen tool** <br><sub>Primary per-pixel draw tool</sub> | Ferramenta caneta <br>*(Ferramenta Caneta)* | Current: 'Ferramenta caneta' (toolbar.penTool), but tutorial titles it 'Ferramenta de Desenho' and body says 'ferramenta Caneta'. Inconsistency — recommend standardizing on 'Ferramenta caneta' for the tool label. |
| **Bulk paint** <br><sub>Fill/flood paint tool</sub> | Pintura em massa <br>*(Preenchimento)* | Current: 'Pintura em massa' (toolbar.bulkPaint). Matches. 'Preenchimento' (fill) is an alt if a fill/flood metaphor is preferred, but keep current for consistency. |
| **Eraser** <br><sub>Erase pixels</sub> | Borracha | Current: 'Borracha' (toolbar.eraser); tutorial titles 'Ferramenta de Apagar'. Standard community term is 'Borracha' — keep it. |
| **Shading** <br><sub>Variation/shading tool (key: variation)</sub> | Sombreamento <br>*(Variação)* | Key is 'variation'. Current: 'Sombreamento' (toolbar.variation) but detailPanel.variationToolIntensity uses 'Ferramenta de Variação' / 'Intensidade da Ferramenta de Variação'. Inconsistency — recommend 'Sombreamento' everywhere the user-facing tool is named. |
| **Dither** <br><sub>Dither brush</sub> | Pontilhado | Current: 'Pontilhado' (toolbar.dither, brushIntroBody 'pincel de pontilhado'). Matches. |
| **Symmetry** <br><sub>Mirror painting</sub> | Simetria | Current: 'Simetria' (toolbar.symmetry, 'Desativar simetria'). Matches. |
| **Brush** <br><sub>Brush / Brushes</sub> | Pincel <br>*(Pincéis (plural))* | Current: 'Pincel' (toolbar.brush) / 'Pincéis' (toolbar.brushes). Matches. |
| **Grid** <br><sub>Pixel grid overlay (also an environment name)</sub> | Grade | Current: 'Grade' for both the pixel-grid tool (toolbar.grid) and the environment name (detailPanel.environmentGrid). 'Grade' correctly fits a UI grid overlay. Matches. |
| **Look at Cursor** <br><sub>Camera-follow-cursor toggle</sub> | Olhar para o Cursor <br>*(Seguir o Cursor)* | Current: 'Olhar para o Cursor' (toolbar.lookAtCursor). Matches. 'Seguir o Cursor' is a slightly clearer alt for camera-follow. |

### Brush params

| English | pt-BR | Notes |
|---|---|---|
| **Opacity** | Opacidade | Current: 'Opacidade' (toolbar.opacity, colorPicker.opacity). Matches. |
| **Intensity** | Intensidade | Current: 'Intensidade' (toolbar.intensity). Matches. |
| **Radius** | Raio | Current: 'Raio' (toolbar.radius). Matches. |
| **Size** | Tamanho | Current: 'Tamanho' (toolbar.size). Matches. |
| **Shape** | Forma | Current: 'Forma' (toolbar.shape). Matches. |
| **Square** | Quadrado | Current: 'Quadrado' (toolbar.square). Matches (brush shape). |
| **Circle** | Círculo | Current: 'Círculo' (toolbar.circle). Matches. |

### Color

| English | pt-BR | Notes |
|---|---|---|
| **Palette** <br><sub>Saved/used colors</sub> | Paleta | Current: 'Paleta' (colorPicker.paletteTab). Matches. |
| **Hue** | Matiz | Current: 'Matiz' (colorPicker.hue). Matches — correct HSL term. |
| **Saturation** | Saturação | Current: 'Saturação' (colorPicker.saturation). Matches. |
| **Lightness** | Luminosidade | Current: 'Luminosidade' (colorPicker.lightness). Matches — correct HSL term, kept distinct from 'Brilho'. |
| **Value** <br><sub>HSV value component</sub> | Valor | HSV value. Current: 'valor' (colorPicker.saturationValueSelector 'saturação e valor'). Matches. Keep distinct from 'Luminosidade' (HSL) and 'Brilho' (brightness). |
| **Hex Code** | Código Hex | Current: 'Código Hex' (colorPicker.hexCode), 'Código hex inválido'. Matches. 'Hex' kept as the community shorthand. |

### Reference images

| English | pt-BR | Notes |
|---|---|---|
| **Reference** <br><sub>Panel title for the reference-image panel</sub> | Referência | Current: 'Referência' (reference.title). Singular noun for the panel heading; the plural 'Referências' is used only when a string genuinely refers to several images. |
| **Reference image** <br><sub>An imported photo/artwork used to sample colors from</sub> | Imagem de referência <br>*(Referência)* | Current: 'Imagens de referência' (toolbar.reference), 'Adicionar imagem de referência' (reference.add), 'Imagem de referência.' (reference.pickFromImage). Use the full 'imagem de referência' when introducing the object; the short 'referência' is fine once context is established (reference.remove 'Remover referência'). Sentence case, matching the other toolbar labels. |
| **Pick a color** <br><sub>Sampling a color out of a reference image</sub> | Escolher uma cor <br>*(Selecionar uma cor)* | Aligned with 'Escolher Cor' (colorPicker.chooseColor) and 'Seletor de cores' (toolbar.colorPicker). Avoid 'capturar' here — that verb is reserved for 'Captura de tela' (screenshot). Current: reference.pickFromImage, reference.emptyState. |
| **Palette** <br><sub>Colors extracted from a reference image (see also Color › Palette)</sub> | Paleta | Same canonical term as colorPicker.paletteTab. The reference string phrases it as 'Cores desta imagem' (reference.imageColors) because the source says "Colors in …", not "Palette" — keep 'Paleta' for any string that literally says Palette. |
| **Swatch** <br><sub>A single color chip in a palette strip</sub> | Amostra de cor <br>*(Amostra)* | No user-facing string uses it yet; reserve 'Amostra de cor' if one is added, and never 'Amostragem' (sampling) for the chip itself. |
| **Zoom** <br><sub>Magnifying the reference photo to pick colors precisely</sub> | zoom | Keep the loanword — it is the Brazilian tech/gaming standard and the file already uses it in prose ('rotacionam e dão zoom no modelo', tutorial.touchDrawModeContent). Never 'ampliação'/'aproximação' as the noun. |
| **Zoom in / Zoom out** <br><sub>The + and − buttons over a reference image</sub> | Aumentar zoom / Diminuir zoom <br>*(Ampliar / Reduzir)* | Current: reference.zoomIn / reference.zoomOut. Keep the explicit 'zoom' noun so the pair stays symmetrical and unambiguous — bare 'Reduzir' could read as shrinking the image itself. Sentence case, matching the other reference labels. |
| **Reset zoom** <br><sub>Reset button restoring the default zoom level</sub> | Redefinir zoom | Current: reference.resetZoom. Uses the canonical 'Redefinir' for Reset (see Actions › Reset), not 'Restaurar' or 'Zoom padrão'. |
| **Zoomed in** <br><sub>State of the reference image once it is bigger than fit size (reference.pickFromImageZoomed)</sub> | com zoom | Adjectival phrase after the noun: 'Imagem de referência, com zoom.' Keeps the locked loanword 'zoom' (see Zoom above) instead of 'ampliada'/'aproximada', which would reintroduce the banned 'ampliação'/'aproximação' family. |
| **Pan** <br><sub>Dragging a zoomed reference image to change which part of it is visible (reference.pickFromImageZoomed, reference.panHintTouch/panHintMouse)</sub> | mover <br>*(mover a imagem — when the object needs spelling out)* | Plain 'mover' for the hint pill ('Arraste para mover'); spell the object out as 'mover a imagem' in the fuller aria-label. Never the anglicism 'panoramizar'/'pan', and never 'arrastar a imagem' as the result — 'arrastar' names the gesture, 'mover' names what happens. Distinct from detailPanel's 'Mover Esquerda/Direita' (3D camera movement), which context keeps apart. |
| **Drag** <br><sub>Press-and-move gesture (reference.pickFromImage, reference.panHint*, importDialog.dropzoneText)</sub> | Arraste <br>*(Arrastar)* | Imperative 'Arraste' per the informal-'você' register; already used by reference.pickFromImage and importDialog.dropzoneText ('Arraste e solte'). |
| **Tap vs. Click** <br><sub>Touch- and mouse-input variants of the same hint, chosen at runtime by input device (reference.panHintTouch / reference.panHintMouse)</sub> | Toque (Tap) / Clique (Click) | The two English verbs must stay distinguishable because the UI picks between them by device. Tap = 'toque' (matching common.modeSwitchHintBody and colorPicker.tapToConfirm); Click = 'clique' (matching importDialog.dropzoneText). Never swap them, never 'pressione' or 'aperte'. |
| **Pick a color (compact)** <br><sub>The pick half of the narrow hint pill, ~10px text in a ≤70%-width pill (reference.panHintTouch/panHintMouse)</sub> | toque na cor / clique na cor | Compact form of the canonical 'escolher uma cor' (see Pick a color above), used only where the pill must stay on one line at the panel's 260px minimum width; 'toque para escolher' overflows. The full canonical verb stays in the aria-label (reference.pickFromImageZoomed). Keep the middle dot '·' as the separator — it reads naturally in pt-BR and matches the source. |
| **Camera** <br><sub>The device camera used to capture a reference image (native permission prompt)</sub> | câmera | Brazilian spelling 'câmera' (never EU 'câmara'). Distinct from the 3D viewport camera section above, which only names sub-settings ('Campo de Visão', etc.) and never the bare word. Used in native.cameraUsageDescription. |
| **Take a photo** <br><sub>Capturing a photo with the device camera to use as a reference image</sub> | Tirar uma foto <br>*(Tire uma foto (imperative))* | 'Tirar foto' is the standard Brazilian collocation. Never 'capturar' — that verb is reserved for 'Captura de tela' (screenshot, see Actions). Keep the noun 'foto', not 'fotografia'. Current: native.cameraUsageDescription. |

### Actions

| English | pt-BR | Notes |
|---|---|---|
| **Undo** | Desfazer | Current: 'Desfazer' (toolbar.undo). Matches. |
| **Redo** | Refazer | Current: 'Refazer' (toolbar.redo). Matches. |
| **Save** | Salvar | Current: 'Salvar' (common.save). Matches. Brazilian standard (not EU 'Guardar'). |
| **Cancel** | Cancelar | Current: 'Cancelar' (common.cancel). Matches. |
| **Reset** | Redefinir <br>*(Restaurar)* | Current: 'Redefinir' (common.reset). Matches. 'Restaurar' if a restore-defaults nuance is wanted, but keep 'Redefinir'. |
| **Upload** | Carregar <br>*(Enviar)* | Current: 'Carregar' (common.upload, importDialog.uploadFile). Matches. Kept distinct from 'Baixar' (download). |
| **Download** | Baixar | Current: 'Baixar' (recorder.download, library.exportSkin, home.appStoreAlt). Matches. Brazilian standard. |
| **Import** | Importar | Current: 'Importar' (importDialog.import/title). Matches. |
| **Export** <br><sub>Used for "export skin"</sub> | Exportar | INCONSISTENCY: library.exportSkin is labeled 'Baixar' (Download), while saveImage.cannotExportTitle/Message use 'exportar' and 'exportadas'. Recommend 'Exportar' wherever the source says Export; reserve 'Baixar' strictly for Download. The 'Baixar' label on exportSkin is acceptable UX but note the term divergence. |
| **Screenshot** | Captura de tela | Current: 'Captura de tela' (toolbar.screenshot, feedback.addScreenshotButtonLabel). Matches. Brazilian 'tela' (not EU 'ecrã'). |
| **Record clip** <br><sub>Record a shareable video</sub> | Gravar clipe | Current: 'Gravar clipe' (toolbar.recordClip). Matches; recorder strings use 'clipe' and 'Gravando…' consistently. |
| **Share** | Compartilhar | Current: 'Compartilhar' (recorder.share/shareImage). Matches. Brazilian standard (not EU 'Partilhar'). |
| **Discard** | Descartar | Current: 'Descartar' (recorder.discard). Matches. Kept distinct from 'Cancelar' and 'Excluir'. |
| **Copy** <br><sub>Copy-to-clipboard button (home.copyEmail)</sub> | Copiar | Short imperative, sentence case, matching the other action buttons. Never 'Copiar para a área de transferência' on the tiny button — the long form belongs only in an aria-label if one is ever needed. |
| **Copied** <br><sub>Confirmation state of the copy button (home.copiedEmail)</sub> | Copiado | Masculine past participle: it agrees with the implicit 'endereço (de e-mail)'. Never 'Copiada'. |
| **Email address** <br><sub>The developer's contact address (home.copyEmailLabel)</sub> | Endereço de e-mail | Brazilian spelling is 'e-mail' with the hyphen (not 'email' or 'correio eletrônico'). Current: 'Copiar endereço de e-mail' (home.copyEmailLabel). |

### Animation

| English | pt-BR | Notes |
|---|---|---|
| **Idle animation** | Animação parado <br>*(Animação de descanso)* | Current: 'Animação parado' (toolbar.idleAnimation). Matches; acceptable and concise. 'Animação de descanso' is a smoother alt. |
| **Walking animation** | Animação andando <br>*(Animação de caminhada)* | Current: 'Animação andando' (toolbar.walkingAnimation). Matches; pairs with 'Animação parado'. |
| **No Animation** | Sem Animação | Current: 'Sem Animação' (toolbar.noAnimation). Matches. |

### Posing

| English | pt-BR | Notes |
|---|---|---|
| **Pose Limbs** <br><sub>Toolbar toggle that enables joint posing (toolbar.poseMode)</sub> | Posicionar membros <br>*(Modo pose)* | Verb + object, matching the source and the sentence-case toolbar convention ('Pintura em massa', 'Seletor de cores'). Kept short for the narrow icon rail. 'Modo pose' is the shorter alt if the rail ever gets tighter, but it loses the 'limbs' cue that distinguishes this from the animation toggles. |
| **Pose** <br><sub>Noun: the character's current limb arrangement (toolbar.resetPose)</sub> | pose | 'Pose' is a real, everyday pt-BR noun (feminine: *a pose*) and needs no adaptation. Use it for every noun occurrence — 'Redefinir pose', 'mudar a pose'. Never 'postura' (reads as posture/bearing) and never 'posição' — that word is now locked to the *whole model's* place in the scene (see Position (of the model) below), the concept 'Redefinir posição da skin' is deliberately contrasted with. |
| **Position (of the model)** <br><sub>Where the whole skin sits in the scene and which way it faces — what the centre handle changes, independent of any joint (toolbar.resetPosition)</sub> | posição da skin <br>*(posição — once the object is unambiguous)* | The counterpart concept to 'pose': 'pose' = the limbs' arrangement, 'posição' = the whole skin's place and facing. Always name the object on the button ('Redefinir posição **da skin**', never a bare 'Redefinir posição'), because 'Redefinir pose' sits directly above it in the same panel and the two share a root — the explicit 'da skin' is what tells the user at a glance which button moves the whole character. Feminine agreement follows 'a skin' (see The whole skin above). Never 'posicionamento', never 'transformação'/'transform' (rig jargon; the code's `resetTransform` must not surface), and never reuse the verb 'Posicionar' here — that is locked to the Move tile (see Move (tool)). |
| **To pose** <br><sub>Verb: drag a limb to rotate it around its joint</sub> | posicionar <br>*(mudar a pose)* | The verb 'posar' in pt-BR means to pose *for a photo* — wrong sense for articulating a figure — so the canonical verb is 'posicionar'. When the object is a mixed-gender list ('um braço, uma perna ou a cabeça') avoid the clitic and use the noun phrase 'para mudar a pose' instead of 'posicioná-lo/-la'. |
| **Limb** <br><sub>An arm, a leg, or the head — one posable joint chain</sub> | membro | Standard anatomical/UI term, masculine ('um membro'). Includes the head in this feature even though it is not a limb anatomically — the source does the same, so do not expand it to 'membro ou cabeça'. Keep distinct from 'parte' (partFilter's body *parts*) and from 'peça'. |
| **Handle** <br><sub>The small grab point you click/tap to *select* something before any gizmo appears — a limb's handle, and the one at the model's centre (toolbar.poseModeHint, poseModeHintTouch, poseTwistHintTouch)</sub> | alça <br>*(a alça do membro / a alça no centro do modelo — full forms)* | Feminine ('a alça', 'dê um toque duplo **nela**'). The generic word is now required and no longer avoidable: since the posing rework, selecting and manipulating are two different steps, and the thing you tap to select is not the ring — the rings and arrows only appear afterwards. 'Alça' is the standard pt-BR software rendering of *handle* (Photoshop/Illustrator pt-BR) and is short enough for the 208px popover; the bag-strap reading is ruled out by the surrounding 3D vocabulary. Never 'manipulador'/'controlador' (developer jargon), never 'puxador', and never reuse 'anel' for it — 'anel' is now strictly a twist ring (see Twist ring below). Note the source itself says 'the **ring** at the model's center' in the Twist hints and 'the **handle** at the model's center' in the Move hints, because the centre gizmo takes the shape of the active tool; keep that split ('a alça no centro do modelo' in Move, 'o anel no centro do modelo' in Twist). |
| **Model's center (handle)** <br><sub>The gizmo drawn at the model's centre of mass, attached to no body part; dragging it moves or turns the whole skin (toolbar.poseModeHint, poseModeHintTouch, poseTwistHint, poseTwistHintTouch)</sub> | centro do modelo <br>*(a alça no centro do modelo (Move) / o anel no centro do modelo (Twist) — full forms)* | Name the place the user sees it, exactly as the source does ('the model's center'). Say 'do modelo', not 'do corpo' or 'da skin': it hangs off no body part at all, and 'modelo' is already the file's word for the 3D character ('rotacionam e dão zoom no modelo', tutorial.touchDrawModeContent; 'partes do modelo da skin', detailPanel.visibilityDescription) — the Template sense of 'Modelo' (library.templates) never appears in a 3D-viewport sentence, so context keeps them apart. Replaces the earlier 'peito' (chest), which is now wrong: it left the torso and no longer implies leaning from the waist. Never 'tronco'/'torso'/'peito' (they promise a body part moves), never 'raiz'/'pivô'/'centro de massa' (rig jargon). The gizmo word follows the active tool, as the source's own split does: 'alça' in the Move hints, 'anel' in the Twist hints (see Handle and Twist ring). Clitics and pronouns must agree with whichever noun the string uses — 'dê um clique duplo **nela**' after 'alça', '**nele**' after 'anel'. |
| **The whole skin** <br><sub>The entire character at once, as driven by the centre gizmo (the handle in Move, the ring in Twist): translated through the scene by Move, turned on the spot by Twist (toolbar.poseModeHint, poseModeHintTouch, poseTwistHint, poseTwistHintTouch)</sub> | a skin inteira <br>*(a skin toda)* | Feminine, agreeing with 'a skin' (see Domain › Skin; cf. library.newEmpty 'Vazia'). 'Inteira' carries the whole point of the sentence — that this drag is *not* the single-limb drag described just before it — so never drop it to a bare 'a skin'. Replaces the earlier 'o corpo todo': the source no longer says 'body', and 'corpo' would now collide with partFilter's 'Corpo' for no gain. The two verbs that act on it stay split exactly as in the source: **mover** for Move's translation through the scene ('move a skin inteira') and **virar** for Twist's turn on the spot ('vira a skin inteira'). Drop 'inclinar' here — the centre gizmo no longer leans anything. Do not carry 'torcer' over to the skin, it is locked to a limb rolling in its own axis (see Twist below); 'girar' stays reserved for the camera ('Girar Esquerda/Direita', detailPanel.turnLeftRight) and 'rotacionar' for the orbit gesture. On 'mover': the tool *tile* is still 'Posicionar' and never 'Mover' (see Move (tool) below), but the verb is safe inside this sentence because it always names its object, exactly as the camera's objectless 'Mover Esquerda/Direita' (detailPanel.moveLeftRight) and the reference-image pan never do. |
| **Axis** <br><sub>One of the three axes a limb's end can be moved along (Move) or the limb can be turned about (Twist) (toolbar.poseModeHint*, poseTwistHint*)</sub> | eixo | The standard geometry/3D term, masculine. Both tools now expose the same three axes — one per arrow, one per ring — so a single unqualified 'eixo' covers the whole feature and the demonstrative does all the work: '**naquele** eixo' points back at the arrow or ring the user just grabbed. The old Twist-only phrase 'o próprio eixo' is retired (see Twist below); do not reintroduce it, and never add a second word such as 'direção', 'coordenada' or 'eixo longitudinal'. |
| **Axis arrow** <br><sub>The three straight arrows shown at a limb's free end once the limb is selected with the Move tool; dragging one slides that end along that axis only (toolbar.poseModeHint, poseModeHintTouch)</sub> | seta de eixo <br>*(setas de eixo (plural))* | Names the shape the user sees, exactly like 'anel' does for the twist rings — the two must never blur, since arrows *move* the limb's end and rings *turn* the limb. Keep the plural bare ('as setas de eixo', no 'do membro') so the 208px popover stays on few lines. The sentence always names what the drag does to which end: 'arraste uma seta para mover **essa ponta** naquele eixo' — 'ponta' (the limb's free end) is the same word already used for the limb tip; never 'extremidade' (bookish) or 'ponteira'. Avoid 'flecha' (an archery arrow), 'seta de direção' (reads as a D-pad key), and the developer jargon 'gizmo'/'manipulador de eixo'. |
| **Twist ring** <br><sub>The three rings shown around a limb's joint once the limb is selected with the Twist tool; dragging one turns the limb about that axis (toolbar.poseTwistHint, poseTwistHintTouch)</sub> | anel de torção <br>*(anel — once the rings are established in the sentence)* | Masculine ('um anel', 'arraste um anel'). Introduce the set with the qualified plural 'os anéis de torção', then drop to the bare 'anel' for the drag clause, as the source does. 'Torção' is the noun of the canonical tool verb 'Torcer' (see Twist below) and is used here only as a modifier — the verb stays 'torcer' ('arraste um anel para torcê-lo naquele eixo'). Never 'argola' (a hoop/earring), never 'círculo' (locked to the brush shape, toolbar.circle), never 'aro'. Note the clitic on 'torcê-lo' agrees with 'membro' (the limb being twisted), not with the ring. |
| **Collision / stop where limbs meet** <br><sub>Always-on behaviour: a limb cannot pass through another body part. Not surfaced by any current string — the reworked pose hints spend their room on the gizmos instead; kept for whenever it is mentioned again</sub> | parar onde encostam em outra parte do corpo | State it as plain behaviour, never as a setting — there is no toggle, so avoid 'colisão' and 'detecção de colisão', which read as an option the user could switch off. 'Encostar' is the everyday pt-BR verb for one thing meeting another; 'parar' names the result. Uses partFilter's canonical 'parte' for body part (never 'membro' here — the obstacle can be the torso or head). Avoid 'atravessar' phrasing ('não atravessam') — it describes what does *not* happen instead of what the user sees. |
| **Joint** <br><sub>The pivot the limb rotates about — shoulder, hip, neck; stays fixed while aiming</sub> | articulação | Correct anatomical and 3D-rigging term in pt-BR, feminine ('a articulação'). Strictly the *pivot point*, never the moving part — keep it apart from 'membro' (the limb itself) and from partFilter's 'parte' (a paintable body part). Never 'junta' (reads as a mechanical/plumbing joint) or 'eixo', which names the axis-arrow directions (see Axis above). |
| **Select (a limb)** <br><sub>The first step of every posing gesture since the rework: click the limb (mouse) or tap its handle (touch) to bring up the gizmo — nothing moves yet (toolbar.poseModeHint*, poseTwistHint*)</sub> | clicar em / tocar na alça <br>*(selecionar — only if a string ever names the step abstractly)* | The hints never say the word 'select'; they name the gesture and its visible result ('Clique em um membro para ver as setas de eixo'). Keep that shape — 'para ver …' is what tells the user the click only reveals the gizmo. Respect the locked Tap/Click split (see Reference images › Tap vs. Click) and the per-device asymmetry the source itself has: mouse hints click the *limb*, touch hints tap the limb's *handle*. Reserve the bare verb 'selecionar' for a future string that talks about selection as a state. |
| **Aim (verb)** <br><sub>Obsolete since the posing rework — the ring no longer aims a limb at the pointer</sub> | ~~apontar~~ | No longer used by any string: dragging never aims a limb now, it slides one end along an axis (Axis arrow) or turns the limb about an axis (Twist ring). Kept here only so the retired term is not reintroduced — do not put 'apontar' back into the pose hints. |
| **Swing (verb)** <br><sub>Prose-only: the loose rotation of a limb about its joint when you drag its body</sub> | balançar | Not used by any current string — since the rework, dragging never swings a limb freely; every drag is constrained to one axis arrow or one twist ring. Reserve 'balançar' if prose ever needs to name the pendular motion. Never 'rodar' (EU Portuguese) or 'oscilar' (too technical). |
| **Move (tool)** <br><sub>Tile label for the default posing tool: selecting a limb shows three axis arrows at its free end, dragging one slides that end along that axis, and the centre handle moves the whole skin (toolbar.poseMove)</sub> | Posicionar <br>*(Mover — do not use as the tile label)* | Reuses the canonical pose verb (see 'To pose' above), which is exactly what the tool does. 'Mover' is deliberately rejected even though it is the literal source word: it is already spoken for twice, by reference-image panning (see Reference images › Pan) and by the 3D camera's 'Mover Esquerda/Direita' (detailPanel.moveLeftRight), and a third sense would break the one-term-per-concept rule. The overlap with the parent toggle 'Posicionar membros' (toolbar.poseMode) is harmless: the tile drops the object because the panel it sits in is already about limbs. One word, one line at the ~120px tile width. The ban covers the *tile* only: in the hints, the centre handle's translation is still 'move a skin inteira' (see The whole skin above), where the explicit object rules out the pan and camera senses. |
| **Twist (tool/verb)** <br><sub>Turning a limb about one of the three axes of its joint — e.g. rolling a palm outwards (toolbar.poseTwist, poseTwistHint, poseTwistHintTouch)</sub> | Torcer <br>*(torção (noun, in 'anel de torção' and prose))* | 'Torcer' is the everyday Brazilian verb for turning something about an axis of its own ('torcer o pulso', 'torcer a chave') and is the only single-word candidate not already locked to another concept. Deliberately kept apart from: 'posicionar' (the Move tool, above), 'balançar' (Swing — the pendular motion about the joint), 'girar' (locked to the camera's 'Girar Esquerda/Direita', detailPanel.turnLeftRight), 'rotacionar' (locked to the orbit gesture in prose, tutorial.touchDrawModeContent) and 'mover' (Pan). Never 'rolar' — in Brazilian UI that is scrolling. The sprain/cheer readings of 'torcer' are ruled out by the tile icon and the hints, which always name the axis. For the axis, the hints now say '**naquele** eixo' — each of the three rings turns the limb about one specific axis, so the old fixed phrase 'no próprio eixo' (one single longitudinal axis) is retired and must not be reintroduced. Keep the short form: never 'em torno daquele eixo' or 'ao redor daquele eixo'. |
| **Reset Pose** <br><sub>Button returning every limb to rest (toolbar.resetPose)</sub> | Redefinir pose | Uses the canonical 'Reset' → 'Redefinir' (common.reset), sentence case like the other toolbar labels. Article omitted on the button ('Redefinir pose', not 'Redefinir a pose') for brevity; keep the article in prose. |
| **Reset Position** <br><sub>Button putting the whole model back at the scene origin facing forward — the sibling button stacked under Reset Pose (toolbar.resetPosition)</sub> | Redefinir posição da skin | Same canonical 'Redefinir' as its sibling, so the pair reads as one family, but the object is spelled out (see Position (of the model) above): the two buttons are full-width and stacked, and 'Redefinir posição' alone is too close to 'Redefinir pose' to be told apart at a glance. Fits one line at the popover's ~256px content width, 13px text. Never 'Recentralizar' as the label — recentring is only half of what the button does (it also restores the facing) and 'centralizar' is reserved for the hints' recenter clause (see Recenter below). |
| **Recenter** <br><sub>Double-clicking/double-tapping the centre handle to put the whole skin back at the scene origin (toolbar.poseModeHint, poseModeHintTouch)</sub> | centralizar … de novo | Use the everyday 'centralizar' with 'de novo' for the re- prefix ('para centralizá-la de novo'), with the clitic agreeing with 'a skin'. Avoid the rare, bookish 'recentralizar'/'recentrar' and the rig jargon 'zerar a posição'/'voltar à origem'. The Move hints only ever recentre — the facing clause belongs to Twist (see Face forward below). |
| **Face forward (again)** <br><sub>Double-clicking/double-tapping the centre ring in Twist to restore the skin's original facing (toolbar.poseTwistHint, poseTwistHintTouch)</sub> | voltar a olhar para a frente | Reuses the file's established 'olhar para' for facing (toolbar.lookAtCursor 'Olhar para o Cursor'), which keeps this apart from the ring's own verb 'virar' ('vira a skin inteira', see The whole skin). Phrase it with an explicit subject clause — 'para que ela volte a olhar para a frente' — because the preceding clause's subject is the ring, not the skin. Never 'de frente para a câmera' (it restores the scene's forward, not the current view) and never 'endireitar' (reads as straightening posture). |
| **Double-click** <br><sub>Mouse gesture</sub> | dar um clique duplo <br>*(clicar duas vezes)* | Canonical Brazilian software wording; use the full verb phrase in prose ('dê um clique duplo para…'). Pairs with the existing 'clique para procurar' (importDialog.dropzoneText). |
| **Double-tap** <br><sub>Touch gesture: two quick taps on a limb's handle to reset that limb (toolbar.poseModeHintTouch, poseTwistHintTouch)</sub> | dar um toque duplo <br>*(tocar duas vezes)* | Built to mirror 'dar um clique duplo' exactly, so the touch and mouse hints read as the same gesture on different devices. Respects the locked Tap/Click split (see Reference images › Tap vs. Click): touch is always 'toque', never 'clique'. Never 'duplo toque' (calque word order) or 'pressionar duas vezes' ('pressionar' implies a press-and-hold). |
| **Hold \<key\>** <br><sub>Keep a modifier key pressed</sub> | Segure \<key\> | 'Segure' (not 'Mantenha pressionado', which is long-winded for a tooltip, nor 'Pressione', which implies a single tap). The key name itself stays verbatim in Latin — see the universal rules. |

### Camera

| English | pt-BR | Notes |
|---|---|---|
| **Field Of View** <br><sub>FOV</sub> | Campo de Visão | Current: 'Campo de Visão' (detailPanel.fieldOfView). Matches — standard FOV translation. |
| **Movement Speed** | Velocidade de Movimento | Current: 'Velocidade de Movimento' (detailPanel.movementSpeed). Matches. |
| **Damping** <br><sub>Camera inertia damping</sub> | Amortecimento | Current: 'Amortecimento' (detailPanel.damping). Matches — correct term for camera inertia damping. |

### Light

| English | pt-BR | Notes |
|---|---|---|
| **Main Light** <br><sub>Key/directional light</sub> | Luz Principal | Current: 'Luz Principal' (detailPanel.mainLight). Matches. |
| **Ambient Light** <br><sub>Overall Brightness (Ambient Light)</sub> | Luz Ambiente | Current: appears inside 'Brilho Geral (Luz Ambiente)' (detailPanel.overallBrightness). Matches. Use 'Luz Ambiente' consistently for the parenthetical/standalone ambient-light label. |
| **Surface Brightness** | Brilho da Superfície | Current: 'Brilho da Superfície' (detailPanel.surfaceBrightness). Matches. |
| **Shine/Glossiness** <br><sub>Specular</sub> | Brilho/Lustro <br>*(Brilho/Reflexo)* | Current: 'Brilho/Lustro' (detailPanel.shineGlossiness). Matches. Note 'Brilho' is overloaded (also used for Brightness); 'Lustro' disambiguates the specular/gloss sense. 'Reflexo' is an alt. |
| **Overall Brightness** | Brilho Geral | Current: 'Brilho Geral (Luz Ambiente)' (detailPanel.overallBrightness). Matches; the full source string is 'Overall Brightness (Ambient Light)'. |

### Environment

| English | pt-BR | Notes |
|---|---|---|
| **Environment** <br><sub>3D world/atmosphere</sub> | Ambiente | Current: 'Ambiente' (detailPanel.environment). Matches. Note 'ambiente' also renders 'Luz Ambiente' — context keeps them clear. |
| **Grassland Day** <br><sub>Environment name</sub> | Campo de Dia <br>*(Campo (Dia) / Planície Diurna)* | Current: 'Campo de Dia' (detailPanel.environmentGrassland). Acceptable but reads slightly oddly ('field of day'); 'Campo (Dia)' or 'Planície Diurna' are clearer. Keep 'Campo de Dia' unless renaming across app. |
| **Arena** <br><sub>Sci-fi arena environment (NOT "sand")</sub> | Arena | Current: 'Arena' (detailPanel.environmentScifi). Correct — the sci-fi arena sense (an arena stadium), NOT 'sand'. In pt-BR 'arena' means arena/stadium, so no ambiguity risk (unlike Spanish). Matches. |
| **Empty** <br><sub>No environment</sub> | Vazio | Current: 'Vazio' (detailPanel.environmentEmpty). Matches. Note library.newEmpty uses feminine 'Vazia' (agreeing with 'skin'); the environment label correctly stays masculine 'Vazio' (ambiente). |

### Library

| English | pt-BR | Notes |
|---|---|---|
| **Library** <br><sub>Saved skins collection</sub> | Biblioteca | Current: 'Biblioteca' (library.title). Matches. |
| **New Skin** | Nova Skin | Current: 'Nova Skin' (library.newSkin, library.defaultName). Matches. |
| **Templates** | Modelos | Current: 'Modelos' (library.templates). Matches; consistent with singular 'Modelo' recommendation. |
| **Changelog** | Histórico de Alterações <br>*(Novidades)* | Current: 'Histórico de Alterações' (changelog.title, 'Ver histórico de alterações'). Matches. 'Novidades' is a friendlier alt if space allows, but keep current for accuracy. |
| **Settings** | Configurações | Current: 'Configurações' (common.settings). Matches consistently across the file. |
| **Appearance** <br><sub>Color-theme selector label (theme.label)</sub> | Aparência | Label above the theme dropdown (System/Light/Dark). Standard pt-BR OS term for a theme/appearance setting. Sentence-case single noun, matching 'Idioma' (languageSwitcher.language). |

### Open source & GitHub

| English | pt-BR | Notes |
|---|---|---|
| **Open source** <br><sub>The project's licensing/status (home.openSourceHeading)</sub> | de código aberto <br>*(open source)* | The homepage audience is the general public ('people', deliberately broader than 'players'), not only developers, so the transparent 'de código aberto' is preferred over the loanword. Current: 'O MineSkin é de código aberto.' (home.openSourceHeading). Note the definite article before the brand ('O MineSkin'), matching supportDescription and languageDetection.description. |
| **Star** <br><sub>Verb/button that stars the GitHub repo (home.githubStar)</sub> | Dar estrela <br>*(Marcar com estrela)* | GitHub's own pt-BR wording is 'marcar com estrela'; it is too long for this tiny button, and 'dar estrela' is what Brazilian developers actually say. Never the bare noun 'Estrela' (reads as a label, not an action) and never 'Favoritar' (that is GitHub's separate bookmark concept). |
| **Stargazers** <br><sub>Accessible label on the star-count link (home.githubStargazers)</sub> | Estrelas no GitHub | The link shows a count, so the countable noun is clearer than a literal rendering of 'stargazers' (which has no natural pt-BR equivalent — avoid 'observadores', that is GitHub's 'watchers'). Keeps 'GitHub' verbatim. |
| **Repository** | Repositório | Current: 'Repositório do GitHub' (about.githubRepository). Matches. |

## Consistency watch-list

Terms with known drift in the current file — keep these locked to the recommended form:

- **Skin** → `skin`: Community keeps 'skin' untranslated. Current file uses 'skin'/'Skin' throughout (detailPanel.skin 'Skin', library items). Matches. Capitalize only at sentence start or as a standalone label.
- **Slim mode** → `Modo Slim`: Current: 'Modo slim' (detailPanel.slimMode). Community keeps 'Slim' (aka Alex) untranslated; recommend capitalizing to 'Modo Slim' for consistency with other mode labels — minor casing inconsistency in current file.
- **Color picker** → `Seletor de cores`: Current: 'Seletor de cores' (toolbar.colorPicker) and 'Seletor de Cores' (colorPicker.colorPickerTab, tutorial). Minor casing inconsistency; recommend sentence case 'Seletor de cores' for the toolbar tool.
- **Pen tool** → `Ferramenta caneta`: Current: 'Ferramenta caneta' (toolbar.penTool), but tutorial titles it 'Ferramenta de Desenho' and body says 'ferramenta Caneta'. Inconsistency — recommend standardizing on 'Ferramenta caneta' for the tool label.
- **Shading** → `Sombreamento`: Key is 'variation'. Current: 'Sombreamento' (toolbar.variation) but detailPanel.variationToolIntensity uses 'Ferramenta de Variação' / 'Intensidade da Ferramenta de Variação'. Inconsistency — recommend 'Sombreamento' everywhere the user-facing tool is named.
- **Export** → `Exportar`: INCONSISTENCY: library.exportSkin is labeled 'Baixar' (Download), while saveImage.cannotExportTitle/Message use 'exportar' and 'exportadas'. Recommend 'Exportar' wherever the source says Export; reserve 'Baixar' strictly for Download. The 'Baixar' label on exportSkin is acceptable UX but note the term divergence.

---

_Generated from the terminology workflow (English canonical + native Brazilian Portuguese localizer pass)._
