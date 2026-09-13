const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('keeps the loading spinner animated when reduced motion is enabled', () => {
    const stylesheet = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

    assert.match(
        stylesheet,
        /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.spinner\s*\{[\s\S]*?animation:\s*spin 800ms linear infinite !important;/
    );
});
