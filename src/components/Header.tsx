import React from 'react';
import { Apple, Cpu, ShieldCheck, Terminal, Layers, HelpCircle, MonitorPlay, Sliders } from 'lucide-react';

export type ActiveTab = 'analyzer' | 'engines' | 'configurator' | 'sandbox' | 'troubleshooting';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'vi' | 'en';
  setLang: (lang: 'vi' | 'en') => void;
  onOpenWhiskyInstaller: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, lang, setLang, onOpenWhiskyInstaller }) => {
  const tabs = [
    {
      id: 'analyzer' as ActiveTab,
      labelVi: 'Trình Phân Tích & Tạo .App',
      labelEn: 'PE Analyzer & .App Creator',
      icon: Layers,
    },
    {
      id: 'engines' as ActiveTab,
      labelVi: '4 Giải Pháp Native (Không VM)',
      labelEn: '4 Native Engines (No VM)',
      icon: Cpu,
    },
    {
      id: 'configurator' as ActiveTab,
      labelVi: 'Cấu Hình Bottle & Metal',
      labelEn: 'Bottle & Metal Config',
      icon: Sliders,
    },
    {
      id: 'sandbox' as ActiveTab,
      labelVi: 'Trình Chạy Thử / Sandbox',
      labelEn: 'Live Sandbox & Demo',
      icon: MonitorPlay,
    },
    {
      id: 'troubleshooting' as ActiveTab,
      labelVi: 'Sửa Lỗi & Hướng Dẫn',
      labelEn: 'Fix Errors & Guide',
      icon: HelpCircle,
    },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top macOS styled window bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & macOS branding */}
          <div className="flex items-center space-x-3">
            {/* macOS traffic light window dots */}
            <div className="flex items-center space-x-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition cursor-pointer inline-block" title="Close" />
              <span className="w-3 h-3 rounded-full bg-amber-400 hover:opacity-80 transition cursor-pointer inline-block" title="Minimize" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition cursor-pointer inline-block" title="Zoom" />
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white shadow-sm border border-slate-700">
                <Apple className="w-5 h-5 text-slate-100" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight whitespace-nowrap">
                    MacExe Native Studio
                  </h1>
                  <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    No VM • Zero Overhead
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  {lang === 'vi'
                    ? 'Chạy tệp Windows .exe trực tiếp trên macOS (Apple Silicon M-Series & Intel)'
                    : 'Run Windows .exe files natively on macOS (Apple Silicon M-Series & Intel)'}
                </p>
              </div>
            </div>
          </div>

          {/* Right controls: Language, Whisky Direct Install & Quick Specs Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Whisky 1-Click Install Button */}
            <button
              onClick={onOpenWhiskyInstaller}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
              title="Cài đặt nhanh Whisky trực tiếp vào máy Mac"
            >
              <span>🥃</span>
              <span className="hidden sm:inline">{lang === 'vi' ? 'Cài Whisky (1-Click)' : 'Install Whisky'}</span>
              <span className="sm:hidden">Whisky</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-medium">Wine + D3DMetal + Rosetta 2</span>
            </div>

            {/* Language toggle */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setLang('vi')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition ${
                  lang === 'vi'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                aria-label="Chọn Tiếng Việt"
              >
                🇻🇳 <span className="hidden sm:inline">Tiếng Việt</span><span className="sm:hidden">VI</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                aria-label="Select English"
              >
                🇺🇸 <span className="hidden sm:inline">English</span><span className="sm:hidden">EN</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400 dark:text-indigo-600' : 'text-slate-400'}`} />
                <span>{lang === 'vi' ? tab.labelVi : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
