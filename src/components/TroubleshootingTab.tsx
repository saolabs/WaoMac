import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface TroubleshootingTabProps {
  lang: 'vi' | 'en';
}

interface FaqItem {
  id: string;
  titleVi: string;
  titleEn: string;
  problemVi: string;
  problemEn: string;
  solutionVi: string;
  solutionEn: string;
  command?: string;
  tag: string;
}

export const TroubleshootingTab: React.FC<TroubleshootingTabProps> = ({ lang }) => {
  const [expandedId, setExpandedId] = useState<string>('gatekeeper');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const faqs: FaqItem[] = [
    {
      id: 'gatekeeper',
      titleVi: 'Lỗi Gatekeeper: "Ứng dụng bị hỏng và không thể mở" (App is damaged)',
      titleEn: 'Gatekeeper Error: "App is damaged and can\'t be opened"',
      problemVi:
        'Khi tải gói .app vừa tạo hoặc cài đặt Whisky về, macOS chặn không cho mở với thông báo "App is damaged and should be moved to the Trash".',
      problemEn:
        'macOS blocks unnotarized apps downloaded from the web with "App is damaged and should be moved to the Trash".',
      solutionVi:
        'Đây là cơ chế bảo vệ cách ly (Quarantine) của Apple đối với tệp tải từ Internet. Bạn chỉ cần xoá thuộc tính cách ly bằng lệnh Terminal dưới đây:',
      solutionEn:
        'This is Apple\'s quarantine attribute on downloaded files. Simply strip the quarantine flag via Terminal:',
      command: 'xattr -cr /Applications/TenUngDung.app',
      tag: 'Phổ biến nhất',
    },
    {
      id: 'retina_blur',
      titleVi: 'Chữ viết hoặc giao diện bị mờ, răng cưa trên màn hình Retina Mac',
      titleEn: 'Blurry or pixelated text on Mac Retina displays',
      problemVi:
        'Mặc định Windows cũ sử dụng độ phân giải 96 DPI, khi phóng to trên màn hình Retina sắc nét của MacBook thì các icon và chữ viết trông bị mờ.',
      problemEn:
        'Legacy Windows defaults to 96 DPI, causing icons and text to appear blurry on high-resolution MacBook Retina screens.',
      solutionVi:
        'Bạn có thể nâng mức DPI lên 144 DPI (150%) hoặc 192 DPI (200%) trong Registry của Wine. Chữ viết sẽ nét căng như ứng dụng native của Mac:',
      solutionEn:
        'Increase Wine DPI to 144 (150%) or 192 (200%) via Registry to achieve pin-sharp text:',
      command: 'wine reg add "HKCU\\Control Panel\\Desktop" /v LogPixels /t REG_DWORD /d 144 /f',
      tag: 'Hiển thị',
    },
    {
      id: 'vcruntime',
      titleVi: 'Lỗi thiếu VCRUNTIME140.dll hoặc MSVCP140.dll',
      titleEn: 'Missing VCRUNTIME140.dll or MSVCP140.dll',
      problemVi:
        'Phần mềm báo lỗi khi khởi chạy: "The code execution cannot proceed because VCRUNTIME140.dll was not found".',
      problemEn:
        'The application fails to start with "VCRUNTIME140.dll was not found".',
      solutionVi:
        'Ứng dụng được viết bằng C++ và yêu cầu thư viện Microsoft Visual C++ Redistributable. Bạn có thể cài đặt dễ dàng thông qua winetricks:',
      solutionEn:
        'Install Microsoft Visual C++ runtime components into your bottle via winetricks:',
      command: 'winetricks vcrun2015 vcrun2022',
      tag: 'Thư viện',
    },
    {
      id: 'dotnet',
      titleVi: 'Ứng dụng yêu cầu .NET Framework 4.8 hoặc mscoree.dll',
      titleEn: 'Application requires Microsoft .NET Framework 4.8',
      problemVi:
        'Các phần mềm viết bằng C# / .NET yêu cầu môi trường thực thi Common Language Runtime (CLR).',
      problemEn:
        'C# / .NET software requires the CLR runtime.',
      solutionVi:
        'Wine tự động hỗ trợ Wine Mono mã nguồn mở. Nếu phần mềm bắt buộc phải có .NET chính thức từ Microsoft, dùng lệnh sau:',
      solutionEn:
        'Wine includes Wine Mono by default. For strict Microsoft .NET binaries, install dotnet48:',
      command: 'winetricks dotnet48',
      tag: '.NET Runtime',
    },
    {
      id: 'anticheat',
      titleVi: 'Tại sao các game có Anti-cheat (Valorant, Vanguard, Riot) không chạy được?',
      titleEn: 'Why do games with Kernel Anti-cheat not run on Wine/macOS?',
      problemVi:
        'Các game như Valorant, League of Legends (bản Vanguard mới), Call of Duty Warzone báo lỗi chống gian lận.',
      problemEn:
        'Games with driver-level anti-cheat report security driver errors.',
      solutionVi:
        'Các game này cài một trình điều khiển cấp nhân (Kernel Driver - Ring 0) can thiệp trực tiếp vào nhân hệ điều hành Windows. Wine là một lớp dịch thuật tầng người dùng (User Mode - Ring 3), không có nhân Windows thật. Với các game này, bạn cần chơi trên máy tính Windows thật hoặc qua Cloud Gaming (GeForce NOW). Hầu hết 95% game và phần mềm không dùng kernel anti-cheat đều chạy rất mượt.',
      solutionEn:
        'Kernel anti-cheat drivers operate at Ring 0 within the Windows NT kernel. Wine operates purely in User Mode (Ring 3). For these specific titles, native translation cannot emulate kernel drivers.',
      tag: 'Giới hạn kỹ thuật',
    },
    {
      id: 'homebrew_install',
      titleVi: 'Cách cài đặt Homebrew và Whisky chuẩn nhất cho người mới bắt đầu',
      titleEn: 'Step-by-step setup guide for Homebrew and Whisky',
      problemVi:
        'Bạn mới mua máy Mac và chưa từng dùng dòng lệnh Terminal bao giờ.',
      problemEn:
        'Getting started with terminal commands on a brand new Mac.',
      solutionVi:
        'Bước 1: Mở ứng dụng "Terminal" trên Mac (nhấn Command + Space và gõ Terminal). Bước 2: Dán lệnh cài đặt Whisky bên dưới và nhấn Enter. Whisky sẽ tự động tải mọi thành phần cần thiết và hiện icon trong Launchpad.',
      solutionEn:
        'Open Terminal (Command + Space, type Terminal), paste the brew install command below and hit Enter. Whisky will be installed to your Applications folder.',
      command: 'brew install --cask whisky',
      tag: 'Bắt đầu',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          <span>{lang === 'vi' ? 'Cẩm Nang Xử Lý Lỗi & Câu Hỏi Thường Gặp' : 'Knowledge Base & Troubleshooting'}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          {lang === 'vi'
            ? 'Tổng hợp giải pháp cho mọi tình huống thường gặp khi chạy tệp .exe trên macOS mà không cần cài đặt máy ảo Windows.'
            : 'Comprehensive solutions and terminal commands for common scenarios when executing .exe binaries natively on macOS.'}
        </p>
      </div>

      {/* Accordion FAQ list */}
      <div className="space-y-3">
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? '' : faq.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                    {faq.tag}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang === 'vi' ? faq.titleVi : faq.titleEn}
                  </span>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {lang === 'vi' ? 'Hiện tượng:' : 'Issue:'}{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {lang === 'vi' ? faq.problemVi : faq.problemEn}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {lang === 'vi' ? 'Cách xử lý:' : 'Resolution:'}{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {lang === 'vi' ? faq.solutionVi : faq.solutionEn}
                    </span>
                  </div>

                  {faq.command && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs flex items-center justify-between border border-slate-800">
                      <div className="flex items-center space-x-2 truncate mr-2">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate text-indigo-300">$ {faq.command}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(faq.command!)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-sans font-medium flex items-center space-x-1 transition cursor-pointer flex-shrink-0"
                      >
                        {copiedCmd === faq.command ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedCmd === faq.command ? (lang === 'vi' ? 'Đã chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
