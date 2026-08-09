# AI Slide Generator — Prototype Architecture

## 1. Project Goal

Build a simple AI-powered presentation generator for students.

Core flow:

User enters presentation requirements
→ AI Agent generates structured Markdown
→ Markdown is validated
→ Markdown is parsed into slide data
→ Slide renderer converts it into HTML
→ CSS displays the result as presentation slides

The project should be:
- Simple
- Functional
- Easy to understand
- Fast to prototype
- Useful for students who frequently create presentations

Do NOT build a PowerPoint clone.
Do NOT over-engineer the prototype.

---

## 2. Core Architecture

```text
User
  ↓
Presentation Input UI
  ↓
AI Agent
  ↓
Validated Markdown
  ↓
Markdown Parser
  ↓
Slide Data
  ↓
HTML Slide Renderer
  ↓
CSS
  ↓
Presentation Preview
```

AI is responsible for CONTENT generation.

The frontend renderer is responsible for PRESENTATION rendering.

Do not ask the AI to generate arbitrary HTML/CSS for slides.

---

## 3. MVP Features

### Required

- Topic input
- Audience input
- Slide count
- Language selection
- Optional presentation instructions
- Generate presentation button
- AI-generated Markdown
- Markdown validation
- Markdown editor/viewer
- Live slide preview
- Previous / Next slide navigation
- Current slide indicator
- Fullscreen presentation mode
- One simple default theme

### Optional if time permits

- 2–3 simple themes
- Regenerate presentation
- Regenerate a single slide
- Edit Markdown and instantly update preview
- Download Markdown file

### Explicitly OUT OF SCOPE for prototype

- Authentication
- Database
- Collaboration
- Real-time multi-user editing
- Image generation
- AI voice
- AI presenter
- Drag-and-drop slide editor
- Complex animations
- Large theme system
- PowerPoint-compatible editor
- Advanced PDF/PPTX export

Keep the scope small.

---

## 4. Recommended Project Structure

```text
ai-slide-generator/
│
├── index.html
│
├── css/
│   ├── main.css
│   ├── editor.css
│   ├── slides.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   │
│   ├── ai/
│   │   ├── agent.js
│   │   ├── prompt.js
│   │   └── validator.js
│   │
│   ├── markdown/
│   │   ├── parser.js
│   │   └── renderer.js
│   │
│   ├── slides/
│   │   ├── slide-manager.js
│   │   └── navigation.js
│   │
│   └── utils/
│       └── helpers.js
│
├── assets/
│
└── README.md
```

If a simpler structure is sufficient during implementation, do not create unnecessary files.

---

## 5. UI Layout

Use a simple two-panel interface.

```text
┌─────────────────────────────────────────────────────┐
│ AI Slide Generator                    [ Generate ]   │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│ Presentation Setup   │       Slide Preview          │
│                      │                              │
│ Topic                │    ┌──────────────────┐      │
│ [________________]   │    │                  │      │
│                      │    │     Slide        │      │
│ Audience             │    │     Content      │      │
│ [________________]   │    │                  │      │
│                      │    └──────────────────┘      │
│ Slides [ 6 ]         │                              │
│                      │         ← 2 / 6 →            │
│ Language [English]   │                              │
│                      │                              │
│ Instructions         │                              │
│ [________________]   │                              │
│                      │                              │
└──────────────────────┴──────────────────────────────┘
```

Optional tabs:

```text
[ Preview ] [ Markdown ]
```

The Markdown tab allows the user to inspect/edit generated Markdown.

---

## 6. Presentation Input Model

Use a simple JavaScript object:

```js
{
  topic: "Artificial Intelligence",
  audience: "University students",
  slideCount: 6,
  language: "English",
  instructions: "Keep it simple and suitable for a 5-minute presentation."
}
```

---

## 7. AI Agent Design

The AI Agent does not need to be a complex autonomous agent.

Use a small workflow:

```text
Input
 ↓
Analyze requirements
 ↓
Create slide outline
 ↓
Generate Markdown
 ↓
Validate output
 ↓
Return Markdown
```

### Agent responsibilities

1. Understand the topic.
2. Respect the requested audience.
3. Respect slide count.
4. Produce concise presentation content.
5. Use consistent slide structure.
6. Avoid unnecessary paragraphs.
7. Return ONLY the required Markdown format.

---

## 8. AI Output Contract

The AI must generate Markdown using this structure.

```md
# Presentation Title

Short subtitle or introduction

---

# Slide Title

- Point one
- Point two
- Point three

---

# Another Slide

- Point one
- Point two

---

# Conclusion

Short conclusion
```

### Markdown rules

- `---` means a new slide.
- `#` means the slide title.
- `##` may be used for a section heading if needed.
- `-` means a bullet point.
- `**text**` may be used for emphasis.
- Keep bullet points concise.
- Avoid deeply nested Markdown.
- Do not generate arbitrary HTML.
- Do not generate JavaScript.
- Do not generate CSS.
- Do not include explanations outside the presentation.

For the prototype, support only the Markdown syntax that the parser actually understands.

---

## 9. AI System Prompt

Use a strict system prompt similar to:

```text
You are an AI presentation content generator.

Your job is to create concise presentation slides for students.

Return ONLY valid presentation Markdown.

Rules:
1. Follow the requested slide count.
2. Start every slide with a # title.
3. Separate slides using exactly three hyphens:
   ---
4. Use short bullet points instead of long paragraphs.
5. Keep content appropriate for the requested audience.
6. Keep the presentation logically structured:
   introduction → main points → conclusion.
7. Do not generate HTML.
8. Do not generate CSS.
9. Do not generate JavaScript.
10. Do not add explanations before or after the Markdown.
11. Do not use unsupported Markdown features.
12. Make the content easy to present verbally.
```

