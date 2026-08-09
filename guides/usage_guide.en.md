---
title: "Usage Guide"
description: "Learn how to use MineSkin PRO - the powerful Minecraft skin editor and previewer"
---

## Overview

MineSkin PRO is a Minecraft skin editor and previewer with a real-time 3D view. It runs entirely on your device — in the browser, or as the iOS and Android app. Paint pixel by pixel directly on the 3D model, keep a library of skins, pick colors from reference images, and export a finished PNG for Minecraft.

---

## Getting Started

### First-Time Users

In the iOS and Android app, a short welcome flow greets you on first launch so you can set your language and cookie preferences. On the web there's no welcome flow — just a cookie prompt.

Either way, the first time you open **Editor** mode an interactive tutorial walks you through the basics. You can restart it anytime from **Settings → Help → Restart Tutorial**.

### Quick Start

1. Open the **Library** from the bottom bar and create a skin — start from a template, upload a PNG, or import one from a Minecraft username.
2. Pick a color, then choose a brush from the **Brushes** button in the left toolbar.
3. Paint directly on the 3D model.
4. Your work saves to the library automatically. To get a PNG out, open the **Library** and choose **Download** on the skin.

---

## Modes

Switch modes with the selector in the bottom bar.

### Editor Mode

- All drawing tools, brushes, and reference images
- Real-time 3D preview while you paint
- Undo/redo, grid, symmetry

### Preview Mode

- View your skin in 3D without editing tools
- Play animations, follow the cursor with the head
- Take screenshots and record shareable clips

---

## Your Skin Library

Open **Library** from the bottom bar. It holds every skin you've made, with the active one marked.

### Creating a Skin

**Library → New Skin** gives you:

- **Templates:** Empty, Steve (classic arms), Alex (slim arms)
- **Import from Minecraft:** enter a Minecraft username to pull that player's current skin
- **Upload a file:** drag and drop a PNG, or browse for one

Accepted uploads are PNGs sized **64×64**, **64×32** (old format), or **128×128**.

### Managing Skins

Each skin in the library can be:

- **Renamed** — the name is also used for exported files
- **Downloaded** — saves a PNG ready to upload to Minecraft
- **Deleted** — deleting the last skin leaves you with a fresh empty one

### Where Skins Are Stored

Skins live **locally on your device**, and every edit is saved automatically as you paint — so your work survives a reload. Because the storage is local, clearing your browser or app data will remove them. Download anything you don't want to lose.

---

## Brushes

The **Brushes** button in the left toolbar shows the brush you're currently using. Click it to open the brush panel — a side popover on desktop, a bottom sheet on touch devices.

- **Pen** (`P`) — paints a single pixel per click or drag
- **Bulk paint** (`U`) — fills a whole face, or a disc of pixels
- **Shading** (`V`) — darkens or lightens what's already there for depth
- **Dither** (`D`) — paints a 50% checkerboard of your color over what's underneath
- **Eraser** (`E`) — clears pixels back to transparent

### Brush Options

Each brush shows its own options in the panel:

- **Bulk paint → Radius:** `0` fills the entire face you clicked; `1`–`8` fills a disc of that many pixels around the hit. With a radius above 0 you can also choose a **Square** or **Circle** shape.
- **Shading → Intensity:** `1`–`6`, how strong each shading step is.
- **Eraser → Size:** `0`–`8`, shown as the resulting diameter in pixels.

Pen, shading, and dither always affect a single pixel, so they have no size control.

### Symmetry

**Symmetry** (`M`) mirrors every stroke onto the other side of the model — paint the left arm and the right arm follows. Toggle it from the brush panel. While it's on, a shortcut button appears in the toolbar so you can switch it off without opening the panel.

---

## Color

### Color Picker

The swatch at the top of the left toolbar opens the full picker:

- Pick from the saturation/lightness field and hue slider
- Type an exact **hex code**
- Set **opacity**
- Switch to the **Palette** tab to reuse colors already present in your skin

> Opacity only applies to the **armor (overlay) layer**. The body layer renders solid in-game, so paint there is always fully opaque.

### Eye Dropper (`I`)

Click the eye dropper button, then click any pixel on the 3D model to make its color your paint color.

---

## Reference Images

Press `R` or click the **Reference images** button to open the reference panel, docked beside the canvas in Editor mode.

- Add up to **12** images
- Drag on an image to aim, release to pick that color as your paint color
- **Zoom in / out / reset** to work with fine detail
- The **Colors in this image** row shows the image's dominant colors as swatches
- Remove images you're done with

---

## Body Parts and Layers

Every skin has two layers:

- **Body** — the base skin texture
- **Armor** — the overlay layer (hats, jackets, sleeves, pants)

Hide parts you're not working on to reach surfaces that are otherwise buried — for example, hide the armor layer to paint the head underneath it.

- **Desktop:** the parts panel sits in the top-right corner of the canvas
- **Touch:** tap the **Parts Filter** button in the toolbar to open it as a dialog

You can toggle each part individually (head, torso, arms, legs), or toggle a whole layer at once.

---

## Camera and View

### Rotation Gizmo

The gizmo in the top-right corner shows which way the camera is facing. Drag it to orbit around the model.

### Mouse and Touch

- **Drag:** orbit the camera
- **Scroll / pinch:** zoom in and out

The camera coasts after you release, with how much it carries controlled by the damping setting.

### Look at Cursor

In Preview mode on desktop, **Look at Cursor** makes the model's head follow your pointer around the screen.

### Camera Settings

Under **Settings → Preferences → Camera**:

