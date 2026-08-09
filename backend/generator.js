/**
 * Presentation Generator
 *
 * Main orchestration module that connects:
 * - User Intent Parser
 * - Prompt Builder
 * - AI Model
 * - Schema Validation
 * - Presentation Rules Validation
 * - Retry Logic
 *
 * Pipeline:
 * User Prompt → Parse Intent → Build Prompt → AI Model → Validate → Presentation
 */

const { buildPrompt } = require('./prompt/builder');
const { generatePresentation: generateWithModel } = require('./ai/openrouter');
const { getSchemaForIntent, validateSchema } = require('./schema/presentation');
const { validatePresentationRules } = require('./validation/rules');
const { createAttemptPlan, classifyFailure, FailureTypes } = require('./retry');

class GenerationError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

/**
 * Parses JSON from AI output, handling common formatting issues
 * @param {string} text - The raw AI output
 * @returns {Object} - The parsed JSON object
 */
function parseAIOutput(text) {
    // Handle null/undefined
    if (!text) {
        throw new Error('Empty AI response');
    }

    // Try to extract JSON from the response
    // AI models sometimes wrap JSON in markdown code blocks or extra text
    let jsonText = text.trim();

    // Remove markdown code block markers if present
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
    }

    jsonText = jsonText.trim();

    // Try direct parse first
    try {
        return JSON.parse(jsonText);
    } catch (e) {
        // Direct parse failed, try to extract JSON from text
    }

    // Try to find JSON object in the text (between first { and last })
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const extracted = jsonText.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(extracted);
        } catch (e) {
            // Extracted JSON still invalid
        }
    }

    // Nothing worked
    throw new Error('Failed to parse AI output. The model may have returned invalid JSON.');
}

/**
 * Validates both schema and presentation rules
 * @param {Object} data - The parsed presentation data
 * @param {Object} intent - Parsed user intent for context-aware validation
 * @returns {Object} - { valid: boolean, data?: Object, errors?: Array, warnings?: Array }
 */
function validatePresentation(data, intent = null) {
    // Get schema based on user intent
    const schema = intent ? getSchemaForIntent(intent) : null;

    // Level 1: Schema validation
    const schemaResult = validateSchema(data, schema);
    if (!schemaResult.success) {
        return {
            valid: false,
            errors: schemaResult.errors.map(e => ({
                type: 'SCHEMA_ERROR',
                message: e.field + ': ' + e.message
            })),
            warnings: []
        };
    }

    // Level 2: Presentation rules validation (with intent context)
    const rulesResult = validatePresentationRules(schemaResult.data, intent);
    if (!rulesResult.valid) {
        return {
            valid: false,
            errors: rulesResult.errors,
            warnings: rulesResult.warnings || []
        };
    }

    return {
        valid: true,
        data: schemaResult.data,
        warnings: rulesResult.warnings || []
    };
}

/**
 * Main generation function
 * Orchestrates the entire pipeline from prompt to validated presentation
 *
 * @param {string} userPrompt - The user's presentation request
 * @returns {Promise<Object>} - The validated presentation data
 */
async function generatePresentationPipeline(userPrompt, dependencies = {}) {
    const services = {
        buildPrompt,
        generateWithModel,
        createAttemptPlan,
        logger: console,
        ...dependencies
    };

    // Step 1: Build the prompt (includes deterministic intent parsing)
    const prompt = services.buildPrompt(userPrompt);
    let lastError = null;

    for (const attempt of services.createAttemptPlan()) {
        // Repair is useful only for malformed or invalid content. A provider
        // failure should move directly to a fallback model.
        if (attempt.repair && lastError && [
            FailureTypes.RATE_LIMIT,
            FailureTypes.TIMEOUT,
            FailureTypes.PROVIDER_ERROR
        ].includes(classifyFailure(lastError))) {
            continue;
        }

        const systemPrompt = attempt.repair
            ? buildRepairPrompt(prompt.system, lastError, prompt.intent)
            : prompt.system;

        try {
            const rawOutput = await services.generateWithModel(
                systemPrompt,
                prompt.user,
                attempt.model,
                prompt.intent
            );
            const parsedData = parseAIOutput(rawOutput);
            const validation = validatePresentation(parsedData, prompt.intent);

            if (!validation.valid) {
                throw new GenerationError(
                    'VALIDATION_ERROR',
                    validation.errors.map(error => error.message).join('; ')
                );
            }

            services.logger.log(JSON.stringify({
                event: 'presentation_generated',
                model: attempt.model,
                slides: validation.data.slides.length,
                warnings: validation.warnings.length
            }));
            return { presentation: validation.data, model: attempt.model };
        } catch (error) {
            lastError = error;
            services.logger.warn(JSON.stringify({
                event: 'generation_attempt_failed',
                model: attempt.model,
                repair: attempt.repair,
                failure: classifyFailure(error)
            }));
        }
    }

    throw new GenerationError(
        classifyFailure(lastError) === FailureTypes.RATE_LIMIT ? 'RATE_LIMITED' : 'GENERATION_FAILED',
        'Unable to generate a valid presentation right now.'
    );
}

function buildRepairPrompt(systemPrompt, error, intent) {
    return `${systemPrompt}

REPAIR REQUIRED
The previous response was invalid. Regenerate the complete presentation only.
- Return exactly ${intent.slideCount} slides.
- Use only type "content".
- Keep ${intent.style === 'concise' ? '2-3' : '3-5'} concise points per slide.
- Return a valid JSON object with no markdown fences or commentary.
Previous validation issue: ${error?.message || 'invalid output'}`;
}

module.exports = {
    generatePresentation: generatePresentationPipeline,
    parseAIOutput,
    validatePresentation,
    GenerationError
};
