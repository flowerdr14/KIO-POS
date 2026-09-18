import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Clock, CheckCircle2, Printer } from 'lucide-react';
import { playPrintSound } from '../utils/audio';

export const ShiftModal: React.FC = () => {
  const {
    isShiftModalOpen,
    setIsShiftModalOpen,
    shift,
    startShift,
    closeShift,
    orders,
    soundEnabled,
    showToast,
  } = usePos();

  const [openingCashInput, setOpeningCashInput] = useState('200000');

  if (!isShiftModalOpen) return null;

  // Calculate shift stats from today's orders
  const todayOrders = orders.filter((o) => o.status !== '취소됨');
  const totalSales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cardSales = todayOrders
    .filter((o) => o.paymentMethod === '신용카드')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cashSales = todayOrders
    .filter((o) => o.paymentMethod === '현금' || o.paymentMethod === '단순현금')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const otherSales = totalSales - cardSales - cashSales;

  const expectedCashInDrawer = (shift.startCash || 0) + cashSales;

  const handleOpenShift = () => {
    const num = Number(openingCashInput) || 0;
    startShift(num);
  };

  const handleCloseShift = () => {
    if (soundEnabled) playPrintSound();
    closeShift();
    showToast('일일 영업 마감 및 정산서 출력이 완료되었습니다.');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-[#2b71b8] shadow-2xl w-full max-w-xl overflow-hidden rounded-none flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#195a8f] text-white px-4 py-2 flex items-center justify-between border-b-2 border-[#2b71b8]">
          <span className="font-bold text-lg md:text-xl flex items-center gap-2">
            <Clock size={20} />
            영업시작 / 영업종료 일일정산
          </span>
          <button
            onClick={() => setIsShiftModalOpen(false)}
            className="hover:bg-rose-600 w-6 h-6 flex items-center justify-center rounded font-bold text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 bg-slate-50 flex flex-col gap-4 text-xs">
          {/* Shift Status Banner */}
          <div
            className={`p-3 border rounded flex items-center justify-between ${
              shift.isOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className={shift.isOpen ? 'text-emerald-600' : 'text-amber-600'} />
              <div>
                <div className="font-black text-sm">
                  {shift.isOpen ? '현재 영업 진행 중 (OPEN)' : '영업 마감 상태 (CLOSED)'}
                </div>
                <div className="text-[11px] opacity-80">
                  {shift.isOpen
                    ? `개점 시각: ${shift.openedAt || '금일 09:00'} (담당자: 스타로벅스 매니저)`
                    : '영업 시작 버튼을 눌러 새 근무 교대를 시작하세요.'}
                </div>
              </div>
            </div>
          </div>

          {/* If Shift is Closed: Opening Fund Input */}
          {!shift.isOpen ? (
            <div className="bg-white p-4 border rounded space-y-3">
              <h4 className="font-bold text-sm text-slate-800">영업 시작 준비금(시재금) 입력</h4>
              <p className="text-slate-500 text-xs">
                금전등록기(돈통)에 채워넣은 개점 잔돈 준비금을 확인하고 입력해주세요.
              </p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">시재금 (원)</label>
                <input
                  type="number"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full border-2 border-blue-400 rounded p-2 text-base font-mono font-bold"
                />
              </div>
              <div className="flex gap-2">
                {[100000, 200000, 300000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningCashInput(String(amt))}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-800 font-bold rounded border text-xs"
                  >
                    {amt.toLocaleString()}원
                  </button>
                ))}
              </div>
              <button
                onClick={handleOpenShift}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded shadow mt-2"
              >
                영업 시작 (돈통 개방)
              </button>
            </div>
          ) : (
            /* If Shift is Open: Day Sales Settlement Report */
            <div className="bg-white p-4 border rounded space-y-3">
              <h4 className="font-bold text-sm text-slate-800 border-b pb-2 flex justify-between items-center">
                <span>금일 매출 집계표</span>
                <span className="text-slate-400 font-normal font-mono text-xs">
                  {new Date().toLocaleDateString('ko-KR')}
                </span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">개점 준비금 (시재)</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₩ {shift.startCash.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">신용카드 매출</span>
                  <span className="font-mono font-bold text-blue-700">
                    ₩ {cardSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">현금 매출</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₩ {cashSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">기타 / 복합 매출</span>
                  <span className="font-mono font-bold text-amber-700">
                    ₩ {otherSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-200 text-sm font-black text-slate-900">
                  <span>총 결제 매출액 ({todayOrders.length}건)</span>
                  <span className="font-mono text-base text-[#1b5c9c]">
                    ₩ {totalSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-blue-50 px-2 rounded font-bold text-blue-900">
                  <span>돈통 현금 잔액 (준비금 + 현금매출)</span>
                  <span className="font-mono text-sm">
                    ₩ {expectedCashInDrawer.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCloseShift}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded shadow flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  <span>일일 마감 정산 및 영수증 인쇄 (영업종료)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-3 border-t flex justify-end">
          <button
            onClick={() => setIsShiftModalOpen(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-black text-white font-bold text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
