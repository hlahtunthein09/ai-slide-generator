# Presentation Slide Design Template v1

## Purpose

This document defines the **single fixed visual template** for the presentation generator.

The presentation-generation system is already implemented.

The goal now is **not to change the generation architecture or schema**, but to improve the visual appearance of the existing generated slides.

The system should continue using **one consistent slide design pattern**.

The design should be:

- Simple
- Modern
- Clean
- Visually attractive
- Easy to read
- Consistent across the entire deck
- Easy to implement with HTML/CSS/SVG
- Suitable for automatically generated content

The design should avoid unnecessary complexity.

---

# 1. Current Design Direction

The existing generated slides already follow a simple structure:

```text
Slide Title
────────────

• Content point

• Content point

• Content point

• Content point
```

The new design should **preserve this basic structure**.

Do not completely replace the existing bullet-based content layout with complicated cards, dashboards, diagrams, or multiple layout types.

Instead, improve the current template through:

- stronger typography
- better spacing
- better visual hierarchy
- header
- footer
- slide numbering
- subtle accent colors
- SVG icons
- improved cover slide
- improved closing slide
- consistent visual identity

The objective is to make the current output look like a polished presentation rather than introducing a completely different presentation system.

---

# 2. Presentation Structure

Every generated presentation should follow this fixed structure:

```text
┌─────────────────────────────┐
│ 1. Cover / Intro Slide      │
├─────────────────────────────┤
│ 2. Content Slide            │
│ 3. Content Slide            │
│ 4. Content Slide            │
│ ...                         │
├─────────────────────────────┤
│ Last. Thank You Slide       │
└─────────────────────────────┘
```

The cover and thank-you slides are special visual states of the same theme.

The middle slides use the main content template.

---

# 3. Cover / Intro Slide

The first slide should clearly look like the beginning of a presentation.

It should use the generated presentation:

```text
title
subtitle
```

### Visual structure

```text
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│                                              │
│                                              │
│                  PRESENTATION                │
│                     TITLE                    │
│                                              │
│                  Subtitle text               │
│                                              │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

### Requirements

- Presentation title should be large.
- Subtitle should be smaller.
- Both should be centered.
- Strong visual hierarchy.
- Plenty of whitespace.
- No bullet points.
- No unnecessary decorative elements.
- No random icon required.

The title and subtitle must be dynamically taken from the generated presentation content.

Example:

```text
AI Agents

Understanding Autonomous Intelligent Systems
```

The template itself remains fixed while the content changes dynamically.

---

# 4. Main Content Slide

The main content slide is the most important template.

The basic structure should remain:

```text
┌──────────────────────────────────────────────┐
│ Slide Title                    Presentation  │
│ ─────────────────────────────      Title     │
│                                              │
│ • Content point                              │
│                                              │
│ • Content point                   [ SVG ]    │
│                                              │
│ • Content point                              │
│                                              │
│ • Content point                              │
│                                              │
│ Key takeaway                         03/08   │
└──────────────────────────────────────────────┘
```

The content remains primarily text-based.

The visual improvement comes from better composition rather than adding many UI elements.

---

# 5. Slide Title

The slide title should remain at the **top-left**.

Example:

```text
Common Cyber Threats
────────────────────
```

The title should have:

- large readable font
- strong weight
- dark primary text
- consistent position
- consistent spacing

The title position should be identical on every content slide.

---

# 6. Title Accent Line

A thin horizontal accent line should appear underneath the slide title.

Example:

```text
Common Cyber Threats
────────────────────────────────────
```

The line should:

- be subtle
- use the presentation's primary accent color
- have consistent thickness
- have consistent spacing from the title

The accent line is part of the fixed template.

It should not be generated by the AI.

---

# 7. Header

A small presentation identifier should appear at the **top-right** of every content slide.

Example:

```text
Common Cyber Threats                         AI Agents
──────────────────────────────────────────────────────
```

The presentation title should use a muted gray color.

Recommended visual characteristics:

```text
Small
Muted
Light-weight
Secondary information
```

The header should remain in the same location on every content slide.

---

# 8. Content Area

The generated points remain the primary content.

Example:

```text
• Malware and viruses can steal personal data.

• Ransomware can lock important files.

• Social engineering manipulates users.

