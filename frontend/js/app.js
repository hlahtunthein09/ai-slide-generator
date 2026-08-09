/**
 * Main Application Module
 *
 * Orchestrates the entire application:
 * - Handles user input
 * - Calls the backend API
 * - Manages UI state (loading, error, success)
 * - Connects renderer and navigation
 */

// Application Controller
const App = {

    // Backend API URL
    API_URL: 'http://localhost:3001/api/generate',

    // Store last prompt for retry
    lastPrompt: '',

    /**
     * Initializes the application
     * Sets up event listeners and initial state
     */
    init: function() {
        // Get DOM elements
        const generateBtn = document.getElementById('generate-btn');
        const promptInput = document.getElementById('prompt-input');
        const retryBtn = document.getElementById('retry-btn');
        const simplifyBtn = document.getElementById('simplify-btn');
        const downloadPdfBtn = document.getElementById('download-pdf-btn');

        // Set up generate button click handler
        if (generateBtn) {
            generateBtn.addEventListener('click', App.handleGenerate);
        }

        // Let users write multi-line requests; Ctrl/Cmd + Enter submits them.
        if (promptInput) {
            promptInput.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    App.handleGenerate();
                }
            });

            promptInput.addEventListener('input', App.resizePromptInput);
            App.resizePromptInput();
        }

        // Set up retry button
        if (retryBtn) {
            retryBtn.addEventListener('click', App.handleRetry);
        }

        // Set up simplify button (fallback generation)
        if (simplifyBtn) {
            simplifyBtn.addEventListener('click', App.handleSimplify);
        }

        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', App.downloadPdf);
        }

        // Set up navigation event listeners
        Navigation.setupEventListeners();

        console.log('AI Presentation Generator initialized');
    },

    /**
     * Handles the generate button click
     * Validates input and starts the generation process
     */
    handleGenerate: function() {
        // Get the prompt from input
        const promptInput = document.getElementById('prompt-input');
        const prompt = promptInput ? promptInput.value.trim() : '';

        // Validate input
        if (!prompt) {
            App.showError('Please enter a topic for your presentation');
            return;
        }

        // Start generation
        App.generatePresentation(prompt);
    },

    /**
     * Expands the prompt field for longer requests up to the CSS maximum.
     */
    resizePromptInput: function() {
        const promptInput = document.getElementById('prompt-input');
        if (!promptInput) return;

        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 280) + 'px';
    },

    /**
     * Generates a presentation by calling the backend API
     * @param {string} prompt - The user's presentation prompt
     */
    generatePresentation: async function(prompt) {
        // Store prompt for retry
        App.lastPrompt = prompt;

        // Show loading state
        App.showLoading();
        App.hideError();
        App.hidePreview();

        try {
            // Call the backend API
            const response = await fetch(App.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });

            // Parse the response
            const data = await response.json();

            // Check if generation was successful
            if (data.success) {
                App.handleSuccess(data.presentation, data.model);
            } else {
                App.showError(data.error.message || 'Failed to generate presentation');
            }
        } catch (error) {
            console.error('API Error:', error);
            App.showError('Unable to connect to the server. Please make sure the backend is running.');
        }
    },

    /**
     * Handles retry button click - retries with same prompt
     */
    handleRetry: function() {
        if (App.lastPrompt) {
            App.generatePresentation(App.lastPrompt);
        }
    },

    /**
     * Handles simplify button click - generates a basic fallback presentation
     */
    handleSimplify: function() {
        // Hide error, show loading
        App.hideError();
        App.showLoading();

        // Create a simple fallback presentation
        setTimeout(function() {
            App.hideLoading();

            const fallbackPresentation = App.createFallbackPresentation(App.lastPrompt);
            App.handleSuccess(fallbackPresentation);
        }, 500);
    },

    /**
     * Creates a basic fallback presentation when AI fails
     * @param {string} prompt - The original user prompt
     * @returns {Object} - A simple presentation structure
     */
    createFallbackPresentation: function(prompt) {
        // Extract topic from prompt (simple extraction)
        let topic = 'Presentation Topic';
        const aboutMatch = prompt.match(/about\s+["']?([^"']+?)["']?(?:\s+with|\s+covering|\s+for|$)/i);
        if (aboutMatch) {
            topic = aboutMatch[1].trim();
        }

        // Create simple presentation structure
        return {
            title: topic,
            subtitle: 'A basic overview (AI generation unavailable)',
            slides: [
                {
                    type: 'content',
                    title: 'Introduction to ' + topic,
                    points: [
                        'This presentation covers key aspects of ' + topic,
                        'Understanding the fundamentals is essential',
                        'Let us explore the main concepts together'
                    ]
                },
                {
                    type: 'content',
                    title: 'Key Concepts',
                    points: [
                        'Core principles and definitions',
                        'Important terminology to know',
                        'How these concepts relate to each other'
                    ]
                },
                {
                    type: 'content',
                    title: 'Applications',
                    points: [
                        'Real-world use cases',
                        'Industry applications',
                        'Practical implementation examples'
                    ]
                },
                {
                    type: 'content',
                    title: 'Summary',
                    points: [
                        'Key takeaways from this presentation',
                        'Important points to remember',
                        'Next steps for further learning'
                    ]
                }
            ]
        };
    },

    /**
     * Handles successful presentation generation
     * @param {Object} presentation - The generated presentation data
     * @param {string} model - The AI model that generated the presentation
     */
    handleSuccess: function(presentation, model) {
        // Hide loading
        App.hideLoading();

        // Show preview section
        App.showPreview();

        // Render the presentation
        PresentationRenderer.renderPresentation(presentation);

        // Initialize navigation with the number of slides
        Navigation.init(presentation.slides.length);

        // Display the model used
        App.displayModel(model);

        console.log('Presentation generated successfully:', presentation.title, 'Model:', model);
    },

    /**
     * Displays the AI model used to generate the presentation
     * @param {string} model - The model ID
     */
    displayModel: function(model) {
        const modelDisplay = document.getElementById('model-display');
        if (modelDisplay && model) {
            modelDisplay.textContent = 'Generated with ' + App.formatModelName(model);
            modelDisplay.classList.remove('hidden');
        }
    },

    /**
     * Formats a model ID into a readable name
     * @param {string} modelId - The model ID
     * @returns {string} - Readable model name
     */
    formatModelName: function(modelId) {
        if (!modelId) return 'AI';

        const names = {
            'nvidia/nemotron-3-ultra-550b-a55b:free': 'NVIDIA Nemotron 3 Ultra',
            'poolside/laguna-xs-2.1:free': 'Poolside Laguna XS',
            'poolside/laguna-s-2.1:free': 'Poolside Laguna S',
            'inclusionai/ling-3.0-tiny:free': 'InclusionAI Ling',
            'google/gemma-4-31b-it:free': 'Google Gemma 4',
            'openrouter/free': 'OpenRouter Free'
        };

        return names[modelId] || modelId;
    },

    /**
     * Opens the browser print dialog. The print stylesheet displays every
     * generated slide as a separate 16:9 page for "Save as PDF".
     */
    downloadPdf: function() {
        if (!document.querySelector('#slide-container .slide')) {
            App.showError('Generate a presentation before downloading a PDF.');
            return;
        }

        window.print();
    },

    /**
     * Shows the loading state
     */
    showLoading: function() {
        const loadingSection = document.getElementById('loading-section');
        const generateBtn = document.getElementById('generate-btn');

        if (loadingSection) {
            loadingSection.classList.remove('hidden');
        }
        if (generateBtn) {
            generateBtn.disabled = true;
        }
    },

    /**
     * Hides the loading state
     */
    hideLoading: function() {
        const loadingSection = document.getElementById('loading-section');
        const generateBtn = document.getElementById('generate-btn');

        if (loadingSection) {
            loadingSection.classList.add('hidden');
        }
        if (generateBtn) {
            generateBtn.disabled = false;
        }
    },

    /**
     * Shows an error message
     * @param {string} message - The error message to display
     */
    showError: function(message) {
        const errorSection = document.getElementById('error-section');
        const errorMessage = document.getElementById('error-message');

        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.classList.remove('hidden');
        }
    },

    /**
     * Hides the error message
     */
    hideError: function() {
        const errorSection = document.getElementById('error-section');
        if (errorSection) {
            errorSection.classList.add('hidden');
        }
    },

    /**
     * Shows the preview section
     */
    showPreview: function() {
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.classList.remove('hidden');
        }
    },

    /**
     * Hides the preview section
     */
    hidePreview: function() {
        const previewSection = document.getElementById('preview-section');
        if (previewSection) {
            previewSection.classList.add('hidden');
        }
    }
};

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', App.init);

/**
 * Test function - Can be called from browser console
 * Usage: App.testConnection()
 */
App.testConnection = async function() {
    console.log('Testing API connection...');
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        console.log('✅ Backend is running:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        return false;
    }
};

/**
 * Test function - Generate with sample data
 * Usage: App.testGenerate()
 */
App.testGenerate = async function() {
    console.log('Testing presentation generation...');
    App.showLoading();
    try {
        const response = await fetch(App.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: 'Create presentation slides about Machine Learning' })
        });
        const data = await response.json();
        App.hideLoading();
        if (data.success) {
            console.log('✅ Generation successful:', data.presentation);
            App.handleSuccess(data.presentation);
        } else {
            console.error('❌ Generation failed:', data.error);
            App.showError(data.error.message);
        }
    } catch (error) {
        App.hideLoading();
        console.error('❌ API error:', error.message);
        App.showError('Connection failed: ' + error.message);
    }
};
