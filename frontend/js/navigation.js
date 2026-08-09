/**
 * Slide Navigation Module
 *
 * Handles navigation between slides:
 * - Next/Previous buttons
 * - Keyboard controls (Arrow keys)
 * - Slide counter display
 */

// Navigation Controller
const Navigation = {

    // Current slide index (0-based)
    currentSlide: 0,

    // Total number of slides
    totalSlides: 0,

    /**
     * Initializes navigation with the total number of slides
     * @param {number} total - Total number of slides
     */
    init: function(total) {
        Navigation.totalSlides = total;
        Navigation.currentSlide = 0;
        Navigation.updateCounter();
        Navigation.updateButtons();
    },

    /**
     * Moves to the next slide
     */
    nextSlide: function() {
        if (Navigation.currentSlide < Navigation.totalSlides - 1) {
            Navigation.currentSlide++;
            Navigation.showCurrentSlide();
            Navigation.updateCounter();
            Navigation.updateButtons();
        }
    },

    /**
     * Moves to the previous slide
     */
    previousSlide: function() {
        if (Navigation.currentSlide > 0) {
            Navigation.currentSlide--;
            Navigation.showCurrentSlide();
            Navigation.updateCounter();
            Navigation.updateButtons();
        }
    },

    /**
     * Shows the current slide and hides others
     */
    showCurrentSlide: function() {
        PresentationRenderer.showSlide(Navigation.currentSlide);
    },

    /**
     * Updates the slide counter display (e.g., "2 / 6")
     */
    updateCounter: function() {
        const counter = document.getElementById('slide-counter');
        if (counter) {
            // Display is 1-based for user readability
            const displayNumber = Navigation.currentSlide + 1;
            counter.textContent = displayNumber + ' / ' + Navigation.totalSlides;
        }
    },

    /**
     * Enables/disables navigation buttons based on current position
     */
    updateButtons: function() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        // Disable previous button if on first slide
        if (prevBtn) {
            prevBtn.disabled = Navigation.currentSlide === 0;
        }

        // Disable next button if on last slide
        if (nextBtn) {
            nextBtn.disabled = Navigation.currentSlide === Navigation.totalSlides - 1;
        }
    },

    /**
     * Handles keyboard navigation
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyboard: function(event) {
        // Only handle navigation if preview is visible
        const previewSection = document.getElementById('preview-section');
        if (previewSection && previewSection.classList.contains('hidden')) {
            return;
        }

        switch(event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                Navigation.nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                Navigation.previousSlide();
                break;
        }
    },

    /**
     * Sets up event listeners for navigation
     */
    setupEventListeners: function() {
        // Button click handlers
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', Navigation.previousSlide);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', Navigation.nextSlide);
        }

        // Keyboard navigation
        document.addEventListener('keydown', Navigation.handleKeyboard);
    }
};

// Make navigation available globally
window.Navigation = Navigation;
