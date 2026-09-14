const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fixtures = require('./fixtures/layout-presentations.js');

global.window = {};
require(path.join(__dirname, '..', 'js', 'slide-layouts.js'));
require(path.join(__dirname, '..', 'js', 'slide-templates.js'));
require(path.join(__dirname, '..', 'js', 'renderer.js'));

test('renders planner-selected templates without changing AI slide content', () => {
    const slides = [
        fixtures.comparison.slides[0],
        fixtures.process.slides[0],
        fixtures.architecture.slides[0],
        fixtures.roadmap.slides[0],
        fixtures.cardGrid.slides[0],
        fixtures.ambiguous.slides[0]
    ];
    const plans = window.SlideLayoutPlanner.planContentLayouts(slides);

    window.PresentationRenderer.deckTitle = 'Restaurant QR Ordering';
    const markup = slides.map((slide, index) => window.PresentationRenderer.buildContentSlideMarkup(
        slide,
        index + 2,
        slides.length + 2,
        plans[index]
    )).join('');

    assert.match(markup, /template--comparison/);
    assert.match(markup, /template--process/);
    assert.match(markup, /template--architecture/);
    assert.match(markup, /template--roadmap/);
    assert.match(markup, /template--card-grid/);
    assert.match(markup, /template--spotlight/);
    assert.doesNotMatch(markup, /undefined/);
});
