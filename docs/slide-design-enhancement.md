# Slide Design Enhancement

## Core boundary

The AI generates only validated presentation content: a title, points, and an optional takeaway. The frontend engine selects and renders the visual design. AI output must never contain HTML, CSS, pixel positions, SVG markup, or arbitrary template names.

## Current template registry

| Template | Used when | Required content | Safe fallback |
|---|---|---|---|
| `bullet-focus` | Content is general or uncertain | Any valid point list | This is the default. |
| `card-grid` | Title signals features or benefits | 3–4 concise points | `bullet-focus` |
| `comparison` | Title signals versus/comparison | 2–5 points; the first two are `Label: explanation` sides and remaining points are shared insights | `bullet-focus` |
| `process` | Title signals process, workflow, steps, or flow | 3–5 concise points | `bullet-focus` |
| `architecture` | Title signals architecture, layers, or system components | 3–4 concise `Label: explanation` points | `bullet-focus` |
| `roadmap` | Title signals roadmap, timeline, or phases | 3–4 concise points | `bullet-focus` |

The planner requires a score of at least 300 before it selects a specialized template. A title longer than 60 characters, a point longer than 110 characters, or more than 360 total point characters rejects specialized layouts. This keeps generated decks readable even when the model returns dense text.

## Adding a template

1. Define its point count, maximum density, and required point structure in `frontend/js/slide-layouts.js`.
2. Write a failing planner test in `frontend/test/slide-layouts.test.js`.
3. Add controlled markup in `frontend/js/slide-templates.js`; escape all generated content.
4. Write a failing markup test in `frontend/test/slide-templates.test.js`.
5. Add namespaced visual rules in `frontend/style.css`, preserving the common title, footer, and 16:9 boundaries.
6. Add the template to `frontend/test/fixtures/layout-presentations.js` and the mixed-deck renderer test.
7. Check preview navigation and browser PDF output at the normal slide scale before merging.

## Guardrails

- The same specialized template cannot appear on adjacent slides.
- A weak alternate template is never forced merely to create variety.
- Cover and thank-you slides remain fixed presentation states.
- Hugeicons support the composition, but text remains the primary visual information.
