# Controlled AI Presentation Generator
## MVP Architecture & Implementation Specification

> **Project Goal**
>
> A small, controlled presentation-generation engine that turns a simple natural-language prompt into a structured, usable slide deck, even when using low-cost/free AI models.

---

# 1. Product Definition

The user should only need to enter something like:

```text
Create presentation slides about "AI Agents"
```

The system internally handles:

```text
User Prompt
    ↓
Prompt Builder
    ↓
AI Model
    ↓
Structured Presentation Data
    ↓
Schema Validation
    ↓
Presentation Constraint Validation
    ↓
Deterministic Renderer
    ↓
HTML/CSS Slide Deck
```

The user does NOT need to know:

- JSON
- schemas
- slide templates
- validation rules
- prompt engineering
- model capabilities
- CSS
- rendering rules
- retry logic

All controls are built into the application.

---

# 2. Core Design Philosophy

The architecture follows one fundamental separation:

```text
AI             → CONTENT
Schema         → STRUCTURE
Validator      → VALIDITY
Template       → VISUAL DESIGN
Renderer       → HTML/CSS
Model Adapter  → AI PROVIDER
Retry System   → FAILURE HANDLING
```

The AI must NOT control visual layout.

The AI must NOT generate arbitrary HTML/CSS.

The AI must NOT choose arbitrary slide layouts.

The AI generates presentation content inside a predefined contract.

The renderer owns the visual result.

---

# 3. MVP Scope

The MVP intentionally supports only ONE slide type.

## Supported slide type

```text
content
```

Every generated slide follows the same visual pattern.

Example:

```text
┌──────────────────────────────────────────────┐
│                                              │
│  SLIDE TITLE                                 │
│  Short optional visual divider               │
│                                              │
│  • Concise point                             │
│                                              │
│  • Concise point                             │
│                                              │
│  • Concise point                             │
│                                              │
│  • Concise point                             │
│                                              │
└──────────────────────────────────────────────┘
```

This is intentional.

Do NOT implement:

- timeline
- comparison
- image slide
- quote slide
- chart slide
- table slide
- multi-column layouts
- animations
- AI-generated CSS
- AI-generated HTML

during MVP.

These can be added later without changing the fundamental architecture.

---

# 4. Why One Fixed Template?

The experiments with free models showed that the models can generally generate reasonable presentation content, but output formatting differs.

Examples observed during testing:

- Nemotron generated YAML-like presentation structures.
- Ling 3.0 Tiny generated valid JSON.
- Laguna generated valid JSON.
- GPT-OSS generated YAML-like structures.
- Gemma produced YAML-like structures instead of JSON.
- Free models have different rate limits and capabilities.

Therefore, the application should NOT depend on the model behaving like a frontend developer.

Instead:

```text
Model
  ↓
simple structured content
  ↓
our deterministic template
```

This makes the final visual output independent of model quality.

---

# 5. Technology Stack

## Language

```text
TypeScript
```

Use strict TypeScript.

---

## Frontend

```text
Next.js
React
```

The UI is intentionally small.

Required UI:

```text
┌──────────────────────────────────────────────┐
│ AI Presentation Generator                   │
│                                              │
│ What do you want to present?                │
│                                              │
│ [ Create presentation about AI Agents     ] │
│                                              │
│                  [ Generate ]                │
│                                              │
└──────────────────────────────────────────────┘
```

After generation:

```text
┌──────────────────────────────────────────────┐
│ Presentation Preview                         │
│                                              │
│        ┌────────────────────────────┐        │
│        │                            │        │
│        │      Slide Preview         │        │
│        │                            │        │
│        └────────────────────────────┘        │
│                                              │
│       [ Previous ] [ Next ]                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 6. Core Libraries

Required:

```text
ai
@openrouter/ai-sdk-provider
zod
```

Recommended:

```text
lucide-react
```

for simple UI icons.

Optional:

```text
tailwindcss
```

Tailwind can be used for application UI.

However, the presentation template itself should use dedicated CSS so the visual system remains explicit and predictable.

---

# 7. What NOT to Add

Do NOT add unnecessary dependencies for MVP.

Avoid:

```text
Redux
Zustand
Framer Motion
Three.js
Chart libraries
Database
Authentication
Supabase
Vector database
RAG
Agent frameworks
Multi-agent frameworks
PDF generation
PPTX generation
Image generation
```

The MVP is a presentation-generation engine, not a complete SaaS platform.

---

# 8. AI Provider

Use:

```text
OpenRouter
```

through:

```text
@openrouter/ai-sdk-provider
```

This provides access to multiple models behind a common provider layer.

The application must NOT hard-code model-specific logic throughout the codebase.

---

# 9. Model Abstraction

Create a model abstraction.

Conceptual interface:

```ts
interface PresentationModel {
  id: string;
  provider: string;

