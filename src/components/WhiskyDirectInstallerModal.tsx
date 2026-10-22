import React, { useState } from 'react';
import {
  X,
  Download,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  FileCode,
  ArrowRight,
  Apple,
  Zap,
} from 'lucide-react';
import { generateWhiskyAutoInstallerScript } from '../utils/scriptGenerator';

interface WhiskyDirectInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'vi' | 'en';
}

export const WhiskyDirectInstallerModal: React.FC<WhiskyDirectInstallerModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [downloadingScript, setDownloadingScript] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadInstallerScript = () => {
    setDownloadingScript(true);
    try {
      const scriptContent = generateWhiskyAutoInstallerScript();
      const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'install_whisky.command';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setDownloadingScript(false), 800);
    }
  };

  const handleCopyBrew = () => {
    navigator.clipboard.writeText('brew install --cask whisky');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xl font-bold">
              🥃
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center space-x-2">
                <span>{lang === 'vi' ? 'Cài Đặt Trực Tiếp Whisky Cho Mac' : 'Direct Whisky Installer for Mac'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  1-Click
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi'
                  ? 'Tải và cài đặt tự động vào /Applications/Whisky.app không cần mở máy ảo'
                  : 'Automated download & setup into Applications folder with zero VM overhead'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Note explaining sandbox security */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                {lang === 'vi'
                  ? 'Tại sao cần tải tệp kích hoạt?'
                  : 'How direct installation works?'}
              </span>
            </div>
            <p className="leading-relaxed">
              {lang === 'vi'
                ? 'Để bảo mật cho máy Mac, trình duyệt web không được phép tự ý sửa đổi thư mục hệ thống của bạn. Vì vậy, ứng dụng cung cấp cho bạn tệp cài đặt tự động 1-Click: Bạn chỉ cần click đúp vào tệp vừa tải về, nó sẽ tự động tải Whisky từ GitHub, đưa vào Ứng Dụng (/Applications) và mở lên ngay lập tức!'
                : 'For macOS security, web browsers cannot silently modify your system Applications directory. This toolkit generates a 1-click self-extracting runner script that downloads the official release and launches Whisky instantly!'}
            </p>
          </div>

          {/* Option 1: Double-click auto-installer (Recommended) */}
          <div className="p-5 rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-r from-indigo-50/40 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-slate-900 dark:to-indigo-950/10 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-600 text-white">
                    {lang === 'vi' ? 'Cách 1 (Khuyên Dùng)' : 'Method 1 (Recommended)'}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {lang === 'vi' ? 'Tệp Tự Cài Đặt Tự Động (1 Click)' : '1-Click Auto-Installer Script'}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                  {lang === 'vi'
                    ? 'Tải tệp "install_whisky.command" về máy Mac. Bạn chỉ cần click đúp vào file để cài đặt tự động 100% không cần gõ lệnh.'
                    : 'Download "install_whisky.command". Double-click on your Mac to automate the entire download, unzip, and launch process.'}
                </p>
              </div>

              <button
                onClick={handleDownloadInstallerScript}
                disabled={downloadingScript}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingScript
                    ? lang === 'vi'
                      ? 'Đang chuẩn bị...'
                      : 'Preparing...'
                    : lang === 'vi'
                    ? 'Tải install_whisky.command'
                    : 'Download Auto-Installer'}
                </span>
              </button>
            </div>
          </div>

          {/* Option 2: Direct Official Zip Download */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {lang === 'vi' ? 'Cách 2' : 'Method 2'}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Tải Trực Tiếp Bộ Cài Whisky.zip' : 'Direct Official Release (ZIP)'}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'vi'
                  ? 'Tải trực tiếp bản phát hành mới nhất từ tác giả Isaac Marovitz trên GitHub.'
                  : 'Direct download from the official GitHub release repository.'}
              </p>
            </div>

            <a
              href="https://github.com/Whisky-App/Whisky/releases/latest/download/Whisky.zip"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'vi' ? 'Tải Whisky.zip (GitHub)' : 'Download Whisky.zip'}</span>
            </a>
          </div>

          {/* Option 3: Homebrew command */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {lang === 'vi' ? 'Cách 3' : 'Method 3'}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Cài Bằng Dòng Lệnh Terminal (Homebrew)' : 'Install via Homebrew Terminal'}
                </h4>
              </div>
              <div className="mt-1 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                $ brew install --cask whisky
              </div>
            </div>

            <button
              onClick={handleCopyBrew}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer whitespace-nowrap"
            >
              {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCmd ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Sao chép lệnh' : 'Copy Command')}</span>
            </button>
          </div>

          {/* Quick 3-Step Guide after installation */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{lang === 'vi' ? '3 Bước Khởi Chạy File .EXE Trong Whisky:' : '3 Easy Steps to Run .EXE in Whisky:'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  1. {lang === 'vi' ? 'Tạo Bottle' : 'Create Bottle'}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'vi'
                    ? 'Mở Whisky, nhấn nút "+" hoặc "Create Bottle", chọn Windows 10.'
                    : 'Open Whisky, click "+" or "Create Bottle", select Windows 10.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  2. {lang === 'vi' ? 'Chọn File .EXE' : 'Select .EXE'}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'vi'
                    ? 'Nhấn nút "Run..." trong Whisky và chọn file .exe của bạn.'
                    : 'Click "Run..." inside Whisky and pick your Windows .exe file.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                  3. {lang === 'vi' ? 'Sử Dụng Native' : 'Enjoy Native'}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'vi'
                    ? 'Ứng dụng Windows sẽ xuất hiện ngay trên thanh Dock và mở mượt mà!'
                    : 'The app pops up natively on macOS Dock with hardware acceleration!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Mã nguồn mở an toàn 100% (GPL-3.0)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold transition cursor-pointer"
          >
            {lang === 'vi' ? 'Đã hiểu & Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
