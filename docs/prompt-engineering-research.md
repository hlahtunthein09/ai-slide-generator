# Prompt Engineering Research
# Enhancing the Controlled Presentation Engine

## Project Goal
"Show that even a free model can generate quality content when built with a controlled and structured engine."

---

## Current System Analysis

### What Works
- ✅ Clear JSON schema in system prompt
- ✅ Content rules (stay focused, avoid hallucination)
- ✅ Structure rules (slide count, points per slide)
- ✅ Output rules (JSON only, no extra text)

### Limitations
- ❌ Fixed slide count (4-8) - can't handle "10 slides"
- ❌ No user preference extraction
- ❌ Single example - free models need more guidance
- ❌ No handling of specific topic requests

---

## Research: Techniques for Free Models

### 1. Few-Shot Prompting (Critical for Free Models)

Free models (Llama, Gemma, Mistral) perform significantly better with examples.

**Current:** 1 example (JSON format only)
**Upgrade:** 3-4 examples covering different scenarios

```
EXAMPLE 1 - Simple topic:
User: "Create slides about climate change"
Output: { title: "Climate Change", slides: [...] }

EXAMPLE 2 - With slide count:
User: "Create 10 slides about machine learning"
Output: { title: "Machine Learning", slides: [...10 slides...] }

EXAMPLE 3 - With specific topics:
User: "Create slides about Python covering: basics, data types, functions, classes"
Output: { title: "Python Programming", slides: [...covering each topic...] }

EXAMPLE 4 - With audience:
User: "Create slides about cybersecurity for beginners"
Output: { title: "Cybersecurity Basics", slides: [...beginner-friendly content...] }
```

### 2. Chain-of-Thought for Complex Prompts

For detailed prompts, guide the model to think step-by-step:

```
When the user provides a detailed request:
1. Identify the main topic
2. Count requested slides (or default to 6)
3. List specific topics mentioned
4. Identify audience level (beginner/intermediate/advanced)
5. Generate presentation following these parameters
```

### 3. Dynamic Schema Guidance

Instead of fixed constraints, provide range-based guidance:

```
SLIDE COUNT:
- If user specifies a number, use that (within 3-15 range)
- If not specified, default to 6 slides
- For simple topics: 4-6 slides
- For complex topics: 8-12 slides

POINTS PER SLIDE:
- Default: 3-5 points
- If user says "detailed": 5-7 points
- If user says "concise/brief": 2-3 points
```

### 4. Topic Extraction Patterns

Common patterns to detect:

| Pattern | Example | Extracted |
|---------|---------|-----------|
| "about X" | "slides about AI" | topic: "AI" |
| "covering X, Y, Z" | "covering basics, advanced" | topics: ["basics", "advanced"] |
| "including X" | "including real examples" | include: ["real examples"] |
| "for X audience" | "for business audience" | audience: "business" |
| "with X slides" | "with 10 slides" | slideCount: 10 |
| "X style" | "formal style" | tone: "formal" |

---

## Proposed Enhancements

### Enhancement 1: User Intent Parser (New Module)

**File:** `backend/prompt/parser.js`

**Purpose:** Extract structured preferences from natural language

**Extractable Fields:**
```javascript
{
    slideCount: number,      // "10 slides" → 10
    topics: string[],        // "covering A, B, C" → ["A", "B", "C"]
    audience: string,        // "for beginners" → "beginner"
    tone: string,            // "formal tone" → "formal"
    style: string,           // "detailed" → "detailed"
    specificPoints: string[]  // "include X, Y" → ["X", "Y"]
}
```

