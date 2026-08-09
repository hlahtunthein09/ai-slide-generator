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

test('extracts slide count from prompts with multiple adjectives', () => {
    const intent = parseUserIntent('Create 8 detailed, professional slides about cybersecurity');
    assert.equal(intent.slideCount, 8);
});

test('extracts topics from numbered lists', () => {
    const intent = parseUserIntent('Create 6 slides about cybersecurity covering these topics in order: 1. What is cybersecurity, 2. Common threats, 3. Password security. Make it beginner-friendly.');
    assert.deepEqual(intent.topics, [
        'What is cybersecurity',
        'Common threats',
        'Password security'
    ]);
});

test('handles short prompts without extracting topics', () => {
    const intent = parseUserIntent('create presentation slides for ai agents');
    assert.equal(intent.slideCount, 6);
    assert.deepEqual(intent.topics, []);
    assert.equal(intent.audience, 'general');
    assert.equal(intent.tone, 'neutral');
    assert.equal(intent.style, 'standard');
});
