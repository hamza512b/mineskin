# MineSkin Translation Glossary — Simplified Chinese (zh)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `zh` strings. Every concept maps to one canonical Simplified Chinese term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG` · `Star` (the GitHub action/count — see Community & project). Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin. **Keyboard key names stay verbatim in Latin too** (`Ctrl`, `Cmd`, `Shift`, `Z`, `Y` … — as they appear inside `{{shortcuts}}` hints), with a normal space on both sides when embedded in a Chinese run.

**Interpolation placeholders — never translate, reorder, or respell** (replaced at runtime in `src/i18n/DictionaryContext.tsx`):

| Placeholder | Meaning |
|---|---|
| `{{link}}` | An inline link element (GitHub repo, Discord, usage guide, policy, author, etc.) |
| `{{shortcuts}}` | Keyboard shortcut hint (e.g. Ctrl+Z / Ctrl+Y) |
| `{{language}}` | A language name, injected into the language-detection prompt |
| `{{date}}` | The promo end date |
| `{{count}}` | A number (e.g. the maximum reference-image count) — keep Western digits, add a Chinese measure word after it (`{{count}} 张参考图`) |

Never change `languageSwitcher.*` endonyms. Keep files at key parity with `en.json` and valid 2-space JSON.

## Voice & register

Second person: use the polite 您 consistently for the user; reserve 你 only inside casual encouraging microcopy IF a unified voice is chosen — but pick ONE. The current file is inconsistent: most sections use 您 (tutorial, onboarding, library, detailPanel), while feedback ("感谢你的反馈") and recorder ("你的短片/你的截图") switch to 你. Recommendation: standardize on 您 app-wide for a friendly-but-respectful tone that matches Chinese UI convention; if a warmer casual voice is preferred, convert everything to 你 — do not mix within the product. Tone: friendly, concise, encouraging (Minecraft-creator audience) — short verb-first labels for buttons/toolbars (保存 / 撤销 / 分享), full sentences only in dialogs/tips. Avoid stiff machine-translation phrasing; prefer community-familiar gaming terms. Punctuation: use full-width Chinese punctuation （），。、？！ and full-width quotes “ ”; never mix half-width ,.?! into Chinese runs; no space between Chinese characters and punctuation. Latin brand names, version strings and hex codes stay half-width; a normal space around embedded Latin/numbers (e.g. "在 App Store 下载", "128x128 皮肤") reads best. Numbers stay Western digits. Never translate or reorder interpolation placeholders {{link}}, {{shortcuts}}, {{language}}, {{date}} — keep them verbatim and let surrounding Chinese wrap naturally. Keep brand/platform names verbatim in Latin: MineSkin, MineSkin PRO, PRO, Minecraft, iOS, Android, App Store, Google Play, GitHub, Discord, PNG; "Java Edition" renders as "Java 版" (keep "Java" Latin).

## Canonical terms

`*(italic)*` = acceptable alternative.

### Modes

| English | zh | Notes |
|---|---|---|
| **Editor** <br><sub>Pixel-drawing mode</sub> | 编辑器 | Current common.editor=编辑器. Matches. |
| **Preview** <br><sub>View-only 3D mode; also "Previewer"</sub> | 预览 <br>*(预览器 (Previewer))* | Current common.preview=预览 and metadata previewer=预览器. Matches; use 预览器 for the noun 'Previewer'. |
| **Editing** <br><sub>State label while editing</sub> | 编辑中 | Current common.editing=编辑中. Matches (state label). |
| **Draw Mode** <br><sub>Touch mode where gestures paint</sub> | 绘画模式 | Current toolbar.touchDrawMode=绘画模式. Matches. |
| **View Mode** <br><sub>Touch mode where gestures rotate/zoom</sub> | 查看模式 | Current toolbar.touchViewMode=查看模式. Matches. |

### Domain

