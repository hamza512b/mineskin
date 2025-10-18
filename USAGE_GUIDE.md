# Mineskin.pro Usage Guide

## Overview

Mineskin.pro is a powerful Minecraft skin editor and previewer that runs entirely in your browser. Edit your skins pixel-by-pixel with real-time 3D preview, advanced lighting controls, and professional editing tools.

---

## Getting Started

### First-Time Users

When you first open the editor in **Editing Mode**, an interactive tutorial will guide you through the basic features. You can restart this tutorial anytime from the Settings panel.

### Quick Start

1. **Upload** a skin using the Upload button (bottom action bar)
2. Switch between **Preview** and **Editing** modes using the mode selector
3. Start drawing with the **Pen Tool** (left toolbar)
4. **Save** your edited skin using the Save button

---

## Modes

### Preview Mode

- View your skin in 3D without editing tools
- Perfect for showcasing and inspecting your work
- Rotate the camera around the model
- Upload new skins

### Editing Mode

- Full access to all drawing and editing tools
- Real-time 3D preview while editing
- Pixel-perfect precision
- Undo/redo support

---

## Drawing Tools

Access all drawing tools from the **left toolbar** (Editing Mode only).

### Pen Tool (`P`)

Your primary drawing tool for pixel-by-pixel editing.

- Click on the 3D model to paint individual pixels
- Uses the currently selected color
- **Shortcut:** Press `P` to activate

### Bulk Paint Tool (`U`)

Fill entire sections with a single click.

- Paint connected areas of the same color
- Great for filling large sections quickly
- **Shortcut:** Press `U` to activate

### Eraser Tool (`E`)

Remove pixels from your skin.

- Click to erase individual pixels
- Erases from both base and overlay layers when both are visible
- **Shortcut:** Press `E` to activate

### Variation/Shading Tool (`V`)

Add depth and dimension to your skin.

- Creates color variations for shading effects
- Adjust intensity in Settings → Paint → Variation Tool Intensity
- **Shortcut:** Press `V` to activate

---

## Color Tools

### Color Picker

Located at the top of the left toolbar.

- Select any color using the color wheel and sliders
- Choose from a palette of colors already used in your skin
- Real-time preview of the selected color

### Eye Dropper Tool (`I`)

Pick colors directly from your skin.

- Click the Eye Dropper icon to activate
- Click any pixel on your 3D model to copy its color
- **Shortcut:** Press `I` to activate

---

## History Management

### Undo/Redo

Never lose your work with comprehensive undo/redo support.

- **Undo:** `Ctrl+Z` (Windows/Linux) or `⌘+Z` (Mac)
- **Redo:** `Ctrl+Shift+Z` or `Ctrl+Y` (Windows/Linux) or `⌘+Shift+Z` (Mac)
- Visual buttons available in the left toolbar
- _Note:_ History is not persistent after page reload

---

## Body Part Visibility

Control which parts of your skin are visible during editing.

### Desktop

Use the **Parts Filter panel** on the right side of the screen to:

- Toggle individual body parts (head, body, arms, legs)
- Show/hide base layer and overlay layer independently
- Great for accessing hard-to-reach areas

### Mobile

- Click the **Parts Filter icon** in the toolbar
- Opens a dialog with all visibility options
- Same controls as desktop in a mobile-friendly format

### Layers

- **Base Layer:** The main skin texture
- **Overlay Layer:** The second layer (hats, clothing, etc.)
- Toggle each part independently for precise editing

---

## Camera Controls

### Rotation Gizmo

Located in the top-right corner:

- Click and drag to rotate the camera around your skin
- Visual representation of current direction of the camera
- Smooth, intuitive 3D navigation

### Mouse/Touch Controls

- **Drag:** Rotate the camera
- **Scroll/Pinch:** Zoom in and out
- **Right-click drag:** Pan the camera (desktop)

### Advanced Camera Settings

Access via Settings panel:

- **Field of View:** Adjust perspective
- **Movement Speed:** Control camera movement speed
- **Damping:** Smooth or snappy camera movement

> Fun fact: You can lower the damping to 0 to make the camera move infinitely.

