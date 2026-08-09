# AI Slide Generator — Detailed Implementation Plan

## 1. Product Definition

Build a small AI-powered presentation generator for students.

Core flow:

```text
Presentation requirements
        ↓
      AI Agent
        ↓
 Presentation Markdown
        ↓
    Validation
        ↓
 Markdown Parser
        ↓
     Slide Data
        ↓
   HTML Renderer
        ↓
    CSS Slides
        ↓
 Presentation Preview
```

The application is NOT a PowerPoint replacement and should not attempt to clone Marp. The prototype focuses on one reliable workflow:

> AI → Markdown → Slides

The existing architecture defines the same core separation: AI generates content, Markdown is validated and parsed, and the frontend renderer creates the presentation UI. fileciteturn1file0L37-L63

---

## 2. MVP Requirements

### Required user flow

A user can:

1. Open the application.
2. Enter a topic.
3. Enter an audience.
4. Select slide count.
5. Select language.
6. Add optional instructions.
7. Click **Generate Presentation**.
8. Receive AI-generated Markdown.
9. See the Markdown.
10. See the generated slides.
11. Navigate between slides.
12. Edit the Markdown.
13. See the preview update.
14. Enter fullscreen presentation mode.

These requirements follow the existing prototype definition. fileciteturn1file0L67-L109

### Out of scope

Do not build:

- Authentication
- Database
- Collaboration
- Real-time editing
- Image generation
- AI voice
- AI presenter
- Drag-and-drop editor
- Complex animations
- Large theme systems
- PowerPoint-compatible editor
- Advanced PDF/PPTX export

---

# 3. Project Structure

Start with:

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

This matches the proposed architecture; keep the structure simpler if a file has no meaningful responsibility. fileciteturn1file0L113-L150

---

# 4. Implementation Order

Build in this exact order:

```text
Phase 1
Static Markdown → Slides

Phase 2
Slide Navigation

Phase 3
Markdown Editor

Phase 4
AI Generation

Phase 5
Validation + Error Handling

Phase 6
Fullscreen + Basic Polish

Phase 7
End-to-End Testing
```

Do not start with AI.

The deterministic Markdown → Slides pipeline must work first.

---

# 5. Phase 1 — Static Slide Renderer

## Goal

Prove that Markdown can become presentation slides without AI.

Use hardcoded Markdown:

```md
# Artificial Intelligence

Introduction to modern AI

---

# What is AI?

- Artificial Intelligence
- Machine Learning
- Neural Networks

---

# Applications

- Healthcare
- Education
- Transportation

---

# Conclusion

AI is becoming an important part of modern life.
```

### Step 1.1 — HTML shell

Create the basic application layout:

```html
<main id="app">
  <section id="setup-panel"></section>
  <section id="preview-panel"></section>
</main>
```

Add a slide container:

```html
<div id="slide-container"></div>
```

### Step 1.2 — Markdown parser

File:

```text
js/markdown/parser.js
```

Function:

```js
parseMarkdown(markdown)
```

Input:

```md
# What is AI?

- Machine learning
- Neural networks

---

# Applications

- Healthcare
- Education
```

Output:

```js
[
  {
    title: "What is AI?",
    bullets: [
      "Machine learning",
      "Neural networks"
    ],
    paragraphs: []
  },
  {
    title: "Applications",
    bullets: [
      "Healthcare",
      "Education"
    ],
    paragraphs: []
  }
]
```

### Supported syntax

For the prototype, support only:

```text
---       new slide
#         slide title
-         bullet
normal    paragraph
**text**  basic emphasis if easy
```

Do not implement full Markdown.

Do not reproduce Marp.

### Step 1.3 — Slide renderer

File:

```text
js/markdown/renderer.js
```

Function:

```js
renderSlide(slide)
```

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

### Step 1.4 — Security

Never execute AI/user-generated HTML.

Prefer:

```js
element.textContent = value;
```

over:

```js
element.innerHTML = value;
```

If HTML support is ever added, sanitize it first.

### Phase 1 checkpoint

Verify:

- Multiple slides render.
- Titles render.
- Bullets render.
- Paragraphs render.
- Empty input does not crash.
- No console errors.

---

# 6. Phase 2 — Slide Navigation

## Goal

Turn the static renderer into a presentation.

Maintain:

```js
let slides = [];
let currentSlide = 0;
```

Create `js/slides/slide-manager.js`.

Responsibilities:

```text
setSlides()
getCurrentSlide()
goToSlide(index)
nextSlide()
previousSlide()
```

