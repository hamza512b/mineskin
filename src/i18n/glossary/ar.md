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

**Keyboard key names stay verbatim in Latin** (`Ctrl`, `Shift`, `Enter`, `⌘`, and combinations such as `Ctrl + Y` / `⌘ + Shift + Z`) — this is how `tutorialSteps` builds the strings injected into `{{shortcuts}}`.

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
| **Swatch** <br><sub>A single color chip in a palette strip</sub> | عيّنة لون <br>*(عيّنة)* | No visible string yet (the swatch strip is labeled by `reference.imageColors`). Use عيّنة لون if a swatch ever needs a label; do not use مربع أو رقعة. |

### Reference

The Reference panel lets the user import photos/artwork and tap them to sample colors into the brush.

| English | ar | Notes |
|---|---|---|
| **Reference** <br><sub>Panel title (`reference.title`)</sub> | المرجع | Standalone panel heading, so it takes the definite article per the register rules. Keep مرجع as the single noun for an imported source image everywhere in this panel. |
| **Reference image** <br><sub>An imported source image (`toolbar.reference`, `reference.add`, `reference.pickFromImage`)</sub> | صورة مرجعية <br>*(الصور المرجعية — plural)* | toolbar.reference = "الصور المرجعية", reference.add = "إضافة صورة مرجعية". Indefinite صورة مرجعية when referring to one image; الصور المرجعية for the collection. Do NOT use صورة مرجع or صورة استرشادية. |
| **Pick a color** <br><sub>Sampling a color off the reference image</sub> | انتقاء لون | Uses the same root as منتقي الألوان (Color picker) — keep انتقى/انتقاء for sampling, not اختيار (generic choosing) or التقاط. |
| **Remove reference** | إزالة المرجع | reference.remove. Matches the إزالة pattern of feedback.removeScreenshotButtonLabel; keep distinct from حذف (Delete, used for library skins). |
| **Reference removed** <br><sub>Passive toast confirmation after deleting a reference image, paired with an Undo action (`reference.removed`)</sub> | تمت إزالة المرجع | reference.removed. First "action done" toast in the file — establishes the تمّ/تمت + مصدر passive-confirmation pattern (تمت agrees with the feminine مصدر إزالة) for short post-action toasts, as distinct from the imperative verbs used for buttons/menu actions. Reuses إزالة المرجع from Remove reference above; do not switch to حذف. |
| **Loading** <br><sub>Reference image still decoding</sub> | جارٍ التحميل | reference.loading. Matches the جارٍ + maṣdar progressive pattern already used by recorder.recording ("جارٍ التسجيل…"). |
| **Take a photo** <br><sub>Capturing a new photo with the device camera to use as a reference (`native.cameraUsageDescription`)</sub> | التقط صورة <br>*(التقاط صورة — maṣdar form)* | التقاط is the standard verb for capturing a photo and is reserved for that meaning only — never use it for sampling a color off an image (that stays انتقاء, see **Pick a color** above). Use صورة, not لقطة (لقطة شاشة = Screenshot). The captured photo then becomes a صورة مرجعية. |
| **Zoom** <br><sub>Zooming into the reference photo (`reference.zoomIn`, `reference.zoomOut`, `reference.resetZoom`)</sub> | تكبير / تصغير <br>*(التكبير — the noun for the zoom level)* | Zoom in = تكبير, Zoom out = تصغير: bare maṣdar with no article, per the short action-label rule. Reset zoom = إعادة تعيين التكبير, combining Reset = إعادة تعيين with the definite noun التكبير for the zoom level. Matches tutorial.touchDrawModeContent, which already renders "zoom the model" as تكبيره. Do NOT use تقريب/تبعيد or the transliteration زوم. |
| **Zoomed in** <br><sub>State of the reference image once it is larger than fit size (`reference.pickFromImageZoomed`)</sub> | مُكبَّرة | Passive participle of the same تكبير root, agreeing with the feminine صورة (صورة مرجعية مُكبَّرة). Keep the shadda/vowel marks so it is not misread as the active مُكبِّرة. Do NOT use مقرّبة or متضخّمة. |
| **Pan** <br><sub>Dragging a zoomed reference image to move which part of it is visible (`reference.pickFromImageZoomed`, `reference.panHint*`)</sub> | تحريك <br>*(تحريك الصورة — when the object needs spelling out)* | Bare maṣdar تحريك for the short hint pill (اسحب للتحريك); spell the object out as تحريك الصورة in the fuller aria-label. Distinct from تدوير (rotating the 3D model) and from التصويب (aiming the picker before release, `reference.pickFromImage`). Do NOT use سحب الصورة (سحب is the gesture, not the result), إزاحة, or the transliteration بان. |
| **Drag** <br><sub>Press-and-move gesture (`reference.pickFromImage`, `reference.panHint*`, `importDialog.dropzoneText`)</sub> | اسحب <br>*(السحب — maṣdar)* | Imperative اسحب per the register rules; already used by reference.pickFromImage and importDialog.dropzoneText (اسحب وأسقط = drag & drop). |
| **Tap vs. Click** <br><sub>Touch-input hint vs. mouse-input hint — the app ships both variants of the same string (`reference.panHintTouch` / `reference.panHintMouse`)</sub> | اضغط (Tap) / انقر (Click) | The two English verbs must stay distinguishable in Arabic because the UI picks between them by input device. Tap (finger) = اضغط, matching common.modeSwitchHintBody ("Tap to switch" = اضغط للتبديل). Click (mouse) = انقر, matching importDialog.dropzoneText and tutorial.partFilterMobileContent. Never swap them, and never use المس or لمسة. colorPicker.tapToConfirm = "اضغط للتأكيد" — matches, and note it is the touch-only branch of a ternary whose mouse counterpart is colorPicker.pressEnterToConfirm, so it must stay اضغط. |

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
| **Copy** <br><sub>Copy-to-clipboard button (`home.copyEmail`, `home.copyEmailLabel`)</sub> | نسخ | Bare maṣdar per the short action-label rule. Full aria-label spells the object out: نسخ عنوان البريد الإلكتروني (Copy email address), reusing البريد الإلكتروني from feedback.emailLabel. |
| **Copied** <br><sub>Post-copy confirmation state on the same button (`home.copiedEmail`)</sub> | تم النسخ | Follows the تمّ + مصدر passive-confirmation pattern established by reference.removed (تمت إزالة المرجع); تم (masculine) agrees with the masculine مصدر نسخ. |

