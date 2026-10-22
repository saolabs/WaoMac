import React, { useState } from 'react';
import {
  Upload,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  Play,
  FileCode,
  HardDrive,
  Info,
} from 'lucide-react';
import { PeAnalysisResult, PresetApp } from '../types/exe';
import { PRESET_APPS } from '../data/presetApps';
import { parsePeBuffer } from '../utils/peParser';
import { createMacAppZip } from '../utils/scriptGenerator';

interface PeAnalyzerTabProps {
  lang: 'vi' | 'en';
  onRunInSandbox: (appName: string) => void;
  onOpenWhiskyInstaller?: () => void;
}

export const PeAnalyzerTab: React.FC<PeAnalyzerTabProps> = ({ lang, onRunInSandbox, onOpenWhiskyInstaller }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('notepad_plus_plus');
  const [analysisResult, setAnalysisResult] = useState<PeAnalysisResult>(() => {
    // Initial analysis for the first preset (Notepad++)
    const preset = PRESET_APPS[0];
    return {
      fileName: preset.downloadableExeName,
      fileSize: 5033164,
      isValidPe: true,
      architecture: preset.architecture,
      subsystem: preset.subsystem,
      is64Bit: preset.architecture === 'x64',
      isDotNet: false,
      entryPointRva: 0x000124a0,
      imageBase: '0x00400000',
      sectionCount: 5,
      sections: [
        { name: '.text', virtualSize: 2450000, rawSize: 2457600, characteristics: '0x60000020 (Code / Executable)' },
        { name: '.rdata', virtualSize: 850000, rawSize: 851968, characteristics: '0x40000040 (Read-Only Data)' },
        { name: '.data', virtualSize: 320000, rawSize: 327680, characteristics: '0xc0000040 (Read/Write Data)' },
        { name: '.pdata', virtualSize: 120000, rawSize: 122880, characteristics: '0x40000040 (Exception Tables)' },
        { name: '.rsrc', virtualSize: 250000, rawSize: 253952, characteristics: '0x40000040 (Icons & Dialogs)' },
      ],
      imports: preset.sampleImports.map((dll) => ({
        dllName: dll,
        functionsCount: 24,
        category: dll.includes('D3D') ? 'Graphics (DirectX/Metal)' : dll.includes('USER') ? 'UI' : 'System',
        description: dll.includes('D3D')
          ? 'Chuyển đổi trực tiếp sang Metal 3.'
          : dll.includes('USER')
          ? 'Giao diện Win32 controls ánh xạ thành cửa sổ macOS Retina native.'
          : 'Win32 System Calls dịch sang macOS Mach kernel.',
      })),
      graphicsApi: preset.graphicsApi,
      compatibilityScore: preset.compatibilityScore,
      compatibilityLevel: 'Hoàn Hảo (Gold)',
      recommendedEngine: preset.recommendedEngine,
      summaryNotes: [
        'Kiến trúc 64-bit x86_64: macOS dịch tự động qua Rosetta 2 và Wine translation layer.',
        'Giao diện Win32 ánh xạ trực tiếp thành cửa sổ macOS Retina native với thanh tiêu đề mượt mà.',
        'Hoàn toàn không cần chạy máy ảo Windows, tiết kiệm 95% RAM và pin so với Parallels/VMware.',
      ],
      suggestedWinVersion: 'win10',
      recommendedDllOverrides: ['dxgi=builtin,native'],
    };
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'sections' | 'imports'>('overview');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const result = parsePeBuffer(buffer, file.name);
        setAnalysisResult(result);
        setSelectedPresetId('custom');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectPreset = (preset: PresetApp) => {
    setSelectedPresetId(preset.id);
    setUploadedFile(null);

    setAnalysisResult({
      fileName: preset.downloadableExeName,
      fileSize: 4500000,
      isValidPe: true,
      architecture: preset.architecture,
      subsystem: preset.subsystem,
      is64Bit: preset.architecture === 'x64',
      isDotNet: false,
      entryPointRva: 0x00010000,
      imageBase: '0x00400000',
      sectionCount: 4,
      sections: [
        { name: '.text', virtualSize: 2100000, rawSize: 2101248, characteristics: '0x60000020 (Executable Code)' },
        { name: '.rdata', virtualSize: 620000, rawSize: 622592, characteristics: '0x40000040 (Read-Only Data)' },
        { name: '.data', virtualSize: 240000, rawSize: 245760, characteristics: '0xc0000040 (Read/Write Data)' },
        { name: '.rsrc', virtualSize: 180000, rawSize: 184320, characteristics: '0x40000040 (Resources)' },
      ],
      imports: preset.sampleImports.map((dll) => ({
        dllName: dll,
        functionsCount: 16,
        category: dll.includes('D3D') ? 'Graphics (DirectX/Metal)' : dll.includes('USER') ? 'UI' : 'System',
        description: dll.includes('D3D')
          ? 'Chuyển đổi đồ hoạ sang Apple Metal qua D3DMetal/DXVK.'
          : 'Hệ thống Win32 ánh xạ sang Darwin/Mach POSIX.',
      })),
      graphicsApi: preset.graphicsApi,
      compatibilityScore: preset.compatibilityScore,
      compatibilityLevel: preset.compatibilityScore >= 95 ? 'Hoàn Hảo (Gold)' : 'Rất Tốt (Silver)',
      recommendedEngine: preset.recommendedEngine,
      summaryNotes: [
        preset.notes,
        'Khởi chạy native không cần cài đặt máy ảo Windows cồng kềnh.',
        'Tương thích hoàn toàn với chip Apple Silicon M1, M2, M3, M4 và Intel x86_64.',
      ],
      suggestedWinVersion: 'win10',
      recommendedDllOverrides: preset.graphicsApi === 'DirectX 12' ? ['d3d12=native', 'dxgi=native'] : [],
    });
  };

  const handleDownloadAppZip = async () => {
    try {
      setIsGeneratingZip(true);
      const appName = analysisResult.fileName.replace(/\.exe$/i, '');
      const zipBlob = await createMacAppZip(
        {
          appName: appName || 'MyWindowsApp',
          bundleIdentifier: `com.macexe.${(appName || 'app').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          version: '1.0.0',
          executableName: analysisResult.fileName,
          enableMetalHud: analysisResult.graphicsApi === 'DirectX 12' || analysisResult.graphicsApi === 'DirectX 11',
          enableDxvkHud: false,
          enableMsync: true,
          retinaMode: true,
          windowsVersion: analysisResult.suggestedWinVersion,
          engine: analysisResult.recommendedEngine,
          dllOverrides: analysisResult.recommendedDllOverrides,
        },
        uploadedFile
      );

      // Trigger browser download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appName || 'Application'}_macOS_Bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi khi tạo zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const handleCopyRunCommand = () => {
    const cmd = `wine64 "${analysisResult.fileName}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner explaining Native Execution on Mac */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'vi'
                ? 'Công nghệ Translation Layer: Không cần Máy Ảo (No VM)'
                : 'Translation Layer: Zero Virtual Machine Overhead'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'vi'
              ? 'Chạy Tệp .EXE Trực Tiếp Như Ứng Dụng Mac Bản Xứ'
              : 'Run .EXE Executables Directly as Native Mac Apps'}
          </h2>
          <p className="mt-2 text-slate-300 text-sm leading-relaxed">
            {lang === 'vi'
              ? 'Thay vì phải cài máy ảo (Parallels, VMware) ngốn 8GB RAM và làm nóng máy, macOS có thể dịch trực tiếp các lệnh Win32 sang macOS Mach kernel và chuyển DirectX 11/12 sang Apple Metal với tốc độ gần như nguyên bản (Native Performance).'
              : 'Instead of running heavy VMs that drain battery and consume 8GB of RAM, macOS translates Win32 API calls directly to Mach/Darwin POSIX and DirectX to Apple Metal with near-native speed.'}
          </p>
        </div>
      </div>

      {/* Preset Pickers & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Drag & Drop Upload Zone */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2 mb-2">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>{lang === 'vi' ? 'Tải Lên Tệp .EXE Bất Kỳ' : 'Upload Any .EXE File'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {lang === 'vi'
                ? 'Kéo thả file .exe từ máy Mac của bạn để phân tích cấu trúc PE header, kiểm tra thư viện DLL và tạo gói .app tự động.'
                : 'Drag and drop any .exe file from your Mac to inspect PE headers, verify DLL dependencies, and generate an .app bundle.'}
            </p>

            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group">
              <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition duration-150">
                <FileCode className="w-6 h-6" />
              </div>
              <span className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {lang === 'vi' ? 'Nhấp hoặc thả file .exe vào đây' : 'Click or drop .exe file here'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                {lang === 'vi' ? 'Hỗ trợ PE32 (32-bit), PE32+ (64-bit), ARM64' : 'Supports PE32 (32-bit), PE32+ (64-bit), ARM64'}
              </span>
              <input type="file" accept=".exe" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center space-x-2 truncate">
                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium truncate">{uploadedFile.name}</span>
              </div>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-2 py-0.5 rounded font-mono">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          )}
        </div>

        {/* Right: Presets Gallery */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{lang === 'vi' ? 'Phần Mềm Windows Phổ Biến Chạy Native Trên Mac' : 'Popular Windows Apps Running Native on Mac'}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {lang === 'vi' ? 'Chọn để xem phân tích chi tiết' : 'Select to inspect specs'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PRESET_APPS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {preset.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          preset.compatibilityScore >= 95
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {preset.compatibilityScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{preset.architecture}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{preset.recommendedEngine}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Analysis Results & PE Visualizer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header bar of analysis */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-xs">
              <FileCode className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {analysisResult.fileName}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {analysisResult.architecture}
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                  {analysisResult.compatibilityLevel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Subsystem: <span className="font-medium text-slate-700 dark:text-slate-300">{analysisResult.subsystem}</span> • Image Base: <span className="font-mono">{analysisResult.imageBase}</span> • Entry RVA: <span className="font-mono">0x{analysisResult.entryPointRva.toString(16)}</span>
              </p>
            </div>
          </div>

          {/* Sub tabs switcher */}
          <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'overview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {lang === 'vi' ? 'Tổng Quan & Tương Thích' : 'Overview & Compatibility'}
            </button>
            <button
              onClick={() => setActiveSubTab('imports')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'imports'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {lang === 'vi' ? `Thư Viện DLL (${analysisResult.imports.length})` : `DLL Imports (${analysisResult.imports.length})`}
            </button>
            <button
              onClick={() => setActiveSubTab('sections')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeSubTab === 'sections'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {lang === 'vi' ? `PE Sections (${analysisResult.sections.length})` : `PE Sections (${analysisResult.sections.length})`}
            </button>
          </div>
        </div>

        {/* Content body based on active sub tab */}
        <div className="p-6">
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'vi' ? 'Điểm Tương Thích Native' : 'Native Compatibility'}
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {analysisResult.compatibilityScore}%
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      {lang === 'vi' ? 'Không cần VM' : 'No VM Needed'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${analysisResult.compatibilityScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'vi' ? 'Đồ Hoạ / Pipeline Dịch' : 'Graphics Translation'}
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {analysisResult.graphicsApi}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {analysisResult.graphicsApi === 'DirectX 12'
                      ? 'D3DMetal v2 (Metal 3 Pipeline)'
                      : analysisResult.graphicsApi === 'DirectX 11'
                      ? 'DXVK-macOS Metal Shaders'
                      : 'macOS CoreGraphics / Retina'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'vi' ? 'Bộ Dịch Native Khuyên Dùng' : 'Recommended Engine'}
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      {analysisResult.recommendedEngine}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {lang === 'vi' ? 'Hỗ trợ Apple Silicon & Intel' : 'Optimized for macOS'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {lang === 'vi' ? 'Mức Tiết Kiệm Tài Nguyên' : 'Resource Savings'}
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ~95% RAM
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {lang === 'vi' ? 'So với chạy Parallels Desktop' : 'Compared to Windows VM'}
                  </p>
                </div>
              </div>

              {/* Technical Notes / Reasons */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lang === 'vi' ? 'Đánh Giá Kỹ Thuật Khởi Chạy Native' : 'Native Execution Technical Assessment'}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {analysisResult.summaryNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Box: 1-Click Launch & Export */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'vi' ? 'Tạo Gói Khởi Chạy Cho Mac Của Bạn' : 'Generate macOS Launcher Package'}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'vi'
                        ? 'Tải xuống gói .app hoàn chỉnh (kèm Info.plist, launcher, và cấu hình Wine/Metal) để click chạy ngay trên macOS.'
                        : 'Download a complete .app package (with Info.plist, launcher, and Wine/Metal configs) ready to double-click on Mac.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onOpenWhiskyInstaller && (
                      <button
                        onClick={onOpenWhiskyInstaller}
                        className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer"
                      >
                        <span>🥃</span>
                        <span>{lang === 'vi' ? 'Cài Whisky (1-Click)' : 'Install Whisky'}</span>
                      </button>
                    )}

                    <button
                      onClick={handleDownloadAppZip}
                      disabled={isGeneratingZip}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {isGeneratingZip
                          ? lang === 'vi'
                            ? 'Đang tạo .app...'
                            : 'Generating .app...'
                          : lang === 'vi'
                          ? 'Tải Gói macOS (.app.zip)'
                          : 'Download macOS (.app.zip)'}
                      </span>
                    </button>

                    <button
                      onClick={handleCopyRunCommand}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs transition flex items-center space-x-2 border border-slate-700 cursor-pointer"
                    >
                      {copiedCommand ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCommand ? (lang === 'vi' ? 'Đã sao chép!' : 'Copied!') : (lang === 'vi' ? 'Lệnh Terminal' : 'Terminal Cmd')}</span>
                    </button>

                    <button
                      onClick={() => onRunInSandbox(analysisResult.fileName)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs transition flex items-center space-x-2 shadow-sm cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>{lang === 'vi' ? 'Chạy Thử Sandbox' : 'Run in Sandbox'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'imports' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi'
                  ? 'Danh sách các thư viện liên kết động (DLL) được tệp .exe nhập vào và cơ chế ánh xạ native của Wine sang macOS:'
                  : 'Dynamic Link Libraries (DLLs) imported by the .exe and their native mapping mechanism into macOS:'}
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Tên DLL (Import)</th>
                      <th className="py-2.5 px-4 font-semibold">Phân Loại</th>
                      <th className="py-2.5 px-4 font-semibold">Cơ Chế Ánh Xạ Native Trên Mac</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                    {analysisResult.imports.map((imp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          {imp.dllName}
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              imp.category === 'Graphics (DirectX/Metal)'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                : imp.category === 'UI'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : imp.category === 'System'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {imp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                          {imp.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'sections' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'vi'
                  ? 'Cấu trúc các Section của tệp Portable Executable (PE Header):'
                  : 'Portable Executable (PE) Section Header Structure:'}
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-sans">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Tên Section</th>
                      <th className="py-2.5 px-4 font-semibold">Virtual Size</th>
                      <th className="py-2.5 px-4 font-semibold">Raw Size</th>
                      <th className="py-2.5 px-4 font-semibold">Characteristics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {analysisResult.sections.map((sec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {sec.name}
                        </td>
                        <td className="py-2.5 px-4">
                          {(sec.virtualSize / 1024).toFixed(1)} KB ({sec.virtualSize} B)
                        </td>
                        <td className="py-2.5 px-4">
                          {(sec.rawSize / 1024).toFixed(1)} KB ({sec.rawSize} B)
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-sans text-[11px]">
                          {sec.characteristics}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