Add:

```text
← Previous
2 / 6
Next →
```

Keyboard controls:

```text
ArrowRight / ArrowDown / Space → Next
ArrowLeft / ArrowUp             → Previous
```

Prevent moving before slide 1 or after the last slide.

### Phase 2 checkpoint

Verify:

- Next works.
- Previous works.
- Keyboard controls work.
- Counter is correct.
- Boundary conditions work.

---

# 7. Phase 3 — Markdown Editor

## Goal

Allow the user to inspect and edit the generated Markdown.

Use:

```html
<textarea id="markdown-editor"></textarea>
```

Do not build a full code editor.

Optional tabs:

```text
[ Preview ] [ Markdown ]
```

Live flow:

```text
Markdown textarea
       ↓
parseMarkdown()
       ↓
Slide Data
       ↓
renderSlides()
       ↓
Preview
```

If needed, debounce updates by roughly 200–300 ms.

Invalid Markdown must not crash the application.

Example message:

```text
Cannot render this slide:
Slide title is missing.
```

### Phase 3 checkpoint

Verify:

- Markdown can be edited.
- Preview updates.
- Invalid content does not crash.
- Navigation still works.

---

# 8. Phase 4 — AI Generation

## Goal

Replace hardcoded Markdown with AI-generated Markdown.

Input model:

```js
const presentationRequest = {
  topic,
  audience,
  slideCount,
  language,
  instructions
};
```

Example:

```js
{
  topic: "Artificial Intelligence",
  audience: "University students",
  slideCount: 6,
  language: "English",
  instructions: "Keep it simple for a 5-minute presentation."
}
```

The AI agent should:

1. Send the request to the API.
2. Receive Markdown.
3. Validate it.
4. Retry once if invalid.
5. Return valid Markdown.

---

# 9. AI Prompt

Use a strict system prompt:

```text
You are an AI presentation content generator.

Your job is to create concise presentation slides for students.

Return ONLY valid presentation Markdown.

Rules:

1. Follow the requested slide count.
2. Start every slide with a # title.
3. Separate slides using exactly:
   ---
4. Use short bullet points instead of long paragraphs.
5. Keep content appropriate for the requested audience.
6. Use a logical structure:
   introduction → main content → conclusion.
7. Do not generate HTML.
8. Do not generate CSS.
9. Do not generate JavaScript.
10. Do not add explanations before or after the Markdown.
11. Do not use unsupported Markdown syntax.
12. Make the content easy to present verbally.
```

Then provide the user requirements separately:

```text
Topic: Artificial Intelligence
Audience: University students
Slides: 6
Language: English
Instructions: Simple 5-minute presentation
```

The output contract is based on the architecture's required Markdown format and rules. fileciteturn1file0L239-L316

---

# 10. Phase 5 — API Endpoint

Use one endpoint:

```text
POST /api/generate
```

Request:

```json
{
  "topic": "Artificial Intelligence",
  "audience": "University students",
  "slideCount": 6,
  "language": "English",
  "instructions": "Simple 5-minute presentation"
}
```

Response:

```json
{
  "markdown": "# Artificial Intelligence

---

# What is AI?

- ..."
}
```

API responsibilities:

1. Validate request fields.
2. Build the AI prompt.
3. Call the selected model.
4. Extract Markdown.
5. Return JSON.
6. Return a friendly error when the model fails.

Do not put UI logic in the API.

Keep the AI provider/model configurable. fileciteturn1file0L480-L530

---

# 11. API Security

Never expose the AI API key in frontend JavaScript.

Preferred:

```text
Browser
   ↓
POST /api/generate
   ↓
API endpoint
   ↓
AI provider
   ↓
Markdown
   ↓
Browser
```

Use environment variables for secrets.

Example:

```text
AI_API_KEY=...
AI_MODEL=...
AI_BASE_URL=...
```

Never commit secrets.

The existing architecture explicitly requires server-side API key protection and safe rendering of generated content. fileciteturn1file0L534-L540

---

# 12. Phase 6 — Markdown Validation

File:

```text
js/ai/validator.js
```

Function:

```js
validatePresentationMarkdown(markdown, expectedSlideCount)
```

Minimum checks:

```text
✓ Markdown exists
✓ At least one slide exists
✓ Slide count matches requested count
✓ Every slide has a title
✓ No empty slides
✓ Separators are valid
```

Return:

```js
{
  valid: true,
  errors: []
}
```

or:

```js
{
  valid: false,
  errors: [
    "Expected 6 slides but received 5."
  ]
}
```

---

# 13. AI Retry Strategy

Never retry forever.

Use:

```text
Generate
   ↓
Validate
   ↓
Valid?
 ┌─┴─┐
Yes  No
│     │
Render Retry
       ↓
    Validate
       ↓
    Valid?
    ┌─┴─┐
   Yes  No
    │    │
 Render  Error
```

Maximum:

```text
2 generation attempts
```

If the second attempt fails:

```text
We couldn't generate a valid presentation.
Please try again.
```

The architecture already specifies a single retry and no infinite retry loop. fileciteturn1file0L320-L351

---

# 14. Phase 7 — Loading and Error States

## Loading

When generation starts:

```text
Generating presentation...
```

Disable the Generate button:

```text
[ Generating... ]
```

Prevent duplicate requests.

## Success

Display the generated presentation.

## Error

Possible user-facing messages:

```text
AI request failed.
Invalid AI response.
No presentation content returned.
Network error.
```

Do not expose raw stack traces.

---

# 15. Phase 8 — Fullscreen

Use the browser Fullscreen API.

Button:

```text
[ Fullscreen ]
```

Keyboard:

```text
F       → Enter fullscreen
Escape  → Exit fullscreen
```

Do not build a custom fullscreen system.

---

# 16. Phase 9 — Basic CSS

Keep the presentation visually simple.

Use 16:9:

```css
.slide {
  width: 1280px;
  height: 720px;
  padding: 64px;
  box-sizing: border-box;
}
```

Support:

- Slide title
- Subtitle
- Paragraph
- Bullets
- Slide number
- Consistent spacing
- Readable typography

Do not spend significant time on decorative design.

The original architecture explicitly prioritizes functional output over a professional presentation-design platform. fileciteturn1file0L544-L569

---

# 17. Phase 10 — Application State

Do not introduce Redux or another state-management library.

Use simple JavaScript state:

```js
const state = {
  presentationRequest: {
    topic: "",
    audience: "",
    slideCount: 6,
    language: "English",
    instructions: ""
  },

  markdown: "",

  slides: [],

  currentSlide: 0,

  isGenerating: false
};
```

Keep the prototype understandable.

---

# 18. Main Application Flow

`app.js` should coordinate modules.

```text
User submits form
       ↓
Collect input
       ↓
Set loading state
       ↓
generatePresentation()
       ↓
Receive Markdown
       ↓
Validate Markdown
       ↓
Set markdown
       ↓
parseMarkdown()
       ↓
Set slides
       ↓
renderSlides()
       ↓
Show first slide
       ↓
Remove loading state
```

`app.js` should coordinate rather than contain every implementation detail.

---

# 19. Optional Regeneration

If the core system is stable, add:

```text
[ Regenerate ]
```

Flow:

```text
Current request
      ↓
AI generation
      ↓
Validation
      ↓
New Markdown
      ↓
Parser
      ↓
Renderer
```

Do not implement per-slide regeneration until the core prototype works.

---

# 20. Optional Markdown Download

If time permits:

```text
Markdown
 ↓
Blob
 ↓
Browser download
 ↓
presentation.md
```

No cloud storage is needed.

---

# 21. Testing Plan

## Parser test

Input:

```md
# Slide One

- A
- B

---

# Slide Two

- C
- D
```

Expected:

```text
2 slides
Slide 1 title = Slide One
Slide 2 title = Slide Two
```

## Empty Markdown

Expected:

```text
Validation error.
```

## Missing title

Input:

```md
- A
- B

---

# Slide Two
```

Expected:

```text
Invalid slide.
```

## Wrong slide count

Requested:

```text
6
```

AI returns:

```text
5
```

Expected:

```text
Validator rejects output.
Retry once.
```

## Navigation

Test:

```text
First slide → Previous unavailable
Middle slide → Both work
Last slide → Next unavailable
```

## AI failure

Simulate API failure.

Expected:

```text
Friendly error message.
Generate button becomes usable again.
```

## Markdown editing

Change:

```md
# What is AI?
```

to:

```md
# What is Artificial Intelligence?
```

Expected:

```text
Preview updates.
```

---

# 22. Security Tests

Verify:

- API key is not in frontend source.
- API key is not committed to Git.
- AI-generated HTML is not executed.
- User input is safely rendered.
- Invalid AI output cannot crash the application.
- Duplicate requests are prevented while loading.

---

# 23. End-to-End Test

Use:

```text
Topic:
Artificial Intelligence

Audience:
University students

Slides:
6

Language:
English

Instructions:
Create a simple presentation suitable for a 5-minute class presentation.
```

Expected:

```text
Submit
 ↓
Loading
 ↓
API request
 ↓
AI generates Markdown
 ↓
Validator
 ↓
Parser
 ↓
Renderer
 ↓
6 slides appear
```

Then test:

```text
Next
Previous
Arrow keys
Space
Fullscreen
Markdown editing
Regeneration
```

---

# 24. Development Checklist

## Phase 1 — Renderer

- [ ] Create project
- [ ] Create HTML shell
- [ ] Create basic CSS
- [ ] Add sample Markdown
- [ ] Implement parser
- [ ] Implement renderer
- [ ] Display multiple slides

## Phase 2 — Controls

- [ ] Add slide state
- [ ] Add Next
- [ ] Add Previous
- [ ] Add counter
- [ ] Add keyboard controls
- [ ] Add fullscreen

## Phase 3 — Editor

- [ ] Add Markdown textarea
- [ ] Load Markdown
- [ ] Parse on edit
- [ ] Update preview
- [ ] Handle invalid Markdown

## Phase 4 — AI

- [ ] Create API endpoint
- [ ] Configure model
- [ ] Create system prompt
- [ ] Send request
- [ ] Receive Markdown
- [ ] Display Markdown
- [ ] Render slides

## Phase 5 — Reliability

- [ ] Add validator
- [ ] Add one retry
- [ ] Add loading state
- [ ] Add error state
- [ ] Prevent duplicate requests
- [ ] Test malformed responses

## Phase 6 — Polish

- [ ] Improve spacing
- [ ] Improve typography
- [ ] Responsive layout
- [ ] Empty states
- [ ] Small UX improvements
- [ ] README
- [ ] Final end-to-end test

---

# 25. Definition of Done

The prototype is complete when:

```text
[✓] User can enter topic
[✓] User can choose audience
[✓] User can choose slide count
[✓] User can choose language
[✓] User can add instructions
[✓] AI generates Markdown
[✓] Markdown is validated
[✓] Markdown is displayed
[✓] Markdown is parsed
[✓] Slides are rendered
[✓] Next/Previous works
[✓] Keyboard navigation works
[✓] Fullscreen works
[✓] Markdown editing works
[✓] Preview updates after editing
[✓] Loading state works
[✓] Error state works
[✓] Invalid AI output is handled
[✓] API key is protected
```

Everything else is optional.

---

# 26. Final Architecture

```text
                         ┌─────────────────────┐
                         │       Student       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Presentation Form   │
                         │                     │
                         │ Topic               │
                         │ Audience            │
                         │ Slide Count         │
                         │ Language            │
                         │ Instructions        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      AI Agent       │
                         │                     │
                         │ Analyze             │
                         │ Generate            │
                         │ Validate            │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ presentation.md     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Markdown Validator  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Markdown Parser     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Slide Data      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   HTML Renderer     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    CSS Slide UI     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Presentation Mode   │
                         │                     │
                         │ ←  Slide  →         │
                         │                     │
                         │      3 / 6          │
                         └─────────────────────┘
```

---

# 27. Responsibility Separation

Keep these responsibilities separate:

```text
AI
↓
CONTENT

Validator
↓
QUALITY CHECK

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

The most important rule:

> Build the deterministic Markdown → Slides pipeline first, then connect AI to it.

If the AI service is unavailable, the Markdown editor and slide renderer should still work.

---

# 28. Claude Code Implementation Instructions

Use this document as the implementation specification.

1. Read the complete plan before changing code.
2. Build phases in order.
3. Do not implement out-of-scope features.
4. Do not replace the architecture with a large framework.
5. Keep the code simple and modular.
6. Do not put all logic into one JavaScript file.
7. Never expose API keys in frontend code.
8. Never allow AI to generate arbitrary executable HTML/CSS.
9. Implement and test the Markdown parser before AI integration.
10. After every phase, verify that previous functionality still works.
11. Prefer small working implementations over abstractions.
12. Skip optional features if the core system is not stable.
13. Do not spend significant time on visual polish before the end-to-end flow works.
14. Keep a hardcoded Markdown sample so the renderer can work without AI.
15. At the end, report:
    - implemented features
    - files created/changed
    - how to run the project
    - environment variables required
    - known limitations
    - suggested next steps

The target is a working school-project prototype, not a production presentation platform.
