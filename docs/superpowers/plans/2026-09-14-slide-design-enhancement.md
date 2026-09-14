# Slide Design Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make generated decks use a small, reliable set of varied slide compositions while preserving the existing generation, preview, navigation, and PDF-export behaviour.

**Architecture:** Keep the AI response as safe, validated content. A deterministic frontend layout planner will inspect each title and point list, select a supported template from a registry, and fall back to the current bullet-focused design whenever the content is not a confident fit. Individual templates only render controlled DOM and CSS; the model never returns HTML, CSS, coordinates, or icon paths.

**Tech Stack:** Node.js backend with Zod validation; vanilla JavaScript frontend; HTML/CSS slide renderer; existing Hugeicons SVG library; Node test runner.

**Spec:** `docs/AI-Slide-Generation-Design-Specification.md`, `docs/superpowers/slide-renderer-design/SKILL.md`

## Global Constraints

- Preserve the current request, generation, preview, navigation, and browser-PDF export APIs.
- Keep `frontend/js/renderer.js` backward-compatible with the present `{ type, title, points, takeaway }` slide data.
- Do not generate, download, or show image placeholders; use typography, cards, Hugeicons, CSS shapes, and CSS/SVG connectors only.
- Keep the current `bullet-focus` layout as the safe fallback for every valid content slide.
- Use the existing dark navy/cyan design system, 16:9 slide size, header/footer treatment, and accessible text contrast.
- Do not allow model-provided HTML, CSS, selectors, coordinates, or arbitrary template names.
- Every selector decision must be deterministic for the same input deck.
- Do not repeat the same non-fallback template on adjacent content slides.

---

## File Structure

| Path | Responsibility |
|---|---|
| `frontend/js/slide-layouts.js` | Pure layout intent detection, eligibility checks, scoring, deck-level variety rules, and safe fallback selection. |
| `frontend/js/slide-templates.js` | Controlled DOM markup builders for all content templates. No selection logic. |
| `frontend/js/renderer.js` | Presentation orchestration only: resolve icon, request a plan, call a template, preserve cover and closing slide rendering. |
| `frontend/style.css` | Shared slide tokens plus isolated styles for each template and print-safe layout rules. |
| `frontend/test/slide-layouts.test.js` | Unit tests for intent recognition, score thresholds, fallback, and deck variety. |
| `frontend/test/slide-templates.test.js` | DOM/markup tests for controlled template output and semantic content placement. |
| `frontend/test/renderer-layout.test.js` | Integration tests proving renderer output selects templates without breaking the default output. |
| `frontend/test/fixtures/layout-presentations.js` | Short, intentional decks representing every supported layout and ambiguity cases. |
| `docs/slide-design-enhancement.md` | Maintainer guide: templates, eligibility rules, adding a template, and visual QA checklist. |

The backend schema, prompt, and validation rules are intentionally untouched in the first release. This makes the enhancement reversible and keeps the already-working model contract stable.

---

### Task 1: Establish a layout regression fixture suite

**Files:**
- Create: `frontend/test/fixtures/layout-presentations.js`
- Create: `frontend/test/slide-layouts.test.js`

**Interfaces:**
- Produces fixtures named `generalOverview`, `comparison`, `process`, `architecture`, `roadmap`, `cardGrid`, and `ambiguous`.
- Establishes the public planner interface: `planContentLayouts(slides) => Array<LayoutPlan>`.
- A `LayoutPlan` has `{ template, confidence, reasons }`, where `template` is one of `bullet-focus`, `card-grid`, `comparison`, `process`, `architecture`, or `roadmap`.

- [ ] **Step 1: Write failing intent-selection tests.**

```js
assert.equal(planContentLayouts(comparison.slides)[0].template, 'comparison');
assert.equal(planContentLayouts(process.slides)[0].template, 'process');
assert.equal(planContentLayouts(ambiguous.slides)[0].template, 'bullet-focus');
```

- [ ] **Step 2: Run the focused test and confirm it fails because the planner does not exist.**

