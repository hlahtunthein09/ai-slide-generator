const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('renders the SlideCraft brand and a duplicated member marquee track', () => {
    const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

    assert.match(page, />SlideCraft</);
    assert.match(page, /src="icons\/hugeicons\/presentation-01\.svg" alt="" class="brand-logo"/);
    assert.match(page, /group-5 project : AI slide generator/);
    assert.match(page, /class="member-marquee"/);

    const track = page.match(/<div class="member-track"[\s\S]*?<\/div>/)[0];

    for (const name of ['Hla Htun Thein', 'Yan Naing', 'Min Khant', 'Phyo Myat Mon', 'La Min Eain', 'Min Thet Cho']) {
        assert.equal((track.match(new RegExp(name, 'g')) || []).length, 2, name);
    }
});

test('uses Hugeicons that match each feature-card topic', () => {
    const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

    for (const icon of ['ai-brain-01.svg', 'presentation-01.svg', 'pdf-01.svg', 'workflow-square-01.svg']) {
        assert.match(page, new RegExp('icons/hugeicons/' + icon.replace('.', '\\.')));
    }
});

test('moves the member marquee continuously from right to left', () => {
    const stylesheet = fs.readFileSync(path.join(root, 'style.css'), 'utf8');

    assert.match(stylesheet, /\.member-track\s*\{[\s\S]*?animation:\s*member-marquee/);
    assert.match(stylesheet, /@keyframes member-marquee[\s\S]*?translateX\(-50%\)/);
    assert.match(
        stylesheet,
        /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.member-track\s*\{[\s\S]*?animation:\s*member-marquee 24s linear infinite !important;/
    );
});