• Credential stuffing uses leaked passwords.
```

The content should have:

- comfortable line spacing
- clear separation between points
- readable font size
- strong contrast
- sufficient whitespace

Avoid packing too much information into the slide.

---

# 9. Visual Area

Reserve a consistent visual area on the **right side** of the slide.

Conceptually:

```text
┌──────────────────────────────────────────────┐
│ Content Area                     Visual Area │
│                                              │
│ 65–70%                           30–35%      │
│                                              │
└──────────────────────────────────────────────┘
```

The visual area is optional.

It should primarily be used for relevant SVG icons.

---

# 10. SVG Icon System

The project can maintain a collection of local SVG icons.

Example:

```text
icons/
├── ai.svg
├── brain.svg
├── code.svg
├── database.svg
├── network.svg
├── security.svg
├── shield.svg
├── cloud.svg
├── user.svg
├── settings.svg
├── search.svg
└── ...
```

The icon should be selected based on the semantic meaning of the slide content.

Examples:

```text
AI / intelligence       → brain.svg
Security                → shield.svg
Database                → database.svg
Computer networks       → network.svg
Programming             → code.svg
Cloud computing         → cloud.svg
Users / people          → user.svg
Settings / systems      → settings.svg
Search / research       → search.svg
```

---

# 11. Icon Placement

The preferred icon position is the **right-side visual area**.

Example:

```text
┌──────────────────────────────────────────────┐
│ Core Components                   AI Agents  │
│ ──────────────────────────────────────────── │
│                                              │
│ • Perception                         ┌────┐  │
│                                    │    │  │
│ • Reasoning                        │ SVG│  │
│                                    │    │  │
│ • Memory                           └────┘  │
│                                              │
│ • Action                                      │
│                                              │
│ Key takeaway                         03/08   │
└──────────────────────────────────────────────┘
```

### Why the right side?

The right-side placement:

- preserves the existing title structure
- keeps the main text aligned
- does not disturb the title
- creates a visual balance
- provides a predictable location
- allows icons to be optional

---

# 12. Icon Size

Icons should be large enough to act as a visual anchor but not so large that they become the main subject of the slide.

The icon should visually occupy approximately:

```text
20–30%
```

of the slide's usable visual area.

The exact size should be controlled by CSS.

Do not dynamically resize icons based on arbitrary AI instructions.

---

# 13. Icon Usage Rules

Use an icon when:

- a relevant icon exists
- the relationship to the slide topic is clear
- it improves visual recognition
- it does not interfere with text

Do not use an icon when:

- there is no relevant icon
- the relationship is weak
- it looks decorative without meaning
- it makes the slide visually crowded

**No icon is better than an unrelated icon.**

---

# 14. Footer

Every content slide should have a small footer.

The footer contains two pieces of information:

```text
Key takeaway                                  03/08
```

### Left

A short takeaway related to the slide.

### Right

The current slide number and total number of slides.

Example:

```text
Key takeaway: Human behavior is a major security factor.       04 / 08
```

Footer text should be:

- small
- muted gray
- visually secondary
- consistent across the deck

---

# 15. Slide Number

Slide numbers should use:

```text
01 / 08
02 / 08
03 / 08
...
08 / 08
```

The numbering should include the total number of slides.

The position should always be:

```text
Bottom-right
```

The number should be visually subtle and should never compete with the main content.

---

# 16. Thank You / Closing Slide

The final slide should be automatically rendered using the same presentation title and subtitle.

Structure:

```text
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│                   Thank You                  │
│                                              │
│                   AI Agents                  │
│                                              │
│       Understanding Autonomous Systems       │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

### Requirements

- Always appears as the final slide.
- Large "Thank You" text.
- Presentation title displayed underneath.
- Presentation subtitle displayed underneath.
- Centered layout.
- Same visual identity as the cover.
- Minimal decoration.

---

# 17. Cover and Thank You Relationship

The opening and closing slides should visually belong together.

```text
Cover

        AI Agents

Understanding Autonomous
Intelligent Systems
```

and:

```text
Thank You

        AI Agents

Understanding Autonomous
Intelligent Systems
```

They should use:

- the same typography
- the same background
- the same accent color
- similar spacing
- similar alignment

This creates a clear beginning and ending for the presentation.

---

# 18. Color System

Use a small controlled palette.

Recommended direction:

```text
Background     → very light / white
Primary text   → dark
Secondary text → gray
Muted text     → light gray
Accent         → one primary accent color
Border         → very light gray
```

Example:

