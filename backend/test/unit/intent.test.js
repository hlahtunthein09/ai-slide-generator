const test = require('node:test');
const assert = require('node:assert/strict');
const { parseUserIntent } = require('../../prompt/parser');
const { buildPrompt } = require('../../prompt/builder');

const detailedRequest = `Create 10 detailed slides about the AI Presentation Generator project
covering: project architecture, controlled generation, prompt engineering,
flexible schema, fallback models, and student applications.
Make it professional and comprehensive.`;

test('extracts detailed presentation requirements without losing requested topics', () => {
    const intent = parseUserIntent(detailedRequest);

    assert.equal(intent.slideCount, 10);
    assert.equal(intent.style, 'detailed');
    assert.equal(intent.tone, 'professional');
    assert.deepEqual(intent.topics, [
        'project architecture',
        'controlled generation',
        'prompt engineering',
        'flexible schema',
        'fallback models',
        'student applications'
    ]);
});

test('builds a compact prompt with exact-count and coverage instructions', () => {
    const result = buildPrompt(detailedRequest);

    assert.match(result.system, /Generate exactly 10 slides/);
    assert.match(result.system, /COVER THESE TOPICS IN ORDER/);
    assert.ok(result.system.length < 5_000, 'prompt should remain affordable for free models');
});

test('does not mistake beginner-friendly for a casual tone', () => {
    const intent = parseUserIntent('Create beginner-friendly slides about cybersecurity');
    assert.equal(intent.audience, 'beginner');
    assert.equal(intent.tone, 'neutral');
});