---

## Grid Toggle

Enable a visual grid overlay to help with pixel-perfect editing:

- Click the **Grid icon** in the toolbar
- Helps align pixels and maintain symmetry
- Available in Editing Mode only

---

## Advanced Settings

Access the **Settings panel** by clicking the gear icon in the toolbar.

### Skin Mode

- **Standard:** Regular arm width (4 pixels)
- **Slim Mode:** Thinner arms (3 pixels), also known as "Alex" model
- _Switching modes will modify the skin texture_

### Paint Settings (Editing Mode)

- **Variation Tool Intensity:** Control the strength of color variations (0.05 - 1.0)

### Skin Properties

#### Surface Appearance

- **Surface Brightness:** Control diffuse lighting (0 - 1.0)
- **Shine/Glossiness:** Add specular highlights (0 - 1.0)

#### Position Controls

- **Move Left/Right:** Move the skin horizontally on X-axis (-100 to 100)
- **Move Forward/Back:** Move the skin vertically on Z-axis (-100 to 100)
- **Move Up/Down:** Move the skin in the depth on Y-axis (-100 to 100)

#### Rotation Controls

- **Tilt Up/Down:** Rotate the skin around X-axis
- **Turn Left/Right:** Rotate the skin around Y-axis
- **Roll:** Rotate the skin around Z-axis

### Camera Settings

- **Field of View:** Adjust camera perspective
- **Movement Speed:** Control responsiveness (0 - 0.5)
- **Damping:** Smooth camera transitions (0 - 1.0)

### Lighting

#### Main Light

- **Main Light Intensity:** Control directional light strength (0 - 1.0)
- **Light Position:**
  - Left/Right (-10 to 10)
  - Up/Down (-10 to 10)
  - Forward/Back (-10 to 10)

#### Ambient Light

- **Overall Brightness:** Set base illumination level (0 - 1.0)
- Affects all surfaces uniformly

---

## File Management

### Upload Skin

- Click the **Upload** button in the bottom action bar
- Supports standard Minecraft skin formats (64x64 or 64x32)
- Compatible with both classic and slim models

### Save/Download

- Available in **Editing Mode** only
- Click the **Save** button to download your edited skin
- Downloads as a PNG file ready for Minecraft

---

## Keyboard Shortcuts

### Tool Selection

- `P` - Pen Tool
- `U` - Bulk Paint
- `E` - Eraser
- `V` - Variation/Shading
- `I` - Eye Dropper (Color Picker)

### History

- `Ctrl/⌘ + Z` - Undo
- `Ctrl/⌘ + Shift + Z` or `Ctrl + Y` - Redo

---

## Tips & Best Practices

### Editing Tips

1. **Use Layer Visibility:** Hide parts to access difficult areas
2. **Grid for Precision:** Enable the grid when aligning details
3. **Color Palette:** The color picker shows all colors in your skin for consistency
4. **Variation Tool:** Perfect for adding quick shading and depth
5. **Undo is Your Friend:** Don't be afraid to experiment!

### Performance

- The editor uses WebGL2 for hardware-accelerated rendering. It built on top WebGL api and optimized every frame so it could be run on most devices.
- Mobile-friendly interface for touch devices

### Workflow Suggestions

1. Start in **Preview Mode** to inspect an existing skin
2. Switch to **Editing Mode** to make changes
3. Use **Body Part Visibility** to isolate areas
4. **Save frequently** as undo history is not persistent
5. Test in different lighting conditions using the Light settings

---

## Support & Community

### Report Issues

Found a bug? Report it on the [GitHub Repository](https://github.com/hamza512b/minskin/issues)

### Join the Community

Connect with other skin creators on the [Discord Server](https://discord.gg/2egvhmqdza)

---

## Mobile Considerations

The editor is fully responsive and touch-enabled:

- Touch to paint with active tool
- Pinch to zoom
- Drag to rotate camera
- Action menu (three dots) provides quick access to Upload/Save

> On touch mobile , you can not batch paint or erase. Because the stroke is used for moving the camera.

---

Made with ❤️ by [Hamza](https://hamza.se)
