/**
 * OpenRouter AI Integration
 *
 * This is the ONLY file that contains OpenRouter-specific code.
 * All other modules interact with AI through abstract interfaces.
 *
 * Uses the Vercel AI SDK for models that have passed structured-output tests.
 * The REST fallback remains available for tested models that only reliably
 * return prompted JSON.
 *
 * Model fallback chain is managed by retry.js, not here.
 */

const { modelConfig, supportsStructuredOutput, getModelTimeout } = require('./models');
const { getSchemaForIntent } = require('../schema/presentation');
const { generateText, Output } = require('ai');
const { createOpenRouter } = require('@openrouter/ai-sdk-provider');

/**
 * OpenRouter API endpoint
 */
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Generates text using the specified model via OpenRouter API
 * @param {string} systemPrompt - The system instructions
 * @param {string} userMessage - The user's request
 * @param {string} model - The model ID to use (optional, defaults to primary)
 * @param {Object} intent - Parsed presentation requirements
 * @returns {Promise<string>} - The generated text
 */
async function generateWithModel(systemPrompt, userMessage, model = null, intent = null) {
    const modelId = model || modelConfig.primary;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set in .env.local');
    }

    console.log('Generating with model:', modelId);

    if (supportsStructuredOutput(modelId)) {
        return generateStructuredWithSdk({ apiKey, systemPrompt, userMessage, modelId, intent });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getModelTimeout(modelId));
    const requestBody = {
        model: modelId,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.35,
        max_tokens: Math.min(4000, 500 + ((intent?.slideCount || 6) * 280))
    };

    let response;
    try {
        response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'AI Presentation Generator'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('OpenRouter request timed out');
        }
        throw new Error('Unable to reach OpenRouter');
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenRouter');
    }

    return data.choices[0].message.content;
}

async function generateStructuredWithSdk({ apiKey, systemPrompt, userMessage, modelId, intent }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getModelTimeout(modelId));
    const openrouter = createOpenRouter({ apiKey });

    try {
        const result = await generateText({
            model: openrouter.chat(modelId),
            system: systemPrompt,
            prompt: userMessage,
            output: Output.object({ schema: getSchemaForIntent(intent || {}) }),
            abortSignal: controller.signal,
            temperature: 0.35,
            maxOutputTokens: Math.min(4000, 500 + ((intent?.slideCount || 6) * 280))
        });

        if (!result.output) {
            throw new Error('Structured output was empty');
        }

        return JSON.stringify(result.output);
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('OpenRouter request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Generates presentation content using the specified model
 * @param {string} systemPrompt - The system instructions
 * @param {string} userMessage - The user's request
 * @param {string} model - Optional model override
 * @returns {Promise<string>} - The generated JSON string
 */
async function generatePresentation(systemPrompt, userMessage, model = null, intent = null) {
    return generateWithModel(systemPrompt, userMessage, model, intent);
}

module.exports = {
    generateWithModel,
    generatePresentation
};
