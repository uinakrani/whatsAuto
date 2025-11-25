'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import Button from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      // Check if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone === true;
      
      if (isStandalone || (isIOS && isInStandaloneMode)) {
        setIsInstalled(true);
        return;
      }

      // Check if already shown in this session
      const hasSeenPrompt = sessionStorage.getItem('pwa-install-prompt-shown');
      if (hasSeenPrompt) {
        return;
      }

      // Listen for beforeinstallprompt event (Android Chrome)
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Show prompt after a delay
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Listen for app installed event
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setShowPrompt(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        setShowPrompt(false);
        // Show iOS instructions
        alert('To install on iOS:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"');
        return;
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      sessionStorage.setItem('pwa-install-prompt-shown', 'true');
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-install-prompt-shown', 'true');
    // Show again after 7 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    localStorage.setItem('pwa-install-prompt-dismissed', expiry.toISOString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto border-2 border-primary-200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    Install WhatsAuto
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Install our app for a better experience. Get faster access, offline support, and a native app feel.
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleInstallClick}
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Install Now
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="px-4"
                >
                  Later
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

