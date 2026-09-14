const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

global.window = {};
require(path.join(__dirname, '..', 'js', 'renderer.js'));

test('resolves presentation topics to Hugeicons assets', () => {
    const cases = [
        ['Artificial Intelligence', 'ai-brain-01.svg'],
        ['Security Controls', 'security.svg'],
        ['Cloud Computing', 'cloud-server.svg'],
        ['Business Analytics', 'analytics-01.svg'],
        ['Project Workflow', 'workflow-square-01.svg'],
        ['Global Education', 'global-education.svg']
    ];

    for (const [title, expectedIcon] of cases) {
        const icon = window.PresentationRenderer.selectIconForSlide({
            title,
            points: ['A concise point for this presentation topic.']
        });

        assert.equal(icon, expectedIcon, title);
    }
});

test('prefers a slide title over incidental generic words in bullet points', () => {
    const cases = [
        [{ title: 'Sustainability and Climate Change', points: ['Reduce emissions through better policy.'] }, 'leaf-01.svg'],
        [{ title: 'Cybersecurity Best Practices', points: ['Protect data with strong passwords.'] }, 'security.svg'],
        [{ title: 'Climate Change Solutions', points: ['AI can improve energy planning.'] }, 'leaf-01.svg'],
        [{ title: 'Research Methods', points: ['Data collection supports evidence.'] }, 'book-open-01.svg'],
        [{ title: 'Project Goals', points: ['Use a system for tracking work.'] }, 'target-01.svg'],
        [{ title: 'Italian Renaissance Sculpture', points: ['Focus on composition and material.'] }, 'presentation-01.svg']
    ];

    for (const [slide, expectedIcon] of cases) {
        assert.equal(
            window.PresentationRenderer.selectIconForSlide(slide),
            expectedIcon,
            slide.title
        );
    }
});

test('covers common presentation subjects before using the neutral fallback', () => {
    const cases = [
        ['Public Health Initiatives', 'health.svg'],
        ['Financial Planning', 'money-01.svg'],
        ['Marketing Strategy', 'megaphone-01.svg'],
        ['Legal Framework', 'justice-scale-01.svg'],
        ['Scientific Discovery', 'atom-01.svg'],
        ['Travel and Tourism', 'airplane-01.svg'],
        ['Art and Design', 'paint-brush-01.svg'],
        ['Education Reform', 'school.svg'],
        ['Sports Performance', 'football.svg'],
        ['Business Operations', 'briefcase-01.svg']
    ];

    for (const [title, expectedIcon] of cases) {
        assert.equal(
            window.PresentationRenderer.selectIconForSlide({ title, points: [] }),
            expectedIcon,
            title
        );
    }
});

test('selects distinct icons for common university-life slide topics', () => {
    const cases = [
        ['Campus Facilities', 'building-01.svg'],
        ['Academic Courses', 'book-open-01.svg'],
        ['Student Clubs', 'user-group.svg'],
        ['Campus Housing', 'home-01.svg'],
        ['Career Preparation', 'briefcase-01.svg']
    ];

    for (const [title, expectedIcon] of cases) {
        assert.equal(
            window.PresentationRenderer.selectIconForSlide({ title, points: [] }),
            expectedIcon,
            title
        );
    }
});

test('uses relevant icons for standard presentation sections', () => {
    const cases = [
        ['Introduction to University Life', 'university.svg'],
        ['Social Life on Campus', 'user-group.svg'],
        ['Benefits of University Life', 'checkmark-circle-01.svg'],
        ['Common Student Challenges', 'alert-01.svg'],
        ['Future Opportunities', 'rocket-01.svg'],
        ['Conclusion', 'checkmark-circle-01.svg']
    ];

    for (const [title, expectedIcon] of cases) {
        assert.equal(
            window.PresentationRenderer.selectIconForSlide({ title, points: [] }),
            expectedIcon,
            title
        );
    }
});

test('maps individual university content points to distinct Hugeicons', () => {
    const cases = [
        ['Library resources and study spaces', 'library.svg'],
        ['Sports centres support wellbeing', 'football.svg'],
        ['Technology labs provide practical tools', 'computer-activity.svg'],
        ['Events build friendships across courses', 'calendar-01.svg']
    ];

    for (const [title, expectedIcon] of cases) {
        assert.equal(
            window.PresentationRenderer.selectIconForSlide({ title, points: [] }),
            expectedIcon,
            title
        );
    }
});
