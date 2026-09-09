import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  if (isInstallable) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#112240] border border-[#233554] rounded-xl p-4 shadow-xl flex flex-col gap-3 z-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white">Install App</h3>
            <p className="text-sm text-gray-400">Add Spotlight Reps to your home screen for offline access.</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={install}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#FFC107] px-4 py-2 text-sm font-bold text-[#0A192F] shadow-sm hover:bg-[#ffcd38] transition"
        >
          <Download className="w-4 h-4" />
          Install Now
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#112240] border border-[#233554] rounded-xl p-4 shadow-xl flex flex-col gap-3 z-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white">Install App</h3>
              <p className="text-sm text-gray-400">Add to home screen for offline access.</p>
            </div>
            <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-gray-600 transition"
          >
            <Download className="w-4 h-4" />
            Show Install Guide
          </button>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-[#0A192F]/80 p-4 pb-10">
            <div className="w-full max-w-sm rounded-2xl bg-[#112240] p-6 shadow-2xl border border-[#233554]">
              <h3 className="text-xl font-bold text-white mb-4">Install on iOS</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br /><br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-lg bg-gray-700 py-3 font-bold text-white hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
