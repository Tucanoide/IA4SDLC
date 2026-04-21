# Design System Specification: The Terminal Authority

## 1. Overview & Creative North Star
This design system is not a mere nostalgia trip; it is a high-end editorial interpretation of 1980s data-brutalism. We are moving away from "standard" web layouts toward a signature digital experience that feels like a high-stakes, classified mainframe.

**Creative North Star: "The Ghost in the Machine"**
The aesthetic objective is to balance the cold, calculated precision of an early CRT terminal with the sophisticated spacing and typographic hierarchy of a premium fashion editorial. We reject the "template" look by utilizing intentional asymmetry, heavy monochrome contrast, and a rejection of modern "softness" (rounded corners, vibrant gradients, or multi-color palettes).

## 2. Colors & Atmospheric Depth
The palette is strictly anchored in the high-contrast relationship between deep obsidian and hyper-saturated phosphor green. 

*   **Primary (#00FF41):** Used exclusively for high-priority data and interactive states.
*   **Surface Hierarchy:** We utilize the provided surface-container tiers to create a "nested" terminal look.
    *   `surface-container-lowest (#0e0e0e)`: Used for the deepest "sunken" terminal wells.
    *   `surface-container-high (#2a2a2a)`: Used for raised modules or active command windows.

**The "No-Line" Rule**
Standard 1px CSS borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through background color shifts (e.g., a `surface-container-low` module nested within a `surface` background). 

**The Phosphor Glow & Signature Texture**
To move beyond a flat digital layout, all text must carry a faint `text-shadow` using the `primary` token at 40% opacity to simulate phosphor bleed. A global scanline overlay (a repeating linear gradient of 2px height) must be applied to the entire viewport to give the interface a physical, hardware-based soul.

## 3. Typography
The typography is the backbone of this system’s authority. Despite the "Strictly Monospace" requirement, we achieve editorial sophistication through radical scale shifts.

*   **Display-LG (3.5rem):** Used for "Status" or "System Error" headers. These should be treated as graphic elements rather than mere text.
*   **Headline-MD (1.75rem):** Used for section starts. 
*   **Label-SM (0.6875rem):** Used for technical metadata and timestamps.

**The Typographic Logic**
We utilize `VT323` or `IBM Plex Mono` to ensure that every character occupies the same horizontal space, creating "aligned columns" of text that mimic punch-card data. Headlines should be uppercase with slightly expanded letter spacing to command attention.

## 4. Elevation & Depth (Tonal Layering)
In this design system, "up" is not achieved through shadows, but through light emission and ASCII structure.

*   **The Layering Principle:** Depth is achieved by stacking surface-container tiers. For instance, an "Action Modal" should use `surface-container-highest` to appear as if it has more "voltage" than the background.
*   **The "Ghost Border":** When a container requires a perimeter, use the `outline-variant` token at 20% opacity. This creates a "shadow of a line," suggestive rather than restrictive.
*   **The ASCII Frame:** For high-end "Editorial" containers, use Unicode characters (┌ ─ ┐ │ └ ─ ┘) to build frames manually in the code. This reinforces the "low-tech, high-spec" identity.

## 5. Components

### Buttons (Physical Keycaps)
Buttons are modeled after heavy mechanical keyboards.
*   **Primary:** Solid `primary-container` (#00ff41) with `on-primary` (#003907) text. No rounded corners (`0px`).
*   **Hover State:** Invert the colors (Black background, Green text) and apply a "Glitch Jitter"—a 20ms CSS animation that randomly shifts the button’s X/Y position by 1-2px.
*   **Tertiary:** No background. Text-only with an underscore cursor ( _ ) that blinks at a 500ms interval.

### Input Fields (Command Line)
Inputs do not have boxes. They are represented by a prompt character `>` followed by a blinking block cursor. 
*   **State - Focus:** The entire line background shifts to `surface-container-low`.
*   **Error State:** The text shifts to `error` (#ffb4ab), and the "Screen Flicker" animation intensity increases for 300ms.

### Cards & Modules
*   **Rule:** Forbid the use of divider lines. 
*   **Separation:** Use vertical white space from the Spacing Scale (64px or 80px) to separate content blocks. 
*   **Header:** Every card must lead with a `label-sm` metadata string (e.g., "REF_NO: 8849-00").

### Status Indicators (Phosphor Chips)
Used for data tagging. These are high-contrast blocks with no padding on the top/bottom, only the sides, ensuring they sit flush with the line height of the text.

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align technical data to the right and narrative text to the left.
*   **Use Motion for Meaning:** Use a "typewriter" effect for loading text to reinforce the terminal metaphor.
*   **Layer with Scrims:** Use a semi-transparent `surface-dim` layer for overlays to keep the scanlines visible underneath.

### Don't:
*   **Don't use Border-Radius:** Every element must be a hard 90-degree angle. No exceptions.
*   **Don't use Curves:** Avoid icons with circular paths; if icons are needed, use ASCII characters or pixel-grid-based SVG icons.
*   **Don't use Multiple Colors:** If a second color is needed for urgency, use `error` (#ffb4ab) sparingly. The system's premium feel relies on its monochrome discipline.

## 7. Interactive States: The Glitch & Flicker
The system should feel slightly "unstable" but intentional. 
1.  **Global Flicker:** A subtle opacity animation (between 0.98 and 1.0) applied to the main container at random intervals.
2.  **Hover Glitch:** When the user hovers over a primary interactive element, the text should momentarily "split" into its RGB components or jitter, simulating a hardware malfunction on a high-end device.