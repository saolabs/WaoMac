import JSZip from 'jszip';
import { PeAnalysisResult } from '../types/exe';

export interface AppBundleOptions {
  appName: string;
  bundleIdentifier: string;
  version: string;
  executableName: string;
  enableMetalHud: boolean;
  enableDxvkHud: boolean;
  enableMsync: boolean;
  retinaMode: boolean;
  windowsVersion: 'win10' | 'win11' | 'win7';
  engine: string;
  dllOverrides: string[];
}

export function generateInfoPlist(options: AppBundleOptions): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>app.icns</string>
    <key>CFBundleIdentifier</key>
    <string>${options.bundleIdentifier || 'com.macexe.' + options.appName.toLowerCase().replace(/[^a-z0-9]/g, '')}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${options.appName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${options.version || '1.0.0'}</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHighResolutionCapable</key>
    <${options.retinaMode ? 'true' : 'false'}/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>`;
}

export function generateLauncherScript(options: AppBundleOptions): string {
  const overrides = options.dllOverrides.length > 0 ? options.dllOverrides.join(';') : 'dxgi=builtin,native';

  return `#!/bin/bash
# ==============================================================================
# MacExe Native Launcher for: ${options.appName}
# Chạy trực tiếp qua Translation Layer (Wine / GPTK / D3DMetal / Rosetta 2)
# Không cần máy ảo (No Virtual Machine overhead)
# ==============================================================================

DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
APP_RESOURCES="$DIR/Resources"
APP_NAME="${options.appName}"
EXE_NAME="${options.executableName}"

# Prefix lưu trữ registry, C: drive của ứng dụng trong macOS Application Support
BOTTLE_DIR="$HOME/Library/Application Support/MacExeWrappers/$APP_NAME/bottle"
mkdir -p "$BOTTLE_DIR"

# 1. Tìm kiếm Wine/Whisky/GPTK native engine trên macOS
WINE_BIN=""
WINE64_CANDIDATES=(
  # Whisky Engine (Khuyên dùng cho Apple Silicon)
  "$HOME/Library/Application Support/com.isaacmarovitz.Whisky/Libraries/Wine/bin/wine64"
  "/Applications/Whisky.app/Contents/Resources/Libraries/Wine/bin/wine64"
  # Apple Game Porting Toolkit 2
  "/opt/game-porting-toolkit/bin/wine64"
  "/usr/local/opt/game-porting-toolkit/bin/wine64"
  # Wine-Crossover (Homebrew Gcenx - Tuyệt vời cho cả 32-bit & 64-bit)
  "/opt/homebrew/opt/wine-crossover/bin/wine64"
  "/usr/local/opt/wine-crossover/bin/wine64"
  # Homebrew Wine-Stable
  "/opt/homebrew/bin/wine64"
  "/usr/local/bin/wine64"
  # System PATH
  "$(command -v wine64 2>/dev/null)"
  "$(command -v wine 2>/dev/null)"
)

for candidate in "\${WINE64_CANDIDATES[@]}"; do
  if [ -x "$candidate" ]; then
    WINE_BIN="$candidate"
    break
  fi
done

if [ -z "$WINE_BIN" ]; then
  osascript -e 'display dialog "Chưa tìm thấy Wine hoặc Whisky engine trên Mac của bạn!\\n\\nVui lòng mở Terminal và cài đặt nhanh:\\nbrew install --cask whisky\\n\\nhoặc xem hướng dẫn trong MacExe Native Studio." with title "MacExe Launcher" buttons {"Đóng"} default button "Đóng" with icon stop'
  exit 1
fi

# 2. Cấu hình biến môi trường tăng tốc Native Metal & Rosetta
export WINEPREFIX="$BOTTLE_DIR"
export WINEDEBUG="-all"
export WINEARCH="win64"

# Tối ưu đa luồng cho Apple Silicon M1/M2/M3/M4
${options.enableMsync ? 'export WINEMSYNC=1\nexport WINEESYNC=1' : '# MSYNC Disabled'}

# HUD giám sát Metal / DXVK FPS
${options.enableMetalHud ? 'export MTL_HUD_ENABLED=1' : '# Metal HUD disabled'}
${options.enableDxvkHud ? 'export DXVK_HUD=fps,memory' : '# DXVK HUD disabled'}

# DLL Overrides
export WINEDLLOVERRIDES="${overrides}"

# Tự động khởi tạo bottle nếu lần đầu chạy
if [ ! -d "$BOTTLE_DIR/drive_c" ]; then
  "$WINE_BIN" wineboot --init >/dev/null 2>&1
fi

TARGET_EXE="$APP_RESOURCES/$EXE_NAME"
if [ ! -f "$TARGET_EXE" ]; then
  # Nếu chưa có tệp trong Resources, mở hộp thoại chọn tệp
  TARGET_EXE="$(osascript -e 'POSIX path of (choose file with prompt "Chọn tệp .exe để khởi chạy:" of type {"exe"})' 2>/dev/null)"
fi

if [ -f "$TARGET_EXE" ]; then
  cd "$(dirname "$TARGET_EXE")"
  exec "$WINE_BIN" "$TARGET_EXE" "$@"
else
  exit 0
fi
`;
}

export function generateSetupCommandScript(appName: string, exeName: string): string {
  const sanitizedName = appName.replace(/\s+/g, '_');
  return `#!/bin/bash
# ==============================================================================
# MacExe Quick Setup & Run Script
# Tự động cấu hình môi trường native chạy file .exe trên macOS
# ==============================================================================

clear
echo "=========================================================="
echo "    🚀 MacExe Native Runner - Cài Đặt Cho macOS          "
echo "    Chạy .exe trực tiếp không cần máy ảo                 "
echo "=========================================================="
echo ""

ARCH="$(uname -m)"
echo "Kiểm tra kiến trúc CPU Mac: $ARCH"
if [ "$ARCH" = "arm64" ]; then
  echo "=> Apple Silicon (M1/M2/M3/M4) được hỗ trợ tăng tốc tối đa qua Metal & Rosetta 2"
else
  echo "=> Intel x86_64 Mac"
fi
echo ""

# 1. Kiểm tra Homebrew
if ! command -v brew >/dev/null 2>&1; then
  echo "[1/3] Homebrew chưa được cài đặt. Đang hướng dẫn cài Homebrew..."
  echo "Chạy lệnh sau nếu chưa có:"
  echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
  echo ""
  read -p "Nhấn Enter để tiếp tục sau khi đã có Homebrew (hoặc Ctrl+C để huỷ)..."
else
  echo "[1/3] Đã phát hiện Homebrew ✓"
fi

# 2. Cài đặt Whisky hoặc Wine-Crossover
echo ""
echo "[2/3] Cài đặt Native Translation Engine:"
echo "1) Whisky (Khuyến nghị cho Apple Silicon M-series, giao diện trực quan, hỗ trợ Game Porting Toolkit)"
echo "2) Wine-Crossover (Hỗ trợ tốt cả phần mềm 32-bit lẫn 64-bit)"
echo "3) Bỏ qua nếu đã cài"
read -p "Chọn tuỳ chọn (1, 2, hoặc 3): " choice

case $choice in
  1)
    echo "Đang cài đặt Whisky..."
    brew install --cask whisky
    ;;
  2)
    echo "Đang cài đặt Wine-Crossover..."
    brew tap gcenx/wine
    brew install --cask --no-quarantine wine-crossover
    ;;
  *)
    echo "Bỏ qua cài đặt engine."
    ;;
