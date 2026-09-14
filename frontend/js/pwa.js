/**
 * PWA Management Module
 *
 * Handles:
 * - Service Worker registration & updates
 * - BeforeInstallPromptEvent capture for Desktop & Mobile (Chrome, Edge, Android)
 * - iOS Safari "Add to Home Screen" guidance modal
 * - Installation state tracking (standalone detection)
 * - Online / Offline status notification
 */

const PWA = {
    // Stored install prompt event
    deferredPrompt: null,

    // Platform detection
    isIos: () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    },

    isInStandaloneMode: () => {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')
        );
    },

    /**
     * Initializes PWA capabilities
     */
    init: function() {
        PWA.registerServiceWorker();
        PWA.setupInstallPrompt();
        PWA.setupNetworkMonitoring();
        PWA.checkStandaloneState();
    },

    /**
     * Registers the Service Worker
     */
    registerServiceWorker: function() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => {
                        console.log('[PWA] Service Worker registered with scope:', reg.scope);

                        // Check for updates
                        reg.addEventListener('updatefound', () => {
                            const newWorker = reg.installing;
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        PWA.showToast('New version available! Refresh to update.');
                                    }
                                });
                            }
                        });
                    })
                    .catch((error) => {
                        console.warn('[PWA] Service Worker registration failed:', error);
                    });
            });
        }
    },

    /**
     * Sets up browser install events and triggers
     */
    setupInstallPrompt: function() {
        const installBtn = document.getElementById('pwa-install-btn');
        const iosModal = document.getElementById('ios-install-modal');
        const closeIosBtn = document.getElementById('close-ios-modal-btn');

        // If already installed in standalone mode, hide install triggers
        if (PWA.isInStandaloneMode()) {
            if (installBtn) installBtn.classList.add('hidden');
            return;
        }

        // Standard beforeinstallprompt (Desktop Chrome, Edge, Opera, Android Chrome)
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent standard mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash event so it can be triggered later
            PWA.deferredPrompt = e;

            // Reveal the install button
            if (installBtn) {
                installBtn.classList.remove('hidden');
                installBtn.setAttribute('aria-hidden', 'false');
            }
            console.log('[PWA] App is ready for installation');
        });

        // If on iOS Safari, reveal install button to show the guide
        if (PWA.isIos() && !PWA.isInStandaloneMode()) {
            if (installBtn) {
                installBtn.classList.remove('hidden');
                installBtn.setAttribute('aria-hidden', 'false');
            }
        }

        // Install button click action
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                // If native prompt is available
                if (PWA.deferredPrompt) {
                    PWA.deferredPrompt.prompt();
                    const choiceResult = await PWA.deferredPrompt.userChoice;
                    if (choiceResult.outcome === 'accepted') {
                        console.log('[PWA] User accepted the install prompt');
                        PWA.showToast('Installing SlideCraft...');
                        installBtn.classList.add('hidden');
                    } else {
                        console.log('[PWA] User dismissed the install prompt');
                    }
                    PWA.deferredPrompt = null;
                } else if (PWA.isIos()) {
                    // Show iOS guide modal
                    PWA.openIosModal();
                } else {
                    // Fallback for browsers without beforeinstallprompt support
                    PWA.openGenericInstallModal();
                }
            });
        }

        // Close iOS modal listener
        if (closeIosBtn && iosModal) {
            closeIosBtn.addEventListener('click', PWA.closeIosModal);
            iosModal.addEventListener('click', (e) => {
                if (e.target === iosModal) PWA.closeIosModal();
            });
        }

        // When the app has successfully installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] SlideCraft installed successfully');
            if (installBtn) installBtn.classList.add('hidden');
            PWA.deferredPrompt = null;
            PWA.showToast('🎉 SlideCraft installed to your device!');
        });
    },

    openIosModal: function() {
        const modal = document.getElementById('ios-install-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
        }
    },

    closeIosModal: function() {
        const modal = document.getElementById('ios-install-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        }
    },

    openGenericInstallModal: function() {
        PWA.showToast('To install: click the Install icon in your browser address bar (top right).');
    },

    /**
     * Detects and highlights standalone mode
     */
    checkStandaloneState: function() {
        if (PWA.isInStandaloneMode()) {
            document.body.classList.add('app-standalone');
            console.log('[PWA] Running in standalone PWA window');
        }
    },

    /**
     * Monitors online/offline network changes
     */
    setupNetworkMonitoring: function() {
        const offlineBanner = document.getElementById('offline-banner');

        const updateNetworkStatus = () => {
            if (!navigator.onLine) {
                if (offlineBanner) offlineBanner.classList.remove('hidden');
                PWA.showToast('⚡ You are currently offline. Viewing mode active.');
            } else {
                if (offlineBanner) offlineBanner.classList.add('hidden');
            }
        };

        window.addEventListener('online', () => {
            if (offlineBanner) offlineBanner.classList.add('hidden');
            PWA.showToast('🟢 Back online!');
        });

        window.addEventListener('offline', updateNetworkStatus);

        // Initial check
        if (!navigator.onLine) {
            updateNetworkStatus();
        }
    },

    /**
     * Lightweight floating toast message
     */
    showToast: function(message, duration = 3800) {
        let toast = document.getElementById('pwa-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pwa-toast';
            toast.className = 'pwa-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('visible');

        clearTimeout(PWA._toastTimeout);
        PWA._toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, duration);
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', PWA.init);
