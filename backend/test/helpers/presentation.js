function createPresentation(slideCount = 6, overrides = {}) {
    const slides = Array.from({ length: slideCount }, (_, index) => ({
        type: 'content',
        title: `Slide ${index + 1}`,
        points: [
            `First key point for slide ${index + 1}`,
            `Second key point for slide ${index + 1}`,
            `Third key point for slide ${index + 1}`
        ]
    }));

    return {
        title: 'AI Presentation Generator',
        subtitle: 'A controlled system for creating student presentations',
        slides,
        ...overrides
    };
}

function projectPresentation() {
    const topics = [
        'Project Architecture',
        'Controlled Generation',
        'Prompt Engineering',
        'Flexible Schema',
        'Fallback Models',
        'Student Applications',
        'Generation Workflow',
        'Validation Rules',
        'Presentation Benefits',
        'Key Takeaways'
    ];

    return createPresentation(10, {
        slides: topics.map((title, index) => ({
            type: 'content',
            title,
            points: [
                `${title} supports reliable presentation creation`,
                `The system keeps content clear and controlled`,
                `Students receive editable browser-based slides`
            ]
        }))
    });
}

module.exports = { createPresentation, projectPresentation };
