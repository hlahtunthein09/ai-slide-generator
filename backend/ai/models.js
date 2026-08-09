/**
 * Model Configuration
 *
 * Defines which AI models to use for generation.
 * Keeps model IDs in one place, not scattered throughout the code.
 *
 * Active order is based on the team's presentation-generation tests, not
 * generic catalog rankings. Model availability still changes, so keep IDs and
 * capabilities here rather than scattered through the application.
 */

/**
 * Model configuration
 * Uses OPENROUTER_MODEL from .env.local, or falls back to defaults
 */
const modelConfig = {
    primary: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free',

    fallbacks: [
        'poolside/laguna-xs-2.1:free',
        'inclusionai/ling-3.0-tiny:free'
    ],

    // Maximum retry attempts (per model)
    maxRetries: 1,

    // Default timeout for a single provider request (ms)
    timeout: 45000
};

// Native JSON-schema support is enabled only after the model has been tested
// with OpenRouter structured output. Fallback models still receive the strict
// JSON prompt and are validated locally.
const modelCapabilities = {
    // Ultra handled long-context tests well but needs a slightly longer window
    // than the lighter fallbacks for detailed ten-slide presentations.
    'nvidia/nemotron-3-ultra-550b-a55b:free': { structuredOutput: true, timeoutMs: 75000 },
    'poolside/laguna-xs-2.1:free': { structuredOutput: false, timeoutMs: 45000 },
    'inclusionai/ling-3.0-tiny:free': { structuredOutput: false, timeoutMs: 45000 }
};

const experimentalModels = [
    'poolside/laguna-s-2.1:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'google/gemma-4-26b-a4b-it:free',
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'openai/gpt-oss-20b:free'
];

/**
 * Gets the next fallback model
 * @param {string} currentModel - The model that just failed
 * @returns {string|null} - Next model to try, or null if no more fallbacks
 */
function getNextFallback(currentModel) {
    const currentIndex = modelConfig.fallbacks.indexOf(currentModel);

    if (currentIndex === -1) {
        // Current model not in fallbacks list, try first fallback
        return modelConfig.fallbacks[0] || null;
    }

    // Return next in chain
    return modelConfig.fallbacks[currentIndex + 1] || null;
}

/**
 * Lists all available models for display/debugging
 * @returns {Object} - Model information
 */
function listModels() {
    return {
        primary: modelConfig.primary,
        fallbacks: modelConfig.fallbacks,
        experimental: experimentalModels,
        total: 1 + modelConfig.fallbacks.length
    };
}

function supportsStructuredOutput(modelId) {
    return Boolean(modelCapabilities[modelId]?.structuredOutput);
}

function getModelTimeout(modelId) {
    return modelCapabilities[modelId]?.timeoutMs || modelConfig.timeout;
}

module.exports = {
    modelConfig,
    getNextFallback,
    listModels,
    supportsStructuredOutput,
    getModelTimeout
};