### Open source / GitHub

| English | ar | Notes |
|---|---|---|
| **Open source** <br><sub>`home.openSourceHeading`</sub> | مفتوح المصدر | Standard Arabic dev-community term. The heading starts with the Latin brand name, so it takes a leading RLM (`‏MineSkin مفتوح المصدر.`) like promoBanner.title. |
| **Star** <br><sub>GitHub star action — label on the button that opens the repo (`home.githubStar`)</sub> | أضف نجمة <br>*(نجمة)* | GitHub's star, not the astronomy sense — نجمة is what Arabic-speaking developers say ("أضف نجمة للمستودع"). Imperative + noun, matching the imperative action-label register. Do NOT use نجم، كوكب، تمييز بنجمة، or المفضلة. |
| **Stargazers** <br><sub>Accessible label on the star-count link (`home.githubStargazers`)</sub> | عدد النجوم على GitHub | The link shows a count, so the count reading (عدد النجوم) is clearer in Arabic than a coined agent noun. Keep نجوم as the plural of the same نجمة term above; do not invent مُنجِّمون/المراقبون. |

### Animation

| English | ar | Notes |
|---|---|---|
| **Idle animation** | حركة السكون | Current toolbar.idleAnimation = "حركة السكون". Matches. |
| **Walking animation** | حركة المشي | Current toolbar.walkingAnimation = "حركة المشي". Matches. |
| **No Animation** | بدون حركة | Current toolbar.noAnimation = "بدون حركة". Matches. Note animations set = الرسوم المتحركة. |

### Posing

