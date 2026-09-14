const test = require('node:test');
const assert = require('node:assert/strict');
const { SYSTEM_PROMPT } = require('../../prompt/system');

test('asks the model for labelled concise explanations that templates can structure', () => {
    assert.match(SYSTEM_PROMPT, /Label: concise explanation/);
    assert.match(SYSTEM_PROMPT, /Do not write paragraphs/);
});