  capabilities: {
    structuredOutput: boolean;
  };

  generate(
    prompt: string
  ): Promise<unknown>;
}
```

However, the application should expose only:

```ts
generatePresentation()
```

to the rest of the application.

The rest of the application should not care whether the model is:

```text
Laguna
Ling
GPT-OSS
Nemotron
Gemma
```

---

# 10. Initial Model Strategy

The previously tested models showed:

### Laguna XS 2.1

Observed:

```text
Good structured JSON
Good slide organization
Consistent content
```

Use as a primary MVP candidate if available.

---

### Ling 3.0 Tiny

Observed:

```text
Good JSON structure
Concise content
Consistent slide structure
```

Also suitable as a primary candidate.

---

### GPT-OSS 20B

Observed:

```text
Good semantic content
YAML-like formatting in testing
```

Can be used if structured output handling is reliable.

---

### Gemma 4 26B A4B

Observed:

```text
Good content
Did not reliably output JSON
```

Do not make this the primary structured-output model for MVP unless the provider's structured-output mechanism handles it reliably.

---

### Nemotron 3 Ultra

Observed:

```text
Good presentation content
Rate-limit problem during testing
```

Do not make the MVP dependent on it.

---

# 11. Model Configuration

Keep model configuration in one file.

Example:

```ts
export const modelConfig = {
  primary: "MODEL_ID",
  fallback: "MODEL_ID",

  maxRetries: 1,
};
```

Do not scatter model IDs throughout the code.

---

# 12. Presentation Schema

The MVP schema intentionally remains extremely small.

```ts
const presentationSchema = z.object({
  title: z.string().min(1).max(100),

  subtitle: z.string().min(1).max(150),

  slides: z
    .array(
      z.object({
        type: z.literal("content"),

        title: z.string().min(1).max(60),

        points: z
          .array(
            z.string().min(1).max(140)
          )
          .min(3)
          .max(5),
      })
    )
    .min(4)
    .max(8),
});
```

The important decision is:

```text
type = "content"
```

is fixed.

There is no arbitrary layout type.

---

# 13. Example Valid Output

```json
{
  "title": "Understanding AI Agents",
  "subtitle": "An Introduction to Autonomous Intelligent Systems",
  "slides": [
    {
      "type": "content",
      "title": "What Are AI Agents?",
      "points": [
        "Software systems that perceive their environment",
        "Make decisions based on goals",
        "Take actions using available tools",
        "Operate with varying levels of autonomy"
      ]
    },
    {
      "type": "content",
      "title": "Core Components",
      "points": [
        "Perception gathers information",
        "Reasoning determines what to do",
        "Memory stores relevant information",
        "Actions interact with external systems"
      ]
    }
  ]
}
```

---

# 14. Why Schema B Is Better Than Schema A

The model experiments compared structures like:

### Schema A

```json
{
  "title": "...",
  "slides": [
    {
      "title": "...",
      "points": []
    }
  ]
}
```

and:

### Schema B

```json
{
  "title": "...",
  "slides": [
    {
      "type": "content",
      "title": "...",
      "points": []
    }
  ]
}
```

Schema B should be used.

Reason:

```text
type
```

creates an explicit contract between:

```text
AI
 ↓
schema
 ↓
renderer
```

Even though MVP has only one type, it makes future expansion possible:

```text
content
section
comparison
image
chart
quote
```

without changing the fundamental architecture.

For MVP, only:

```text
content
```

is enabled.

---

# 15. Prompt Architecture

Do not use one giant natural-language prompt.

Build the prompt from controlled sections.

```text
SYSTEM INSTRUCTIONS
        +
PRESENTATION RULES
        +
CONTENT RULES
        +
QUALITY RULES
        +
SCHEMA REQUIREMENTS
        +