| English | ar | Notes |
|---|---|---|
| **Pose** <br><sub>Noun — the character's limb positions (`toolbar.poseMode`, `toolbar.resetPose`)</sub> | الوضعية <br>*(وضعية)* | الوضعية is the term Arabic art/photography/3D usage already has for a figure's pose, and its tā marbūṭa keeps it distinct from وضع = "mode" (وضع الرسم / وضع العرض). Do NOT use تحريك/حركة for this concept: حركة is already locked to Animation (حركة السكون، حركة المشي، الرسوم المتحركة) and posing is not animating. |
| **Pose** <br><sub>Verb — "to pose a limb", i.e. rotate it around its joint</sub> | تغيير الوضعية <br>*(ضبط الوضعية)* | Built on the same noun so the mode label, the hint and the reset button all read as one feature. Used pronoun-free (لتغيير الوضعية, not لتغيير وضعيتها) because the sentence lists mixed-gender parts — ذراع/ساق are feminine, الرأس masculine. |
| **Pose Limbs** <br><sub>Toolbar toggle that turns limb posing on (`toolbar.poseMode`)</sub> | وضعية الأطراف | Noun phrase, matching how the other toolbar modes are labelled (وضع الرسم، وضع العرض) rather than an imperative; two words, fits the narrow vertical rail under the icon. |
| **Reset Pose** <br><sub>Button returning every limb to its default rest position (`toolbar.resetPose`)</sub> | إعادة تعيين الوضعية | Reuses the canonical Reset = إعادة تعيين from Actions, plus the canonical الوضعية. Affects the joints only — it never moves the figure through the scene; that is **Reset Position** below, and the two labels sit stacked in the same panel, so they must stay tellable apart at a glance. |
| **Model position** <br><sub>Where the whole model sits in the scene and which way it faces — the transform the **Center ring** applies, as opposed to the joint angles that make up the **Pose**</sub> | موضع النموذج | Two distinct concepts the Arabic must not blur: الوضعية is how the limbs are bent, موضع النموذج is where the whole figure stands and which way it looks. موضع (a place occupied) is the standard technical term for a position in space and stays singular and construct-bound to النموذج, the file's established word for the viewport model (tutorial.touchDrawModeContent, and مركز النموذج in the pose hints) — naming النموذج is what makes the whole-object scope visible in a short label. Do NOT use الموقع (already this file's word for the *website*, home.supportDescription = "استخدم الموقع…"), المكان (vague, non-technical), or المكانة. |
| **Reset Position** <br><sub>Button returning the whole model to the scene origin facing forward (`toolbar.resetPosition`), the sibling of Reset Pose in the pose panel</sub> | إعادة تعيين موضع النموذج | Same canonical Reset = إعادة تعيين as its sibling, so the pair reads as one feature, with **Model position** = موضع النموذج carrying the contrast. The word النموذج is load-bearing and must not be trimmed for length: without it the label reads إعادة تعيين الموضع, which sits one root away from إعادة تعيين الوضعية (both و-ض-ع) and is misread as the pose reset when the two buttons are stacked. The panel is 280px wide with the buttons full-width, so the four-word label fits. Do NOT use إعادة تعيين الوضع (= "reset the mode/state", and وضع is locked to *mode*: وضع الرسم / وضع العرض) or إعادة النموذج إلى المركز (drops the facing half of what the button resets). |
| **Limb** <br><sub>A draggable arm/leg (the head is posed the same way but is not a limb)</sub> | طرف <br>*(الأطراف — plural)* | Standard anatomical term covering arms and legs together, so it needs no enumeration in short labels. Keep the individual parts on their Base Body names (الذراع، الساق، الرأس) when the string names them. |
| **Double-click** <br><sub>Mouse gesture in a hint</sub> | انقر نقرًا مزدوجًا | Cognate-accusative form, the standard MSA rendering; builds on the existing انقر used for single click (tutorial.partFilterMobileContent، importDialog.dropzoneText). |
| **Drag** <br><sub>Pointer drag gesture</sub> | اسحب | Already the file's verb for dragging (importDialog.dropzoneText = "اسحب وأسقط…"). Imperative, per the hint register. |
| **Select a limb (show its gizmo)** <br><sub>The first half of every pose hint: clicking a limb (mouse) or tapping its **Handle** (touch) selects it and brings up the gizmo — "Click a limb for its axis arrows", "Tap a limb's handle for its twist rings" (`toolbar.poseModeHint*`, `toolbar.poseTwistHint*`)</sub> | لإظهار + the gizmo <br>*(انقر على طرف لإظهار… / اضغط على مقبض الطرف لإظهار…)* | English compresses this to the bare preposition "for its …"; Arabic needs the purpose spelled out, and لإظهار (maṣdar of أظهر after لـ) is the file's existing way of saying "so that X appears". Do NOT render it as لتحديد الطرف/لاختياره: selection is invisible plumbing, what the user is told to look for is the gizmo appearing. Keep the two-step shape of the sentence — selection clause, ثم, drag clause — in all four strings; ثم is load-bearing, since the whole point of the rework is that these are two separate gestures. |
| **Handle** <br><sub>The small camera-facing marker the user clicks/taps to *select* something — one at each limb's free end (the hand, the foot, the crown of the head) and one at the model's centre. Selecting is all it does: the actual posing happens afterwards, by dragging the gizmo that appears (`toolbar.poseModeHint*`, `toolbar.poseTwistHint*`)</sub> | المقبض <br>*(مقبض الطرف — "a limb's handle", the form the touch hints use)* | SUPERSEDES the earlier rendering الحلقة. The handle is no longer the thing that poses the limb, and الحلقة is now needed for the **Twist ring** gizmo that appears *after* selection — one word for both would make the twist hints say "tap the ring for its rings". المقبض is the plain Arabic for a grip/handle and is what Arabic 3D UI usage takes for a gizmo handle; two extra characters over الحلقة, which the ~208px popover still absorbs. Definite المقبض on second mention (the one the user just touched), construct مقبض الطرف on first mention in the touch strings, mirroring the English "a limb's handle". Do NOT use الحلقة (now = **Twist ring** / the centre gizmo under Twist), دائرة (reserved for the Circle brush shape, toolbar.circle), or the calque هاندل. |
| **Center handle / Center ring** <br><sub>The one gizmo that does not belong to a limb: it sits at the model's centre (its centre of mass) and carries the entire skin — sliding it through the scene under **Move**, turning it on the spot under **Twist**. The English names it per tool: "the handle at the model's center" under Move, "the ring at the model's center" under Twist (`toolbar.poseModeHint*`, `toolbar.poseTwistHint*`)</sub> | المقبض عند مركز النموذج (Move) <br>الحلقة عند مركز النموذج (Twist) | Follow the English and switch the noun with the tool: **Handle** = المقبض in the two `poseModeHint*` strings, **Twist ring** = الحلقة in the two `poseTwistHint*` strings — under Twist the centre gizmo really is a ring and reads as one family with the limbs' twist rings. The frame عند + place is fixed in both, so the centre gizmo always contrasts audibly with the per-limb one. Gender agreement follows whichever noun is in play: انقر عليه / اضغط عليه (masculine المقبض) under Move, انقر عليها / اضغط عليها (feminine الحلقة) under Twist — see **Recenter** and **Face forward again**. النموذج is already this file's word for the viewport model (tutorial.touchDrawModeContent: تدوير النموذج وتكبيره), so مركز النموذج needs no gloss; مركز is the plain geometric centre. SUPERSEDES the earlier حلقة الصدر: the gizmo no longer rides the chest/torso and no longer leans the figure from the waist. Do NOT use حلقة الصدر, الجذع/الجسم (those are the base-body part labels `partFilter.torso` / `partFilter.body`, and this gizmo is not a body part at all), المقبض المركزي, or المجسم. |
| **Twist ring** <br><sub>The new gizmo under **Twist** — three rings around a limb's joint, one per axis, shown once the limb is selected; dragging one turns the limb about that axis (`toolbar.poseTwistHint`, `toolbar.poseTwistHintTouch`)</sub> | حلقة اللَيّ <br>*(حلقات اللَيّ — the set of three, as the hints name it)* | Built on **Twist** = لَيّ so the tile (لَيّ) and the hint (حلقات اللَيّ) read as one feature, and on الحلقة, which the ring shape makes obvious on screen. Keep the diacritics on اللَيّ, as on the tile label. The Twist twin of **Axis arrow**: arrows displace a limb's end, rings rotate the limb — the two hints are otherwise parallel sentences, so the gizmo noun is the only word carrying the difference and must not be blurred into a generic مقبض. Reference one of the three as إحدى الحلقات (اسحب إحدى الحلقات), matching أحد الأسهم on the Move side. Do NOT use دائرة (Circle brush shape), حلقة الدوران, or طوق. |
| **The whole skin** <br><sub>Everything the centre ring carries with it — the entire character, moved or turned as one object, as opposed to the single limb every other handle affects (`toolbar.poseModeHint*`, `toolbar.poseTwistHint*`)</sub> | السكن بأكمله | Uses canonical **Skin** = سكن, following the English, which switched from "the whole body" to "the whole skin" when the handle stopped being a waist-lean and became a whole-object transform — الجسم بأكمله is therefore RETIRED here (it now reads as the torso being posed, exactly the wrong idea). بأكمله carries the English *whole* and must not be dropped: without it the clause collapses into "the ring moves the skin", losing the contrast with the single limb. Placed after the verb (تُحرّك السكن بأكمله), not as كل السكن, which reads as a quantifier rather than emphasis. The two verbs: move/translate = **يُحرّك** and turn = **يُدير**, both taken from the sliders in `detailPanel` that perform the identical transforms — moveLeftRight/moveForwardBack/moveUpDown = تحريك يسار/يمين… and turnLeftRight = دوران يسار/يمين — so the ring and the sliders read as one feature. CONFLICT NOTE (تحريك): the **Pan** row locks تحريك to dragging a reference image and the **Swing** / **Axis arrow** / **Move (tool)** rows ban it for limb gestures; all of that stands, because those are rotations or a single limb-end displacement (which stays إزاحة). تحريك is admitted here and only here inside Posing, for the one gesture that genuinely translates the whole object — the same sense the detailPanel sliders already give it. CONFLICT NOTE (تدوير): the **Twist** row bans the maṣdar تدوير as a *term* (it names rotating the whole model in the viewport) and that stands — never label the tool تدوير — but the finite verb يُدير is correct in this clause, since the figure genuinely turns on the spot rather than twisting about a limb's own axis. Do NOT render "the whole skin" as الشخصية, الهيكل, or النموذج بأكمله (النموذج is reserved for naming the centre's location, above). |
| **Joint** <br><sub>The pivot the limb rotates about — shoulder, hip, neck — which stays fixed while the limb is aimed</sub> | المفصل | Standard anatomical term for an articulation, and the term Arabic 3D/rigging usage takes for a rig joint. Deliberately NOT الطرف (**Limb**): the joint is the fixed pivot, the limb is the moving part that swings from it, and the whole point of the hint is that one stays put while the other moves — collapsing them makes the sentence meaningless. Also not المفصلة (a door hinge) or النقطة/المحور. |
| **Aim (verb)** <br><sub>Dragging so a limb's end follows the pointer while the joint stays fixed. NO LONGER a gesture in the app: a limb's end is now displaced one axis at a time by the **Axis arrow**s, so no pose hint says "aim" any more. Survives only as the sense behind the **Move (tool)** tile label</sub> | التصويب <br>*(صوّب — imperative form)* | Still the app's word for the same English verb elsewhere — reference.pickFromImage ("Drag to aim" = "اسحب للتصويب") — so keep it there. RETIRED from `toolbar.poseModeHint*`: those strings now describe selecting a limb and dragging an arrow, and any surviving للتصويب in them is stale text for a free drag-to-aim gesture the app no longer has (the displacement result is إزاحة, see **Axis arrow**). Maṣdar after لـ (للتصويب) and pronoun-free, per the **Pose (verb)** rule about mixed-gender parts (ذراع/ساق feminine, الرأس masculine). |
| **Swing (verb)** <br><sub>Dragging the limb's body itself to rotate it freely about its joint. NOT a gesture in the app any more and named in no string: limbs are posed only through the gizmos (**Axis arrow**s / **Twist ring**s) after being selected</sub> | التأرجح <br>*(أرجحة)* | Kept only as a reserved term should a future string need to name a direct, un-targeted limb drag. Maṣdar after لـ (للتأرجح), pronoun-free like the other posing verbs. Do NOT use تحريك (locked to Pan) or حركة (locked to Animation). Also keep it off **Twist** = لَيّ: Twist is a shipped tool while Swing is only reserved, so التأرجح stays unused in the strings and must never be borrowed to render Twist. |
| **Move (tool)** <br><sub>The tile in the pose panel naming the axis-slide tool: selecting a limb shows three **Axis arrow**s at its free end and dragging one slides that end along that axis, while the **Center handle** moves the whole skin through the scene (`toolbar.poseMove`)</sub> | تصويب <br>*(توجيه)* | Bare maṣdar with no article, per the short toggle/action-label rule (حفظ، رفع، تصدير) and short enough for the ~120px tile. The label is inherited from when the tool's limb gesture was a free drag-to-aim; that gesture is gone (see **Aim**), but تصويب still reads correctly as "pointing the limb where you want it" and the tile has shipped under that name, so it stays for now — REVIEW it if the tile is ever relabelled upstream, since the hint below it no longer contains the word التصويب. CONFLICT NOTE: تحريك as the tile's *term* is still REJECTED — تحريك is locked to **Pan** (see Reference), and both the **Swing** and **Axis arrow** rows forbid it for limb gestures; the axis-arrow drag result stays إزاحة, and تحريك is admitted inside Posing only for the whole-skin translation (see **The whole skin**). Do NOT use نقل (relocating an object wholesale, which is not what happens to a limb — the joint never moves) or the bare حركة (locked to Animation). |
| **Twist (tool / verb)** <br><sub>The rotate tool: selecting a limb rings its joint with three **Twist ring**s and dragging one turns the limb about that axis, e.g. turning a palm outwards (`toolbar.poseTwist`, `toolbar.poseTwistHint`, `toolbar.poseTwistHintTouch`)</sub> | لَيّ <br>*(تلوية — form II maṣdar, used when the string needs an object: لتلوي الطرف)* | Root ل-و-ي is the Arabic of torsion proper (عزم اللَّيّ = torque), and لوى الذراع is the everyday way to say twisting an arm, so it lands the sense with no gloss. Tile label keeps the diacritics (لَيّ) so it is not misread as the preposition لي; inside sentences the form II object-bearing form is used because لِلَيِّه is unreadable — same root, so the tool name and the hint still read as one term (the same tolerance the file already grants تصويب/صوّب). Spell the object out as لتلوي الطرف rather than the pronoun لتلويه: the hints now put حلقات اللَيّ (and, in the touch strings, مقبض الطرف) between the verb and its antecedent, so a bare ـه would attach to the wrong noun. The axis is named as ذلك المحور — the axis of the ring being dragged — reusing **Axis** = المحور; the older محوره ("its own axis") described the single-axis roll the tool had before the rings and is stale. Keep it lexically clear of every neighbouring term: NOT تدوير (reserved for rotating the whole model), NOT تحريك (locked to **Pan**), NOT حركة (locked to Animation), NOT التصويب (**Aim** / **Move**), and NOT الوضعية (**Pose**, the umbrella noun for the whole feature). CONFLICT NOTE: the reserved **Swing** term التأرجح must stay off this row — it is kept for a possible future un-targeted joint-drag gesture and must never be borrowed to render Twist. |
| **Axis** <br><sub>One of the three world axes the limb's end can be pushed along (`toolbar.poseModeHint*`)</sub> | المحور <br>*(المحاور — plural)* | Standard Arabic maths/3D term; “along that axis alone” renders as على امتداد ذلك المحور وحده (على امتداد reads as *along* far better than the bare على, and وحده carries the "one axis only" constraint). CONFLICT NOTE: the **Joint** row rejects المحور as a rendering of *joint* — that stays true; المحور is now reserved exclusively for *axis*, and the joint keeps المفصل. Do NOT use الإحداثي (coordinate) or الاتجاه (direction). |
| **Axis arrow** <br><sub>The straight-arrow gizmo under **Move** — three of them, one per axis — shown at a limb's free end once the limb is selected, and dragged to slide that end along one axis (`toolbar.poseModeHint*`)</sub> | سهم المحور <br>*(أسهم المحاور — the set of three, as the hints name it)* | Two short words, so the ~208px hint popover still fits; مقبض المحور ("axis handle") is the sense but سهم matches what the user actually sees on screen. Deliberately NOT المقبض (**Handle**): the handle only *selects* the limb, the arrows are what the user then drags — the hints name them one after the other in the same sentence, so one word for both would make the string circular. Reference one of the three as أحد الأسهم (اسحب أحد الأسهم), matching إحدى الحلقات on the Twist side. The drag result is إزاحة (displacement along the axis), NOT تحريك, which is locked to Pan (see **Pan** in Reference) and — inside Posing — to the whole-skin translation of the **Center handle** alone (see **The whole skin**); one limb-end being pushed along an axis is never تحريك. تدوير stays with rotation. Do NOT use مؤشر (pointer/cursor), رأس سهم, or the calque جيزمو. |
| **Collision / stop where limbs meet** <br><sub>Behaviour, not a toggle: a limb stops when it runs into another body part. Named in no current string — `toolbar.poseModeHint*` dropped the closing sentence; kept as a reserved term</sub> | تتوقف الأطراف عند ملامسة جزء آخر من الجسم <br>*(التلامس / التصادم — the noun, if a label ever needs one)* | Stated as a plain present-tense fact (تتوقف…), matching the English's declarative closing sentence — do not turn it into an imperative or a setting-style label, there is nothing for the user to switch. ملامسة (touching/meeting) is gentler and truer than اصطدام/التصادم (collision as impact), which sounds violent for a limb that simply comes to rest. جزء من الجسم = "body part", reusing الجسم from **Body**; keep it as جزء آخر من الجسم rather than عضو آخر so it also covers the head and torso, not just limbs. Do NOT use يتوقف عند الاختراق or منع التداخل. |
| **Recenter** <br><sub>Double-clicking/double-tapping the **Center handle** under **Move**, which drops the whole model back at the scene origin (`toolbar.poseModeHint*`)</sub> | إعادته إلى المركز | Verb phrase, not a label — the hint's closing clause reads أو انقر عليه نقرًا مزدوجًا لإعادته إلى المركز. المركز deliberately echoes مركز النموذج earlier in the same sentence, so "back to the centre" needs no further gloss. Both pronouns are masculine here and for different reasons: عليه refers to المقبض (**Handle**, masculine — it was عليها while the gizmo was called الحلقة, and that older form is now stale in `poseModeHint*`), ـه in لإعادته refers to السكن (**The whole skin**). Keep both — they are what makes the sentence say "double-click the handle, and the skin goes back". Do NOT use التوسيط (typographic centring of text) or إعادة الضبط. |
| **Face forward again** <br><sub>Double-clicking/double-tapping the **Center ring** under **Twist**, which turns the whole model back to its default facing (`toolbar.poseTwistHint*`)</sub> | ليعود مواجهًا للأمام | The Twist twin of **Recenter**: twisting the centre ring changes the model's facing rather than its place, so the reset is phrased as a return to facing forward, not a return to a point. ليعود (subjunctive after لـ) keeps the masculine agreement with السكن, and مواجهًا للأمام is the plain "facing forward". The thing clicked stays feminine here — انقر عليها / اضغط عليها — because under Twist the centre gizmo is الحلقة, unlike the masculine المقبض of the Move hints; the two strings differ on this pronoun and must not be copy-edited into agreement. Do NOT reuse لإعادته إلى المركز here (the model never left the centre under Twist) and do NOT use إلى الأمام alone (a direction of travel, not a facing). |
| **Double-tap** <br><sub>Touch gesture that resets one limb or, on the **Center ring**, the whole model (`toolbar.poseModeHintTouch`, `toolbar.poseTwistHintTouch`)</sub> | اضغط ضغطًا مزدوجًا | The touch twin of **Double-click** = انقر نقرًا مزدوجًا: same cognate-accusative pattern, but built on اضغط because Tap = اضغط and Click = انقر must stay distinguishable (see **Tap vs. Click** in Reference) — `poseModeHint` and `poseModeHintTouch` are selected by input device, so swapping the verbs silently erases the distinction. Never المس مرتين or دبل تاب. |

