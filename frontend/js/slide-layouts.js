/**
 * Slide Layout Planner
 *
 * AI supplies content. This module chooses a safe visual structure from the
 * content already validated by the application. It never consumes AI HTML,
 * CSS, coordinates, or arbitrary template names.
 */
(function(root) {
    const TEMPLATE_NAMES = ['comparison', 'process', 'architecture', 'roadmap', 'card-grid', 'spotlight', 'split-columns', 'pillars'];
    const MINIMUM_CONFIDENCE = 300;
    const INTENT_TERMS = {
        comparison: ['vs', 'versus', 'comparison', 'before and after'],
        process: ['process', 'workflow', 'how it works', 'how the', 'steps', 'flow'],
        architecture: ['architecture', 'system components', 'layers', 'platform structure'],
        roadmap: ['roadmap', 'timeline', 'phases', 'milestones', 'implementation plan'],
        'card-grid': ['features', 'benefits', 'pillars', 'core areas', 'key capabilities']
    };
    const ROLE_TEMPLATES = [
        { template: 'spotlight', terms: ['introduction', 'overview', 'what is', 'why', 'importance'] },
        { template: 'card-grid', terms: ['facilities', 'resources', 'academic', 'courses', 'classes', 'services'] },
        { template: 'pillars', terms: ['social', 'community', 'clubs', 'activities', 'culture'] },
        { template: 'split-columns', terms: ['challenges', 'problems', 'risks', 'issues', 'considerations'] },
        { template: 'spotlight', terms: ['future', 'opportunities', 'career', 'outlook', 'benefits', 'advantages'] }
    ];
    const GENERIC_TEMPLATES = ['spotlight', 'card-grid', 'split-columns', 'pillars'];

    function getText(slide) {
        return {
            title: typeof slide?.title === 'string' ? slide.title.trim() : '',
            points: Array.isArray(slide?.points) ? slide.points.filter((point) => typeof point === 'string') : []
        };
    }

    function hasTerm(text, term) {
        const pattern = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        return new RegExp('\\b' + pattern + '\\b', 'i').test(text);
    }

    function includesIntent(title, template) {
        return INTENT_TERMS[template].some((term) => hasTerm(title, term));
    }

    function pointCountFits(points, template) {
        if (template === 'comparison') return points.length >= 2 && points.length <= 5;
        if (template === 'architecture' || template === 'roadmap' || template === 'card-grid') {
            return points.length >= 3 && points.length <= 4;
        }
        return points.length >= 3 && points.length <= 5;
    }

    function findRoleTemplate(title) {
        const role = ROLE_TEMPLATES.find((candidate) => candidate.terms.some((term) => hasTerm(title, term)));
        return role ? role.template : null;
    }

    function isTemplateContentSafe(slide, template) {
        if (template === 'bullet-focus') return true;

        const { title, points } = getText(slide);
        const pointCharacters = points.reduce((total, point) => total + point.length, 0);

        return title.length <= 60 &&
            pointCountFits(points, template) &&
            points.every((point) => point.length <= 110) &&
            pointCharacters <= 360;
    }

    function scoreSlideForTemplate(slide, template) {
        if (!TEMPLATE_NAMES.includes(template) || !isTemplateContentSafe(slide, template)) {
            return { score: 0, reasons: [] };
        }

        const { title, points } = getText(slide);
        const reasons = [];
        let score = 0;

        if (INTENT_TERMS[template] && includesIntent(title, template)) {
            score += 300;
            reasons.push('Title signals ' + template + '.');
        }

        if (findRoleTemplate(title) === template) {
            score += 300;
            reasons.push('Title role suits the ' + template + ' composition.');
        }

        if (template === 'comparison' && points.slice(0, 2).every((point) => point.includes(':'))) {
            score += 80;
            reasons.push('Two labelled sides are available; remaining points become shared insights.');
        }

        if ((template === 'process' || template === 'roadmap') && points.length >= 3) {
            score += 40;
            reasons.push('Ordered short items fit a horizontal sequence.');
        }

        if ((template === 'architecture' || template === 'card-grid') && points.every((point) => point.includes(':'))) {
            score += 40;
            reasons.push('Labelled content fits structured panels.');
        }

        return { score, reasons };
    }

    function planContentLayouts(slides) {
        let previousTemplate = null;

        return (Array.isArray(slides) ? slides : []).map((slide, index) => {
            const candidates = TEMPLATE_NAMES
                .map((template) => ({ template, ...scoreSlideForTemplate(slide, template) }))
                .filter((candidate) => candidate.score >= MINIMUM_CONFIDENCE)
                .sort((left, right) => right.score - left.score);
            const candidate = candidates.find((item) => item.template !== previousTemplate);

            if (candidate) {
                previousTemplate = candidate.template;
                return {
                    template: candidate.template,
                    confidence: candidate.score,
                    reasons: candidate.reasons
                };
            }

            const genericTemplate = GENERIC_TEMPLATES
                .map((template, genericIndex) => GENERIC_TEMPLATES[(index + genericIndex) % GENERIC_TEMPLATES.length])
                .find((template) => template !== previousTemplate && isTemplateContentSafe(slide, template));

            if (genericTemplate) {
                previousTemplate = genericTemplate;
                return {
                    template: genericTemplate,
                    confidence: MINIMUM_CONFIDENCE,
                    reasons: ['A neutral deck composition keeps ordinary generated content visually varied.']
                };
            }

            {
                previousTemplate = 'bullet-focus';
                return {
                    template: 'bullet-focus',
                    confidence: 0,
                    reasons: ['No specialized layout matched with enough confidence.']
                };
            }
        });
    }

    const api = { planContentLayouts, scoreSlideForTemplate, isTemplateContentSafe };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }
    root.SlideLayoutPlanner = api;
})(typeof window !== 'undefined' ? window : globalThis);