Run: `npm test -- --test-name-pattern="layout"`

Expected: failure that `slide-layouts.js` or `planContentLayouts` is missing.

- [ ] **Step 3: Add fixtures with concise, unambiguous content.**

Use these representative titles:

```js
comparison: 'Manual Ordering vs QR Ordering'
process: 'How a QR Order Is Placed'
architecture: 'QR Ordering System Architecture'
roadmap: 'Implementation Roadmap'
cardGrid: 'Core Platform Benefits'
ambiguous: 'Why Digital Ordering Matters'
```

- [ ] **Step 4: Run the focused test again.**

Run: `npm test -- --test-name-pattern="layout"`

Expected: fixtures load and only planner-related assertions fail.

- [ ] **Step 5: Commit.**

```bash
git add frontend/test/fixtures/layout-presentations.js frontend/test/slide-layouts.test.js
git commit -m "test: add slide layout planning fixtures"
```

### Task 2: Build the pure layout planner with a safe fallback

**Files:**
- Create: `frontend/js/slide-layouts.js`
- Modify: `frontend/test/slide-layouts.test.js`

**Interfaces:**
- Produces `planContentLayouts(slides)` and `scoreSlideForTemplate(slide, template)`.
- Consumes content slides with `title`, `points`, and optional `takeaway`.
- Returns an immutable plan; it must not change the supplied slide objects.

- [ ] **Step 1: Add failing tests for score evidence, minimum confidence, and adjacent-template prevention.**

```js
const plans = planContentLayouts([processSlide, processSlide]);
assert.equal(plans[0].template, 'process');
assert.notEqual(plans[1].template, 'process');
assert.equal(plans[1].template, 'bullet-focus');
assert.match(plans[0].reasons.join(' '), /process/i);
```

- [ ] **Step 2: Run the test and verify the new assertions fail.**

Run: `npm test -- --test-name-pattern="layout"`

Expected: failure for missing scoring/variety behaviour.

- [ ] **Step 3: Implement explicit template eligibility and scoring.**

Use only inspectable evidence:

```js
const INTENT_TERMS = {
  comparison: ['vs', 'versus', 'comparison', 'before', 'after', 'benefits and limitations'],
  process: ['process', 'workflow', 'how it works', 'steps', 'flow'],
  architecture: ['architecture', 'system components', 'layers', 'platform structure'],
  roadmap: ['roadmap', 'timeline', 'phases', 'milestones', 'plan'],
  'card-grid': ['features', 'benefits', 'pillars', 'core areas', 'key capabilities']
};
```

Require 2–5 sufficiently short points for `process`, 3–4 for `card-grid`, and a clear title signal for `comparison`, `architecture`, and `roadmap`. Give a template a plan only when its score is at least `300`; otherwise return `bullet-focus`.

- [ ] **Step 4: Add deck-level variety logic.**

If the candidate equals the preceding non-cover template, use the next eligible template only when it scores at least `300`; otherwise use `bullet-focus`. Never force a weak alternate layout merely to create variety.

- [ ] **Step 5: Run all planner tests.**

