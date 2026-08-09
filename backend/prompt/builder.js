/**
 * Prompt Builder
 *
 * Combines the system prompt with user request.
 * Now includes dynamic guidance based on user intent.
 *
 * Flow:
 * 1. Parse user intent from prompt
 * 2. Build dynamic system prompt with examples
 * 3. Add audience/tone/style guidance
 * 4. Return complete prompt for AI
 */

const { SYSTEM_PROMPT } = require('./system');
const { parseUserIntent } = require('./parser');

/**
 * Builds the complete prompt for AI generation
 * @param {string} userRequest - The user's prompt
 * @returns {Object} - { systemPrompt, userMessage, intent }
 */
function buildPrompt(userRequest) {
    // Validate input
    const cleanRequest = userRequest.trim();

    if (!cleanRequest) {
        throw new Error('User request cannot be empty');
    }

    // Step 1: Parse user intent
    const intent = parseUserIntent(cleanRequest);

    // Step 2: Start with base system prompt
    let systemPrompt = SYSTEM_PROMPT;

    // Step 3: Add few-shot examples
    systemPrompt += getExamples();

    // Step 4: Add audience-specific guidance
    if (intent.audience !== 'general') {
        systemPrompt += getAudienceGuidance(intent.audience);
    }

    // Step 5: Add tone guidance
    if (intent.tone !== 'neutral') {
        systemPrompt += getToneGuidance(intent.tone);
    }

    // Step 6: Add style guidance (points per slide)
    systemPrompt += getStyleGuidance(intent.style);

    // Step 7: Add slide count guidance
    systemPrompt += `\n\nSLIDE COUNT: Generate exactly ${intent.slideCount} slides.`;

    // Step 8: Add specific topics if provided
    if (intent.topics.length > 0) {
        systemPrompt += `\n\nCOVER THESE TOPICS IN ORDER:\n`;
        intent.topics.forEach((topic, i) => {
            systemPrompt += `${i + 1}. ${topic}\n`;
        });
    }

    return {
        system: systemPrompt,
        user: cleanRequest,
        intent
    };
}

/**
 * Returns few-shot examples for the AI
 * Free models perform significantly better with examples
 */
function getExamples() {
    return `

EXAMPLES

Example 1 - Required output shape:
User: "Create 6 professional slides about renewable energy covering solar and wind power"
Response: {
  "title": "Renewable Energy",
  "subtitle": "A professional overview of clean power sources",
  "slides": [
    {"type": "content", "title": "What Is Renewable Energy?", "points": ["Energy from naturally replenished sources", "Produces lower emissions than fossil fuels", "Supports long-term energy security"]},
    {"type": "content", "title": "Solar and Wind Power", "points": ["Solar panels convert sunlight into electricity", "Wind turbines capture moving air", "Both technologies are widely deployed"]}
  ]
}
Use the exact shape above, but generate the requested number of slides and cover every requested topic.`;
}

/**
 * Returns audience-specific guidance
 */
function getAudienceGuidance(audience) {
    const guidance = {

        beginner: `

AUDIENCE GUIDANCE: Beginner Level
- Use simple, everyday language
- Avoid technical jargon or explain it immediately
- Provide relatable real-world examples
- Define acronyms on first use
- Keep concepts foundational`,

        advanced: `

AUDIENCE GUIDANCE: Advanced/Technical
- Use precise technical terminology
- Include specific details and nuances
- Reference established concepts and frameworks
- Assume audience has domain knowledge
- Cover edge cases and considerations`,

        business: `

AUDIENCE GUIDANCE: Business Professionals
- Focus on practical applications and ROI
- Emphasize business value and outcomes
- Use industry-relevant examples
- Keep content actionable and strategic
- Avoid overly technical deep-dives`,

        student: `

AUDIENCE GUIDANCE: Students/Academic
- Support learning objectives
- Include key definitions and concepts
- Provide study-friendly structure
- Connect to academic theory
- Use clear, educational language`
    };

    return guidance[audience] || '';
}

/**
 * Returns tone-specific guidance
 */
function getToneGuidance(tone) {
    const guidance = {

        formal: `

TONE: Formal and Professional
- Use complete sentences
- Avoid contractions (use "do not" instead of "don't")
- Maintain objective, authoritative language
- Use precise vocabulary`,

        casual: `

TONE: Casual and Approachable
- Use conversational language
- Contractions are fine and encouraged
- Friendly and engaging style
- Relatable examples and analogies`,

        professional: `

TONE: Professional
- Clear and concise communication
- Confident but not arrogant
- Industry-appropriate language
- Balanced and informative`,

        fun: `

TONE: Fun and Engaging
- Use humor where appropriate
- Light and energetic style
- Memorable expressions and analogies
- Make learning enjoyable`
    };

    return guidance[tone] || '';
}

/**
 * Returns style-specific guidance (points per slide)
 */
function getStyleGuidance(style) {
    const guidance = {

        detailed: `

CONTENT STYLE: Detailed
- Use 3 to 5 concise bullet points per slide
- Prioritize complete topic coverage over dense slides
- Include specific examples only when they improve clarity
- Cover subtopics across multiple slides when needed`,

        concise: `

CONTENT STYLE: Concise
- Use 2 to 3 bullet points per slide
- Focus on essential information only
- Maximum clarity with minimum words
- High-level overview approach`,

        standard: `

CONTENT STYLE: Standard
- Use 3 to 5 bullet points per slide
- Balance detail with readability
- Cover key points effectively`
    };

    return guidance[style] || guidance.standard;
}

module.exports = {
    buildPrompt
};
