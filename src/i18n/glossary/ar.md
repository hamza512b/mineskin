# MineSkin Translation Glossary — Arabic (ar)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `ar` strings. Every concept maps to one canonical Arabic term used everywhere it appears.

**Script direction:** right-to-left (RTL). Brand names and `{{placeholders}}` stay in left-to-right Latin runs.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG`. Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin.

**Interpolation placeholders — never translate, reorder, or respell** (replaced at runtime in `src/i18n/DictionaryContext.tsx`):

| Placeholder | Meaning |
|---|---|
| `{{link}}` | An inline link element (GitHub repo, Discord, usage guide, policy, author, etc.) |
| `{{shortcuts}}` | Keyboard shortcut hint (e.g. Ctrl+Z / Ctrl+Y) |
| `{{language}}` | A language name, injected into the language-detection prompt |
| `{{date}}` | The promo end date |
| `{{count}}` | A number (max reference images allowed) |

Never change `languageSwitcher.*` endonyms. Keep files at key parity with `en.json` and valid 2-space JSON.

**Counted nouns after `{{count}}`:** Arabic number–noun agreement can't be resolved at runtime (the value is unknown), so phrase counted strings with the neutral `ما يصل إلى {{count}} + singular accusative تمييز` pattern (e.g. `يمكنك الاحتفاظ بما يصل إلى {{count}} صورة مرجعية.`) instead of a plural that would be wrong for most values.

## Voice & register

Address the user directly in the second person masculine singular (the neutral MSA default for UI), using imperative verbs for actions — this matches the current file (ارفع، عدّل، اختر، ابدأ). Tone is friendly, concise, and encouraging but still clean MSA; avoid dialect and avoid stiff bureaucratic phrasing. Keep button/toolbar labels to 1-2 words (nouns or maṣdar forms, e.g. حفظ، تراجع، تصدير) rather than full sentences. RTL: text runs right-to-left, but all interpolation placeholders ({{link}}, {{shortcuts}}, {{language}}, {{date}}) and Latin-script brand names (MineSkin, Minecraft, iOS, GitHub, Discord, PNG, Java, Hex, App Store, Google Play) stay verbatim in LTR runs; when a Latin name or placeholder begins a line, add a leading RLM/bidi mark to keep alignment correct (the file already does this, e.g. the promoBanner title). Numbers and dimensions use Western/Latin digits (64x64, 128x128, 3px) — do NOT convert to Arabic-Indic digits, matching the existing file. Punctuation: use the Arabic comma ، and Arabic question mark ؟; use Arabic quotation marks ”…“ as the file already does. Definite article: use it for standalone panel/section headings and persistent labels (المحرر، الإعدادات، البيئة) but drop it for short toggle/action verbs (حفظ، رفع، تصدير). Keep terminology identical everywhere — the current file has real drift (سكن vs مظهر, العتامة vs الشفافية, التظليل vs التنويع) that this glossary is meant to lock down.

## Canonical terms

`*(italic)*` = acceptable alternative.

### Modes

| English | ar | Notes |
|---|---|---|
| **Editor** <br><sub>Pixel-drawing mode</sub> | المحرر <br>*(محرر)* | Current common.editor = "المحرر". Matches. Use المحرر for the mode/panel heading, محرر when indefinite (e.g. محرر MineSkin PRO). |
| **Preview** <br><sub>View-only 3D mode; also "Previewer"</sub> | معاينة <br>*(المعاينة)* | Current common.preview = "معاينة"; previewer rendered as "المعاين"/"عارض". Matches. Use معاينة for the mode; العارض/المعاين for "Previewer". |
| **Editing** <br><sub>State label while editing</sub> | تحرير <br>*(جارٍ التحرير)* | Current common.editing = "تحرير". Matches. |
| **Draw Mode** <br><sub>Touch mode where gestures paint</sub> | وضع الرسم | Current toolbar.touchDrawMode = "وضع الرسم". Matches. |
| **View Mode** <br><sub>Touch mode where gestures rotate/zoom</sub> | وضع العرض | Current toolbar.touchViewMode = "وضع العرض". Matches. |

### Domain

| English | ar | Notes |
|---|---|---|
| **Skin** <br><sub>The Minecraft character texture</sub> | سكن <br>*(مظهر)* | INCONSISTENT in file: metadata/home/onboarding/importDialog use سكن/سكنات (the term the Arabic Minecraft community actually uses), but detailPanel/partFilter/library/tutorial use المظهر. Standardize on سكن (plural سكنات) to match community usage; مظهر is acceptable formal MSA but should not be mixed. |
| **Base Body** <br><sub>Base character body (keys: baseLayer, baseLayerShort)</sub> | الجسم الأساسي | partFilter.baseLayer and partFilter.baseLayerShort = "الجسم الأساسي". This is the clear Arabic label for the character's base body. |
| **Armor** <br><sub>Character armor — helmet, jacket, sleeves, pants (keys: overlayLayer, overlayLayerShort)</sub> | الدرع | partFilter.overlayLayer and partFilter.overlayLayerShort = "الدرع". Use the singular collective noun for the complete armor set. |
| **Toggle whole layer** <br><sub>Eye-button label that shows/hides every part of a layer (keys: toggleWholeLayer, toggleWholeLayerShort)</sub> | تبديل الطبقة كاملة <br>*(تبديل الكل — short display form)* | partFilter.toggleWholeLayer = "تبديل الطبقة كاملة" (canonical, screen-reader/full contexts). Follows the established "تبديل + noun" pattern of the other partFilter.toggle* strings. Compact visible button label toggleWholeLayerShort = "تبديل الكل" ("all" = every part; الطبقة implied since the button sits under a specific layer's grid). |
| **Slim mode** <br><sub>Slim (3px) arm model, aka Alex</sub> | الوضع النحيف <br>*(وضع سليم (Alex))* | Current detailPanel.slimMode = "الوضع النحيف". Matches. النحيف is clear; some community members say "سليم" (Slim) or reference Alex. |
| **Resolution** <br><sub>Texture resolution 64x64 / 128x128</sub> | الدقة <br>*(دقة السكن)* | Current changeResolution = "تغيير الدقة". Matches. |
| **Java Edition** <br><sub>Minecraft: Java Edition (product name)</sub> | إصدار Java <br>*(Minecraft: Java Edition)* | Current doubleResWarning uses "إصدار Minecraft (Java)". Keep Java in Latin; recommend إصدار Java (or the full product name Minecraft: Java Edition verbatim when space allows). |
| **Template** <br><sub>Starter skin template</sub> | قالب | Current library.templates = "القوالب". Matches (singular قالب). |

### Base Body

| English | ar | Notes |
|---|---|---|
| **Head** <br><sub>Base head part</sub> | الرأس | Current partFilter.head = "الرأس". Matches. |
| **Body** <br><sub>Torso; source uses both "Body" and "Torso"</sub> | الجسم | Current partFilter.body = "الجسم". Matches. Distinct from Torso below. |
| **Torso** <br><sub>Torso (partFilter.torso)</sub> | الجذع | Current partFilter.torso = "الجذع". Matches. Keep الجذع distinct from الجسم (Body). |
| **Left Arm** | الذراع اليسرى | Current partFilter.leftArm = "الذراع اليسرى". Matches (ذراع is feminine, hence اليسرى). |
| **Right Arm** | الذراع اليمنى | Current partFilter.rightArm = "الذراع اليمنى". Matches. |
| **Left Leg** | الساق اليسرى | Current partFilter.leftLeg = "الساق اليسرى". Matches (ساق is feminine). |
| **Right Leg** | الساق اليمنى | Current partFilter.rightLeg = "الساق اليمنى". Matches. |

### Armor

| English | ar | Notes |
|---|---|---|
| **Helmet** <br><sub>Head armor</sub> | الخوذة | Current partFilter.helmet = "الخوذة". Matches. |
| **Jacket** <br><sub>Body armor</sub> | السترة | Current partFilter.jacket = "السترة". Matches. |
| **Left Sleeve** <br><sub>Left arm armor</sub> | الكم الأيسر | Current partFilter.leftSleeve = "الكم الأيسر". Matches. |
| **Right Sleeve** <br><sub>Right arm armor</sub> | الكم الأيمن | Current partFilter.rightSleeve = "الكم الأيمن". Matches. |
| **Left Pants** <br><sub>Left leg armor</sub> | البنطال الأيسر <br>*(ساق البنطال اليسرى)* | Current partFilter.leftPants = "ساق البنطال اليسرى" (verbose). Recommend the shorter البنطال الأيسر for the armor label; keep the longer form only if the UI needs the leg distinction. |
| **Right Pants** <br><sub>Right leg armor</sub> | البنطال الأيمن <br>*(ساق البنطال اليمنى)* | Current partFilter.rightPants = "ساق البنطال اليمنى". Recommend shorter البنطال الأيمن; matches pattern of Left Pants. |

### Tools

| English | ar | Notes |
|---|---|---|
| **Color picker** <br><sub>Tool to pick a color</sub> | منتقي الألوان | Current toolbar.colorPicker and colorPicker.colorPickerTab = "منتقي الألوان". Matches and consistent. |
| **Pen tool** <br><sub>Primary per-pixel draw tool</sub> | أداة القلم | Current toolbar.penTool = "أداة القلم". Matches. |
| **Bulk paint** <br><sub>Fill/flood paint tool</sub> | الطلاء الجماعي <br>*(التعبئة)* | Current toolbar.bulkPaint = "الطلاء الجماعي". Matches. التعبئة (fill) is an acceptable shorter alternative for a flood-fill. |
| **Eraser** <br><sub>Erase pixels</sub> | الممحاة | Current toolbar.eraser = "الممحاة". Matches. |
| **Shading** <br><sub>Variation/shading tool (key: variation)</sub> | التظليل | INCONSISTENT: toolbar.variation = "التظليل" (Shading) but detailPanel.variationToolIntensity = "شدة أداة التنويع" (uses التنويع). Standardize on التظليل everywhere for this tool. |
| **Dither** <br><sub>Dither brush</sub> | التنقيط | Current toolbar.dither = "تنقيط". Matches. Note this is also used for the Dither brush (فرشاة التنقيط). |
| **Symmetry** <br><sub>Mirror painting</sub> | التناظر | Current toolbar.symmetry = "تناظر". Matches. Use التناظر with article for the toggle label. |
| **Brush** <br><sub>Brush / Brushes</sub> | الفرشاة <br>*(الفرش (plural: Brushes))* | Current toolbar.brush = "فرشاة", brushes = "الفرش". Matches. |
| **Grid** <br><sub>Pixel grid overlay (also an environment name)</sub> | الشبكة | Current toolbar.grid = "الشبكة" and environmentGrid = "شبكة". For the pixel-grid overlay tool use الشبكة (the same word also serves the environment name). |
| **Look at Cursor** <br><sub>Camera-follow-cursor toggle</sub> | النظر إلى المؤشر <br>*(تتبع المؤشر)* | Current toolbar.lookAtCursor = "النظر إلى المؤشر". Matches. تتبع المؤشر (follow cursor) is a slightly more descriptive alternative. |

### Brush params

| English | ar | Notes |
|---|---|---|
| **Opacity** | العتامة | INCONSISTENT: toolbar.opacity = "العتامة" (correct = opacity) but colorPicker.opacity = "الشفافية" (= transparency, the inverse). Standardize on العتامة for Opacity. |
| **Intensity** | الشدة | Current toolbar.intensity = "الشدة". Matches. |
| **Radius** | نصف القطر | Current toolbar.radius = "نصف القطر". Matches. |
| **Size** | الحجم | Current toolbar.size = "الحجم". Matches. |
| **Shape** | الشكل | Current toolbar.shape = "الشكل". Matches. |
| **Square** | مربع | Current toolbar.square = "مربع". Matches. |
| **Circle** | دائرة | Current toolbar.circle = "دائرة". Matches. |

### Color

| English | ar | Notes |
|---|---|---|
| **Palette** <br><sub>Saved/used colors</sub> | لوحة الألوان <br>*(اللوحة)* | Current colorPicker.paletteTab = "اللوحة" (bare). Recommend لوحة الألوان for clarity; اللوحة acceptable where space is tight and context is clear. |
| **Hue** | درجة اللون <br>*(الصبغة)* | Current colorPicker.hue = "درجة اللون". Matches. |
| **Saturation** | التشبع | Current colorPicker.saturation = "التشبع". Matches. |
| **Lightness** | الإضاءة <br>*(السطوع)* | Current colorPicker.lightness = "السطوع" — but السطوع is also used for Brightness (surfaceBrightness/overallBrightness), causing overlap. Recommend الإضاءة for the HSL Lightness component to keep it distinct from Brightness = السطوع. Flag: current file conflates the two. |
| **Value** <br><sub>HSV value component</sub> | القيمة | Current colorPicker.saturationValueSelector uses "القيمة" (HSV value). Matches. |
| **Hex Code** | كود Hex <br>*(الكود السداسي)* | Current colorPicker.hexCode = "كود Hex". Matches (keep Hex in Latin). الكود السداسي is a fully-Arabic alternative. |
| **Swatch** <br><sub>A single color chip in a palette strip</sub> | عيّنة لون <br>*(عيّنة)* | No visible string yet (the swatch strip is labeled by `reference.imageColors` / `reference.allColors`). Use عيّنة لون if a swatch ever needs a label; do not use مربع أو رقعة. |

### Reference

The Reference panel lets the user import photos/artwork and tap them to sample colors into the brush.

| English | ar | Notes |
|---|---|---|
| **Reference** <br><sub>Panel title (`reference.title`)</sub> | المرجع | Standalone panel heading, so it takes the definite article per the register rules. Keep مرجع as the single noun for an imported source image everywhere in this panel. |
| **Reference image** <br><sub>An imported source image (`toolbar.reference`, `reference.add`, `reference.pickFromImage`)</sub> | صورة مرجعية <br>*(الصور المرجعية — plural)* | toolbar.reference = "الصور المرجعية", reference.add = "إضافة صورة مرجعية". Indefinite صورة مرجعية when referring to one image; الصور المرجعية for the collection. Do NOT use صورة مرجع or صورة استرشادية. |
| **References** <br><sub>All imported reference images (`reference.allColors`, `reference.allReferences`)</sub> | المراجع <br>*(كل المراجع)* | reference.allReferences = "كل المراجع", allColors = "ألوان كل المراجع". مرجع/مراجع is the short form of صورة مرجعية used once the panel context is established. |
| **Pick a color** <br><sub>Sampling a color off the reference image</sub> | انتقاء لون | Uses the same root as منتقي الألوان (Color picker) — keep انتقى/انتقاء for sampling, not اختيار (generic choosing) or التقاط. |
| **Remove reference** | إزالة المرجع | reference.remove. Matches the إزالة pattern of feedback.removeScreenshotButtonLabel; keep distinct from حذف (Delete, used for library skins). |
| **Reference removed** <br><sub>Passive toast confirmation after deleting a reference image, paired with an Undo action (`reference.removed`)</sub> | تمت إزالة المرجع | reference.removed. First "action done" toast in the file — establishes the تمّ/تمت + مصدر passive-confirmation pattern (تمت agrees with the feminine مصدر إزالة) for short post-action toasts, as distinct from the imperative verbs used for buttons/menu actions. Reuses إزالة المرجع from Remove reference above; do not switch to حذف. |
| **Loading** <br><sub>Reference image still decoding</sub> | جارٍ التحميل | reference.loading. Matches the جارٍ + maṣdar progressive pattern already used by recorder.recording ("جارٍ التسجيل…"). |
| **Zoom** <br><sub>Zooming into the reference photo (`reference.zoomIn`, `reference.zoomOut`, `reference.resetZoom`)</sub> | تكبير / تصغير <br>*(التكبير — the noun for the zoom level)* | Zoom in = تكبير, Zoom out = تصغير: bare maṣdar with no article, per the short action-label rule. Reset zoom = إعادة تعيين التكبير, combining Reset = إعادة تعيين with the definite noun التكبير for the zoom level. Matches tutorial.touchDrawModeContent, which already renders "zoom the model" as تكبيره. Do NOT use تقريب/تبعيد or the transliteration زوم. |

### Actions

| English | ar | Notes |
|---|---|---|
| **Undo** | تراجع | Current toolbar.undo = "تراجع". Matches. |
| **Redo** | إعادة | Current toolbar.redo = "إعادة". Matches. |
| **Save** | حفظ | Current common.save = "حفظ". Matches. |
| **Cancel** | إلغاء | Current common.cancel = "إلغاء". Matches. |
| **Reset** | إعادة تعيين | Current common.reset = "إعادة تعيين". Matches. |
| **Upload** | رفع | Current common.upload = "رفع". Matches. |
| **Download** | تنزيل | Current recorder.download and library.exportSkin = "تنزيل". Matches. Keep تنزيل for Download, distinct from تصدير (Export). |
| **Import** | استيراد | Current importDialog.import = "استيراد". Matches. |
| **Export** <br><sub>Used for "export skin"</sub> | تصدير | Current saveImage.cannotExport* uses "تصدير". Matches. Note library.exportSkin is labeled تنزيل because its English is "Download" there — keep Export = تصدير distinct from Download = تنزيل. |
| **Screenshot** | لقطة شاشة | Current toolbar.screenshot = "لقطة شاشة". Matches. |
| **Record clip** <br><sub>Record a shareable video</sub> | تسجيل مقطع | Current toolbar.recordClip = "تسجيل مقطع". Matches. |
| **Share** | مشاركة | Current recorder.share = "مشاركة الفيديو", shareImage = "مشاركة الصورة". Base verb مشاركة matches. |
| **Discard** | تجاهل | Current recorder.discard = "تجاهل". Matches. Keep distinct from إلغاء (Cancel). |

### Animation

| English | ar | Notes |
|---|---|---|
| **Idle animation** | حركة السكون | Current toolbar.idleAnimation = "حركة السكون". Matches. |
| **Walking animation** | حركة المشي | Current toolbar.walkingAnimation = "حركة المشي". Matches. |
| **No Animation** | بدون حركة | Current toolbar.noAnimation = "بدون حركة". Matches. Note animations set = الرسوم المتحركة. |

### Camera

| English | ar | Notes |
|---|---|---|
| **Field Of View** <br><sub>FOV</sub> | مجال الرؤية | Current detailPanel.fieldOfView = "مجال الرؤية". Matches. |
| **Movement Speed** | سرعة الحركة | Current detailPanel.movementSpeed = "سرعة الحركة". Matches. |
| **Damping** <br><sub>Camera inertia damping</sub> | التخميد | Current detailPanel.damping = "التخميد". Matches. |

### Light

| English | ar | Notes |
|---|---|---|
| **Main Light** <br><sub>Key/directional light</sub> | الضوء الرئيسي | Current detailPanel.mainLight = "الضوء الرئيسي". Matches. |
| **Ambient Light** <br><sub>Overall Brightness (Ambient Light)</sub> | الإضاءة المحيطة | Current appears inside overallBrightness = "السطوع العام (الإضاءة المحيطة)". Matches. |
| **Surface Brightness** | سطوع السطح | Current detailPanel.surfaceBrightness = "سطوع السطح". Matches. |
| **Shine/Glossiness** <br><sub>Specular</sub> | اللمعان/البريق | Current detailPanel.shineGlossiness = "اللمعان/البريق". Matches. |
| **Overall Brightness** | السطوع العام | Current detailPanel.overallBrightness = "السطوع العام (الإضاءة المحيطة)". Matches. Uses السطوع for Brightness — pairs with Lightness = الإضاءة recommendation to avoid overlap. |

### Environment

| English | ar | Notes |
|---|---|---|
| **Environment** <br><sub>3D world/atmosphere</sub> | البيئة | Current detailPanel.environment = "البيئة". Matches. |
| **Grassland Day** <br><sub>Environment name</sub> | مرج نهاري | Current environmentGrassland = "مرج نهاري". Matches. |
| **Arena** <br><sub>Sci-fi arena environment (NOT "sand")</sub> | الساحة <br>*(ساحة)* | Current environmentScifi = "ساحة". Matches — correctly the sci-fi arena, NOT رمل/sand. Use الساحة as the environment label. |
| **Empty** <br><sub>No environment</sub> | فارغ | Current environmentEmpty and library.newEmpty = "فارغ". Matches. |

### Library

| English | ar | Notes |
|---|---|---|
| **Library** <br><sub>Saved skins collection</sub> | المكتبة | Current library.title = "المكتبة". Matches. |
| **New Skin** | سكن جديد <br>*(مظهر جديد)* | Current library.newSkin = "مظهر جديد". Should become سكن جديد to align with the recommended Skin = سكن. Flag: currently uses مظهر. |
| **Templates** | القوالب | Current library.templates = "القوالب". Matches. |
| **Changelog** | سجل التغييرات | Current changelog.title = "سجل التغييرات". Matches. |
| **Settings** | الإعدادات | Current common.settings = "الإعدادات". Matches. |
| **Appearance** <br><sub>theme.label — field label above the color-theme (System/Light/Dark) dropdown</sub> | المظهر | theme.label = "المظهر". Register matches languageSwitcher.language = "اللغة" (bare noun with definite article). Note: مظهر here means the app's visual theme/appearance, a distinct concept from Skin (= سكن) — do not conflate. |

## Consistency watch-list

Terms with known drift in the current file — keep these locked to the recommended form:

- **Skin** → `سكن`: INCONSISTENT in file: metadata/home/onboarding/importDialog use سكن/سكنات (the term the Arabic Minecraft community actually uses), but detailPanel/partFilter/library/tutorial use المظهر. Standardize on سكن (plural سكنات) to match community usage; مظهر is acceptable formal MSA but should not be mixed.
- **Shading** → `التظليل`: INCONSISTENT: toolbar.variation = "التظليل" (Shading) but detailPanel.variationToolIntensity = "شدة أداة التنويع" (uses التنويع). Standardize on التظليل everywhere for this tool.
- **Opacity** → `العتامة`: INCONSISTENT: toolbar.opacity = "العتامة" (correct = opacity) but colorPicker.opacity = "الشفافية" (= transparency, the inverse). Standardize on العتامة for Opacity.
- **Lightness** → `الإضاءة`: Current colorPicker.lightness = "السطوع" — but السطوع is also used for Brightness (surfaceBrightness/overallBrightness), causing overlap. Recommend الإضاءة for the HSL Lightness component to keep it distinct from Brightness = السطوع. Flag: current file conflates the two.
- **New Skin** → `سكن جديد`: Current library.newSkin = "مظهر جديد". Should become سكن جديد to align with the recommended Skin = سكن. Flag: currently uses مظهر.

---

_Generated from the terminology workflow (English canonical + native Arabic localizer pass)._