USER REQUEST
```

---

# 16. Prompt Specification

Internal prompt structure:

```text
ROLE

You are a presentation content generation engine.

TASK

Create a concise educational presentation based on the user's topic.

PRESENTATION GOAL

The presentation should explain the topic clearly to a general audience.

CONTENT RULES

- Stay focused on the requested topic.
- Avoid unnecessary details.
- Avoid repeating the same idea.
- Use concise statements.
- Prefer factual, broadly accepted information.
- Do not invent statistics, studies, quotations, or citations.
- Do not add unrelated topics.

STRUCTURE RULES

- Generate 4–8 slides.
- Each slide has one clear idea.
- Each slide has 3–5 points.
- Each point must be concise.
- The final slide should summarize the topic.

VISUAL SAFETY RULES

- Keep titles short.
- Keep points short enough for a presentation.
- Avoid paragraphs.
- Avoid extremely long words or sentences where possible.

OUTPUT RULES

Return only the required structured presentation object.

USER REQUEST

{{userPrompt}}
```

---

# 17. Prompt Engineering Principle

The model should conceptually follow:

```text
Understand
    ↓
Plan
    ↓
Select important ideas
    ↓
Write concise content
    ↓
Package into schema
```

Do not turn the model into a simple field-filling machine.

The schema is a final structural constraint.

The AI should focus primarily on semantic quality.

---

# 18. Context Protection

The prompt should explicitly prevent topic drift.

Rules:

```text
Stay within the requested topic.

Do not introduce unrelated subjects.

Each slide must contribute to explaining the main topic.

Do not repeat information across slides.

Do not invent unsupported facts.

If a detail is uncertain, prefer a general accurate statement.
```

This does not eliminate hallucination completely.

It reduces unnecessary hallucination and topic drift.

---

# 19. Hallucination Control

MVP does NOT attempt to build a full factual verification system.

That would require:

```text
search
retrieval
sources
citation extraction
fact checking
```

and would increase complexity and token usage.

Instead use:

```text
focused prompt
+
limited content
+
structured schema
+
validation
+
deterministic renderer
```

For MVP.

Later:

```text
Research Agent
     ↓
Sources
     ↓
Presentation Agent
```

can be added.

---

# 20. Validation Architecture

Use two levels.

```text
                 AI OUTPUT
                     │
                     ▼
          ┌────────────────────┐
          │ Structural         │
          │ Validation         │
          │ Zod                │
          └─────────┬──────────┘
                    │
                  valid?
                 /      \
               no        yes
               │          │
               ▼          ▼
             retry   Presentation
                       Validation
                           │
                         valid?
                        /      \
                      no        yes
                      │          │
                    retry        ▼
                              Renderer
```

---

# 21. Structural Validation

Zod checks:

```text
correct object
correct fields
correct types
required fields
slide count
point count
string lengths
literal type
```

Example:

```ts
presentationSchema.safeParse(output);
```

Never directly render unvalidated model output.

---

# 22. Presentation Validation

After schema validation, run custom rules.

Example:

```ts
function validatePresentationRules(
  presentation: Presentation
) {
  // title length
  // subtitle length
  // slide count
  // point count
  // point length
  // duplicate titles
  // duplicate points
}
```

---

# 23. Required Presentation Rules

MVP:

```text
4–8 slides

3–5 points per slide

title <= 60 characters

point <= 140 characters

subtitle <= 150 characters

no empty strings

no duplicate slide titles

no duplicate points within a slide

type must equal "content"
```

These numbers are intentionally conservative.

They are not universal presentation laws.

They exist because the fixed template needs predictable content density.

---

# 24. Why Validation Is Separate From Schema

Important:

```text
Schema-valid
≠
Presentation-valid
```

Example:

```text
"The Comprehensive Evolution and Future Development of Autonomous Multi-Agent Artificial Intelligence Systems"
```

may be valid JSON and valid Zod data.

But it may still produce a bad visual slide.

Therefore:

```text
Schema
→ data correctness

Presentation Validator
→ template safety
```

---

# 25. Failure Classification

The system should classify failures.

```text
VALIDATION_ERROR
RATE_LIMIT
TIMEOUT
PROVIDER_ERROR
MALFORMED_OUTPUT
UNKNOWN_ERROR
```

---

# 26. Retry Policy

MVP should NOT implement an autonomous multi-agent repair loop.

Use:

```text
Generate
   ↓
