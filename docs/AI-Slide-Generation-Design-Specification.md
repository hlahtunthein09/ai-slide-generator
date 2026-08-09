# AI Slide Generation — Design Specification & Research Plan

## 0. Purpose

This document defines the **planning and research specification** for an AI-powered slide generator.

The project is currently in the **planning/research stage**.

The immediate goal is NOT to start implementation.

The goal is to determine how to design an AI generation system that can produce:

- useful student presentations
- visually consistent slides
- readable layouts
- structured content
- low hallucination rates
- predictable output
- low token/API cost
- maintainable and scalable templates

The system should work well even when using relatively small or free AI models.

The central principle is:

> **Do not give the AI unlimited creative control. Build a controlled generation system around the AI.**

---

# 1. Problem Definition

The project is not simply:

```text
User
 ↓
AI
 ↓
Markdown
 ↓
Slides
```

The real problem is:

```text
User Idea
    ↓
Understand presentation goal
    ↓
Plan presentation structure
    ↓
Plan individual slides
    ↓
Choose appropriate slide patterns
    ↓
Generate concise content
    ↓
Validate generated structure
    ↓
Render using controlled visual templates
    ↓
Check layout/content quality
    ↓
Final Presentation
```

The system therefore needs controls at multiple stages.

---

# 2. Core Design Philosophy

## 2.1 Controlled Generation

The AI should not freely design every aspect of the presentation.

Instead:

```text
AI controls:
    Meaning
    Content
    Structure
    Slide type selection

Application controls:
    Layout
    Typography
    Colors
    Spacing
    Grid
    HTML
    CSS
    Rendering
    Validation
```

Core principle:

> **AI should choose WHAT the slide communicates, not HOW the browser visually renders it.**

---

# 3. Why an AI Agent / Structured Workflow Is Needed

A free-form prompt such as:

```text
Create a beautiful presentation about Artificial Intelligence.
```

forces the model to simultaneously decide:

```text
Content
+
Story structure
+
Slide sequence
+
Layout
+
Typography
+
Visual hierarchy
+
Content length
+
Design
```

This creates:

- inconsistent layouts
- excessive text
- weak presentation structure
- unpredictable output
- invalid formatting
- visual overflow
- inconsistent slide density
- higher hallucination risk
- difficult validation
- difficult future scaling

The solution is to reduce the model's freedom and give it a constrained environment.

---

# 4. Target AI Architecture

```text
                         USER
                           │
                           ▼
                  ┌─────────────────┐
                  │   INPUT LAYER   │
                  └────────┬────────┘
                           │
                           ▼
                ┌────────────────────┐
                │ PRESENTATION PLANNER│
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   SLIDE PLANNER    │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ CONTENT GENERATOR  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ CONTENT VALIDATOR  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ TEMPLATE SELECTOR  │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │   SLIDE RENDERER   │
                └─────────┬──────────┘
                          │
                          ▼
                ┌────────────────────┐
                │ VISUAL VALIDATOR   │
                └─────────┬──────────┘
                          │
                          ▼
                    PRESENTATION
```

This is a conceptual architecture, not yet the final implementation architecture.

---

# 5. Do Not Build a Large Multi-Agent System Yet

The project should NOT immediately become:

```text
Planner Agent
Research Agent
Writer Agent
Designer Agent
Critic Agent
Editor Agent
Fact Checker Agent
...
```

That would increase:

- API calls
- token usage
- latency
- implementation complexity
- failure points

For the MVP, prefer a small controlled pipeline:

```text
AI Call
  ↓
Planning + Content Generation
  ↓
Deterministic Code Validation
  ↓
Template Selection
  ↓
HTML/CSS Rendering
  ↓
Optional AI Improvement
```

AI should only be called when AI reasoning is actually needed.

---

# 6. Research Tracks

The planning stage should research the following areas.

## Track 1 — Presentation Design

Study:

