/**
 * Presentation Schema
 *
 * Defines the structure of a valid presentation using Zod.
 * This is the contract between AI output and the renderer.
 *
 * The contract is intentionally small: one safe slide type rendered by the
 * fixed frontend template.
 */

const { z } = require('zod');

/**
 * Creates a presentation schema with configurable constraints
 * @param {Object} options - Configuration options
 * @param {number} options.minSlides - Minimum slides (default: 3)
 * @param {number} options.maxSlides - Maximum slides (default: 15)
 * @param {number} options.minPoints - Minimum points per slide (default: 2)
 * @param {number} options.maxPoints - Maximum points per slide (default: 7)
 * @param {number} options.maxTitleLength - Max title length (default: 60)
 * @param {number} options.maxPointLength - Max point length (default: 200)
 * @returns {Object} - Zod schema
 */
function createPresentationSchema(options = {}) {
    const {
        minSlides = 3,
        maxSlides = 15,
        minPoints = 3,
        maxPoints = 5,
        maxTitleLength = 60,
        maxPointLength = 140
    } = options;

    // Schema for a single content slide
    const slideSchema = z.object({
        type: z.literal('content'),
        title: z.string().min(1).max(maxTitleLength),
        points: z
            .array(z.string().min(1).max(maxPointLength))
            .min(minPoints)
            .max(maxPoints),
        takeaway: z.string().min(1).max(180).optional()
    }).strict();

    // Schema for complete presentation
    return z.object({
        title: z.string().min(1).max(100),
        subtitle: z.string().min(1).max(150),
        slides: z
            .array(slideSchema)
            .min(minSlides)
            .max(maxSlides)
    }).strict();
}

/**
 * Get schema based on user intent
 * Adapts constraints to match what the user requested
 * @param {Object} intent - Parsed user intent
 * @returns {Object} - Configured Zod schema
 */
function getSchemaForIntent(intent) {
    const options = {
        minSlides: 3,
        maxSlides: 15,
        minPoints: 3,
        maxPoints: 5
    };

    // Detailed means better coverage, not dense slides. Concise presentations
    // can safely use fewer bullets without changing the renderer.
    if (intent.style === 'concise') {
        options.minPoints = 2;
        options.maxPoints = 3;
    }

    // The user's requested count is a requirement, not a suggestion.
    if (intent.slideCount) {
        options.minSlides = intent.slideCount;
        options.maxSlides = intent.slideCount;
    }

    return createPresentationSchema(options);
}

/**
 * Default schema (for backward compatibility)
 */
const presentationSchema = createPresentationSchema();

/**
 * Validates presentation data against schema
 * @param {Object} data - The presentation data to validate
 * @param {Object} schema - Optional custom schema (uses default if not provided)
 * @returns {Object} - { success: boolean, data?: Object, errors?: Array }
 */
function validateSchema(data, schema = null) {
    // Use provided schema or default
    const presentationSchemaToUse = schema || presentationSchema;

    const result = presentationSchemaToUse.safeParse(data);

    if (result.success) {
        return {
            success: true,
            data: result.data
        };
    } else {
        return {
            success: false,
            errors: result.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        };
    }
}

module.exports = {
    createPresentationSchema,
    getSchemaForIntent,
    presentationSchema,
    validateSchema
};