Validate
   ↓
Success → Render
   ↓
Failure
   ↓
ONE retry
```

Maximum:

```text
1 retry
```

This protects:

```text
token cost
rate limits
latency
complexity
```

---

# 27. Retry Prompt

If validation fails, do not resend the entire conversation unnecessarily.

Use a compact repair instruction:

```text
The previous presentation did not satisfy the required presentation format.

Regenerate the presentation.

Requirements:
- 4–8 slides
- 3–5 points per slide
- concise titles
- concise points
- type must be "content"
- return only the required structured object
```

If using structured output, let the schema mechanism handle structural correction where possible.

---

# 28. Rate Limit Handling

For:

```text
429
```

do NOT immediately perform many retries.

Use:

```text
retry once
```

or fallback model.

Example:

```text
Primary Model
      ↓
Rate limited
      ↓
Fallback Model
      ↓
Generate
```

Fallback priority should be configured centrally.

---

# 29. Renderer Contract

The renderer accepts ONLY validated presentation data.

```ts
function renderPresentation(
  presentation: Presentation
): string
```

It must never accept raw AI output.

Flow:

```text
unknown
 ↓
Zod
 ↓
Presentation
 ↓
Renderer
```

---

# 30. Renderer Responsibility

Renderer controls:

```text
slide size
background
font
font sizes
spacing
margins
title position
point spacing
bullet styling
alignment
colors
overflow protection
```

AI controls none of these.

---

# 31. Fixed Visual Specification

MVP visual system:

```text
Aspect ratio: 16:9

Layout: centered content container

Large title

Short subtitle where applicable

Readable body text

Generous whitespace

Consistent margins

Consistent vertical rhythm

Consistent bullet spacing

High text/background contrast

No decorative complexity
```

The design goal is:

```text
Simple
+
Clean
+
Readable
+
Consistent
+
Slightly modern
```

Not:

```text
Complex
+
Fancy
+
Animation-heavy
```

---

# 32. CSS Design Tokens

Create CSS variables.

Example:

```css
:root {
  --slide-width: 1280px;
  --slide-height: 720px;

  --slide-padding: 72px;

  --title-size: 42px;
  --body-size: 24px;

  --point-gap: 18px;

  --background: #ffffff;
  --foreground: #111111;
  --muted: #666666;
}
```

The exact visual values can be adjusted after the first render.

The important thing is that they are centralized.

---

# 33. Renderer HTML Contract

Every slide should produce predictable HTML.

Conceptual structure:

```html
<section class="slide slide-content">
  <div class="slide-inner">

    <header class="slide-header">
      <h2 class="slide-title">
        ...
      </h2>
    </header>

    <main class="slide-content-body">
      <ul class="slide-points">
        <li>...</li>
        <li>...</li>
        <li>...</li>
      </ul>
    </main>

  </div>
</section>
```

No model-generated HTML.

---

# 34. Presentation Preview

MVP preview should support:

```text
Previous
Next
Current slide number
Total slide count
```

Example:

```text
[ ← ]    Slide 2 / 6    [ → ]
```

The presentation can be rendered inside a fixed 16:9 preview container.

---

# 35. Scaling Strategy

The architecture must allow future templates without requiring AI changes.

Current:

```text
type = content
```

Future:

```text
type = content
type = section
type = comparison
type = quote
type = image
```

Then renderer:

```ts
switch (slide.type) {
  case "content":
    return renderContentSlide(slide);

  case "section":
    return renderSectionSlide(slide);

  // future
}
```

The AI can later choose from an allowed set of slide types.

MVP does not enable that.

---

# 36. Project Structure

Recommended structure:

```text
src/
│
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   │
│   └── api/
│       └── generate/
│           └── route.ts
│
├── components/
│   ├── PromptInput.tsx
│   ├── GenerateButton.tsx
│   ├── PresentationPreview.tsx
│   ├── SlideViewer.tsx
│   └── NavigationControls.tsx
│
├── presentation/
│   │
│   ├── schema.ts
│   ├── types.ts
│   ├── validation.ts
│   ├── rules.ts
│   │
│   ├── prompts/
│   │   ├── system.ts
│   │   └── builder.ts
│   │
│   ├── models/
│   │   ├── types.ts
│   │   ├── registry.ts
│   │   └── openrouter.ts
│   │
│   ├── generator.ts
│   ├── retry.ts
│   │
│   └── renderer/
│       ├── renderPresentation.ts
│       ├── renderSlide.ts
│       └── presentation.css
│
├── lib/
│   └── utils.ts
│
└── styles/
    └── globals.css
