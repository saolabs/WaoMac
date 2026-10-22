export type ArchitectureType = 'x86' | 'x64' | 'ARM' | 'ARM64' | 'Unknown';
export type SubsystemType = 'Windows GUI' | 'Windows Console (CUI)' | 'Native' | 'POSIX' | 'Unknown';

export interface PeImportSummary {
  dllName: string;
  functionsCount: number;
  category: 'System' | 'Graphics (DirectX/Metal)' | 'UI' | 'Runtime/C++' | 'Network' | 'Audio' | 'Other';
  description: string;
}

export interface PeAnalysisResult {
  fileName: string;
  fileSize: number;
  isValidPe: boolean;
  architecture: ArchitectureType;
  subsystem: SubsystemType;
  is64Bit: boolean;
  isDotNet: boolean;
  entryPointRva: number;
  imageBase: string;
  sectionCount: number;
  sections: Array<{
    name: string;
    virtualSize: number;
    rawSize: number;
    characteristics: string;
  }>;
  imports: PeImportSummary[];
  graphicsApi: 'DirectX 12' | 'DirectX 11' | 'DirectX 9' | 'OpenGL' | 'Vulkan' | 'GDI/Software' | 'Unknown';
  compatibilityScore: number; // 0 - 100
  compatibilityLevel: 'Hoàn Hảo (Gold)' | 'Rất Tốt (Silver)' | 'Cần Cấu Hình (Bronze)' | 'Hạn Chế (Warning)';
  recommendedEngine: 'Whisky (GPTK)' | 'Wine-Crossover' | 'Apple Game Porting Toolkit 2' | 'Wineskin Winery' | 'Homebrew Wine';
  summaryNotes: string[];
  suggestedWinVersion: 'win10' | 'win11' | 'win7';
  recommendedDllOverrides: string[];
}

export interface PresetApp {
  id: string;
  name: string;
  category: 'Utility' | 'Game' | 'Media' | 'Dev' | 'Office';
  icon: string;
  description: string;
  fileSizeStr: string;
  architecture: ArchitectureType;
  subsystem: SubsystemType;
  graphicsApi: 'DirectX 12' | 'DirectX 11' | 'DirectX 9' | 'OpenGL' | 'GDI/Software';
  compatibilityScore: number;
  recommendedEngine: 'Whisky (GPTK)' | 'Wine-Crossover' | 'Apple Game Porting Toolkit 2' | 'Wineskin Winery' | 'Homebrew Wine';
  sampleImports: string[];
  notes: string;
  downloadableExeName: string;
}
