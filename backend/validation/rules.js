/**
 * Presentation Validation Rules
 *
 * Validates presentation content beyond schema structure.
 * Checks for:
 * - Content density (not too much text)
 * - Duplicate detection
 * - Presentation quality rules
 * - Warnings for potential improvements
 *
 * Schema-valid ≠ Presentation-valid
 */

/**
 * Validates presentation rules with quality checks
 * @param {Object} presentation - The validated presentation data
 * @param {Object} intent - Optional parsed user intent for context
 * @returns {Object} - { valid: boolean, errors?: Array, warnings?: Array }
 */
function validatePresentationRules(presentation, intent = null) {
    const errors = [];
    const warnings = [];

    // ============================================
    // ERROR CHECKS (fail validation)
    // ============================================

    // Check for duplicate slide titles
    const slideTitles = presentation.slides.map(s => s.title);
    const duplicateTitles = slideTitles.filter((title, index) =>
        slideTitles.indexOf(title) !== index
    );

    if (duplicateTitles.length > 0) {
        errors.push({
            type: 'DUPLICATE_TITLES',
            message: 'Duplicate slide titles found: ' + duplicateTitles.join(', ')
        });
    }

    // Check each slide for duplicate points
    presentation.slides.forEach((slide, slideIndex) => {
        const points = slide.points;
        const duplicatePoints = points.filter((point, index) =>
            points.indexOf(point) !== index
        );

        if (duplicatePoints.length > 0) {
            errors.push({
                type: 'DUPLICATE_POINTS',
                message: 'Slide ' + (slideIndex + 1) + ' has duplicate points'
            });
        }

        // Check for empty points
        const emptyPoints = points.filter(p => p.trim() === '');
        if (emptyPoints.length > 0) {
            errors.push({
                type: 'EMPTY_POINTS',
                message: 'Slide ' + (slideIndex + 1) + ' has empty points'
            });
        }
    });

    // Check for reasonable title length (not too short or too long)
    if (presentation.title.length < 5) {
        errors.push({
            type: 'TITLE_TOO_SHORT',
            message: 'Presentation title is too short'
        });
    }

    // Check that subtitle is different from title
    if (presentation.subtitle === presentation.title) {
        errors.push({
            type: 'SUBTITLE_SAME_AS_TITLE',
            message: 'Subtitle should be different from title'
        });
    }

    // Check that subtitle is meaningful (at least 10 chars)
    if (presentation.subtitle.length < 10) {
        errors.push({
            type: 'SUBTITLE_TOO_SHORT',
            message: 'Subtitle should be more descriptive (at least 10 characters)'
        });
    }

    // ============================================
    // WARNING CHECKS (don't fail, but advise)
    // ============================================

    // Check for very short points (less than 5 words)
    presentation.slides.forEach((slide, slideIndex) => {
        slide.points.forEach((point, pointIndex) => {
            const wordCount = point.split(/\s+/).length;
            if (wordCount < 5) {
                warnings.push({
                    type: 'SHORT_POINT',
                    message: 'Slide ' + (slideIndex + 1) + ', Point ' + (pointIndex + 1) +
                             ': Very short (' + wordCount + ' words) - consider expanding'
                });
            }
        });
    });

    // Check for repetitive opening words across slides
    const firstWords = presentation.slides.map(s => {
        if (s.points && s.points.length > 0) {
            return s.points[0].split(/\s+/)[0]?.toLowerCase();
        }
        return null;
    }).filter(Boolean);

    const wordCounts = {};
    firstWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    Object.entries(wordCounts).forEach(([word, count]) => {
        if (count > 3) {
            warnings.push({
                type: 'REPETITIVE_OPENINGS',
                message: 'Multiple slides start with "' + word + '" - consider varying language'
            });
        }
    });

    // The requested count is a hard requirement. A 10-slide request must not
    // silently succeed with eight slides.
    if (intent && intent.slideCount) {
        const requested = intent.slideCount;
        const actual = presentation.slides.length;

        if (actual !== requested) {
            errors.push({
                type: 'SLIDE_COUNT_MISMATCH',
                message: 'Requested ' + requested + ' slides, got ' + actual
            });
        }
    }

    // Check if specific topics were covered (if intent provided)
    if (intent && intent.topics && intent.topics.length > 0) {
        const allContent = presentation.slides.map(s =>
            (s.title + ' ' + s.points.join(' ')).toLowerCase()
        ).join(' ');

        intent.topics.forEach(topic => {
            const topicLower = topic.toLowerCase();
            // Simple check if topic keywords appear in content
            const topicWords = topicLower.split(/\s+/).filter(w => w.length > 3);
            const found = topicWords.some(word => allContent.includes(word));

            if (!found) {
                warnings.push({
                    type: 'TOPIC_NOT_FOUND',
                    message: 'Topic "' + topic + '" may not be covered in the presentation'
                });
            }
        });
    }

    // Check for very long points (over 150 chars)
    presentation.slides.forEach((slide, slideIndex) => {
        slide.points.forEach((point, pointIndex) => {
            if (point.length > 150) {
                warnings.push({
                    type: 'LONG_POINT',
                    message: 'Slide ' + (slideIndex + 1) + ', Point ' + (pointIndex + 1) +
                             ': Very long (' + point.length + ' chars) - may be hard to read on slides'
                });
            }
        });
    });

    return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

module.exports = {
    validatePresentationRules
};