### Camera

| English | ar | Notes |
|---|---|---|
| **Camera** <br><sub>The device's physical camera, in the OS permission prompt (`native.cameraUsageDescription`)</sub> | الكاميرا | Device hardware, NOT the 3D viewport camera whose settings follow in this table (those are labeled by their own terms — مجال الرؤية، سرعة الحركة، التخميد — and never by the bare word camera). Keep الكاميرا with the definite article; do not use آلة التصوير or المصوّرة. |
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
- **Handle vs. ring** → `المقبض` (the thing you click/tap to select) vs. `الحلقة` (a **Twist ring**, and the centre gizmo under Twist): these were ONE word (`الحلقة`) while dragging the limb's ring was how you posed it. That gesture is gone — the handle now only selects, and the gizmo you then drag is a **Twist ring** (`حلقة اللَيّ`) or an **Axis arrow** (`سهم المحور`). Any `اسحب الحلقة عند نهاية الطرف` left in `toolbar.poseModeHint*` / `toolbar.poseTwistHint*` is stale text for a drag the app no longer accepts, and any `الحلقة` used for a limb's *selection* handle re-merges the two gizmos.
- **Centre gizmo** → `المقبض عند مركز النموذج` under **Move**, `الحلقة عند مركز النموذج` under **Twist** (never `حلقة الصدر`), and **the whole skin** → `السكن بأكمله` (never `الجسم بأكمله`): the four pose hints once described a chest ring that leaned or turned the figure from the waist (`تُميل الجسم بأكمله`). That gizmo is gone — it now sits at the model's centre, attached to nothing, and translates (`تُحرّك`) or turns (`تُدير`) the whole skin, and double-clicking/double-tapping it resets that transform (لإعادته إلى المركز under Move, ليعود مواجهًا للأمام under Twist). The noun follows the English per tool, which is also why the click pronoun is masculine `عليه` in the Move strings and feminine `عليها` in the Twist ones — do not "fix" that mismatch. Any reappearance of الصدر or الجسم بأكمله is stale.
- **Aim** → `التصويب` belongs to `reference.pickFromImage` ONLY: the pose hints no longer have a drag-to-aim gesture, so a limb-end being pushed along one axis is `إزاحة`, not `تصويب`. The `toolbar.poseMove` tile keeps the inherited label `تصويب`, which is now the one place in Posing where the word appears.
- **Pose vs. Position** → `الوضعية` (joints) vs. `موضع النموذج` (whole model): the pose panel stacks `toolbar.resetPose` = إعادة تعيين الوضعية directly above `toolbar.resetPosition` = إعادة تعيين موضع النموذج. Both English labels start with "Reset" and both Arabic ones with إعادة تعيين, so the object is the only thing telling them apart — never shorten the second to إعادة تعيين الموضع/الوضع, which collapses into the first (same و-ض-ع root, and وضع is separately locked to *mode*).
- **Tap** → `اضغط` (vs. Click → `انقر`): no drift left in the file — common.modeSwitchHintBody and colorPicker.tapToConfirm both use اضغط, and انقر is reserved for mouse clicks. Listed here only because the two verbs are easy to re-conflate: `reference.panHintTouch`/`panHintMouse` are the same English sentence differing solely by this verb, so collapsing them into one word silently breaks the touch/mouse distinction.

---

_Generated from the terminology workflow (English canonical + native Arabic localizer pass)._
