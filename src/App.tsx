/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { PeAnalyzerTab } from './components/PeAnalyzerTab';
import { NativeEnginesTab } from './components/NativeEnginesTab';
import { BottleConfiguratorTab } from './components/BottleConfiguratorTab';
import { InteractiveSandboxTab } from './components/InteractiveSandboxTab';
import { TroubleshootingTab } from './components/TroubleshootingTab';
import { WhiskyDirectInstallerModal } from './components/WhiskyDirectInstallerModal';
import { Apple, Cpu, ShieldCheck, Heart, Terminal, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [sandboxSelectedApp, setSandboxSelectedApp] = useState<string>('notepad');
  const [isWhiskyModalOpen, setIsWhiskyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check URL parameters for autostart or tab navigation
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as ActiveTab | null;
    if (tabParam && ['analyzer', 'engines', 'configurator', 'sandbox', 'troubleshooting'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    if (params.get('whisky') === '1') {
      setIsWhiskyModalOpen(true);
    }
  }, []);

  const handleRunInSandbox = (appName: string) => {
    setSandboxSelectedApp(appName);
    setActiveTab('sandbox');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        onOpenWhiskyInstaller={() => setIsWhiskyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'analyzer' && (
          <PeAnalyzerTab
            lang={lang}
            onRunInSandbox={handleRunInSandbox}
            onOpenWhiskyInstaller={() => setIsWhiskyModalOpen(true)}
          />
        )}

        {activeTab === 'engines' && (
          <NativeEnginesTab
            lang={lang}
            onOpenWhiskyInstaller={() => setIsWhiskyModalOpen(true)}
          />
        )}

        {activeTab === 'configurator' && (
          <BottleConfiguratorTab lang={lang} />
        )}

        {activeTab === 'sandbox' && (
          <InteractiveSandboxTab
            lang={lang}
            defaultApp={sandboxSelectedApp}
          />
        )}

        {activeTab === 'troubleshooting' && (
          <TroubleshootingTab lang={lang} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Apple className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              MacExe Native Studio
            </span>
            <span>•</span>
            <span>
              {lang === 'vi'
                ? 'Giải pháp chạy file Windows .exe trên macOS không cần máy ảo'
                : 'Native Windows .exe execution on macOS without Virtual Machines'}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero VM Overhead • 100% Native Metal</span>
            </span>
            <span>Apple Silicon M1/M2/M3/M4 & Intel x86_64</span>
          </div>
        </div>
      </footer>
      {/* Whisky 1-Click Direct Installer Modal */}
      <WhiskyDirectInstallerModal
        isOpen={isWhiskyModalOpen}
        onClose={() => setIsWhiskyModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
