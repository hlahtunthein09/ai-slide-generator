const test = require('node:test');
const assert = require('node:assert/strict');
const { modelConfig } = require('../../ai/models');
const { FailureTypes, classifyFailure, createAttemptPlan } = require('../../retry');

test('uses the tested model order with one bounded primary repair attempt', () => {
    const plan = createAttemptPlan();

    assert.deepEqual(plan, [
        { model: modelConfig.primary, repair: false },
        { model: modelConfig.primary, repair: true },
        { model: 'poolside/laguna-xs-2.1:free', repair: false },
        { model: 'inclusionai/ling-3.0-tiny:free', repair: false }
    ]);
});

test('classifies rate limits and timeouts without leaking provider details', () => {
    assert.equal(classifyFailure(new Error('OpenRouter API error: 429 - rate limit')), FailureTypes.RATE_LIMIT);
    assert.equal(classifyFailure(new Error('OpenRouter request timed out')), FailureTypes.TIMEOUT);
});
