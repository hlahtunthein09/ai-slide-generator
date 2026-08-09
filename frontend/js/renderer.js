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
     * Map of keywords to icon file names.
     * The first matching keyword wins.
     */
    iconKeywords: {
        'ai': 'ai.svg',
        'artificial intelligence': 'ai.svg',
        'machine learning': 'brain.svg',
        'neural': 'brain.svg',
        'brain': 'brain.svg',
        'intelligence': 'brain.svg',
        'programming': 'code.svg',
        'coding': 'code.svg',
        'software': 'code.svg',
        'development': 'code.svg',
        'developer': 'code.svg',
        'data': 'database.svg',
        'database': 'database.svg',
        'storage': 'database.svg',
        'network': 'network.svg',
        'internet': 'network.svg',
        'connection': 'network.svg',
        'communication': 'network.svg',
        'security': 'shield.svg',
        'secure': 'shield.svg',
        'protection': 'shield.svg',
        'privacy': 'lock.svg',
        'lock': 'lock.svg',
        'authentication': 'key.svg',
        'access': 'key.svg',
        'malware': 'virus.svg',
        'virus': 'virus.svg',
        'threat': 'alert-triangle.svg',
        'attack': 'alert-triangle.svg',
        'risk': 'alert-triangle.svg',
        'cloud': 'cloud.svg',
        'server': 'server.svg',
        'hardware': 'cpu.svg',
        'cpu': 'cpu.svg',
        'processor': 'cpu.svg',
        'system': 'settings.svg',
        'settings': 'settings.svg',
        'configuration': 'settings.svg',
        'computer': 'device-laptop.svg',
        'laptop': 'device-laptop.svg',
        'device': 'device-laptop.svg',
        'user': 'user.svg',
        'users': 'users.svg',
        'people': 'users.svg',
        'team': 'users.svg',
        'person': 'user.svg',
        'message': 'message.svg',
        'email': 'mail.svg',
        'mail': 'mail.svg',
        'phone': 'phone.svg',
        'contact': 'phone.svg',
        'global': 'globe.svg',
        'world': 'world.svg',
        'international': 'world.svg',
        'chart': 'chart-bar.svg',
        'statistics': 'chart-bar.svg',
        'growth': 'trending-up.svg',
        'trend': 'trending-up.svg',
        'improvement': 'trending-up.svg',
        'goal': 'target.svg',
        'objective': 'target.svg',
        'target': 'target.svg',
        'idea': 'bulb.svg',
        'innovation': 'bulb.svg',
        'solution': 'bulb.svg',
        'search': 'search.svg',
        'research': 'search.svg',
        'confirm': 'check.svg',
        'success': 'check.svg',
        'complete': 'check.svg'
    },

    /**
     * Renders a complete presentation into the slide container
     * @param {Object} presentation - The presentation data object
     * @param {string} presentation.title - Presentation title
     * @param {string} presentation.subtitle - Presentation subtitle
     * @param {Array} presentation.slides - Array of slide objects
     */
    renderPresentation: function(presentation) {
        // Get the slide container element
        const container = document.getElementById('slide-container');
        if (!container) {
            console.error('Slide container not found');
            return;
        }

        // Clear any existing slides
        container.innerHTML = '';

        // Remember the deck title for content-slide headers
        PresentationRenderer.deckTitle = presentation.title || '';

        // Set presentation title and subtitle in the preview area
        document.getElementById('presentation-title').textContent = presentation.title;
        document.getElementById('presentation-subtitle').textContent = presentation.subtitle;

        const totalContentSlides = presentation.slides.length;
        const totalSlides = totalContentSlides + 2; // cover + content slides + thank you

        // Render cover slide (slide 1)
        const coverSlide = PresentationRenderer.renderCoverSlide(presentation.title, presentation.subtitle);
        container.appendChild(coverSlide);

        // Render each content slide
        presentation.slides.forEach(function(slide, index) {
            const slideNumber = index + 2; // cover is 1
            const slideElement = PresentationRenderer.renderContentSlide(slide, slideNumber, totalSlides);
            container.appendChild(slideElement);
        });

        // Render thank-you slide (last slide)
        const thankYouSlide = PresentationRenderer.renderThankYouSlide(presentation.title, presentation.subtitle, totalSlides);
        container.appendChild(thankYouSlide);
    },

    /**
     * Renders the cover / intro slide
     * @param {string} title - Presentation title
     * @param {string} subtitle - Presentation subtitle
     * @returns {HTMLElement} - The rendered cover slide element
     */
    renderCoverSlide: function(title, subtitle) {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide slide-cover';
        slideElement.setAttribute('data-slide-index', 0);

        slideElement.innerHTML =
            '<div class="slide-cover-content">' +
            '  <h1 class="slide-cover-title">' + PresentationRenderer.escapeHTML(title) + '</h1>' +
            '  <p class="slide-cover-subtitle">' + PresentationRenderer.escapeHTML(subtitle) + '</p>' +
            '</div>';

        return slideElement;
    },

    /**
     * Renders the thank-you / closing slide
     * @param {string} title - Presentation title
     * @param {string} subtitle - Presentation subtitle
     * @param {number} totalSlides - Total number of slides
     * @returns {HTMLElement} - The rendered thank-you slide element
     */
    renderThankYouSlide: function(title, subtitle, totalSlides) {
        const slideElement = document.createElement('div');
        slideElement.className = 'slide slide-thank-you';
        slideElement.setAttribute('data-slide-index', totalSlides - 1);

        slideElement.innerHTML =
            '<div class="slide-thank-you-content">' +
            '  <h1 class="slide-thank-you-heading">Thank You</h1>' +
            '  <h2 class="slide-thank-you-title">' + PresentationRenderer.escapeHTML(title) + '</h2>' +
            '  <p class="slide-thank-you-subtitle">' + PresentationRenderer.escapeHTML(subtitle) + '</p>' +
            '</div>';

        return slideElement;
    },

    /**
     * Renders a single content slide
     * @param {Object} slide - The slide data object
     * @param {number} slideNumber - The 1-based slide number (including cover)
     * @param {number} totalSlides - Total number of slides
     * @returns {HTMLElement} - The rendered slide element
     */
    renderContentSlide: function(slide, slideNumber, totalSlides) {
        // Create the slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide slide-content';
        slideElement.setAttribute('data-slide-index', slideNumber - 1);

        // Pick an icon based on slide content
        const iconPath = PresentationRenderer.selectIconForSlide(slide);

        // Build points HTML
        let pointsHTML = '';
        slide.points.forEach(function(point) {
            pointsHTML += '<li class="slide-point">' + PresentationRenderer.escapeHTML(point) + '</li>';
        });

        // Build the slide HTML
        let slideHTML = '';

        // Top bar: title + deck header
        slideHTML += '<div class="slide-top-bar">';
        slideHTML += '  <div class="slide-title-group">';
        slideHTML += '    <h2 class="slide-title">' + PresentationRenderer.escapeHTML(slide.title) + '</h2>';
        slideHTML += '    <div class="slide-title-line"></div>';
        slideHTML += '  </div>';
        slideHTML += '  <div class="slide-deck-title">' + PresentationRenderer.escapeHTML(PresentationRenderer.deckTitle) + '</div>';
        slideHTML += '</div>';

        // Main body: points + optional icon
        slideHTML += '<div class="slide-body">';
        slideHTML += '  <ul class="slide-points">' + pointsHTML + '</ul>';

        if (iconPath) {
            slideHTML += '  <div class="slide-visual">';
            slideHTML += '    <img class="slide-icon" src="icons/outline/' + iconPath + '" alt="" aria-hidden="true">';
            slideHTML += '  </div>';
        }

        slideHTML += '</div>';

        // Footer: takeaway + slide number
        const takeawayText = slide.takeaway ? slide.takeaway : 'Key takeaway';
        slideHTML += '<div class="slide-footer">';
        slideHTML += '  <div class="slide-takeaway">' + PresentationRenderer.escapeHTML(takeawayText) + '</div>';
        slideHTML += '  <div class="slide-number">' + PresentationRenderer.formatSlideNumber(slideNumber, totalSlides) + '</div>';
        slideHTML += '</div>';

        slideElement.innerHTML = slideHTML;
        return slideElement;
    },

    /**
     * Selects an icon file name based on slide title and points
     * @param {Object} slide - The slide data object
     * @returns {string|null} - The icon file name, or null if no match
     */
    selectIconForSlide: function(slide) {
        const text = (slide.title + ' ' + slide.points.join(' ')).toLowerCase();

        for (const keyword in PresentationRenderer.iconKeywords) {
            if (text.indexOf(keyword) !== -1) {
                return PresentationRenderer.iconKeywords[keyword];
            }
        }

        return null;
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