**Implementation:**
```javascript
function parseUserIntent(prompt) {
    const intent = {
        slideCount: 6,  // default
        topics: [],
        audience: 'general',
        tone: 'neutral',
        style: 'standard',
        specificPoints: []
    };

    // Extract slide count
    const countMatch = prompt.match(/(\d+)\s*slides?/i);
    if (countMatch) {
        intent.slideCount = Math.min(15, Math.max(3, parseInt(countMatch[1])));
    }

    // Extract topics after keywords
    const topicMatch = prompt.match(/(?:about|covering|including|on)\s+(.+?)(?:\.|,|$)/i);
    if (topicMatch) {
        intent.topics = topicMatch[1].split(/,|and/).map(t => t.trim());
    }

    // Extract audience
    const audienceKeywords = {
        'beginner': 'beginner',
        'basic': 'beginner',
        'simple': 'beginner',
        'advanced': 'advanced',
        'technical': 'advanced',
        'business': 'business',
        'corporate': 'business',
        'student': 'student',
        'academic': 'student'
    };

    for (const [keyword, level] of Object.entries(audienceKeywords)) {
        if (prompt.toLowerCase().includes(keyword)) {
            intent.audience = level;
            break;
        }
    }

    // Extract tone
    const toneKeywords = ['formal', 'casual', 'professional', 'fun', 'serious'];
    for (const tone of toneKeywords) {
        if (prompt.toLowerCase().includes(tone)) {
            intent.tone = tone;
            break;
        }
    }

    // Extract style
    const styleKeywords = {
        'detailed': 'detailed',
        'comprehensive': 'detailed',
        'thorough': 'detailed',
        'concise': 'concise',
        'brief': 'concise',
        'short': 'concise'
    };

    for (const [keyword, style] of Object.entries(styleKeywords)) {
        if (prompt.toLowerCase().includes(keyword)) {
            intent.style = style;
            break;
        }
    }

    return intent;
}
```

---

### Enhancement 2: Dynamic System Prompt Builder

**File:** `backend/prompt/builder.js` (upgrade existing)

**Purpose:** Adapt system prompt based on user intent

**Key Changes:**

```javascript
function buildPrompt(userRequest) {
    // Parse user intent
    const intent = parseUserIntent(userRequest);

    // Build dynamic system prompt
    let systemPrompt = getBaseSystemPrompt();

    // Add few-shot examples
    systemPrompt += getExamples(intent);

    // Add audience-specific guidance
    if (intent.audience !== 'general') {
        systemPrompt += getAudienceGuidance(intent.audience);
    }

    // Add tone guidance
    if (intent.tone !== 'neutral') {
        systemPrompt += getToneGuidance(intent.tone);
    }

    // Add slide count guidance
    systemPrompt += `\n\nSLIDE COUNT: Generate exactly ${intent.slideCount} slides.`;

    // Add specific topics if provided
    if (intent.topics.length > 0) {
        systemPrompt += `\n\nCOVER THESE TOPICS IN ORDER:\n`;
        intent.topics.forEach((topic, i) => {
            systemPrompt += `${i + 1}. ${topic}\n`;
        });
    }

    return {
        systemPrompt,
        userMessage: userRequest,
        intent  // Pass intent for schema configuration
    };
}

function getExamples(intent) {
    return `
EXAMPLES:

Example 1 - Simple topic:
User: "Create slides about Artificial Intelligence"
Response: {"title":"Artificial Intelligence","subtitle":"An overview of AI concepts and applications","slides":[{"type":"content","title":"What is AI?","points":["AI simulates human intelligence in machines","Includes learning, reasoning, and self-correction","Transforms industries worldwide"]},...4-6 total slides...]}

Example 2 - With slide count:
User: "Create 10 slides about Machine Learning"
Response: {"title":"Machine Learning","subtitle":"A comprehensive guide to ML concepts","slides":[...10 slides with 3-5 points each...]}

Example 3 - With specific topics:
User: "Create slides about Python covering: variables, functions, classes, and libraries"
Response: {"title":"Python Programming","subtitle":"Core concepts for beginners","slides":[{"type":"content","title":"Variables in Python","points":["Variables store data values","No need to declare type explicitly","Support strings, numbers, lists"]},{"type":"content","title":"Functions","points":["Functions group reusable code","Use def keyword to create","Can accept parameters and return values"]},{"type":"content","title":"Classes and Objects","points":["Classes define object blueprints","Objects are instances of classes","Support inheritance and polymorphism"]},{"type":"content","title":"Python Libraries","points":["NumPy for numerical computing","Pandas for data manipulation","Matplotlib for visualization"]}]}

Example 4 - With audience:
User: "Create slides about cybersecurity for beginners"
Response: {"title":"Cybersecurity Basics","subtitle":"Simple guide to staying safe online","slides":[{"type":"content","title":"What is Cybersecurity?","points":["Protecting systems from digital attacks","Safeguards data, networks, and programs","Everyone needs basic cyber hygiene"]},{"type":"content","title":"Common Threats","points":["Phishing: fake emails stealing passwords","Malware: harmful software infecting devices","Weak passwords: easy entry for hackers"]},...beginner-friendly language, simple examples...]}
`;
}

function getAudienceGuidance(audience) {
    const guidance = {
        beginner: `
AUDIENCE: Beginner level
- Use simple, everyday language
- Avoid technical jargon
- Provide relatable examples
- Explain acronyms on first use`,

        advanced: `
