import test from 'node:test';
import assert from 'node:assert/strict';
import { categorizeDll, evaluateCompatibility, parsePeBuffer } from './peParser';

test('categorizeDll classifies DirectX 12 properly', () => {
  const result = categorizeDll('D3D12.DLL');
  assert.equal(result.category, 'Graphics (DirectX/Metal)');
  assert.ok(result.description.includes('DirectX 12'));
});

test('categorizeDll classifies system DLLs', () => {
  const result = categorizeDll('KERNEL32.DLL');
  assert.equal(result.category, 'System');
  assert.ok(result.description.includes('Win32'));
});

test('evaluateCompatibility rates 64-bit GUI app with high score', () => {
  const evaluation = evaluateCompatibility(
    'x64',
    true,
    'Windows GUI',
    'GDI/Software',
    false,
    ['KERNEL32.DLL', 'USER32.DLL']
  );
  assert.ok(evaluation.score >= 85);
  assert.equal(evaluation.level, 'Hoàn Hảo (Gold)');
  assert.equal(evaluation.suggestedWinVersion, 'win10');
});

test('evaluateCompatibility handles DirectX 12 games', () => {
  const evaluation = evaluateCompatibility(
    'x64',
    true,
    'Windows GUI',
    'DirectX 12',
    false,
    ['KERNEL32.DLL', 'D3D12.DLL']
  );
  assert.equal(evaluation.recommendedEngine, 'Apple Game Porting Toolkit 2');
  assert.ok(evaluation.recommendedDllOverrides.includes('d3d12=native'));
});

test('parsePeBuffer recognizes synthetic minimal PE header', () => {
  // Create a minimal 256-byte buffer with MZ header and PE header
  const buffer = new ArrayBuffer(512);
  const view = new DataView(buffer);

  // 'MZ' at 0x00
  view.setUint16(0x00, 0x5a4d, true);
  // Pointer to PE at 0x3c -> 0x80
  view.setUint32(0x3c, 0x80, true);

  // 'PE\0\0' at 0x80
  view.setUint32(0x80, 0x00004550, true);
  // Machine = 0x8664 (AMD64)
  view.setUint16(0x84, 0x8664, true);
  // Number of sections = 2
  view.setUint16(0x86, 2, true);
  // Size of optional header = 240
  view.setUint16(0x94, 240, true);

  // Optional header magic = 0x020B (PE32+)
  view.setUint16(0x98, 0x020b, true);
  // Subsystem at offset 0x98 + 68 = 0xdc -> 2 (Windows GUI)
  view.setUint16(0xdc, 2, true);

  const result = parsePeBuffer(buffer, 'test_app.exe');
  assert.equal(result.isValidPe, true);
  assert.equal(result.architecture, 'x64');
  assert.equal(result.subsystem, 'Windows GUI');
  assert.equal(result.is64Bit, true);
});

import { generateInfoPlist, generateLauncherScript } from './scriptGenerator';

test('generateInfoPlist produces valid XML with bundle identifier', () => {
  const plist = generateInfoPlist({
    appName: 'NotepadPlusPlus',
    bundleIdentifier: 'com.custom.notepad',
    version: '8.5.0',
    executableName: 'notepad++.exe',
    enableMetalHud: true,
    enableDxvkHud: false,
    enableMsync: true,
    retinaMode: true,
    windowsVersion: 'win10',
    engine: 'Whisky',
    dllOverrides: [],
  });

  assert.ok(plist.includes('com.custom.notepad'));
  assert.ok(plist.includes('NotepadPlusPlus'));
  assert.ok(plist.includes('<key>NSHighResolutionCapable</key>'));
});

test('generateLauncherScript sets up wine and msync flags', () => {
  const script = generateLauncherScript({
    appName: 'NotepadPlusPlus',
    bundleIdentifier: 'com.custom.notepad',
    version: '8.5.0',
    executableName: 'notepad++.exe',
    enableMetalHud: true,
    enableDxvkHud: false,
    enableMsync: true,
    retinaMode: true,
    windowsVersion: 'win10',
    engine: 'Whisky',
    dllOverrides: ['d3d11=native', 'dxgi=native'],
  });

  assert.ok(script.includes('export WINEMSYNC=1'));
  assert.ok(script.includes('export MTL_HUD_ENABLED=1'));
  assert.ok(script.includes('d3d11=native;dxgi=native'));
});

import { generateWhiskyAutoInstallerScript } from './scriptGenerator';

test('generateWhiskyAutoInstallerScript creates valid auto-installer with curl and unzip', () => {
  const script = generateWhiskyAutoInstallerScript();
  assert.ok(script.includes('curl -L -f --progress-bar'));
  assert.ok(script.includes('Whisky.app'));
  assert.ok(script.includes('xattr -cr "/Applications/Whisky.app"'));
  assert.ok(script.includes('open -a "/Applications/Whisky.app"'));
});


