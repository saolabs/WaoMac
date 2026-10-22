import React, { useState } from 'react';
import {
  Sliders,
  Settings,
  Monitor,
  Gauge,
  Cpu,
  Copy,
  Check,
  Download,
  Terminal,
  Sparkles,
  Layers,
  FolderTree,
} from 'lucide-react';

interface BottleConfiguratorTabProps {
  lang: 'vi' | 'en';
}

export const BottleConfiguratorTab: React.FC<BottleConfiguratorTabProps> = ({ lang }) => {
  const [bottleName, setBottleName] = useState('DefaultBottle');
  const [winVersion, setWinVersion] = useState<'win10' | 'win11' | 'win7'>('win10');
  const [dpiScaling, setDpiScaling] = useState<number>(144); // 96 = 100%, 144 = 150%, 192 = 200%
  const [enableMsync, setEnableMsync] = useState<boolean>(true);
  const [enableMetalHud, setEnableMetalHud] = useState<boolean>(true);
  const [enableDxvkAsync, setEnableDxvkAsync] = useState<boolean>(true);
  const [fpsLimit, setFpsLimit] = useState<string>('120');
  const [dllOverrides, setDllOverrides] = useState<string>('d3d11=native;dxgi=native;d3d12=native');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Windows registry file (.reg)
  const generateRegFile = (): string => {
    return `Windows Registry Editor Version 5.00

; =========================================================
; MacExe Native Studio - Bottle Configuration
; High-DPI Retina & Graphics Overrides for macOS
; =========================================================

[HKEY_CURRENT_USER\\Control Panel\\Desktop]
"LogPixels"=dword:000000${dpiScaling.toString(16).padStart(2, '0')}
"FontSmoothing"="2"
"FontSmoothingType"=dword:00000002
"FontSmoothingGamma"=dword:00000000
"FontSmoothingOrientation"=dword:00000001

[HKEY_CURRENT_USER\\Software\\Wine\\Mac Driver]
"RetinaMode"="y"

[HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides]
${dllOverrides
  .split(';')
  .map((item) => {
    const [dll, mode] = item.split('=');
    return dll ? `"${dll.trim()}"="${(mode || 'native').trim()}"` : '';
  })
  .filter(Boolean)
  .join('\n')}
`;
  };

  // Generate Terminal environment script
  const generateEnvScript = (): string => {
    return `# =========================================================
# Lệnh cấu hình môi trường khởi chạy Native tối ưu trên macOS:
# =========================================================
export WINEPREFIX="$HOME/Library/Application Support/MacExeWrappers/${bottleName}/bottle"
export WINEARCH="win64"
export WINEDEBUG="-all"

# Tối ưu hoá nhân CPU Apple Silicon M-series
${enableMsync ? 'export WINEMSYNC=1\nexport WINEESYNC=1' : '# MSync tắt'}

# Hiển thị Metal HUD (FPS, GPU Load, VRAM)
${enableMetalHud ? 'export MTL_HUD_ENABLED=1' : '# Metal HUD tắt'}

# Tăng tốc DirectX shader
${enableDxvkAsync ? 'export DXVK_ASYNC=1' : ''}
${fpsLimit !== 'unlimited' ? `export DXVK_FRAME_RATE=${fpsLimit}` : ''}

# DLL Overrides
export WINEDLLOVERRIDES="${dllOverrides}"

# Khởi chạy ứng dụng
wine64 "duong_dan_den_file.exe"
`;
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generateEnvScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReg = () => {
    const regContent = generateRegFile();
    const blob = new Blob([regContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bottleName}_retina_tweaks.reg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <span>{lang === 'vi' ? 'Bộ Cấu Hình Bottle & Tinh Chỉnh Metal' : 'Bottle & Metal Optimization Configurator'}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          {lang === 'vi'
            ? 'Trên macOS, mỗi ứng dụng Windows có thể có một "Bottle" (Prefix) độc lập chứa ổ đĩa C:\\ ảo và Registry. Tinh chỉnh các tham số dưới đây để ứng dụng có font chữ sắc nét Retina, đồng bộ đa luồng cực nhanh và FPS mượt mà.'
            : 'On macOS, Windows apps run within isolated Bottles (Wineprefixes) with dedicated virtual C:\\ drives and registries. Tune these parameters for razor-sharp Retina typography, multi-threaded Mach synchronization, and optimal frame rates.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Bottle Basic Specs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{lang === 'vi' ? '1. Định Danh & Phiên Bản HĐH' : '1. Bottle & Windows Version'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'vi' ? 'Tên Bottle (Prefix):' : 'Bottle Name:'}
                </label>
                <input
                  type="text"
                  value={bottleName}
                  onChange={(e) => setBottleName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="MyBottle"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'vi' ? 'Giả lập phiên bản Windows:' : 'Windows Version Target:'}
                </label>
                <select
                  value={winVersion}
                  onChange={(e) => setWinVersion(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="win10">Windows 10 (Khuyên dùng - Ổn định nhất)</option>
                  <option value="win11">Windows 11 (Ứng dụng hiện đại 2024-2026)</option>
                  <option value="win7">Windows 7 (Phần mềm cũ / Legacy Win32)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Display & Retina Font Scaling */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-slate-500" />
                <span>{lang === 'vi' ? '2. Màn Hình & Độ Phân Giải Retina' : '2. Display & Retina Scaling'}</span>
              </h4>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {dpiScaling} DPI ({Math.round((dpiScaling / 96) * 100)}%)
              </span>
            </div>

            <div>
              <input
                type="range"
                min="96"
                max="240"
                step="24"
                value={dpiScaling}
                onChange={(e) => setDpiScaling(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>96 DPI (100% Tiêu chuẩn)</span>
                <span>144 DPI (150% Retina nét)</span>
                <span>192 DPI (200% MacBook 4K)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              💡 <strong>Mẹo Mac Retina:</strong> Đặt DPI lên 144 hoặc 192 sẽ giúp giao diện Windows, chữ viết trong Notepad++, 7-Zip hiển thị sắc nét như văn bản macOS gốc, không bị răng cưa hay vỡ hạt.
            </p>
          </div>

          {/* Section 3: Performance & Metal Toggles */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-slate-500" />
              <span>{lang === 'vi' ? '3. Tăng Tốc Apple Silicon & Metal' : '3. Silicon & Metal Acceleration'}</span>
            </h4>

            <div className="space-y-3">
              {/* MSync switch */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>MSync / ESync (Mach Synchronization)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      M1-M4 Tối Ưu
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sử dụng semaphores nhân Mach của macOS thay vì pipe cổ điển, tăng tốc đa luồng CPU gấp 2 lần.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableMsync}
                  onChange={(e) => setEnableMsync(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </label>

              {/* Metal HUD switch */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>Apple Metal Performance HUD</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      MTL_HUD
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hiển thị thông số FPS, GPU Frame Time và bộ nhớ đồ hoạ Metal trực tiếp ở góc màn hình.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableMetalHud}
                  onChange={(e) => setEnableMetalHud(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </label>

              {/* DXVK Async switch */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    DXVK Async Pipeline
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Biên dịch shader nền bất đồng bộ, triệt tiêu hiện tượng khựng khung hình (shader stutter).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableDxvkAsync}
                  onChange={(e) => setEnableDxvkAsync(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Section 4: DLL Overrides */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>{lang === 'vi' ? '4. Nạp Đè Thư Viện (DLL Overrides)' : '4. Dynamic Link Library Overrides'}</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WINEDLLOVERRIDES:
              </label>
              <input
                type="text"
                value={dllOverrides}
                onChange={(e) => setDllOverrides(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="d3d11=native;dxgi=native"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                native: ưu tiên thư viện gốc của game | builtin: dùng thư viện dịch mã nguồn mở của Wine
              </p>
            </div>
          </div>
        </div>

        {/* Output Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Script Output Box */}
          <div className="bg-slate-950 rounded-2xl p-5 text-white border border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'vi' ? 'Script Terminal Khởi Chạy' : 'Generated Run Script'}</span>
                </span>

                <button
                  onClick={handleCopyScript}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (lang === 'vi' ? 'Đã chép' : 'Copied') : (lang === 'vi' ? 'Sao chép' : 'Copy')}</span>
                </button>
              </div>

              <pre className="font-mono text-[11px] text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 overflow-x-auto max-h-72 scrollbar-none leading-relaxed">
                {generateEnvScript()}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {lang === 'vi' ? 'Định dạng .command / bash' : 'POSIX Shell Script'}
              </span>
              <button
                onClick={handleDownloadReg}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? 'Tải File Cấu Hình .REG' : 'Download .REG File'}</span>
              </button>
            </div>
          </div>

          {/* Drive & Folder Mapping Visualizer */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-3">
              <FolderTree className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'vi' ? 'Bản Đồ Ánh Xạ Ổ Đĩa (Drive Mapping)' : 'Drive Letter Mapping'}</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">C:\</span>
                  <span className="text-slate-500 ml-2">(Windows Virtual Disk)</span>
                </div>
                <span className="text-slate-400 text-[11px]">~/Library/.../bottle/drive_c</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Z:\</span>
                  <span className="text-slate-500 ml-2">(Toàn bộ ổ đĩa Mac)</span>
                </div>
                <span className="text-slate-400 text-[11px]">/ (macOS Root System)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Y:\</span>
                  <span className="text-slate-500 ml-2">(Thư mục người dùng)</span>
                </div>
                <span className="text-slate-400 text-[11px]">/Users/tên_bạn</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-normal">
              {lang === 'vi'
                ? 'Khi mở hộp thoại "Open File" trong ứng dụng Windows, bạn có thể dễ dàng truy cập Desktop, Downloads hoặc ổ đĩa của Mac thông qua ổ Z:\\ hoặc Y:\\.'
                : 'In any Windows file dialogue, you can access your Mac Desktop, Documents, and Downloads through Z:\\ or Y:\\ drives seamlessly.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