```

---

# 37. Responsibility of Each Module

## `schema.ts`

Owns:

```text
Presentation schema
Zod validation
Type inference
```

---

## `rules.ts`

Owns:

```text
slide count
point count
length limits
duplicate detection
content density rules
```

---

## `prompts/system.ts`

Owns the stable AI instructions.

---

## `prompts/builder.ts`

Combines:

```text
system rules
+
user request
```

into the generation prompt.

---

## `models/types.ts`

Defines model abstraction.

---

## `models/registry.ts`

Stores available models.

Example:

```ts
export const models = {
  primary: "...",
  fallback: "...",
};
```

---

## `models/openrouter.ts`

Only module responsible for OpenRouter-specific implementation.

This prevents provider-specific code from spreading through the application.

---

## `generator.ts`

Main orchestration:

```text
prompt
 ↓
model
 ↓
structured output
 ↓
schema
 ↓
presentation validation
```

---

## `retry.ts`

Owns:

```text
retry count
failure classification
fallback
```

---

## `renderer/`

Owns all visual output.

AI never touches this layer.

---

# 38. Main Generation Function

Conceptual API:

```ts
generatePresentation({
  userPrompt,
});
```

Internally:

```text
generatePresentation()
        │
        ▼
buildPrompt()
        │
        ▼
generateWithModel()
        │
        ▼
schema validation
        │
        ▼
presentation validation
        │
     ┌──┴──┐
   valid  invalid
     │      │
     │    retry
     ▼      │
  return ←─┘
```

---

# 39. API Endpoint

MVP:

```text
POST /api/generate
```

Input:

```json
{
  "prompt": "Create presentation slides about AI agents"
}
```

Success:

```json
{
  "success": true,
  "presentation": {
    "title": "...",
    "subtitle": "...",
    "slides": []
  }
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Unable to generate presentation"
  }
}
```

Do not expose internal provider errors directly to the user.

Log them server-side.

---

# 40. Security Boundaries

The API key must remain server-side.

Never expose:

```text
OPENROUTER_API_KEY
```

to the browser.

Environment:

```text
OPENROUTER_API_KEY=...
```

The browser communicates only with:

```text
/api/generate
```

---

# 41. Token Cost Strategy

The MVP intentionally uses:

```text
1 generation
+
1 validation
+
0 additional AI calls
```

normally.

Only failure causes:

```text
1 retry
```

No:

```text
critic agent
review agent
fact checker agent
designer agent
repair agent
```

in MVP.

---

# 42. Why This Is Scalable

Although the MVP is small, the boundaries are already correct.

Current:

```text
One model
One schema
One slide type
One template
One renderer
```

Future:

```text
Multiple models
Multiple schemas
Multiple slide types
Multiple templates
Multiple renderers
```

without replacing the core pipeline.

---

# 43. Future Architecture

Eventually:

```text
                    USER
                      │
                      ▼
                Intent Parser
                      │
                      ▼
              Presentation Planner
                      │
                      ▼
              Content Generator
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Research Tool       Knowledge
             │                 │
             └────────┬────────┘
                      ▼
                  Validator
                      │
                      ▼
                 Slide Planner
                      │
                      ▼
                   Renderer
