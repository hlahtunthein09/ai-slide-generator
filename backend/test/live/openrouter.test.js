const test = require('node:test');
const assert = require('node:assert/strict');

require('dotenv').config({ path: '.env.local' });

const { generatePresentation } = require('../../generator');

const detailedRequest = `Create 10 detailed slides about the AI Presentation Generator project
covering: project architecture, controlled generation, prompt engineering,
flexible schema, fallback models, and student applications.
Make it professional and comprehensive.`;

test('live: configured model chain creates a validated detailed presentation', {
    skip: process.env.RUN_LIVE_AI_TESTS !== 'true'
}, async () => {
    const events = [];
    const logger = {
        log(message) {
            events.push(JSON.parse(message));
            console.log(message);
        },
        warn(message) {
            events.push(JSON.parse(message));
            console.warn(message);
        }
    };
    const result = await generatePresentation(detailedRequest, { logger });
    const success = events.find(event => event.event === 'presentation_generated');

    assert.equal(result.presentation.slides.length, 10);
    assert.equal(result.model, success?.model);
    assert.ok(result.presentation.title.length > 0);
    assert.ok(success, 'the test must record the model that completed generation');
    assert.ok([
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'poolside/laguna-xs-2.1:free',
        'inclusionai/ling-3.0-tiny:free'
    ].includes(success.model), 'generation must use an approved active model');
    assert.ok(result.presentation.slides.every(slide => (
        slide.type === 'content'
        && slide.points.length >= 3
        && slide.points.length <= 5
    )));
});