AUDIENCE: Advanced/Technical
- Use precise technical terminology
- Include specific details and nuances
- Reference established concepts
- Assume domain knowledge`,

        business: `
AUDIENCE: Business professionals
- Focus on practical applications
- Emphasize ROI and value
- Use industry-relevant examples
- Keep actionable and strategic`,

        student: `
AUDIENCE: Students/Academic
- Support learning objectives
- Include key definitions
- Provide study-friendly structure
- Connect to academic concepts`
    };

    return guidance[audience] || '';
}

function getToneGuidance(tone) {
    const guidance = {
        formal: `
TONE: Formal and professional
- Use complete sentences
- Avoid contractions
- Maintain objective language`,

        casual: `
TONE: Casual and approachable
- Use conversational language
- Contractions are fine
- Friendly and engaging`,

        professional: `
TONE: Professional
- Clear and concise
- Confident but not arrogant
- Industry-appropriate language`,

        fun: `
TONE: Fun and engaging
- Use humor where appropriate
- Light and energetic
- Memorable expressions`
    };

    return guidance[tone] || '';
}
```

---

### Enhancement 3: Flexible Schema Configuration

**File:** `backend/schema/presentation.js` (upgrade existing)

**Purpose:** Allow schema constraints to adapt to user intent

```javascript
const { z } = require('zod');

/**
 * Creates a presentation schema with configurable constraints
 * @param {Object} options - Configuration options
 * @returns {Object} - Zod schema
 */
function createPresentationSchema(options = {}) {
    const {
        minSlides = 3,
        maxSlides = 15,
        minPoints = 2,
        maxPoints = 7,
        maxTitleLength = 60,
        maxPointLength = 200
    } = options;

    const slideSchema = z.object({
        type: z.literal('content'),
        title: z.string().min(1).max(maxTitleLength),
        points: z
            .array(z.string().min(1).max(maxPointLength))
            .min(minPoints)
            .max(maxPoints)
    });

    return z.object({
        title: z.string().min(1).max(100),
        subtitle: z.string().min(1).max(150),
        slides: z
            .array(slideSchema)
            .min(minSlides)
            .max(maxSlides)
    });
}

/**
 * Get schema based on user intent
 */
function getSchemaForIntent(intent) {
    const options = {
        minSlides: 3,
        maxSlides: 15,
        minPoints: 3,
        maxPoints: 5
    };

    // Adjust based on style
    if (intent.style === 'detailed') {
        options.maxPoints = 7;
    } else if (intent.style === 'concise') {
        options.minPoints = 2;
        options.maxPoints = 3;
    }

    // Adjust based on slide count
    options.minSlides = Math.max(3, intent.slideCount - 2);
    options.maxSlides = Math.min(15, intent.slideCount + 2);

    return createPresentationSchema(options);
}

/**
 * Validates presentation data against schema
 */
function validateSchema(data, schema = null) {
    // Use provided schema or default
    const presentationSchema = schema || createPresentationSchema();

    const result = presentationSchema.safeParse(data);

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
    validateSchema
};
```

---

### Enhancement 4: Enhanced Validation Rules

**File:** `backend/validation/rules.js` (upgrade existing)

**Purpose:** Better quality checks without overcomplicating

```javascript
/**
 * Validates presentation rules with enhanced quality checks
 */
function validatePresentationRules(presentation, intent = null) {
    const errors = [];
    const warnings = [];

    // === EXISTING CHECKS ===

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

    // Check for reasonable title length
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

    // === NEW QUALITY CHECKS ===

    // Check for very short points (less than 5 words)
    presentation.slides.forEach((slide, slideIndex) => {
        slide.points.forEach((point, pointIndex) => {
            const wordCount = point.split(/\s+/).length;
            if (wordCount < 5) {
                warnings.push({
                    type: 'SHORT_POINT',
                    message: `Slide ${slideIndex + 1}, Point ${pointIndex + 1}: Very short (${wordCount} words)`
                });
            }
        });
    });

    // Check for repetitive opening words across slides
    const firstWords = presentation.slides.map(s =>
        s.points[0]?.split(/\s+/)[0]?.toLowerCase()
    ).filter(Boolean);

    const wordCounts = {};
    firstWords.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    Object.entries(wordCounts).forEach(([word, count]) => {
        if (count > 3) {
            warnings.push({
                type: 'REPETITIVE_OPENINGS',
                message: `Multiple slides start with "${word}" - consider varying language`
            });
        }
    });

    // Check if requested slide count was met (if intent provided)
    if (intent && intent.slideCount) {
        const requested = intent.slideCount;
        const actual = presentation.slides.length;

        if (Math.abs(actual - requested) > 2) {
            warnings.push({
                type: 'SLIDE_COUNT_MISMATCH',
                message: `Requested ${requested} slides, got ${actual}`
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}

module.exports = {
    validatePresentationRules
};
```