| English | zh | Notes |
|---|---|---|
| **Skin** <br><sub>The Minecraft character texture</sub> | 皮肤 | Current uses 皮肤 throughout. Matches; standard community term. |
| **Body** <br><sub>Base/inner skin layer (partFilter.baseLayer); replaced "Base"</sub> | 本体 | partFilter.baseLayer=本体. Clearly distinguishes the character's underlying body from its wearable outer layer; compact next to the body-silhouette grid. Keep 图层 as the generic noun for "layer" (e.g. 切换整个图层). partFilter.baseLayerShort reuses 本体 verbatim. |
| **Armor** <br><sub>Outer skin layer: helmet/jacket/sleeves/pants (partFilter.overlayLayer); replaced "Overlay"</sub> | 盔甲 | partFilter.overlayLayer=盔甲. This is the familiar Minecraft term for the wearable outer layer. partFilter.overlayLayerShort reuses 盔甲 verbatim. |
| **Toggle whole layer** <br><sub>Eye-icon tooltip: show/hide every part of one layer (partFilter.toggleWholeLayer)</sub> | 切换整个图层 | Follows the existing partFilter toggle pattern 切换＋对象 (切换头部, 切换夹克…); 图层 is the generic noun for a texture layer. Short visible label (partFilter.toggleWholeLayerShort, EN "Toggle all") = 切换全部 — the button sits under a specific layer's part grid, so the layer stays implicit; keeps the 切换＋对象 pattern at 4 characters. |
| **Slim mode** <br><sub>Slim (3px) arm model, aka Alex</sub> | 纤细模式 <br>*(纤细 (Alex 模型))* | Current detailPanel.slimMode=纤细模式. Matches; 纤细 is the community term for the Alex 3px arm model. |
| **Resolution** <br><sub>Texture resolution 64x64 / 128x128</sub> | 分辨率 | Current detailPanel.changeResolution=更改分辨率. Matches. |
| **Java Edition** <br><sub>Minecraft: Java Edition (product name)</sub> | Java 版 | Current doubleResWarning renders 'Minecraft（Java版）'. Matches; keep 'Java' Latin. Prefer a space: 'Java 版'. |
| **Template** <br><sub>Starter skin template</sub> | 模板 | Current library.templates=模板, importDialog.templateFailed uses 模板. Matches. |

### Body (base)

| English | zh | Notes |
|---|---|---|
| **Head** <br><sub>Base head part</sub> | 头部 | Current partFilter.head=头部. Matches. |
| **Body** <br><sub>Torso; source uses both "Body" and "Torso"</sub> | 身体 | Current partFilter.body=身体. Matches; distinct from Torso=躯干 (good). |
| **Torso** <br><sub>Torso (partFilter.torso)</sub> | 躯干 | Current partFilter.torso=躯干. Matches; correctly distinguished from Body=身体. |
| **Left Arm** | 左臂 | Current partFilter.leftArm=左臂. Matches. |
| **Right Arm** | 右臂 | Current partFilter.rightArm=右臂. Matches. |
| **Left Leg** | 左腿 | Current partFilter.leftLeg=左腿. Matches. |
| **Right Leg** | 右腿 | Current partFilter.rightLeg=右腿. Matches. |

### Body (overlay)

| English | zh | Notes |
|---|---|---|
| **Helmet** <br><sub>Head overlay</sub> | 头盔 <br>*(帽子层)* | Current partFilter.helmet=头盔. Matches (head overlay). |
| **Jacket** <br><sub>Body overlay</sub> | 夹克 <br>*(外套)* | Current partFilter.jacket=夹克. Matches (body overlay). |
| **Left Sleeve** <br><sub>Left arm overlay</sub> | 左袖 <br>*(左袖子)* | Current partFilter.leftSleeve=左袖. Matches. |
| **Right Sleeve** <br><sub>Right arm overlay</sub> | 右袖 <br>*(右袖子)* | Current partFilter.rightSleeve=右袖. Matches. |
| **Left Pants** <br><sub>Left leg overlay</sub> | 左裤腿 | Current partFilter.leftPants=左裤腿. Matches. |
| **Right Pants** <br><sub>Right leg overlay</sub> | 右裤腿 | Current partFilter.rightPants=右裤腿. Matches. |

### Tools

| English | zh | Notes |
|---|---|---|
| **Color picker** <br><sub>Tool to pick a color</sub> | 颜色选择器 <br>*(取色器)* | Current toolbar.colorPicker & colorPicker.colorPickerTab=颜色选择器. Matches. |
| **Pen tool** <br><sub>Primary per-pixel draw tool</sub> | 铅笔工具 <br>*(画笔工具)* | INCONSISTENCY: toolbar.penTool=画笔工具 but tutorial.penToolTitle=绘画工具 — two different renderings. Also 画笔工具 collides with Brush=画笔. Recommend 铅笔工具 (pencil = the standard per-pixel tool in pixel editors) to disambiguate from Brush; at minimum unify penTool and tutorial to one term. |
| **Bulk paint** <br><sub>Fill/flood paint tool</sub> | 批量绘画 <br>*(填充 / 油漆桶)* | Current toolbar.bulkPaint=批量绘画. Matches. Since it is a fill/flood tool, 填充 is more literal — keep 批量绘画 for consistency unless retranslating. |
| **Eraser** <br><sub>Erase pixels</sub> | 橡皮擦 | Current toolbar.eraser=橡皮擦. Matches. |
| **Shading** <br><sub>Variation/shading tool (key: variation)</sub> | 阴影 <br>*(变化)* | INCONSISTENCY: toolbar.variation (Shading)=阴影, but detailPanel.variationToolIntensity=变化工具强度. Same tool, two names. Recommend 阴影 for the tool label; rename the intensity slider to 阴影工具强度. |
| **Dither** <br><sub>Dither brush</sub> | 抖动 | Current toolbar.dither=抖动. Matches. |
| **Symmetry** <br><sub>Mirror painting</sub> | 对称 <br>*(镜像)* | Current toolbar.symmetry=对称, disableSymmetry=关闭对称. Matches. |
| **Brush** <br><sub>Brush / Brushes</sub> | 画笔 <br>*(笔刷)* | Current toolbar.brush & brushes both=画笔. Matches. Note collision with Pen tool=画笔工具 (see term 27) — if Pen tool becomes 铅笔工具, keep Brush=画笔 or use 笔刷. |
| **Grid** <br><sub>Pixel grid overlay (also an environment name)</sub> | 网格 | Current toolbar.grid=网格 AND environmentGrid=网格. 网格 fits the UI grid overlay; matches. |
| **Look at Cursor** <br><sub>Camera-follow-cursor toggle</sub> | 跟随光标 | Current toolbar.lookAtCursor=跟随光标. Matches. |

