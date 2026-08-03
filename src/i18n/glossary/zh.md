# MineSkin Translation Glossary — Simplified Chinese (zh)

> Per-language terminology reference derived from the English source of truth (`src/i18n/locales/en.json`).
> Use it when translating or reviewing `zh` strings. Every concept maps to one canonical Simplified Chinese term used everywhere it appears.

## Universal rules (all locales)

**Do-not-translate — verbatim, Latin script:** `MineSkin` · `MineSkin PRO` · `PRO` · `Minecraft` · `iOS` · `Android` · `App Store` · `Google Play` · `GitHub` · `Discord` · `PNG` · `Star` (the GitHub action/count — see Community & project). Also keep `PNG`, dimension strings (`64x64`, `64x32`, `128x128`) and `Hex` in Latin.

**Interpolation placeholders — never translate, reorder, or respell** (replaced at runtime in `src/i18n/DictionaryContext.tsx`):

| Placeholder | Meaning |
|---|---|
| `{{link}}` | An inline link element (GitHub repo, Discord, usage guide, policy, author, etc.) |
| `{{shortcuts}}` | Keyboard shortcut hint (e.g. Ctrl+Z / Ctrl+Y) |
| `{{language}}` | A language name, injected into the language-detection prompt |
| `{{date}}` | The promo end date |

Never change `languageSwitcher.*` endonyms. Keep files at key parity with `en.json` (366 keys) and valid 2-space JSON.

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

### Camera

| English | zh | Notes |
|---|---|---|
| **Field Of View** <br><sub>FOV</sub> | 视野 <br>*(视场角 / FOV)* | Current detailPanel.fieldOfView=视野. Matches. |
| **Movement Speed** | 移动速度 | Current detailPanel.movementSpeed=移动速度. Matches. |
| **Damping** <br><sub>Camera inertia damping</sub> | 阻尼 | Current detailPanel.damping=阻尼. Matches (camera inertia). |

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
