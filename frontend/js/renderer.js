/**
 * Slide Renderer Module
 *
 * Responsible for converting presentation data into HTML slides.
 * This module does NOT make any API calls - it only renders data.
 *
 * The renderer is completely deterministic:
 * - AI provides content (title, points)
 * - Renderer provides visual design (layout, spacing, colors)
 */

// Presentation Renderer
const PresentationRenderer = {

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

        // Set presentation title and subtitle
        document.getElementById('presentation-title').textContent = presentation.title;
        document.getElementById('presentation-subtitle').textContent = presentation.subtitle;

        // Render each slide
        presentation.slides.forEach(function(slide, index) {
            const slideElement = PresentationRenderer.renderSlide(slide, index);
            container.appendChild(slideElement);
        });
    },

    /**
     * Renders a single slide
     * @param {Object} slide - The slide data object
     * @param {number} index - The slide index (0-based)
     * @returns {HTMLElement} - The rendered slide element
     */
    renderSlide: function(slide, index) {
        // Create the slide element
        const slideElement = document.createElement('div');
        slideElement.className = 'slide';
        slideElement.setAttribute('data-slide-index', index);

        // Only show the first slide initially
        if (index !== 0) {
            slideElement.classList.add('hidden');
        }

        // Build the slide HTML
        let slideHTML = '';

        // Slide header with title
        slideHTML += '<div class="slide-header">';
        slideHTML += '  <h2 class="slide-title">' + PresentationRenderer.escapeHTML(slide.title) + '</h2>';
        slideHTML += '</div>';

        // Slide content with bullet points
        slideHTML += '<div class="slide-content">';
        slideHTML += '  <ul class="slide-points">';
        slide.points.forEach(function(point) {
            slideHTML += '    <li class="slide-point">' + PresentationRenderer.escapeHTML(point) + '</li>';
        });
        slideHTML += '  </ul>';
        slideHTML += '</div>';

        slideElement.innerHTML = slideHTML;
        return slideElement;
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