### Brush params

| English | zh | Notes |
|---|---|---|
| **Opacity** | 不透明度 | Current toolbar.opacity & colorPicker.opacity=不透明度. Matches. |
| **Intensity** | 强度 | Current toolbar.intensity=强度. Matches. |
| **Radius** | 半径 | Current toolbar.radius=半径. Matches. |
| **Size** | 大小 <br>*(尺寸)* | Current toolbar.size=大小. Matches. |
| **Shape** | 形状 | Current toolbar.shape=形状. Matches. |
| **Square** | 方形 <br>*(正方形)* | Current toolbar.square=方形. Matches. |
| **Circle** | 圆形 | Current toolbar.circle=圆形. Matches. |

### Color

| English | zh | Notes |
|---|---|---|
| **Palette** <br><sub>Saved/used colors</sub> | 调色板 | Current colorPicker.paletteTab=调色板. Matches. |
| **Hue** | 色相 | Current colorPicker.hue=色相. Matches. |
| **Saturation** | 饱和度 | Current colorPicker.saturation=饱和度. Matches. |
| **Lightness** | 亮度 | Current colorPicker.lightness=亮度. Matches. Distinguish from Value=明度 (HSV). |
| **Value** <br><sub>HSV value component</sub> | 明度 | Current saturationValueSelector uses 明度. Matches; correctly distinct from Lightness=亮度. |
| **Hex Code** | 十六进制代码 <br>*(十六进制)* | Current colorPicker.hexCode=十六进制代码. Matches. |
| **Swatch** <br><sub>One color chip in the palette strip</sub> | 色块 | Not a visible string today, but the term to use if a swatch label is ever added; 调色板 stays the container (Palette), 色块 the individual chip. |

### Reference images

| English | zh | Notes |
|---|---|---|
| **Reference image** <br><sub>Imported photo/artwork users tap to sample colors from</sub> | 参考图 <br>*(参考图片)* | toolbar.reference & reference.title=参考图. 参考图 is the established Chinese art/design term (shorter than 参考图片, fits toolbar and panel titles). Keep it singular in Chinese even when English says "Reference images". Compounds: 添加参考图 (add), 移除参考图 (remove). |
| **Pick a color (from an image)** <br><sub>Eyedropper sampling off a reference</sub> | 取色 | reference.emptyState / pickFromImage use 从中取色 / 松开即可取色. 取色 is the community verb for eyedropper sampling; keeps 颜色选择器 (Color picker) free for the HSV tool and matches its alternative 取色器. Avoid 吸取颜色 for consistency. |
| **Zoom** <br><sub>Scaling the reference image in/out to sample colors precisely</sub> | 缩放 | The noun/concept; used only in compounds today (reference.resetZoom=重置缩放, pairing with Reset=重置). Do not use 变焦 (camera lens) or 放大倍数. |
| **Zoom in / Zoom out** <br><sub>+ and − icon buttons overlaid on the reference image (aria-labels/tooltips)</sub> | 放大 / 缩小 | reference.zoomIn=放大, reference.zoomOut=缩小. Standard Chinese UI pair for image zoom controls; keep them as bare 2-character verbs on these icon buttons — do not expand to 放大图片 / 缩小图片. |
| **Pan** <br><sub>Dragging a zoomed-in reference image to move it under the viewport (reference.pickFromImageZoomed, panHintTouch/panHintMouse)</sub> | 平移 | The canonical verb for moving the image itself, paired with 拖动 (drag) as the gesture: 拖动平移 / 拖动可平移图片. Do not use 移动 here — 移动 is reserved for camera 移动速度 and reads as generic motion; 平移 is the established Chinese imaging term for panning. |
| **Tap / Click** <br><sub>The single-contact gesture that samples a color; touch and mouse variants of the same hint pill</sub> | 轻点 / 点击 | 轻点 for touch (panHintTouch, and the aria-label 轻点即可取色 which is read on touch-capable canvases), 点击 for mouse (panHintMouse). Never swap them: 点击 implies a mouse button in Chinese UI convention, 轻点 is the standard touch rendering. Both chain with the locked verb 取色 (pick a color). |
| **Hint pill separator** <br><sub>The `·` between the two halves of the reference pan hints</sub> | ` · ` | Keep the Latin middle dot with a half-width space on each side (拖动平移 · 轻点取色). It is a separator between two label fragments, not sentence punctuation, so the full-width-punctuation rule does not apply; do not substitute 、or ，. Keep each half at 4 characters so the pill stays inside 70% of the panel width. |