```css
--background: #f8fafc;
--text-primary: #0f172a;
--text-secondary: #475569;
--text-muted: #94a3b8;
--accent: #4f46e5;
--border: #e2e8f0;
```

The exact color values can be tuned later.

The important rule is:

> Keep the deck visually consistent instead of giving every slide different colors.

---

# 19. Color Boxes / Cards

Small color boxes can be used as **subtle decorative elements**.

However, they should not replace the existing content structure.

Recommended usage:

```text
Small accent block
Small icon background
Subtle highlighted area
Small visual separator
```

Avoid turning every bullet into a large colorful card.

The design should remain closer to:

```text
Minimal editorial presentation
```

rather than:

```text
Dashboard UI
```

---

# 20. Typography Hierarchy

The visual hierarchy should follow:

```text
Presentation Title
        ↓
Slide Title
        ↓
Body Content
        ↓
Header / Footer
```

Example:

```text
AI AGENTS
        ← largest

Common Cyber Threats
        ← large

• Malware and viruses...
        ← readable

AI Agents
Key takeaway...
03 / 08
        ← small / muted
```

Typography should be consistent across every slide.

---

# 21. Whitespace

Whitespace is an intentional part of the design.

Do not attempt to fill every empty area.

The current generated slides already have a relatively spacious composition.

The new design should preserve that characteristic.

Whitespace should be used to:

- separate sections
- improve readability
- give SVG icons room
- create visual hierarchy
- prevent visual clutter

---

# 22. Overall Visual Composition

The target composition is:

```text
┌──────────────────────────────────────────────────┐
│ Slide Title                         Presentation │
│ ──────────────────────────────────────────────── │
│                                                  │
│                                                  │
│ • Content point                       ┌───────┐  │
│                                      │       │  │
│ • Content point                      │  SVG  │  │
│                                      │ ICON  │  │
│ • Content point                      │       │  │
│                                      └───────┘  │
│                                                  │
│ • Content point                                 │
│                                                  │
│ Key takeaway                             03/08  │
└──────────────────────────────────────────────────┘
```

This should be the **default visual composition for content slides**.

---

# 23. Design Principles

The final template should follow these principles:

### 1. One clear idea per slide

Do not visually overcrowd a slide.

### 2. Content remains primary

Decorations should support the content.

### 3. Fixed positions

Header, title, footer and visual zones should not move randomly between slides.

### 4. Consistent visual identity

The entire presentation should look like one designed deck.

### 5. Semantic visuals

Icons should have a meaningful relationship with the content.

### 6. Controlled decoration

Use visual elements carefully.

### 7. Readability first

A beautiful slide that is difficult to read is a bad slide.

---

# 24. What Should NOT Be Added Yet

The current version should avoid:

- complex card layouts
- multiple template types
- charts
- diagrams
- generated images
- AI-generated SVG
- complicated animations
- large gradients
- excessive shadows
- random colors
- random icon positions
- complex background illustrations
- AI-generated CSS

These can be considered in future versions.

---

# 25. Target Result

The current output:

```text
Slide Title
────────────

• Point

• Point

• Point

• Point
```

should evolve into:

```text
┌──────────────────────────────────────────────┐
│ Slide Title                       Deck Title │
│ ──────────────────────────────────────────── │
│                                              │
│ • Point                              [ ICON ]│
│                                              │
│ • Point                                      │
│                                              │
│ • Point                                      │
│                                              │
│ • Point                                      │
│                                              │
│ Key takeaway                         03 / 08 │
└──────────────────────────────────────────────┘
```

while keeping the underlying generated content unchanged.

---

# 26. Design Goal

The final result should feel like:

> **A clean, modern, minimal presentation template that happens to be automatically generated.**

It should not feel like:

> **An AI-generated webpage containing some bullet points.**

The template should therefore prioritize:

```text
Consistency
    ↓
Readability
    ↓
Visual hierarchy
    ↓
Subtle decoration
    ↓
Semantic SVG visuals
```

rather than maximizing the number of visual effects.

---

# 27. Future Expansion

The current template intentionally remains one fixed design.

If the project is expanded later, the same design system can evolve into:

```text
Template v1
    ↓
Improved typography
    ↓
Improved icon system
    ↓
Theme variations
    ↓
Alternative layouts
    ↓
Charts / diagrams
    ↓
Images
    ↓
Advanced presentation themes
```

The current goal is **not** to build all of these now.

The goal is to make the existing single template visually strong, consistent, and usable.