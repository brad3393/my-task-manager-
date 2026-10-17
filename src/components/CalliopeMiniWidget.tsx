import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { Play, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

// 5x5 patterns
const PATTERNS: Record<string, number[][]> = {
  check: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  smile: [
    [0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  heart: [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  dots: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ]
};

// Convert number (0-99) or digits into 5x5 dot pattern
function getDigitPattern(num: number): number[][] {
  const digits: Record<number, number[][]> = {
    0: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    1: [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
    2: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
    ],
    3: [
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    4: [
      [1, 0, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    5: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    6: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    7: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    8: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
    9: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
      [1, 1, 1],
    ]
  };

  const d = Math.min(Math.max(num, 0), 9);
  const pattern = digits[d] || digits[0];
  const grid = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      grid[r][c + 1] = pattern[r][c];
    }
  }
  return grid;
}

export const CalliopeMiniWidget: React.FC<Props> = ({ tasks, onToggleTask }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displayMode, setDisplayMode] = useState<'pending' | 'pattern'>('pending');

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const activeTask = pendingTasks[selectedIndex] || tasks[selectedIndex] || null;

  const playBuzzer = (freq: number = 587, duration: number = 0.12) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio context restricted or unavailable
    }
  };

  const handleNext = () => {
    if (pendingTasks.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % pendingTasks.length);
      playBuzzer(659, 0.08);
    }
  };

  const handlePrev = () => {
    if (pendingTasks.length > 0) {
      setSelectedIndex((prev) => (prev - 1 + pendingTasks.length) % pendingTasks.length);
      playBuzzer(440, 0.08);
    }
  };

  const handleCompleteCurrent = () => {
    if (activeTask) {
      onToggleTask(activeTask.id);
      playBuzzer(880, 0.2);
      setDisplayMode('pattern');
      setTimeout(() => {
        setDisplayMode('pending');
      }, 1500);
    }
  };

  // Compute 5x5 LED matrix
  let matrix: number[][] = PATTERNS.smile;
  if (displayMode === 'pattern') {
    matrix = PATTERNS.check;
  } else if (pendingTasks.length === 0) {
    matrix = PATTERNS.smile;
  } else {
    matrix = getDigitPattern(pendingTasks.length);
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Calliope Mini Hardware Simulator Visual */}
      <div className="flex flex-col items-center">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Calliope Mini Companion Mode
        </div>

        {/* Board Body */}
        <div className="relative w-64 h-64 bg-emerald-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center justify-between border-4 border-emerald-950">
          {/* Top Logo / Pins */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-emerald-300">
            <span>CALLIOPE</span>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Status RGB LED" />
            <span>MINI v2</span>
          </div>

          {/* 5x5 LED Matrix */}
          <div className="bg-black/90 p-3 rounded-xl border border-emerald-700/50 shadow-inner grid grid-cols-5 gap-2">
            {matrix.map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    val === 1
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] scale-105'
                      : 'bg-stone-800/80 border border-stone-700/40'
                  }`}
                />
              ))
            )}
          </div>

          {/* Buttons A & B */}
          <div className="w-full flex justify-between items-center px-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-slate-200 hover:bg-white text-slate-900 font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center cursor-pointer border-2 border-slate-400"
              title="Button A: Previous Task"
            >
              A
            </button>
            <span className="text-[10px] text-emerald-200 font-mono">5x5 LED MATRIX</span>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-slate-200 hover:bg-white text-slate-900 font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center cursor-pointer border-2 border-slate-400"
              title="Button B: Next Task"
            >
              B
            </button>
          </div>
        </div>
      </div>

      {/* Controller / Active Task View */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white">Microcontroller Sync</h3>
            <p className="text-xs text-slate-400">
              Direct emulation of Calliope Mini task feedback display.
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Toggle buzzer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            {soundEnabled ? 'Buzzer On' : 'Muted'}
          </button>
        </div>

        {activeTask ? (
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Task #{selectedIndex + 1} of {pendingTasks.length} pending</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                activeTask.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                activeTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {activeTask.priority}
              </span>
            </div>
            <h4 className="font-medium text-base text-white">{activeTask.title}</h4>
            {activeTask.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{activeTask.description}</p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleCompleteCurrent}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete (Simulate Pin 0)
              </button>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer"
                >
                  Prev (A)
                </button>
                <button
                  onClick={handleNext}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer"
                >
                  Next (B)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
            <p className="text-emerald-400 font-medium">All tasks completed! 🎉</p>
            <p className="text-xs text-slate-400 mt-1">
              The 5x5 LED matrix is currently displaying a celebratory smiley face.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-800">
            <div className="text-slate-400">Total</div>
            <div className="text-lg font-bold text-white">{tasks.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-800">
            <div className="text-amber-400">Pending</div>
            <div className="text-lg font-bold text-amber-300">{pendingTasks.length}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-800">
            <div className="text-emerald-400">Done</div>
            <div className="text-lg font-bold text-emerald-300">{tasks.length - pendingTasks.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
