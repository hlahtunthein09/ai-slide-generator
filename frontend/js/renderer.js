/**
 * Slide Renderer Module
 *
 * Responsible for converting presentation data into HTML slides.
 * This module does NOT make any API calls - it only renders data.
 *
 * The renderer is completely deterministic:
 * - AI provides content (title, points)
 * - Renderer provides visual design (layout, spacing, colors, icons)
 */

// Presentation Renderer
const PresentationRenderer = {

    // Presentation-level title, used in the header of every content slide
    deckTitle: '',

    /**
     * Topic-to-icon rules. A precise title phrase is always preferred to a
     * broad title term, then a precise bullet phrase, then a broad bullet term.
     * Whole-word matching prevents accidental matches inside longer words.
     */
    iconRules: [
        // Everyday presentation subjects
        { icon: 'leaf-01.svg', titlePhrases: ['climate change', 'sustainability'], titleTerms: ['climate', 'sustainable'], bulletPhrases: ['climate change', 'sustainability'] },
        { icon: 'health.svg', titlePhrases: ['public health', 'health care', 'healthcare'], titleTerms: ['health', 'medical', 'wellness'], bulletPhrases: ['public health', 'health care'] },
        { icon: 'money-01.svg', titlePhrases: ['financial planning', 'personal finance'], titleTerms: ['finance', 'financial', 'investment', 'economy', 'banking', 'budget'], bulletPhrases: ['financial planning', 'personal finance'] },
        { icon: 'megaphone-01.svg', titlePhrases: ['marketing strategy', 'digital marketing'], titleTerms: ['marketing', 'advertising', 'branding'], bulletPhrases: ['marketing strategy', 'digital marketing'] },
        { icon: 'justice-scale-01.svg', titlePhrases: ['legal framework', 'rule of law'], titleTerms: ['legal', 'law', 'justice', 'policy'], bulletPhrases: ['legal framework', 'rule of law'] },
        { icon: 'atom-01.svg', titlePhrases: ['scientific discovery', 'scientific method'], titleTerms: ['science', 'scientific', 'physics', 'chemistry', 'biology'], bulletPhrases: ['scientific discovery', 'scientific method'] },
        { icon: 'airplane-01.svg', titlePhrases: ['travel and tourism'], titleTerms: ['travel', 'tourism', 'aviation'], bulletPhrases: ['travel and tourism'] },
        { icon: 'paint-brush-01.svg', titlePhrases: ['art and design', 'visual arts'], titleTerms: ['art', 'design', 'creative'], bulletPhrases: ['art and design', 'visual arts'] },
        { icon: 'school.svg', titlePhrases: ['education reform', 'higher education'], titleTerms: ['education', 'school', 'teaching', 'student'], bulletPhrases: ['education reform', 'higher education'] },
        { icon: 'football.svg', titlePhrases: ['sports performance'], titleTerms: ['sport', 'sports', 'athletics'], bulletPhrases: ['sports performance'] },
        { icon: 'briefcase-01.svg', titlePhrases: ['business operations', 'business strategy'], titleTerms: ['operations', 'management', 'enterprise'], bulletPhrases: ['business operations', 'business strategy'] },

        // University and student life
        { icon: 'university.svg', titlePhrases: ['university life', 'college life'], titleTerms: ['university', 'college', 'campus'], bulletPhrases: ['university life', 'college life'] },
        { icon: 'building-01.svg', titlePhrases: ['campus facilities', 'university facilities'], titleTerms: ['facilities', 'architecture'], bulletPhrases: ['campus facilities', 'university facilities'] },
        { icon: 'book-open-01.svg', titlePhrases: ['academic courses', 'course selection'], titleTerms: ['academic', 'course', 'courses', 'lecture', 'lectures', 'class', 'classes', 'study'], bulletPhrases: ['academic courses', 'course selection'] },
        { icon: 'user-group.svg', titlePhrases: ['student clubs', 'student organizations'], titleTerms: ['clubs', 'organizations', 'societies'], bulletPhrases: ['student clubs', 'student organizations'] },
        { icon: 'home-01.svg', titlePhrases: ['campus housing', 'student housing'], titleTerms: ['housing', 'dormitory', 'dorm', 'accommodation'], bulletPhrases: ['campus housing', 'student housing'] },
        { icon: 'briefcase-01.svg', titlePhrases: ['career preparation', 'career development'], titleTerms: ['career', 'internship', 'internships', 'employment'], bulletPhrases: ['career preparation', 'career development'] },
        { icon: 'library.svg', titlePhrases: ['campus library', 'university library'], titleTerms: ['library', 'libraries'], bulletPhrases: ['campus library', 'university library'] },

        // Artificial intelligence and software
        { icon: 'ai-chip.svg', titlePhrases: ['machine learning'], titleTerms: ['neural'], bulletPhrases: ['machine learning', 'neural network'] },
        { icon: 'ai-brain-01.svg', titlePhrases: ['artificial intelligence', 'ai agents'], titleTerms: ['ai', 'intelligence'], bulletPhrases: ['artificial intelligence', 'ai agents'] },
        { icon: 'ai-learning.svg', titlePhrases: ['learning strategy'], titleTerms: ['learning'], bulletPhrases: ['learning strategy'] },
        { icon: 'ai-programming.svg', titlePhrases: ['ai programming'], titleTerms: ['programming'], bulletPhrases: ['ai programming'] },
        { icon: 'code.svg', titlePhrases: ['software development'], titleTerms: ['coding', 'software', 'development', 'developer'], bulletPhrases: ['software development', 'computer programming'] },
        { icon: 'database-01.svg', titlePhrases: ['data management', 'data architecture', 'database design'], titleTerms: ['database'], bulletPhrases: ['data management', 'database design'] },
        { icon: 'folder-file-storage.svg', titlePhrases: ['data storage'], titleTerms: ['storage'], bulletPhrases: ['data storage'] },
        { icon: 'computer-ethernet.svg', titlePhrases: ['computer network', 'network infrastructure'], titleTerms: ['network', 'internet', 'connection'], bulletPhrases: ['network infrastructure', 'internet connection'] },

        // Security and technical infrastructure
        { icon: 'security.svg', titlePhrases: ['cyber security', 'cybersecurity', 'security controls', 'data protection'], titleTerms: ['security', 'secure', 'protection'], bulletPhrases: ['cyber security', 'data protection', 'security controls'] },
        { icon: 'security-lock.svg', titlePhrases: ['data privacy'], titleTerms: ['privacy', 'lock'], bulletPhrases: ['data privacy'] },
        { icon: 'key-01.svg', titlePhrases: ['access control'], titleTerms: ['authentication', 'access'], bulletPhrases: ['access control', 'user authentication'] },
        { icon: 'security-block.svg', titlePhrases: ['malware protection'], titleTerms: ['malware', 'virus'], bulletPhrases: ['malware protection', 'computer virus'] },
        { icon: 'security-validation.svg', titlePhrases: ['risk management', 'threat assessment'], titleTerms: ['threat', 'attack', 'risk'], bulletPhrases: ['risk management', 'threat assessment'] },
        { icon: 'cloud-server.svg', titlePhrases: ['cloud computing', 'cloud infrastructure'], titleTerms: ['cloud', 'server'], bulletPhrases: ['cloud computing', 'cloud infrastructure'] },
        { icon: 'cpu.svg', titlePhrases: ['computer hardware'], titleTerms: ['hardware', 'cpu', 'processor'], bulletPhrases: ['computer hardware'] },
        { icon: 'settings-01.svg', titlePhrases: ['system configuration'], titleTerms: ['settings', 'configuration'], bulletPhrases: ['system configuration'] },
        { icon: 'computer-activity.svg', titlePhrases: ['computer systems'], titleTerms: ['computer', 'laptop', 'device'], bulletPhrases: ['computer systems'] },

        // People and communication
        { icon: 'user-group.svg', titlePhrases: ['team collaboration', 'user experience'], titleTerms: ['users', 'people', 'team'], bulletPhrases: ['team collaboration', 'user experience'] },
        { icon: 'user-02.svg', titlePhrases: ['user profile'], titleTerms: ['user', 'person'], bulletPhrases: ['user profile'] },
        { icon: 'message-01.svg', titlePhrases: ['business communication'], titleTerms: ['communication', 'message'], bulletPhrases: ['business communication'] },
        { icon: 'mail-01.svg', titlePhrases: ['email marketing'], titleTerms: ['email', 'mail'], bulletPhrases: ['email marketing'] },
        { icon: 'call-02.svg', titlePhrases: ['customer contact'], titleTerms: ['phone', 'contact'], bulletPhrases: ['customer contact'] },

        // International, analysis, and project work
        { icon: 'global-education.svg', titlePhrases: ['global education'], titleTerms: [], bulletPhrases: ['global education'] },
        { icon: 'global.svg', titlePhrases: ['global market', 'international business'], titleTerms: ['global', 'world', 'international'], bulletPhrases: ['global market', 'international business'] },
        { icon: 'chart-bar-line.svg', titlePhrases: ['data visualization'], titleTerms: ['chart'], bulletPhrases: ['data visualization'] },
        { icon: 'analytics-01.svg', titlePhrases: ['business analytics', 'data analytics'], titleTerms: ['analytics', 'statistics', 'growth', 'trend'], bulletPhrases: ['business analytics', 'data analytics'] },
        { icon: 'target-01.svg', titlePhrases: ['project goals', 'strategic objectives'], titleTerms: ['goal', 'objective', 'target'], bulletPhrases: ['project goals', 'strategic objectives'] },
        { icon: 'bulb.svg', titlePhrases: ['design thinking'], titleTerms: ['idea', 'innovation', 'solution'], bulletPhrases: ['design thinking'] },
        { icon: 'search-01.svg', titlePhrases: ['market research'], titleTerms: ['search'], bulletPhrases: ['market research'] },
        { icon: 'book-open-01.svg', titlePhrases: ['research methods'], titleTerms: ['research'], bulletPhrases: ['research methods'] },
        { icon: 'workflow-square-01.svg', titlePhrases: ['project workflow'], titleTerms: ['workflow'], bulletPhrases: ['project workflow'] },
        { icon: 'flowchart-01.svg', titlePhrases: ['business process'], titleTerms: ['process'], bulletPhrases: ['business process'] },
        { icon: 'checkmark-circle-01.svg', titlePhrases: ['project success'], titleTerms: ['confirm', 'success', 'complete'], bulletPhrases: ['project success'] },
        // Common sections generated in many presentation outlines
        { icon: 'user-group.svg', priority: 80, titlePhrases: ['social life', 'campus community'], titleTerms: ['social', 'community', 'activities'], bulletPhrases: ['social life', 'campus community'] },
        { icon: 'checkmark-circle-01.svg', priority: 80, titlePhrases: ['benefits of', 'advantages of', 'key benefits', 'conclusion'], titleTerms: ['benefits', 'advantages', 'conclusion'], bulletPhrases: ['key benefits', 'main advantages'] },
        { icon: 'alert-01.svg', priority: 80, titlePhrases: ['common challenges', 'key challenges', 'main problems'], titleTerms: ['challenge', 'challenges', 'problem', 'problems', 'issue', 'issues'], bulletPhrases: ['common challenges', 'key challenges'] },
        { icon: 'rocket-01.svg', priority: 80, titlePhrases: ['future opportunities', 'future outlook', 'next steps'], titleTerms: ['future', 'opportunities'], bulletPhrases: ['future opportunities', 'future outlook'] }
    ],

    /**
     * Renders a complete presentation into the slide container
     * @param {Object} presentation - The presentation data object
     * @param {string} presentation.title - Presentation title
     * @param {string} presentation.subtitle - Presentation subtitle
     * @param {Array} presentation.slides - Array of slide objects
     */
    renderPresentation: function(presentation) {
        const container = document.getElementById('slide-container');
        if (!container) {
            console.error('Slide container not found');
            return;
        }

        const title = presentation.title || '';
        const subtitle = presentation.subtitle || '';
        const contentSlides = Array.isArray(presentation.slides) ? presentation.slides : [];
        const totalSlides = contentSlides.length + 2; // cover + content + closing

        container.innerHTML = '';
        PresentationRenderer.deckTitle = title;
        PresentationRenderer.updatePreviewHeading(title, subtitle);
        container.appendChild(PresentationRenderer.renderCoverSlide(title, subtitle));

        contentSlides.forEach(function(slide, index) {
            const slideNumber = index + 2; // The cover is slide 1.
            container.appendChild(
                PresentationRenderer.renderContentSlide(slide, slideNumber, totalSlides)
            );
        });

        container.appendChild(PresentationRenderer.renderThankYouSlide(title, subtitle, totalSlides));
    },

    // Keeps preview-page heading updates separate from slide creation.
    updatePreviewHeading: function(title, subtitle) {
        document.getElementById('presentation-title').textContent = title;
        document.getElementById('presentation-subtitle').textContent = subtitle;
    },

    // Creates the shared <div class="slide ..."> shell used by every slide type.
    createSlideElement: function(type, slideIndex, markup) {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide ' + type;
        slideElement.setAttribute('data-slide-index', slideIndex);
        slideElement.innerHTML = markup;
        return slideElement;
    },

    /**
     * Renders the cover / intro slide
     * @param {string} title - Presentation title
     * @param {string} subtitle - Presentation subtitle
     * @returns {HTMLElement} - The rendered cover slide element
     */
    renderCoverSlide: function(title, subtitle) {
        const markup = `
            <div class="slide-cover-content">
                <h1 class="slide-cover-title">${PresentationRenderer.escapeHTML(title)}</h1>
                <p class="slide-cover-subtitle">${PresentationRenderer.escapeHTML(subtitle)}</p>
            </div>`;

        return PresentationRenderer.createSlideElement('slide-cover', 0, markup);
    },

    /**
     * Renders the thank-you / closing slide
     * @param {string} title - Presentation title
     * @param {string} subtitle - Presentation subtitle
     * @param {number} totalSlides - Total number of slides
     * @returns {HTMLElement} - The rendered thank-you slide element
     */
    renderThankYouSlide: function(title, subtitle, totalSlides) {
        const markup = `
            <div class="slide-thank-you-content">
                <h1 class="slide-thank-you-heading">Thank You</h1>
                <h2 class="slide-thank-you-title">${PresentationRenderer.escapeHTML(title)}</h2>
                <p class="slide-thank-you-subtitle">${PresentationRenderer.escapeHTML(subtitle)}</p>
            </div>`;

        return PresentationRenderer.createSlideElement('slide-thank-you', totalSlides - 1, markup);
    },

    /**
     * Renders a single content slide
     * @param {Object} slide - The slide data object
     * @param {number} slideNumber - The 1-based slide number (including cover)
     * @param {number} totalSlides - Total number of slides
     * @returns {HTMLElement} - The rendered slide element
     */
    renderContentSlide: function(slide, slideNumber, totalSlides) {
        const markup = PresentationRenderer.buildContentSlideMarkup(slide, slideNumber, totalSlides);
        return PresentationRenderer.createSlideElement('slide-content', slideNumber - 1, markup);
    },

    // Combines the three visible areas of a normal slide: header, body, and footer.
    buildContentSlideMarkup: function(slide, slideNumber, totalSlides) {
        const title = slide.title || '';
        const points = Array.isArray(slide.points) ? slide.points : [];
        const takeaway = slide.takeaway || 'Key takeaway';
        const iconPath = PresentationRenderer.selectIconForSlide({ title: title, points: points });

        return [
            PresentationRenderer.buildSlideHeader(title),
            PresentationRenderer.buildSlideBody(points, iconPath),
            PresentationRenderer.buildSlideFooter(takeaway, slideNumber, totalSlides)
        ].join('');
    },

    buildSlideHeader: function(title) {
        return `
            <div class="slide-top-bar">
                <div class="slide-title-group">
                    <h2 class="slide-title">${PresentationRenderer.escapeHTML(title)}</h2>
                    <div class="slide-title-line"></div>
                </div>
                <div class="slide-deck-title">${PresentationRenderer.escapeHTML(PresentationRenderer.deckTitle)}</div>
            </div>`;
    },

    buildSlideBody: function(points, iconPath) {
        return `
            <div class="slide-body">
                <ul class="slide-points">${PresentationRenderer.buildPointList(points)}</ul>
                ${PresentationRenderer.buildIconMarkup(iconPath)}
            </div>`;
    },

    buildPointList: function(points) {
        return points.map(function(point) {
            return '<li class="slide-point">' + PresentationRenderer.escapeHTML(point) + '</li>';
        }).join('');
    },

    buildIconMarkup: function(iconPath) {
        if (!iconPath) {
            return '';
        }

        return `
            <div class="slide-visual">
                <img class="slide-icon" src="icons/hugeicons/${iconPath}" alt="" aria-hidden="true">
            </div>`;
    },

    buildSlideFooter: function(takeaway, slideNumber, totalSlides) {
        return `
            <div class="slide-footer">
                <div class="slide-takeaway">${PresentationRenderer.escapeHTML(takeaway)}</div>
                <div class="slide-number">${PresentationRenderer.formatSlideNumber(slideNumber, totalSlides)}</div>
            </div>`;
    },

    /**
     * Tests a single word or phrase without allowing substring collisions.
     * For example, "ai" must not match the middle of "sustainability".
     * @param {string} text - Text to inspect
     * @param {string} term - Word or phrase to find
     * @returns {boolean} - Whether the complete term appears in the text
     */
    matchesIconTerm: function(text, term) {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        return new RegExp('\\b' + escapedTerm + '\\b', 'i').test(text);
    },

    /**
     * Selects an icon using deterministic, title-first scoring.
     * @param {Object} slide - The slide data object
     * @returns {string|null} - The icon file name, or null when no topic is clear
     */
    selectIconForSlide: function(slide) {
        const title = typeof slide.title === 'string' ? slide.title : '';
        const points = Array.isArray(slide.points) ? slide.points.join(' ') : '';
        let bestMatch = null;

        PresentationRenderer.iconRules.forEach(function(rule) {
            let score = 0;

            if (rule.titlePhrases.some(function(term) {
                return PresentationRenderer.matchesIconTerm(title, term);
            })) {
                score = 400;
            } else if (rule.titleTerms.some(function(term) {
                return PresentationRenderer.matchesIconTerm(title, term);
            })) {
                score = 300;
            } else if (rule.bulletPhrases.some(function(term) {
                return PresentationRenderer.matchesIconTerm(points, term);
            })) {
                score = 200;
            } else if (rule.titleTerms.some(function(term) {
                return PresentationRenderer.matchesIconTerm(points, term);
            })) {
                score = 100;
            }

            if (score > 0) {
                score += rule.priority || 0;

                if (!bestMatch || score > bestMatch.score) {
                    bestMatch = { icon: rule.icon, score: score };
                }
            }
        });

        return bestMatch ? bestMatch.icon : 'presentation-01.svg';
    },

    /**
     * Formats slide number as "03 / 08"
     * @param {number} current - Current slide number
     * @param {number} total - Total number of slides
     * @returns {string} - Formatted slide number
     */
    formatSlideNumber: function(current, total) {
        const currentString = current.toString().padStart(2, '0');
        const totalString = total.toString().padStart(2, '0');
        return currentString + ' / ' + totalString;
    },

    /**
     * Escapes HTML special characters to prevent XSS
     * @param {string} text - The text to escape
     * @returns {string} - The escaped text
     */
    escapeHTML: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Shows a specific slide by index
     * @param {number} index - The slide index to show
     */
    showSlide: function(index) {
        const slides = document.querySelectorAll('.slide');
        slides.forEach(function(slide, i) {
            if (i === index) {
                slide.classList.remove('hidden');
            } else {
                slide.classList.add('hidden');
            }
        });
    }
};

// Make the renderer available globally
window.PresentationRenderer = PresentationRenderer;