The application should inject the user's presentation requirements separately.

---

## 10. Validation

Before rendering, validate the AI output.

Minimum checks:

```text
✓ Markdown exists
✓ At least one slide exists
✓ Number of slides matches requested count
✓ Every slide has a title
✓ No empty slides
✓ Separators are valid
```

Flow:

```text
AI Output
   ↓
Validator
   ↓
Valid?
 ┌─┴─┐
No  Yes
│     │
Retry  Render
```

If invalid, retry generation once with a correction prompt.

Do not create an infinite retry loop.

---

## 11. Markdown Parser

For the prototype, a custom lightweight parser is enough.

Example input:

```md
# What is AI?

- Machine learning
- Neural networks

---

# Applications

- Healthcare
- Education
```

Expected internal representation:

```js
[
  {
    title: "What is AI?",
    bullets: [
      "Machine learning",
      "Neural networks"
    ]
  },
  {
    title: "Applications",
    bullets: [
      "Healthcare",
      "Education"
    ]
  }
]
```

The parser should:

1. Split Markdown by `---`.
2. Detect the first `#` heading as the slide title.
3. Detect `-` lines as bullets.
4. Preserve basic paragraph text.
5. Ignore unsupported syntax safely.

---

## 12. Slide Renderer

Convert slide data into predictable HTML.

Example:

```html
<section class="slide">
  <h1>What is AI?</h1>

  <ul>
    <li>Machine learning</li>
    <li>Neural networks</li>
  </ul>
</section>
```

The renderer should never execute AI-generated HTML.

Use `textContent` or safe escaping when inserting AI-generated content into the DOM.

---

## 13. Slide Manager

Maintain:

```js
let slides = [];
let currentSlide = 0;
```

Responsibilities:

- Load slides
- Render current slide
- Move to next slide
- Move to previous slide
- Update slide counter
- Handle keyboard navigation

Keyboard controls:

```text
ArrowRight / Space → Next slide
ArrowLeft           → Previous slide
F                   → Fullscreen
Escape              → Exit fullscreen
```

---

## 14. Live Markdown Editing

If the Markdown editor is included:

```text
Markdown Editor
      ↓
Parser
      ↓
Slide Data
      ↓
Renderer
      ↓
Preview
```

When the user edits Markdown, the preview should update.

AI generation and rendering remain separate.

---

## 15. API Boundary

Do not expose the AI API key in browser-side JavaScript.

Preferred architecture:

```text
Browser
   │
   │ POST /api/generate
   ▼
API endpoint
   │
   │ API key
   ▼
Free AI Model
   │
   ▼
Markdown response
   │
   ▼
Browser
```

Expected request:

```json
{
  "topic": "Artificial Intelligence",
  "audience": "University students",
  "slideCount": 6,
  "language": "English",
  "instructions": "Simple 5-minute presentation"
}
```

Expected response:

```json
{
  "markdown": "# Artificial Intelligence

---

# What is AI?

- ..."
}
```

The exact AI provider/model can remain configurable.

---

## 16. Security Rules

- Never put an API secret directly in frontend JavaScript.
- Never execute AI-generated HTML.
- Never use `innerHTML` with untrusted AI output unless properly sanitized.
- Prefer `textContent` for generated text.
- Keep the AI endpoint server-side.

---

## 17. Simple Default Slide Design

Do not spend excessive time on visual design.

Use:

- 16:9 aspect ratio
- Simple readable typography
- Light or dark background
- Clear title
- Bullet list
- Slide number
- Consistent spacing

Example:

```css
.slide {
  width: 1280px;
  height: 720px;
  padding: 64px;
  box-sizing: border-box;
}
```

The goal is functional presentation output, not a professional presentation-design platform.

---

## 18. Prototype Development Order

Build in this exact order:

### Phase 1 — Static slide renderer

Create:

```text
Markdown
→ Parser
→ Slide Data
→ HTML
→ CSS
```

Use hardcoded Markdown first.

### Phase 2 — Navigation

Add:

- Next
- Previous
- Slide counter
- Keyboard controls
- Fullscreen

### Phase 3 — Markdown editor

Allow:

```text
Edit Markdown
→ Preview updates
```

### Phase 4 — AI generation

Connect:

```text
User Input
→ API
→ AI
→ Markdown
→ Validator
→ Parser
→ Renderer
```

### Phase 5 — Polish

Only after everything works:

- Loading state
- Error state
- Empty state
- Responsive layout
- Small UI improvements

Do NOT start with visual polish.

---

## 19. Definition of Done

The prototype is complete when a student can:

1. Open the application.
2. Enter a presentation topic.
3. Select slide count and language.
4. Click Generate.
5. Receive Markdown generated by the AI.
6. See the Markdown.
7. See the generated slides.
8. Navigate between slides.
9. Edit Markdown manually.
10. See the edited slides update.
11. Enter fullscreen presentation mode.

That is enough for the school project prototype.

---

## 20. Important Implementation Principle

Keep these responsibilities separate:

```text
AI
↓
CONTENT

Markdown Parser
↓
STRUCTURE

Renderer
↓
HTML

CSS
↓
VISUALS

Slide Manager
↓
PRESENTATION CONTROL
```

Do not mix all responsibilities into one JavaScript file.

The main goal is a working, understandable prototype—not a large production system.
