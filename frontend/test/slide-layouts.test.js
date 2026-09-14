const test = require('node:test');
const assert = require('node:assert/strict');
const fixtures = require('./fixtures/layout-presentations.js');

let layoutModule;
try {
    layoutModule = require('../js/slide-layouts.js');
} catch (error) {
    layoutModule = {};
}

test('chooses a comparison layout for an explicit versus slide', () => {
    assert.equal(typeof layoutModule.planContentLayouts, 'function');
    assert.equal(layoutModule.planContentLayouts(fixtures.comparison.slides)[0].template, 'comparison');
});

test('chooses a comparison layout for the backend-compatible three-point shape', () => {
    const slide = {
        title: 'Manual Ordering vs QR Ordering',
        points: [
            'Manual ordering: Staff record requests and relay them to the kitchen.',
            'QR ordering: Guests submit orders directly from their devices.',
            'Key difference: QR ordering removes a manual handoff.'
        ]
    };

    assert.equal(layoutModule.planContentLayouts([slide])[0].template, 'comparison');
});

test('chooses a process layout for a workflow slide', () => {
    assert.equal(typeof layoutModule.planContentLayouts, 'function');
    assert.equal(layoutModule.planContentLayouts(fixtures.process.slides)[0].template, 'process');
});

test('gives concise ordinary content a neutral visual composition', () => {
    assert.equal(typeof layoutModule.planContentLayouts, 'function');
    assert.equal(layoutModule.planContentLayouts(fixtures.ambiguous.slides)[0].template, 'spotlight');
});

test('rejects a dense architecture slide before it reaches a diagram template', () => {
    assert.equal(typeof layoutModule.isTemplateContentSafe, 'function');

    const denseSlide = {
        title: 'A deliberately very long architecture title that exceeds the safe diagram title limit',
        points: [
            'Guest interface: A very long explanation that should not be compressed into a small architecture layer because it would damage readability for the presenter and audience.',
            'Order service: Receives the order and coordinates the restaurant workflow.',
            'Kitchen dashboard: Displays the information for staff.'
        ]
    };

    assert.equal(layoutModule.isTemplateContentSafe(denseSlide, 'architecture'), false);
    assert.equal(layoutModule.planContentLayouts([denseSlide])[0].template, 'bullet-focus');
});

test('gives a normal generated university deck visibly varied safe compositions', () => {
    const plans = layoutModule.planContentLayouts(fixtures.universityLife.slides);
    const templates = plans.map((plan) => plan.template);

    assert.ok(new Set(templates).size >= 4, templates.join(', '));
    assert.ok(templates.filter((template) => template === 'bullet-focus').length <= 1, templates.join(', '));
    assert.ok(templates.every((template, index) => index === 0 || template !== templates[index - 1]));
});