```

But this is NOT MVP.

---

# 44. Explicit MVP Non-Goals

Do not implement these before the demo:

```text
❌ Authentication
❌ Database
❌ Saving presentations
❌ User accounts
❌ Collaboration
❌ RAG
❌ Web research agent
❌ Multi-agent system
❌ Image generation
❌ Charts
❌ PPTX export
❌ PDF export
❌ Advanced animations
❌ Multiple visual themes
❌ Drag-and-drop editor
❌ AI-generated HTML
❌ AI-generated CSS
```

---

# 45. MVP Acceptance Criteria

The project is considered successful if:

### Input

User enters:

```text
Create presentation slides about "AI Agents"
```

### Output

The application generates:

```text
4–8 slides
```

with:

```text
title
subtitle
3–5 points per slide
```

and every slide follows the same visual template.

---

# 46. Quality Requirements

The generated deck should be:

```text
Readable
Consistent
Topic-focused
Concise
Structurally valid
Visually stable
Usable as a real presentation
```

The system does NOT need to produce:

```text
professional agency-level design
```

for MVP.

The goal is:

> **A free model producing surprisingly usable slides because the system controls everything around the model.**

---

# 47. The Core Insight Behind the Project

The project is NOT:

```text
"Ask an AI to make slides."
```

It is:

```text
"Build a controlled environment where a weak/cheap AI
can reliably produce usable presentation content."
```

The model is only one component.

The quality comes from:

```text
Prompt
+
Schema
+
Constraints
+
Validation
+
Template
+
Renderer
+
Failure Handling
```

---

# 48. Final Architecture

```text
                         ┌──────────────┐
                         │    USER      │
                         └──────┬───────┘
                                │
                                │ Plain English
                                ▼
                    ┌──────────────────────┐
                    │    Prompt Builder    │
                    │                      │
                    │ Task                 │
                    │ Content Rules        │
                    │ Structure Rules       │
                    │ Quality Rules         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Model Adapter     │
                    │                      │
                    │ OpenRouter            │
                    │ Primary Model         │
                    │ Fallback Model        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Structured Generation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Zod Schema         │
                    │   Validation          │
                    └──────────┬───────────┘
                               │
                         VALID?
                         /    \
                       NO      YES
                       │        │
                       ▼        ▼
                    Retry    Presentation
                              Rules Validator
                                  │
                               VALID?
                               /    \
                             NO      YES
                             │        │
                           Retry      ▼
                                ┌──────────────┐
                                │   Renderer   │
                                │              │
                                │ Fixed        │
                                │ Template     │
                                │ HTML + CSS   │
                                └──────┬───────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │   Preview    │
                                │              │
                                │ 16:9 Slides  │
                                └──────────────┘
```

---

# 49. Contract Summary

The entire system can be understood as seven contracts:

```text
1. VISUAL CONTRACT
   What a slide looks like.

2. DATA CONTRACT
   What a presentation must contain.

3. PROMPT CONTRACT
   How the model should generate content.

4. VALIDATION CONTRACT
   What counts as acceptable output.

5. RELIABILITY CONTRACT
   What happens when generation fails.

6. MODEL CONTRACT
   How models/providers are accessed.

7. RENDERER CONTRACT
   How validated data becomes HTML/CSS.
```

These contracts are the actual architecture.

---

# 50. Implementation Order for Claude Code

Claude Code should implement in this exact order:

```text
STEP 1
Create Next.js + TypeScript project.

STEP 2
Install:
- ai
- @openrouter/ai-sdk-provider
- zod
- lucide-react

STEP 3
Create Presentation Type + Zod Schema.

STEP 4
Create presentation validation rules.

STEP 5
Create fixed visual specification.

STEP 6
Create HTML/CSS renderer.

STEP 7
Create renderer preview using static test data.

STEP 8
Create OpenRouter model adapter.

STEP 9
Create prompt builder.

STEP 10
Connect structured generation to schema.

STEP 11
Add validation pipeline.

STEP 12
Add one retry.

STEP 13
Add fallback model.

STEP 14
Create `/api/generate`.

STEP 15
Connect frontend prompt input.

STEP 16
Display generated slides.

STEP 17
Add previous/next navigation.

STEP 18
Test with multiple topics.

STEP 19
Fix overflow and content-density problems.

STEP 20
Prepare demo.
```

---

# 51. First Test Topics

Use different categories to test whether the system generalizes:

```text
AI Agents

Computer Networks

Software Engineering

Climate Change

Database Systems

Cybersecurity

JavaScript

```

The output should maintain the same visual structure while changing the content.

---

# 52. Final MVP Principle

Do not optimize for:

```text
maximum features
```

Optimize for:

```text
maximum control
with minimum complexity
```

The target architecture is:

```text
                    SMALL
                      +
                  CONTROLLED
                      +
                   CHEAP
                      +
                DETERMINISTIC
                      +
                   USABLE
```

This is the MVP.

The first demo does not need to prove that the system can create every possible presentation.

It only needs to prove:

> **A user can type one simple sentence, and a low-cost/free model can produce a structured, readable, visually consistent presentation because the application—not the model—controls the presentation system.**