- **Field of View** — how wide the perspective is
- **Movement Speed** — `0`–`0.5`, how fast the camera responds
- **Damping** — `0`–`1`, how quickly motion settles

> Fun fact: set damping to 0 and the camera will keep spinning forever.

---

## Grid

The **Grid** button in the toolbar (Editor mode) overlays pixel guides on the model, which helps with alignment and symmetry.

---

## Animations

In Preview mode, the **Animations** button plays the model through a loop:

- Idle
- Walking
- Running
- Flying
- Wave
- Crouch
- Hit

Choose **No Animation** to return the model to its rest pose.

---

## Screenshots and Clips

Both live in the Preview mode toolbar.

### Screenshot

Captures a square 1080×1080 PNG of the model, with a small MineSkin badge. You get a preview first, then choose to save or share it.

### Record Clip

Records a short vertical (9:16) video of your skin turning, badge included. A progress overlay appears while it renders, and you can cancel at any point. When it's done, preview the clip and then share or download it.

---

## Settings

Open the **Settings** panel with the gear icon in the toolbar. It has three tabs.

### Actions

- **Slim mode** — switches between classic (4px arms) and slim/"Alex" (3px arms). This modifies the skin texture, so you'll be asked to confirm.
- **Double resolution (128×128)** — doubles the texture resolution. Also a texture-modifying change. Note that **Minecraft (Java Edition) does not support 128×128 skins**.
- **Flip front to back** — swaps the front and back of every body part so the skin faces the other way.

### Preferences

**Paint** (Editor mode)

- **Variation Tool Intensity** — `1`–`6`

**Skin**

- **Surface Brightness** — `0`–`1`, diffuse lighting on the model
- **Shine / Glossiness** — `0`–`1`, specular highlights
- **Move Left/Right**, **Move Forward/Back**, **Move Up/Down** — `-100` to `100`
- **Tilt Up/Down**, **Turn Left/Right**, **Roll** — full rotation on each axis

> The three position sliders are locked while a 3D environment is active, since the environment places the model for you.

**Camera** — Field of View, Movement Speed, Damping (see [Camera and View](#camera-and-view))

**Light**

- **Main Light** — `0`–`1`, directional light strength
- **Light Left/Right**, **Light Up/Down**, **Light Forward/Back** — `-10` to `10`
- **Overall Brightness (Ambient Light)** — `0`–`1`, uniform base illumination

**Environment** — switch between backdrops:

- **Grid** — the default reference grid
- **Empty** — a plain gradient
- **Grassland Day** — an outdoor 3D scene
- **Arena** — a stylised indoor scene

**Language** — English, Arabic, Chinese, Spanish, Portuguese (Brazil)

**Appearance** — System, Light, or Dark theme

### Help

- Restart the interactive tutorial
- Report a problem (you can attach a screenshot; no account needed)
- Links to this guide, the changelog, the Discord server, and the GitHub repository
- Links to the iOS and Android apps

---

## History

- **Undo:** `Ctrl+Z` (Windows/Linux) or `⌘+Z` (Mac)
- **Redo:** `Ctrl+Shift+Z` / `Ctrl+Y`, or `⌘+Shift+Z` (Mac)
- Buttons for both sit in the left toolbar

> Undo history is **not** kept across a page reload. Your skin itself is saved, but the steps that got you there are cleared.

---

## Keyboard Shortcuts

### Tools

- `P` — Pen
- `U` — Bulk paint
- `V` — Shading
- `D` — Dither
- `E` — Eraser
- `I` — Eye dropper
- `M` — Toggle symmetry
- `R` — Toggle the reference panel

### History

- `Ctrl/⌘ + Z` — Undo
- `Ctrl/⌘ + Shift + Z` or `Ctrl + Y` — Redo

> Single-letter shortcuts are ignored while you're typing in a text field, so entering a hex code or renaming a skin won't switch tools.

---

## Touch and Mobile

The editor is fully touch-enabled:

- Drag to orbit, pinch to zoom
- The brush panel opens as a bottom sheet — the tool row always stays visible, and the chevron unfolds the color palette, symmetry, and the active brush's settings
- The parts filter opens as a full dialog

### Draw Mode vs View Mode

On touch devices in Editor mode, a single finger can either paint or move the camera — not both. The **Draw Mode / View Mode** button in the toolbar switches between them:

- **Draw Mode** — one finger paints; two fingers still pinch to zoom
- **View Mode** — one finger orbits the camera

---

## Apps

MineSkin PRO is also available as a native app on the **App Store** and **Google Play**, and as an installable web app (PWA) with offline support. The editor is the same in all of them.

---

## Tips & Best Practices

1. **Hide layers to reach what's under them** — the armor layer covers the body layer everywhere it's visible.
2. **Use the grid** when lining up details or matching both sides of the model.
3. **Symmetry saves half the work** on anything that mirrors — sleeves, legs, faces.
4. **Dither over flat fills** for texture that doesn't look painted on.
5. **Reference images beat guessing** — drop in artwork and pull colors straight from it.
6. **Download when you hit a milestone.** Skins are stored locally, and undo history doesn't survive a reload.
7. **Check your skin under different lighting** before exporting — the light settings will show you seams flat lighting hides.

---

## Support & Community

### Report Issues

Found a bug? Use **Settings → Help → Report a problem**, or file an issue on the [GitHub Repository](https://github.com/hamza512b/mineskin/issues).

### Join the Community

Connect with other skin creators on the [Discord Server](https://discord.gg/2egvhmqdza).

---

Made with ❤️ by [Hamza](https://hamza.se)