esac

# 3. Tạo thư mục wrapper & script chạy
echo ""
echo "[3/3] Tạo script chạy nhanh cho: ${appName}..."
RUNNER_PATH="$HOME/Desktop/Run_${sanitizedName}.command"

cat << 'EOF' > "$RUNNER_PATH"
#!/bin/bash
APP_NAME="${appName}"
EXE_NAME="${exeName}"
BOTTLE="$HOME/Library/Application Support/MacExeWrappers/$APP_NAME/bottle"
mkdir -p "$BOTTLE"
export WINEPREFIX="$BOTTLE"
export WINEMSYNC=1
export WINEESYNC=1
export WINEDEBUG="-all"

WINE="$(which wine64 2>/dev/null || echo "$HOME/Library/Application Support/com.isaacmarovitz.Whisky/Libraries/Wine/bin/wine64")"

if [ ! -x "$WINE" ]; then
  echo "Chưa tìm thấy wine64. Hãy mở Whisky hoặc kiểm tra PATH."
  read -p "Nhấn Enter để thoát..."
  exit 1
fi

echo "Khởi chạy $APP_NAME qua native translation layer..."
"$WINE" "$EXE_NAME" "$@"
EOF

chmod +x "$RUNNER_PATH"

echo ""
echo "=========================================================="
echo "    Hoàn tất cấu hình!                                    "
echo "    Tệp chạy nhanh đã tạo tại:                            "
echo "    $RUNNER_PATH                                          "
echo "    (Bạn chỉ cần double-click tệp này để chạy!)           "
echo "=========================================================="
`;
}

/**
 * Creates and downloads a complete macOS .app zip bundle using JSZip
 */
export async function createMacAppZip(
  options: AppBundleOptions,
  exeFileBlob?: Blob | null
): Promise<Blob> {
  const zip = new JSZip();
  const bundleFolderName = `${options.appName}.app`;

  // Directory structure:
  // App.app/Contents/Info.plist
  // App.app/Contents/MacOS/launcher
  // App.app/Contents/Resources/
  // App.app/Contents/Resources/<exeName> (if provided)
  // App.app/Contents/Resources/README.txt

  const infoPlist = generateInfoPlist(options);
  const launcherScript = generateLauncherScript(options);

  zip.file(`${bundleFolderName}/Contents/Info.plist`, infoPlist);
  zip.file(`${bundleFolderName}/Contents/MacOS/launcher`, launcherScript, {
    unixPermissions: '755',
  });

  const readme = `Ứng Dụng Native macOS: ${options.appName}