Run: `npm test -- --test-name-pattern="layout"`

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add frontend/js/slide-layouts.js frontend/test/slide-layouts.test.js
git commit -m "feat: add deterministic slide layout planner"
```

### Task 3: Extract controlled template markup from the existing renderer

**Files:**
- Create: `frontend/js/slide-templates.js`
- Modify: `frontend/js/renderer.js`
- Create: `frontend/test/slide-templates.test.js`

**Interfaces:**
- `renderContentTemplate({ slide, plan, icon, presentationTitle, slideNumber, totalSlides }) => string`.
- Valid template names: `bullet-focus`, `card-grid`, `comparison`, `process`, `architecture`, `roadmap`.
- `renderer.js` remains the only module that calls the template renderer.

- [ ] **Step 1: Write a failing regression test for the existing bullet layout.**

```js
const markup = renderContentTemplate({ slide, plan: { template: 'bullet-focus' }, icon, presentationTitle, slideNumber: 2, totalSlides: 8 });
assert.match(markup, /slide-content/);
assert.match(markup, /slide-footer/);
assert.match(markup, /Safe, readable default/);
```

- [ ] **Step 2: Run the template test and verify it fails.**

Run: `npm test -- --test-name-pattern="template"`

Expected: failure because `renderContentTemplate` does not exist.

- [ ] **Step 3: Move existing content-slide markup into the `bullet-focus` builder without changing its HTML classes or content order.**

This is a preservation refactor. Keep existing escaping, icon resolution, slide header, takeaway footer, and slide-number logic.

- [ ] **Step 4: Update `renderer.js` to obtain a plan before rendering each content slide.**

```js
const layoutPlans = planContentLayouts(presentation.slides);
const markup = renderContentTemplate({
  slide,
  plan: layoutPlans[index],
  icon: selectIconForSlide(slide),
  presentationTitle: presentation.title,
  slideNumber: index + 2,
  totalSlides: presentation.slides.length + 2
});
```

- [ ] **Step 5: Run existing renderer icon tests and new template test.**

Run: `npm test -- --test-name-pattern="renderer|template"`

Expected: PASS; current fallback markup remains intact.

- [ ] **Step 6: Commit.**

```bash
git add frontend/js/slide-templates.js frontend/js/renderer.js frontend/test/slide-templates.test.js
git commit -m "refactor: separate slide templates from renderer"
```

### Task 4: Add card-grid and comparison templates

**Files:**
- Modify: `frontend/js/slide-templates.js`
- Modify: `frontend/style.css`
- Modify: `frontend/test/slide-templates.test.js`
- Create: `frontend/test/renderer-layout.test.js`

**Interfaces:**
- `card-grid` renders exactly one card per point (three or four only).
- `comparison` renders exactly two panels, split from the first two labelled point groups.
- Both templates return `bullet-focus` markup if their structural requirement is missing.

- [ ] **Step 1: Write failing template tests.**

```js
assert.equal(count(markup, 'class="slide-card"'), 3);
assert.match(comparisonMarkup, /comparison-panel--left/);
assert.match(comparisonMarkup, /comparison-panel--right/);
```

- [ ] **Step 2: Run the test and verify it fails.**

Run: `npm test -- --test-name-pattern="template|renderer layout"`

Expected: missing template classes.

- [ ] **Step 3: Implement card-grid.**

Split a point at the first colon into an optional card label and description. Use a bounded icon from the slide’s selected Hugeicon family only as a card accent; never select a new unrelated icon for every card.

- [ ] **Step 4: Implement comparison.**

Accept points formatted as `Heading: item one; item two`. Group the first two points only. If two groups cannot be built, render `bullet-focus`, not an incomplete comparison.

- [ ] **Step 5: Add CSS with a 16:9-safe grid.**

Use CSS grid, equal-height cards/panels, fixed content-area bounds, and print-safe colors. Retain title/header/footer alignment used by the existing theme.

- [ ] **Step 6: Run focused tests and inspect a generated fixture deck in preview and print view.**

Run: `npm test -- --test-name-pattern="template|renderer layout"`

Expected: PASS; manually confirm no clipping at normal preview and browser print scale.

- [ ] **Step 7: Commit.**

```bash
git add frontend/js/slide-templates.js frontend/style.css frontend/test/slide-templates.test.js frontend/test/renderer-layout.test.js
git commit -m "feat: add card and comparison slide templates"
```

### Task 5: Add process and roadmap templates

**Files:**
- Modify: `frontend/js/slide-templates.js`
- Modify: `frontend/style.css`
- Modify: `frontend/test/slide-templates.test.js`
- Modify: `frontend/test/renderer-layout.test.js`

**Interfaces:**
- `process` accepts three to five ordered points and renders connected numbered steps.
- `roadmap` accepts three to five phases and renders left-to-right milestone columns.
- Both return the default layout when content is too long or outside their count limits.

- [ ] **Step 1: Write failing tests for step count and connector markup.**

```js
assert.equal(count(processMarkup, 'class="process-step"'), 4);
assert.match(processMarkup, /process-connector/);
assert.equal(count(roadmapMarkup, 'class="roadmap-phase"'), 3);
```

- [ ] **Step 2: Run the test and verify it fails.**

Run: `npm test -- --test-name-pattern="template|renderer layout"`

Expected: missing process and roadmap structure.

- [ ] **Step 3: Implement process markup.**

Each point becomes a numbered, text-first step. Render connectors with CSS pseudo-elements or controlled SVG owned by the template; do not use model data for SVG attributes.

- [ ] **Step 4: Implement roadmap markup.**

Use the first colon as phase label when present. Render fixed-width phase cards on one baseline, with a compact status marker and no dates invented by the renderer.

- [ ] **Step 5: Add responsive and print-safe CSS.**

At slide scale preserve one horizontal row. At narrow application viewport scale, preserve the slide’s aspect ratio rather than reflowing it into a vertical document.

- [ ] **Step 6: Run focused tests and inspect both fixture slides in preview and browser print output.**

Run: `npm test -- --test-name-pattern="template|renderer layout|layout"`

Expected: PASS and no horizontal overflow inside the 16:9 frame.

- [ ] **Step 7: Commit.**

```bash
git add frontend/js/slide-templates.js frontend/style.css frontend/test/slide-templates.test.js frontend/test/renderer-layout.test.js
git commit -m "feat: add process and roadmap slide templates"
```

### Task 6: Add architecture template and density protection

**Files:**
- Modify: `frontend/js/slide-layouts.js`
- Modify: `frontend/js/slide-templates.js`
- Modify: `frontend/style.css`
- Modify: `frontend/test/slide-layouts.test.js`
- Modify: `frontend/test/slide-templates.test.js`

**Interfaces:**
- `architecture` renders three or four labelled layers.
- `isTemplateContentSafe(slide, template) => boolean` gates all specialized templates.

- [ ] **Step 1: Add failing safety tests.**

```js
assert.equal(isTemplateContentSafe(longPointArchitecture, 'architecture'), false);
assert.equal(planContentLayouts([longPointArchitecture])[0].template, 'bullet-focus');
assert.equal(count(architectureMarkup, 'class="architecture-layer"'), 3);
```

- [ ] **Step 2: Run and confirm failures.**

Run: `npm test -- --test-name-pattern="layout|template"`

Expected: missing safety gate and architecture markup.

- [ ] **Step 3: Implement a conservative density gate.**

Reject a specialized template if title exceeds 60 characters, any point exceeds 110 characters, total point characters exceed 360, or its count does not fit that template. The renderer must use `bullet-focus` after rejection.

- [ ] **Step 4: Implement architecture layers.**

Render ordered, stacked layer blocks with a controlled connector line and one contextual icon. Treat each point as a layer; do not infer undocumented technical relationships.

- [ ] **Step 5: Run all frontend tests.**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add frontend/js/slide-layouts.js frontend/js/slide-templates.js frontend/style.css frontend/test/slide-layouts.test.js frontend/test/slide-templates.test.js
git commit -m "feat: add architecture template with density safeguards"
```

