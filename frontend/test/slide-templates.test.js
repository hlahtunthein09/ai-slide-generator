const test = require('node:test');
const assert = require('node:assert/strict');
const fixtures = require('./fixtures/layout-presentations.js');

let templateModule;
try {
    templateModule = require('../js/slide-templates.js');
} catch (error) {
    templateModule = {};
}

test('renders the existing bullet layout as the safe default template', () => {
    assert.equal(typeof templateModule.renderContentTemplate, 'function');

    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Reliable Defaults',
            points: ['Safe, readable default.', 'The existing layout stays available.'],
            takeaway: 'Keep the dependable layout when structure is unclear.'
        },
        plan: { template: 'bullet-focus' },
        icon: 'presentation-01.svg',
        presentationTitle: 'SlideCraft',
        slideNumber: 2,
        totalSlides: 8
    });

    assert.match(markup, /slide-top-bar/);
    assert.match(markup, /slide-body/);
    assert.match(markup, /slide-footer/);
    assert.match(markup, /Safe, readable default\./);
    assert.match(markup, /02 \/ 08/);
});

test('renders one concise card for every card-grid point', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Core Platform Benefits',
            points: [
                'Faster service: Guests order without waiting.',
                'Fewer mistakes: Orders reach the kitchen directly.',
                'Live updates: Availability stays current.'
            ],
            takeaway: 'A clearer experience for guests and staff.'
        },
        plan: { template: 'card-grid' },
        icon: 'qr-code.svg',
        pointIcons: ['timer-01.svg', 'checkmark-circle-01.svg', 'notification-01.svg'],
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 3,
        totalSlides: 8
    });

    assert.equal((markup.match(/class="slide-card"/g) || []).length, 3);
    assert.match(markup, /class="slide-card-title">Faster service/);
    assert.match(markup, /class="slide-card-copy">Guests order without waiting\./);
    assert.match(markup, /icons\/hugeicons\/timer-01\.svg/);
    assert.match(markup, /icons\/hugeicons\/checkmark-circle-01\.svg/);
    assert.match(markup, /icons\/hugeicons\/notification-01\.svg/);
});

test('renders two labelled panels for comparison content', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Manual Ordering vs QR Ordering',
            points: [
                'Manual ordering: Staff record requests and relay them to the kitchen.',
                'QR ordering: Guests submit orders directly from their devices.'
            ],
            takeaway: 'QR ordering removes handoff friction.'
        },
        plan: { template: 'comparison' },
        icon: 'qr-code.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 4,
        totalSlides: 8
    });

    assert.match(markup, /comparison-panel--left/);
    assert.match(markup, /comparison-panel--right/);
    assert.match(markup, /Manual ordering/);
    assert.match(markup, /QR ordering/);
});

test('keeps remaining backend-compatible comparison points as a shared insight', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Manual Ordering vs QR Ordering',
            points: [
                'Manual ordering: Staff record requests and relay them to the kitchen.',
                'QR ordering: Guests submit orders directly from their devices.',
                'Key difference: QR ordering removes a manual handoff.'
            ],
            takeaway: 'QR ordering removes handoff friction.'
        },
        plan: { template: 'comparison' },
        icon: 'qr-code.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 4,
        totalSlides: 8
    });

    assert.match(markup, /comparison-insight/);
    assert.match(markup, /Key difference/);
});

test('renders connected steps for a process slide', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'How the QR Ordering Process Works',
            points: ['Scan the table QR code.', 'Browse the digital menu.', 'Submit the selected items.', 'Receive the prepared order.'],
            takeaway: 'A clear four-step ordering flow.'
        },
        plan: { template: 'process' },
        icon: 'workflow-square-01.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 5,
        totalSlides: 8
    });

    assert.equal((markup.match(/class="process-step"/g) || []).length, 4);
    assert.equal((markup.match(/class="process-connector"/g) || []).length, 3);
    assert.match(markup, /01/);
});

test('renders ordered phases for a roadmap slide', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Implementation Roadmap',
            points: [
                'Phase one: Design the ordering experience.',
                'Phase two: Build the ordering workflow.',
                'Phase three: Test with restaurant staff.'
            ],
            takeaway: 'Move from design to validation in deliberate phases.'
        },
        plan: { template: 'roadmap' },
        icon: 'roadmap-01.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 6,
        totalSlides: 8
    });

    assert.equal((markup.match(/class="roadmap-phase"/g) || []).length, 3);
    assert.match(markup, /Phase one/);
    assert.match(markup, /Build the ordering workflow/);
});

test('marks a four-phase roadmap so CSS can keep all phases in one row', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'Implementation Roadmap',
            points: ['Discover: Confirm requirements.', 'Design: Shape the flow.', 'Build: Connect services.', 'Test: Validate with staff.']
        },
        plan: { template: 'roadmap' },
        icon: 'roadmap-01.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 6,
        totalSlides: 8
    });

    assert.match(markup, /slide-roadmap--4/);
});

test('renders three ordered layers for an architecture slide', () => {
    const markup = templateModule.renderContentTemplate({
        slide: {
            title: 'QR Ordering System Architecture',
            points: [
                'Guest interface: Lets diners browse and submit orders.',
                'Order service: Validates requests and manages order status.',
                'Kitchen dashboard: Displays confirmed orders for preparation.'
            ],
            takeaway: 'Each layer has one controlled responsibility.'
        },
        plan: { template: 'architecture' },
        icon: 'flowchart-01.svg',
        presentationTitle: 'Restaurant QR Ordering',
        slideNumber: 7,
        totalSlides: 8
    });

    assert.equal((markup.match(/class="architecture-layer"/g) || []).length, 3);
    assert.match(markup, /architecture-connector/);
    assert.match(markup, /Guest interface/);
});

test('renders a neutral spotlight composition without dropping ordinary generated points', () => {
    const markup = templateModule.renderContentTemplate({
        slide: fixtures.universityLife.slides[0],
        plan: { template: 'spotlight' },
        icon: 'university.svg',
        presentationTitle: 'University Life',
        slideNumber: 2,
        totalSlides: 8
    });

    assert.match(markup, /spotlight-lead/);
    assert.match(markup, /spotlight-support/);
    assert.match(markup, /Campus life builds skills beyond the classroom/);
});

test('renders a two-column composition for ordinary generated points', () => {
    const markup = templateModule.renderContentTemplate({
        slide: fixtures.universityLife.slides[4],
        plan: { template: 'split-columns' },
        icon: 'alert-01.svg',
        presentationTitle: 'University Life',
        slideNumber: 6,
        totalSlides: 8
    });

    assert.match(markup, /split-column--left/);
    assert.match(markup, /split-column--right/);
    assert.match(markup, /Time management becomes important/);
    assert.match(markup, /Support services can help/);
});

test('renders a pillar composition for community-oriented generated points', () => {
    const markup = templateModule.renderContentTemplate({
        slide: fixtures.universityLife.slides[3],
        plan: { template: 'pillars' },
        icon: 'user-group.svg',
        presentationTitle: 'University Life',
        slideNumber: 5,
        totalSlides: 8
    });

    assert.equal((markup.match(/class="pillar"/g) || []).length, 3);
    assert.match(markup, /Student clubs connect people/);
});