### Actions

| English | zh | Notes |
|---|---|---|
| **Undo** | 撤销 | Current toolbar.undo=撤销. Matches. |
| **Redo** | 重做 | Current toolbar.redo=重做. Matches. |
| **Save** | 保存 | Current common.save=保存. Matches. |
| **Cancel** | 取消 | Current common.cancel=取消. Matches. |
| **Reset** | 重置 | Current common.reset=重置. Matches. |
| **Upload** | 上传 | Current common.upload=上传. Matches. |
| **Download** | 下载 | Current common.download context & library.exportSkin=下载. Matches. |
| **Import** | 导入 | Current importDialog.import=导入. Matches. |
| **Export** <br><sub>Used for "export skin"</sub> | 导出 | Current saveImage.cannotExport uses 导出, BUT library.exportSkin label=下载 (uses Download for the export action). Recommend 导出 for the export concept; note the library button intentionally says 下载 — acceptable if it truly downloads a file. |
| **Screenshot** | 截图 | Current toolbar.screenshot & feedback.addScreenshot=截图. Matches. |
| **Record clip** <br><sub>Record a shareable video</sub> | 录制片段 <br>*(录制短片)* | Current toolbar.recordClip=录制片段. Matches; note recorder.previewTitle uses 短片 for the resulting 'clip' — consistent enough. |
| **Share** | 分享 | Current recorder.share=分享视频, shareImage=分享图片. Matches. |
| **Discard** | 放弃 <br>*(丢弃)* | Current recorder.discard=放弃. Matches. |
| **Copy** <br><sub>Copy-to-clipboard button (home.copyEmail)</sub> | 复制 | Bare 2-character verb on the tiny button. Confirmation state (home.copiedEmail) = 已复制 — the 已＋verb pattern for "done" states. Full aria-label spells out the object: 复制邮箱地址 (home.copyEmailLabel). |

### Community & project

| English | zh | Notes |
|---|---|---|
| **Open source** <br><sub>home.openSourceHeading</sub> | 开源 | 开源项目 for "is open source" as a noun phrase (MineSkin 是开源项目。) — more idiomatic in Chinese than a bare predicate 是开源的. |
| **Star** <br><sub>GitHub star action; button label (home.githubStar)</sub> | Star | Keep verbatim in Latin. Chinese developers say and search "Star" (点个 Star / Star 数); the official GitHub zh-CN rendering 星标 is not what the community uses. Verb form in prose: 点个 Star. Never 收藏 or 加星. |
| **Stargazers** <br><sub>Star-count link, accessible label (home.githubStargazers)</sub> | GitHub 上的 Star 数 | Chinese has no natural noun for "stargazers"; describe it as the count instead. Keep the space around the Latin `Star`. |

### Animation

| English | zh | Notes |
|---|---|---|
| **Idle animation** | 待机动画 | Current toolbar.idleAnimation=待机动画. Matches. |
| **Walking animation** | 行走动画 | Current toolbar.walkingAnimation=行走动画. Matches. |
| **No Animation** | 无动画 | Current toolbar.noAnimation=无动画. Matches. |

### Posing