### Task 7: Validate full-deck behaviour and document the template contract

**Files:**
- Modify: `frontend/test/renderer-layout.test.js`
- Create: `docs/slide-design-enhancement.md`
- Modify: `frontend/js/renderer.js` only if test findings reveal integration defects.

**Interfaces:**
- End-to-end fixture decks can be rendered without exceptions.
- The documentation lists every template, inputs, eligibility, fallback condition, and visual QA checks.

- [ ] **Step 1: Write a complete deck test.**

```js
const markup = renderer.renderPresentation(mixedLayoutDeck);
assert.match(markup, /template--comparison/);
assert.match(markup, /template--process/);
assert.match(markup, /template--architecture/);
assert.doesNotMatch(markup, /undefined/);
```

- [ ] **Step 2: Run the integration test.**

Run: `npm test -- --test-name-pattern="renderer layout"`

Expected: PASS.

- [ ] **Step 3: Produce three manual regression decks.**

Generate and inspect:

```text
1. Educational topic: "Create 8 slides explaining university life"
2. Product topic: "Create 8 slides presenting a QR restaurant ordering system"
3. Technical topic: "Create 8 slides explaining a cloud application architecture"
```

For each deck, verify template variety, icon relevance, readable text, no overlap, correct slide numbering, next/previous navigation, and successful browser PDF export.

