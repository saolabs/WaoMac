export interface NativeEngineInfo {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  bestFor: string;
  siliconSupport: 'Native Tối Ưu' | 'Hỗ Trợ' | 'Intel Only';
  intelSupport: 'Hỗ Trợ' | 'Tối Ưu' | 'Hạn Chế';
  guiAvailable: boolean;
  installCommand: string;
  quickRunCommand: string;
  features: string[];
  howItWorks: string;
  directxTranslation: string;
  limitations: string[];
}

export const NATIVE_ENGINES: NativeEngineInfo[] = [
  {
    id: 'whisky',
    name: 'Whisky',
    tagline: 'Giao diện macOS đẹp chuẩn SwiftUI kết hợp Wine + Apple Game Porting Toolkit',
    badge: 'Khuyên Dùng Cho M1/M2/M3/M4',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    bestFor: 'Phần mềm thường ngày, game Steam, đồ hoạ DirectX 11/12 trên chip Apple Silicon',
    siliconSupport: 'Native Tối Ưu',
    intelSupport: 'Hỗ Trợ',
    guiAvailable: true,
    installCommand: 'brew install --cask whisky',
    quickRunCommand: 'open -a Whisky',
    features: [
      'Giao diện trực quan chuẩn macOS, quản lý các "Chai rượu" (Bottles) độc lập',
      'Tích hợp sẵn D3DMetal (Apple GPTK) dịch trực tiếp DirectX 11/12 sang Metal 3',
      'Bật tắt Metal Performance HUD (FPS, GPU Load, VRAM) bằng 1 cú click',
      'Hỗ trợ MSync / ESync (Đồng bộ đa luồng cực nhanh)',
      'Tự động tích hợp Wine Mono và Winetricks tải thư viện phụ trợ',
    ],
    howItWorks:
      'Whisky chạy trên nền tảng Wine tùy biến kết hợp với thư viện D3DMetal chính chủ của Apple. Khi chạy .exe x86_64, macOS dùng Rosetta 2 dịch mã máy sang ARM64, đồng thời Wine dịch API Win32 sang macOS Mach/Darwin, không có bất kỳ máy ảo Windows nào cần khởi động.',
    directxTranslation: 'D3DMetal (Metal 3) & DXVK-macOS',
    limitations: [
      'Không hỗ trợ các game có phần mềm chống gian lận cấp nhân (Kernel Anti-cheat như Riot Vanguard, Valorant)',
      'Cần macOS Ventura 13.0 trở lên',
    ],
  },
  {
    id: 'wine_crossover',
    name: 'Wine-Crossover (Gcenx)',
    tagline: 'Bộ dịch mã nguồn mở mạnh mẽ hỗ trợ cả ứng dụng 32-bit và 64-bit qua WoW64',
    badge: 'Đa Năng Nhất',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    bestFor: 'Ứng dụng văn phòng, đồ họa kỹ thuật, tiện ích 32-bit cũ không có bản 64-bit',
    siliconSupport: 'Native Tối Ưu',
    intelSupport: 'Tối Ưu',
    guiAvailable: false,
    installCommand: 'brew tap gcenx/wine && brew install --cask --no-quarantine wine-crossover',
    quickRunCommand: 'wine64 ten_ung_dung.exe',
    features: [
      'Công nghệ WoW64 tân tiến giúp chạy file EXE 32-bit trên macOS 64-bit hiện đại mà không cần Mac OS cũ',
      'Được đóng gói từ mã nguồn CrossOver của Codeweavers nổi tiếng',
      'Tốc độ khởi động siêu tốc (chỉ 1-2 giây để mở ứng dụng)',
      'Tiêu tốn cực ít RAM (chỉ khoảng 50MB - 150MB so với 4GB - 8GB của máy ảo)',
    ],
    howItWorks:
      'Wine-Crossover biên dịch lại phần lõi của Wine với cơ chế thunking WoW64, đóng gói toàn bộ lời gọi 32-bit thành cấu trúc 64-bit gửi cho macOS kernel xử lý.',
    directxTranslation: 'WineD3D (OpenGL/Metal) & DXVK',
    limitations: [
      'Chạy qua dòng lệnh Terminal hoặc script launcher tự động',
      'Cần một chút kiến thức Terminal khi cấu hình winetricks',
    ],
  },
  {
    id: 'apple_gptk2',
    name: 'Apple Game Porting Toolkit 2 (GPTK 2)',
    tagline: 'Công nghệ chính thức của Apple dành cho đồ họa DirectX 12 và tập lệnh AVX2',
    badge: 'Hiệu Năng Đồ Họa Đỉnh Cao',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    bestFor: 'Game bom tấn 3D AAA, mô phỏng đồ hoạ nặng, phần mềm kiến trúc CAD/3D',
    siliconSupport: 'Native Tối Ưu',
    intelSupport: 'Hạn Chế',
    guiAvailable: false,
    installCommand: 'brew install apple/apple/game-porting-toolkit',
    quickRunCommand: 'gameportingtoolkit ~/my-bottle ten_ung_dung.exe',
    features: [
      'Phiên bản 2 hỗ trợ đầy đủ tập lệnh mở rộng AVX2 trên macOS Sequoia 15+',
      'Dịch shader đồ hoạ HLSL sang Metal IR ở cấp độ GPU driver',
      'Hỗ trợ công nghệ dò tia phần cứng (Hardware Ray Tracing) trên chip M3/M4 Pro/Max',
      'Hiển thị HUD Metal trực tiếp theo dõi FPS thực tế và mức sử dụng GPU',
    ],
    howItWorks:
      'Đây là công cụ Apple ra mắt tại WWDC nhằm cho phép nhà phát triển và người dùng chạy trực tiếp game Windows x86_64 trên Apple Silicon bằng cách kết hợp Wine tinh chỉnh, Rosetta 2 và D3DMetal.dylib.',
    directxTranslation: 'D3DMetal v2.0 (DirectX 12 -> Metal 3)',
    limitations: [
      'Yêu cầu macOS Sonoma 14 hoặc macOS Sequoia 15 để đạt hiệu năng tối đa',
      'Chủ yếu tối ưu cho đồ hoạ DirectX 11/12, các ứng dụng văn phòng cơ bản nên dùng Whisky',
    ],
  },
  {
    id: 'wineskin',
    name: 'Wineskin Winery / Porting Kit',
    tagline: 'Đóng gói file .exe thành tệp ứng dụng macOS .app độc lập mang đi bất kỳ đâu',
    badge: 'Đóng Gói .APP Độc Lập',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bestFor: 'Tạo ứng dụng .app để chia sẻ cho bạn bè hoặc người thân chỉ cần double-click là chạy',
    siliconSupport: 'Hỗ Trợ',
    intelSupport: 'Tối Ưu',
    guiAvailable: true,
    installCommand: 'brew tap gcenx/wine && brew install --cask --no-quarantine wineskin',
    quickRunCommand: 'open -a "Wineskin Winery"',
    features: [
      'Tạo gói .app chứa sẵn engine Wine bên trong thư mục bundle',
      'Tùy chỉnh icon Mac .icns riêng cho từng ứng dụng',
      'Không cần máy đích phải cài đặt sẵn Wine qua Terminal',
      'Hỗ trợ tuỳ biến engine từ WS11WineCX đến các bản tuỳ chọn',
    ],
    howItWorks:
      'Wineskin tạo ra một khung vỏ ứng dụng Mac tiêu chuẩn (Wrapper), nhúng sẵn cây thư mục C:\\ và runtime Wine bên trong, khi bấm icon nó sẽ tự động kích hoạt tiến trình Wine ngầm.',
    directxTranslation: 'DXVK & D3DMetal tuỳ chọn',
    limitations: [
      'Kích thước file .app lớn hơn (do nhúng kèm engine bên trong gói)',
      'Cần tạo mới wrapper cho từng app riêng biệt',
    ],
  },
];
