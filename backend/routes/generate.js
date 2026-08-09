/**
 * Generate Route
 *
 * POST /api/generate
 *
 * Accepts a presentation prompt and returns structured presentation data.
 * This is the main API endpoint that connects frontend to AI generation.
 */

const express = require('express');
const router = express.Router();
const { generatePresentation } = require('../generator');

const MAX_PROMPT_LENGTH = 4_000;

/**
 * POST /api/generate
 *
 * Request body:
 * {
 *   "prompt": "Create presentation slides about AI Agents"
 * }
 *
 * Success response:
 * {
 *   "success": true,
 *   "presentation": { ... }
 * }
 *
 * Error response:
 * {
 *   "success": false,
 *   "error": { "code": "...", "message": "..." }
 * }
 */
router.post('/generate', async (req, res) => {
    try {
        // Extract prompt from request body
        const { prompt } = req.body;

        // Validate that prompt exists
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Please provide a valid presentation prompt'
                }
            });
        }

        if (prompt.trim().length > MAX_PROMPT_LENGTH) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PROMPT_TOO_LONG',
                    message: `Please keep the presentation request under ${MAX_PROMPT_LENGTH} characters.`
                }
            });
        }

        // Generate presentation
        const { presentation, model } = await generatePresentation(prompt.trim());

        // Return success response
        res.json({
            success: true,
            presentation,
            model
        });

    } catch (error) {
        console.error('Generation error:', error.code || 'UNKNOWN', error.message);

        const isRateLimited = error.code === 'RATE_LIMITED';
        res.status(isRateLimited ? 429 : 503).json({
            success: false,
            error: {
                code: isRateLimited ? 'RATE_LIMITED' : 'GENERATION_FAILED',
                message: isRateLimited
                    ? 'The free AI service is busy. Please try again shortly.'
                    : 'Unable to generate a presentation right now. Please try again.'
            }
        });
    }
});

module.exports = router;