- visual hierarchy
- typography
- whitespace
- grid systems
- alignment
- contrast
- color
- composition
- slide density
- readability
- information hierarchy

Questions:

- What makes a slide readable?
- How much information should a slide contain?
- How should titles and supporting content be prioritized?
- How should whitespace be used?
- What makes a slide visually balanced?

## Track 2 — Presentation Storytelling

Study:

- opening
- context
- problem
- explanation
- evidence
- comparison
- process
- conclusion
- narrative flow
- audience awareness

Questions:

- How should slides flow from one to another?
- How should an educational presentation be structured?
- How should content change based on audience?
- How can a presentation avoid becoming a collection of unrelated slides?

## Track 3 — Slide Layout Patterns

Research reusable slide patterns such as:

```text
Title
Content
Section Divider
Two Column
Comparison
Process
Timeline
Statistics
Quote
Image + Text
Conclusion
```

The goal is not to create hundreds of layouts.

The goal is to create a small, reusable set of reliable patterns.

---

# 7. Design Pattern vs Template

These concepts must remain separate.

## Design Pattern

A design pattern defines:

> **When should this kind of slide be used?**

Example:

```text
If comparing two concepts
        ↓
Use COMPARISON
```

```text
If explaining sequential steps
        ↓
Use PROCESS
```

```text
If introducing a new topic
        ↓
Use SECTION
```

## Template

A template defines:

> **How is that pattern rendered visually?**

Therefore:

```text
Design Pattern = Decision
Template       = Implementation
```

---

# 8. Initial Slide Pattern Library

The MVP should begin with a small set of patterns:

```text
1. TITLE
2. CONTENT
3. SECTION
4. TWO_COLUMN
5. COMPARISON
6. PROCESS
7. TIMELINE
8. QUOTE
9. IMAGE_TEXT
10. CONCLUSION
```

Do not implement all of them immediately.

Start with approximately five reliable patterns and expand later.

---

# 9. Initial Five Templates

## 9.1 Title

```json
{
  "type": "title",
  "title": "...",
  "subtitle": "..."
}
```

## 9.2 Content

```json
{
  "type": "content",
  "title": "...",
  "bullets": [
    "...",
    "...",
    "..."
  ]
}
```

## 9.3 Section

```json
{
  "type": "section",
  "title": "...",
  "description": "..."
}
```

## 9.4 Comparison

```json
{
  "type": "comparison",
  "title": "...",
  "left": {
    "heading": "...",
    "items": ["...", "..."]
  },
  "right": {
    "heading": "...",
    "items": ["...", "..."]
  }
}
```

## 9.5 Conclusion

```json
{
  "type": "conclusion",
  "title": "Key Takeaways",
  "points": [
    "...",
    "...",
    "..."
  ]
}
```

---

# 10. Slide Schema as the AI/Application Contract

The slide schema should become the contract between AI and the renderer.

```text
AI
 │
 │ MUST produce schema
 ▼
Slide Schema
 │
 │ MUST satisfy validation
 ▼
Renderer
```

The AI should NOT generate:

- arbitrary HTML
- arbitrary CSS
- pixel coordinates
- inline styles
- JavaScript
- unknown layouts

The AI should produce structured slide information.

---

# 11. Content Constraints

Natural-language instructions such as:

```text
Keep it concise.
```

are not sufficient.

Use measurable constraints.

Example:

```text
CONTENT slide

title:
maximum 60 characters

bullets:
3–5

each bullet:
maximum 12 words

paragraph:
maximum 30 words
```

The exact limits should be determined during research/testing.

---

# 12. AI Freedom Levels

## AI CAN decide

```text
Presentation structure
Slide order
Slide type
Title wording
Bullet wording
Summary
Content grouping
```

## AI CANNOT decide

```text
HTML structure
CSS
Font family
Font size
Color values
Spacing values
Grid coordinates
Animation
Responsive behavior
```

---

# 13. Design System

The renderer should have a deterministic design system.

