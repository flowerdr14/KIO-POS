import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Barcode, Scan, Search, Plus, ExternalLink, Printer } from 'lucide-react';
import { playScanBeep, playPrintSound } from '../utils/audio';

export const BarcodeModal: React.FC = () => {
  const {
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    menuItems,
    addToCart,
    soundEnabled,
    showToast,
  } = usePos();

  const [scannedInput, setScannedInput] = useState('');
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState(menuItems[0] || null);

  if (!isBarcodeModalOpen) return null;

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedInput.trim()) return;

    if (soundEnabled) playScanBeep();

    const matched = menuItems.find(
      (m) => m.barcode === scannedInput.trim() || m.code.toLowerCase() === scannedInput.toLowerCase()
    );

    if (matched) {
      setSelectedBarcodeItem(matched);
      addToCart(matched);
      showToast(`'${matched.name}' 바코드 인식 성공! 장바구니에 추가되었습니다.`);
      setScannedInput('');
    } else {
      showToast('일치하는 상품 바코드를 찾을 수 없습니다.');
    }
  };

  const handlePrintLabel = (item = selectedBarcodeItem) => {
    if (!item) return;
    if (soundEnabled) playPrintSound();
    showToast(`'${item.name}' 바코드 라벨 스티커 인쇄 신호가 전송되었습니다.`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-3xl overflow-hidden rounded-none flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-[#1a5b91] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl flex items-center gap-2">
            <Barcode size={22} />
            상품 바코드 관리 및 스캔
          </span>
          <button
            onClick={() => setIsBarcodeModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        {/* Scanner Simulation Bar */}
        <form onSubmit={handleSimulateScan} className="bg-blue-50 p-4 border-b border-blue-200 flex items-center gap-3">
          <Scan size={24} className="text-blue-700 shrink-0 animate-pulse" />
          <div className="flex-1">
            <input
              type="text"
              placeholder="바코드 번호를 입력하거나 스캐너로 리딩하세요 (엔터 시 즉시 담기)"
              value={scannedInput}
              onChange={(e) => setScannedInput(e.target.value)}
              className="w-full bg-white border-2 border-blue-400 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-[#1a5b91] hover:bg-[#154a77] text-white text-sm font-bold px-5 py-2 rounded shadow"
          >
            스캔 확인
          </button>
        </form>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Product Barcode List (col-span-7) */}
          <div className="md:col-span-7 border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-slate-700">등록 상품 바코드 목록</span>
              <a
                href="https://wepplication.github.io/tools/barcodeGen/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>온라인 바코드 생성기</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBarcodeItem(item)}
                  className={`p-3 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                    selectedBarcodeItem?.id === item.id
                      ? 'bg-blue-50 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      코드: {item.code} | ₩{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-blue-900 block">
                      {item.barcode}
                    </span>
                    <span className="text-[10px] text-slate-400">클릭하여 라벨 확인</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Barcode Preview Card (col-span-5) */}
          <div className="md:col-span-5 p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
            {selectedBarcodeItem ? (
              <div className="bg-white p-6 rounded shadow border-2 border-slate-300 w-full max-w-xs flex flex-col items-center">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  STAROBUX POS LABEL
                </div>
                <div className="font-black text-slate-900 text-base mb-1">
                  {selectedBarcodeItem.name}
                </div>
                <div className="font-mono font-bold text-blue-900 text-lg mb-4">
                  ₩ {selectedBarcodeItem.price.toLocaleString()}
                </div>

                {/* Pure CSS Barcode Simulation Stripes */}
                <div className="h-16 w-full flex items-center justify-center gap-[3px] bg-white px-2 py-1 border border-slate-200">
                  {selectedBarcodeItem.barcode
                    .split('')
                    .map((char, i) => {
                      const num = parseInt(char, 10) || 1;
                      const width = (num % 3) + 1.5;
                      return (
                        <div
                          key={i}
                          className="h-full bg-black"
                          style={{ width: `${width}px` }}
                        />
                      );
                    })}
                </div>
                <div className="font-mono tracking-widest text-xs font-bold text-slate-700 mt-1">
                  {selectedBarcodeItem.barcode}
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-5">
                  <button
                    onClick={() => {
                      addToCart(selectedBarcodeItem);
                      showToast(`'${selectedBarcodeItem.name}' 주문에 추가 완료`);
                    }}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded flex items-center justify-center gap-1 shadow"
                  >
                    <Plus size={14} />
                    <span>주문 추가</span>
                  </button>
                  <button
                    onClick={() => handlePrintLabel(selectedBarcodeItem)}
                    className="py-2 bg-slate-800 hover:bg-black text-white font-bold text-xs rounded flex items-center justify-center gap-1 shadow"
                  >
                    <Printer size={14} />
                    <span>라벨 인쇄</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs">선택된 상품이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white p-3 border-t flex justify-end">
          <button
            onClick={() => setIsBarcodeModalOpen(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-black text-white font-bold text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