---

### Enhancement 5: Updated Generator Pipeline

**File:** `backend/generator.js` (upgrade existing)

**Purpose:** Integrate all enhancements into the pipeline

```javascript
const { parseUserIntent } = require('./prompt/parser');
const { buildPrompt } = require('./prompt/builder');
const { getSchemaForIntent, validateSchema } = require('./schema/presentation');
const { validatePresentationRules } = require('./validation/rules');
const { generateWithRetry } = require('./retry');

/**
 * Main generation pipeline
 * Orchestrates the entire process from prompt to validated presentation
 */
async function generatePresentation(userRequest) {
    try {
        // Step 1: Parse user intent
        const intent = parseUserIntent(userRequest);
        console.log('Parsed intent:', intent);

        // Step 2: Build prompt with intent
        const { systemPrompt, userMessage } = buildPrompt(userRequest);

        // Step 3: Get schema based on intent
        const schema = getSchemaForIntent(intent);

        // Step 4: Generate with AI
        const rawOutput = await generateWithRetry(systemPrompt, userMessage);

        // Step 5: Parse AI output
        const parsedOutput = parseAIOutput(rawOutput);

        // Step 6: Validate against schema
        const schemaResult = validateSchema(parsedOutput, schema);

        if (!schemaResult.success) {
            return {
                success: false,
                error: 'Schema validation failed',
                details: schemaResult.errors
            };
        }

        // Step 7: Validate presentation rules
        const rulesResult = validatePresentationRules(schemaResult.data, intent);

        if (!rulesResult.valid) {
            return {
                success: false,
                error: 'Presentation rules validation failed',
                details: rulesResult.errors
            };
        }

        // Step 8: Return success with warnings (if any)
        return {
            success: true,
            presentation: schemaResult.data,
            warnings: rulesResult.warnings || []
        };

    } catch (error) {
        console.error('Generation error:', error);
        return {
            success: false,
            error: error.message || 'Generation failed'
        };
    }
}

/**
 * Parses AI output string into JSON
 */
function parseAIOutput(output) {
    // Remove markdown code fences if present
    let cleaned = output.trim();

    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }

    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }

    cleaned = cleaned.trim();

    // Parse JSON
    const parsed = JSON.parse(cleaned);
    return parsed;
}

module.exports = {
    generatePresentation
};
```

---

## Implementation Summary

| Component | File | Change | Lines |
|-----------|------|--------|-------|
| Intent Parser | `prompt/parser.js` | New | ~80 |
| Prompt Builder | `prompt/builder.js` | Upgrade | ~150 |
| Schema | `schema/presentation.js` | Upgrade | ~80 |
| Validation | `validation/rules.js` | Upgrade | ~100 |
| Generator | `generator.js` | Upgrade | ~60 |

**Total new/changed code:** ~470 lines

---

## Key Principles Maintained

1. **Small Scope** - Only essential enhancements
2. **Controlled Generation** - AI provides content, app controls rendering
3. **Free Model Friendly** - Few-shot examples help free models significantly
4. **Structured Output** - Dynamic schema ensures valid JSON
5. **Quality Validation** - Catches issues without over-engineering

---

## Expected Outcomes

| User Prompt | Before | After |
|-------------|--------|-------|
| "Create 10 slides about AI" | ❌ Fails (max 8) | ✅ Generates 10 slides |
| "Create slides about Python covering basics, functions, classes" | ❌ Ignores topics | ✅ Covers all topics in order |
| "Create beginner-friendly slides about cybersecurity" | ❌ No audience handling | ✅ Simple language, relatable examples |
| "Create detailed slides about machine learning" | ❌ Fixed 3-5 points | ✅ 5-7 points per slide |
| "Create concise slides about cloud computing" | ❌ Fixed 3-5 points | ✅ 2-3 points per slide |

---

## Sources

- Prompt Engineering Guide: https://promptingguide.ai
- OpenAI Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs
- Anthropic Prompt Engineering: https://docs.anthropic.com/claude/docs/prompt-engineering