## Typography

Define:

```text
Title
Subtitle
Heading
Body
Caption
```

with controlled:

- font family
- size
- weight
- line height
- letter spacing

## Spacing

Define tokens such as:

```text
xs
sm
md
lg
xl
```

## Colors

Define controlled roles:

```text
background
surface
primary
secondary
text
muted
accent
border
```

AI should not invent colors.

## Grid

Define:

```text
slide dimensions
margins
columns
gaps
alignment
```

All templates should use the same design system.

---

# 14. Template Registry

Templates should be registered centrally.

Conceptual example:

```js
const templates = {
  title: TitleSlide,
  content: ContentSlide,
  section: SectionSlide,
  comparison: ComparisonSlide,
  process: ProcessSlide,
  timeline: TimelineSlide,
  quote: QuoteSlide,
  conclusion: ConclusionSlide
};
```

The AI returns:

```json
{
  "type": "timeline"
}
```

The renderer selects the matching template.

This makes the system scalable.

---

# 15. Knowledge System

The AI needs several types of knowledge.

## Presentation Knowledge

```text
storytelling
presentation structure
audience awareness
slide sequencing
```

## Visual Design Knowledge

```text
hierarchy
typography
spacing
alignment
contrast
color
grid
whitespace
```

## Slide Knowledge

```text
title slides
content slides
comparisons
processes
timelines
statistics
quotes
conclusions
```

## AI Knowledge

```text
structured generation
JSON Schema
prompt engineering
few-shot examples
context management
validation
hallucination reduction
```

## Engineering Knowledge

```text
HTML
CSS
DOM
rendering
responsive design
sanitization
validation
```

---

# 16. Prompt Engineering Strategy

Prompts should contain distinct layers:

```text
ROLE
  ↓
GOAL
  ↓
CONTEXT
  ↓
RULES
  ↓
AVAILABLE PATTERNS
  ↓
SCHEMA
  ↓
CONTENT CONSTRAINTS
  ↓
OUTPUT REQUIREMENTS
  ↓
EXAMPLES
```

Avoid giant vague prompts.

The system should give the model clear boundaries.

---

# 17. Prompt Rules

The AI should be explicitly told:

```text
You are generating structured presentation content.

You must:
- follow the provided schema
- use only supported slide types
- keep content concise
- follow content limits
- preserve the requested topic
- follow the target audience
- follow requested slide count
- maintain logical presentation flow

You must not:
- generate HTML
- generate CSS
- generate JavaScript
- invent unsupported slide types
- add arbitrary fields
- add unrelated content
- output explanations outside the required structure
```

---

# 18. Few-Shot Examples

Research whether examples improve the selected free models.

Examples should demonstrate:

- correct structure
- correct content density
- correct slide-type selection
- correct tone
- correct level of detail

Do not add many examples blindly.

More examples increase token usage.

The final prompt should use only the most useful examples.

---

# 19. Hallucination Control

Templates do not completely prevent factual hallucinations.

They mainly reduce:

```text
layout errors
formatting errors
structure drift
content overflow
unsupported output
```

Factual hallucination requires additional controls.

Potential layers:

```text
Layer 1
Strict system prompt

Layer 2
Structured schema

Layer 3
Content constraints

Layer 4
Deterministic validation

Layer 5
Source grounding

Layer 6
Editable preview
```

For the MVP, prioritize the first four.

---

# 20. Source Grounding — Future Direction

For factual presentations, a future architecture could be:

```text
User Topic
    ↓
Research / Sources
    ↓
Source-backed Notes
    ↓
Presentation Planner
    ↓
Slide Generator
    ↓
Citations
```

This should not necessarily be part of the first prototype.

It introduces:

- additional API calls
- additional token cost
- search complexity
- source management
- citation handling

For the MVP, keep it optional.

---

# 21. Validation System

Validation should be divided into deterministic checks and AI checks.

## Deterministic Validation

