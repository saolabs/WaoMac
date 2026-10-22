import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { NATIVE_ENGINES, NativeEngineInfo } from '../data/nativeEngines';

interface NativeEnginesTabProps {
  lang: 'vi' | 'en';
  onOpenWhiskyInstaller?: () => void;
}

export const NativeEnginesTab: React.FC<NativeEnginesTabProps> = ({ lang, onOpenWhiskyInstaller }) => {
  const [selectedArch, setSelectedArch] = useState<'silicon' | 'intel'>('silicon');
  const [selectedAppType, setSelectedAppType] = useState<'daily' | 'game' | 'legacy32' | 'bundle'>('daily');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Determine smart recommendation
  const getRecommendation = (): { engine: NativeEngineInfo; reasonVi: string; reasonEn: string } => {
    if (selectedAppType === 'game') {
      const gptk = NATIVE_ENGINES.find((e) => e.id === 'apple_gptk2') || NATIVE_ENGINES[0];
      return {
        engine: gptk,
        reasonVi:
          'Apple Game Porting Toolkit 2 (hoặc Whisky tích hợp D3DMetal) dịch shader DirectX 12 trực tiếp sang Metal 3, cho phép chơi game 60-120 FPS trên Apple Silicon mà không mất hiệu năng.',
        reasonEn:
          'Apple Game Porting Toolkit 2 translates DirectX 12 shaders directly into Apple Metal 3, achieving 60-120 FPS on Apple Silicon with near-zero latency.',
      };
    }
    if (selectedAppType === 'legacy32') {
      const crossover = NATIVE_ENGINES.find((e) => e.id === 'wine_crossover') || NATIVE_ENGINES[1];
      return {
        engine: crossover,
        reasonVi:
          'Wine-Crossover sử dụng cơ chế WoW64 đặc biệt, cho phép chạy các phần mềm 32-bit Windows trên macOS mới nhất vốn đã bỏ hoàn toàn thư viện 32-bit.',
        reasonEn:
          'Wine-Crossover utilizes special WoW64 translation, enabling 32-bit Windows executables on modern 64-bit macOS versions seamlessly.',
      };
    }
    if (selectedAppType === 'bundle') {
      const wineskin = NATIVE_ENGINES.find((e) => e.id === 'wineskin') || NATIVE_ENGINES[3];
      return {
        engine: wineskin,
        reasonVi:
          'Wineskin Winery cho phép đóng gói file .exe cùng với icon và runtime Wine thành một file .app độc lập, có thể copy gửi cho người khác chỉ cần double-click là mở.',
        reasonEn:
          'Wineskin Winery bundles the .exe along with an embedded Wine runtime and custom icon into a standalone macOS .app bundle.',
      };
    }
    const whisky = NATIVE_ENGINES.find((e) => e.id === 'whisky') || NATIVE_ENGINES[0];
    return {
      engine: whisky,
      reasonVi:
        'Whisky là lựa chọn số 1 hiện nay cho Mac Apple Silicon: Giao diện đồ hoạ SwiftUI thuần Mac đẹp mắt, quản lý bottle trực quan và tốc độ mở tức thì.',
      reasonEn:
        'Whisky is the premier solution for Apple Silicon Macs: Native SwiftUI interface, intuitive bottle management, and instantaneous startup times.',
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-8">
      {/* Interactive Engine Matcher Wizard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
          <Zap className="w-4 h-4" />
          <span>{lang === 'vi' ? 'Trợ Lý Chọn Bộ Dịch Chuẩn Xác' : 'Smart Engine Recommender'}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {lang === 'vi' ? 'Tìm Giải Pháp Phù Hợp Nhất Với Máy Mac Của Bạn' : 'Find The Best Fit For Your Mac'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {lang === 'vi'
            ? 'Chọn loại chip Mac và mục đích sử dụng để nhận câu lệnh cài đặt và cấu hình tối ưu nhất trong 1 cú nhấp chuột.'
            : 'Select your Mac processor and software type to obtain the ideal setup command in one click.'}
        </p>

        {/* Step 1 & Step 2 options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Chip selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              1. {lang === 'vi' ? 'Dòng chip Mac bạn đang dùng:' : 'Your Mac Processor:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedArch('silicon')}
                className={`p-3 rounded-xl text-left border transition text-xs font-medium flex items-center space-x-2 ${
                  selectedArch === 'silicon'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Cpu className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div>
                  <div className="font-bold">Apple Silicon</div>
                  <div className="text-[11px] text-slate-500">M1, M2, M3, M4, Pro/Max</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedArch('intel')}
                className={`p-3 rounded-xl text-left border transition text-xs font-medium flex items-center space-x-2 ${
                  selectedArch === 'intel'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Cpu className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Intel Core Mac</div>
                  <div className="text-[11px] text-slate-500">Core i5, i7, i9 x86_64</div>
                </div>
              </button>
            </div>
          </div>

          {/* App type selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              2. {lang === 'vi' ? 'Bạn cần chạy phần mềm nào?' : 'What do you plan to run?'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedAppType('daily')}
                className={`p-2.5 rounded-xl text-left border transition text-xs ${
                  selectedAppType === 'daily'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lang === 'vi' ? 'Tiện ích / Văn phòng / MT5' : 'Utility / Office / MT5'}
              </button>

              <button
                onClick={() => setSelectedAppType('game')}
                className={`p-2.5 rounded-xl text-left border transition text-xs ${
                  selectedAppType === 'game'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lang === 'vi' ? 'Game 3D / Đồ hoạ DX12' : '3D Game / DirectX 12'}
              </button>

              <button
                onClick={() => setSelectedAppType('legacy32')}
                className={`p-2.5 rounded-xl text-left border transition text-xs ${
                  selectedAppType === 'legacy32'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lang === 'vi' ? 'Phần mềm 32-bit cũ' : 'Legacy 32-bit App'}
              </button>

              <button
                onClick={() => setSelectedAppType('bundle')}
                className={`p-2.5 rounded-xl text-left border transition text-xs ${
                  selectedAppType === 'bundle'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lang === 'vi' ? 'Đóng gói file .app gửi bạn bè' : 'Create .app bundle'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic recommendation alert */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                {lang === 'vi' ? 'Đề xuất hàng đầu' : 'Top Recommendation'}
              </span>
              <span className="font-extrabold text-base text-white">{recommendation.engine.name}</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              {lang === 'vi' ? recommendation.reasonVi : recommendation.reasonEn}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {recommendation.engine.id === 'whisky' && onOpenWhiskyInstaller && (
              <button
                onClick={onOpenWhiskyInstaller}
                className="px-3.5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 cursor-pointer shadow"
              >
                <span>🥃</span>
                <span>{lang === 'vi' ? 'Cài Đặt Trực Tiếp (1-Click)' : 'Direct 1-Click Install'}</span>
              </button>
            )}

            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-indigo-300 flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>{recommendation.engine.installCommand}</span>
            </div>
            <button
              onClick={() => handleCopy(recommendation.engine.installCommand)}
              className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 cursor-pointer"
              title="Sao chép lệnh"
            >
              {copiedCmd === recommendation.engine.installCommand ? (
                <Check className="w-4 h-4 text-emerald-300" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparison: Native Translation vs Virtual Machine (Parallels/VMware) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>
                {lang === 'vi'
                  ? 'So Sánh: Chạy Native (Translation) vs. Cài Máy Ảo (Virtual Machine)'
                  : 'Native Translation vs Virtual Machine Comparison'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'vi'
                ? 'Lý do vì sao bạn KHÔNG NÊN dùng máy ảo nếu chỉ cần chạy phần mềm .exe thông thường'
                : 'Why native execution is drastically superior to running a full Windows VM'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold">{lang === 'vi' ? 'Tiêu Chí' : 'Feature'}</th>
                <th className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  🚀 {lang === 'vi' ? 'Native (Whisky / Wine / GPTK)' : 'Native (Wine / GPTK)'}
                </th>
                <th className="py-3 px-4 font-bold text-rose-500">
                  🐢 {lang === 'vi' ? 'Máy Ảo (Parallels / VMware)' : 'Virtual Machine (VM)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Tiêu tốn bộ nhớ RAM' : 'RAM Footprint'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  50 MB - 150 MB (Chỉ tốn ram cho bản thân app)
                </td>
                <td className="py-3 px-4 text-rose-500">
                  4,000 MB - 8,000 MB (Phải gánh cả HĐH Windows ảo)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Thời gian khởi động' : 'Startup Time'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  1 - 2 giây (Mở ngay lập tức)
                </td>
                <td className="py-3 px-4 text-rose-500">
                  30 - 60 giây (Chờ máy ảo boot Windows)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Hiệu năng đồ hoạ 3D / Game' : '3D Graphics Performance'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  Dịch trực tiếp sang Apple Metal 3 (Tận dụng 100% GPU)
                </td>
                <td className="py-3 px-4 text-rose-500">
                  Mô phỏng qua Hypervisor (Giật lag, mất 40% FPS)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Dung lượng ổ cứng chiếm dụng' : 'Disk Storage'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  ~200 MB (Chỉ thư mục prefix nhỏ gọn)
                </td>
                <td className="py-3 px-4 text-rose-500">
                  35 GB - 65 GB (File đĩa ảo .pvm/.vmdk khổng lồ)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Tiêu thụ pin & Nhiệt độ Mac' : 'Battery Life & Heat'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  Máy mát rượi, quạt không quay, pin trâu
                </td>
                <td className="py-3 px-4 text-rose-500">
                  Máy nóng ran, quạt hú, pin sụt nhanh gấp 3 lần
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                  {lang === 'vi' ? 'Chi phí bản quyền' : 'License Cost'}
                </td>
                <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  Miễn phí 100% (Mã nguồn mở)
                </td>
                <td className="py-3 px-4 text-rose-500">
                  ~$99/năm cho Parallels + Mua bản quyền Windows
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Native Engines In-depth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {NATIVE_ENGINES.map((engine) => (
          <div
            key={engine.id}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{engine.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{engine.tagline}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${engine.badgeColor}`}>
                  {engine.badge}
                </span>
              </div>

              {/* Install command bar */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 flex items-center justify-between border border-slate-800">
                <span className="truncate mr-2 text-indigo-300">$ {engine.installCommand}</span>
                <button
                  onClick={() => handleCopy(engine.installCommand)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex-shrink-0"
                  title="Sao chép"
                >
                  {copiedCmd === engine.installCommand ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {engine.id === 'whisky' && onOpenWhiskyInstaller && (
                <button
                  onClick={onOpenWhiskyInstaller}
                  className="mt-2.5 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <span>🥃</span>
                  <span>{lang === 'vi' ? 'Cài Đặt Trực Tiếp Vào Mac (1-Click)' : 'Direct 1-Click Installer'}</span>
                </button>
              )}

              {/* Features list */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === 'vi' ? 'Tính năng nổi bật:' : 'Key Highlights:'}
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {engine.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How it works note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'vi' ? 'Cơ chế hoạt động:' : 'How it works:'}{' '}
                </span>
                {engine.howItWorks}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                DirectX: <strong className="text-slate-700 dark:text-slate-300">{engine.directxTranslation}</strong>
              </span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                Apple Silicon: {engine.siliconSupport}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
