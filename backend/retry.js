/**
 * Retry Logic
 *
 * Handles retry attempts and fallback model switching.
 * Uses a chain of fallback models for maximum reliability.
 *
 * Retry strategy:
 * 1. Try primary model
 * 2. If validation fails, retry once with primary
 * 3. If still fails, try fallback chain (up to 3 models)
 * 4. If all fail, return error
 */

const { modelConfig, getNextFallback } = require('./ai/models');

/**
 * Failure types
 */
const FailureTypes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT',
    TIMEOUT: 'TIMEOUT',
    PROVIDER_ERROR: 'PROVIDER_ERROR',
    MALFORMED_OUTPUT: 'MALFORMED_OUTPUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Classifies an error into a failure type
 * @param {Error} error - The error to classify
 * @returns {string} - The failure type
 */
function classifyFailure(error) {
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('429')) {
        return FailureTypes.RATE_LIMIT;
    }
    if (message.includes('timeout') || message.includes('timed out') || message.includes('time out')) {
        return FailureTypes.TIMEOUT;
    }
    if (message.includes('openrouter') || message.includes('unable to reach')) {
        return FailureTypes.PROVIDER_ERROR;
    }
    if (message.includes('validation')) {
        return FailureTypes.VALIDATION_ERROR;
    }
    if (message.includes('json') || message.includes('parse')) {
        return FailureTypes.MALFORMED_OUTPUT;
    }

    return FailureTypes.UNKNOWN_ERROR;
}

/**
 * Returns the bounded recovery order for one presentation request.
 * The first retry is a compact repair attempt on the primary model. Fallbacks
 * receive the original request once each, preventing unbounded free-model use.
 */
function createAttemptPlan() {
    const primaryAttempts = [
        { model: modelConfig.primary, repair: false },
    ];

    if (modelConfig.maxRetries > 0) {
        primaryAttempts.push({ model: modelConfig.primary, repair: true });
    }

    return [
        ...primaryAttempts,
        ...modelConfig.fallbacks.map(model => ({ model, repair: false }))
    ];
}

/**
 * Creates a retry handler for generation with fallback chain
 * @param {Function} generateFn - The generation function (takes model param)
 * @param {Function} validateFn - The validation function
 * @returns {Function} - The retry-wrapped generation function
 */
function createRetryHandler(generateFn, validateFn) {
    return async function generateWithRetry(systemPrompt, userMessage) {
        let lastError = null;
        const maxFallbackAttempts = 3; // Limit fallback attempts

        // Attempt 1: Primary model
        try {
            console.log('Trying primary model:', modelConfig.primary);
            const result = await generateFn(systemPrompt, userMessage, modelConfig.primary);
            const validation = validateFn(result);

            if (validation.valid) {
                return result;
            }

            lastError = new Error('Validation failed: ' + validation.errors.map(e => e.message).join(', '));
        } catch (error) {
            lastError = error;
            console.error('Primary model failed:', error.message);
        }

        // Check if we should retry
        if (modelConfig.maxRetries <= 0) {
            throw lastError;
        }

        // Attempt 2: Retry with primary model (if not rate limited)
        const failureType = classifyFailure(lastError);
        if (failureType !== FailureTypes.RATE_LIMIT) {
            try {
                console.log('Retrying with primary model...');
                const result = await generateFn(systemPrompt, userMessage, modelConfig.primary);
                const validation = validateFn(result);

                if (validation.valid) {
                    return result;
                }

                lastError = new Error('Retry validation failed');
            } catch (error) {
                console.error('Retry failed:', error.message);
                lastError = error;
            }
        }

        // Attempt 3+: Try fallback chain
        let currentModel = modelConfig.primary;
        for (let attempt = 0; attempt < maxFallbackAttempts; attempt++) {
            const nextModel = getNextFallback(currentModel);

            if (!nextModel) {
                console.log('No more fallback models available');
                break;
            }

            try {
                console.log('Trying fallback model:', nextModel);
                const result = await generateFn(systemPrompt, userMessage, nextModel);
                const validation = validateFn(result);

                if (validation.valid) {
                    console.log('Fallback model succeeded:', nextModel);
                    return result;
                }

                lastError = new Error('Fallback validation failed: ' + nextModel);
            } catch (error) {
                console.error('Fallback model failed:', nextModel, error.message);
                lastError = error;
            }

            currentModel = nextModel;
        }

        // All attempts failed
        throw lastError || new Error('Generation failed after all attempts');
    };
}

module.exports = {
    FailureTypes,
    classifyFailure,
    createRetryHandler,
    createAttemptPlan
};
