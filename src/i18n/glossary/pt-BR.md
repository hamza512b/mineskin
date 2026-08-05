# MineSkin Translation Glossary — Brazilian Portuguese (pt-BR)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `pt-BR` strings. Every concept maps to one canonical Brazilian Portuguese term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG`. Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin.

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