Use JavaScript whenever possible.

Check:

```text
✓ Schema validity
✓ Required fields
✓ Valid slide type
✓ Slide count
✓ Title presence
✓ Bullet count
✓ Text length
✓ Empty content
✓ Unknown fields
✓ Invalid values
```

These checks do not require AI tokens.

---

# 22. Rendering Validation

After rendering, check:

```text
✓ Text overflow
✓ Elements outside slide
✓ Empty regions
✓ Excessive content
✓ Minimum readable font size
✓ Invalid layout
```

The exact implementation should be researched later.

---

# 23. AI Critic

An AI critic should be optional.

Do NOT automatically use:

```text
Generate
 ↓
Critic
 ↓
Rewrite
```

for every presentation.

This increases token cost.

Prefer:

```text
Generate
 ↓
Deterministic validation
 ↓
Only if needed
 ↓
AI improvement
```

AI should be used when deterministic rules cannot judge the problem.

---

# 24. Retry Strategy

Never create an infinite retry loop.

Recommended:

```text
Generate
   ↓
Validate
   ↓
Valid?
 ┌──┴──┐
Yes    No
 │      │
Render  Retry
        ↓
      Validate
        ↓
      Valid?
      ┌─┴─┐
     Yes  No
      │    │
    Render Error
```

Maximum retry count should be small.

---

# 25. Token Optimization

Token efficiency should be a first-class design requirement.

## Principle 1 — Don't send unnecessary context

Do not send the entire design system with every request if the application can enforce it deterministically.

## Principle 2 — Keep schemas compact

Only include fields that the model actually needs.

## Principle 3 — Use deterministic validation

Do not ask AI to validate things JavaScript can validate.

## Principle 4 — Avoid unnecessary agents

Every additional AI step costs tokens and latency.

## Principle 5 — Use AI only for reasoning

Let code handle:

```text
validation
routing
rendering
formatting
layout
```

## Principle 6 — Conditional AI calls

Only call additional AI services when required.

---

# 26. Scalability Strategy

The system should scale by adding components, not rewriting the architecture.

For example:

```text
MVP
5 templates
      ↓
10 templates
      ↓
20 templates
      ↓
Theme system
      ↓
Custom themes
      ↓
Source grounding
      ↓
PPTX export
      ↓
Collaboration
```

The AI schema should remain stable as much as possible.

---

# 27. What Should Be Configurable?

Keep these configurable:

```text
AI model
AI provider
generation settings
slide count
language
audience
theme
template registry
content limits
```

Avoid hardcoding the AI provider into every component.

---

# 28. Research Sources

The planning research should include authoritative and technically relevant sources.

## Structured AI Output

- OpenRouter Structured Outputs
- Vercel AI SDK Structured Data
- JSON Schema documentation

## Presentation Systems

- Slidev
- Marp
- Markdown presentation systems

## Accessibility

- WCAG
- university presentation accessibility guidelines
- government design systems

## Design Systems

- typography systems
- spacing systems
- component systems
- grid systems

## Presentation Design

- professional presentation guidelines
- educational presentation guidelines
- slide layout research

Visual template galleries may be used for inspiration only.

Do not copy branded templates, artwork, or proprietary designs.

---

# 29. Research Questions

Before implementation, answer:

## Presentation Design

- What makes a slide visually effective?
- What is an acceptable content density?
- How much text is too much?
- How should hierarchy be established?

## Layout

- Which 5–10 patterns cover most student presentations?
- When should each pattern be selected?
- What layouts should never be generated?

## AI

- Which structured-output method works best with the selected free models?
- How reliable is JSON Schema enforcement?
- Which prompt structure performs best?
- How many examples are actually useful?

## Reliability

- Which errors can be detected deterministically?
- Which errors require AI evaluation?
- How should retries work?

## Cost

- How many AI calls are actually necessary?
- Which context can be removed?
- Which operations should be deterministic?

## Scalability