Tạo bởi MacExe Native Studio.
Chạy trực tiếp trên macOS (Apple Silicon M1/M2/M3/M4 & Intel) không cần máy ảo.

Hướng dẫn sử dụng:
1. Kéo tệp "${options.appName}.app" vào thư mục /Applications (Ứng dụng) của Mac.
2. Nếu gặp thông báo "App is damaged and can't be opened" do cơ chế Gatekeeper của macOS, mở Terminal và gõ:
   xattr -cr "/Applications/${options.appName}.app"
3. Double-click để khởi chạy!
`;
  zip.file(`${bundleFolderName}/Contents/Resources/README.txt`, readme);

  if (exeFileBlob) {
    zip.file(`${bundleFolderName}/Contents/Resources/${options.executableName}`, exeFileBlob);
  }

  // Also include the double-clickable setup-mac.command at root of ZIP for quick terminal access
  const setupCommand = generateSetupCommandScript(options.appName, options.executableName);
  zip.file(`setup-mac.command`, setupCommand, {
    unixPermissions: '755',
  });

  return await zip.generateAsync({
    type: 'blob',
    platform: 'UNIX',
  });
}

/**
 * Generates a 1-click double-clickable installer script for Whisky on macOS
 */
export function generateWhiskyAutoInstallerScript(): string {
  return `#!/bin/bash
# ==============================================================================
# 🚀 1-Click Whisky Auto Installer for macOS
# Tự động tải, giải nén và kích hoạt Whisky vào /Applications/Whisky.app
# Hoàn toàn tự động - Không cần gõ lệnh!
# ==============================================================================

clear
echo "=========================================================="
echo "    🥃 Tự Động Cài Đặt Whisky Vào Mac (1-Click)          "
echo "    Chạy file .exe trực tiếp không cần máy ảo            "
echo "=========================================================="
echo ""

ARCH="$(uname -m)"
echo "=> Kiến trúc CPU Mac: $ARCH"
if [ "$ARCH" = "arm64" ]; then
  echo "=> Apple Silicon (M1/M2/M3/M4): Tương thích 100% tối đa với D3DMetal & Metal 3"
else
  echo "=> Intel x86_64 Mac: Đang kích hoạt chế độ tương thích"
fi
echo ""

TMP_DIR="$(mktemp -d)"
ZIP_PATH="$TMP_DIR/Whisky.zip"

echo "[1/4] Đang tải bản Whisky mới nhất từ kho lưu trữ GitHub chính thức..."
curl -L -f --progress-bar "https://github.com/Whisky-App/Whisky/releases/latest/download/Whisky.zip" -o "$ZIP_PATH"

if [ ! -s "$ZIP_PATH" ]; then
  echo "⚠️ Đang thử máy chủ phụ..."
  curl -L -f --progress-bar "https://getwhisky.app/download" -o "$ZIP_PATH"
fi

echo ""
echo "[2/4] Đang giải nén Whisky.app vào thư mục Ứng Dụng (/Applications)..."
rm -rf "/Applications/Whisky.app" 2>/dev/null
unzip -q -o "$ZIP_PATH" -d "/Applications"

echo "[3/4] Gỡ bỏ thuộc tính cách ly Gatekeeper (xattr -cr)..."
xattr -cr "/Applications/Whisky.app" 2>/dev/null

rm -rf "$TMP_DIR"

echo ""
echo "=========================================================="
echo "    🎉 CÀI ĐẶT THÀNH CÔNG!                               "
echo "    Whisky.app đã nằm trong Launchpad & /Applications    "
echo "    Đang khởi động Whisky...                             "
echo "=========================================================="
echo ""

open -a "/Applications/Whisky.app" 2>/dev/null || open "/Applications/Whisky.app"

exit 0
`;
}

