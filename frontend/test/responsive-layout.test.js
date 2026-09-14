const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const stylesheet = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

test('keeps generated slides in a 16 by 9 frame on narrow screens', () => {
    assert.match(stylesheet, /\.slide\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/);
    assert.match(stylesheet, /@media \(max-width: 540px\)[\s\S]*?\.slide-spotlight\s*\{[\s\S]*?minmax\(0, 0\.8fr\)/);
});

test('compacts every structured slide template for phone previews', () => {
    for (const selector of ['.slide-card-grid', '.slide-comparison', '.slide-process', '.slide-roadmap', '.slide-architecture', '.slide-spotlight', '.slide-split-columns', '.slide-pillars']) {
        assert.match(stylesheet, new RegExp('@media \\(max-width: 540px\\)[\\s\\S]*?' + selector.replace('.', '\\.') + '\\s*(?:,|\\{)'));
    }
});