| English | zh | Notes |
|---|---|---|
| **Pose** <br><sub>Noun: the character's limb arrangement</sub> | 姿势 <br>*(姿态)* | Standard Chinese term for a figure's pose in 3D/animation tools and everyday speech. 姿态 is the more technical/formal alternative (rigging, transforms); 姿势 reads naturally to the Minecraft-creator audience. Keep it distinct from 动画 (Animation) — a pose is a static arrangement, not a playing clip. |
| **Pose** <br><sub>Verb: to select a limb and drag its gizmo into position; "Pose Limbs" toggle (toolbar.poseMode)</sub> | 摆姿势 <br>*(肢体摆姿)* | toolbar.poseMode=摆姿势. 摆 is the natural verb that pairs with 姿势 ("to strike/arrange a pose"); verb-first and only 3 characters, which fits the narrow vertical toolbar rail under a small icon. Confined to the toggle label — the hints now describe the concrete gizmo actions instead, so the old resultative 摆出姿势 no longer appears in toolbar.poseModeHint. Do NOT use 摆动 or 姿势模式 — 摆动 is now locked to Swing (see below) and the X模式 pattern is reserved for the touch modes 绘画模式 / 查看模式. |
| **Reset Pose** <br><sub>Button returning every limb to rest (toolbar.resetPose)</sub> | 重置姿势 | Reuses the canonical Reset=重置 plus Pose=姿势; keeps the 重置＋对象 pattern and stays at 4 characters for a compact button. Scope is the **joints only** — it never moves the figure through the scene (that is **Reset Position**, the button stacked directly under it). |
| **Position** <br><sub>Where the whole figure sits in the scene and which way it faces — the model-level transform produced by dragging/turning the centre ring, as opposed to its **Pose**</sub> | 位置 | The model-level counterpart of 姿势: 姿势 is how the limbs are arranged, 位置 is where the whole figure stands. Keep the two words apart in every string — never write 姿势 for a whole-model displacement or 位置 for a joint. Do not use 方位 (bearing/orientation, reads as compass direction) or 坐标 (raw numeric coordinates). |
| **Reset Position** <br><sub>Button putting the whole model back at the scene origin facing forward (toolbar.resetPosition); sits directly under **Reset Pose** in the pose panel</sub> | 重置模型位置 | Keeps the 重置＋对象 pattern, but deliberately spells out 模型 rather than shipping the minimal 重置位置: the two buttons are stacked full-width, and 重置姿势 / 重置位置 differ by only two rhyming characters, so the reader has to parse them instead of recognising them. 模型 states the scope on sight — this one moves the whole figure, not a joint — and simultaneously spaces out the 置…置 repetition that makes bare 重置位置 read awkwardly. It fits: the button is full-width in a ~200px+ panel at 13px next to a 16px icon. Chain with the locked **Model's center** = 模型中心 (same 模型 for the 3D figure). Do not use 复位 / 归位 alone (too terse to read as an explicit reset) or 重置位置和朝向 (the English label does not spell the facing out either). |
| **Recenter** <br><sub>Double-click/double-tap the centre handle to send the whole skin back to the scene origin (toolbar.poseModeHint / …HintTouch)</sub> | 回到原位 | Literally "back to its original spot" — deliberately NOT 回到中心, even though the English says "recenter": the same sentence already contains 模型中心的手柄 (the handle's location), and reusing 中心 would read as the handle returning to itself. 原位 is spatial (where it stood), so it never gets mistaken for a rest **pose**. Phrasing: 双击即可让皮肤回到原位 / 轻点两下即可让皮肤回到原位, with the gesture verb elided of its object exactly like the limb clause before it (双击即可重置该肢体). Object stays the locked **whole skin** = 皮肤. |
| **Face forward again** <br><sub>Double-click/double-tap the centre ring in **Twist** to undo the whole model's turn (toolbar.poseTwistHint / …HintTouch)</sub> | 重新面朝正前方 | The Twist-mode counterpart of 回到原位: Twist only turns the figure on the spot, so the reset restores its facing, not its location — say so rather than reusing 回到原位. 面朝 is the everyday verb for which way a figure faces (面向 is acceptable but reads more formal/abstract); 重新 carries the English "again". Do not use 转身 (implies the character turning to face away, already banned in the whole-skin row), 复位, or 归零 (numeric/transform jargon). |
| **Limb** <br><sub>An arm, leg or the head as a draggable, rotatable part</sub> | 肢体 | Collective term for arms/legs (and, loosely, the head) as movable parts — distinct from 部位 (body *part* in partFilter, a paint/visibility target) and from the specific part names 左臂 / 右腿 / 头部. "one limb" = 单个肢体. |
| **Double-click** <br><sub>Mouse gesture in interaction hints (toolbar.poseModeHint)</sub> | 双击 | Standard Chinese UI term; pairs with the existing 点击 (click, tutorial/dropzone) and 拖动 (drag an object, distinct from 拖放 = drag & drop in importDialog.dropzoneText). Mouse only — the touch equivalent is 轻点两下, never 双击 (see Double-tap). |
| **Handle** <br><sub>The small grabbable marker on a limb (and at the model's center) that is clicked/tapped to **select** that limb and bring up its gizmo — it is no longer dragged to pose anything (toolbar.poseModeHint* / poseTwistHint*)</sub> | 手柄 | 手柄 is the established Chinese term for a manipulator handle in 3D tools. Since the posing rework the handle only *selects*: 轻点肢体的手柄即可调出轴向箭头 / 轻点两下手柄即可重置该肢体. Do NOT shape-name it 圆环 any more — 圆环 is now locked to the **Twist ring** gizmo, and the old "ring at the limb's free end that you drag to aim" no longer exists. Mouse hints skip the word entirely (the English says just "Click a limb"), so 手柄 appears only in the touch hints and in the **model's center** phrase for **Move**. Do not use 把手 (a physical door handle) or 控制点 (reads as a curve control point). |
| **Gizmo** <br><sub>The manipulator that appears after a limb is selected: three **axis arrows** in **Move**, three **twist rings** in **Twist**</sub> | — <br>*(轴向箭头 / 扭转圆环)* | Deliberately has no Chinese rendering: the English hints never say "gizmo" either, they name the concrete parts. Always write the specific gizmo (轴向箭头 or 扭转圆环) rather than inventing 控制器 / 操纵器 — those read as engine jargon in a ~208px tooltip. The verb for making it appear is 调出 (点击肢体即可调出轴向箭头), which correctly implies "summon", not "create". |
| **Twist ring** <br><sub>The **Twist** gizmo: three rings around a limb's **joint**; dragging one turns the limb about that axis (toolbar.poseTwistHint / …HintTouch)</sub> | 扭转圆环 <br>*(圆环)* | Built from the locked **Twist** = 扭转 plus 圆环 for the shape the user sees, exactly parallel to **Axis arrow** = 轴向箭头 in **Move**. Introduce it in full (调出扭转圆环) and then refer back with the bare 圆环 (拖动圆环即可…) to keep the tooltip short. The rings sit at the 关节 (joint), not at the limb's free end — the reverse of the axis arrows, and the opposite of the pre-rework ring, so never describe them as 肢体末端的圆环. Do not use 旋转环 (uses the banned generic 旋转) or 转盘 (a dial). |
| **Model's center (handle location)** <br><sub>Where the skin-wide handle sits — at the model's centre of mass, attached to no body part (toolbar.poseModeHint / …HintTouch / poseTwistHint / …HintTouch)</sub> | 模型中心 | The handle no longer rides on the chest: it floats at the figure's centre of mass and is not part of any limb, so it must be named by position, not by anatomy. 模型 is the neutral word for the 3D figure (the thing the 皮肤 is worn on) and never claims a partFilter part. Deliberately NOT 胸口 (the old, now-wrong location — never reuse it here), NOT 躯干 (locked to the partFilter part **Torso**; the handle does not move the torso as a part), and NOT 重心 (physics/balance register, reads as a simulation property rather than a spot on screen). 中心点 is over-precise for a tooltip; keep the bare 模型中心. **Follow the English on which noun it takes**, because the two tools show different center gizmos: **Move** ⇒ 模型中心的手柄 ("the handle at the model's center"), **Twist** ⇒ 模型中心的圆环 ("the ring at the model's center"). Never write 圆环 in the Move hints or 手柄 in the Twist ones. |
| **The whole skin (moved by the center ring)** <br><sub>Dragging the center handle carries the entire figure with it — translating it through the scene with **Move**, turning it on the spot with **Twist**</sub> | 整个皮肤 <br>*(移动 / 原地转动)* | The English deliberately says "the whole skin", not "the body": nothing is rotated from the waist any more, the whole character is displaced. So use the locked **Skin** = 皮肤 with the plain quantifier 整个 — 可移动整个皮肤 / 让整个皮肤原地转动. Do NOT keep the old 整个身体: 身体 is the locked rendering of the partFilter part **Body**, and now that the handle is attached to nothing, naming a body part would wrongly suggest a part-level rotation. Also avoid 全身 (medical/full-body-scan register) and 整个角色 (unlocked term for the character). Pair it with the verb that states the motion: **Move** ⇒ 移动 — the locked **Move (tool)** verb, now literally correct because the handle translates the figure; never 一起倾斜 (the old lean-from-the-waist wording, no longer what happens); **Twist** ⇒ 原地转动 — reuse the 原地 of the **Twist** row (in place, the figure does not go anywhere) with 转动, not 扭转, because the whole figure turns as one rather than winding about itself, exactly as the English switches from "spin around its own axis" to "turns". Do not use 旋转 (the generic rotate the pose hints keep unused) or 转身 (implies a character turning to face away). |
| **Joint** <br><sub>The pivot the limb turns about (shoulder, hip, neck); where the three **twist rings** sit</sub> | 关节 | The anatomical/rigging term, immediately understood for shoulder/hip/neck. Strictly the pivot *point*, never the moving part itself — the movable arm/leg/head is 肢体 (Limb). It anchors the **Twist** gizmo, opposite the limb's free end where the 轴向箭头 appear. Do not use 关节点 or 枢轴. |
| **Aim (verb)** — RETIRED <br><sub>Was: drag the ring so the limb's end follows the pointer</sub> | ~~调整指向~~ | RETIRED by the posing rework — nothing follows the pointer freely any more, every drag is constrained to one gizmo axis. Do not reintroduce 调整指向 into the pose hints; describe the constrained motion instead (沿这条轴移动 / 绕该轴转动). Kept here so the term is not silently revived. |
| **Swing (verb)** — RETIRED <br><sub>Was: drag the limb's body itself to rotate it freely</sub> | ~~摆动~~ | RETIRED by the posing rework — a limb is never dragged directly any more; you select it, then drag a gizmo handle. 摆动 is now unused, but keep it reserved (do not repurpose it for **Pose** = 摆姿势 or for **Twist** = 扭转). |
| **Axis** <br><sub>One of the three gizmo axes a drag is constrained to — the limb's end slides along it in **Move**, the limb turns about it in **Twist**</sub> | 轴 | The bare 轴 is the standard Chinese term in 3D tools (X 轴 / Y 轴 / Z 轴). In the hints it always carries a measure word or demonstrative — 沿这条轴移动 (Move) / 绕该轴转动 (Twist) — which reads far more naturally than the noun alone; note the fixed prepositions, 沿 for sliding along an axis and 绕 for turning around one. Do not use 坐标轴 (schoolbook geometry register, too heavy for a tooltip) or 轴线 (a drawn construction line). 轴 always means one of the three gizmo axes here; never use it for a limb's own long axis. |
| **Axis arrow** <br><sub>The **Move** gizmo: three arrows at a limb's free end after the limb is selected, each dragging that end along one axis only (toolbar.poseModeHint / …HintTouch)</sub> | 轴向箭头 | 轴向 (axis-aligned / along an axis) + 箭头 names both what constrains it and what the user sees, and it is the term Chinese 3D tools use for a translate gizmo's arrow shafts. Its **Twist** counterpart is 扭转圆环 — arrows sit at the limb's free end and slide it, rings sit at the 关节 and turn it. Follow the English on counting: the hints just say "axis arrows", so use the bare 轴向箭头 (add 三个 only if the source spells the count out); the full form 轴向箭头手柄 is available for aria-labels only. Refer back with the bare 箭头 (拖动箭头即可…) to keep the tooltip short. Avoid 方向箭头 (reads as a mere directional indicator) and 移动轴 (names the axis, not the grabbable arrow). |
| **Collision / stop where limbs meet** <br><sub>Stated behaviour, not a toggle: a limb stops moving once it reaches another body part. NOT currently surfaced — the reworked pose hints dropped the clause; keep the wording ready in case it returns</sub> | 碰到其他部位就会停下 <br>*(碰撞)* | Describe the behaviour with a verb phrase rather than naming the feature — the noun 碰撞 (collision) is engine jargon and would read as a setting the user must find. 碰到 is the everyday verb for making contact; 停下 keeps the light register of the surrounding hint (do not use 停止 or the stiffer 被阻挡). Chain the locked terms: 肢体 (Limb) as subject, 部位 (body part, as in partFilter) as object — 其他部位 is enough, do not expand to 其他身体部位 in these already-long tooltips. Reserve 碰撞 for any future technical/settings copy about the system itself. |
| **Move (tool)** <br><sub>Pose-panel tool tile: select a limb, then drag one of its three **axis arrows** to slide that end along that axis (toolbar.poseMove)</sub> | 移动 | The tool name, not the gesture: it names what dragging an 轴向箭头 does to the limb's free end, and at 2 characters it fits the ~120px tile under its icon. CONFLICT RESOLVED: the **Pan** row bans 移动 for the reference image ("reserved for camera 移动速度"), but that ban is about not blurring 平移 (image pan) with generic motion; here 移动 *is* the concept being named, in a different surface (pose panel tile vs. reference hint), and nothing in posing competes for the word. The ban stands unchanged for Pan — never write 移动 where 平移 is meant — and 移动速度 stays the camera slider. Do not expand to 移动肢体 (the panel is already limb-scoped) and do not reuse 调整指向 as the tile label — that names one gesture inside the tool, so the tile would under-describe the axis arrows. |
| **Twist (tool/verb)** <br><sub>Pose-panel tool tile: select a limb, then drag one of the three **twist rings** at its joint to turn it about that axis (toolbar.poseTwist / poseTwistHint / …HintTouch)</sub> | 扭转 | 扭转 is the everyday Chinese verb for twisting a jointed thing about itself (扭转手腕 / 扭转身体), so it reads as an anatomical turn rather than a transform, and it stays 2 characters for the tile. Lexically distinct from every neighbouring term: 平移 (Pan — the reference image), 旋转 (the generic "rotate", deliberately still unused in the pose hints), and 动画 (a playing clip). **Scope note:** the tile name is 扭转, but the *motion* the hints describe is now axis-constrained, so the sentence verb is 转动, not 扭转 — 拖动圆环即可让肢体绕该轴转动. Keep 扭转 for the tool and for the gizmo compound 扭转圆环 only. The old prose form 原地扭转 is retired for limbs (it expressed "around its own axis", which is no longer what happens); 原地 survives only in the whole-skin clause 让整个皮肤原地转动. Do not use 自转 (astronomy), 拧 / 拧转 (twisting a physical knob) or 翻转 (a flip/mirror). |
| **Double-tap** <br><sub>Touch gesture on a limb's **handle** that resets that limb (toolbar.poseModeHintTouch / poseTwistHintTouch)</sub> | 轻点两下 | Built on the locked touch verb 轻点 (tap, reference.panHintTouch) and follows the standard Chinese touch-platform rendering of "double-tap". Never 双击 on touch — 双击 implies a mouse button in Chinese UI convention and is reserved for the mouse hint, exactly as 点击 / 轻点 are kept apart elsewhere. Keep 两下 (not 两次) for the lighter, gesture-like register, and keep 轻点两下 unsplit — write 轻点两下手柄, never 轻点手柄两下. |

### Camera

| English | zh | Notes |
|---|---|---|
| **Field Of View** <br><sub>FOV</sub> | 视野 <br>*(视场角 / FOV)* | Current detailPanel.fieldOfView=视野. Matches. |
| **Movement Speed** | 移动速度 | Current detailPanel.movementSpeed=移动速度. Matches. |
| **Damping** <br><sub>Camera inertia damping</sub> | 阻尼 | Current detailPanel.damping=阻尼. Matches (camera inertia). |
| **Camera** <br><sub>The physical device camera (native permission prompt, native.cameraUsageDescription) — NOT the 3D viewport camera above</sub> | 相机 | Use 相机 only for the hardware camera; the 3D viewport camera has no standalone label (it appears via 视野 / 移动速度 / 阻尼). Avoid 摄像头 (webcam register) and 照相机 (dated). Platform-neutral: never add iOS/Android to the permission text. |
| **Take a photo** <br><sub>Capture a photo with the device camera to use as a reference image</sub> | 拍摄照片 <br>*(拍照)* | native.cameraUsageDescription=拍摄照片作为参考图，以便从中取色。 Prefer the full 拍摄照片 in permission/purpose sentences; bare 拍照 is acceptable only on a short button label. Chain with the locked terms 参考图 (Reference image) and 取色 (Pick a color). |

### Light

| English | zh | Notes |
|---|---|---|
| **Main Light** <br><sub>Key/directional light</sub> | 主灯光 <br>*(主光源)* | Current detailPanel.mainLight=主灯光. Matches. |
| **Ambient Light** <br><sub>Overall Brightness (Ambient Light)</sub> | 环境光 | Current overallBrightness=整体亮度（环境光） embeds 环境光. Matches. |
| **Surface Brightness** | 表面亮度 | Current detailPanel.surfaceBrightness=表面亮度. Matches. |
| **Shine/Glossiness** <br><sub>Specular</sub> | 光泽度 <br>*(高光)* | Current detailPanel.shineGlossiness=光泽度. Matches (specular). |
| **Overall Brightness** | 整体亮度 | Current overallBrightness=整体亮度（环境光）. Matches. |

### Environment

| English | zh | Notes |
|---|---|---|
| **Environment** <br><sub>3D world/atmosphere</sub> | 环境 <br>*(场景)* | Current detailPanel.environment=环境. Matches. |
| **Grassland Day** <br><sub>Environment name</sub> | 草地白天 <br>*(草原白天)* | Current environmentGrassland=草地白天. Matches. |
| **Arena** <br><sub>Sci-fi arena environment (NOT "sand")</sub> | 竞技场 <br>*(斗技场)* | Current environmentScifi=竞技场. Matches; correctly the sci-fi arena, NOT 'sand'. |
| **Empty** <br><sub>No environment</sub> | 空白 <br>*(无)* | Current environmentEmpty & library.newEmpty=空白. Matches (no environment). |

### Library

| English | zh | Notes |
|---|---|---|
| **Library** <br><sub>Saved skins collection</sub> | 皮肤库 <br>*(素材库)* | Current library.title=皮肤库. Matches (saved skins collection). |
| **New Skin** | 新皮肤 | Current library.newSkin & defaultName=新皮肤. Matches. |
| **Templates** | 模板 | Current library.templates=模板. Matches; align with singular Template=模板. |
| **Changelog** | 更新日志 | Current changelog.title=更新日志. Matches. |
| **Settings** | 设置 | Current common.settings=设置. Matches. |
| **Appearance** <br><sub>Theme selector label (System/Light/Dark)</sub> | 外观 | theme.label=外观. Standard Chinese UI term for the color-theme picker; matches register of languageSwitcher.language=语言. |

## Consistency watch-list

Terms with known drift in the current file — keep these locked to the recommended form:

- **Pen tool** → `铅笔工具`: INCONSISTENCY: toolbar.penTool=画笔工具 but tutorial.penToolTitle=绘画工具 — two different renderings. Also 画笔工具 collides with Brush=画笔. Recommend 铅笔工具 (pencil = the standard per-pixel tool in pixel editors) to disambiguate from Brush; at minimum unify penTool and tutorial to one term.
- **Shading** → `阴影`: INCONSISTENCY: toolbar.variation (Shading)=阴影, but detailPanel.variationToolIntensity=变化工具强度. Same tool, two names. Recommend 阴影 for the tool label; rename the intensity slider to 阴影工具强度.
- **Brush** → `画笔`: Current toolbar.brush & brushes both=画笔. Matches. Note collision with Pen tool=画笔工具 (see term 27) — if Pen tool becomes 铅笔工具, keep Brush=画笔 or use 笔刷.

---

_Generated from the terminology workflow (English canonical + native Simplified Chinese localizer pass)._
