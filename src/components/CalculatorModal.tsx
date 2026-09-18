import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Calculator, Delete, Copy } from 'lucide-react';
import { playKeypadBeep } from '../utils/audio';

export const CalculatorModal: React.FC = () => {
  const { isCalculatorModalOpen, setIsCalculatorModalOpen, soundEnabled, showToast } = usePos();
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isCalculatorModalOpen) return null;

  const handlePress = (val: string) => {
    if (soundEnabled) playKeypadBeep();

    if (val === 'C') {
      setDisplay('0');
      setEquation('');
    } else if (val === 'DEL') {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay('0');
      }
    } else if (['+', '-', '*', '/'].includes(val)) {
      setEquation(`${display} ${val} `);
      setDisplay('0');
    } else if (val === '=') {
      try {
        const fullExpr = equation + display;
        // Safe evaluation
        const sanitized = fullExpr.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(result));
        setEquation('');
      } catch {
        setDisplay('오류');
      }
    } else {
      if (display === '0') {
        setDisplay(val);
      } else {
        setDisplay(display + val);
      }
    }
  };

  const handleQuickAdd = (amount: number) => {
    if (soundEnabled) playKeypadBeep();
    const current = Number(display) || 0;
    setDisplay(String(current + amount));
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(display);
    showToast(`계산 결과(${Number(display).toLocaleString()}원)가 복사되었습니다.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-sm overflow-hidden rounded-none flex flex-col">
        {/* Header */}
        <div className="bg-[#1f6ea9] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg flex items-center gap-2">
            <Calculator size={18} />
            포스 간이 계산기
          </span>
          <button
            onClick={() => setIsCalculatorModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-slate-100 flex flex-col gap-3">
          {/* Display screen */}
          <div className="bg-white border-2 border-slate-300 rounded p-3 text-right">
            <div className="text-xs text-slate-400 font-mono h-4">{equation}</div>
            <div className="text-2xl md:text-3xl font-mono font-black text-slate-900 truncate">
              {display}
            </div>
          </div>

          {/* Quick Cash Add buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => handleQuickAdd(1000)}
              className="py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded"
            >
              +1천
            </button>
            <button
              onClick={() => handleQuickAdd(5000)}
              className="py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded"
            >
              +5천
            </button>
            <button
              onClick={() => handleQuickAdd(10000)}
              className="py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded"
            >
              +1만
            </button>
            <button
              onClick={() => handleQuickAdd(50000)}
              className="py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded"
            >
              +5만
            </button>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => handlePress('C')} className="calc-btn text-rose-600 font-bold">C</button>
            <button onClick={() => handlePress('DEL')} className="calc-btn text-slate-600"><Delete size={16} /></button>
            <button onClick={() => handlePress('/')} className="calc-btn text-blue-700 font-bold">÷</button>
            <button onClick={() => handlePress('*')} className="calc-btn text-blue-700 font-bold">×</button>

            <button onClick={() => handlePress('7')} className="calc-btn">7</button>
            <button onClick={() => handlePress('8')} className="calc-btn">8</button>
            <button onClick={() => handlePress('9')} className="calc-btn">9</button>
            <button onClick={() => handlePress('-')} className="calc-btn text-blue-700 font-bold">−</button>

            <button onClick={() => handlePress('4')} className="calc-btn">4</button>
            <button onClick={() => handlePress('5')} className="calc-btn">5</button>
            <button onClick={() => handlePress('6')} className="calc-btn">6</button>
            <button onClick={() => handlePress('+')} className="calc-btn text-blue-700 font-bold">+</button>

            <button onClick={() => handlePress('1')} className="calc-btn">1</button>
            <button onClick={() => handlePress('2')} className="calc-btn">2</button>
            <button onClick={() => handlePress('3')} className="calc-btn">3</button>
            <button
              onClick={() => handlePress('=')}
              className="row-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded flex items-center justify-center shadow"
            >
              =
            </button>

            <button onClick={() => handlePress('0')} className="calc-btn col-span-2">0</button>
            <button onClick={() => handlePress('.')} className="calc-btn">.</button>
          </div>

          {/* Copy Result */}
          <button
            onClick={handleCopy}
            className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded flex items-center justify-center gap-1.5 shadow-sm mt-1"
          >
            <Copy size={13} />
            <span>결과값 복사하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