- [ ] **Step 4: Document the extension rules.**

Include this mandatory procedure for new templates:

```text
1. Define data shape and count/length eligibility.
2. Add a selector scoring rule and threshold test.
3. Add controlled markup builder and CSS namespace.
4. Add safe fallback test.
5. Add it to a mixed-deck fixture and manually print-test it.
```

- [ ] **Step 5: Run the full frontend and backend test suites.**

Run: `npm test`

Run: `npm --prefix backend test`

Expected: both suites PASS. If the frontend has no root `package.json`, run the project’s documented frontend test command instead and record it in the commit message/body.

- [ ] **Step 6: Commit.**

```bash
git add frontend/test/renderer-layout.test.js docs/slide-design-enhancement.md frontend/js/renderer.js
git commit -m "docs: define slide template extension contract"
```

### Task 8: Optional second release — model-provided visual intent

**Files:**
- Modify: `backend/schema/presentation.js`
- Modify: `backend/prompt/system.js`
- Modify: `backend/validation/rules.js`
- Modify: `backend/test/unit/schema.test.js`
- Modify: `frontend/js/slide-layouts.js`
- Modify: `frontend/test/slide-layouts.test.js`

**Interfaces:**
- Optional field: `visualIntent?: 'overview' | 'comparison' | 'process' | 'architecture' | 'roadmap' | 'cards'`.
- `visualIntent` is advisory; the frontend planner must reject it if eligibility or density checks fail.

- [ ] **Step 1: Write failing schema tests for allowed and unsupported intent values.**

```js
assert.equal(validateSchema(validProcessIntent).success, true);
assert.equal(validateSchema({ ...validProcessIntent, visualIntent: 'freeform-dashboard' }).success, false);
```

- [ ] **Step 2: Run backend unit tests and confirm the new cases fail.**

Run: `npm --prefix backend test -- --testNamePattern=schema`

Expected: `visualIntent` is currently rejected as an unknown field.

- [ ] **Step 3: Add optional enum validation and prompt guidance.**

Instruct the model to omit `visualIntent` when uncertain. Never retry generation merely because it omits the field.

- [ ] **Step 4: Make planner intent hints a bounded score bonus only.**

Use at most `+120` score. The normal minimum of `300` and all density checks still apply.

- [ ] **Step 5: Run frontend and backend tests.**

Run: `npm test`

Run: `npm --prefix backend test`

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add backend/schema/presentation.js backend/prompt/system.js backend/validation/rules.js backend/test/unit/schema.test.js frontend/js/slide-layouts.js frontend/test/slide-layouts.test.js
git commit -m "feat: support advisory slide visual intent"
```

## Acceptance Criteria

- A normal existing deck still renders the current bullet-focused layout when no specialized pattern is a confident fit.
- Product, process, comparison, architecture, and roadmap content produces visibly different but theme-consistent layouts.
- No generated slide has clipped text, overlapping sections, missing footer/slide number, or invalid icon paths.
- Preview navigation and browser PDF export still work for every template.
- The selector is deterministic, explainable through `reasons`, and does not repeat a specialized layout immediately.
- The initial release needs no model schema change; optional model intent is a separate, later release.

## Plan Review

- **Spec coverage:** Uses controlled templates, preserves the fixed template as fallback, adds a small reusable pattern library, and keeps layout decisions out of the model.
- **Scope:** The first release is frontend-only and can be reviewed/reverted safely; backend contract changes are explicitly deferred to the optional second release.
- **Consistency:** Every specialized template has eligibility, density protection, test fixtures, fallback behavior, and preview/PDF QA.
