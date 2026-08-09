const test = require('node:test');
const assert = require('node:assert/strict');
const { generatePresentation, GenerationError } = require('../../generator');
const { createPresentation, projectPresentation } = require('../helpers/presentation');

const silentLogger = { log() {}, warn() {} };

const detailedRequest = `Create 10 detailed slides about the AI Presentation Generator project
covering: project architecture, controlled generation, prompt engineering,
flexible schema, fallback models, and student applications.
Make it professional and comprehensive.`;

test('generates a validated ten-slide project presentation from a detailed request', async () => {
    const calls = [];
    const presentation = projectPresentation();

    const result = await generatePresentation(detailedRequest, {
        generateWithModel: async (...args) => {
            calls.push(args);
            return JSON.stringify(presentation);
        },
        createAttemptPlan: () => [{ model: 'primary-test-model', repair: false }],
        logger: silentLogger
    });

    assert.equal(result.presentation.slides.length, 10);
    assert.equal(result.model, 'primary-test-model');
    assert.equal(calls.length, 1);
    assert.equal(calls[0][2], 'primary-test-model');
    assert.equal(result.presentation.slides[0].title, 'Project Architecture');
    assert.equal(result.presentation.slides[5].title, 'Student Applications');
});

test('repairs malformed primary output once before using fallbacks', async () => {
    const calls = [];
    const valid = createPresentation(6);

    const result = await generatePresentation('Create 6 slides about study habits', {
        generateWithModel: async (system, user, model) => {
            calls.push({ system, user, model });
            return calls.length === 1 ? 'not valid JSON' : JSON.stringify(valid);
        },
        createAttemptPlan: () => [
            { model: 'primary-test-model', repair: false },
            { model: 'primary-test-model', repair: true },
            { model: 'laguna-test-model', repair: false }
        ],
        logger: silentLogger
    });

    assert.equal(result.presentation.slides.length, 6);
    assert.equal(result.model, 'primary-test-model');
    assert.equal(calls.length, 2);
    assert.match(calls[1].system, /REPAIR REQUIRED/);
    assert.equal(calls[1].model, 'primary-test-model');
});

test('skips repair after a primary rate limit and uses Laguna fallback', async () => {
    const calls = [];
    const valid = createPresentation(6);

    const result = await generatePresentation('Create 6 slides about study habits', {
        generateWithModel: async (system, user, model) => {
            calls.push(model);
            if (model === 'primary-test-model') {
                throw new Error('OpenRouter API error: 429 - rate limit');
            }
            return JSON.stringify(valid);
        },
        createAttemptPlan: () => [
            { model: 'primary-test-model', repair: false },
            { model: 'primary-test-model', repair: true },
            { model: 'laguna-test-model', repair: false },
            { model: 'ling-test-model', repair: false }
        ],
        logger: silentLogger
    });

    assert.equal(result.presentation.slides.length, 6);
    assert.equal(result.model, 'laguna-test-model');
    assert.deepEqual(calls, ['primary-test-model', 'laguna-test-model']);
});

test('returns a safe generic error when every model fails', async () => {
    await assert.rejects(
        generatePresentation('Create 6 slides about study habits', {
            generateWithModel: async () => {
                throw new Error('Provider service unavailable');
            },
            createAttemptPlan: () => [{ model: 'primary-test-model', repair: false }],
            logger: silentLogger
        }),
        error => error instanceof GenerationError
            && error.code === 'GENERATION_FAILED'
            && error.message === 'Unable to generate a valid presentation right now.'
    );
});
