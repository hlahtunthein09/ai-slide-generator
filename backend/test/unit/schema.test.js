const test = require('node:test');
const assert = require('node:assert/strict');
const { getSchemaForIntent, validateSchema } = require('../../schema/presentation');
const { createPresentation } = require('../helpers/presentation');

test('requires exactly the user-requested number of slides', () => {
    const schema = getSchemaForIntent({ slideCount: 10, style: 'detailed' });

    assert.equal(validateSchema(createPresentation(10), schema).success, true);
    assert.equal(validateSchema(createPresentation(9), schema).success, false);
    assert.equal(validateSchema(createPresentation(11), schema).success, false);
});

test('rejects unknown presentation and slide fields', () => {
    const presentation = createPresentation(6, { unexpected: 'not allowed' });
    presentation.slides[0].layout = 'two-column';

    const result = validateSchema(presentation, getSchemaForIntent({ slideCount: 6, style: 'standard' }));
    assert.equal(result.success, false);
});

test('keeps content density within the fixed renderer limits', () => {
    const presentation = createPresentation(6);
    presentation.slides[0].points = Array(6).fill('A point that is valid but exceeds the count');

    const result = validateSchema(presentation, getSchemaForIntent({ slideCount: 6, style: 'detailed' }));
    assert.equal(result.success, false);
});

test('accepts slides with a valid takeaway', () => {
    const presentation = createPresentation(6);
    presentation.slides[0].takeaway = 'This is a clear, concise key takeaway.';

    const result = validateSchema(presentation, getSchemaForIntent({ slideCount: 6, style: 'standard' }));
    assert.equal(result.success, true);
});

test('accepts slides without a takeaway', () => {
    const presentation = createPresentation(6);
    presentation.slides.forEach(slide => delete slide.takeaway);

    const result = validateSchema(presentation, getSchemaForIntent({ slideCount: 6, style: 'standard' }));
    assert.equal(result.success, true);
});

test('rejects takeaways longer than 180 characters', () => {
    const presentation = createPresentation(6);
    presentation.slides[0].takeaway = 'A'.repeat(181);

    const result = validateSchema(presentation, getSchemaForIntent({ slideCount: 6, style: 'standard' }));
    assert.equal(result.success, false);
    assert.match(result.errors[0].field, /takeaway/);
});
