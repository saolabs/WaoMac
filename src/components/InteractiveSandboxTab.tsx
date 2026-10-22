import React, { useState, useEffect } from 'react';
import {
  MonitorPlay,
  FileText,
  Calculator as CalcIcon,
  Gamepad2,
  Activity,
  Terminal as TermIcon,
  Maximize2,
  RotateCcw,
  Sparkles,
  Save,
  Search,
  Check,
  X,
  Volume2,
  Cpu,
} from 'lucide-react';

interface InteractiveSandboxTabProps {
  lang: 'vi' | 'en';
  defaultApp?: string;
}

type SandboxApp = 'notepad' | 'calc' | 'minesweeper' | 'taskmgr' | 'winecmd';

export const InteractiveSandboxTab: React.FC<InteractiveSandboxTabProps> = ({ lang, defaultApp }) => {
  const [currentApp, setCurrentApp] = useState<SandboxApp>('notepad');

  // --- NOTEPAD STATE ---
  const [notepadText, setNotepadText] = useState<string>(
    `# ================================================================\n# Chào mừng đến với MacExe Native Studio!\n# ================================================================\n\nBạn đang trải nghiệm giao diện tệp Windows .EXE chạy trực tiếp\ntrên macOS mà KHÔNG CẦN bất kỳ máy ảo nào (No Virtual Machine)!\n\nLợi ích vượt trội:\n1. Tốc độ tức thì: Khởi động trong 1 giây.\n2. Bộ nhớ nhẹ tênh: Chỉ tốn vài chục MB RAM thay vì 8GB.\n3. Tiết kiệm pin tối đa cho MacBook M1, M2, M3, M4.\n4. Đồ hoạ mượt mà: Dịch thẳng sang Apple Metal 3.\n\nThử chỉnh sửa văn bản này hoặc chuyển qua Máy Tính (Calc.exe),\nDò Mìn (Winmine.exe) hay Trình Giám Sát Tiến Trình Wine!`
  );
  const [notepadFindOpen, setNotepadFindOpen] = useState(false);
  const [notepadSearchTerm, setNotepadSearchTerm] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  // --- CALCULATOR STATE ---
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcResetOnNext, setCalcResetOnNext] = useState(false);
  const [calcHistory, setCalcHistory] = useState<string[]>([]);
  const [calcMemory, setCalcMemory] = useState<number>(0);

  const handleCalcNum = (num: string) => {
    if (calcResetOnNext) {
      setCalcDisplay(num);
      setCalcResetOnNext(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  };

  const handleCalcOp = (op: string) => {
    const currentVal = parseFloat(calcDisplay);
    if (calcPrev !== null && calcOp) {
      const res = executeCalcOp(calcPrev, currentVal, calcOp);
      setCalcPrev(res);
      setCalcDisplay(String(res));
      setCalcHistory((prev) => [`${calcPrev} ${calcOp} ${currentVal} = ${res}`, ...prev.slice(0, 5)]);
    } else {
      setCalcPrev(currentVal);
    }
    setCalcOp(op);
    setCalcResetOnNext(true);
  };

  const executeCalcOp = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? Math.round((a / b) * 100000) / 100000 : 0;
      default:
        return b;
    }
  };

  const handleCalcEqual = () => {
    if (calcPrev !== null && calcOp) {
      const currentVal = parseFloat(calcDisplay);
      const res = executeCalcOp(calcPrev, currentVal, calcOp);
      setCalcHistory((prev) => [`${calcPrev} ${calcOp} ${currentVal} = ${res}`, ...prev.slice(0, 5)]);
      setCalcDisplay(String(res));
      setCalcPrev(null);
      setCalcOp(null);
      setCalcResetOnNext(true);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
    setCalcResetOnNext(false);
  };

  // --- MINESWEEPER STATE ---
  const BOARD_SIZE = 9;
  const MINES_COUNT = 10;
  interface Cell {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    adjacentMines: number;
  }
  const [mineGrid, setMineGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [minesLeft, setMinesLeft] = useState(MINES_COUNT);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const initMinesweeper = () => {
    const grid: Cell[][] = Array(BOARD_SIZE)
      .fill(null)
      .map(() =>
        Array(BOARD_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
          }))
      );

    // Place mines randomly
    let placed = 0;
    while (placed < MINES_COUNT) {
      const r = Math.floor(Math.random() * BOARD_SIZE);
      const c = Math.floor(Math.random() * BOARD_SIZE);
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate adjacent counts
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          grid[r][c].adjacentMines = count;
        }
      }
    }

    setMineGrid(grid);
    setGameStatus('playing');
    setMinesLeft(MINES_COUNT);
    setTimerSeconds(0);
  };

  useEffect(() => {
    initMinesweeper();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;
    const cell = mineGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    const newGrid = mineGrid.map((row) => row.map((item) => ({ ...item })));

    if (cell.isMine) {
      // Game over, reveal all mines
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          if (newGrid[i][j].isMine) newGrid[i][j].isRevealed = true;
        }
      }
      setMineGrid(newGrid);
      setGameStatus('lost');
      return;
    }

    // Flood fill reveal
    const reveal = (row: number, col: number) => {
      if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
      if (newGrid[row][col].isRevealed || newGrid[row][col].isFlagged || newGrid[row][col].isMine) return;

      newGrid[row][col].isRevealed = true;
      if (newGrid[row][col].adjacentMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) reveal(row + dr, col + dc);
          }
        }
      }
    };

    reveal(r, c);

    // Check win condition
    let unrevealedSafe = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!newGrid[i][j].isMine && !newGrid[i][j].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    setMineGrid(newGrid);
    if (unrevealedSafe === 0) {
      setGameStatus('won');
    }
  };

  const handleCellRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    const cell = mineGrid[r][c];
    if (cell.isRevealed) return;

    const newGrid = mineGrid.map((row) => row.map((item) => ({ ...item })));
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    setMineGrid(newGrid);
    setMinesLeft((m) => (newGrid[r][c].isFlagged ? m - 1 : m + 1));
  };

  // --- TERMINAL CMD STATE ---
  const [cmdInput, setCmdInput] = useState('');
  const [cmdLogs, setCmdLogs] = useState<string[]>([
    'Microsoft Windows [Version 10.0.19045.3803] (Wine 9.12 WoW64)',
    '(c) Microsoft Corporation. All rights reserved.',
    'Apple Silicon Rosetta 2 translation layer active: Darwin Mach-O arm64',
    'Wineprefix mounted at: Z:\\Users\\macuser\\Library\\Application Support\\MacExeWrappers',
    'Type "help", "dir", "ver", "wine --version", or "systeminfo" to test.',
    '',
  ]);

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const input = cmdInput.trim();
    const newLogs = [...cmdLogs, `Z:\\> ${input}`];

    const lower = input.toLowerCase();
    if (lower === 'cls' || lower === 'clear') {
      setCmdLogs([]);
      setCmdInput('');
      return;
    } else if (lower === 'help') {
      newLogs.push(
        'Supported sandbox commands:',
        '  DIR          - List files in current simulated directory',
        '  VER          - Show Windows & Wine emulation version',
        '  WINE --VERSION - Show active Wine translation engine',
        '  SYSTEMINFO   - Show CPU architecture, RAM, and Metal translation info',
        '  CLS          - Clear screen',
        '  RUN <app>    - Launch notepad, calc, or winmine'
      );
    } else if (lower === 'dir') {
      newLogs.push(
        ' Volume in drive Z is macOS Root',
        ' Volume Serial Number is 4F12-88C3',
        '',
        ' Directory of Z:\\Program Files\\MacExe',
        '',
        '21/10/2026  10:00 PM    <DIR>          .',
        '21/10/2026  10:00 PM    <DIR>          ..',
        '21/10/2026  10:00 PM         5,033,164 notepad++.exe',
        '21/10/2026  10:00 PM         1,642,496 7zFM.exe',
        '21/10/2026  10:00 PM        29,784,120 terminal64.exe (MT5)',
        '21/10/2026  10:00 PM           245,760 winmine.exe',
        '               4 File(s)     36,705,540 bytes',
        '               2 Dir(s)   420,192,841,728 bytes free'
      );
    } else if (lower === 'ver') {
      newLogs.push('Microsoft Windows [Version 10.0.19045.3803] running on Wine 9.12-crossover');
    } else if (lower.includes('wine --version') || lower === 'wine') {
      newLogs.push('wine-9.12 (CrossOver 24.0.0 / Apple Silicon D3DMetal 2.0)');
    } else if (lower === 'systeminfo') {
      newLogs.push(
        'Host OS: macOS Sequoia 15.1 (Darwin 24.1.0)',
        'Processor: Apple M3 Pro (12 Cores: 6 Performance, 6 Efficiency)',
        'Translation: Apple Silicon Rosetta 2 (AVX2 supported)',
        'Graphics: Apple Metal 3 (Metal Performance HUD ready)',
        'Wine RAM Allocated: 48.6 MB (No Hypervisor VM footprint)'
      );
    } else if (lower.startsWith('run notepad')) {
      setCurrentApp('notepad');
      newLogs.push('Starting Notepad.exe...');
    } else if (lower.startsWith('run calc')) {
      setCurrentApp('calc');
      newLogs.push('Starting Calc.exe...');
    } else if (lower.startsWith('run winmine')) {
      setCurrentApp('minesweeper');
      newLogs.push('Starting Winmine.exe...');
    } else {
      newLogs.push(`'${input}' is recognized in simulated Wine shell. Command executed with code 0.`);
    }

    newLogs.push('');
    setCmdLogs(newLogs);
    setCmdInput('');
  };

  const handleSaveNotepad = () => {
    const blob = new Blob([notepadText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'macexe_document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector for Simulated Windows Apps */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {lang === 'vi' ? 'Chọn ứng dụng chạy thử:' : 'Simulated Win32 App:'}
          </span>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrentApp('notepad')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentApp === 'notepad'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Notepad.exe</span>
            </button>

            <button
              onClick={() => setCurrentApp('calc')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentApp === 'calc'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalcIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>Calc.exe</span>
            </button>

            <button
              onClick={() => setCurrentApp('minesweeper')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentApp === 'minesweeper'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Winmine.exe</span>
            </button>

            <button
              onClick={() => setCurrentApp('taskmgr')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentApp === 'taskmgr'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>Wine Process Monitor</span>
            </button>

            <button
              onClick={() => setCurrentApp('winecmd')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentApp === 'winecmd'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TermIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>wine cmd.exe</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Wine 9.12 WoW64 • Metal 3 Pipeline Active</span>
        </div>
      </div>

      {/* The macOS Window Frame wrapping the Windows Executable */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-200">
        {/* macOS Title Bar with Traffic Light buttons and App title */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-amber-400 hover:opacity-80 transition cursor-pointer" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition cursor-pointer" />
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-mono">
              [Wine 64-bit Translation Mode]
            </span>
          </div>

          <div className="font-semibold text-xs text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
            <span>
              {currentApp === 'notepad'
                ? 'Untitled - Notepad (Win32 on macOS)'
                : currentApp === 'calc'
                ? 'Calculator (Calc.exe)'
                : currentApp === 'minesweeper'
                ? 'Minesweeper (Winmine.exe)'
                : currentApp === 'taskmgr'
                ? 'Wine Task Manager & Metal Telemetry'
                : 'Wine Command Prompt (cmd.exe)'}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
              FPS: 120 (Metal 3)
            </span>
          </div>
        </div>

        {/* 1. NOTEPAD VIEW */}
        {currentApp === 'notepad' && (
          <div className="flex flex-col h-[460px]">
            {/* Windows Menu Bar */}
            <div className="bg-slate-50 dark:bg-slate-850 px-3 py-1 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 select-none">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSaveNotepad}
                  className="hover:text-indigo-600 transition flex items-center space-x-1 font-medium cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>{lang === 'vi' ? 'Tệp (File / Lưu)' : 'File (Save)'}</span>
                </button>
                <button
                  onClick={() => setNotepadFindOpen(!notepadFindOpen)}
                  className="hover:text-indigo-600 transition flex items-center space-x-1 font-medium cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>{lang === 'vi' ? 'Tìm kiếm' : 'Find'}</span>
                </button>
                <button
                  onClick={() => setNotepadText('')}
                  className="hover:text-rose-500 transition font-medium cursor-pointer"
                >
                  {lang === 'vi' ? 'Xoá nội dung' : 'Clear'}
                </button>
              </div>

              {savedToast && (
                <span className="text-emerald-600 font-semibold text-[11px] flex items-center space-x-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'vi' ? 'Đã lưu tệp xuống Mac!' : 'Saved to Mac!'}</span>
                </span>
              )}
            </div>

            {/* Find Search bar if toggled */}
            {notepadFindOpen && (
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800 flex items-center space-x-2 text-xs">
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Nhập từ khoá tìm trong văn bản...' : 'Search term...'}
                  value={notepadSearchTerm}
                  onChange={(e) => setNotepadSearchTerm(e.target.value)}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 text-xs w-64 focus:outline-none"
                />
                <button
                  onClick={() => setNotepadFindOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Text Area */}
            <textarea
              value={notepadText}
              onChange={(e) => setNotepadText(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />

            {/* Windows Status Bar */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
              <div>
                <span>Ln 1, Col {notepadText.length}</span>
                <span className="mx-2">•</span>
                <span>{notepadText.length} ký tự</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>100% Zoom</span>
                <span>Windows (CRLF)</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">UTF-8</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. CALCULATOR VIEW */}
        {currentApp === 'calc' && (
          <div className="p-6 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[460px]">
            <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl">
              {/* Display */}
              <div className="text-right p-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-400 min-h-[16px] truncate">
                  {calcPrev !== null && calcOp ? `${calcPrev} ${calcOp}` : ''}
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white truncate">
                  {calcDisplay}
                </div>
              </div>

              {/* Memory Bar */}
              <div className="grid grid-cols-5 gap-1 mb-3 text-[10px] font-semibold text-slate-500">
                <button
                  onClick={() => setCalcMemory(0)}
                  className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  MC
                </button>
                <button
                  onClick={() => setCalcDisplay(String(calcMemory))}
                  className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  MR
                </button>
                <button
                  onClick={() => setCalcMemory((m) => m + parseFloat(calcDisplay))}
                  className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  M+
                </button>
                <button
                  onClick={() => setCalcMemory((m) => m - parseFloat(calcDisplay))}
                  className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  M-
                </button>
                <button
                  onClick={() => setCalcMemory(parseFloat(calcDisplay))}
                  className="py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  MS
                </button>
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
                <button
                  onClick={handleCalcClear}
                  className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:opacity-80 transition cursor-pointer"
                >
                  C
                </button>
                <button
                  onClick={() => setCalcDisplay(String(-parseFloat(calcDisplay)))}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  ±
                </button>
                <button
                  onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  %
                </button>
                <button
                  onClick={() => handleCalcOp('÷')}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  ÷
                </button>

                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('×')}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  ×
                </button>

                {['4', '5', '6'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('-')}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  -
                </button>

                {['1', '2', '3'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('+')}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  +
                </button>

                <button
                  onClick={() => handleCalcNum('0')}
                  className="col-span-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    if (!calcDisplay.includes('.')) handleCalcNum('.');
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition cursor-pointer"
                >
                  .
                </button>
                <button
                  onClick={handleCalcEqual}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer"
                >
                  =
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MINESWEEPER VIEW */}
        {currentApp === 'minesweeper' && (
          <div className="p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[460px]">
            <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-2xl border-4 border-slate-300 dark:border-slate-700 shadow-xl">
              {/* Retro HUD */}
              <div className="bg-slate-300 dark:bg-slate-900 p-3 rounded-xl mb-4 border-2 border-slate-400 dark:border-slate-700 flex items-center justify-between">
                {/* Mine count */}
                <div className="bg-black text-rose-500 font-mono text-xl font-bold px-2 py-0.5 rounded tracking-widest border border-slate-800">
                  {String(Math.max(0, minesLeft)).padStart(3, '0')}
                </div>

                {/* Face button */}
                <button
                  onClick={initMinesweeper}
                  className="text-2xl p-1 bg-slate-200 dark:bg-slate-700 rounded-lg hover:scale-105 transition active:scale-95 cursor-pointer shadow"
                >
                  {gameStatus === 'won' ? '😎' : gameStatus === 'lost' ? '😵' : '🙂'}
                </button>

                {/* Timer */}
                <div className="bg-black text-rose-500 font-mono text-xl font-bold px-2 py-0.5 rounded tracking-widest border border-slate-800">
                  {String(Math.min(999, timerSeconds)).padStart(3, '0')}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-9 gap-1 bg-slate-300 dark:bg-slate-900 p-2 rounded-xl border border-slate-400 dark:border-slate-700">
                {mineGrid.map((row, r) =>
                  row.map((cell, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleCellRightClick(e, r, c)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-bold transition select-none font-mono ${
                        cell.isRevealed
                          ? cell.isMine
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-inner'
                          : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 border border-slate-400 dark:border-slate-600 shadow-xs active:bg-slate-400'
                      }`}
                    >
                      {cell.isRevealed ? (
                        cell.isMine ? (
                          '💣'
                        ) : cell.adjacentMines > 0 ? (
                          <span
                            className={
                              cell.adjacentMines === 1
                                ? 'text-blue-600'
                                : cell.adjacentMines === 2
                                ? 'text-emerald-600'
                                : cell.adjacentMines === 3
                                ? 'text-rose-600'
                                : 'text-purple-600'
                            }
                          >
                            {cell.adjacentMines}
                          </span>
                        ) : (
                          ''
                        )
                      ) : cell.isFlagged ? (
                        '🚩'
                      ) : (
                        ''
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
                💡 {lang === 'vi' ? 'Chuột trái mở ô • Chuột phải cắm cờ' : 'Left click to reveal • Right click to flag'}
              </div>
            </div>
          </div>
        )}

        {/* 4. TASK MANAGER / PROCESS MONITOR VIEW */}
        {currentApp === 'taskmgr' && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-[460px] space-y-6">
            {/* Real-time Hardware Telemetry Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Apple Metal GPU Render</span>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  1,480 DrawCalls/s
                </div>
                <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">D3DMetal v2 Active</div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">RAM Tiêu Thụ (Wine)</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  48.2 MB
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Tiết kiệm 99% so với VM</div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Rosetta 2 CPU Load</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  1.8% (12 Cores)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">MSync Mach Semaphores</div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-xs text-slate-400 font-medium">Tốc Độ Khung Hình</span>
                <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  120 FPS ProMotion
                </div>
                <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">Metal V-Sync Locked</div>
              </div>
            </div>

            {/* Simulated Process Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-100 dark:bg-slate-700/60 font-semibold text-xs text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Tiến trình Win32 đang được dịch sang macOS Darwin</span>
                <span>4 Processes Running</span>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-sans border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-4">Tên Image (.exe)</th>
                    <th className="py-2.5 px-4">PID</th>
                    <th className="py-2.5 px-4">Kiến Trúc</th>
                    <th className="py-2.5 px-4">RAM</th>
                    <th className="py-2.5 px-4">Cơ Chế Translation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">notepad++.exe</td>
                    <td className="py-2.5 px-4">0024</td>
                    <td className="py-2.5 px-4">x86_64</td>
                    <td className="py-2.5 px-4">24.5 MB</td>
                    <td className="py-2.5 px-4 font-sans text-emerald-600">Rosetta 2 + Wine User32</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">wineserver</td>
                    <td className="py-2.5 px-4">0012</td>
                    <td className="py-2.5 px-4">Mach-O arm64</td>
                    <td className="py-2.5 px-4">12.1 MB</td>
                    <td className="py-2.5 px-4 font-sans text-indigo-600">IPC Socket Server Native</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">services.exe</td>
                    <td className="py-2.5 px-4">0016</td>
                    <td className="py-2.5 px-4">Win32 Service</td>
                    <td className="py-2.5 px-4">6.4 MB</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Service Control Manager</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">explorer.exe</td>
                    <td className="py-2.5 px-4">0020</td>
                    <td className="py-2.5 px-4">Win32 Shell</td>
                    <td className="py-2.5 px-4">5.2 MB</td>
                    <td className="py-2.5 px-4 font-sans text-slate-500">Wine Desktop & Tray</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. WINE CMD TERMINAL VIEW */}
        {currentApp === 'winecmd' && (
          <div className="bg-black text-emerald-400 font-mono text-xs p-4 min-h-[460px] flex flex-col justify-between">
            <div className="overflow-y-auto max-h-[380px] space-y-1 scrollbar-none">
              {cmdLogs.map((log, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleCmdSubmit} className="flex items-center space-x-2 pt-2 border-t border-emerald-950">
              <span className="text-emerald-500 font-bold">Z:\&gt;</span>
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="type a command (e.g. dir, ver, systeminfo, run calc)..."
                className="flex-1 bg-transparent text-emerald-300 focus:outline-none text-xs font-mono"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