- How should new templates be added?
- How should themes be added?
- How should different models be supported?
- How should source grounding be introduced later?

---

# 30. Research Deliverables

Before coding, produce these artifacts:

```text
01. Presentation Principles
02. Presentation Storytelling Rules
03. Design System
04. Slide Pattern Catalog
05. Slide Template Catalog
06. Slide JSON Schema
07. Content Constraints
08. Prompt Specification
09. AI Agent Workflow
10. Validation Rules
11. Retry / Error Strategy
12. Token Optimization Strategy
13. Source Grounding Strategy
14. Scalability Plan
```

These documents become the foundation for implementation.

---

# 31. Final AI Control Model

```text
                     USER
                       │
                       ▼
              Presentation Request
                       │
                       ▼
               ┌───────────────┐
               │ AI PLANNER    │
               └───────┬───────┘
                       │
                       ▼
                Slide Structure
                       │
                       ▼
               ┌───────────────┐
               │ AI GENERATOR  │
               └───────┬───────┘
                       │
                       ▼
                Structured JSON
                       │
                       ▼
               ┌───────────────┐
               │ VALIDATOR     │
               └───────┬───────┘
                       │
                       ▼
                Valid Slide Data
                       │
                       ▼
               ┌───────────────┐
               │ PATTERN       │
               │ ROUTER        │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ TEMPLATE      │
               │ SYSTEM        │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ DESIGN SYSTEM │
               └───────┬───────┘
                       │
                       ▼
                  HTML + CSS
                       │
                       ▼
                 PRESENTATION
                       │
                       ▼
                Visual Checks
                       │
                       ▼
                  FINAL OUTPUT
```

---

# 32. Core Rules

### Rule 1

> **AI generates content, not arbitrary UI.**

### Rule 2

> **Use structured output instead of free-form output whenever possible.**

### Rule 3

> **Use deterministic code for deterministic problems.**

### Rule 4

> **Use fixed templates to control visual consistency.**

### Rule 5

> **Use design patterns to guide template selection.**

### Rule 6

> **Use measurable content constraints instead of vague instructions.**

### Rule 7

> **Do not add AI calls when normal code can solve the problem.**

### Rule 8

> **Do not build a large multi-agent system until the simple pipeline proves insufficient.**

### Rule 9

> **Design the schema and template system for future expansion.**

### Rule 10

> **Prioritize reliability and consistency over unlimited creativity.**

---

# 33. MVP Philosophy

The MVP does NOT need:

```text
100 templates
AI image generation
advanced animations
PPTX export
real-time collaboration
multi-agent orchestration
research agents
complex themes
```

The MVP needs:

```text
Good presentation structure
+
5 reliable slide patterns
+
Good design system
+
Structured AI output
+
Strong validation
+
Low token usage
+
Readable HTML/CSS rendering
```

---

# 34. Final Goal

The project should eventually become:

```text
             SMALL / FREE AI MODEL
                       │
                       ▼
               CONTROL SYSTEM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Schema         Prompts       Constraints
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Reliable Content
                       │
                       ▼
              Pattern Selection
                       │
                       ▼
                Fixed Templates
                       │
                       ▼
                 Design System
                       │
                       ▼
                 HTML / CSS
                       │
                       ▼
              High-quality Slides
```

The objective is not to make a small model magically smarter.

The objective is to **build enough structure around the model that a relatively weak model can consistently produce useful, attractive, and predictable presentation slides.**

---

# 35. Next Phase

Do NOT start implementation immediately after this document.

The next step is:

```text
Research
   ↓
Evaluate sources
   ↓
Extract principles
   ↓
Design patterns
   ↓
Design templates
   ↓
Define schema
   ↓
Define constraints
   ↓
Design prompts
   ↓
Design agent workflow
   ↓
Review architecture
   ↓
Only then implement
```

This document is therefore the **AI Slide Generation Design Specification & Research Plan**, not the final implementation specification.
