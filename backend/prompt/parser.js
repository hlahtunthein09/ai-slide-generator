/**
 * User Intent Parser
 *
 * Extracts structured preferences from natural language prompts.
 * This allows the engine to adapt to user requests like:
 * - "Create 10 slides about AI" → slideCount: 10
 * - "Covering basics, functions, classes" → topics: [...]
 * - "For beginners" → audience: "beginner"
 * - "Detailed explanation" → style: "detailed"
 *
 * The parser uses simple regex patterns - no AI needed.
 */

/**
 * Parses user request to extract intent
 * @param {string} prompt - The user's natural language prompt
 * @returns {Object} - Structured intent object
 */
function parseUserIntent(prompt) {
    const intent = {
        slideCount: 6,        // default
        topics: [],           // specific topics to cover
        audience: 'general',  // beginner, intermediate, advanced, business, student
        tone: 'neutral',      // formal, casual, professional, fun
        style: 'standard'     // standard, detailed, concise
    };

    if (!prompt || typeof prompt !== 'string') {
        return intent;
    }

    const lowerPrompt = prompt.toLowerCase();

    // ============================================
    // 1. Extract slide count
    // ============================================
    // Patterns: "10 slides", "10-slide", "10 detailed slides", "10 slide presentation"
    // Also handles multiple adjectives: "10 detailed, professional slides"
    const countPatterns = [
        /(\d+)\s+(?:\w+[\s,]+)*slides?\b/i,  // "10 slides", "10 detailed slides", "10 detailed, professional slides"
        /(\d+)\s*-\s*slide/i,               // "10-slide"
        /(\d+)\s+slide\s+presentation/i,    // "10 slide presentation"
        /presentation\s+(?:with|of|having)\s+(\d+)/i  // "presentation with 10"
    ];

    for (const pattern of countPatterns) {
        const match = prompt.match(pattern);
        if (match) {
            const count = parseInt(match[1], 10);
            // Clamp between 3 and 15
            intent.slideCount = Math.min(15, Math.max(3, count));
            break;
        }
    }

    // ============================================
    // 2. Extract specific topics
    // ============================================
    // Patterns: "covering X, Y, Z", "about X, Y, and Z", "including X"
    // Also handles numbered lists: "covering: 1. Topic A, 2. Topic B"
    // Stops before trailing instructions like "Make it professional."
    const topicPatterns = [
        /(?:covering|including)\s*:?\s+([\s\S]+?)(?=\.\s+(?:Make|Please|Ensure|It\s+should|Can\s+you|Should|Would|Use\s|Keep\s|Try\s|Let\s|Give|Provide|Add|Include)|\.?$)/i,
        /(?:about)\s+(.+?)(?:\s+(?:with|for|that|which|,)|\.|$)/i
    ];

    for (const pattern of topicPatterns) {
        const match = prompt.match(pattern);
        if (match) {
            const topicText = match[1].trim();
            const topics = splitTopics(topicText);

            if (topics.length > 0) {
                intent.topics = topics;
                break;
            }
        }
    }

    // ============================================
    // 3. Extract audience level
    // ============================================
    const audienceMap = {
        // Beginner level
        'beginner': 'beginner',
        'basic': 'beginner',
        'simple': 'beginner',
        'introduction': 'beginner',
        'intro to': 'beginner',
        'newbie': 'beginner',
        'novice': 'beginner',

        // Advanced level
        'advanced': 'advanced',
        'technical': 'advanced',
        'in-depth': 'advanced',
        'deep dive': 'advanced',
        'expert': 'advanced',
        'comprehensive': 'advanced',

        // Business level
        'business': 'business',
        'corporate': 'business',
        'enterprise': 'business',
        'professional': 'business',
        'workplace': 'business',
        'industry': 'business',

        // Student level
        'student': 'student',
        'academic': 'student',
        'university': 'student',
        'college': 'student',
        'school': 'student',
        'education': 'student',
        'learning': 'student'
    };

    for (const [keyword, level] of Object.entries(audienceMap)) {
        if (lowerPrompt.includes(keyword)) {
            intent.audience = level;
            break;
        }
    }

    // ============================================
    // 4. Extract tone
    // ============================================
    const toneMap = {
        'formal': 'formal',
        'official': 'formal',
        'serious': 'formal',

        'casual': 'casual',
        'relaxed': 'casual',
        'informal': 'casual',

        'professional': 'professional',
        'business-like': 'professional',
        'corporate': 'professional',

        'engaging': 'fun',
        'entertaining': 'fun',
        'humorous': 'fun'
    };

    for (const [keyword, tone] of Object.entries(toneMap)) {
        if (lowerPrompt.includes(keyword)) {
            intent.tone = tone;
            break;
        }
    }

    // ============================================
    // 5. Extract style preference
    // ============================================
    const styleMap = {
        // Detailed style
        'detailed': 'detailed',
        'comprehensive': 'detailed',
        'thorough': 'detailed',
        'in-depth': 'detailed',
        'extensive': 'detailed',
        'elaborate': 'detailed',

        // Concise style
        'concise': 'concise',
        'brief': 'concise',
        'short': 'concise',
        'quick': 'concise',
        'summary': 'concise',
        'overview': 'concise',
        'high-level': 'concise'
    };

    for (const [keyword, style] of Object.entries(styleMap)) {
        if (lowerPrompt.includes(keyword)) {
            intent.style = style;
            break;
        }
    }

    return intent;
}

/**
 * Splits a topic string into individual topics.
 * Handles comma-separated lists, "and" separators, and numbered lists.
 * @param {string} topicText - The raw topic text extracted from the prompt
 * @returns {string[]} - Array of clean topic strings
 */
function splitTopics(topicText) {
    // Remove common prefixes like "these topics in order:", "the following topics:", etc.
    const cleaned = topicText
        .replace(/^(?:these|the following|following|these following)\s+topics?\s*(?:in order)?\s*:?\s*/i, '')
        .replace(/^topics?:\s*/i, '');

    // Split by numbered markers (1. 2. or 1) 2)), commas, semicolons, or "and"
    const separators = /(?:\d+[.)]\s*)|(?:\s+and\s+)|[,;]/;

    return cleaned
        .split(separators)
        .map(t => t.trim().replace(/^[.:\)\s]+|[.:\s]+$/g, ''))
        .filter(t => t.length > 0 && t.length < 100);
}

module.exports = {
    parseUserIntent
};
